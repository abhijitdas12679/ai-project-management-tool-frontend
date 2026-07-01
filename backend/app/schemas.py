from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Project ----------
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    technology_stack: Optional[str] = ""
    team_size: Optional[int] = 1
    deadline: Optional[str] = None
    status: Optional[str] = "Active"


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technology_stack: Optional[str] = None
    team_size: Optional[int] = None
    deadline: Optional[str] = None
    status: Optional[str] = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    technology_stack: str
    team_size: int
    deadline: Optional[str]
    status: str
    owner_id: Optional[str]
    created_at: datetime


# ---------- Task ----------
class TaskCreate(BaseModel):
    project_id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending"
    estimated_hours: Optional[int] = 0
    assigned_role: Optional[str] = ""
    deadline_suggestion: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    estimated_hours: Optional[int] = None
    assigned_role: Optional[str] = None
    deadline_suggestion: Optional[str] = None
    project_id: Optional[str] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: Optional[str]
    title: str
    description: str
    priority: str
    status: str
    estimated_hours: int
    assigned_role: str
    deadline_suggestion: Optional[str]
    created_at: datetime


# ---------- AI Task Generation ----------
class AITaskGenerateRequest(BaseModel):
    project_title: str
    project_description: str
    deadline: Optional[str] = None
    team_size: Optional[int] = 1
    technology_stack: Optional[str] = ""
    project_id: Optional[str] = None
    save: Optional[bool] = True


class GeneratedTask(BaseModel):
    title: str
    description: str
    priority: str
    estimated_hours: int
    assigned_role: str
    deadline_suggestion: str


class AITaskGenerateResponse(BaseModel):
    tasks: List[GeneratedTask]


# ---------- Meeting Notes ----------
class MeetingNoteCreate(BaseModel):
    project_id: Optional[str] = None
    raw_input: str


class ActionItem(BaseModel):
    task: str
    owner: str
    due_date: str


class MeetingNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: Optional[str]
    raw_input: str
    summary: str
    key_points: str
    decisions: str
    action_items: str
    next_steps: str
    created_at: datetime


class AIMeetingNotesRequest(BaseModel):
    project_id: Optional[str] = None
    raw_input: str
    save: Optional[bool] = True


class AIMeetingNotesResponse(BaseModel):
    summary: str
    key_discussion_points: List[str]
    decisions_made: List[str]
    action_items: List[ActionItem]
    next_steps: List[str]


# ---------- Risk Prediction ----------
class RiskPredictionCreate(BaseModel):
    project_id: Optional[str] = None
    input_summary: str
    risk_level: str
    risk_reasons: str
    possible_impact: str
    mitigation_plan: str
    recommended_actions: str


class RiskPredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: Optional[str]
    input_summary: str
    risk_level: str
    risk_reasons: str
    possible_impact: str
    mitigation_plan: str
    recommended_actions: str
    created_at: datetime


class AIRiskPredictRequest(BaseModel):
    project_id: Optional[str] = None
    project_title: Optional[str] = ""
    deadline: Optional[str] = None
    current_progress: Optional[int] = 0
    blockers: Optional[str] = ""
    team_size: Optional[int] = 1
    complexity: Optional[str] = "Medium"
    save: Optional[bool] = True


class AIRiskPredictResponse(BaseModel):
    risk_level: str
    risk_reasons: List[str]
    possible_impact: str
    mitigation_plan: List[str]
    recommended_next_actions: List[str]
