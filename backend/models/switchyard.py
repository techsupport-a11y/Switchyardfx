from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


SubmissionKind = Literal["contact", "newsletter", "hedge-guide"]


class FxRate(BaseModel):
    pair: str
    rate: float
    change: float
    source: Literal["live", "fallback"]


class FxRatesResponse(BaseModel):
    base: str
    as_of: str
    rates: list[FxRate]


class SubmissionCreate(BaseModel):
    kind: SubmissionKind
    email: EmailStr
    name: str | None = Field(default=None, max_length=120)
    company: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=60)
    annual_fx_volume: str | None = Field(default=None, max_length=80)
    message: str | None = Field(default=None, max_length=5000)
    role: str | None = Field(default=None, max_length=100)
    cadence: Literal["daily", "weekly"] | None = None
    locale: str = Field(default="en", max_length=12)
    consent: bool = False


class SubmissionResponse(BaseModel):
    ok: bool
    id: str
    received_at: datetime