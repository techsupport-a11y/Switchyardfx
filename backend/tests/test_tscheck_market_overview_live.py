"""Backend coverage for GET /api/market/overview live contract
(criterion: Twelve Data market overview endpoint returns the synchronized live contract)."""


def test_market_overview_returns_live_contract(client):
    resp = client.get("/market/overview")
    assert resp.status_code == 200, resp.text
    body = resp.json()

    assert body["source"] == "live", body
    assert body["provider"] == "Twelve Data", body

    pairs = {row["pair"] for row in body["quotes"]}
    assert pairs == {"AUD/USD", "AUD/EUR", "AUD/GBP"}, pairs
    for row in body["quotes"]:
        assert isinstance(row["rate"], (int, float))
        assert isinstance(row["change"], (int, float))

    candles = body["candles"]
    assert len(candles) >= 4
    closes = [c["close"] for c in candles]
    assert all(isinstance(c, (int, float)) for c in closes)
    # Candles are chronologically ascending (oldest -> newest timestamp order), not
    # necessarily monotonically increasing in price; validate timestamps are ascending.
    timestamps = [c["timestamp"] for c in candles]
    assert timestamps == sorted(timestamps)
