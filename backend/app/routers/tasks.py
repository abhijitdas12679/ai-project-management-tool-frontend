from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services import groq_service

router = APIRouter(tags=["Tasks"])


@router.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Task).filter(models.Task.owner_id == current_user.id)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    return query.order_by(models.Task.created_at.desc()).all()


@router.post("/tasks", response_model=schemas.TaskOut, status_code=201)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(**payload.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: str,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None


@router.post("/ai/generate-tasks", response_model=schemas.AITaskGenerateResponse)
def generate_tasks(
    payload: schemas.AITaskGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    system_prompt = (
        "You are an expert IT project manager and technical lead. "
        "Given a software project's details, break it down into a practical, well-scoped list of "
        "engineering tasks. Respond ONLY with a JSON object of the form: "
        '{"tasks": [{"title": string, "description": string, "priority": "Low"|"Medium"|"High"|"Urgent", '
        '"estimated_hours": integer, "assigned_role": string, "deadline_suggestion": string}]} '
        "Generate between 6 and 12 tasks. deadline_suggestion should be a short human-readable date "
        "or relative timeframe (e.g. 'Week 2', '2026-08-15'). Do not include any text outside the JSON object."
    )
    user_prompt = (
        f"Project title: {payload.project_title}\n"
        f"Project description: {payload.project_description}\n"
        f"Deadline: {payload.deadline or 'Not specified'}\n"
        f"Team size: {payload.team_size}\n"
        f"Technology stack: {payload.technology_stack or 'Not specified'}\n"
    )

    try:
        result = groq_service.call_groq_json(system_prompt, user_prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    tasks_data = result.get("tasks", [])
    if not tasks_data:
        raise HTTPException(status_code=502, detail="AI did not return any tasks. Please try again.")

    generated_tasks = []
    for t in tasks_data:
        try:
            generated_tasks.append(
                schemas.GeneratedTask(
                    title=t.get("title", "Untitled Task"),
                    description=t.get("description", ""),
                    priority=t.get("priority", "Medium"),
                    estimated_hours=int(t.get("estimated_hours", 4) or 4),
                    assigned_role=t.get("assigned_role", "Developer"),
                    deadline_suggestion=str(t.get("deadline_suggestion", "TBD")),
                )
            )
        except Exception:  # noqa: BLE001
            continue

    if payload.save:
        for gt in generated_tasks:
            db.add(
                models.Task(
                    project_id=payload.project_id,
                    title=gt.title,
                    description=gt.description,
                    priority=gt.priority,
                    status="Pending",
                    estimated_hours=gt.estimated_hours,
                    assigned_role=gt.assigned_role,
                    deadline_suggestion=gt.deadline_suggestion,
                    owner_id=current_user.id,
                )
            )
        db.commit()

    return schemas.AITaskGenerateResponse(tasks=generated_tasks)
