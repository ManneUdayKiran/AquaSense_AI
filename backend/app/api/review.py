from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.models.schemas import Observation, HumanReviewDecision
from app.services.audit_service import audit_service

router = APIRouter(prefix="/review", tags=["Human-in-the-Loop Review"])

@router.post("/{obs_id}/decision", response_model=Observation)
def record_review_decision(obs_id: str, decision_data: HumanReviewDecision):
    """
    Commit human reviewer decision (Approve / Modify / Reject).
    Adheres strictly to the core principle:
    'AI recommends. Evidence supports. Validation checks. Humans decide.'
    The reviewer decision is recorded separately from the AI recommendation.
    """
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    # Update human review record
    obs.human_review = decision_data
    obs.status = decision_data.decision

    # Append immutable audit event
    audit_service.record_human_decision(obs)

    # Save to database
    db.save_observation(obs)
    return obs

@router.post("/{obs_id}/reopen", response_model=Observation)
def reopen_for_investigation(obs_id: str):
    """Reopen a finalized observation for secondary field investigation."""
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    obs.status = "under_investigation"
    db.save_observation(obs)
    return obs
