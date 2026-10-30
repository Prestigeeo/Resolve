import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"

def test_intake_analyze_failed_transfer():
    payload = {
        "raw_text": "I transferred 50,000 naira from GTBank to OPay with Session ID 100004241030123456789012345678 but the money no enter."
    }
    response = client.post("/api/v1/intake/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["facts"]["category"] == "FAILED_TRANSFER"
    assert float(data["facts"]["amount_ngn"]) == 50000
    assert data["facts"]["session_id_or_ref"] == "100004241030123456789012345678"

def test_emergency_ussd_codes_endpoint():
    response = client.get("/api/v1/knowledge/emergency-codes")
    assert response.status_code == 200
    codes = response.json()
    assert "GTBANK" in codes
    assert "*737*51*10#" in codes["GTBANK"]["ussd_freeze_code"]

def test_sources_endpoint():
    response = client.get("/api/v1/knowledge/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 4
    assert any("CBN" in s["publisher"] for s in sources)
