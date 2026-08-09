from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["openai_keys_client_side"] is False

def test_grammar_requires_setup():
    res = client.post("/api/grammar", json={"text": "hello"})
    assert res.status_code == 401

def test_accounts_rejects_bad_key():
    res = client.post("/api/accounts", json={"openai_key": "not-a-real-openai-key"})
    assert res.status_code == 400

def test_translate_language_allowlist():
    res = client.post(
        "/api/translate",
        json={"text": "hola", "target_language": "Klingon"},
        headers={"X-API-Key": "bad"},
    )
    assert res.status_code in (401, 422)
