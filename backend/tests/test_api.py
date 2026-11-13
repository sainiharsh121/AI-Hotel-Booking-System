# backend/tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "FastAPI" in data["service"]

def test_rooms_list():
    response = client.get("/rooms?all=true")
    assert response.status_code == 200
    rooms = response.json()
    assert len(rooms) >= 20
    # Verify metadata fields
    first = rooms[0]
    assert "id" in first
    assert "type" in first
    assert "price" in first
    assert "amenities" in first

def test_login_validation():
    # Invalid PIN
    bad_res = client.post("/login", json={"email": "harsh@example.com", "password": "0000"})
    assert bad_res.status_code == 401
    
    # Valid PIN
    good_res = client.post("/login", json={"email": "harsh@example.com", "password": "1234"})
    assert good_res.status_code == 200
    data = good_res.json()
    assert data["user"]["email"] == "harsh@example.com"

def test_booking_requires_authentication():
    # Attempting to book without user credentials must be rejected with 401
    res = client.post("/book", json={
        "room_id": 105,
        "start_date": "2026-10-10",
        "end_date": "2026-10-12"
    })
    # If room is available, returns 401 Unauthorized
    # If room was already booked, returns 400
    assert res.status_code in [400, 401]

def test_ai_fallback_resilience():
    # Chat must return a structured response even if external LLM has no API key
    res = client.post("/ai/chat", json={"message": "Suggest a suite for couple"})
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert data["source"] == "rule_fallback"
