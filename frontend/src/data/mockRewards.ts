// Mock-mode SwitchYard Rewards: a browser-only stand-in for /api/rewards so the page works with
// no backend (VITE_DATA_MODE=mock). State lives in localStorage and the demo staff credentials
// are shown on the page. Never used in API mode, where the backend owns accounts and points.
// It follows the backend's rules: no welcome points, and pending reward requests hold points.
import type {
  ApprovalStatus, PointsHistoryEntry, RegisterInput, RewardItem, RewardsAdminOverview, RewardsMember, RewardsMemberDetail, RewardsMessage,
  RewardsPoints, RewardsRedemption, RewardsService, RewardsSession, RewardsVoucher, VoucherInput,
} from "@/lib/rewards";
import rewardsCatalog from "@/data/rewardsCatalog.json";

const DEMO_ADMIN = { email: "admin@switchyardfx.com.au", password: "switchyard" };

const CATALOGUE: RewardItem[] = rewardsCatalog;

type StoredMember = Omit<RewardsMember, "points"> & { password: string; welcome_points?: number; vouchers: RewardsVoucher[]; redemptions: RewardsRedemption[] };
type Store = { members: StoredMember[]; session: { role: "member"; email: string } | { role: "admin" } | null };

const KEY = "switchyard-rewards-v2";
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const nowISO = () => new Date().toISOString();

function seed(): Store {
  const created = nowISO();
  return {
    members: [
      {
        id: uid(), name: "Jordan Miller", company: "Harbour Freight Co.", email: "demo@switchyardfx.com.au", password: "demo1234", status: "approved", created_at: created,
        vouchers: [
          { id: uid(), file_name: "freight-fx-activity-sep.pdf", note: "September FX activity voucher", claimed_points: 12500, status: "approved", created_at: created },
          { id: uid(), file_name: "freight-fx-activity-oct.pdf", note: "October FX activity voucher", claimed_points: 4200, status: "pending", created_at: created },
        ],
        redemptions: [{ id: uid(), reward_id: "fx-report", reward_title: "Premium FX outlook report", points: 2500, note: "Please send the Q4 outlook.", status: "approved", created_at: created }],
      },
      { id: uid(), name: "Priya Nair", company: "Coastal Imports Pty Ltd", email: "priya@coastalimports.com.au", password: "coastal123", status: "pending", created_at: created, vouchers: [], redemptions: [] },
    ],
    session: null,
  };
}

function load(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch { /* storage unavailable: fall back to an in-memory seed */ }
  return seed();
}

let store: Store = load();

function save(next: Store): void {
  store = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* non-fatal */ }
}

const delay = () => new Promise((resolve) => window.setTimeout(resolve, 160));
const ok = (message: string): RewardsMessage => ({ ok: true, message });

function points(member: StoredMember): RewardsPoints {
  const accrued = (member.welcome_points ?? 0) + member.vouchers.filter((v) => v.status === "approved").reduce((sum, v) => sum + v.claimed_points, 0);
  const redeemed = member.redemptions.filter((r) => r.status !== "rejected").reduce((sum, r) => sum + r.points, 0);
  return {
    accrued,
    vested: Math.max(0, accrued - redeemed),
    redeemed,
    pending_vouchers: member.vouchers.filter((v) => v.status === "pending").length,
    pending_redemptions: member.redemptions.filter((r) => r.status === "pending").length,
  };
}

function view(member: StoredMember): RewardsMember {
  const { id, name, company, email, status, created_at } = member;
  return { id, name, company, email, status, created_at, points: points(member) };
}

function detail(member: StoredMember): RewardsMemberDetail {
  const history: PointsHistoryEntry[] = [
    ...member.vouchers.map((voucher) => ({
      id: `voucher-${voucher.id}`, kind: "credit" as const, title: "Points voucher",
      detail: [voucher.file_name, voucher.note].filter(Boolean).join(" · "), points: voucher.claimed_points,
      status: voucher.status, created_at: voucher.created_at,
    })),
    ...member.redemptions.map((redemption) => ({
      id: `redemption-${redemption.id}`, kind: "debit" as const, title: redemption.reward_title,
      detail: redemption.note || "Reward request", points: redemption.points,
      status: redemption.status, created_at: redemption.created_at,
    })),
  ];
  if (member.welcome_points) history.push({
    id: "welcome-points", kind: "credit", title: "Welcome points", detail: "Member account approval",
    points: member.welcome_points, status: "approved", created_at: member.created_at,
  });
  history.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  return { ...view(member), vouchers: member.vouchers, redemptions: member.redemptions, points_history: history };
}

function find(email: string): StoredMember | undefined {
  const key = email.trim().toLowerCase();
  return store.members.find((member) => member.email === key);
}

function signedInMember(): StoredMember {
  const member = store.session?.role === "member" ? find(store.session.email) : undefined;
  if (!member || member.status !== "approved") throw new Error("Please sign in to continue.");
  return member;
}

function requireAdmin(): void {
  if (store.session?.role !== "admin") throw new Error("Staff sign-in required.");
}

function update(predicate: (member: StoredMember) => boolean, patch: (member: StoredMember) => StoredMember): void {
  save({ ...store, members: store.members.map((member) => (predicate(member) ? patch(member) : member)) });
}

