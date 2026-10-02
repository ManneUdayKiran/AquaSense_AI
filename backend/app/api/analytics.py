from fastapi import APIRouter
from app.core.database import db
from app.models.schemas import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["Analytics & Impact"])

@router.get("", response_model=AnalyticsSummary)
@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary():
    """Compute aggregate quality, validation, and human agreement metrics."""
    observations = db.list_observations(limit=500)
    total = len(observations)

    if total == 0:
        return AnalyticsSummary(
            total_observations=0,
            pending_count=0,
            approved_count=0,
            modified_count=0,
            rejected_count=0,
            validation_pass_rate=100.0,
            unsupported_claim_block_count=0,
            contradiction_flag_count=0,
            human_agreement_rate=100.0,
            severity_breakdown={},
            category_breakdown={},
            average_confidence=0.0
        )

    pending = sum(1 for o in observations if o.status in ["pending_review", "under_investigation"])
    approved = sum(1 for o in observations if o.status == "approved")
    modified = sum(1 for o in observations if o.status == "modified")
    rejected = sum(1 for o in observations if o.status == "rejected")

    # Validation engine metrics
    passed_validation = sum(1 for o in observations if o.validation_result and o.validation_result.passed)
    unsupported_blocks = sum(len(o.validation_result.unsupported_claims) for o in observations if o.validation_result)
    contradictions = sum(len(o.validation_result.contradictions) for o in observations if o.validation_result)

    # Human-AI Agreement: when reviewed, did final human severity match AI recommendation?
    reviewed_obs = [o for o in observations if o.human_review is not None and o.ai_assessment is not None]
    agreed_count = sum(1 for o in reviewed_obs if o.human_review.final_severity == o.ai_assessment.severity)
    agreement_rate = (agreed_count / len(reviewed_obs) * 100.0) if reviewed_obs else 85.0

    # Severity & Category breakdown
    severities = {"low": 0, "moderate": 0, "high": 0, "critical": 0}
    categories = {}
    total_conf = 0.0
    conf_count = 0

    for o in observations:
        if o.ai_assessment:
            sev = o.ai_assessment.severity
            severities[sev] = severities.get(sev, 0) + 1
            cat = o.ai_assessment.category
            categories[cat] = categories.get(cat, 0) + 1
            total_conf += o.ai_assessment.confidence
            conf_count += 1

    pass_rate = round((passed_validation / total) * 100.0, 1)
    avg_conf = round(total_conf / conf_count, 2) if conf_count > 0 else 0.85

    return AnalyticsSummary(
        total_observations=total,
        pending_count=pending,
        approved_count=approved,
        modified_count=modified,
        rejected_count=rejected,
        validation_pass_rate=pass_rate,
        unsupported_claim_block_count=unsupported_blocks,
        contradiction_flag_count=contradictions,
        human_agreement_rate=round(agreement_rate, 1),
        severity_breakdown=severities,
        category_breakdown=categories,
        average_confidence=avg_conf
    )

@router.get("/geo")
def get_geospatial_observations():
    """Return geo-referenced points for map visualization."""
    observations = db.list_observations(limit=200)
    features = []
    for o in observations:
        features.append({
            "id": o.id,
            "title": o.citizen_input.location_name,
            "observer": o.citizen_input.observer_name,
            "latitude": o.citizen_input.coordinates.latitude,
            "longitude": o.citizen_input.coordinates.longitude,
            "status": o.status,
            "category": o.ai_assessment.category if o.ai_assessment else "unassessed",
            "severity": o.ai_assessment.severity if o.ai_assessment else "moderate",
            "confidence": o.ai_assessment.confidence if o.ai_assessment else 0.0,
            "recommendation": o.ai_assessment.recommendation if o.ai_assessment else "",
            "photo_url": o.citizen_input.photo_url,
            "created_at": o.created_at
        })
    return {"features": features}
