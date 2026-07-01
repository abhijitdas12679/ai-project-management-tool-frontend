import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class TaskStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    BLOCKED = "Blocked"


class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"


class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Member")
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    technology_stack = Column(String, default="")
    team_size = Column(Integer, default=1)
    deadline = Column(String, nullable=True)  # ISO date string
    status = Column(String, default="Active")
    owner_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    meeting_notes = relationship("MeetingNote", back_populates="project", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=gen_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    priority = Column(SAEnum(TaskPriority), default=TaskPriority.MEDIUM)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.PENDING)
    estimated_hours = Column(Integer, default=0)
    assigned_role = Column(String, default="")
    deadline_suggestion = Column(String, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")


class MeetingNote(Base):
    __tablename__ = "meeting_notes"

    id = Column(String, primary_key=True, default=gen_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    raw_input = Column(Text, default="")
    summary = Column(Text, default="")
    key_points = Column(Text, default="")  # JSON string list
    decisions = Column(Text, default="")  # JSON string list
    action_items = Column(Text, default="")  # JSON string list of {task, owner, due_date}
    next_steps = Column(Text, default="")
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="meeting_notes")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(String, primary_key=True, default=gen_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    input_summary = Column(Text, default="")
    risk_level = Column(SAEnum(RiskLevel), default=RiskLevel.LOW)
    risk_reasons = Column(Text, default="")  # JSON string list
    possible_impact = Column(Text, default="")
    mitigation_plan = Column(Text, default="")  # JSON string list
    recommended_actions = Column(Text, default="")  # JSON string list
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="risk_predictions")
