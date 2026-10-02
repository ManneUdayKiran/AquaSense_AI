import json
import uuid
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import db
from app.models.schemas import (
    Observation,
    CitizenObservationCreate,
    Coordinates,
    GuidedQuestions,
    AIAssessment,
    ValidationResult,
    HumanReviewDecision,
    AuditEvent
)
from app.services.ai_service import ai_service
from app.services.validation_service import validation_engine
from app.services.audit_service import audit_service

router = APIRouter(prefix="/observations", tags=["Citizen Observations"])

@router.post("", response_model=Observation)
async def submit_observation(
    observer_name: str = Form("Anonymous Citizen"),
    location_name: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form(...),
    guided_answers_json: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None)
):
    """
    Submit a citizen observation with text, coordinates, guided answers, and optional photo.
    End-to-End pipeline:
    1. Input normalization
    2. Multimodal AI assessment
    3. Deterministic scientific validation
    4. Immutable audit trail creation
    """
    obs_id = f"obs-{uuid.uuid4().hex[:8]}"

    # Save photo if provided
    photo_filename = None
    photo_url = None
    if photo and photo.filename:
        safe_ext = Path(photo.filename).suffix or ".jpg"
        photo_filename = f"{obs_id}{safe_ext}"
        target_path = settings.UPLOAD_DIR / photo_filename
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = f"/uploads/{photo_filename}"

    # Parse guided answers
    guided_answers = GuidedQuestions()
    if guided_answers_json:
        try:
            parsed = json.loads(guided_answers_json)
            guided_answers = GuidedQuestions(**parsed)
        except Exception:
            pass

    citizen_input = CitizenObservationCreate(
        observer_name=observer_name,
        location_name=location_name,
        coordinates=Coordinates(latitude=latitude, longitude=longitude),
        description=description,
        guided_answers=guided_answers,
        photo_filename=photo_filename,
        photo_url=photo_url
    )

    observation = Observation(
        id=obs_id,
        citizen_input=citizen_input,
        status="pending_review"
    )

    # 1. Audit citizen submission
    audit_service.record_citizen_submission(observation)

    # 2. Multimodal AI Assessment
    assessment = ai_service.assess_observation(citizen_input)
    observation.ai_assessment = assessment
    audit_service.record_ai_assessment(observation)

    # 3. Deterministic Validation Engine
    validation_res = validation_engine.validate(citizen_input, assessment)
    observation.validation_result = validation_res
    audit_service.record_validation(observation)

    # Save to resilient database
    db.save_observation(observation)
    return observation

@router.get("", response_model=List[Observation])
def list_observations(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None)
):
    """Retrieve filtered list of observations."""
    return db.list_observations(limit=limit, skip=skip, status=status, severity=severity)

@router.get("/{obs_id}", response_model=Observation)
def get_observation(obs_id: str):
    """Fetch complete observation by ID with AI assessment, validation result, and audit trail."""
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    return obs

@router.delete("/{obs_id}")
def delete_observation(obs_id: str):
    success = db.delete_observation(obs_id)
    if not success:
        raise HTTPException(status_code=404, detail="Observation not found")
    return {"message": "Observation deleted successfully", "id": obs_id}

@router.post("/{obs_id}/analyze", response_model=Observation)
def trigger_ai_analysis(obs_id: str):
    """
    Trigger multimodal AI analysis and visual evidence extraction on an observation.
    Grounded in OneAquaHealth knowledge documents.
    """
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    assessment = ai_service.assess_observation(obs.citizen_input)
    obs.ai_assessment = assessment
    audit_service.record_ai_assessment(obs)
    db.save_observation(obs)
    return obs

@router.get("/{obs_id}/analysis", response_model=AIAssessment)
def get_ai_analysis(obs_id: str):
    """Retrieve structured AI assessment and visible evidence for an observation."""
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    if not obs.ai_assessment:
        raise HTTPException(status_code=404, detail="AI assessment has not been generated for this observation")
    return obs.ai_assessment

@router.post("/{obs_id}/validate", response_model=ValidationResult)
def trigger_validation(obs_id: str):
    """
    Run deterministic scientific validation engine against the observation.
    Enforces evidence checks, contradiction detection, and unsupported lab claim filters.
    """
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    if not obs.ai_assessment:
        obs.ai_assessment = ai_service.assess_observation(obs.citizen_input)
        audit_service.record_ai_assessment(obs)

    val_res = validation_engine.validate(obs.citizen_input, obs.ai_assessment)
    obs.validation_result = val_res
    audit_service.record_validation(obs)
    db.save_observation(obs)
    return val_res

@router.post("/{obs_id}/review", response_model=Observation)
def submit_human_review(obs_id: str, decision_data: HumanReviewDecision):
    """
    Commit certified human reviewer decision (Approve / Modify / Reject).
    Strictly preserves separation: 'AI recommends. Evidence supports. Validation checks. Humans decide.'
    """
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    obs.human_review = decision_data
    obs.status = decision_data.decision
    audit_service.record_human_decision(obs)
    db.save_observation(obs)
    return obs

@router.get("/{obs_id}/audit", response_model=List[AuditEvent])
def get_observation_audit(obs_id: str):
    """Retrieve full immutable audit timeline events for an observation."""
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    return obs.audit_trail

