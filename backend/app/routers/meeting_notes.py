import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services import groq_service

router = APIRouter(tags=["Meeting Notes"])


@router.get("/meeting-notes", response_model=List[schemas.MeetingNoteOut])
def list_meeting_notes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.MeetingNote)
        .filter(models.MeetingNote.owner_id == current_user.id)
        .order_by(models.MeetingNote.created_at.desc())
        .all()
    )


@router.post("/meeting-notes", response_model=schemas.MeetingNoteOut, status_code=201)
def create_meeting_note(
    payload: schemas.MeetingNoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    note = models.MeetingNote(
        project_id=payload.project_id,
        raw_input=payload.raw_input,
        owner_id=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/ai/generate-meeting-notes", response_model=schemas.AIMeetingNotesResponse)
def generate_meeting_notes(
    payload: schemas.AIMeetingNotesRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    system_prompt = (
        "You are an expert executive assistant who writes crisp, professional meeting minutes "
        "for software and IT project teams. "
        "Return ONLY a valid JSON object. Do not return markdown, explanation, or extra text. "
        "The JSON object must follow this exact shape: "
        '{"summary": string, '
        '"key_discussion_points": [string], '
        '"decisions_made": [string], '
        '"action_items": [{"task": string, "owner": string, "due_date": string}], '
        '"next_steps": [string]}. '

        "STRICT OWNER RULES: "
        "Use ONLY names provided in the attendee list from the raw meeting notes. "
        "Never invent names such as Amit, Priya, Raj, Neha, John, or any other name not provided. "
        "If a task owner is clearly mentioned and that person exists in the attendee list, use that attendee name exactly. "
        "If no owner is clearly mentioned, use 'Unassigned'. "
        "Do not assign the same attendee to every task unless the meeting notes clearly say that person owns every task. "

        "STRICT DUE DATE RULES: "
        "Use a due date only if it is clearly mentioned in the raw meeting notes. "
        "If no due date is mentioned, use 'TBD'. "

        "Keep the summary between 2 and 4 sentences. "
        "Keep action item tasks short and clear."
    )

    user_prompt = f"""
Raw meeting notes/discussion:

{payload.raw_input}

Important rules:
- Action item owner must be selected ONLY from the attendee names written in the raw notes.
- If attendee names are not available, use "Unassigned".
- If task owner is not clearly stated, use "Unassigned".
- Never use random names.
- Never copy owner names from examples.
- Due date must be "TBD" unless clearly mentioned.
"""

    try:
        result = groq_service.call_groq_json(system_prompt, user_prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    action_items = []

    for item in result.get("action_items", []):
        task = item.get("task", "").strip()
        owner = item.get("owner", "Unassigned")
        due_date = item.get("due_date", "TBD")

        if not owner or str(owner).strip() == "":
            owner = "Unassigned"

        if not due_date or str(due_date).strip() == "":
            due_date = "TBD"

        action_items.append(
            schemas.ActionItem(
                task=task,
                owner=str(owner).strip(),
                due_date=str(due_date).strip(),
            )
        )

    response = schemas.AIMeetingNotesResponse(
        summary=result.get("summary", ""),
        key_discussion_points=result.get("key_discussion_points", []),
        decisions_made=result.get("decisions_made", []),
        action_items=action_items,
        next_steps=result.get("next_steps", []),
    )

    if payload.save:
        note = models.MeetingNote(
            project_id=payload.project_id,
            raw_input=payload.raw_input,
            summary=response.summary,
            key_points=json.dumps(response.key_discussion_points),
            decisions=json.dumps(response.decisions_made),
            action_items=json.dumps(
                [ai.model_dump() for ai in response.action_items]
            ),
            next_steps=json.dumps(response.next_steps),
            owner_id=current_user.id,
        )
        db.add(note)
        db.commit()
        db.refresh(note)

    return response