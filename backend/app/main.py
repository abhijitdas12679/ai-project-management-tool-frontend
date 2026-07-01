import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine, SessionLocal
from app import models
from app.auth import hash_password
from app.routers import auth, projects, tasks, meeting_notes, risk_predictions

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-pm-tool")

app = FastAPI(
    title="AI Project Management Tool API",
    description="Backend API for the AI-powered IT project management tool.",
    version="1.0.0",
)

# ---------------- CORS ----------------
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
origins = [o.strip() for o in frontend_origin.split(",") if o.strip()]
# Always allow localhost dev origins in addition to configured ones
default_dev_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
for o in default_dev_origins:
    if o not in origins:
        origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Global error handling ----------------
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again."},
    )


# ---------------- Routers ----------------
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(meeting_notes.router)
app.include_router(risk_predictions.router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "AI Project Management Tool API is running.",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


def seed_demo_data():
    """Insert a demo user/project/tasks if the database is empty. Safe to call repeatedly."""
    db = SessionLocal()
    try:
        existing_user = db.query(models.User).filter(models.User.email == "demo@example.com").first()
        if existing_user:
            return

        demo_user = models.User(
            full_name="Demo User",
            email="demo@example.com",
            hashed_password=hash_password("Demo@1234"),
            role="Admin",
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        demo_project = models.Project(
            title="Customer Portal Revamp",
            description="Modernize the customer-facing web portal with a React frontend and FastAPI backend.",
            technology_stack="React, FastAPI, PostgreSQL",
            team_size=5,
            deadline="2026-09-30",
            status="Active",
            owner_id=demo_user.id,
        )
        db.add(demo_project)
        db.commit()
        db.refresh(demo_project)

        demo_tasks = [
            models.Task(
                project_id=demo_project.id,
                title="Set up CI/CD pipeline",
                description="Configure GitHub Actions for build, test, and deploy stages.",
                priority=models.TaskPriority.HIGH,
                status=models.TaskStatus.IN_PROGRESS,
                estimated_hours=8,
                assigned_role="DevOps Engineer",
                deadline_suggestion="Week 1",
                owner_id=demo_user.id,
            ),
            models.Task(
                project_id=demo_project.id,
                title="Design authentication flow",
                description="Design JWT-based login/register flow with refresh tokens.",
                priority=models.TaskPriority.URGENT,
                status=models.TaskStatus.PENDING,
                estimated_hours=6,
                assigned_role="Backend Developer",
                deadline_suggestion="Week 1",
                owner_id=demo_user.id,
            ),
            models.Task(
                project_id=demo_project.id,
                title="Build dashboard UI",
                description="Implement KPI cards and charts for the main dashboard.",
                priority=models.TaskPriority.MEDIUM,
                status=models.TaskStatus.COMPLETED,
                estimated_hours=10,
                assigned_role="Frontend Developer",
                deadline_suggestion="Week 2",
                owner_id=demo_user.id,
            ),
        ]
        db.add_all(demo_tasks)
        db.commit()
        logger.info("Seed demo data created (demo@example.com / Demo@1234)")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Skipping seed data: %s", exc)
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()
