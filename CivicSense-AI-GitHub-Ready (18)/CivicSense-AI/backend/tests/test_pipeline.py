import os
import pytest
from fastapi.testclient import TestClient

os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from app.main import app
from app.database.session import SessionLocal, Base, engine
from app.routes.departments import seed_default_departments
from app.routes.auth import ensure_default_admin

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_default_departments(db)
    ensure_default_admin(db)
    db.close()
    with TestClient(app) as c:
        yield c

shared_context = {}

def test_01_submit_waterlogging_complaint(client):
    """TEST 1: Submit a new waterlogging complaint -> saved with unique tracking ID."""
    response = client.post(
        "/api/v1/complaints",
        data={
            "title": "Severe road waterlogging near Sony World Junction",
            "description": "Heavy stormwater accumulation after cloudburst. Pedestrians cannot cross.",
            "category": "Waterlogging",
            "address": "Sony World Junction, Koramangala, Bengaluru",
            "latitude": "12.9348",
            "longitude": "77.6269",
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "tracking_id" in data
    assert data["tracking_id"].startswith("CS-2026-")
    assert data["status"] == "Submitted"
    assert data["title"] == "Severe road waterlogging near Sony World Junction"
    shared_context["tracking_id"] = data["tracking_id"]
    shared_context["complaint_id"] = data["id"]

def test_02_verify_ai_analysis_stored(client):
    """TEST 2: Verify AI analysis output is generated and stored."""
    cid = shared_context["complaint_id"]
    response = client.get(f"/api/v1/complaints/{cid}")
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Waterlogging"
    assert data["priority"] in ["Critical", "High", "Medium", "Low"]
    assert data["priority_score"] >= 0.0
    assert data["ai_summary"] is not None
    assert len(data["ai_summary"]) > 10
    assert data["priority_explanation"] is not None

def test_03_duplicate_detection_engine(client):
    """TEST 3: Submit similar complaint near same location -> Duplicate detection identifies match."""
    response = client.post(
        "/api/v1/complaints",
        data={
            "title": "Water stagnation and flooded street near Sony World Signal",
            "description": "Massive stormwater pool near Sony World signal. Vehicles getting stuck in deep water.",
            "category": "Waterlogging",
            "address": "80 Feet Road near Sony World, Koramangala, Bengaluru",
            "latitude": "12.9349",
            "longitude": "77.6270",
        }
    )
    assert response.status_code == 201
    new_data = response.json()
    new_id = new_data["id"]

    detail_res = client.get(f"/api/v1/complaints/{new_id}")
    detail = detail_res.json()
    assert "duplicate_candidates" in detail
    assert len(detail["duplicate_candidates"]) > 0
    candidate = detail["duplicate_candidates"][0]
    assert candidate["similarity_score"] >= 0.45
    assert candidate["distance_km"] <= 1.0

def test_04_dashboard_statistics(client):
    """TEST 4: Open dashboard -> Statistics reflect actual database records."""
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "kpis" in stats
    assert stats["kpis"]["total_complaints"] >= 2
    assert stats["kpis"]["pending_complaints"] >= 1
    assert len(stats["category_distribution"]) > 0
    assert len(stats["priority_distribution"]) == 4
    assert len(stats["status_breakdown"]) == 5

def test_05_hotspot_detection(client):
    """TEST 5: Open hotspot map -> Geographic clusters detected and visible."""
    response = client.get("/api/v1/dashboard/hotspots")
    assert response.status_code == 200
    hotspots = response.json()
    assert isinstance(hotspots, list)
    if len(hotspots) > 0:
        hs = hotspots[0]
        assert "id" in hs
        assert "location_name" in hs
        assert "complaint_count" in hs
        assert "action_brief" in hs
        assert hs["complaint_count"] >= 3

def test_06_assign_complaint_to_department(client):
    """TEST 6: Assign complaint to department -> Assignment persists."""
    cid = shared_context["complaint_id"]
    depts_res = client.get("/api/v1/departments")
    depts = depts_res.json()
    drainage_dept = next((d for d in depts if "Drainage" in d["name"]), depts[0])

    response = client.patch(
        f"/api/v1/complaints/{cid}/assign",
        json={"department_id": drainage_dept["id"], "notes": "Dispatched to emergency pumping crew."}
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["department_id"] == drainage_dept["id"]
    assert updated["status"] == "Assigned"

def test_07_update_complaint_status_in_progress(client):
    """TEST 7: Update complaint to In Progress -> Status history records change."""
    cid = shared_context["complaint_id"]
    response = client.patch(
        f"/api/v1/complaints/{cid}/status",
        json={
            "new_status": "In Progress",
            "notes": "Field crew arrived on site with mobile diesel pumps.",
            "is_public": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "In Progress"

    history_res = client.get(f"/api/v1/complaints/{cid}/history")
    history = history_res.json()
    assert len(history) >= 2
    latest = history[0]
    assert latest["new_status"] == "In Progress"
    assert "mobile diesel pumps" in latest["notes"]

def test_08_citizen_tracking_portal(client):
    """TEST 8: Open citizen tracking page -> Updated status appears."""
    tracking_id = shared_context["tracking_id"]
    response = client.get(f"/api/v1/complaints/track/{tracking_id}")
    assert response.status_code == 200
    track_data = response.json()
    assert track_data["tracking_id"] == tracking_id
    assert track_data["status"] == "In Progress"
    assert track_data["department_name"] is not None
    assert len(track_data["timeline"]) >= 2

def test_09_refresh_application_data_persists(client):
    """TEST 9: Re-query backend -> All saved complaint data remains available."""
    cid = shared_context["complaint_id"]
    response = client.get(f"/api/v1/complaints/{cid}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == cid
    assert data["status"] == "In Progress"

def test_10_invalid_data_validation(client):
    """TEST 10: Submit invalid data -> Validation messages returned cleanly."""
    response = client.post(
        "/api/v1/complaints",
        data={
            "title": "a",
            "description": "short",
            "category": "Waterlogging",
            "address": "x"
        }
    )
    assert response.status_code == 400
    err = response.json()
    assert "detail" in err