function review<T extends { id: string; status: ApprovalStatus }>(items: T[], id: string, status: ApprovalStatus): T[] {
  const item = items.find((entry) => entry.id === id);
  if (!item || item.status !== "pending") throw new Error("That item has already been reviewed.");
  return items.map((entry) => (entry.id === id ? { ...entry, status } : entry));
}

export const mockRewards: RewardsService = {
  async catalog() { await delay(); return CATALOGUE; },

  async session(): Promise<RewardsSession> {
    await delay();
    if (store.session?.role === "admin") return { role: "admin", member: null, admin_email: DEMO_ADMIN.email };
    const member = store.session?.role === "member" ? find(store.session.email) : undefined;
    return member?.status === "approved" ? { role: "member", member: detail(member), admin_email: null } : { role: "guest", member: null, admin_email: null };
  },

  async register(input: RegisterInput) {
    await delay();
    const name = input.name.trim();
    const company = input.company.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !company || !email || !input.password) throw new Error("Please complete every field.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (input.password.length < 8) throw new Error("Choose a password of at least 8 characters.");
    if (find(email)) throw new Error("An account with that email already exists.");
    save({ ...store, members: [...store.members, { id: uid(), name, company, email, password: input.password, status: "pending", created_at: nowISO(), vouchers: [], redemptions: [] }] });
    return ok("Registration received. Your account is pending SwitchYard approval — you'll be able to sign in once it's approved.");
  },

  async login(email, password) {
    await delay();
    const member = find(email);
    if (!member || member.password !== password) throw new Error("Email or password is incorrect.");
    if (member.status === "pending") throw new Error("Your account is still pending SwitchYard approval.");
    if (member.status === "rejected") throw new Error("This account was not approved. Please contact your SwitchYard team.");
    save({ ...store, session: { role: "member", email: member.email } });
    return { role: "member", member: detail(member), admin_email: null };
  },

  async adminLogin(email, password) {
    await delay();
    if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) throw new Error("Invalid SwitchYard staff credentials.");
    save({ ...store, session: { role: "admin" } });
    return { role: "admin", member: null, admin_email: DEMO_ADMIN.email };
  },

  async logout() { await delay(); save({ ...store, session: null }); return ok("Signed out."); },

  async submitVoucher(input: VoucherInput) {
    await delay();
    const member = signedInMember();
    const voucher: RewardsVoucher = { id: uid(), file_name: input.file_name, note: input.note.trim(), claimed_points: Math.round(input.claimed_points), status: "pending", created_at: nowISO() };
    update((m) => m.id === member.id, (m) => ({ ...m, vouchers: [voucher, ...m.vouchers] }));
    return ok("Voucher uploaded. SwitchYard will validate it before points are credited.");
  },

  async requestReward(rewardId, note) {
    await delay();
    const member = signedInMember();
    const reward = CATALOGUE.find((item) => item.id === rewardId);
    if (!reward) throw new Error("That reward is no longer available.");
    if (reward.points === null) throw new Error("Points pricing for this reward is still being confirmed.");
    if (points(member).vested < reward.points) throw new Error("You don't have enough vested points for this reward.");
    const redemption: RewardsRedemption = { id: uid(), reward_id: reward.id, reward_title: reward.title, points: reward.points, note: note.trim(), status: "pending", created_at: nowISO() };
    update((m) => m.id === member.id, (m) => ({ ...m, redemptions: [redemption, ...m.redemptions] }));
    return ok(`Request for “${reward.title}” submitted. SwitchYard will confirm your voucher.`);
  },

  async adminOverview(): Promise<RewardsAdminOverview> {
    await delay();
    requireAdmin();
    return {
      members: store.members.map(view),
      pending_vouchers: store.members.flatMap((m) => m.vouchers.filter((v) => v.status === "pending").map((voucher) => ({ member: view(m), voucher }))),
      pending_redemptions: store.members.flatMap((m) => m.redemptions.filter((r) => r.status === "pending").map((redemption) => ({ member: view(m), redemption }))),
    };
  },

  async setMemberStatus(id, status) {
    await delay();
    requireAdmin();
    const member = store.members.find((m) => m.id === id);
    if (!member || member.status !== "pending") throw new Error("That registration has already been reviewed.");
    update((m) => m.id === id, (m) => ({ ...m, status }));
    return ok(`Registration ${status}.`);
  },

  async setVoucherStatus(id, status) {
    await delay();
    requireAdmin();
    const owner = store.members.find((m) => m.vouchers.some((v) => v.id === id));
    if (!owner) throw new Error("That voucher has already been reviewed.");
    update((m) => m.id === owner.id, (m) => ({ ...m, vouchers: review(m.vouchers, id, status) }));
    return ok(status === "approved" ? "Points credited." : "Voucher rejected.");
  },

  async setRedemptionStatus(id, status) {
    await delay();
    requireAdmin();
    const owner = store.members.find((m) => m.redemptions.some((r) => r.id === id));
    if (!owner) throw new Error("That request has already been reviewed.");
    update((m) => m.id === owner.id, (m) => ({ ...m, redemptions: review(m.redemptions, id, status) }));
    return ok(status === "approved" ? "Request confirmed." : "Request rejected; the points are released.");
  },

  voucherFileUrl: () => null,
  demoAdmin: DEMO_ADMIN,
  resetDemo: () => save(seed()),
};
