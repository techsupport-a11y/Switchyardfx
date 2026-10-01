"""Backend coverage for POST /api/submissions (criterion: lead capture persistence)."""
import uuid


def unique_email(prefix: str) -> str:
    return f"tscheck-{prefix}-{uuid.uuid4().hex[:8]}@example.com"


def test_submission_with_consent_is_created(client):
    payload = {
        "kind": "newsletter",
        "email": unique_email("newsletter"),
        "role": "CFO / Finance Director",
        "cadence": "weekly",
        "locale": "en",
        "consent": True,
    }
    resp = client.post("/submissions", json=payload)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["ok"] is True
    assert "id" in body and body["id"]
    assert "received_at" in body


def test_submission_without_consent_is_rejected(client):
    payload = {
        "kind": "contact",
        "email": unique_email("contact-noconsent"),
        "consent": False,
    }
    resp = client.post("/submissions", json=payload)
    assert resp.status_code == 400, resp.text
    assert "consent" in resp.json()["detail"].lower()
