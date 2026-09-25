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
"""Non-linear scenario engine with VSM-specific rules.

LLM context:
- SLA per service_class (STO 03.011 p.10.5): overrun bleeds loyalty.
- Role model: admit -> state_rule -> offer_solution -> reassure.
  Skipping 'admit' or 'offer_solution' costs loyalty.
- Escalation: if choice.requires_escalation is set, player must call
  the target within ESCALATION_WINDOW_SECONDS. Otherwise hard fail.
"""
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.game import (Scenario, ScenarioNode, NodeChoice, ScenarioRun,
                             RunStatus, ServiceClass, RoleStep, SLA_SECONDS)

ESCALATION_WINDOW_SECONDS = 30
ROLE_ORDER = [RoleStep.admit, RoleStep.state_rule,
              RoleStep.offer_solution, RoleStep.reassure]


def _clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def _sla_for(scenario):
    try:
        return SLA_SECONDS[ServiceClass(scenario.service_class)]
    except (KeyError, ValueError):
        return SLA_SECONDS[ServiceClass.standard]


def load_node(db, scenario_id, node_key):
    node = (db.query(ScenarioNode)
            .filter(ScenarioNode.scenario_id == scenario_id,
                    ScenarioNode.node_key == node_key)
            .first())
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_key}' not found")
    return node


def serialize_node(db, node):
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
        "choices": [{
            "id": str(c.id),
            "label": c.label,
            "next_node_key": c.next_node_key,
            "role_step": c.role_step,
        } for c in choices],
    }


def start_run(db, user_id, scenario):
    for p in (db.query(ScenarioRun)
              .filter(ScenarioRun.user_id == user_id,
                      ScenarioRun.scenario_id == scenario.id,
                      ScenarioRun.status == RunStatus.in_progress).all()):
        p.status = RunStatus.abandoned
    run = ScenarioRun(
        user_id=user_id,
        scenario_id=scenario.id,
        current_node_key=scenario.start_node_key,
        loyalty=50, safety=50, score=0, choices_log=[],
        service_class=scenario.service_class or "standard",
        role_steps_seen=[],
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def apply_choice(db, run, choice_id, time_spent=0):
    if run.status != RunStatus.in_progress:
        raise HTTPException(status_code=400, detail="Run is not active")

    scenario = db.get(Scenario, run.scenario_id)
    node = load_node(db, run.scenario_id, run.current_node_key)
    choice = (db.query(NodeChoice)
              .filter(NodeChoice.id == choice_id, NodeChoice.node_id == node.id)
              .first())
    if not choice:
        raise HTTPException(status_code=404, detail="Choice not found for current node")

    # --- role-model progression ---
    role_steps = list(run.role_steps_seen or [])
    role_penalty = 0
    if choice.role_step and choice.role_step not in role_steps:
        role_steps.append(choice.role_step)
    # skipped 'admit' before state_rule -> penalty
    if choice.role_step == RoleStep.state_rule.value and RoleStep.admit.value not in role_steps:
        role_penalty += 10
    # any solution without offering -> penalty
    if choice.role_step == RoleStep.reassure.value and RoleStep.offer_solution.value not in role_steps:
        role_penalty += 15

    # --- timer / SLA ---
    overtime = 0
    if node.timer_seconds and time_spent > node.timer_seconds:
        overtime = time_spent - node.timer_seconds
        run.safety = _clamp(run.safety - min(20, overtime // 2))
        run.score -= overtime
    # SLA per class
    sla = _sla_for(scenario)
    if time_spent > sla:
        run.loyalty = _clamp(run.loyalty - 10)

    # --- deltas ---
    run.loyalty = _clamp(run.loyalty + (choice.loyalty_delta or 0) - role_penalty)
    run.safety = _clamp(run.safety + (choice.safety_delta or 0))
    run.score += (choice.score_delta or 0) - role_penalty
    run.role_steps_seen = role_steps

    # --- escalation logic ---
    if choice.requires_escalation:
        # player must confirm escalation within window; we treat the choice itself as confirmation
        run.escalation_done = True
        run.escalation_deadline_at = None
    else:
        # check if we are past a previous deadline
        if run.escalation_deadline_at and datetime.utcnow() > run.escalation_deadline_at and not run.escalation_done:
            run.safety = _clamp(run.safety - 30)
            run.score -= 25
            run.status = RunStatus.failed
            db.commit()
            db.refresh(run)
            return run

    # --- log ---
    log = list(run.choices_log or [])
    log.append({
        "node_key": node.node_key,
        "choice_id": str(choice.id),
        "role_step": choice.role_step,
        "time_spent": time_spent,
        "overtime": overtime,
        "role_penalty": role_penalty,
        "loyalty": run.loyalty,
        "safety": run.safety,
        "competence": choice.competence,
        "at": datetime.utcnow().isoformat(),
    })
    run.choices_log = log

    # --- move ---
    if choice.next_node_key:
        nxt = load_node(db, run.scenario_id, choice.next_node_key)
        run.current_node_key = nxt.node_key
        if nxt.meta and nxt.meta.get("requires_escalation") and not run.escalation_done:
            run.escalation_deadline_at = datetime.utcnow() + timedelta(seconds=ESCALATION_WINDOW_SECONDS)
        if nxt.is_terminal:
            run.status = RunStatus.finished
            run.finished_at = datetime.utcnow()
    else:
        run.status = RunStatus.finished
        run.finished_at = datetime.utcnow()

    db.commit()
    db.refresh(run)
    return run


def build_report(db, run):
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
        "role_steps_seen": run.role_steps_seen or [],
        "role_model_complete": all(
            s in (run.role_steps_seen or []) for s in
            [RoleStep.admit.value, RoleStep.state_rule.value,
             RoleStep.offer_solution.value, RoleStep.reassure.value]
        ),
        "steps": run.choices_log or [],
        "scenario": {
            "slug": scenario.slug,
            "title": scenario.title,
            "service_class": scenario.service_class,
            "passenger_type": scenario.passenger_type,
            "regulatory_ref": scenario.regulatory_ref,
        } if scenario else None,
    }


def _verdict(run):
    if run.status == RunStatus.failed:
        return "Провал: не выполнена обязательная эскалация"
    if run.safety < 40:
        return "Критично: нарушены протоколы безопасности"
    if run.loyalty < 40:
        return "Пассажир не удовлетворён — риск негативного отзыва"
    if run.score >= 80 and run.loyalty >= 70 and run.safety >= 70:
        return "Отлично: ролевая модель соблюдена, безопасность в норме"
    return "Средний результат — есть зоны роста"
