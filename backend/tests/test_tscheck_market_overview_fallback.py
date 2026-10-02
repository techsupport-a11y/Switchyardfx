"""Backend coverage for the explicit fallback contract
(criterion: Fallback behavior is explicit and contract-safe).

The running backend currently has a working TWELVE_DATA_API_KEY, so a genuine
provider failure/429 cannot be forced against the live server over HTTP without
restarting it with different credentials (out of scope for this suite). The
fallback path is a deterministic, side-effect-free pure function
(`_fallback_market`) with no DB/app wiring, so we import and exercise it
directly to validate the exact contract shape the frontend service renders
with an INDICATIVE badge: source=fallback, provider='Indicative fallback',
three quotes, candles, and a non-empty warning string.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "routers", ".."))

from routers.switchyard import _fallback_market  # noqa: E402


def test_fallback_market_contract_is_explicit_and_safe():
    result = _fallback_market("Live market data is temporarily unavailable; showing indicative values.")

    assert result.source == "fallback"
    assert result.provider == "Indicative fallback"
    assert result.warning and "indicative" in result.warning.lower()

    pairs = {q.pair for q in result.quotes}
    assert pairs == {"AUD/USD", "AUD/EUR", "AUD/GBP"}
    assert len(result.quotes) == 3

    assert len(result.candles) >= 4
    for candle in result.candles:
        assert isinstance(candle.close, float)
