import asyncio
import logging
import os
import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Query

from lib.db import db
from models.switchyard import FxRate, FxRatesResponse, MarketCandle, MarketOverviewResponse, MarketQuote, SubmissionCreate, SubmissionResponse


router = APIRouter()
logger = logging.getLogger(__name__)

FALLBACK_RATES = {
    "USD": (0.6512, 0.48),
    "EUR": (0.6018, -0.27),
    "GBP": (0.5129, 0.92),
}
TWELVE_DATA_URL = "https://api.twelvedata.com"
MARKET_SYMBOLS = ("AUD/USD", "AUD/EUR", "AUD/GBP")
FALLBACK_CANDLES = [
    0.6504, 0.6508, 0.6502, 0.6511, 0.6515, 0.6509, 0.6518, 0.6522,
    0.6517, 0.6525, 0.6521, 0.6516, 0.6528, 0.6531, 0.6526, 0.6534,
    0.6530, 0.6524, 0.6519, 0.6527, 0.6535, 0.6532, 0.6528, 0.6538,
    0.6541, 0.6536, 0.6544, 0.6540, 0.6547, 0.6543, 0.6549, 0.6552,
]
_market_cache: tuple[float, MarketOverviewResponse] | None = None


def _fallback_market(warning: str) -> MarketOverviewResponse:
    now = datetime.now(timezone.utc)
    quotes = [
        MarketQuote(pair=f"AUD/{quote}", rate=rate, change=change)
        for quote, (rate, change) in FALLBACK_RATES.items()
    ]
    candles = [
        MarketCandle(timestamp=f"{index * 15:04d}", close=value)
        for index, value in enumerate(FALLBACK_CANDLES)
    ]
    return MarketOverviewResponse(
        source="fallback",
        provider="Indicative fallback",
        as_of=now.isoformat(),
        quotes=quotes,
        candles=candles,
        warning=warning,
    )


def _parse_quote_payload(payload: dict) -> list[MarketQuote]:
    quotes: list[MarketQuote] = []
    for symbol in MARKET_SYMBOLS:
        row = payload.get(symbol)
        if not isinstance(row, dict):
            continue
        price = row.get("close") or row.get("price")
        percent_change = row.get("percent_change") or row.get("change") or 0
        if price is not None:
            quotes.append(MarketQuote(pair=symbol, rate=float(price), change=float(percent_change)))
    return quotes


@router.get("/market/overview", response_model=MarketOverviewResponse)
async def get_market_overview():
    global _market_cache
    now_monotonic = time.monotonic()
    if _market_cache and now_monotonic - _market_cache[0] < 60:
        return _market_cache[1]

    api_key = os.environ.get("TWELVE_DATA_API_KEY", "").strip()
    if not api_key:
        return _fallback_market("Live market key is not configured; showing indicative values.")

    try:
        async with httpx.AsyncClient(timeout=8.0) as http:
            quote_response, chart_response = await asyncio.gather(
                http.get(
                    f"{TWELVE_DATA_URL}/quote",
                    params={"symbol": ",".join(MARKET_SYMBOLS), "dp": 6, "apikey": api_key},
                ),
                http.get(
                    f"{TWELVE_DATA_URL}/time_series",
                    params={"symbol": "AUD/USD", "interval": "15min", "outputsize": 32, "order": "ASC", "timezone": "UTC", "apikey": api_key},
                ),
            )
        if quote_response.status_code == 429 or chart_response.status_code == 429:
            result = _fallback_market("Twelve Data rate limit reached; showing indicative values.")
        else:
            quote_response.raise_for_status()
            chart_response.raise_for_status()
            quote_payload = quote_response.json()
            chart_payload = chart_response.json()
            if quote_payload.get("status") == "error" or chart_payload.get("status") == "error":
                raise ValueError("provider returned an error response")
            quotes = _parse_quote_payload(quote_payload)
            candles = [
                MarketCandle(timestamp=str(row["datetime"]), close=float(row["close"]))
                for row in chart_payload.get("values", [])
                if isinstance(row, dict) and row.get("datetime") and row.get("close")
            ]
            if len(quotes) != len(MARKET_SYMBOLS) or len(candles) < 4:
                raise ValueError("provider response was incomplete")
            result = MarketOverviewResponse(
                source="live",
                provider="Twelve Data",
                as_of=datetime.now(timezone.utc).isoformat(),
                quotes=quotes,
                candles=candles,
            )
    except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        logger.info("Twelve Data unavailable; using indicative market fallback (%s)", type(exc).__name__)
        result = _fallback_market("Live market data is temporarily unavailable; showing indicative values.")

    _market_cache = (now_monotonic, result)
    return result


@router.get("/fx/rates", response_model=FxRatesResponse)
async def get_fx_rates(
    base: str = Query(default="AUD", min_length=3, max_length=3),
    quotes: str = Query(default="USD,EUR,GBP"),
):
    base = base.upper()
    quote_codes = [code.strip().upper() for code in quotes.split(",") if code.strip()]
    quote_codes = list(dict.fromkeys(quote_codes))[:8]
    if not quote_codes:
        raise HTTPException(status_code=422, detail="At least one quote currency is required")

    live_rates: dict[str, float] = {}
    as_of = datetime.now(timezone.utc).date().isoformat()
    try:
        async with httpx.AsyncClient(timeout=3.0) as http:
            response = await http.get(
                "https://api.frankfurter.dev/v2/rates",
                params={"base": base, "quotes": ",".join(quote_codes)},
            )
            response.raise_for_status()
            payload = response.json()
        rows = payload if isinstance(payload, list) else payload.get("rates", [])
        for row in rows:
            if isinstance(row, dict) and row.get("quote") and row.get("rate"):
                live_rates[str(row["quote"]).upper()] = float(row["rate"])
                as_of = str(row.get("date", as_of))
    except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        logger.info("Frankfurter unavailable, using indicative rates: %s", exc)

    rates = []
    for quote in quote_codes:
        fallback_rate, change = FALLBACK_RATES.get(quote, (1.0, 0.0))
        rates.append(
            FxRate(
                pair=f"{base}/{quote}",
                rate=live_rates.get(quote, fallback_rate),
                change=change,
                source="live" if quote in live_rates else "fallback",
            )
        )
    return FxRatesResponse(base=base, as_of=as_of, rates=rates)


@router.post("/submissions", response_model=SubmissionResponse, status_code=201)
async def create_submission(input: SubmissionCreate):
    if not input.consent:
        raise HTTPException(status_code=400, detail="Consent is required")
    received_at = datetime.now(timezone.utc)
    doc = input.model_dump()
    doc["email"] = str(input.email).lower()
    doc["received_at"] = received_at
    result = await db.submissions.insert_one(doc)
    return SubmissionResponse(ok=True, id=str(result.inserted_id), received_at=received_at)