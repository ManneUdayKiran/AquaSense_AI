# 🌊 AquaSense AI
### Track 3 — AI-Supported Assessment • OneAquaHealth Platform MVP

> **Core Principle:**  
> **AI recommends • Evidence supports • Validation checks • Humans decide**

---

## 📌 1. Executive Summary

**AquaSense AI** is an explainable, human-in-the-loop diagnostic and assessment platform for citizen observations of urban aquatic ecosystems. Built for the **OneAquaHealth Track 3 Challenge**, AquaSense AI addresses the core vulnerability of ungrounded LLMs: hallucinating invisible chemical values, overconfidence, and lack of accountability.

A citizen submits narrative text, guided ecological parameters, geolocation, and photographic evidence. AquaSense AI scans macroscopic visual signals, retrieves authoritative OneAquaHealth protocols via RAG, generates a structured assessment recommendation with explicit uncertainty boundaries, and runs the output through a **deterministic validation engine** (catching contradictions and intercepting unsupported chemical assertions). Finally, a certified limnologist or catchment specialist reviews, modifies, or approves the recommendation, committing the decision to an **immutable audit trail**.

---

## 🔍 2. Real-World Issues Addressed

| Real-World Challenge | How AquaSense AI Solves It |
| :--- | :--- |
| **Unstructured Citizen Reports** | Guided structured fields (odor, clarity, flow, bank condition) combined with AI signal extraction. |
| **Images Difficult to Review at Scale** | Multimodal perception automatically flags macroscopic visible cues (froth, trash, scums, erosion). |
| **AI Hallucinations / Unsupported Claims** | **Deterministic Validation Shield** blocks ungrounded chemical/microbial claims (e.g., E. coli, lead, exact pH) from photos alone. |
| **Contradictory Observations** | Rule engine cross-references citizen survey answers with AI signals (e.g., "crystal clear" vs "severe turbidity"). |
| **AI Overconfidence** | Confidence scores calculated from verifiable evidence count and penalized by validation flags. |
| **Black-Box Recommendations** | Full Explainability Panel exposes observed signals, supporting evidence, scientific uncertainties, and missing info. |
| **AI Replacing Human Judgment** | **Human-in-the-Loop console** empowers specialists to Approve, Modify (with mandatory rationale), or Reject. |
| **Poor Scientific Auditability** | Immutable event timeline preserves original citizen input, model recommendation, validation events, and final human decision. |

---

## 🏗️ 3. High-Level System Architecture

```text
  CITIZEN SCIENTIST
         │
         ▼  (Photo + GPS + Guided Ecological Survey + Narrative)
 ┌──────────────────────────────────────────────────────────────┐
 │               REACT + VITE GLASSMORPHIC UI                   │
 └──────────────────────────────┬───────────────────────────────┘
                                │  HTTP REST / Multipart
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     FASTAPI BACKEND                          │
 │  ┌────────────────────────────────────────────────────────┐  │
 │  │ 1. Multimodal Perception Service                       │  │
 │  │    • Scans macroscopic visual features                 │  │
 │  │    • Groq Vision / Gemini / Grounded Perception Engine │  │
 │  └───────────────────────────┬────────────────────────────┘  │
 │                              ▼                               │
 │  ┌────────────────────────────────────────────────────────┐  │
 │  │ 2. OneAquaHealth Vector RAG Service                    │  │
 │  │    • Semantic TF-IDF & Cosine Similarity               │  │
 │  │    • Curated protocols, indicators & SWAI standards    │  │
 │  └───────────────────────────┬────────────────────────────┘  │
 │                              ▼                               │
 │  ┌────────────────────────────────────────────────────────┐  │
 │  │ 3. Deterministic Validation Engine (Rule Guard)        │  │
 │  │    • Pydantic schema validation                        │  │
 │  │    • Unsupported lab claims filter (E. coli, pH, lead) │  │
 │  │    • Contradiction detection (clarity/odor conflicts)  │  │
 │  │    • Required evidence sufficiency check               │  │
 │  └───────────────────────────┬────────────────────────────┘  │
 │                              ▼                               │
 │  ┌────────────────────────────────────────────────────────┐  │
 │  │ 4. Human-in-the-Loop Review Console                    │  │
 │  │    • Approve / Modify / Reject with justification note │  │
 │  └───────────────────────────┬────────────────────────────┘  │
 │                              ▼                               │
 │  ┌────────────────────────────────────────────────────────┐  │
 │  │ 5. Immutable Audit Trail & Analytics                   │  │
 │  │    • MongoDB Atlas or Zero-Dependency Local Store      │  │
 │  │    • Real-time validation shield & agreement metrics   │  │
 │  └────────────────────────────────────────────────────────┘  │
 └──────────────────────────────────────────────────────────────┘
```

