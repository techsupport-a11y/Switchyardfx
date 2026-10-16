import { useRef, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Coins, FileDown, Gift, LockKeyhole, LogOut, Search, ShieldCheck, Sparkles, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import {
  MAX_VOUCHER_BYTES, VOUCHER_TYPES, errorMessage, readFileAsBase64, rewardsService, useAdminOverview, useRefreshRewards, useRewardsCatalog,
  useRewardsSession, type PointsHistoryEntry, type RewardItem, type RewardsMemberDetail,
} from "@/lib/rewards";

const inputClass = "w-full rounded-xl border border-[#DCE5E1] bg-white px-4 py-3 text-sm text-[#12261F] outline-none transition-colors focus:border-[#2D6A4F]";
const points = (value: number) => value.toLocaleString("en-AU");

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = status === "approved" ? "bg-[#E3F1E9] text-[#2D6A4F]" : status === "rejected" ? "bg-[#F6E7E4] text-[#9B3B2E]" : "bg-[#FBEFD9] text-[#8A5A12]";
  return <span className={`rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] ${styles}`} data-testid={`rewards-status-${status}`}>{status}</span>;
}

function Message({ tone, children }: { tone: "error" | "success"; children: string }) {
  return <p className={`rounded-xl px-4 py-3 text-sm ${tone === "error" ? "bg-[#F6E7E4] text-[#9B3B2E]" : "bg-[#E3F1E9] text-[#2D6A4F]"}`} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

function RewardArtwork({ reward, compact = false }: { reward: RewardItem; compact?: boolean }) {
  return <div className={`flex items-center justify-center overflow-hidden rounded-[1.35rem] bg-white ${compact ? "h-36" : "h-44"}`}>
    <img src={reward.image} alt={`${reward.title} gift card`} className="h-full w-full object-contain" loading="lazy" />
  </div>;
}

function Landing({ unavailable }: { unavailable: boolean }) {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [adminMode, setAdminMode] = useState(false);
  const catalogue = useRewardsCatalog().data ?? [];
  return <>
    <section className="bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-28" data-testid="rewards-hero"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"><Reveal from="left"><SectionLabel>SwitchYard Rewards</SectionLabel><h1 className="max-w-xl text-5xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-6xl" data-testid="rewards-heading">Earn more from<br /><span className="text-[#A8C5BA]">every FX decision.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/60" data-testid="rewards-copy">SwitchYard Rewards turns your FX activity into points — redeemable against vouchers, insights and advisory. Track your balance, upload vouchers and request rewards from one place.</p><div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">{["Points on FX activity", "Upload proof-of-activity vouchers", "Redeem for vouchers & advisory"].map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><BadgeCheck size={15} className="text-[#A8C5BA]" />{item}</span>)}</div></Reveal><Reveal from="right" delay={0.1}><AuthCard tab={tab} setTab={setTab} adminMode={adminMode} setAdminMode={setAdminMode} unavailable={unavailable} /></Reveal></div></section>

    <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="rewards-how-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>How it works</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-how-heading">Three steps to your next reward.</h2></Reveal><div className="mt-12 grid gap-5 lg:grid-cols-3">{[["Earn points", "Accrue points as you transact and engage with SwitchYard. Your balance updates as activity is confirmed.", Coins], ["Upload & verify", "Upload a points voucher for your activity. SwitchYard validates each voucher before points are credited.", Upload], ["Request a reward", "Spend vested points on vouchers, FX insights, advisory or a charity donation — then we confirm it.", Gift]].map(([title, copy, Icon], index) => <Reveal key={title as string} from="bottom" delay={index * 0.06} className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-8"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Icon size={23} /></span><span className="mt-6 block text-xs font-bold text-[#8AA79B]">Step 0{index + 1}</span><h3 className="mt-2 text-xl font-bold">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#4A5A55]">{copy as string}</p></div></Reveal>)}</div></div></section>

    <section className="bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-24" data-testid="rewards-catalogue-section"><div className="mx-auto max-w-7xl"><Reveal from="left"><SectionLabel>Where you can spend</SectionLabel><h2 className="max-w-2xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-catalogue-heading">Rewards worth working toward.</h2></Reveal><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{catalogue.slice(0, 6).map((reward, index) => <Reveal key={reward.id} from="scale" delay={index * 0.05} className="h-full"><div className="flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-white p-5" data-testid={`rewards-preview-${index + 1}`}><RewardArtwork reward={reward} /><div className="flex flex-1 flex-col p-2 pt-5"><span className="w-fit rounded-full bg-[#E8EEEB] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#52796F]">{reward.category}</span><h3 className="mt-4 text-xl font-bold">{reward.title}</h3><p className="mt-2 text-sm leading-6 text-[#4A5A55]">{reward.description}</p><p className="mt-auto pt-5 text-sm font-bold text-[#52796F]">${reward.value_aud} voucher · {points(reward.points ?? 0)} points</p><a href={reward.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#2D6A4F] hover:underline">View provider <ArrowRight size={15} /></a></div></div></Reveal>)}</div></div></section>
  </>;
}

function AuthCard({ tab, setTab, adminMode, setAdminMode, unavailable }: { tab: "signin" | "register"; setTab: (value: "signin" | "register") => void; adminMode: boolean; setAdminMode: (value: boolean) => void; unavailable: boolean }) {
  return <div className="rounded-[2rem] bg-white p-7 text-[#12261F] shadow-[0_24px_60px_rgba(0,0,0,.28)] sm:p-9" data-testid="rewards-auth-card">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#12261F] text-[#A8C5BA]"><LockKeyhole size={20} /></span><div><p className="font-bold">{adminMode ? "SwitchYard staff" : "Member access"}</p><p className="text-xs text-[#52796F]">{adminMode ? "Approval & validation" : "Sign in or apply to join"}</p></div></div>
    {unavailable && <div className="mt-5"><Message tone="error">Rewards is temporarily unavailable. Please try again shortly.</Message></div>}
    {adminMode ? <AdminForm onBack={() => setAdminMode(false)} /> : <>
      <div className="mt-7 grid grid-cols-2 gap-2 rounded-full bg-[#F5F7F6] p-1" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "signin"} onClick={() => setTab("signin")} className={`rounded-full py-2.5 text-sm font-bold transition-colors ${tab === "signin" ? "bg-white text-[#12261F] shadow-sm" : "text-[#4A5A55]"}`} data-testid="rewards-tab-signin">Sign in</button>
        <button type="button" role="tab" aria-selected={tab === "register"} onClick={() => setTab("register")} className={`rounded-full py-2.5 text-sm font-bold transition-colors ${tab === "register" ? "bg-white text-[#12261F] shadow-sm" : "text-[#4A5A55]"}`} data-testid="rewards-tab-register">Create account</button>
      </div>
      {tab === "signin" ? <SignInForm /> : <RegisterForm />}
      <button type="button" onClick={() => setAdminMode(true)} className="mt-6 w-full text-center text-xs font-bold text-[#52796F] hover:text-[#2D6A4F]" data-testid="rewards-admin-toggle">SwitchYard team? Open the approval screen</button>
    </>}
  </div>;
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useRefreshRewards();
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await rewardsService.login(email, password);
      await refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }
  return <form className="mt-6 grid gap-3" onSubmit={submit} data-testid="rewards-signin-form">
    <label className="grid gap-1.5 text-sm font-bold">Email<input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com.au" autoComplete="email" data-testid="rewards-signin-email" /></label>
    <label className="grid gap-1.5 text-sm font-bold">Password<input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" data-testid="rewards-signin-password" /></label>
    {error && <Message tone="error">{error}</Message>}
    <button type="submit" disabled={busy} className={buttonVariants({ size: "lg" }) + " mt-2 justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163] disabled:opacity-60"} data-testid="rewards-signin-submit">{busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} /></button>
    <p className="text-center text-xs text-[#52796F]">New here? Register and your account will be reviewed by the SwitchYard team.</p>
  </form>;
}

function RegisterForm() {
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const field = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.email.trim() || !form.password) { setResult({ ok: false, text: "Please complete every field." }); return; }
    if (form.password.length < 8) { setResult({ ok: false, text: "Choose a password of at least 8 characters." }); return; }
    setBusy(true);
    try {
      const outcome = await rewardsService.register(form);
      setResult({ ok: true, text: outcome.message });
      setForm({ name: "", company: "", email: "", password: "" });
    } catch (caught) {
      setResult({ ok: false, text: errorMessage(caught) });
    } finally {
      setBusy(false);
    }
  }
  return <form className="mt-6 grid gap-3" onSubmit={submit} data-testid="rewards-register-form">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-bold">Full name<input className={inputClass} value={form.name} onChange={field("name")} placeholder="Jordan Miller" data-testid="rewards-register-name" /></label>
      <label className="grid gap-1.5 text-sm font-bold">Business<input className={inputClass} value={form.company} onChange={field("company")} placeholder="Company Pty Ltd" data-testid="rewards-register-company" /></label>
    </div>
    <label className="grid gap-1.5 text-sm font-bold">Work email<input className={inputClass} type="email" value={form.email} onChange={field("email")} placeholder="you@company.com.au" data-testid="rewards-register-email" /></label>
    <label className="grid gap-1.5 text-sm font-bold">Choose a password<input className={inputClass} type="password" value={form.password} onChange={field("password")} placeholder="At least 8 characters" autoComplete="new-password" data-testid="rewards-register-password" /></label>
    {result && <Message tone={result.ok ? "success" : "error"}>{result.text}</Message>}
    <button type="submit" disabled={busy} className={buttonVariants({ size: "lg" }) + " mt-2 justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163] disabled:opacity-60"} data-testid="rewards-register-submit">{busy ? "Sending…" : "Apply to join"} <UserPlus size={17} /></button>
    <p className="text-center text-xs text-[#52796F]">Applications are validated by SwitchYard before access is granted.</p>
  </form>;
}

function AdminForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useRefreshRewards();
  const demo = rewardsService.demoAdmin;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await rewardsService.adminLogin(email, password);
      await refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }
  return <form className="mt-6 grid gap-3" onSubmit={submit} data-testid="rewards-admin-form">
    <label className="grid gap-1.5 text-sm font-bold">Staff email<input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@switchyardfx.com.au" autoComplete="username" data-testid="rewards-admin-email" /></label>
    <label className="grid gap-1.5 text-sm font-bold">Staff password<input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" data-testid="rewards-admin-password" /></label>
    {error && <Message tone="error">{error}</Message>}
    {demo && <p className="rounded-xl bg-[#F5F7F6] px-4 py-3 text-xs text-[#4A5A55]" data-testid="rewards-demo-credentials">Demo mode — email <b>{demo.email}</b>, password <b>{demo.password}</b>.</p>}
    <button type="submit" disabled={busy} className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#12261F] text-white hover:bg-[#1c3a30] disabled:opacity-60"} data-testid="rewards-admin-submit">{busy ? "Checking…" : "Open approval screen"} <ShieldCheck size={17} /></button>
    <button type="button" onClick={onBack} className="text-center text-xs font-bold text-[#52796F] hover:text-[#2D6A4F]">Back to member sign in</button>
  </form>;
}

function Dashboard({ user }: { user: RewardsMemberDetail }) {
  const catalogue = useRewardsCatalog().data ?? [];
  const refresh = useRefreshRewards();
  const [selectedId, setSelectedId] = useState("");
  const [redemptionNote, setRedemptionNote] = useState("");
  const [voucherForm, setVoucherForm] = useState<{ file: File | null; note: string; claimedPoints: string }>({ file: null, note: "", claimedPoints: "" });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [redemptionResult, setRedemptionResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [voucherResult, setVoucherResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<"" | "request" | "upload" | "signout">("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyKind, setHistoryKind] = useState<"all" | "credit" | "debit">("all");
  const [historyStatus, setHistoryStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [rewardsPerPage, setRewardsPerPage] = useState<6 | 12>(6);
  const [rewardsPage, setRewardsPage] = useState(1);
  const requestRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const summary = user.points;
  const selected: RewardItem | undefined = catalogue.find((reward) => reward.id === selectedId) ?? catalogue.find((reward) => reward.points !== null && reward.points <= summary.vested) ?? catalogue.find((reward) => reward.points !== null) ?? catalogue[0];
  const pageCount = Math.max(1, Math.ceil(catalogue.length / rewardsPerPage));
  const activePage = Math.min(rewardsPage, pageCount);
  const visibleRewards = catalogue.slice((activePage - 1) * rewardsPerPage, activePage * rewardsPerPage);
  const history = (user.points_history ?? []).filter((entry) => {
    const searchText = `${entry.title} ${entry.detail} ${entry.status} ${entry.kind} ${new Date(entry.created_at).toLocaleDateString("en-AU")}`.toLowerCase();
    return (!historyQuery.trim() || searchText.includes(historyQuery.trim().toLowerCase()))
      && (historyKind === "all" || entry.kind === historyKind)
      && (historyStatus === "all" || entry.status === historyStatus);
  });
  const trendingRewards = catalogue.filter((reward) => reward.trending).slice(0, 6);

  async function requestReward(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy("request");
    try {
      const outcome = await rewardsService.requestReward(selected.id, redemptionNote);
      setRedemptionResult({ ok: true, text: outcome.message });
      setRedemptionNote("");
      await refresh();
    } catch (caught) {
      setRedemptionResult({ ok: false, text: errorMessage(caught) });
    } finally {
      setBusy("");
    }
  }
  async function uploadVoucher(event: FormEvent) {
    event.preventDefault();
    const { file } = voucherForm;
    const claimedPoints = Number(voucherForm.claimedPoints);
    if (!file) { setVoucherResult({ ok: false, text: "Attach a voucher file to upload." }); return; }
    if (!VOUCHER_TYPES.includes(file.type)) { setVoucherResult({ ok: false, text: "Upload a PDF, PNG, JPG or WebP file." }); return; }
    if (file.size > MAX_VOUCHER_BYTES) { setVoucherResult({ ok: false, text: "Voucher files must be 3 MB or smaller." }); return; }
    if (!Number.isInteger(claimedPoints) || claimedPoints <= 0) { setVoucherResult({ ok: false, text: "Enter the points value shown on the voucher." }); return; }
    setBusy("upload");
    try {
      const outcome = await rewardsService.submitVoucher({ file_name: file.name, content_type: file.type, data_base64: await readFileAsBase64(file), claimed_points: claimedPoints, note: voucherForm.note });
      setVoucherResult({ ok: true, text: outcome.message });
      setVoucherForm({ file: null, note: "", claimedPoints: "" });
      setFileInputKey((key) => key + 1);
      await refresh();
    } catch (caught) {
      setVoucherResult({ ok: false, text: errorMessage(caught) });
    } finally {
      setBusy("");
    }
  }
  async function signOut() {
    setBusy("signout");
    try { await rewardsService.logout(); } catch { /* the session is dropped either way */ }
    await refresh();
    setBusy("");
  }

  return <div className="bg-[#F5F7F6]" data-testid="rewards-dashboard">
    <section className="bg-[#12261F] px-5 pb-32 pt-20 text-white lg:px-8 lg:pt-24"><div className="mx-auto max-w-7xl"><Reveal from="top"><div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8C5BA]">SwitchYard Rewards</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-dashboard-heading">Welcome back, {user.name.split(" ")[0]}.</h1><p className="mt-3 text-white/60">{user.company} · {user.email}</p></div><button type="button" onClick={() => void signOut()} disabled={busy === "signout"} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="rewards-signout"><LogOut size={15} /> Sign out</button></div></Reveal></div></section>

    <section className="px-5 lg:px-8" data-testid="rewards-tally-section"><div className="mx-auto -mt-24 max-w-5xl"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-[#52796F]">Your points balance</p><button type="button" onClick={() => setHistoryOpen(true)} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-[#B9CBC3] bg-white text-[#244B3D] hover:bg-[#E8EEEB]"} data-testid="rewards-points-history-open"><Sparkles size={15} /> Points history ({user.points_history?.length ?? 0})</button></div><div className="grid gap-5 sm:grid-cols-2">
      <Reveal from="bottom" className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-white p-7 shadow-[0_18px_44px_rgba(18,38,31,.1)]" data-testid="rewards-points-accrued"><div className="flex items-center gap-2 text-[#52796F]"><Coins size={18} /><span className="text-xs font-bold uppercase tracking-[0.15em]">Points accrued</span></div><p className="mt-4 text-4xl font-bold tracking-[-0.03em]">{points(summary.accrued)}</p><p className="mt-1 text-sm text-[#4A5A55]">Lifetime points earned</p></div></Reveal>
      <Reveal from="bottom" delay={0.06} className="h-full"><div className="h-full rounded-[2rem] border border-[#DCE5E1] bg-white p-7 shadow-[0_18px_44px_rgba(18,38,31,.1)]" data-testid="rewards-points-vested"><div className="flex items-center gap-2 text-[#52796F]"><Gift size={18} /><span className="text-xs font-bold uppercase tracking-[0.15em]">Points vested</span></div><p className="mt-4 text-4xl font-bold tracking-[-0.03em]">{points(summary.vested)}</p><p className="mt-1 text-sm text-[#4A5A55]">Available to redeem</p></div></Reveal>
    </div></div></section>

    <section className="px-5 py-16 lg:px-8" data-testid="rewards-spend-section"><div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-5"><Reveal from="left"><SectionLabel>Where to spend</SectionLabel><h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl" data-testid="rewards-spend-heading">Choose your reward.</h2></Reveal><label className="flex items-center gap-3 text-sm font-semibold text-[#4A5A55]">Show per page<select className={inputClass + " w-auto rounded-full py-2.5"} value={rewardsPerPage} onChange={(event) => { setRewardsPerPage(Number(event.target.value) as 6 | 12); setRewardsPage(1); }} data-testid="rewards-per-page"><option value={6}>6 rewards</option><option value={12}>12 rewards</option></select></label></div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleRewards.map((reward, index) => { const itemNumber = (activePage - 1) * rewardsPerPage + index + 1; const cost = reward.points ?? 0; const priced = reward.points !== null; const affordable = priced && summary.vested >= cost; return <Reveal key={reward.id} from="scale" delay={index * 0.04} className="h-full"><div className="flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-white p-5" data-testid={`rewards-reward-${itemNumber}`}><RewardArtwork reward={reward} /><div className="flex flex-1 flex-col px-2 pb-2 pt-5"><span className="w-fit rounded-full bg-[#E8EEEB] px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#52796F]">{reward.category}</span><h3 className="mt-4 text-xl font-bold">{reward.title}</h3><p className="mt-2 text-sm leading-6 text-[#4A5A55]">{reward.description}</p><p className="mt-4 text-sm font-bold text-[#2D6A4F]">{priced ? `$${reward.value_aud} voucher · ${points(cost)} pts` : "Points cost to be confirmed"}</p><a href={reward.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex w-fit items-center gap-2 text-xs font-bold text-[#52796F] hover:underline">View provider <ArrowRight size={13} /></a><button type="button" disabled={!affordable} onClick={() => { setSelectedId(reward.id); setRedemptionResult(null); requestRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className={buttonVariants({ variant: affordable ? "default" : "outline", size: "sm" }) + ` mt-auto w-fit rounded-full ${affordable ? "bg-[#2D6A4F] text-white hover:bg-[#3d8163]" : "cursor-not-allowed border-[#DCE5E1] text-[#8AA79B]"}`} data-testid={`rewards-reward-request-${itemNumber}`}>{!priced ? "Pricing soon" : affordable ? "Request reward" : "Not enough points"}</button></div></div></Reveal>; })}</div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-[#52796F]">Showing {catalogue.length ? (activePage - 1) * rewardsPerPage + 1 : 0}–{Math.min(activePage * rewardsPerPage, catalogue.length)} of {catalogue.length} rewards</p><div className="flex items-center gap-2"><button type="button" aria-label="Previous rewards page" disabled={activePage <= 1} onClick={() => setRewardsPage((page) => Math.max(1, page - 1))} className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " rounded-full"} data-testid="rewards-page-previous"><ChevronLeft size={17} /></button><span className="min-w-20 text-center text-sm font-bold text-[#244B3D]">Page {activePage} of {pageCount}</span><button type="button" aria-label="Next rewards page" disabled={activePage >= pageCount} onClick={() => setRewardsPage((page) => Math.min(pageCount, page + 1))} className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " rounded-full"} data-testid="rewards-page-next"><ChevronRight size={17} /></button></div></div>
      <div className="mt-20" data-testid="rewards-trending-section"><div className="mb-7 flex items-end justify-between gap-4"><div><SectionLabel>Top & trending</SectionLabel><h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Popular rewards.</h3></div><div className="flex gap-2"><button type="button" aria-label="Scroll trending rewards left" onClick={() => trendingRef.current?.scrollBy({ left: -360, behavior: "smooth" })} className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " rounded-full"}><ChevronLeft size={17} /></button><button type="button" aria-label="Scroll trending rewards right" onClick={() => trendingRef.current?.scrollBy({ left: 360, behavior: "smooth" })} className={buttonVariants({ variant: "outline", size: "icon-sm" }) + " rounded-full"}><ChevronRight size={17} /></button></div></div><div ref={trendingRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4" data-testid="rewards-trending-carousel">{trendingRewards.map((reward) => <article key={`trending-${reward.id}`} className="w-[min(82vw,20rem)] shrink-0 snap-start rounded-[1.75rem] border border-[#DCE5E1] bg-white p-4"><RewardArtwork reward={reward} compact /><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#52796F]">{reward.category}</p><h4 className="mt-1 font-bold">{reward.title}</h4><p className="mt-2 text-sm font-bold text-[#52796F]">${reward.value_aud} voucher · {points(reward.points ?? 0)} points</p><a href={reward.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] hover:underline">View provider <ArrowRight size={13} /></a></article>)}</div></div>
    </div></section>

    <section className="bg-white px-5 py-20 lg:px-8" data-testid="rewards-forms-section"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
      <Reveal from="left" className="h-full"><div ref={requestRef} className="flex h-full scroll-mt-28 flex-col rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-8" data-testid="rewards-request-panel"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Gift size={20} /></span><h2 className="text-2xl font-bold" data-testid="rewards-request-heading">Request a voucher</h2></div><form className="mt-6 grid gap-3" onSubmit={requestReward} data-testid="rewards-request-form">
        <label className="grid gap-1.5 text-sm font-bold">Reward<select className={inputClass} value={selected?.id ?? ""} onChange={(e) => setSelectedId(e.target.value)} data-testid="rewards-request-reward">{catalogue.map((reward) => <option key={reward.id} value={reward.id} disabled={reward.points === null || summary.vested < reward.points}>{reward.title} — {reward.points === null ? "pricing soon" : `$${reward.value_aud} / ${points(reward.points)} pts`}</option>)}</select></label>
        <label className="grid gap-1.5 text-sm font-bold">Note (optional)<textarea className={inputClass + " min-h-24 resize-y"} value={redemptionNote} onChange={(e) => setRedemptionNote(e.target.value)} placeholder="Anything we should know about this request?" data-testid="rewards-request-note" /></label>
        <p className="text-xs text-[#52796F]">{selected?.points === null || !selected ? <>Points pricing for this reward is still being confirmed.</> : <>This is a <b>${selected.value_aud}</b> voucher and costs <b>{points(selected.points)}</b> points.</>} You have <b>{points(summary.vested)}</b> vested.</p>
        {redemptionResult && <Message tone={redemptionResult.ok ? "success" : "error"}>{redemptionResult.text}</Message>}
        <button type="submit" disabled={!selected || selected.points === null || summary.vested < selected.points || busy === "request"} className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163] disabled:opacity-50"} data-testid="rewards-request-submit">{busy === "request" ? "Submitting…" : "Submit request"} <ArrowRight size={17} /></button>
      </form></div></Reveal>

      <Reveal from="right" delay={0.1} className="h-full"><div className="flex h-full flex-col rounded-[2rem] border border-[#DCE5E1] bg-[#F5F7F6] p-8" data-testid="rewards-upload-panel"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E8EEEB] text-[#2D6A4F]"><Upload size={20} /></span><h2 className="text-2xl font-bold" data-testid="rewards-upload-heading">Upload a points voucher</h2></div><form className="mt-6 grid gap-3" onSubmit={uploadVoucher} data-testid="rewards-upload-form">
        <label className="grid gap-1.5 text-sm font-bold">Voucher file<input key={fileInputKey} className={inputClass} type="file" accept={VOUCHER_TYPES.join(",")} onChange={(e) => setVoucherForm((c) => ({ ...c, file: e.target.files?.[0] ?? null }))} data-testid="rewards-upload-file" /></label>
        <label className="grid gap-1.5 text-sm font-bold">Points value<input className={inputClass} type="number" min="1" value={voucherForm.claimedPoints} onChange={(e) => setVoucherForm((c) => ({ ...c, claimedPoints: e.target.value }))} placeholder="e.g. 4200" data-testid="rewards-upload-points" /></label>
        <label className="grid gap-1.5 text-sm font-bold">Note (optional)<textarea className={inputClass + " min-h-20 resize-y"} value={voucherForm.note} onChange={(e) => setVoucherForm((c) => ({ ...c, note: e.target.value }))} placeholder="Reference, period or activity" data-testid="rewards-upload-note" /></label>
        {voucherResult && <Message tone={voucherResult.ok ? "success" : "error"}>{voucherResult.text}</Message>}
        <button type="submit" disabled={busy === "upload"} className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#12261F] text-white hover:bg-[#1c3a30] disabled:opacity-60"} data-testid="rewards-upload-submit">{busy === "upload" ? "Uploading…" : "Upload for validation"} <Upload size={17} /></button>
        <p className="text-xs text-[#52796F]">PDF, PNG, JPG or WebP, up to 3 MB. SwitchYard reviews each voucher before points are credited.</p>
      </form></div></Reveal>
    </div></section>

    <section className="px-5 pb-24 lg:px-8" data-testid="rewards-activity-section"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold" data-testid="rewards-activity-heading">Your activity</h2><div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Voucher uploads</p><div className="mt-3 grid gap-3">{user.vouchers.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] p-5 text-sm text-[#4A5A55]">No vouchers uploaded yet.</p> : user.vouchers.map((voucher) => <div key={voucher.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-5" data-testid="rewards-activity-voucher"><div><p className="font-bold">{voucher.file_name}</p><p className="mt-1 text-sm text-[#4A5A55]">{points(voucher.claimed_points)} pts · {new Date(voucher.created_at).toLocaleDateString("en-AU")}</p>{voucher.note && <p className="mt-1 text-xs text-[#52796F]">{voucher.note}</p>}</div><StatusBadge status={voucher.status} /></div>)}</div></div>
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Voucher requests</p><div className="mt-3 grid gap-3">{user.redemptions.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] p-5 text-sm text-[#4A5A55]">No requests yet.</p> : user.redemptions.map((redemption) => <div key={redemption.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-5" data-testid="rewards-activity-request"><div><p className="font-bold">{redemption.reward_title}</p><p className="mt-1 text-sm text-[#4A5A55]">{points(redemption.points)} pts · {new Date(redemption.created_at).toLocaleDateString("en-AU")}</p>{redemption.note && <p className="mt-1 text-xs text-[#52796F]">{redemption.note}</p>}</div><StatusBadge status={redemption.status} /></div>)}</div></div>
    </div></div></section>
    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
      <DialogContent className="max-h-[85svh] max-w-3xl overflow-y-auto rounded-[2rem] border-[#DCE5E1] p-6 sm:p-8" data-testid="rewards-points-history-dialog">
        <DialogHeader className="pr-8"><SectionLabel>Points ledger</SectionLabel><DialogTitle className="text-2xl font-bold text-[#12261F]">Your points history</DialogTitle><DialogDescription className="text-[#52796F]">Credits add points; debits are redeemed or pending reward requests.</DialogDescription></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="relative"><span className="sr-only">Search points history</span><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#789187]" /><input className={inputClass + " pl-10"} value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="Search activity..." data-testid="rewards-history-search" /></label>
          <label className="grid gap-1 text-xs font-bold text-[#52796F]">Type<select className={inputClass + " py-2.5"} value={historyKind} onChange={(event) => setHistoryKind(event.target.value as "all" | "credit" | "debit")} data-testid="rewards-history-kind"><option value="all">All activity</option><option value="credit">Credits</option><option value="debit">Debits</option></select></label>
          <label className="grid gap-1 text-xs font-bold text-[#52796F]">Status<select className={inputClass + " py-2.5"} value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value as "all" | "approved" | "pending" | "rejected")} data-testid="rewards-history-status"><option value="all">All statuses</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select></label>
        </div>
        <div className="grid gap-2" data-testid="rewards-history-results">{history.length === 0 ? <p className="rounded-2xl border border-dashed border-[#DCE5E1] p-8 text-center text-sm text-[#52796F]">No points activity matches those filters.</p> : history.map((entry: PointsHistoryEntry) => <article key={entry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E3EBE7] bg-white px-4 py-4" data-testid="rewards-history-entry"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${entry.kind === "credit" ? "bg-[#E3F1E9] text-[#2D6A4F]" : "bg-[#F6E7E4] text-[#9B3B2E]"}`}>{entry.kind === "credit" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span><div className="min-w-0"><p className="truncate font-bold text-[#12261F]">{entry.title}</p><p className="mt-1 truncate text-sm text-[#52796F]">{entry.detail || (entry.kind === "credit" ? "Points credit" : "Reward request")}</p><p className="mt-1 text-xs text-[#789187]">{new Date(entry.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p></div></div><div className="ml-auto flex items-center gap-3"><span className={`font-bold tabular-nums ${entry.kind === "credit" ? "text-[#2D6A4F]" : "text-[#9B3B2E]"}`}>{entry.kind === "credit" ? "+" : "−"}{points(entry.points)} pts</span><StatusBadge status={entry.status} /></div></article>)}</div>
      </DialogContent>
    </Dialog>
  </div>;
}

function AdminDashboard() {
  const overview = useAdminOverview(true);
  const refresh = useRefreshRewards();
  const [working, setWorking] = useState("");
  const registrations = overview.data?.members.filter((member) => member.status === "pending") ?? [];
  const vouchers = overview.data?.pending_vouchers ?? [];
  const redemptions = overview.data?.pending_redemptions ?? [];
  const members = overview.data?.members ?? [];
  async function act(key: string, action: () => Promise<{ message: string }>) {
    setWorking(key);
    try {
      toast.success((await action()).message);
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      await refresh();
      setWorking("");
    }
  }
  async function signOut() {
    try { await rewardsService.logout(); } catch { /* the session is dropped either way */ }
    await refresh();
  }
  const empty = (text: string) => <p className="rounded-2xl border border-dashed border-[#DCE5E1] bg-white p-6 text-sm text-[#4A5A55]">{overview.isLoading ? "Loading…" : text}</p>;
  const actions = (key: string, approveLabel: string, approveTestId: string, rejectTestId: string, run: (status: "approved" | "rejected") => Promise<{ message: string }>) => <div className="flex gap-2"><button type="button" disabled={working === key} onClick={() => void act(key, () => run("approved"))} className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid={approveTestId}>{approveLabel}</button><button type="button" disabled={working === key} onClick={() => void act(key, () => run("rejected"))} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full"} data-testid={rejectTestId}>Reject</button></div>;
  return <div className="min-h-[70svh] bg-[#F5F7F6] pb-24" data-testid="rewards-admin">
    <section className="bg-[#12261F] px-5 pb-16 pt-28 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8C5BA]">SwitchYard staff</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="rewards-admin-heading">Approvals & validation.</h1><p className="mt-3 text-white/60">Review member registrations, uploaded vouchers and reward requests.</p></div><div className="flex gap-2">{rewardsService.resetDemo && <button type="button" onClick={() => { rewardsService.resetDemo?.(); void refresh(); }} className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="rewards-admin-reset">Reset demo data</button>}<button type="button" onClick={() => void signOut()} className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#A8C5BA] text-[#12261F] hover:bg-white"} data-testid="rewards-admin-signout"><LogOut size={15} /> Sign out</button></div></div></div></section>
    {overview.isError && <section className="px-5 pt-10 lg:px-8"><div className="mx-auto max-w-7xl"><Message tone="error">{errorMessage(overview.error)}</Message></div></section>}

    <section className="px-5 pt-14 lg:px-8" data-testid="rewards-admin-registrations"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">Pending registrations</h2><div className="mt-4 grid gap-3">{registrations.length === 0 ? empty("No registrations awaiting approval.") : registrations.map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid="rewards-admin-registration"><div><p className="font-bold">{member.name} · {member.company}</p><p className="mt-1 text-sm text-[#4A5A55]">{member.email} · applied {new Date(member.created_at).toLocaleDateString("en-AU")}</p></div>{actions(`member-${member.id}`, "Approve", "rewards-approve-user", "rewards-reject-user", (status) => rewardsService.setMemberStatus(member.id, status))}</div>)}</div></div></section>

    <section className="px-5 pt-12 lg:px-8" data-testid="rewards-admin-vouchers"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">Voucher uploads to validate</h2><div className="mt-4 grid gap-3">{vouchers.length === 0 ? empty("No vouchers awaiting validation.") : vouchers.map(({ member, voucher }) => { const fileUrl = rewardsService.voucherFileUrl(voucher.id); return <div key={voucher.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid="rewards-admin-voucher"><div><p className="font-bold">{member.name} · {member.company}</p><p className="mt-1 text-sm text-[#4A5A55]">{voucher.file_name} · {points(voucher.claimed_points)} pts{voucher.note ? ` · ${voucher.note}` : ""}</p>{fileUrl && <a href={fileUrl} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6A4F] hover:underline" data-testid="rewards-voucher-file"><FileDown size={14} /> Open the uploaded file</a>}</div>{actions(`voucher-${voucher.id}`, "Credit points", "rewards-approve-voucher", "rewards-reject-voucher", (status) => rewardsService.setVoucherStatus(voucher.id, status))}</div>; })}</div></div></section>

    <section className="px-5 pt-12 lg:px-8" data-testid="rewards-admin-redemptions"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">Reward requests to confirm</h2><div className="mt-4 grid gap-3">{redemptions.length === 0 ? empty("No reward requests awaiting confirmation.") : redemptions.map(({ member, redemption }) => <div key={redemption.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCE5E1] bg-white p-6" data-testid="rewards-admin-redemption"><div><p className="font-bold">{member.name} · {member.company}</p><p className="mt-1 text-sm text-[#4A5A55]">{redemption.reward_title} · {points(redemption.points)} pts{redemption.note ? ` · ${redemption.note}` : ""}</p></div>{actions(`redemption-${redemption.id}`, "Confirm", "rewards-approve-redemption", "rewards-reject-redemption", (status) => rewardsService.setRedemptionStatus(redemption.id, status))}</div>)}</div></div></section>

    <section className="px-5 pt-12 lg:px-8" data-testid="rewards-admin-accounts"><div className="mx-auto max-w-7xl"><h2 className="text-2xl font-bold">All accounts</h2><div className="mt-4 overflow-x-auto rounded-2xl border border-[#DCE5E1] bg-white"><table className="w-full min-w-[40rem] text-left text-sm"><thead className="border-b border-[#DCE5E1] text-xs font-bold uppercase tracking-[0.1em] text-[#52796F]"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Accrued</th><th className="px-5 py-4">Vested</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className="border-b border-[#F0F3F1] last:border-0" data-testid="rewards-admin-account"><td className="px-5 py-4"><span className="font-bold">{member.name}</span><span className="block text-xs text-[#52796F]">{member.email}</span></td><td className="px-5 py-4">{member.company}</td><td className="px-5 py-4"><StatusBadge status={member.status} /></td><td className="px-5 py-4 font-bold">{points(member.points.accrued)}</td><td className="px-5 py-4 font-bold">{points(member.points.vested)}</td></tr>)}</tbody></table></div></div></section>
  </div>;
}

export default function Rewards() {
  const session = useRewardsSession();
  if (session.isLoading) return <section className="grid min-h-[60svh] place-items-center bg-[#12261F] px-5 text-white/60" data-testid="rewards-loading">Loading SwitchYard Rewards…</section>;
  if (session.data?.role === "admin") return <AdminDashboard />;
  if (session.data?.role === "member" && session.data.member) return <Dashboard user={session.data.member} />;
  return <Landing unavailable={session.isError} />;
}
