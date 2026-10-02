from datetime import datetime
from typing import Dict, Any, List
from app.models.schemas import Observation, AuditEvent

class AuditService:
    @staticmethod
    def create_event(event_type: str, actor: str, details: Dict[str, Any]) -> AuditEvent:
        return AuditEvent(
            event_type=event_type, # type: ignore
            actor=actor,
            details=details,
            timestamp=datetime.utcnow().isoformat()
        )

    @classmethod
    def record_citizen_submission(cls, observation: Observation) -> Observation:
        event = cls.create_event(
            event_type="CITIZEN_SUBMITTED",
            actor=observation.citizen_input.observer_name,
            details={
                "location": observation.citizen_input.location_name,
                "coordinates": observation.citizen_input.coordinates.model_dump(),
                "guided_answers": observation.citizen_input.guided_answers.model_dump(),
                "has_photo": bool(observation.citizen_input.photo_filename or observation.citizen_input.photo_url)
            }
        )
        observation.audit_trail.append(event)
        return observation

    @classmethod
    def record_ai_assessment(cls, observation: Observation) -> Observation:
        if not observation.ai_assessment:
            return observation
        event = cls.create_event(
            event_type="AI_RECOMMENDATION_GENERATED",
            actor="AquaSense-Multimodal-Engine-v1",
            details={
                "category": observation.ai_assessment.category,
                "severity": observation.ai_assessment.severity,
                "confidence": observation.ai_assessment.confidence,
                "signals": observation.ai_assessment.observed_signals,
                "sources_cited": observation.ai_assessment.sources
            }
        )
        observation.audit_trail.append(event)
        return observation

    @classmethod
    def record_validation(cls, observation: Observation) -> Observation:
        if not observation.validation_result:
            return observation
        event = cls.create_event(
            event_type="VALIDATION_ENGINE_EVALUATED",
            actor="AquaSense-Deterministic-Validator",
            details={
                "passed": observation.validation_result.passed,
                "flags": observation.validation_result.flags,
                "contradictions": observation.validation_result.contradictions,
                "unsupported_claims": observation.validation_result.unsupported_claims,
                "evidence_score": observation.validation_result.evidence_score,
                "escalation_required": observation.validation_result.escalation_required
            }
        )
        observation.audit_trail.append(event)
        return observation

    @classmethod
    def record_human_decision(cls, observation: Observation) -> Observation:
        if not observation.human_review:
            return observation
        event = cls.create_event(
            event_type="HUMAN_DECISION_COMMITTED",
            actor=f"{observation.human_review.reviewer_name} ({observation.human_review.reviewer_id})",
            details={
                "decision": observation.human_review.decision,
                "final_category": observation.human_review.final_category,
                "final_severity": observation.human_review.final_severity,
                "decision_notes": observation.human_review.decision_notes,
                "ai_severity_was": observation.ai_assessment.severity if observation.ai_assessment else None,
                "agreement": (observation.ai_assessment.severity == observation.human_review.final_severity) if observation.ai_assessment else False
            }
        )
        observation.audit_trail.append(event)
        return observation

audit_service = AuditService()
