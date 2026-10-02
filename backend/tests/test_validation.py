from app.models.schemas import CitizenObservationCreate, Coordinates, GuidedQuestions, AIAssessment
from app.services.validation_service import validation_engine

def test_unsupported_laboratory_claim_blocked():
    """Ensure AI claims of invisible lab measurements (E. coli, heavy metals) are flagged and blocked."""
    citizen_input = CitizenObservationCreate(
        observer_name="Tester",
        location_name="Test Creek",
        coordinates=Coordinates(latitude=40.0, longitude=-74.0),
        description="Water smells dirty near the factory pipe.",
        guided_answers=GuidedQuestions()
    )

    assessment_with_lab_claims = AIAssessment(
        category="water_quality",
        severity="critical",
        confidence=0.90,
        observed_signals=["dark_plume"],
        evidence=[
            "Visual discolored plume observed",
            "Spectrometry analysis confirms E. Coli bacterial concentration is high and heavy metals present"
        ],
        missing_information=[],
        uncertainty=[],
        recommendation="Emergency shutdown",
        sources=["OneAquaHealth Protocol 1"]
    )

    result = validation_engine.validate(citizen_input, assessment_with_lab_claims)
    assert not result.passed
    assert result.unsupported_claims_detected
    assert "UNSUPPORTED_LABORATORY_CLAIM_DETECTED" in result.flags
    assert result.escalation_required

def test_contradiction_detection():
    """Ensure contradiction between citizen's report and AI interpretation is caught."""
    citizen_input = CitizenObservationCreate(
        observer_name="Tester",
        location_name="Clear Mountain Brook",
        coordinates=Coordinates(latitude=40.0, longitude=-74.0),
        description="The water is completely crystal clear, clean, and transparent with no smell.",
        guided_answers=GuidedQuestions(
            water_clarity="crystal_clear",
            water_odor="none"
        )
    )

    conflicting_assessment = AIAssessment(
        category="water_quality",
        severity="high",
        confidence=0.80,
        observed_signals=["visible_turbidity_brown_clouding"],
        evidence=["Shadow area identified as heavy silt"],
        missing_information=[],
        uncertainty=[],
        recommendation="Action needed",
        sources=["OneAquaHealth Protocol 4"]
    )

    result = validation_engine.validate(citizen_input, conflicting_assessment)
    assert not result.passed
    assert result.contradiction_detected
    assert "CONTRADICTION_CLARITY_MISMATCH" in result.flags
    assert result.escalation_required

def test_evidence_sufficiency_for_high_severity():
    """High severity recommendations must have at least 2 distinct evidence items."""
    citizen_input = CitizenObservationCreate(
        observer_name="Tester",
        location_name="Storm Drain",
        coordinates=Coordinates(latitude=40.0, longitude=-74.0),
        description="Spotted some foam.",
        guided_answers=GuidedQuestions(surface_appearance="dense_foam")
    )

    sparse_assessment = AIAssessment(
        category="water_quality",
        severity="high",
        confidence=0.75,
        observed_signals=["dense_white_foam_accumulation"],
        evidence=["Only one piece of evidence"],
        missing_information=[],
        uncertainty=[],
        recommendation="Check drainage",
        sources=["OneAquaHealth Protocol 1"]
    )

    result = validation_engine.validate(citizen_input, sparse_assessment)
    assert not result.evidence_sufficient
    assert "INSUFFICIENT_EVIDENCE_FOR_SEVERITY" in result.flags
    assert result.escalation_required
