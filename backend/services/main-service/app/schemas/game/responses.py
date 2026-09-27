from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class ChoiceOut(BaseModel):
    id: str
    label: str
    next_node_key: Optional[str] = None


class NodeOut(BaseModel):
    key: str
    type: str
    text: str
    media_url: Optional[str] = None
    timer_seconds: Optional[int] = None
    is_terminal: bool
    meta: Dict[str, Any] = {}
    choices: List[ChoiceOut] = []


class ScenarioOut(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    category: str
    difficulty: str
    xp_reward: int
    start_node_key: str


class RunOut(BaseModel):
    run_id: str
    status: str
    loyalty: int
    safety: int
    score: int
    node: Optional[NodeOut] = None


class StepOut(BaseModel):
    node_key: str
    choice_id: str
    time_spent: int
    overtime: int
    loyalty: int
    safety: int
    competence: Optional[str] = None


class ReportOut(BaseModel):
    run_id: str
    status: str
    loyalty: int
    safety: int
    score: int
    total_time_seconds: int
    verdict: str
    steps: List[StepOut] = []
    xp_gained: int = 0
    level: int = 1
    achievements: List[str] = []


class ProfileOut(BaseModel):
    user_id: str
    xp: int
    level: int
    completed_scenarios: int
    best_score: int
    loyalty_avg: int
    safety_avg: int
from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class ChoiceOut(BaseModel):
    id: str
    label: str
    next_node_key: Optional[str] = None
    role_step: Optional[str] = None


class NodeOut(BaseModel):
    key: str
    type: str
    text: str
    media_url: Optional[str] = None
    timer_seconds: Optional[int] = None
    is_terminal: bool
    meta: Dict[str, Any] = {}
    choices: List[ChoiceOut] = []


class ScenarioOut(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    category: str
    service_class: str = "any"
    passenger_type: str = "regular"
    stage: str = "in_flight"
    regulatory_ref: Optional[str] = None
    difficulty: str = "medium"
    xp_reward: int = 100
    start_node_key: str
    timer_seconds: Optional[int] = None


class RunOut(BaseModel):
    run_id: str
    status: str
    loyalty: int
    safety: int
    score: int
    service_class: str = "standard"
    role_steps_seen: List[str] = []
    node: Optional[NodeOut] = None


class ReportOut(BaseModel):
    run_id: str
    status: str
    loyalty: int
    safety: int
    score: int
    total_time_seconds: int
    verdict: str
    role_steps_seen: List[str] = []
    role_model_complete: bool = False
    steps: List[dict] = []
    xp_gained: int = 0
    level: int = 1
    achievements: List[str] = []
    scenario: Optional[dict] = None
