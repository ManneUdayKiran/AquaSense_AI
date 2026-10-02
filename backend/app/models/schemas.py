from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Guided Citizen Form Attributes
class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude")

class GuidedQuestions(BaseModel):
    water_odor: Literal["none", "musty_earthy", "sewage_foul", "chemical_petroleum", "chlorine"] = "none"
    water_clarity: Literal["crystal_clear", "slightly_turbid", "milky_cloudy", "opaque_muddy", "discolored_black_green"] = "crystal_clear"
    water_flow: Literal["fast_flowing", "moderate", "slow_trickle", "stagnant"] = "moderate"
    surface_appearance: Literal["clear", "oily_sheen", "dense_foam", "green_algal_film", "floating_trash"] = "clear"
    bank_condition: Literal["natural_vegetated", "partially_eroded", "severe_erosion", "concrete_canal"] = "natural_vegetated"
    surrounding_land_use: Literal["urban_park", "residential", "commercial_industrial", "construction_site", "agricultural"] = "urban_park"

# Citizen Observation Submission
class CitizenObservationCreate(BaseModel):
    observer_name: str = Field(default="Anonymous Citizen", min_length=2)
    location_name: str = Field(..., min_length=3, description="Name or landmark of the water body")
    coordinates: Coordinates
    description: str = Field(..., min_length=10, description="Citizen narrative description of observation")
    guided_answers: GuidedQuestions = Field(default_factory=GuidedQuestions)
    photo_filename: Optional[str] = None
    photo_url: Optional[str] = None

# Structured AI Assessment Schema (matches Blueprint Section 7)
class AIAssessment(BaseModel):
    category: Literal[
        "water_quality",
        "macroinvertebrate_habitat",
        "plastic_debris",
        "algal_bloom",
        "illegal_discharge",
        "bank_erosion",
        "normal_baseline"
    ] = "water_quality"
    severity: Literal["low", "moderate", "high", "critical"] = "moderate"
    confidence: float = Field(..., ge=0.0, le=1.0, description="Calculated confidence score based on verifiable evidence")
    observed_signals: List[str] = Field(default_factory=list, description="Directly observable visual and descriptive signals")
    evidence: List[str] = Field(default_factory=list, description="Factual supporting points from input and image")
    missing_information: List[str] = Field(default_factory=list, description="Missing laboratory or field parameters needed for certainty")
    uncertainty: List[str] = Field(default_factory=list, description="Disclaimers regarding limits of photographic/visual assessment")
    recommendation: str = Field(..., description="Actionable recommendation for human reviewer triage")
    sources: List[str] = Field(default_factory=list, description="Cited OneAquaHealth indicator protocols and guidance")
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Deterministic Validation Engine Result (Blueprint Section 8)
class ValidationResult(BaseModel):
    passed: bool
    schema_valid: bool = True
    evidence_sufficient: bool = True
    contradiction_detected: bool = False
    unsupported_claims_detected: bool = False
    flags: List[str] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    unsupported_claims: List[str] = Field(default_factory=list)
    evidence_score: float = Field(default=1.0, ge=0.0, le=1.0)
    escalation_required: bool = False
    escalation_reasons: List[str] = Field(default_factory=list)
    validated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Human Review Decision (Blueprint Section 10)
class HumanReviewDecision(BaseModel):
    reviewer_id: str = Field(default="reviewer-01")
    reviewer_name: str = Field(default="Municipal Aquatic Specialist")
    decision: Literal["approved", "modified", "rejected"]
    final_category: str
    final_severity: Literal["low", "moderate", "high", "critical"]
    decision_notes: str = Field(..., min_length=3, description="Justification for approval, modification or rejection")
    reviewed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Immutable Audit Trail Item
class AuditEvent(BaseModel):
    event_type: Literal[
        "CITIZEN_SUBMITTED",
        "AI_RECOMMENDATION_GENERATED",
        "VALIDATION_ENGINE_EVALUATED",
        "HUMAN_DECISION_COMMITTED",
        "ESCALATION_DISPATCHED"
    ]
    actor: str
    details: Dict[str, Any]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Full Observation Entity in Database
class Observation(BaseModel):
    id: str
    citizen_input: CitizenObservationCreate
    status: Literal["pending_review", "under_investigation", "approved", "modified", "rejected"] = "pending_review"
    ai_assessment: Optional[AIAssessment] = None
    validation_result: Optional[ValidationResult] = None
    human_review: Optional[HumanReviewDecision] = None
    audit_trail: List[AuditEvent] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# RAG Knowledge Item
class KnowledgeItem(BaseModel):
    id: str
    title: str
    protocol_code: str
    category: str
    content: str
    key_indicators: List[str]
    thresholds: Dict[str, str]
    recommended_actions: List[str]
    source_document: str

# Analytics Response Schema
class AnalyticsSummary(BaseModel):
    total_observations: int
    pending_count: int
    approved_count: int
    modified_count: int
    rejected_count: int
    validation_pass_rate: float
    unsupported_claim_block_count: int
    contradiction_flag_count: int
    human_agreement_rate: float
    severity_breakdown: Dict[str, int]
    category_breakdown: Dict[str, int]
    average_confidence: float
