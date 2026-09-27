"""Game domain models for VSM gamified learning.

LLM context: All score scales are 0-100, XP is cumulative, runs are append-only logs.
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class ScenarioStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    archived = "archived"


class RunStatus(str, enum.Enum):
    in_progress = "in_progress"
    finished = "finished"
    abandoned = "abandoned"


class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)  # conflict | medical | service
    difficulty = Column(String, default="medium")
    xp_reward = Column(Integer, default=100)
    start_node_key = Column(String, nullable=False)
    service_class = Column(String, default="any")
    passenger_type = Column(String, default="regular")
    stage = Column(String, default="in_flight")
    regulatory_ref = Column(String, nullable=True)
    status = Column(Enum(ScenarioStatus, name="scenario_status"), default=ScenarioStatus.active)
    media_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ScenarioNode(Base):
    __tablename__ = "scenario_nodes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenarios.id", ondelete="CASCADE"), index=True)
    node_key = Column(String, nullable=False)
    node_type = Column(String, default="choice")  # intro | choice | outcome | end
    text = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)
    timer_seconds = Column(Integer, nullable=True)
    is_terminal = Column(Boolean, default=False)
    meta = Column(JSON, default=dict)


class NodeChoice(Base):
    __tablename__ = "node_choices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_id = Column(UUID(as_uuid=True), ForeignKey("scenario_nodes.id", ondelete="CASCADE"), index=True)
    label = Column(String, nullable=False)
    next_node_key = Column(String, nullable=True)
    loyalty_delta = Column(Integer, default=0)
    safety_delta = Column(Integer, default=0)
    score_delta = Column(Integer, default=0)
    competence = Column(String, nullable=True)
    feedback = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)


class UserGameProfile(Base):
    __tablename__ = "user_game_profiles"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    completed_scenarios = Column(Integer, default=0)
    best_score = Column(Integer, default=0)
    loyalty_avg = Column(Integer, default=0)
    safety_avg = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ScenarioRun(Base):
    __tablename__ = "scenario_runs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenarios.id", ondelete="CASCADE"), index=True)
    status = Column(Enum(RunStatus, name="run_status"), default=RunStatus.in_progress)
    current_node_key = Column(String, nullable=True)
    loyalty = Column(Integer, default=50)
    safety = Column(Integer, default=50)
    score = Column(Integer, default=0)
    choices_log = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    condition = Column(JSON, default=dict)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    achievement_code = Column(String, ForeignKey("achievements.code", ondelete="CASCADE"), primary_key=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    run_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    event_type = Column(String, nullable=False)
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
"""VSM game domain models.

LLM context: Grounded in STO RZD 03.011/03.013/03.014 and "Situations on board".
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import (Column, String, Boolean, DateTime, Integer,
                        ForeignKey, JSON, Text, Enum)
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class ScenarioStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    archived = "archived"


class RunStatus(str, enum.Enum):
    in_progress = "in_progress"
    finished = "finished"
    abandoned = "abandoned"
    failed = "failed"


class ServiceClass(str, enum.Enum):
    standard = "standard"
    comfort = "comfort"
    business = "business"
    first = "first"
    any = "any"


class PassengerType(str, enum.Enum):
    regular = "regular"
    with_child = "with_child"
    with_animal = "with_animal"
    limited_mobility_hearing = "limited_mobility_hearing"
    limited_mobility_vision = "limited_mobility_vision"
    limited_mobility_wheelchair = "limited_mobility_wheelchair"
    limited_mobility_motor = "limited_mobility_motor"
    unaccompanied_child = "unaccompanied_child"
    intoxicated = "intoxicated"
    aggressive = "aggressive"
    allergic = "allergic"
    late = "late"
    lost_item = "lost_item"
    no_document = "no_document"


class Stage(str, enum.Enum):
    boarding = "boarding"
    in_flight = "in_flight"
    arrival = "arrival"


class RoleStep(str, enum.Enum):
    admit = "admit"                  # ПРИЗНАТЬ
    state_rule = "state_rule"        # ОБОЗНАЧИТЬ ПРАВИЛО
    offer_solution = "offer_solution"  # ПРЕДЛОЖИТЬ РЕШЕНИЕ
    reassure = "reassure"            # ЗАВЕРИТЬ


class EscalationTarget(str, enum.Enum):
    nachalnik_poezda = "nachalnik_poezda"
    ptb = "ptb"                      # пост транспортной безопасности
    lovd = "lovd"                    # линейный отдел внутренних дел
    bortinzhener = "bortinzhener"    # бортинженер
    medic = "medic"


# SLA per STO 03.011 p.10.5 (sec)
SLA_SECONDS = {
    ServiceClass.standard: 20 * 60,
    ServiceClass.comfort: 15 * 60,
    ServiceClass.business: 10 * 60,
    ServiceClass.first: 5 * 60,
    ServiceClass.any: 20 * 60,
}
