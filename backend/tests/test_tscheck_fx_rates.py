"""Backend coverage for GET /api/fx/rates (criterion: live rates / FX strip)."""


def test_fx_rates_returns_three_aud_pairs(client):
    resp = client.get("/fx/rates")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["base"] == "AUD"
    assert len(body["rates"]) == 3
    pairs = {row["pair"] for row in body["rates"]}
    assert pairs == {"AUD/USD", "AUD/EUR", "AUD/GBP"}
    for row in body["rates"]:
        assert row["source"] in ("live", "fallback")
        assert isinstance(row["rate"], float)
