"""Non-linear scenario engine.

LLM context: state machine over (scenario, node_key). Timer overrun bleeds safety & score.
"""
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.game import Scenario, ScenarioNode, NodeChoice, ScenarioRun, RunStatus


def _clamp(v: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, v))


def load_node(db: Session, scenario_id: UUID, node_key: str) -> ScenarioNode:
    node = (db.query(ScenarioNode)
            .filter(ScenarioNode.scenario_id == scenario_id,
                    ScenarioNode.node_key == node_key)
            .first())
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_key}' not found")
    return node


def serialize_node(db: Session, node: ScenarioNode) -> dict:
    choices = (db.query(NodeChoice)
               .filter(NodeChoice.node_id == node.id)
               .order_by(NodeChoice.order_index)
               .all())
    return {
        "key": node.node_key,
        "type": node.node_type,
        "text": node.text,
        "media_url": node.media_url,
        "timer_seconds": node.timer_seconds,
        "is_terminal": bool(node.is_terminal),
        "meta": node.meta or {},
        "choices": [{"id": str(c.id), "label": c.label, "next_node_key": c.next_node_key} for c in choices],
    }


def start_run(db: Session, user_id: UUID, scenario: Scenario) -> ScenarioRun:
    previous = (db.query(ScenarioRun)
                .filter(ScenarioRun.user_id == user_id,
                        ScenarioRun.scenario_id == scenario.id,
                        ScenarioRun.status == RunStatus.in_progress)
                .all())
    for p in previous:
        p.status = RunStatus.abandoned
    run = ScenarioRun(
        user_id=user_id,
        scenario_id=scenario.id,
        current_node_key=scenario.start_node_key,
        loyalty=50, safety=50, score=0, choices_log=[],
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def apply_choice(db: Session, run: ScenarioRun, choice_id: UUID, time_spent: int = 0) -> ScenarioRun:
    if run.status != RunStatus.in_progress:
        raise HTTPException(status_code=400, detail="Run is not active")
    node = load_node(db, run.scenario_id, run.current_node_key)
    choice = (db.query(NodeChoice)
              .filter(NodeChoice.id == choice_id, NodeChoice.node_id == node.id)
              .first())
    if not choice:
        raise HTTPException(status_code=404, detail="Choice not found for current node")

    overtime = 0
    if node.timer_seconds and time_spent > node.timer_seconds:
        overtime = time_spent - node.timer_seconds
        run.safety = _clamp(run.safety - min(20, overtime // 2))
        run.score -= overtime

    run.loyalty = _clamp(run.loyalty + (choice.loyalty_delta or 0))
    run.safety = _clamp(run.safety + (choice.safety_delta or 0))
    run.score += (choice.score_delta or 0)

    log = list(run.choices_log or [])
    log.append({
        "node_key": node.node_key,
        "choice_id": str(choice.id),
        "time_spent": time_spent,
        "overtime": overtime,
        "loyalty": run.loyalty,
        "safety": run.safety,
        "competence": choice.competence,
        "at": datetime.utcnow().isoformat(),
    })
    run.choices_log = log

    if choice.next_node_key:
        nxt = load_node(db, run.scenario_id, choice.next_node_key)
        run.current_node_key = nxt.node_key
        if nxt.is_terminal:
            run.status = RunStatus.finished
            run.finished_at = datetime.utcnow()
    else:
        run.status = RunStatus.finished
        run.finished_at = datetime.utcnow()

    db.commit()
    db.refresh(run)
    return run


def build_report(db: Session, run: ScenarioRun) -> dict:
    scenario = db.get(Scenario, run.scenario_id)
    total = int((run.finished_at - run.started_at).total_seconds()) if run.finished_at else 0
    return {
        "run_id": str(run.id),
        "status": run.status.value if run.status else "in_progress",
        "loyalty": run.loyalty,
        "safety": run.safety,
        "score": run.score,
        "total_time_seconds": total,
        "verdict": _verdict(run),
        "steps": run.choices_log or [],
        "scenario": {"slug": scenario.slug, "title": scenario.title} if scenario else None,
    }


def _verdict(run: ScenarioRun) -> str:
    if run.safety < 40:
        return "Критично: нарушены протоколы безопасности"
    if run.loyalty < 40:
        return "Пассажир не удовлетворён — риск негативного отзыва"
    if run.score >= 80 and run.loyalty >= 70 and run.safety >= 70:
        return "Отличная работа: пассажир лоялен, безопасность соблюдена"
    return "Средний результат — есть зоны роста"
