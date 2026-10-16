// SwitchYard Rewards — the frontend side of /api/rewards (backend/routers/rewards.py).
//
// In API mode every call goes to the backend, which owns accounts, sessions (an httpOnly
// cookie), the points ledger and staff approval. In mock mode the same calls run against the
// browser-only demo store in src/data/mockRewards.ts, so the page still works without a backend.
// These types mirror backend/models/rewards.py by hand — change the two together.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { mockRewards } from "@/data/mockRewards";
import { SWITCHYARD_DATA_MODE } from "@/services/switchyard";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface RewardItem { id: string; title: string; description: string; points: number | null; value_aud: number; category: string; link: string; image: string; trending: boolean }
export interface RewardsPoints { accrued: number; vested: number; redeemed: number; pending_vouchers: number; pending_redemptions: number }
export interface RewardsVoucher { id: string; file_name: string; note: string; claimed_points: number; status: ApprovalStatus; created_at: string }
export interface RewardsRedemption { id: string; reward_id: string; reward_title: string; points: number; note: string; status: ApprovalStatus; created_at: string }
export interface PointsHistoryEntry { id: string; kind: "credit" | "debit"; title: string; detail: string; points: number; status: ApprovalStatus; created_at: string }
export interface RewardsMember { id: string; name: string; company: string; email: string; status: ApprovalStatus; created_at: string; points: RewardsPoints }
export interface RewardsMemberDetail extends RewardsMember { vouchers: RewardsVoucher[]; redemptions: RewardsRedemption[]; points_history: PointsHistoryEntry[] }
export interface RewardsSession { role: "guest" | "member" | "admin"; member: RewardsMemberDetail | null; admin_email: string | null }
export interface RewardsAdminOverview {
  members: RewardsMember[];
  pending_vouchers: { member: RewardsMember; voucher: RewardsVoucher }[];
  pending_redemptions: { member: RewardsMember; redemption: RewardsRedemption }[];
}
export interface RewardsMessage { ok: boolean; message: string }
export interface RegisterInput { name: string; company: string; email: string; password: string }
export interface VoucherInput { file_name: string; content_type: string; data_base64: string; claimed_points: number; note: string }

export interface RewardsService {
  catalog(): Promise<RewardItem[]>;
  session(): Promise<RewardsSession>;
  register(input: RegisterInput): Promise<RewardsMessage>;
  login(email: string, password: string): Promise<RewardsSession>;
  adminLogin(email: string, password: string): Promise<RewardsSession>;
  logout(): Promise<RewardsMessage>;
  submitVoucher(input: VoucherInput): Promise<RewardsMessage>;
  requestReward(rewardId: string, note: string): Promise<RewardsMessage>;
  adminOverview(): Promise<RewardsAdminOverview>;
  setMemberStatus(id: string, status: "approved" | "rejected"): Promise<RewardsMessage>;
  setVoucherStatus(id: string, status: "approved" | "rejected"): Promise<RewardsMessage>;
  setRedemptionStatus(id: string, status: "approved" | "rejected"): Promise<RewardsMessage>;
  /** Where staff open an uploaded voucher; null when files are not kept (mock mode). */
  voucherFileUrl(id: string): string | null;
  /** Demo staff credentials to show on the page — only ever set in mock mode. */
  demoAdmin: { email: string; password: string } | null;
  /** Restores the demo data — only in mock mode. */
  resetDemo: (() => void) | null;
}

const apiRewards: RewardsService = {
  catalog: () => apiGet<RewardItem[]>("/rewards/catalog"),
  session: () => apiGet<RewardsSession>("/rewards/session"),
  register: (input) => apiPost<RewardsMessage>("/rewards/register", input),
  login: (email, password) => apiPost<RewardsSession>("/rewards/login", { email, password }),
  adminLogin: (email, password) => apiPost<RewardsSession>("/rewards/admin/login", { email, password }),
  logout: () => apiPost<RewardsMessage>("/rewards/logout"),
  submitVoucher: (input) => apiPost<RewardsMessage>("/rewards/vouchers", input),
  requestReward: (rewardId, note) => apiPost<RewardsMessage>("/rewards/redemptions", { reward_id: rewardId, note }),
  adminOverview: () => apiGet<RewardsAdminOverview>("/rewards/admin/overview"),
  setMemberStatus: (id, status) => apiPost<RewardsMessage>(`/rewards/admin/members/${id}/status`, { status }),
  setVoucherStatus: (id, status) => apiPost<RewardsMessage>(`/rewards/admin/vouchers/${id}/status`, { status }),
  setRedemptionStatus: (id, status) => apiPost<RewardsMessage>(`/rewards/admin/redemptions/${id}/status`, { status }),
  voucherFileUrl: (id) => `/api/rewards/admin/vouchers/${id}/file`,
  demoAdmin: null,
  resetDemo: null,
};

export const rewardsService: RewardsService = SWITCHYARD_DATA_MODE === "api" ? apiRewards : mockRewards;

// Voucher uploads: what the backend accepts.
export const VOUCHER_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export const MAX_VOUCHER_BYTES = 3 * 1024 * 1024;

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

// A readable sentence from whatever a call threw (FastAPI sends {detail: string | [...]}).
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = (error.body as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const field = String((detail[0] as { loc?: unknown[] })?.loc?.at(-1) ?? "");
      if (field === "password") return "Choose a password of at least 8 characters.";
      if (field === "email") return "Enter a valid email address.";
      return "Please complete every field.";
    }
    return "Something went wrong. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

const SESSION_KEY = ["rewards", "session"] as const;

export function useRewardsSession() {
  return useQuery({ queryKey: SESSION_KEY, queryFn: rewardsService.session, retry: false, staleTime: 30_000 });
}

export function useRewardsCatalog() {
  return useQuery({ queryKey: ["rewards", "catalog"], queryFn: rewardsService.catalog, staleTime: 10 * 60_000 });
}

export function useAdminOverview(enabled: boolean) {
  return useQuery({ queryKey: ["rewards", "admin-overview"], queryFn: rewardsService.adminOverview, enabled, retry: false });
}

// Refetch everything rewards-related after a change.
export function useRefreshRewards() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["rewards"] });
}
