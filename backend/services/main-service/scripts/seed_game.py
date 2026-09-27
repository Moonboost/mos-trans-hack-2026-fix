"""Seed scenarios + achievements. Idempotent by slug/code."""
import json
import os
import sys
from pathlib import Path
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.database import SessionLocal
from app.models.game import Scenario, ScenarioNode, NodeChoice, Achievement, ScenarioStatus


DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data" / "scenarios"


def seed_achievements(db: Session):
    items = [
        {"code": "first_run", "title": "Первый рейс", "description": "Пройден первый сценарий",
         "condition": {"type": "runs_count", "value": 1}},
        {"code": "five_runs", "title": "Опытный проводник", "description": "5 сценариев позади",
         "condition": {"type": "runs_count", "value": 5}},
        {"code": "level_3", "title": "Уровень 3", "description": "Достигнут третий уровень",
         "condition": {"type": "level", "value": 3}},
        {"code": "perfect", "title": "Безупречно", "description": "Счёт ≥ 90", "condition": {"type": "best_score", "value": 90}},
    ]
    for it in items:
        if not db.query(Achievement).filter_by(code=it["code"]).first():
            db.add(Achievement(**it))
    db.commit()


def seed_scenario(db: Session, payload: dict):
    existing = db.query(Scenario).filter_by(slug=payload["slug"]).first()
    if existing:
        print(f"skip {payload['slug']}")
        return
    s = Scenario(
        slug=payload["slug"], title=payload["title"], description=payload.get("description"),
        category=payload["category"], difficulty=payload.get("difficulty", "medium"),
        xp_reward=payload.get("xp_reward", 100), start_node_key=payload["start_node_key"],
        status=ScenarioStatus.active,
    )
    db.add(s)
    db.flush()
    for node in payload["nodes"]:
        n = ScenarioNode(
            scenario_id=s.id, node_key=node["key"], node_type=node.get("type", "choice"),
            text=node["text"], timer_seconds=node.get("timer_seconds"),
            is_terminal=node.get("is_terminal", False), meta=node.get("meta", {}),
        )
        db.add(n)
        db.flush()
        for idx, ch in enumerate(node.get("choices", [])):
            db.add(NodeChoice(
                node_id=n.id, label=ch["label"], next_node_key=ch.get("next_node_key"),
                loyalty_delta=ch.get("loyalty_delta", 0), safety_delta=ch.get("safety_delta", 0),
                score_delta=ch.get("score_delta", 0), competence=ch.get("competence"),
                feedback=ch.get("feedback"), order_index=ch.get("order_index", idx),
            ))
    db.commit()
    print(f"seeded {payload['slug']}")


def main():
    db = SessionLocal()
    try:
        seed_achievements(db)
        for path in sorted(DATA_DIR.glob("*.json")):
            with open(path, "r", encoding="utf-8") as f:
                seed_scenario(db, json.load(f))
    finally:
        db.close()


if __name__ == "__main__":
    main()
"""Seed VSM scenarios + achievements (grounded in STO RZD 03.011/03.013/03.014)."""
import json
import sys
from pathlib import Path
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.database import SessionLocal
from app.models.game import (Scenario, ScenarioNode, NodeChoice, Achievement,
                             ScenarioStatus)

DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data" / "scenarios"


