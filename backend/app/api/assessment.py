from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.models.schemas import Observation
from app.services.ai_service import ai_service
from app.services.validation_service import validation_engine, PROHIBITED_INVISIBLE_LAB_CLAIMS
from app.services.audit_service import audit_service

router = APIRouter(prefix="/assessment", tags=["AI Assessment & Validation"])

@router.post("/re-evaluate/{obs_id}", response_model=Observation)
def reevaluate_observation(obs_id: str):
    """Re-run Multimodal AI Assessment and Validation Engine on an existing observation."""
    obs = db.get_observation(obs_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")

    # Generate new AI assessment
    new_assessment = ai_service.assess_observation(obs.citizen_input)
    obs.ai_assessment = new_assessment
    audit_service.record_ai_assessment(obs)

    # Re-run validation engine
    validation_res = validation_engine.validate(obs.citizen_input, new_assessment)
    obs.validation_result = validation_res
    audit_service.record_validation(obs)

    db.save_observation(obs)
    return obs

@router.get("/rules")
def get_validation_rules():
    """Return active deterministic validation rules and prohibited claim filters."""
    return {
        "rules": [
            {
                "code": "SCHEMA_VALIDATION",
                "description": "Enforces strict Pydantic categorical taxonomy (low, moderate, high, critical) and confidence boundary [0.0, 1.0]."
            },
            {
                "code": "REQUIRED_EVIDENCE_CHECK",
                "description": "High or critical severity recommendations require at least 2 distinct supporting evidence points."
            },
            {
                "code": "CONTRADICTION_DETECTOR",
                "description": "Cross-references citizen structured survey (odor, clarity, flow) with AI interpretation to catch conflicting claims."
            },
            {
                "code": "UNSUPPORTED_LABORATORY_CLAIM_FILTER",
                "description": "Blocks AI from claiming invisible laboratory measurements (e.g. E. coli, heavy metals, pH) from photographs alone."
            },
            {
                "code": "RAG_GROUNDING_CHECK",
                "description": "Verifies that AI recommendations cite official OneAquaHealth indicators and guidance."
            },
            {
                "code": "HUMAN_ESCALATION_TRIGGER",
                "description": "Automatically flags observations for mandatory human review when confidence < 0.65 or severity is high."
            }
        ],
        "prohibited_claim_patterns": [p.replace(r"\b", "").replace(r"\s*", " ") for p in PROHIBITED_INVISIBLE_LAB_CLAIMS]
    }