---

## 🛡️ 4. Deterministic Validation Strategy

The validation engine executes deterministic checks **before** presenting recommendations to human specialists:

1. **Schema Integrity:** Enforces categorical taxonomy (`low`, `moderate`, `high`, `critical`) and bounded confidence `[0.0, 1.0]`.
2. **Unsupported Laboratory Claim Interception:**  
   *OneAquaHealth Guideline 8 Constraint:* AI models cannot diagnose invisible chemical or microbial properties from photographs. The engine intercepts and flags terms such as `E. coli`, `coliform`, `pH 4.5`, `dissolved oxygen 2mg/L`, `heavy metals`, and `lead concentration`.
3. **Contradiction Detection:**  
   Cross-references citizen's guided answers with AI signals:
   - Citizen reports `crystal_clear` water &rarr; AI claims severe turbidity &rarr; **FLAGGED CONTRADICTION**.
   - Citizen reports `fast_flowing` water &rarr; AI claims stagnant anoxic pool &rarr; **FLAGGED CONTRADICTION**.
   - Citizen reports `none` for odor &rarr; AI claims raw sewage disaster &rarr; **FLAGGED CONTRADICTION**.
4. **Required Evidence Sufficiency:**  
   Any `high` or `critical` severity recommendation **mandates at least two distinct factual evidence items**. If lacking, confidence is docked and human review escalation is triggered.
5. **Human Escalation Trigger:**  
   Mandatory escalation is flagged if confidence `< 0.65`, severity is high/critical, or validation issues are intercepted.

---

## 📚 5. OneAquaHealth RAG Knowledge Base

AquaSense AI indexes official OneAquaHealth protocols and guidelines:
- **OAH-WQ-SURF-01:** Urban Stream Surface Foam & Surfactant Triage (MBAS detergent identification).
- **OAH-ECO-ALGAE-02:** Visual Assessment of Cyanobacteria & Eutrophic Algal Blooms (Microcystin disclaimers).
- **OAH-WAS-SWAI-03:** Solid Waste & Macroplastic Accumulation Index (SWAI reach density).
- **OAH-WQ-TURB-04:** Visual Water Turbidity & Suspended Solids Classification (Secchi equivalent).
- **OAH-DIS-ILLEGAL-05:** Illicit Discharge & Pipe Outfall Triage (Dry-weather flow cadastre).
- **OAH-BIO-HAB-06:** Benthic Macroinvertebrate Habitat & Bank Integrity (BMWP / ASPT indicators).
- **OAH-DIS-OIL-07:** Hydrocarbon Sheen vs Natural Biogenic Iron Biofilm Differentiation.
- **OAH-VAL-SAFETY-08:** Photographic Limitations & Certified Laboratory Validation Mandate.

---

## 🎯 6. 3–5 Minute Demonstration Story

Follow this step-by-step walkthrough to experience the end-to-end platform:

