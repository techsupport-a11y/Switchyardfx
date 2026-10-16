from typing import Literal

from pydantic import BaseModel, EmailStr, Field


ApprovalStatus = Literal["pending", "approved", "rejected"]


class RewardItem(BaseModel):
    id: str
    title: str
    description: str
    points: int | None = None
    value_aud: int
    category: str
    link: str
    image: str
    trending: bool = False


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: str = Field(min_length=1, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class VoucherCreate(BaseModel):
    file_name: str = Field(min_length=1, max_length=200)
    content_type: str = Field(max_length=100)
    # The file itself, base64-encoded (kept as JSON so no multipart dependency is needed).
    data_base64: str = Field(min_length=1)
    claimed_points: int = Field(gt=0, le=1_000_000)
    note: str = Field(default="", max_length=1000)


class RedemptionCreate(BaseModel):
    reward_id: str = Field(min_length=1, max_length=60)
    note: str = Field(default="", max_length=1000)


class StatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]


class RewardsPoints(BaseModel):
    # Welcome points plus every approved voucher.
    accrued: int
    # Accrued minus everything redeemed or awaiting confirmation: what can still be spent.
    vested: int
    # Approved plus pending reward requests (a rejected request releases its points).
    redeemed: int
    pending_vouchers: int
    pending_redemptions: int


class VoucherView(BaseModel):
    id: str
    file_name: str
    note: str
    claimed_points: int
    status: ApprovalStatus
    created_at: str


class RedemptionView(BaseModel):
    id: str
    reward_id: str
    reward_title: str
    points: int
    note: str
    status: ApprovalStatus
    created_at: str


class PointsHistoryEntry(BaseModel):
    id: str
    kind: Literal["credit", "debit"]
    title: str
    detail: str
    points: int
    status: ApprovalStatus
    created_at: str


class MemberView(BaseModel):
    id: str
    name: str
    company: str
    email: str
    status: ApprovalStatus
    created_at: str
    points: RewardsPoints


class MemberDetail(MemberView):
    vouchers: list[VoucherView]
    redemptions: list[RedemptionView]
    points_history: list[PointsHistoryEntry]


class RewardsSession(BaseModel):
    role: Literal["guest", "member", "admin"]
    member: MemberDetail | None = None
    admin_email: str | None = None


class PendingVoucher(BaseModel):
    member: MemberView
    voucher: VoucherView


class PendingRedemption(BaseModel):
    member: MemberView
    redemption: RedemptionView


class AdminOverview(BaseModel):
    members: list[MemberView]
    pending_vouchers: list[PendingVoucher]
    pending_redemptions: list[PendingRedemption]


class RewardsMessage(BaseModel):
    ok: bool = True
    message: str
