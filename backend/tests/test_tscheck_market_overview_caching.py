"""Backend coverage for market overview quota-aware caching
(criterion: Quota-aware caching is active)."""

import time


def test_market_overview_caches_snapshot_within_60_seconds(client):
    first = client.get("/market/overview")
    assert first.status_code == 200, first.text
    first_body = first.json()

    # Immediately re-request; within the 60s cache window the backend must
    # return the identical snapshot (same as_of) rather than re-hitting the provider.
    second = client.get("/market/overview")
    assert second.status_code == 200, second.text
    second_body = second.json()

    assert second_body["as_of"] == first_body["as_of"], (first_body["as_of"], second_body["as_of"])
    assert second_body["source"] == first_body["source"]
    assert second_body["quotes"] == first_body["quotes"]

    # API remains responsive while serving the cached snapshot.
    start = time.monotonic()
    third = client.get("/market/overview")
    elapsed = time.monotonic() - start
    assert third.status_code == 200
    assert elapsed < 5
