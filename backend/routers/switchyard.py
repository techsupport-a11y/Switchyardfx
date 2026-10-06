import asyncio
import html
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
RESEND_URL = "https://api.resend.com/emails"
SUBMISSION_LABELS = {"contact": "Contact enquiry", "newsletter": "Newsletter sign-up", "hedge-guide": "Hedge Policy Guide request"}
MARKET_SYMBOLS = ("AUD/USD", "AUD/EUR", "AUD/GBP")
FALLBACK_CANDLES = [
    0.6504, 0.6508, 0.6502, 0.6511, 0.6515, 0.6509, 0.6518, 0.6522,
    0.6517, 0.6525, 0.6521, 0.6516, 0.6528, 0.6531, 0.6526, 0.6534,
    0.6530, 0.6524, 0.6519, 0.6527, 0.6535, 0.6532, 0.6528, 0.6538,
    0.6541, 0.6536, 0.6544, 0.6540, 0.6547, 0.6543, 0.6549, 0.6552,
]
# Twelve Data's free plan allows 800 credits/day and each refresh costs 4 (3 quotes + 1
# series), so live data is reused for 10 minutes (≤576 credits/day per warm instance).
# Fallbacks expire sooner so live prices return quickly after an outage or rate limit.
LIVE_CACHE_SECONDS = 600
FALLBACK_CACHE_SECONDS = 60
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
    if _market_cache:
        cached_at, cached = _market_cache
        ttl = LIVE_CACHE_SECONDS if cached.source == "live" else FALLBACK_CACHE_SECONDS
        if now_monotonic - cached_at < ttl:
            return cached

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
    await _notify_submission(input, doc["email"], received_at)
    return SubmissionResponse(ok=True, id=str(result.inserted_id), received_at=received_at)


async def _notify_submission(input: SubmissionCreate, email: str, received_at: datetime) -> None:
    """Email the team about a new lead via Resend. The lead is already stored, so a
    missing config or a failed send is logged and never fails the request."""
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    recipients = [addr.strip() for addr in os.environ.get("NOTIFY_EMAIL_TO", "").split(",") if addr.strip()]
    if not api_key or not recipients:
        return
    sender = os.environ.get("NOTIFY_EMAIL_FROM", "").strip() or "SwitchYard FX <onboarding@resend.dev>"
    label = SUBMISSION_LABELS.get(input.kind, input.kind)
    fields = [
        ("Type", label),
        ("Name", input.name),
        ("Email", email),
        ("Company", input.company),
        ("Phone", input.phone),
        ("Role", input.role),
        ("Annual FX volume", input.annual_fx_volume),
        ("Newsletter cadence", input.cadence),
        ("Message", input.message),
        ("Language", input.locale),
        ("Received", received_at.strftime("%d %b %Y, %H:%M UTC")),
    ]
    rows = [(name, str(value)) for name, value in fields if value]
    text = "\n".join(f"{name}: {value}" for name, value in rows)
    table = "".join(
        f'<tr><td style="padding:6px 12px;color:#4A5A55;vertical-align:top"><b>{html.escape(name)}</b></td>'
        f'<td style="padding:6px 12px;white-space:pre-wrap">{html.escape(value)}</td></tr>'
        for name, value in rows
    )
    payload = {
        "from": sender,
        "to": recipients,
        "reply_to": email,
        "subject": f"New {label.lower()}: {input.name or email}",
        "text": text,
        "html": f'<h2 style="color:#12261F">New {html.escape(label.lower())}</h2><table>{table}</table>',
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as http:
            response = await http.post(RESEND_URL, json=payload, headers={"Authorization": f"Bearer {api_key}"})
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.warning("Lead notification email rejected by Resend (%s): %s", exc.response.status_code, exc.response.text[:300])
    except httpx.HTTPError as exc:
        logger.warning("Lead notification email failed (%s)", type(exc).__name__)