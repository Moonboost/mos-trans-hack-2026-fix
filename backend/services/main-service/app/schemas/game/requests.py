from pydantic import BaseModel, Field
from uuid import UUID


class StartRunRequest(BaseModel):
    scenario_slug: str


class ChooseRequest(BaseModel):
    choice_id: UUID
    time_spent: int = Field(default=0, ge=0)
