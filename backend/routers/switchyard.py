import logging
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Query

from lib.db import db
from models.switchyard import FxRate, FxRatesResponse, SubmissionCreate, SubmissionResponse


router = APIRouter()
logger = logging.getLogger(__name__)

FALLBACK_RATES = {
    "USD": (0.6512, 0.48),
    "EUR": (0.6018, -0.27),
    "GBP": (0.5129, 0.92),
}


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