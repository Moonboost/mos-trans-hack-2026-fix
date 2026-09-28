"""Admin API for VSM conductor trainer (patched: optional fields)."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.shared.auth import get_current_user, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.game import (
    Scenario, ScenarioStatus, ScenarioRun, RunStatus,
)
from database.database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role not in (UserRole.admin, UserRole.root):
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user


class DashboardStats(BaseModel):
    total_users: int
    total_scenarios: int
    active_scenarios: int
    total_runs: int
    finished_runs: int
    runs_this_month: int
    avg_loyalty: float
    avg_safety: float
    runs_by_category: dict[str, int]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None
    user_role: UserRole
    verified: bool
    blocked: bool
    created_at: Optional[datetime] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = None
    surname: Optional[str] = None
    role: UserRole = UserRole.user
    verified: bool = False
    blocked: bool = False

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        if not any(ch.isdigit() for ch in v):
            raise ValueError("Password must contain at least one digit")
        if not any(ch.isupper() for ch in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    role: Optional[UserRole] = None
    verified: Optional[bool] = None
    blocked: Optional[bool] = None


class ScenarioOutAdmin(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    description: Optional[str] = None
    category: str
    service_class: Optional[str] = "any"
    passenger_type: Optional[str] = "regular"
    regulatory_ref: Optional[str] = None
    difficulty: str
    xp_reward: int
    start_node_key: str
    status: ScenarioStatus


class ScenarioCreate(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    category: str = "conflict"
    service_class: str = "any"
    passenger_type: str = "regular"
    stage: str = "in_flight"
    regulatory_ref: Optional[str] = None
    difficulty: str = "medium"
    xp_reward: int = 100
    start_node_key: str = "start"


class ScenarioUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    xp_reward: Optional[int] = None
    regulatory_ref: Optional[str] = None
    status: Optional[ScenarioStatus] = None


class CompetenceStat(BaseModel):
    competence: str
    attempts: int
    overtime: int
    avg_loyalty: float
    avg_safety: float


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    avg = (
        db.query(func.avg(ScenarioRun.loyalty), func.avg(ScenarioRun.safety))
        .filter(ScenarioRun.status == RunStatus.finished)
        .first()
    )
    by_cat = (
        db.query(Scenario.category, func.count(ScenarioRun.id))
        .join(Scenario, ScenarioRun.scenario_id == Scenario.id)
        .group_by(Scenario.category)
        .all()
    )
    return DashboardStats(
        total_users=db.query(User).count(),
        total_scenarios=db.query(Scenario).count(),
        active_scenarios=db.query(Scenario).filter(Scenario.status == ScenarioStatus.active).count(),
        total_runs=db.query(ScenarioRun).count(),
        finished_runs=db.query(ScenarioRun).filter(ScenarioRun.status == RunStatus.finished).count(),
        runs_this_month=db.query(ScenarioRun).filter(ScenarioRun.started_at >= month_start).count(),
        avg_loyalty=round(float(avg[0] or 0), 1),
        avg_safety=round(float(avg[1] or 0), 1),
        runs_by_category={cat or "unknown": cnt for cat, cnt in by_cat},
    )


@router.get("/users", response_model=List[UserOut])
def list_users(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    query = db.query(User)
    if current_user.user_role == UserRole.admin:
        query = query.filter(User.user_role != UserRole.admin)
    return query.order_by(User.created_at).offset(skip).limit(limit).all()


@router.post("/users", response_model=UserOut)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    if data.role == UserRole.admin and current_user.user_role != UserRole.root:
        raise HTTPException(403, "Only root can create admin users")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(422, "Email already registered")
    user = User(
        email=data.email,
        password=hash_password(data.password),
        name=data.name,
        surname=data.surname,
        user_role=data.role,
        user_status=UserStatus.verificated if data.verified else UserStatus.pending_verification,
        verified=data.verified,
        blocked=data.blocked,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if current_user.user_role == UserRole.admin and user.user_role == UserRole.admin:
        raise HTTPException(403, "Admins cannot modify other admins")
    if data.role == UserRole.admin and current_user.user_role != UserRole.root:
        raise HTTPException(403, "Only root can set admin role")
    if user.user_role == UserRole.admin and data.role is not None and current_user.user_role != UserRole.root:
        raise HTTPException(403, "Only root can change admin role")
    if user.id == current_user.id and data.role is not None and data.role != UserRole.root:
        raise HTTPException(403, "Root cannot demote themselves")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if current_user.user_role == UserRole.admin and user.user_role == UserRole.admin:
        raise HTTPException(403, "Admins cannot delete other admins")
    if user.id == current_user.id:
        raise HTTPException(403, "Root cannot delete themselves")
    db.delete(user)
    db.commit()
    return {"status": "ok"}


@router.get("/scenarios", response_model=List[ScenarioOutAdmin])
def list_scenarios(
    status: Optional[ScenarioStatus] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = db.query(Scenario)
    if status:
        query = query.filter(Scenario.status == status)
    return query.order_by(Scenario.slug).all()


@router.get("/scenarios/{slug}", response_model=ScenarioOutAdmin)
def get_scenario(slug: str, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    sc = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not sc:
        raise HTTPException(404, "Scenario not found")
    return sc


@router.post("/scenarios", response_model=ScenarioOutAdmin)
def create_scenario(
    data: ScenarioCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if db.query(Scenario).filter(Scenario.slug == data.slug).first():
        raise HTTPException(422, "Slug already exists")
    sc = Scenario(**data.model_dump(), status=ScenarioStatus.draft)
    db.add(sc)
    db.commit()
    db.refresh(sc)
    return sc


@router.patch("/scenarios/{slug}", response_model=ScenarioOutAdmin)
def update_scenario(
    slug: str,
    data: ScenarioUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    sc = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not sc:
        raise HTTPException(404, "Scenario not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sc, key, value)
    db.commit()
    db.refresh(sc)
    return sc


@router.post("/scenarios/{slug}/publish", response_model=ScenarioOutAdmin)
def publish_scenario(slug: str, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    sc = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not sc:
        raise HTTPException(404, "Scenario not found")
    if sc.status == ScenarioStatus.active:
        raise HTTPException(400, "Scenario already active")
    sc.status = ScenarioStatus.active
    db.commit()
    db.refresh(sc)
    return sc


@router.post("/scenarios/{slug}/archive", response_model=ScenarioOutAdmin)
def archive_scenario(slug: str, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    sc = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not sc:
        raise HTTPException(404, "Scenario not found")
    sc.status = ScenarioStatus.archived
    db.commit()
    db.refresh(sc)
    return sc


@router.get("/runs")
def list_runs(
    skip: int = 0, limit: int = 50,
    status: Optional[RunStatus] = None,
    scenario: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = db.query(ScenarioRun, Scenario.slug).join(Scenario, ScenarioRun.scenario_id == Scenario.id)
    if status:
        query = query.filter(ScenarioRun.status == status)
    if scenario:
        query = query.filter(Scenario.slug == scenario)
    rows = query.order_by(desc(ScenarioRun.started_at)).offset(skip).limit(limit).all()
    return [
        {
            "run_id": str(run.id),
            "user_id": str(run.user_id),
            "scenario_slug": slug,
            "status": run.status.value,
            "loyalty": run.loyalty,
            "safety": run.safety,
            "score": run.score,
            "steps": len(run.choices_log or []),
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "finished_at": run.finished_at.isoformat() if run.finished_at else None,
        }
        for run, slug in rows
    ]


@router.get("/runs/{run_id}")
def get_run(run_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    run = db.get(ScenarioRun, run_id)
    if not run:
        raise HTTPException(404, "Run not found")
    sc = db.get(Scenario, run.scenario_id)
    return {
        "run_id": str(run.id),
        "user_id": str(run.user_id),
        "scenario_slug": sc.slug if sc else None,
        "status": run.status.value,
        "loyalty": run.loyalty,
        "safety": run.safety,
        "score": run.score,
        "choices_log": run.choices_log or [],
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "finished_at": run.finished_at.isoformat() if run.finished_at else None,
    }


@router.get("/analytics/competences", response_model=List[CompetenceStat])
def competence_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    runs = db.query(ScenarioRun).filter(ScenarioRun.status == RunStatus.finished).all()
    agg: dict[str, dict] = {}
    for run in runs:
        for step in run.choices_log or []:
            comp = step.get("competence") or "unknown"
            a = agg.setdefault(comp, {"attempts": 0, "overtime": 0, "loyalty": 0, "safety": 0})
            a["attempts"] += 1
            a["overtime"] += 1 if step.get("overtime") else 0
            a["loyalty"] += step.get("loyalty", 0)
            a["safety"] += step.get("safety", 0)
    result = [
        CompetenceStat(
            competence=comp,
            attempts=v["attempts"],
            overtime=v["overtime"],
            avg_loyalty=round(v["loyalty"] / v["attempts"], 1) if v["attempts"] else 0,
            avg_safety=round(v["safety"] / v["attempts"], 1) if v["attempts"] else 0,
        )
        for comp, v in agg.items()
    ]
    return sorted(result, key=lambda r: r.avg_safety)


@router.delete("/scenarios/{slug}")
def delete_scenario(slug: str, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    sc = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not sc:
        raise HTTPException(404, "Scenario not found")
    if sc.status == ScenarioStatus.active:
        raise HTTPException(400, "Cannot delete active scenario. Archive it first.")
    db.delete(sc)
    db.commit()
    return {"status": "ok"}
