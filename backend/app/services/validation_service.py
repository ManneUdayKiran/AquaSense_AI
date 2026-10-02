import re
import logging
from typing import List, Dict, Any, Tuple
from app.models.schemas import CitizenObservationCreate, AIAssessment, ValidationResult

logger = logging.getLogger(__name__)

# Claims that cannot scientifically be established from photographs or subjective citizen descriptions alone
PROHIBITED_INVISIBLE_LAB_CLAIMS = [
    r"\be\.?\s*coli\b",
    r"\bcoliform\b",
    r"\bpathogen count\b",
    r"\bheavy metal(s)?\b",
    r"\blead (concentration|ppm|ppb|\d+)\b",
    r"\bcadmium\b",
    r"\barrenic\b",
    r"\bpesticide(s)?\b",
    r"\bph\s*(level|value)?\s*(of\s*)?\d+(\.\d+)?\b",
    r"\bdissolved oxygen\s*(of\s*)?\d+(\.\d+)?\s*(mg/l|ppm)?\b",
    r"\bbod5?\s*(of\s*)?\d+\b",
    r"\bchemical toxicity\b",
    r"\btoxic carcinogen\b",
    r"\bmicrocystin toxin concentration\b"
]

class ValidationEngine:
    """
    Deterministic rule engine that validates AI assessments against citizen inputs,
    enforcing scientific rigor, contradiction prevention, and safety escalation.
    """

    def validate(
        self,
        citizen_input: CitizenObservationCreate,
        ai_assessment: AIAssessment
    ) -> ValidationResult:
        flags: List[str] = []
        contradictions: List[str] = []
        unsupported_claims: List[str] = []
        escalation_reasons: List[str] = []
        escalation_required = False
        evidence_score = 1.0

        # 1. Schema Validation (Pydantic handles basic types, we check boundaries)
        schema_valid = True
        if not (0.0 <= ai_assessment.confidence <= 1.0):
            schema_valid = False
            flags.append("SCHEMA_VIOLATION_INVALID_CONFIDENCE")

        if ai_assessment.severity not in ["low", "moderate", "high", "critical"]:
            schema_valid = False
            flags.append("SCHEMA_VIOLATION_INVALID_SEVERITY")

        # 2. Required Evidence Sufficiency Check
        evidence_count = len(ai_assessment.evidence)
        observed_signal_count = len(ai_assessment.observed_signals)
        evidence_sufficient = True

        if ai_assessment.severity in ["high", "critical"]:
            if evidence_count < 2 or observed_signal_count < 1:
                evidence_sufficient = False
                flags.append("INSUFFICIENT_EVIDENCE_FOR_SEVERITY")
                escalation_required = True
                escalation_reasons.append(
                    f"Assessment rated '{ai_assessment.severity.upper()}' requires at least 2 distinct supporting evidence items (found {evidence_count})."
                )
                evidence_score -= 0.35

        # 3. Unsupported Laboratory Claim Check
        # Scans all AI output text fields for claims impossible to determine without lab instruments
        text_corpus = " ".join([
            ai_assessment.recommendation,
            " ".join(ai_assessment.evidence),
            " ".join(ai_assessment.observed_signals),
            " ".join(ai_assessment.uncertainty)
        ]).lower()

        detected_prohibited = []
        for pattern in PROHIBITED_INVISIBLE_LAB_CLAIMS:
            matches = re.findall(pattern, text_corpus, re.IGNORECASE)
            if matches:
                detected_prohibited.append(pattern.replace(r"\b", "").replace(r"\s*", " "))

        if detected_prohibited:
            unsupported_claims = list(set(detected_prohibited))
            flags.append("UNSUPPORTED_LABORATORY_CLAIM_DETECTED")
            escalation_required = True
            escalation_reasons.append(
                f"AI generated unsupported laboratory chemical/biological assertions ({', '.join(unsupported_claims[:3])}) without physical lab sensor telemetry."
            )
            evidence_score -= 0.40

        # 4. Contradiction Detection Engine
        # Cross-checks citizen's guided answers with AI signals & severity
        guided = citizen_input.guided_answers
        desc_lower = citizen_input.description.lower()

        # Contradiction: Citizen notes crystal clear water, but AI flags critical turbidity or oily contamination
        if guided.water_clarity == "crystal_clear" and ("crystal clear" in desc_lower or "transparent" in desc_lower):
            if ai_assessment.severity in ["high", "critical"] and "water_quality" in ai_assessment.category:
                if any(sig in ["visible_turbidity_brown_clouding", "opaque_muddy", "black_septic_water"] for sig in ai_assessment.observed_signals):
                    contra = "Citizen recorded 'crystal clear' water, but AI flagged severe turbidity/discoloration."
                    contradictions.append(contra)
                    flags.append("CONTRADICTION_CLARITY_MISMATCH")

        # Contradiction: Citizen notes fast flowing water, AI asserts stagnant cesspool
        if guided.water_flow == "fast_flowing":
            if any("stagnant" in sig.lower() for sig in ai_assessment.observed_signals):
                contra = "Citizen recorded 'fast flowing' water, but AI asserts stagnant conditions."
                contradictions.append(contra)
                flags.append("CONTRADICTION_FLOW_MISMATCH")

        # Contradiction: Citizen notes no odor, but AI diagnoses severe sewage outfall based on description
        if guided.water_odor == "none" and ("no smell" in desc_lower or "clean odor" in desc_lower):
            if any("sewage" in sig.lower() or "foul" in sig.lower() for sig in ai_assessment.observed_signals):
                contra = "Citizen recorded 'no odor', but AI claimed sewage/foul odor indicators."
                contradictions.append(contra)
                flags.append("CONTRADICTION_ODOR_MISMATCH")

        if contradictions:
            escalation_required = True
            escalation_reasons.append(f"Contradiction detected between citizen report and AI interpretation: {contradictions[0]}")
            evidence_score -= 0.30

        # 5. Image Verification & Completeness Check
        if not citizen_input.photo_filename and not citizen_input.photo_url:
            flags.append("NO_PHOTOGRAPHIC_EVIDENCE")
            escalation_reasons.append("Observation lacks photo upload; visual verification cannot be confirmed.")
            evidence_score -= 0.20

        # 6. RAG Grounding Citation Check
        if not ai_assessment.sources:
            flags.append("MISSING_RAG_CITATIONS")
            evidence_score -= 0.15

        # 7. Low Confidence Escalation
        if ai_assessment.confidence < 0.65:
            escalation_required = True
            flags.append("LOW_AI_CONFIDENCE")
            escalation_reasons.append(f"AI confidence ({round(ai_assessment.confidence, 2)}) is below safety threshold (0.65).")

        evidence_score = max(0.0, min(1.0, round(evidence_score, 2)))
        passed = (len(flags) == 0 or (len(flags) == 1 and flags[0] in ["NO_PHOTOGRAPHIC_EVIDENCE", "LOW_AI_CONFIDENCE"])) and not contradictions and not detected_prohibited

        return ValidationResult(
            passed=passed,
            schema_valid=schema_valid,
            evidence_sufficient=evidence_sufficient,
            contradiction_detected=len(contradictions) > 0,
            unsupported_claims_detected=len(unsupported_claims) > 0,
            flags=flags,
            contradictions=contradictions,
            unsupported_claims=unsupported_claims,
            evidence_score=evidence_score,
            escalation_required=escalation_required,
            escalation_reasons=escalation_reasons
        )

validation_engine = ValidationEngine()
