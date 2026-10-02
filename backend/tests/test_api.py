# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.seed_data import populate_seed_data

@pytest.fixture(autouse=True)
def setup_test_db():
    populate_seed_data()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AI recommends" in data["core_principle"]

def test_list_observations():
    response = client.get("/api/observations")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 1

def test_submit_observation_workflow():
    payload = {
        "observer_name": "Test Citizen",
        "location_name": "River Test Outfall",
        "latitude": "40.7128",
        "longitude": "-74.0060",
        "description": "Observed white soap suds and bubbles floating down the canal bank.",
        "guided_answers_json": '{"water_odor": "chemical_petroleum", "surface_appearance": "dense_foam"}'
    }
    response = client.post("/api/observations", data=payload)
    assert response.status_code == 200
    data = response.json()
    obs_id = data["id"]
    assert obs_id.startswith("obs-")
    assert data["status"] == "pending_review"
    assert data["ai_assessment"] is not None
    assert data["validation_result"] is not None
    assert len(data["audit_trail"]) >= 3

    # Now test Human-in-the-Loop Review
    review_payload = {
        "reviewer_id": "rev-test-42",
        "reviewer_name": "Senior Limnologist",
        "decision": "approved",
        "final_category": "water_quality",
        "final_severity": "high",
        "decision_notes": "Confirmed detergent discharge from storm culvert."
    }
    rev_response = client.post(f"/api/review/{obs_id}/decision", json=review_payload)
    assert rev_response.status_code == 200
    rev_data = rev_response.json()
    assert rev_data["status"] == "approved"
    assert rev_data["human_review"]["decision"] == "approved"
    assert any(e["event_type"] == "HUMAN_DECISION_COMMITTED" for e in rev_data["audit_trail"])

def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_observations" in data
    assert "validation_pass_rate" in data
    assert "human_agreement_rate" in data

    # Test GET /api/analytics
    res_root = client.get("/api/analytics")
    assert res_root.status_code == 200
    assert res_root.json()["total_observations"] == data["total_observations"]

def test_observation_sub_endpoints():
    # 1. Fetch an existing observation
    obs_list = client.get("/api/observations").json()
    assert len(obs_list) > 0
    obs_id = obs_list[0]["id"]

    # 2. GET /api/observations/{id}/analysis
    res_analysis = client.get(f"/api/observations/{obs_id}/analysis")
    assert res_analysis.status_code == 200
    assert "severity" in res_analysis.json()

    # 3. POST /api/observations/{id}/validate
    res_validate = client.post(f"/api/observations/{obs_id}/validate")
    assert res_validate.status_code == 200
    val_data = res_validate.json()
    assert "passed" in val_data
    assert "evidence_score" in val_data

    # 4. POST /api/observations/{id}/analyze
    res_analyze = client.post(f"/api/observations/{obs_id}/analyze")
    assert res_analyze.status_code == 200
    assert res_analyze.json()["ai_assessment"] is not None

    # 5. POST /api/observations/{id}/review
    review_payload = {
        "reviewer_id": "rev-test-88",
        "reviewer_name": "Catchment Officer",
        "decision": "modified",
        "final_category": "algal_bloom",
        "final_severity": "moderate",
        "decision_notes": "Expert override after visual confirmation of microcystis film."
    }
    res_review = client.post(f"/api/observations/{obs_id}/review", json=review_payload)
    assert res_review.status_code == 200
    assert res_review.json()["status"] == "modified"

    # 6. GET /api/observations/{id}/audit
    res_audit = client.get(f"/api/observations/{obs_id}/audit")
    assert res_audit.status_code == 200
    audit_events = res_audit.json()
    assert isinstance(audit_events, list)
    assert any(e["event_type"] == "HUMAN_DECISION_COMMITTED" for e in audit_events)

