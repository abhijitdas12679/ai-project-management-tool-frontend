import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services import groq_service

router = APIRouter(tags=["Risk Prediction"])


@router.get("/risk-predictions", response_model=List[schemas.RiskPredictionOut])
def list_risk_predictions(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.RiskPrediction)
        .filter(models.RiskPrediction.owner_id == current_user.id)
        .order_by(models.RiskPrediction.created_at.desc())
        .all()
    )


@router.post("/risk-predictions", response_model=schemas.RiskPredictionOut, status_code=201)
def create_risk_prediction(
    payload: schemas.RiskPredictionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    risk = models.RiskPrediction(**payload.model_dump(), owner_id=current_user.id)
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return risk


@router.post("/ai/predict-risk", response_model=schemas.AIRiskPredictResponse)
def predict_risk(
    payload: schemas.AIRiskPredictRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    system_prompt = (
        "You are an expert IT delivery risk analyst. Given project details, assess delivery risk. "
        "Respond ONLY with a JSON object of this exact shape: "
        '{"risk_level": "Low"|"Medium"|"High", "risk_reasons": [string], "possible_impact": string, '
        '"mitigation_plan": [string], "recommended_next_actions": [string]}. '
        "Base the risk level on deadline pressure, current progress, blockers, team size, and complexity. "
        "Do not include any text outside the JSON object."
    )
    user_prompt = (
        f"Project title: {payload.project_title or 'Untitled Project'}\n"
        f"Deadline: {payload.deadline or 'Not specified'}\n"
        f"Current progress: {payload.current_progress}%\n"
        f"Blockers: {payload.blockers or 'None reported'}\n"
        f"Team size: {payload.team_size}\n"
        f"Complexity: {payload.complexity}\n"
    )

    try:
        result = groq_service.call_groq_json(system_prompt, user_prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    response = schemas.AIRiskPredictResponse(
        risk_level=result.get("risk_level", "Medium"),
        risk_reasons=result.get("risk_reasons", []),
        possible_impact=result.get("possible_impact", ""),
        mitigation_plan=result.get("mitigation_plan", []),
        recommended_next_actions=result.get("recommended_next_actions", []),
    )

    if payload.save:
        input_summary = (
            f"Progress: {payload.current_progress}% | Team: {payload.team_size} | "
            f"Complexity: {payload.complexity} | Deadline: {payload.deadline or 'N/A'} | "
            f"Blockers: {payload.blockers or 'None'}"
        )
        risk = models.RiskPrediction(
            project_id=payload.project_id,
            input_summary=input_summary,
            risk_level=response.risk_level,
            risk_reasons=json.dumps(response.risk_reasons),
            possible_impact=response.possible_impact,
            mitigation_plan=json.dumps(response.mitigation_plan),
            recommended_actions=json.dumps(response.recommended_next_actions),
            owner_id=current_user.id,
        )
        db.add(risk)
        db.commit()

    return response