ACHIEVEMENTS = [
    # by count
    {"code": "first_run", "title": "Первый рейс", "description": "Пройден первый сценарий",
     "condition": {"type": "runs_count", "value": 1}, "competence": None, "min_value": 1},
    {"code": "five_runs", "title": "Опытный проводник", "description": "5 сценариев позади",
     "condition": {"type": "runs_count", "value": 5}, "competence": None, "min_value": 5},
    {"code": "ten_runs", "title": "Мастер сервиса", "description": "10 сценариев позади",
     "condition": {"type": "runs_count", "value": 10}, "competence": None, "min_value": 10},
    # by level / score
    {"code": "level_3", "title": "Уровень 3", "description": "Достигнут третий уровень",
     "condition": {"type": "level", "value": 3}, "competence": None, "min_value": 3},
    {"code": "perfect", "title": "Безупречно", "description": "Счёт ≥ 90",
     "condition": {"type": "best_score", "value": 90}, "competence": None, "min_value": 90},
    # by role model
    {"code": "role_model_master", "title": "Мастер ролевой модели", "description": "Полный цикл ПРИЗНАТЬ-ПРАВИЛО-РЕШЕНИЕ-ЗАВЕРИТЬ",
     "condition": {"type": "role_model_complete", "value": 5}, "competence": "role_model_communication", "min_value": 5},
    # by competence category
    {"code": "medical_pro", "title": "Медицинский отклик", "description": "5 медицинских сценариев без ошибок",
     "condition": {"type": "competence_runs", "competence": "medical_response", "value": 5}, "competence": "medical_response", "min_value": 5},
    {"code": "conflict_pro", "title": "Миротворец", "description": "5 конфликтных сценариев без ошибок",
     "condition": {"type": "competence_runs", "competence": "conflict_deescalation", "value": 5}, "competence": "conflict_deescalation", "min_value": 5},
    {"code": "class_connoisseur", "title": "Знаток классов", "description": "Пройдены сценарии во всех 4 классах",
     "condition": {"type": "all_service_classes", "value": 4}, "competence": "service_class_knowledge", "min_value": 4},
    {"code": "accessibility_ally", "title": "Доступная среда", "description": "3 сценария с маломобильными пассажирами",
     "condition": {"type": "passenger_type_runs", "passenger_type": "limited_mobility_wheelchair", "value": 3}, "competence": "limited_mobility", "min_value": 3},
]


# Model columns on Achievement. Keys outside this set in the seed data
# (competence, min_value) are documentation duplicates of what already
# lives inside `condition` and must not reach the ORM constructor.
ACHIEVEMENT_MODEL_FIELDS = {"code", "title", "description", "icon", "condition"}

def seed_achievements(db: Session):
    for item in ACHIEVEMENTS:
        if db.query(Achievement).filter_by(code=item["code"]).first():
            continue
        payload = {k: v for k, v in item.items() if k in ACHIEVEMENT_MODEL_FIELDS}
        db.add(Achievement(**payload))
    db.commit()


def seed_scenario(db: Session, payload: dict):
    existing = db.query(Scenario).filter_by(slug=payload["slug"]).first()
    if existing:
        print(f"skip {payload['slug']}")
        return
    s = Scenario(
        slug=payload["slug"], title=payload["title"], description=payload.get("description"),
        category=payload["category"],
        service_class=payload.get("service_class", "any"),
        passenger_type=payload.get("passenger_type", "regular"),
        stage=payload.get("stage", "in_flight"),
        regulatory_ref=payload.get("regulatory_ref"),
        difficulty=payload.get("difficulty", "medium"),
        xp_reward=payload.get("xp_reward", 100),
        start_node_key=payload["start_node_key"],
        status=ScenarioStatus.active,
    )
    db.add(s)
    db.flush()
    for node in payload["nodes"]:
        n = ScenarioNode(
            scenario_id=s.id, node_key=node["key"], node_type=node.get("type", "choice"),
            text=node["text"], timer_seconds=node.get("timer_seconds"),
            is_terminal=node.get("is_terminal", False), meta=node.get("meta", {}),
        )
        db.add(n)
        db.flush()
        for idx, ch in enumerate(node.get("choices", [])):
            db.add(NodeChoice(
                node_id=n.id, label=ch["label"], next_node_key=ch.get("next_node_key"),
                loyalty_delta=ch.get("loyalty_delta", 0), safety_delta=ch.get("safety_delta", 0),
                score_delta=ch.get("score_delta", 0), competence=ch.get("competence"),
                role_step=ch.get("role_step"), requires_escalation=ch.get("requires_escalation"),
                feedback=ch.get("feedback"), order_index=ch.get("order_index", idx),
            ))
    db.commit()
    print(f"seeded {payload['slug']}")


def main():
    db = SessionLocal()
    try:
        seed_achievements(db)
        for path in sorted(DATA_DIR.glob("*.json")):
            with open(path, "r", encoding="utf-8") as f:
                seed_scenario(db, json.load(f))
    finally:
        db.close()


if __name__ == "__main__":
    main()
