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
