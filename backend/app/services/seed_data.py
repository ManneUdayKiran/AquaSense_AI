import uuid
from datetime import datetime, timedelta
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
from app.core.database import db

def populate_seed_data():
    """Populate repository with rich, realistic OneAquaHealth assessment scenarios."""
    if db.get_observation("obs-oah-101") is not None:
        return

    now = datetime.utcnow()

    # 1. Pending Review: Detergent Foam Discharge (High Severity)
    obs1 = Observation(
        id="obs-oah-101",
        citizen_input=CitizenObservationCreate(
            observer_name="Elena Rostova",
            location_name="Regent's Canal Urban Tributary - Culvert 4B",
            coordinates=Coordinates(latitude=51.5348, longitude=-0.1189),
            description="Found thick billowing white froth and soapy foam accumulating along the storm outlet. Noticeable detergent floral odor. Foam has been persisting for over 30 minutes without dissipating.",
            guided_answers=GuidedQuestions(
                water_odor="chemical_petroleum",
                water_clarity="milky_cloudy",
                water_flow="moderate",
                surface_appearance="dense_foam",
                bank_condition="concrete_canal",
                surrounding_land_use="residential"
            ),
            photo_filename="sample_foam_discharge.jpg",
            photo_url="/uploads/sample_foam_discharge.jpg"
        ),
        status="pending_review",
        ai_assessment=AIAssessment(
            category="water_quality",
            severity="high",
            confidence=0.88,
            observed_signals=[
                "dense_white_foam_accumulation",
                "detergent_or_chemical_odor",
                "milky_suspended_surfactants"
            ],
            evidence=[
                "Citizen report confirms thick billowing white froth persisting >30 mins.",
                "Guided attributes indicate chemical/petroleum odor and milky opacity.",
                "Culvert outfall concrete canal setting matches graywater discharge profile."
            ],
            missing_information=[
                "Anionic surfactant (MBAS) grab sample laboratory test",
                "Upstream storm sewer cadastre tracing"
            ],
            uncertainty=[
                "Visual foam analysis cannot determine exact surfactant chemical toxicity without lab spectrometry."
            ],
            recommendation="HUMAN SPECIALIST VERIFICATION RECOMMENDED: Dispatch field inspector to trace upstream storm sewer junction and collect grab samples for MBAS detergent testing.",
            sources=[
                "OneAquaHealth Protocol 1: Urban Stream Surface Foam & Surfactant Triage (OneAquaHealth Framework WP3: Urban Aquatic Physical-Chemical Indicators Guideline, Sec 4.1)"
            ],
            generated_at=(now - timedelta(hours=3)).isoformat()
        ),
        validation_result=ValidationResult(
            passed=True,
            schema_valid=True,
            evidence_sufficient=True,
            contradiction_detected=False,
            unsupported_claims_detected=False,
            flags=[],
            contradictions=[],
            unsupported_claims=[],
            evidence_score=0.95,
            escalation_required=True,
            escalation_reasons=["Assessment rated 'HIGH' mandates human review before municipal dispatch."],
            validated_at=(now - timedelta(hours=3)).isoformat()
        ),
        audit_trail=[
            AuditEvent(
                event_type="CITIZEN_SUBMITTED",
                actor="Elena Rostova",
                details={"location": "Regent's Canal Urban Tributary - Culvert 4B", "odor": "chemical_petroleum"},
                timestamp=(now - timedelta(hours=3, minutes=2)).isoformat()
            ),
            AuditEvent(
                event_type="AI_RECOMMENDATION_GENERATED",
                actor="AquaSense-Multimodal-Engine-v1",
                details={"category": "water_quality", "severity": "high", "confidence": 0.88},
                timestamp=(now - timedelta(hours=3)).isoformat()
            ),
            AuditEvent(
                event_type="VALIDATION_ENGINE_EVALUATED",
                actor="AquaSense-Deterministic-Validator",
                details={"passed": True, "evidence_score": 0.95, "escalation_required": True},
                timestamp=(now - timedelta(hours=3)).isoformat()
            )
        ],
        created_at=(now - timedelta(hours=3)).isoformat(),
        updated_at=(now - timedelta(hours=3)).isoformat()
    )

    # 2. Contradiction Detected: Citizen reports crystal clear water, but AI mistakenly flagged turbidity
    obs2 = Observation(
        id="obs-oah-102",
        citizen_input=CitizenObservationCreate(
            observer_name="Marcus Vance",
            location_name="Willow Creek Nature Reserve - Bridge 2",
            coordinates=Coordinates(latitude=42.3601, longitude=-71.0589),
            description="The stream is completely crystal clear and transparent today. Pebbles are clearly visible on the gravel bed. Flow is calm and fresh.",
            guided_answers=GuidedQuestions(
                water_odor="none",
                water_clarity="crystal_clear",
                water_flow="moderate",
                surface_appearance="clear",
                bank_condition="natural_vegetated",
                surrounding_land_use="urban_park"
            ),
            photo_filename="sample_clear_stream.jpg",
            photo_url="/uploads/sample_clear_stream.jpg"
        ),
        status="pending_review",
        ai_assessment=AIAssessment(
            category="water_quality",
            severity="high",
            confidence=0.62,
            observed_signals=[
                "visible_turbidity_brown_clouding",
                "bed_sedimentation_risk"
            ],
            evidence=[
                "Automated shadow heuristic flagged dark area as sediment plume."
            ],
            missing_information=["Turbidimeter NTU reading"],
            uncertainty=["High sunlight glare and tree shadow interference over water surface."],
            recommendation="HUMAN VERIFICATION REQUIRED: Re-examine observation due to conflicting clarity cues.",
            sources=[
                "OneAquaHealth Protocol 4: Visual Water Turbidity & Suspended Solids Classification"
            ],
            generated_at=(now - timedelta(hours=5)).isoformat()
        ),
        validation_result=ValidationResult(
            passed=False,
            schema_valid=True,
            evidence_sufficient=False,
            contradiction_detected=True,
            unsupported_claims_detected=False,
            flags=["CONTRADICTION_CLARITY_MISMATCH", "INSUFFICIENT_EVIDENCE_FOR_SEVERITY", "LOW_AI_CONFIDENCE"],
            contradictions=["Citizen recorded 'crystal clear' water, but AI flagged severe turbidity/discoloration."],
            unsupported_claims=[],
            evidence_score=0.45,
            escalation_required=True,
            escalation_reasons=[
                "Contradiction detected: Citizen recorded 'crystal clear' water while AI flagged severe turbidity.",
                "AI confidence (0.62) is below safety threshold (0.65)."
            ],
            validated_at=(now - timedelta(hours=5)).isoformat()
        ),
        audit_trail=[
            AuditEvent(
                event_type="CITIZEN_SUBMITTED",
                actor="Marcus Vance",
                details={"location": "Willow Creek Nature Reserve - Bridge 2", "clarity": "crystal_clear"},
                timestamp=(now - timedelta(hours=5, minutes=3)).isoformat()
            ),
            AuditEvent(
                event_type="AI_RECOMMENDATION_GENERATED",
                actor="AquaSense-Multimodal-Engine-v1",
                details={"category": "water_quality", "severity": "high", "confidence": 0.62},
                timestamp=(now - timedelta(hours=5)).isoformat()
            ),
            AuditEvent(
                event_type="VALIDATION_ENGINE_EVALUATED",
                actor="AquaSense-Deterministic-Validator",
                details={"passed": False, "contradiction_flagged": True, "evidence_score": 0.45},
                timestamp=(now - timedelta(hours=5)).isoformat()
            )
        ],
        created_at=(now - timedelta(hours=5)).isoformat(),
        updated_at=(now - timedelta(hours=5)).isoformat()
    )

    # 3. Unsupported Laboratory Claim Blocked: AI claimed E. coli and chemical toxicity from photo
    obs3 = Observation(
        id="obs-oah-103",
        citizen_input=CitizenObservationCreate(
            observer_name="Devin Chen",
            location_name="Industrial Canal Basin South Outfall",
            coordinates=Coordinates(latitude=52.5200, longitude=13.4050),
            description="Dark oily film near the boat slip. Smells like old engine fuel or industrial waste.",
            guided_answers=GuidedQuestions(
                water_odor="chemical_petroleum",
                water_clarity="discolored_black_green",
                water_flow="slow_trickle",
                surface_appearance="oily_sheen",
                bank_condition="concrete_canal",
                surrounding_land_use="commercial_industrial"
            ),
            photo_filename="sample_oil_sheen.jpg",
            photo_url="/uploads/sample_oil_sheen.jpg"
        ),
        status="pending_review",
        ai_assessment=AIAssessment(
            category="illegal_discharge",
            severity="critical",
            confidence=0.74,
            observed_signals=[
                "surface_iridescence_or_rainbow_film",
                "petroleum_chemical_odor_profile"
            ],
            evidence=[
                "Citizen report indicates petroleum odor and oily film.",
                "Unvalidated assertion: high pathogen count with E. coli contamination and heavy metals detected from optical reflection."
            ],
            missing_information=["VOC photoionization detector reading", "Certified laboratory hydrocarbon panel"],
            uncertainty=["Image cannot confirm whether film is petroleum or natural biogenic iron biofilm."],
            recommendation="EMERGENCY TRIAGE: Deploy absorbent boom and dispatch certified environmental inspector.",
            sources=[
                "OneAquaHealth Protocol 7: Hydrocarbon Sheen vs Natural Biofilm Differentiation",
                "OneAquaHealth Guidelines 8: Photographic Limitations & Laboratory Validation Mandate"
            ],
            generated_at=(now - timedelta(hours=7)).isoformat()
        ),
        validation_result=ValidationResult(
            passed=False,
            schema_valid=True,
            evidence_sufficient=True,
            contradiction_detected=False,
            unsupported_claims_detected=True,
            flags=["UNSUPPORTED_LABORATORY_CLAIM_DETECTED"],
            contradictions=[],
            unsupported_claims=["e. coli", "pathogen count", "heavy metals"],
            evidence_score=0.60,
            escalation_required=True,
            escalation_reasons=[
                "AI generated unsupported laboratory chemical/biological assertions (e. coli, heavy metals) without physical lab telemetry.",
                "High severity mandates physical grab sampling confirmation."
            ],
            validated_at=(now - timedelta(hours=7)).isoformat()
        ),
        audit_trail=[
            AuditEvent(
                event_type="CITIZEN_SUBMITTED",
                actor="Devin Chen",
                details={"location": "Industrial Canal Basin South Outfall"},
                timestamp=(now - timedelta(hours=7, minutes=2)).isoformat()
            ),
            AuditEvent(
                event_type="AI_RECOMMENDATION_GENERATED",
                actor="AquaSense-Multimodal-Engine-v1",
                details={"severity": "critical", "unsupported_claims_present": True},
                timestamp=(now - timedelta(hours=7)).isoformat()
            ),
            AuditEvent(
                event_type="VALIDATION_ENGINE_EVALUATED",
                actor="AquaSense-Deterministic-Validator",
                details={"unsupported_claims_blocked": ["e. coli", "heavy metals"], "passed": False},
                timestamp=(now - timedelta(hours=7)).isoformat()
            )
        ],
        created_at=(now - timedelta(hours=7)).isoformat(),
        updated_at=(now - timedelta(hours=7)).isoformat()
    )

    # 4. Approved Observation: Macroplastic Choke Point (High Severity -> Approved by Specialist)
    obs4 = Observation(
        id="obs-oah-104",
        citizen_input=CitizenObservationCreate(
            observer_name="Aisha Al-Mansoor",
            location_name="Seine Tributary Confluence - Grate 12",
            coordinates=Coordinates(latitude=48.8566, longitude=2.3522),
            description="Over 60 plastic soda bottles, styrofoam cups, and plastic grocery bags are trapped against the bridge culvert weir, causing water backflow.",
            guided_answers=GuidedQuestions(
                water_odor="musty_earthy",
                water_clarity="slightly_turbid",
                water_flow="moderate",
                surface_appearance="floating_trash",
                bank_condition="concrete_canal",
                surrounding_land_use="residential"
            ),
            photo_filename="sample_plastic_waste.jpg",
            photo_url="/uploads/sample_plastic_waste.jpg"
        ),
        status="approved",
        ai_assessment=AIAssessment(
            category="plastic_debris",
            severity="high",
            confidence=0.89,
            observed_signals=[
                "floating_macroplastic_and_solid_waste",
                "culvert_hydraulic_choke_risk"
            ],
            evidence=[
                "Citizen report indicates >60 macroplastic units trapped against culvert weir.",
                "Surface appearance classified as floating_trash.",
                "Hydraulic damming risk at stream constriction."
            ],
            missing_information=["Culvert upstream water elevation measurement"],
            uncertainty=["Debris volume under water surface cannot be fully estimated."],
            recommendation="DISPATCH MUNICIPAL WORK ORDER: Riparian cleanup and debris boom clearing recommended within 24 hours.",
            sources=[
                "OneAquaHealth Metric 3: Solid Waste & Macroplastic Accumulation Index (SWAI)"
            ],
            generated_at=(now - timedelta(days=1)).isoformat()
        ),
        validation_result=ValidationResult(
            passed=True,
            schema_valid=True,
            evidence_sufficient=True,
            contradiction_detected=False,
            unsupported_claims_detected=False,
            flags=[],
            contradictions=[],
            unsupported_claims=[],
            evidence_score=0.98,
            escalation_required=True,
            escalation_reasons=["High severity debris choke mandates municipal triage approval."],
            validated_at=(now - timedelta(days=1)).isoformat()
        ),
        human_review=HumanReviewDecision(
            reviewer_id="rev-specialist-04",
            reviewer_name="Dr. Claire Dubois (Catchment Hydrologist)",
            decision="approved",
            final_category="plastic_debris",
            final_severity="high",
            decision_notes="AI assessment perfectly matches SWAI Grade 3 criteria. Photographic evidence confirms culvert choke risk. Municipal clean-up dispatch order #4492 issued.",
            reviewed_at=(now - timedelta(hours=22)).isoformat()
        ),
        audit_trail=[
            AuditEvent(
                event_type="CITIZEN_SUBMITTED",
                actor="Aisha Al-Mansoor",
                details={"location": "Seine Tributary Confluence - Grate 12"},
                timestamp=(now - timedelta(days=1, hours=1)).isoformat()
            ),
            AuditEvent(
                event_type="AI_RECOMMENDATION_GENERATED",
                actor="AquaSense-Multimodal-Engine-v1",
                details={"severity": "high", "category": "plastic_debris"},
                timestamp=(now - timedelta(days=1)).isoformat()
            ),
            AuditEvent(
                event_type="VALIDATION_ENGINE_EVALUATED",
                actor="AquaSense-Deterministic-Validator",
                details={"passed": True, "score": 0.98},
                timestamp=(now - timedelta(days=1)).isoformat()
            ),
            AuditEvent(
                event_type="HUMAN_DECISION_COMMITTED",
                actor="Dr. Claire Dubois (rev-specialist-04)",
                details={"decision": "approved", "final_severity": "high", "agreement": True},
                timestamp=(now - timedelta(hours=22)).isoformat()
            )
        ],
        created_at=(now - timedelta(days=1, hours=1)).isoformat(),
        updated_at=(now - timedelta(hours=22)).isoformat()
    )

    # 5. Modified Observation: Human Reviewer Overrides AI Overconfidence
    obs5 = Observation(
        id="obs-oah-105",
        citizen_input=CitizenObservationCreate(
            observer_name="Tobias Lindqvist",
            location_name="Danube River Wetlands Inlet - Km 1922",
            coordinates=Coordinates(latitude=48.2082, longitude=16.3738),
            description="Green film on the inlet edge. Lots of floating plant matter and duckweed.",
            guided_answers=GuidedQuestions(
                water_odor="musty_earthy",
                water_clarity="slightly_turbid",
                water_flow="slow_trickle",
                surface_appearance="green_algal_film",
                bank_condition="natural_vegetated",
                surrounding_land_use="urban_park"
            ),
            photo_filename="sample_algae_duckweed.jpg",
            photo_url="/uploads/sample_algae_duckweed.jpg"
        ),
        status="modified",
        ai_assessment=AIAssessment(
            category="algal_bloom",
            severity="critical",
            confidence=0.79,
            observed_signals=[
                "green_surface_scum_or_filamentous_film",
                "stagnant_warm_flow_conditions"
            ],
            evidence=[
                "Visual indication of green surface vegetation coverage.",
                "Guided response marked green_algal_film."
            ],
            missing_information=["Microcystin cyanotoxin laboratory ELISA assay"],
            uncertainty=["Visual observation cannot differentiate harmless Lemna minor (duckweed) from microcystin-producing cyanobacteria."],
            recommendation="EMERGENCY ADVISORY: Potential toxic cyanobacteria bloom alert.",
            sources=[
                "OneAquaHealth Indicator 2: Visual Assessment of Cyanobacteria & Eutrophic Algal Blooms"
            ],
            generated_at=(now - timedelta(days=2)).isoformat()
        ),
        validation_result=ValidationResult(
            passed=True,
            schema_valid=True,
            evidence_sufficient=True,
            contradiction_detected=False,
            unsupported_claims_detected=False,
            flags=[],
            contradictions=[],
            unsupported_claims=[],
            evidence_score=0.88,
            escalation_required=True,
            escalation_reasons=["Critical severity alert requires mandatory biologist review."],
            validated_at=(now - timedelta(days=2)).isoformat()
        ),
        human_review=HumanReviewDecision(
            reviewer_id="rev-biologist-09",
            reviewer_name="Dr. Stefan Weber (Freshwater Ecologist)",
            decision="modified",
            final_category="algal_bloom",
            final_severity="moderate",
            decision_notes="AI was overconfident. Close inspection of the image reveals harmless Lemna minor (common duckweed) and natural Spirogyra filamentous algae, NOT a toxic cyanobacteria slick. Downgraded from CRITICAL to MODERATE. No public recreation closure needed.",
            reviewed_at=(now - timedelta(days=1, hours=18)).isoformat()
        ),
        audit_trail=[
            AuditEvent(
                event_type="CITIZEN_SUBMITTED",
                actor="Tobias Lindqvist",
                details={"location": "Danube River Wetlands Inlet"},
                timestamp=(now - timedelta(days=2, hours=2)).isoformat()
            ),
            AuditEvent(
                event_type="AI_RECOMMENDATION_GENERATED",
                actor="AquaSense-Multimodal-Engine-v1",
                details={"severity": "critical", "category": "algal_bloom"},
                timestamp=(now - timedelta(days=2)).isoformat()
            ),
            AuditEvent(
                event_type="HUMAN_DECISION_COMMITTED",
                actor="Dr. Stefan Weber (rev-biologist-09)",
                details={"decision": "modified", "original_severity": "critical", "final_severity": "moderate", "reason": "AI overconfidence on duckweed vs toxic cyanobacteria"},
                timestamp=(now - timedelta(days=1, hours=18)).isoformat()
            )
        ],
        created_at=(now - timedelta(days=2, hours=2)).isoformat(),
        updated_at=(now - timedelta(days=1, hours=18)).isoformat()
    )

    for o in [obs1, obs2, obs3, obs4, obs5]:
        db.save_observation(o)

    print("Successfully seeded 5 diverse AquaSense AI observations.")
