from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.user import User
from app.models.game import (
    Scenario, ScenarioNode, ScenarioStatus, ScenarioRun,
)
from app.schemas.game import (ChooseRequest, ScenarioOut, RunOut, ReportOut, ProfileOut)
from app.services.scenario_engine import (start_run, apply_choice, load_node,
                                          serialize_node, build_report)
from app.services.gamification_service import (get_or_create_profile, finalize_run,
                                               record_event, leaderboard)
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/game", tags=["game"])


@router.get("/scenarios")
def list_scenarios(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list[ScenarioOut]:
    rows = db.query(Scenario).filter(Scenario.status == ScenarioStatus.active).all()
    result = []
    for s in rows:
        start = (
            db.query(ScenarioNode)
            .filter(
                ScenarioNode.scenario_id == s.id,
                ScenarioNode.node_key == s.start_node_key,
            )
            .first()
        )
        result.append(
            ScenarioOut(
                slug=s.slug,
                title=s.title,
                description=s.description,
                category=s.category,
                difficulty=s.difficulty,
                xp_reward=s.xp_reward,
                start_node_key=s.start_node_key,
                service_class=s.service_class,
                passenger_type=s.passenger_type,
                stage=s.stage,
                regulatory_ref=s.regulatory_ref,
                timer_seconds=start.timer_seconds if start else None,
            )
        )
    return result


@router.post("/scenarios/{slug}/start")
def start(slug: str, db: Session = Depends(get_db),
          user: User = Depends(get_current_user)) -> RunOut:
    scenario = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    run = start_run(db, user.id, scenario)
    record_event(db, user.id, "scenario_started", {"scenario": slug}, run.id)
    node = load_node(db, run.scenario_id, run.current_node_key)
    return RunOut(run_id=str(run.id), status=run.status.value, loyalty=run.loyalty,
                  safety=run.safety, score=run.score, node=serialize_node(db, node))


@router.get("/runs/{run_id}")
def get_run(run_id: UUID, db: Session = Depends(get_db),
            user: User = Depends(get_current_user)) -> RunOut:
    run = db.get(ScenarioRun, run_id)
    if not run or run.user_id != user.id:
        raise HTTPException(status_code=404, detail="Run not found")
    node = load_node(db, run.scenario_id, run.current_node_key) if run.current_node_key else None
    return RunOut(run_id=str(run.id), status=run.status.value, loyalty=run.loyalty,
                  safety=run.safety, score=run.score,
                  node=serialize_node(db, node) if node else None)


@router.post("/runs/{run_id}/choose")
def choose(run_id: UUID, payload: ChooseRequest, db: Session = Depends(get_db),
           user: User = Depends(get_current_user)) -> RunOut:
    run = db.get(ScenarioRun, run_id)
    if not run or run.user_id != user.id:
        raise HTTPException(status_code=404, detail="Run not found")
    run = apply_choice(db, run, payload.choice_id, payload.time_spent)
    record_event(db, user.id, "choice_made",
                 {"run_id": str(run.id), "choice_id": str(payload.choice_id),
                  "time_spent": payload.time_spent, "loyalty": run.loyalty, "safety": run.safety},
                 run.id)
    node = load_node(db, run.scenario_id, run.current_node_key) if run.current_node_key else None
    return RunOut(run_id=str(run.id), status=run.status.value, loyalty=run.loyalty,
                  safety=run.safety, score=run.score,
                  node=serialize_node(db, node) if node else None)


@router.get("/runs/{run_id}/report")
def report(run_id: UUID, db: Session = Depends(get_db),
           user: User = Depends(get_current_user)) -> ReportOut:
    run = db.get(ScenarioRun, run_id)
    if not run or run.user_id != user.id:
        raise HTTPException(status_code=404, detail="Run not found")
    base = build_report(db, run)
    fin = finalize_run(db, run) if run.status.value == "finished" else {"xp_gained": 0, "level": 1, "achievements": []}
    return ReportOut(**base, xp_gained=fin["xp_gained"], level=fin["level"], achievements=fin["achievements"])


@router.get("/me", response_model=ProfileOut)
def my_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> ProfileOut:
    p = get_or_create_profile(db, user.id)
    return ProfileOut(user_id=str(p.user_id), xp=p.xp, level=p.level,
                      completed_scenarios=p.completed_scenarios, best_score=p.best_score,
                      loyalty_avg=p.loyalty_avg, safety_avg=p.safety_avg)


@router.get("/leaderboard")
def lb(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return leaderboard(db)
