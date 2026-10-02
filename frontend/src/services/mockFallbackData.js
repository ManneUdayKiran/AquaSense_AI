// Resilient High-Fidelity LocalStorage & Mock Fallback Engine for OneAquaHealth Track 3
// Uses browser window.localStorage as a robust persistent client database.

export const MOCK_OBSERVATIONS = [
  {
    id: "obs-oah-101",
    citizen_input: {
      observer_name: "Elena Rostova",
      location_name: "Regent's Canal Urban Tributary - Culvert 4B",
      coordinates: { latitude: 51.5348, longitude: -0.1189 },
      description: "Found thick billowing white froth and soapy foam accumulating along the storm outlet. Noticeable detergent floral odor. Foam has been persisting for over 30 minutes without dissipating.",
      guided_answers: {
        water_odor: "chemical_petroleum",
        water_clarity: "milky_cloudy",
        water_flow: "moderate",
        surface_appearance: "dense_foam",
        bank_condition: "concrete_canal",
        surrounding_land_use: "residential"
      },
      photo_filename: "sample_foam_discharge.jpg",
      photo_url: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80"
    },
    status: "pending_review",
    ai_assessment: {
      category: "water_quality",
      severity: "high",
      confidence: 0.88,
      observed_signals: [
        "dense_white_foam_accumulation",
        "detergent_or_chemical_odor",
        "milky_suspended_surfactants"
      ],
      evidence: [
        "Citizen report confirms thick billowing white froth persisting >30 mins.",
        "Guided attributes indicate chemical/petroleum odor and milky opacity.",
        "Culvert outfall concrete canal setting matches graywater discharge profile."
      ],
      missing_information: [
        "Anionic surfactant (MBAS) grab sample laboratory test",
        "Upstream storm sewer cadastre tracing"
      ],
      uncertainty: [
        "Visual foam analysis cannot determine exact surfactant chemical toxicity without lab spectrometry."
      ],
      recommendation: "HUMAN SPECIALIST VERIFICATION RECOMMENDED: Dispatch field inspector to trace upstream storm sewer junction and collect grab samples for MBAS detergent testing.",
      sources: [
        "OneAquaHealth Protocol 1: Urban Stream Surface Foam & Surfactant Triage (OneAquaHealth Framework WP3: Urban Aquatic Physical-Chemical Indicators Guideline, Sec 4.1)"
      ],
      generated_at: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    validation_result: {
      passed: true,
      schema_valid: true,
      evidence_sufficient: true,
      contradiction_detected: false,
      unsupported_claims_detected: false,
      flags: [],
      contradictions: [],
      unsupported_claims: [],
      evidence_score: 0.95,
      escalation_required: true,
      escalation_reasons: ["Assessment rated 'HIGH' mandates human review before municipal dispatch."],
      validated_at: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    human_review: null,
    audit_trail: [
      {
        event_type: "CITIZEN_SUBMITTED",
        actor: "Elena Rostova",
        details: { location: "Regent's Canal Urban Tributary - Culvert 4B", odor: "chemical_petroleum" },
        timestamp: new Date(Date.now() - 3 * 3600000 - 120000).toISOString()
      },
      {
        event_type: "AI_RECOMMENDATION_GENERATED",
        actor: "AquaSense-Multimodal-Engine-v1",
        details: { category: "water_quality", severity: "high", confidence: 0.88 },
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString()
      },
      {
        event_type: "VALIDATION_ENGINE_EVALUATED",
        actor: "AquaSense-Deterministic-Validator",
        details: { passed: true, evidence_score: 0.95, escalation_required: true },
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: "obs-oah-102",
    citizen_input: {
      observer_name: "Marcus Vance",
      location_name: "Willow Creek Nature Reserve - Bridge 2",
      coordinates: { latitude: 42.3601, longitude: -71.0589 },
      description: "The stream is completely crystal clear and transparent today. Pebbles are clearly visible on the gravel bed. Flow is calm and fresh.",
      guided_answers: {
        water_odor: "none",
        water_clarity: "crystal_clear",
        water_flow: "moderate",
        surface_appearance: "clear",
        bank_condition: "natural_vegetated",
        surrounding_land_use: "urban_park"
      },
      photo_filename: "sample_clear_stream.jpg",
      photo_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
    },
    status: "pending_review",
    ai_assessment: {
      category: "water_quality",
      severity: "high",
      confidence: 0.62,
      observed_signals: [
        "visible_turbidity_brown_clouding",
        "bed_sedimentation_risk"
      ],
      evidence: [
        "Automated shadow heuristic flagged dark area as sediment plume."
      ],
      missing_information: ["Turbidimeter NTU reading"],
      uncertainty: ["High sunlight glare and tree shadow interference over water surface."],
      recommendation: "HUMAN VERIFICATION REQUIRED: Re-examine observation due to conflicting clarity cues.",
      sources: [
        "OneAquaHealth Protocol 4: Visual Water Turbidity & Suspended Solids Classification"
      ],
      generated_at: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    validation_result: {
      passed: false,
      schema_valid: true,
      evidence_sufficient: false,
      contradiction_detected: true,
      unsupported_claims_detected: false,
      flags: ["CONTRADICTION_CLARITY_MISMATCH", "INSUFFICIENT_EVIDENCE_FOR_SEVERITY", "LOW_AI_CONFIDENCE"],
      contradictions: ["Citizen recorded 'crystal clear' water, but AI flagged severe turbidity/discoloration."],
      unsupported_claims: [],
      evidence_score: 0.45,
      escalation_required: true,
      escalation_reasons: [
        "Contradiction detected: Citizen recorded 'crystal clear' water while AI flagged severe turbidity.",
        "AI confidence (0.62) is below safety threshold (0.65)."
      ],
      validated_at: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    human_review: null,
    audit_trail: [
      {
        event_type: "CITIZEN_SUBMITTED",
        actor: "Marcus Vance",
        details: { location: "Willow Creek Nature Reserve - Bridge 2", clarity: "crystal_clear" },
        timestamp: new Date(Date.now() - 5 * 3600000 - 180000).toISOString()
      },
      {
        event_type: "AI_RECOMMENDATION_GENERATED",
        actor: "AquaSense-Multimodal-Engine-v1",
        details: { category: "water_quality", severity: "high", confidence: 0.62 },
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        event_type: "VALIDATION_ENGINE_EVALUATED",
        actor: "AquaSense-Deterministic-Validator",
        details: { passed: false, contradiction_flagged: true, evidence_score: 0.45 },
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: "obs-oah-103",
    citizen_input: {
      observer_name: "Devin Chen",
      location_name: "Industrial Canal Basin South Outfall",
      coordinates: { latitude: 52.5200, longitude: 13.4050 },
      description: "Dark oily film near the boat slip. Smells like old engine fuel or industrial waste.",
      guided_answers: {
        water_odor: "chemical_petroleum",
        water_clarity: "discolored_black_green",
        water_flow: "slow_trickle",
        surface_appearance: "oily_sheen",
        bank_condition: "concrete_canal",
        surrounding_land_use: "commercial_industrial"
      },
      photo_filename: "sample_oil_sheen.jpg",
      photo_url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80"
    },
    status: "pending_review",
    ai_assessment: {
      category: "illegal_discharge",
      severity: "critical",
      confidence: 0.74,
      observed_signals: [
        "surface_iridescence_or_rainbow_film",
        "petroleum_chemical_odor_profile"
      ],
      evidence: [
        "Citizen report indicates petroleum odor and oily film.",
        "Unvalidated assertion: high pathogen count with E. coli contamination and heavy metals detected from optical reflection."
      ],
      missing_information: ["VOC photoionization detector reading", "Certified laboratory hydrocarbon panel"],
      uncertainty: ["Image cannot confirm whether film is petroleum or natural biogenic iron biofilm."],
      recommendation: "EMERGENCY TRIAGE: Deploy absorbent boom and dispatch certified environmental inspector.",
      sources: [
        "OneAquaHealth Protocol 7: Hydrocarbon Sheen vs Natural Biofilm Differentiation",
        "OneAquaHealth Guidelines 8: Photographic Limitations & Laboratory Validation Mandate"
      ],
      generated_at: new Date(Date.now() - 7 * 3600000).toISOString()
    },
    validation_result: {
      passed: false,
      schema_valid: true,
      evidence_sufficient: true,
      contradiction_detected: false,
      unsupported_claims_detected: true,
      flags: ["UNSUPPORTED_LABORATORY_CLAIM_DETECTED"],
      contradictions: [],
      unsupported_claims: ["e. coli", "pathogen count", "heavy metals"],
      evidence_score: 0.60,
      escalation_required: true,
      escalation_reasons: [
        "AI generated unsupported laboratory chemical/biological assertions (e. coli, heavy metals) without physical lab telemetry.",
        "High severity mandates physical grab sampling confirmation."
      ],
      validated_at: new Date(Date.now() - 7 * 3600000).toISOString()
    },
    human_review: null,
    audit_trail: [
      {
        event_type: "CITIZEN_SUBMITTED",
        actor: "Devin Chen",
        details: { location: "Industrial Canal Basin South Outfall" },
        timestamp: new Date(Date.now() - 7 * 3600000 - 120000).toISOString()
      },
      {
        event_type: "AI_RECOMMENDATION_GENERATED",
        actor: "AquaSense-Multimodal-Engine-v1",
        details: { severity: "critical", unsupported_claims_present: true },
        timestamp: new Date(Date.now() - 7 * 3600000).toISOString()
      },
      {
        event_type: "VALIDATION_ENGINE_EVALUATED",
        actor: "AquaSense-Deterministic-Validator",
        details: { unsupported_claims_blocked: ["e. coli", "heavy metals"], passed: false },
        timestamp: new Date(Date.now() - 7 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 7 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 3600000).toISOString()
  },
  {
    id: "obs-oah-104",
    citizen_input: {
      observer_name: "Aisha Al-Mansoor",
      location_name: "Seine Tributary Confluence - Grate 12",
      coordinates: { latitude: 48.8566, longitude: 2.3522 },
      description: "Over 60 plastic soda bottles, styrofoam cups, and plastic grocery bags are trapped against the bridge culvert weir, causing water backflow.",
      guided_answers: {
        water_odor: "musty_earthy",
        water_clarity: "slightly_turbid",
        water_flow: "moderate",
        surface_appearance: "floating_trash",
        bank_condition: "concrete_canal",
        surrounding_land_use: "residential"
      },
      photo_filename: "sample_plastic_waste.jpg",
      photo_url: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80"
    },
    status: "approved",
    ai_assessment: {
      category: "plastic_debris",
      severity: "high",
      confidence: 0.89,
      observed_signals: [
        "floating_macroplastic_and_solid_waste",
        "culvert_hydraulic_choke_risk"
      ],
      evidence: [
        "Citizen report indicates >60 macroplastic units trapped against culvert weir.",
        "Surface appearance classified as floating_trash.",
        "Hydraulic damming risk at stream constriction."
      ],
      missing_information: ["Culvert upstream water elevation measurement"],
      uncertainty: ["Debris volume under water surface cannot be fully estimated."],
      recommendation: "DISPATCH MUNICIPAL WORK ORDER: Riparian cleanup and debris boom clearing recommended within 24 hours.",
      sources: [
        "OneAquaHealth Metric 3: Solid Waste & Macroplastic Accumulation Index (SWAI)"
      ],
      generated_at: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    validation_result: {
      passed: true,
      schema_valid: true,
      evidence_sufficient: true,
      contradiction_detected: false,
      unsupported_claims_detected: false,
      flags: [],
      contradictions: [],
      unsupported_claims: [],
      evidence_score: 0.98,
      escalation_required: true,
      escalation_reasons: ["High severity debris choke mandates municipal triage approval."],
      validated_at: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    human_review: {
      reviewer_id: "rev-specialist-04",
      reviewer_name: "Dr. Claire Dubois (Catchment Hydrologist)",
      decision: "approved",
      final_category: "plastic_debris",
      final_severity: "high",
      decision_notes: "AI assessment matches SWAI Grade 3 criteria. Photographic evidence confirms culvert choke risk. Municipal clean-up dispatch order #4492 issued.",
      reviewed_at: new Date(Date.now() - 22 * 3600000).toISOString()
    },
    audit_trail: [
      {
        event_type: "CITIZEN_SUBMITTED",
        actor: "Aisha Al-Mansoor",
        details: { location: "Seine Tributary Confluence - Grate 12" },
        timestamp: new Date(Date.now() - 25 * 3600000).toISOString()
      },
      {
        event_type: "AI_RECOMMENDATION_GENERATED",
        actor: "AquaSense-Multimodal-Engine-v1",
        details: { severity: "high", category: "plastic_debris" },
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        event_type: "VALIDATION_ENGINE_EVALUATED",
        actor: "AquaSense-Deterministic-Validator",
        details: { passed: true, score: 0.98 },
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        event_type: "HUMAN_DECISION_COMMITTED",
        actor: "Dr. Claire Dubois (rev-specialist-04)",
        details: { decision: "approved", final_severity: "high", agreement: true },
        timestamp: new Date(Date.now() - 22 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 3600000).toISOString()
  },
  {
    id: "obs-oah-105",
    citizen_input: {
      observer_name: "Tobias Lindqvist",
      location_name: "Danube River Wetlands Inlet - Km 1922",
      coordinates: { latitude: 48.2082, longitude: 16.3738 },
      description: "Green film on the inlet edge. Lots of floating plant matter and duckweed.",
      guided_answers: {
        water_odor: "musty_earthy",
        water_clarity: "slightly_turbid",
        water_flow: "slow_trickle",
        surface_appearance: "green_algal_film",
        bank_condition: "natural_vegetated",
        surrounding_land_use: "urban_park"
      },
      photo_filename: "sample_algae_duckweed.jpg",
      photo_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
    },
    status: "modified",
    ai_assessment: {
      category: "algal_bloom",
      severity: "critical",
      confidence: 0.79,
      observed_signals: [
        "green_surface_scum_or_filamentous_film",
        "stagnant_warm_flow_conditions"
      ],
      evidence: [
        "Visual indication of green surface vegetation coverage.",
        "Guided response marked green_algal_film."
      ],
      missing_information: ["Microcystin cyanotoxin laboratory ELISA assay"],
      uncertainty: ["Visual observation cannot differentiate harmless Lemna minor (duckweed) from microcystin-producing cyanobacteria."],
      recommendation: "EMERGENCY ADVISORY: Potential toxic cyanobacteria bloom alert.",
      sources: [
        "OneAquaHealth Indicator 2: Visual Assessment of Cyanobacteria & Eutrophic Algal Blooms"
      ],
      generated_at: new Date(Date.now() - 48 * 3600000).toISOString()
    },
    validation_result: {
      passed: true,
      schema_valid: true,
      evidence_sufficient: true,
      contradiction_detected: false,
      unsupported_claims_detected: false,
      flags: [],
      contradictions: [],
      unsupported_claims: [],
      evidence_score: 0.88,
      escalation_required: true,
      escalation_reasons: ["Critical severity alert requires mandatory biologist review."],
      validated_at: new Date(Date.now() - 48 * 3600000).toISOString()
    },
    human_review: {
      reviewer_id: "rev-biologist-09",
      reviewer_name: "Dr. Stefan Weber (Freshwater Ecologist)",
      decision: "modified",
      final_category: "algal_bloom",
      final_severity: "moderate",
      decision_notes: "AI was overconfident. Close inspection reveals harmless Lemna minor (common duckweed) and Spirogyra, NOT a toxic cyanobacteria slick. Downgraded from CRITICAL to MODERATE. No public recreation closure needed.",
      reviewed_at: new Date(Date.now() - 42 * 3600000).toISOString()
    },
    audit_trail: [
      {
        event_type: "CITIZEN_SUBMITTED",
        actor: "Tobias Lindqvist",
        details: { location: "Danube River Wetlands Inlet" },
        timestamp: new Date(Date.now() - 50 * 3600000).toISOString()
      },
      {
        event_type: "AI_RECOMMENDATION_GENERATED",
        actor: "AquaSense-Multimodal-Engine-v1",
        details: { severity: "critical", category: "algal_bloom" },
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString()
      },
      {
        event_type: "HUMAN_DECISION_COMMITTED",
        actor: "Dr. Stefan Weber (rev-biologist-09)",
        details: { decision: "modified", original_severity: "critical", final_severity: "moderate", reason: "AI overconfidence on duckweed vs toxic cyanobacteria" },
        timestamp: new Date(Date.now() - 42 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 50 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 42 * 3600000).toISOString()
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: "OAH-IND-01",
    protocol_code: "OAH-WQ-SURF-01",
    title: "OneAquaHealth Protocol 1: Urban Stream Surface Foam & Surfactant Triage",
    category: "water_quality",
    content: "Detergent surfactants and graywater discharges create distinctive white, billowing, cohesive foam along stream riffles, stormwater outlets, and eddy pools. Natural organic foam (decaying humic acids) is typically thin, brownish or tan-colored, and dissipates rapidly upon agitation. Thick white foam lasting >10 minutes with mild fragrance or sewage odor indicates direct greywater or industrial laundry effluent. Immediate field inspection is mandated when foam patches exceed 2 square meters near residential storm drains.",
    key_indicators: [
      "billowing white froth",
      "persistent bubbles (>10 min)",
      "detergent or soapy odor",
      "outfall pipe discharge"
    ],
    thresholds: {
      low: "Sparse natural brownish foam near natural organic debris / leaf litter",
      moderate: "Localized white foam patches (<1m2) near stormwater drain outlet",
      high: "Thick continuous white foam blanket (>2m2) accompanied by greywater clouding",
      critical: "Dense billowing foam bank (>5m) actively entering main river stem with noticeable chemical/perfumed scent"
    },
    recommended_actions: [
      "Dispatch stormwater inspector to trace upstream storm sewer junction",
      "Take grab sample for anionic surfactant (MBAS) testing",
      "Log photo evidence with GPS coordinate verification"
    ],
    source_document: "OneAquaHealth Framework WP3: Urban Aquatic Physical-Chemical Indicators Guideline, Sec 4.1"
  },
  {
    id: "OAH-IND-02",
    protocol_code: "OAH-ECO-ALGAE-02",
    title: "OneAquaHealth Indicator 2: Visual Assessment of Cyanobacteria & Eutrophic Algal Blooms",
    category: "algal_bloom",
    content: "Urban runoff rich in fertilizer phosphates and nitrates induces severe cyanobacteria (blue-green algae) proliferation and green filamentous algal mats. Cyanobacteria blooms appear like spilled pea soup, bright green paint slicks, or blue-green scums on calm waters. Filamentous green algae form submerged hair-like strands or floating green carpets. IMPORTANT LIMITATION: Photographs can document the visual presence of green surface scum or turbidity, but cannot determine microcystin or cyanotoxin concentration without laboratory ELISA or spectrometry.",
    key_indicators: [
      "bright green pea-soup surface slick",
      "blue-green scummy layer",
      "stagnant warm water body",
      "musty or septic decaying vegetation odor"
    ],
    thresholds: {
      low: "Scattered filamentous green algae clinging to rocks (<15% benthic cover)",
      moderate: "Green surface patches covering 15-40% of pond/stream surface",
      high: "Dense pea-soup cyanobacterial film covering >40% surface with visible surface scum",
      critical: "Complete blue-green scummy blanket with dead fish or severe anoxic septic odor"
    },
    recommended_actions: [
      "Issue recreational water advisory prohibiting pet and human immersion",
      "Perform microcystin cyanotoxin laboratory assay",
      "Evaluate upstream nutrient loading from urban lawn fertilizers or sewage overflows"
    ],
    source_document: "OneAquaHealth Biomonitoring Protocol: Harmful Algal Blooms in European Urban Catchments, Annex B"
  },
  {
    id: "OAH-IND-03",
    protocol_code: "OAH-WAS-SWAI-03",
    title: "OneAquaHealth Metric 3: Solid Waste & Macroplastic Accumulation Index (SWAI)",
    category: "plastic_debris",
    content: "Macroplastic pollution in urban waterways poses severe hydraulic choking risks, entangles riparian fauna, and breaks down into hazardous microplastics. SWAI protocol categorizes reaches by visible debris item count per 100-meter stream segment: Class 0 (Pristine, 0-2 items), Class 1 (Moderate, 3-15 items), Class 2 (High, 16-50 items), and Class 3 (Severe/Choked, >50 items). Culvert constrictions and bridge grates frequently serve as focal aggregation points requiring municipal debris boom deployment.",
    key_indicators: [
      "plastic beverage bottles and food wrappers",
      "styrofoam fragments",
      "trapped debris against bridge piers and culvert trash racks",
      "bank litter line deposits"
    ],
    thresholds: {
      low: "Class 0: 0-2 items per 100m reach",
      moderate: "Class 1: 3-15 items per 100m reach",
      high: "Class 2: 16-50 items per 100m reach with localized trash damming",
      critical: "Class 3: >50 items causing hydraulic blockage and localized water backup"
    },
    recommended_actions: [
      "Trigger targeted municipal riparian cleanup task order",
      "Install floating litter boom upstream of critical culvert intake",
      "Log item category breakdown into European Macroplastic Monitoring Database"
    ],
    source_document: "OneAquaHealth Citizen Science Manual: Macroplastic & Solid Waste Monitoring in Urban Watercourses"
  },
  {
    id: "OAH-IND-04",
    protocol_code: "OAH-WQ-TURB-04",
    title: "OneAquaHealth Protocol 4: Visual Water Turbidity & Suspended Solids Classification",
    category: "water_quality",
    content: "Stream water transparency directly reflects soil erosion, construction sediment runoff, or combined sewer overflow (CSO) discharge. Optical classification: 'Crystal Clear' allows benthic substrate pebbles to be seen clearly up to 1 meter depth. 'Slightly Turbid' has faint cloudiness. 'Milky Cloudy' indicates suspended chemical emulsion or detergent. 'Opaque Muddy' indicates severe mineral silt or clay erosion. Automated computer vision models must verify sunlight reflection angle to avoid misidentifying deep shadow zones as sediment plumes.",
    key_indicators: [
      "loss of benthic pebble visibility",
      "brown, reddish, or tan water coloration",
      "construction site runoff outfalls",
      "suspended colloidal matter"
    ],
    thresholds: {
      low: "Secchi disc equivalent >60cm; gravel substrate clearly visible",
      moderate: "Secchi depth 30-60cm; faint bottom visibility in shallow water",
      high: "Secchi depth 10-30cm; muddy opacity from recent storm runoff",
      critical: "Secchi depth <10cm; zero transparency from severe industrial silt discharge"
    },
    recommended_actions: [
      "Inspect nearby construction perimeters for missing silt fences",
      "Deploy portable turbidimeter for calibrated NTU reading",
      "Cross-check precipitation records for rainfall-induced baseline variance"
    ],
    source_document: "OneAquaHealth Standard Operating Procedure: Visual Physical Hydromorphology (SOP-HYD-04)"
  },
  {
    id: "OAH-IND-05",
    protocol_code: "OAH-DIS-ILLEGAL-05",
    title: "OneAquaHealth Guideline 5: Illicit Discharge & Pipe Outfall Triage",
    category: "illegal_discharge",
    content: "Any pipe or culvert discharging continuous flow during dry weather (>72 hours since last rain event) is considered a presumptive illicit discharge. Discharges characterized by abnormal color, chemical odors (solvents, sulfur, ammonia), or temperature anomalies must be escalated immediately. Certified tracing requires dye testing or upstream storm/sanitary manhole inspection by municipal authorities.",
    key_indicators: [
      "active dry-weather pipe flow (>72 hours without rain)",
      "discolored plume emerging from culvert",
      "sulfur, gasoline, or sewage smell",
      "staining or corrosion around pipe mouth"
    ],
    thresholds: {
      low: "Trickling flow with clear appearance and natural earth odor (groundwater seepage)",
      moderate: "Intermittent cloudiness with faint musty odor",
      high: "Continuous dry-weather flow with chemical odor or visible foam/oil plume",
      critical: "Direct industrial effluent discharge into stream channel with acute toxicity markers"
    },
    recommended_actions: [
      "Notify Municipal Environmental Protection / Drainage Authority within 4 hours",
      "Deploy containment booms if petroleum or chemical sheen is present",
      "Collect chain-of-custody grab sample for certified lab panel"
    ],
    source_document: "OneAquaHealth Urban Catchment Surveillance: Illicit Discharge Detection Manual, Chapter 5"
  }
];

export const MOCK_RULES = {
  rules: [
    {
      code: "SCHEMA_VALIDATION",
      description: "Enforces strict Pydantic categorical taxonomy (low, moderate, high, critical) and confidence boundary [0.0, 1.0]."
    },
    {
      code: "REQUIRED_EVIDENCE_CHECK",
      description: "High or critical severity recommendations require at least 2 distinct supporting evidence points."
    },
    {
      code: "CONTRADICTION_DETECTOR",
      description: "Cross-references citizen structured survey (odor, clarity, flow) with AI interpretation to catch conflicting claims."
    },
    {
      code: "UNSUPPORTED_LABORATORY_CLAIM_FILTER",
      description: "Blocks AI from claiming invisible laboratory measurements (e.g. E. coli, heavy metals, pH) from photographs alone."
    },
    {
      code: "RAG_GROUNDING_CHECK",
      description: "Verifies that AI recommendations cite official OneAquaHealth indicators and guidance."
    },
    {
      code: "HUMAN_ESCALATION_TRIGGER",
      description: "Automatically flags observations for mandatory human review when confidence < 0.65 or severity is high."
    }
  ],
  prohibited_claim_patterns: [
    "e. coli", "coliform", "enterococci", "heavy metals", "lead concentration",
    "cadmium", "chromium", "arsenic", "exact ph", "dissolved oxygen ppm"
  ]
};

// ==========================================
// PERSISTENT LOCAL STORAGE ENGINE
// ==========================================
const STORAGE_KEY_OBSERVATIONS = 'aquasense_stored_observations';

function getPersistentStore() {
  if (typeof window === 'undefined') return [...MOCK_OBSERVATIONS];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_OBSERVATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[AquaSense Storage] Could not read localStorage:", err);
  }
  // Initialize with official OneAquaHealth benchmarks
  setPersistentStore(MOCK_OBSERVATIONS);
  return [...MOCK_OBSERVATIONS];
}

function setPersistentStore(records) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_OBSERVATIONS, JSON.stringify(records));
  } catch (err) {
    console.warn("[AquaSense Storage] Could not write localStorage:", err);
  }
}

export const mockStore = {
  // Sync real backend observations into browser local storage
  syncFromBackend: (liveObservations) => {
    if (!Array.isArray(liveObservations) || liveObservations.length === 0) return;
    const current = getPersistentStore();
    // Merge live with current (live takes precedence by id)
    const map = new Map();
    current.forEach(o => map.set(o.id, o));
    liveObservations.forEach(o => map.set(o.id, o));
    const merged = Array.from(map.values());
    setPersistentStore(merged);
  },

  resetToDefaults: () => {
    setPersistentStore(MOCK_OBSERVATIONS);
    return [...MOCK_OBSERVATIONS];
  },

  getObservations: (params = {}) => {
    let result = getPersistentStore();
    if (params.status && params.status !== 'all') {
      result = result.filter(o => o.status === params.status);
    }
    if (params.severity && params.severity !== 'all') {
      result = result.filter(o => o.ai_assessment?.severity === params.severity);
    }
    return result;
  },

  getObservationById: (id) => {
    const records = getPersistentStore();
    return records.find(o => o.id === id) || null;
  },

  submitObservation: (formData) => {
    const newId = `obs-loc-${Date.now().toString(36)}`;
    const observerName = formData.get ? (formData.get('observer_name') || 'Anonymous Citizen') : 'Anonymous Citizen';
    const locationName = formData.get ? (formData.get('location_name') || 'Urban Stream Reach') : 'Urban Stream Reach';
    const description = formData.get ? (formData.get('description') || '') : '';
    const lat = formData.get ? parseFloat(formData.get('latitude') || '51.5') : 51.5;
    const lng = formData.get ? parseFloat(formData.get('longitude') || '-0.12') : -0.12;

    let guided = {};
    try {
      const raw = formData.get ? formData.get('guided_answers_json') : null;
      if (raw) guided = JSON.parse(raw);
    } catch (e) {
      guided = {};
    }

    const newObs = {
      id: newId,
      citizen_input: {
        observer_name: observerName,
        location_name: locationName,
        coordinates: { latitude: lat, longitude: lng },
        description: description,
        guided_answers: {
          water_odor: guided.water_odor || "none",
          water_clarity: guided.water_clarity || "slightly_turbid",
          water_flow: guided.water_flow || "moderate",
          surface_appearance: guided.surface_appearance || "clear",
          bank_condition: guided.bank_condition || "natural_vegetated",
          surrounding_land_use: guided.surrounding_land_use || "urban_park"
        },
        photo_filename: null,
        photo_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
      },
      status: "pending_review",
      ai_assessment: {
        category: "water_quality",
        severity: guided.surface_appearance === "dense_foam" ? "high" : "moderate",
        confidence: 0.85,
        observed_signals: ["surface_anomaly_logged", "citizen_survey_validated"],
        evidence: [
          `Citizen description: "${description.slice(0, 80)}..."`,
          `Recorded clarity: ${guided.water_clarity || 'slightly_turbid'}, appearance: ${guided.surface_appearance || 'clear'}.`
        ],
        missing_information: ["Certified laboratory grab sample"],
        uncertainty: ["Visual perception model cannot ascertain invisible chemical dissolved toxins."],
        recommendation: "ROUTINE REVIEW RECOMMENDED: Validate citizen observation against catchment baseline.",
        sources: [
          "OneAquaHealth Protocol 1: Urban Stream Surface Foam & Surfactant Triage",
          "OneAquaHealth Protocol 4: Visual Water Turbidity & Suspended Solids Classification"
        ],
        generated_at: new Date().toISOString()
      },
      validation_result: {
        passed: true,
        schema_valid: true,
        evidence_sufficient: true,
        contradiction_detected: false,
        unsupported_claims_detected: false,
        flags: [],
        contradictions: [],
        unsupported_claims: [],
        evidence_score: 0.90,
        escalation_required: false,
        escalation_reasons: [],
        validated_at: new Date().toISOString()
      },
      human_review: null,
      audit_trail: [
        {
          event_type: "CITIZEN_SUBMITTED",
          actor: observerName,
          details: { location: locationName },
          timestamp: new Date().toISOString()
        },
        {
          event_type: "AI_RECOMMENDATION_GENERATED",
          actor: "AquaSense-LocalStorage-Engine",
          details: { severity: "moderate", category: "water_quality" },
          timestamp: new Date().toISOString()
        },
        {
          event_type: "VALIDATION_ENGINE_EVALUATED",
          actor: "AquaSense-Deterministic-Validator",
          details: { passed: true, score: 0.90 },
          timestamp: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const records = getPersistentStore();
    records.unshift(newObs);
    setPersistentStore(records);
    return newObs;
  },

  submitReviewDecision: (id, decisionPayload) => {
    const records = getPersistentStore();
    const obs = records.find(o => o.id === id);
    if (!obs) throw new Error("Observation not found in local storage");

    obs.status = decisionPayload.decision === 'approved' ? 'approved' : 
                 decisionPayload.decision === 'modified' ? 'modified' : 'rejected';
    
    obs.human_review = {
      reviewer_id: decisionPayload.reviewer_id || 'rev-specialist-01',
      reviewer_name: decisionPayload.reviewer_name || 'Senior Limnologist',
      decision: decisionPayload.decision,
      final_category: decisionPayload.final_category || obs.ai_assessment?.category || 'water_quality',
      final_severity: decisionPayload.final_severity || obs.ai_assessment?.severity || 'moderate',
      decision_notes: decisionPayload.decision_notes || 'Human verification completed.',
      reviewed_at: new Date().toISOString()
    };

    obs.audit_trail.push({
      event_type: "HUMAN_DECISION_COMMITTED",
      actor: `${obs.human_review.reviewer_name} (${obs.human_review.reviewer_id})`,
      details: {
        decision: decisionPayload.decision,
        final_severity: obs.human_review.final_severity,
        notes: obs.human_review.decision_notes
      },
      timestamp: new Date().toISOString()
    });

    obs.updated_at = new Date().toISOString();
    setPersistentStore(records);
    return obs;
  },

  deleteObservation: (id) => {
    let records = getPersistentStore();
    records = records.filter(o => o.id !== id);
    setPersistentStore(records);
    return { status: "deleted", id };
  },

  reopenObservation: (id) => {
    const records = getPersistentStore();
    const obs = records.find(o => o.id === id);
    if (!obs) throw new Error("Observation not found in local storage");
    obs.status = 'pending_review';
    obs.human_review = null;
    obs.audit_trail.push({
      event_type: "OBSERVATION_REOPENED",
      actor: "Reviewer",
      details: { action: "Reopened for re-evaluation" },
      timestamp: new Date().toISOString()
    });
    setPersistentStore(records);
    return obs;
  },

  reevaluateObservation: (id) => {
    const records = getPersistentStore();
    const obs = records.find(o => o.id === id);
    if (!obs) throw new Error("Observation not found in local storage");
    obs.audit_trail.push({
      event_type: "AI_RECOMMENDATION_REGENERATED",
      actor: "AquaSense-LocalStorage-Engine",
      details: { note: "Re-evaluation simulated" },
      timestamp: new Date().toISOString()
    });
    setPersistentStore(records);
    return obs;
  },

  getAnalyticsSummary: () => {
    const records = getPersistentStore();
    const total = records.length;
    const pending = records.filter(o => o.status === 'pending_review').length;
    const approved = records.filter(o => o.status === 'approved').length;
    const modified = records.filter(o => o.status === 'modified').length;
    const rejected = records.filter(o => o.status === 'rejected').length;

    const passedVal = records.filter(o => o.validation_result?.passed).length;
    const unsupportedBlocks = records.reduce((acc, o) => acc + (o.validation_result?.unsupported_claims?.length || 0), 0);
    const contradictions = records.reduce((acc, o) => acc + (o.validation_result?.contradictions?.length || 0), 0);

    const reviewed = records.filter(o => o.human_review !== null && o.ai_assessment !== null);
    const agreed = reviewed.filter(o => o.human_review?.final_severity === o.ai_assessment?.severity).length;
    const agreementRate = reviewed.length > 0 ? Math.round((agreed / reviewed.length) * 100) : 90.0;

    const severities = { low: 0, moderate: 0, high: 0, critical: 0 };
    const categories = {};
    records.forEach(o => {
      if (o.ai_assessment?.severity) {
        severities[o.ai_assessment.severity] = (severities[o.ai_assessment.severity] || 0) + 1;
      }
      if (o.ai_assessment?.category) {
        categories[o.ai_assessment.category] = (categories[o.ai_assessment.category] || 0) + 1;
      }
    });

    return {
      total_observations: total,
      pending_count: pending,
      approved_count: approved,
      modified_count: modified,
      rejected_count: rejected,
      validation_pass_rate: total > 0 ? Math.round((passedVal / total) * 1000) / 10 : 100.0,
      unsupported_claim_block_count: unsupportedBlocks,
      contradiction_flag_count: contradictions,
      human_agreement_rate: agreementRate,
      severity_breakdown: severities,
      category_breakdown: categories,
      average_confidence: 0.82
    };
  },

  getGeospatialPoints: () => {
    const records = getPersistentStore();
    const features = records.map(o => ({
      id: o.id,
      title: o.citizen_input?.location_name || 'Observation',
      observer: o.citizen_input?.observer_name || 'Anonymous',
      latitude: o.citizen_input?.coordinates?.latitude || 50.0,
      longitude: o.citizen_input?.coordinates?.longitude || 10.0,
      status: o.status,
      category: o.ai_assessment?.category || 'water_quality',
      severity: o.ai_assessment?.severity || 'moderate',
      confidence: o.ai_assessment?.confidence || 0.8,
      recommendation: o.ai_assessment?.recommendation || '',
      photo_url: o.citizen_input?.photo_url || null,
      created_at: o.created_at
    }));
    return { features };
  },

  getDocuments: () => {
    return { count: MOCK_DOCUMENTS.length, documents: MOCK_DOCUMENTS };
  },

  searchKnowledge: (query) => {
    const q = (query || '').toLowerCase();
    const results = MOCK_DOCUMENTS.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.content.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.key_indicators.some(k => k.toLowerCase().includes(q))
    );
    return { query, results: results.length > 0 ? results : MOCK_DOCUMENTS.slice(0, 3) };
  },

  getValidationRules: () => {
    return MOCK_RULES;
  }
};
