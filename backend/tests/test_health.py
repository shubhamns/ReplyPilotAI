from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_grammar_validation():
    res = client.post("/api/grammar", json={"text": ""})
    assert res.status_code == 422

def test_translate_language_allowlist():
    res = client.post("/api/translate", json={"text": "hola", "target_language": "Klingon"})
    assert res.status_code == 422