1. **Explore the Review Queue:**  
   Navigate to the **Review Queue** tab. Notice the pre-loaded seed observations across European and international catchments (Regent's Canal, Willow Creek, Charles River, Seine Tributary).
2. **Examine a Validation Interception (Unsupported Claim):**  
   Click on the **Industrial Canal Basin** observation (`obs-oah-103`).  
   - Observe how the **Deterministic Validation Engine** intercepted an unsupported laboratory assertion (`E. coli` and `heavy metals`), flagged it with an amber badge, and downgraded the evidence score.
3. **Examine a Contradiction Catch:**  
   Click on **Willow Creek Reserve** (`obs-oah-102`).  
   - Observe how the rule engine caught a conflict between the citizen's report ("crystal clear") and an AI shadow misinterpretation ("severe turbidity"), triggering mandatory human escalation.
4. **Submit a New Citizen Observation:**  
   Click **Submit Observation** and select **Scenario A (Detergent Foam Outfall)** from the Quick Demo Presets.  
   - Click **Analyze & Submit**. The system processes the image, retrieves Protocol 1 from RAG, validates the schema, logs the audit trail, and immediately opens the Assessment Workspace.
5. **Act as the Limnologist (Human Decision):**  
   In the **Specialist Review Console**, choose **Modify** or **Approve**.  
   - Change the severity, enter your expert decision notes (e.g. *"Photographic evidence confirms surfactant froth; municipal cleanup boom dispatched"*), and click **Commit Human Decision**.
   - Watch the **Immutable Audit Trail** update in real-time.
6. **Inspect Catchment Map & Analytics Shield:**  
   - Switch to the **Catchment Map** to see color-coded geographic markers.
   - Switch to **Analytics & Shield** to inspect the 92% Human Agreement Rate and the counter of intercepted claims.

---

## 💻 7. Tech Stack & Directory Structure

- **Backend:** Python 3.11, FastAPI, Pydantic v2, Scikit-learn (RAG TF-IDF & Cosine Similarity), PyMongo (MongoDB Atlas with atomic local JSON fallback), Pillow, Pytest.
- **Frontend:** React 18, Vite, Leaflet & React-Leaflet, Lucide Icons, Glassmorphism CSS Design System.
- **Deployment:** Docker & Docker Compose.

```text
AquaSense-AI/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (observations, assessment, review, rag, analytics)
│   │   ├── core/            # Configuration and resilient database repository
│   │   ├── models/          # Strict Pydantic schemas (AIAssessment, ValidationResult, etc.)
│   │   ├── services/        # AI perception, RAG retriever, rule engine, audit logger, seed data
│   │   ├── data/            # OneAquaHealth knowledge base JSON
│   │   ├── uploads/         # Uploaded stream photos
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # 10 Pytest unit & integration tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, CitizenPortal, ReviewerDashboard, AssessmentWorkspace,
│   │   │                    # InteractiveMap, AnalyticsHub, KnowledgeExplorer
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # View orchestrator
│   │   └── index.css        # Ocean dark theme design system
│   ├── Dockerfile
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🚀 8. Quickstart Guide

### Option 1: Native Run (Local Development)

#### 1. Backend Setup
```bash
cd backend
# (Optional) Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python run.py
```
*Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

### Option 2: Run with Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 9. Running Tests

AquaSense AI includes a complete Pytest suite covering Pydantic validation, contradiction detection, unsupported-claim blocking, RAG retrieval, and full API lifecycle:

```bash
cd backend
python -m pytest tests/ -v
```

**Test Output:**
```text
tests/test_api.py::test_health_endpoint PASSED                           [ 10%]
tests/test_api.py::test_list_observations PASSED                         [ 20%]
tests/test_api.py::test_submit_observation_workflow PASSED               [ 30%]
tests/test_api.py::test_analytics_summary PASSED                         [ 40%]
tests/test_rag.py::test_rag_knowledge_indexing PASSED                    [ 50%]
tests/test_rag.py::test_rag_search_relevance PASSED                      [ 60%]
tests/test_rag.py::test_rag_citations_generation PASSED                  [ 70%]
tests/test_validation.py::test_unsupported_laboratory_claim_blocked PASSED [ 80%]
tests/test_validation.py::test_contradiction_detection PASSED            [ 90%]
tests/test_validation.py::test_evidence_sufficiency_for_high_severity PASSED [100%]
============================== 10 passed in 2.91s ==============================
```

---

## 🏆 10. Hackathon Track 3 Alignment

- **Grounded AI Assistant:** Translates subjective citizen input into structured, scientifically bounded assessments.
- **Scientific Guardrails:** Deterministic engine prevents LLM hallucinations of laboratory metrics.
- **Human Agency Respected:** Human reviewer explicitly retains final decision authority with an audit trail demonstrating AI did not replace human judgment.
