"""XP, levels, achievements, analytics events, leaderboard."""
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.game import (UserGameProfile, ScenarioRun, Achievement,
                             UserAchievement, AnalyticsEvent)

LEVEL_STEP = 500


def level_from_xp(xp: int) -> int:
    return max(1, xp // LEVEL_STEP + 1)


def xp_for_run(run: ScenarioRun) -> int:
    base = 100
    base += max(0, run.score) // 10
    if run.loyalty >= 80 and run.safety >= 80:
        base += 50
    return base


def get_or_create_profile(db: Session, user_id: UUID) -> UserGameProfile:
    p = db.get(UserGameProfile, user_id)
    if not p:
        p = UserGameProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def record_event(db: Session, user_id: UUID, event_type: str, payload: dict, run_id: UUID | None = None):
    db.add(AnalyticsEvent(user_id=user_id, run_id=run_id, event_type=event_type, payload=payload))
    db.commit()


def finalize_run(db: Session, run: ScenarioRun) -> dict:
    profile = get_or_create_profile(db, run.user_id)
    gained = xp_for_run(run)
    prev = profile.completed_scenarios or 0
    new = prev + 1
    profile.loyalty_avg = int(((profile.loyalty_avg or 0) * prev + run.loyalty) / new)
    profile.safety_avg = int(((profile.safety_avg or 0) * prev + run.safety) / new)
    profile.completed_scenarios = new
    profile.best_score = max(profile.best_score or 0, run.score)
    profile.xp = (profile.xp or 0) + gained
    profile.level = level_from_xp(profile.xp)
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    awarded = _check_achievements(db, profile)
    record_event(db, run.user_id, "scenario_finished",
                 {"run_id": str(run.id), "xp": gained, "level": profile.level}, run.id)
    return {"xp_gained": gained, "total_xp": profile.xp, "level": profile.level, "achievements": awarded}


def _check_achievements(db: Session, profile: UserGameProfile) -> list[str]:
    all_ach = db.query(Achievement).all()
    owned = {ua.achievement_code for ua in
             db.query(UserAchievement).filter(UserAchievement.user_id == profile.user_id).all()}
    awarded = []
    for ach in all_ach:
        if ach.code in owned:
            continue
        if _matches(profile, ach.condition or {}):
            db.add(UserAchievement(user_id=profile.user_id, achievement_code=ach.code))
            awarded.append(ach.code)
    if awarded:
        db.commit()
    return awarded


def _matches(profile: UserGameProfile, cond: dict) -> bool:
    t, v = cond.get("type"), cond.get("value", 0)
    if t == "runs_count":
        return (profile.completed_scenarios or 0) >= v
    if t == "level":
        return (profile.level or 1) >= v
    if t == "best_score":
        return (profile.best_score or 0) >= v
    return False


def leaderboard(db: Session, limit: int = 50) -> list[dict]:
    rows = db.query(UserGameProfile).order_by(desc(UserGameProfile.xp)).limit(limit).all()
    return [{"user_id": str(r.user_id), "xp": r.xp, "level": r.level,
             "completed": r.completed_scenarios, "best_score": r.best_score} for r in rows]
