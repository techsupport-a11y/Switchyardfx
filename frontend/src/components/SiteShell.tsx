import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Globe2, Menu, X } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BrandMark } from "@/components/BrandMark";
import LandingIntro from "@/components/LandingIntro";
import { renderHead, routeMeta } from "@/lib/seo";
import { BOOKING_URL, EBURY_LEGAL_URL, EMAIL, EMAIL_HREF, PHONE_DISPLAY, PHONE_HREF, WHATSAPP_URL } from "@/lib/siteLinks";
import { getStoredLanguage, installGoogleTranslate, LANGUAGES, setDocumentLanguage, type LanguageCode } from "@/lib/googleTranslate";

const navLinks = [["Home", "/"], ["About", "/about"], ["Services", "/services"], ["Market Insights", "/insights"], ["Contact", "/contact"]];

// Where a block slides in from as it scrolls into view.
const REVEAL_FROM = {
  left: { x: -56, y: 0, scale: 1 },
  right: { x: 56, y: 0, scale: 1 },
  top: { x: 0, y: -36, scale: 1 },
  bottom: { x: 0, y: 36, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.92 },
} as const;

export function Reveal({ children, className = "", delay = 0, from = "bottom" }: { children: ReactNode; className?: string; delay?: number; from?: keyof typeof REVEAL_FROM }) {
  const reducedMotion = useReducedMotion();
  return <motion.div className={className} initial={reducedMotion ? false : { opacity: 0, ...REVEAL_FROM[from] }} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: reducedMotion ? 0 : 0.75, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function SectionLabel({ children }: { children: ReactNode }) { const id = typeof children === "string" ? children.toLowerCase().replaceAll(" ", "-").replaceAll("’", "") : "label"; return <p className="section-label mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#52796F]" data-testid={`section-label-${id}`}>{children}</p>; }

function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>(() => getStoredLanguage());
  const ref = useRef<HTMLDivElement>(null);
  const label = LANGUAGES.find(([code]) => code === language)?.[1] ?? "English";
  useEffect(() => {
    const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);
  function choose(code: LanguageCode) { setLanguage(code); setDocumentLanguage(code); setOpen(false); }
  return <div ref={ref} className={`relative ${mobile ? "w-full" : ""}`} data-testid={mobile ? "mobile-language-switcher" : "language-switcher"}>
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="listbox" className={`flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-white transition-colors hover:border-[#A8C5BA]/60 ${mobile ? "w-full justify-between" : ""}`} data-testid="language-switcher-trigger"><Globe2 size={15} /><span>{label}</span><ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} /></button>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} role="listbox" className={`absolute z-50 mt-2 max-h-72 min-w-48 overflow-auto rounded-2xl border border-[#DCE5E1] bg-white p-2 shadow-2xl ${mobile ? "left-0 right-0" : "right-0"}`} data-testid="language-switcher-menu">{LANGUAGES.map(([code, name]) => <button type="button" role="option" aria-selected={language === code} key={code} onClick={() => choose(code)} className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[#E8EEEB] ${language === code ? "bg-[#E8EEEB] font-bold text-[#2D6A4F]" : "text-[#12261F]"}`} data-testid={`language-option-${code}`}>{name}</button>)}</motion.div>}</AnimatePresence>
  </div>;
}

// Home is active only on "/"; every other link also covers its sub-pages.
const isActivePath = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

// Desktop nav: a soft pill glides to whichever link is hovered or focused, and a dot marks
// the current page.
function HeaderNav({ pathname }: { pathname: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  return <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation" onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
    {navLinks.map(([name, href]) => {
      const active = isActivePath(pathname, href);
      return <Link key={href} to={href} aria-current={active ? "page" : undefined} onMouseEnter={() => setHovered(href)} onFocus={() => setHovered(href)} className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${active || hovered === href ? "text-white" : "text-white/70"}`} data-testid={`header-nav-${name.toLowerCase().replaceAll(" ", "-")}`}>
        {hovered === href && <motion.span layoutId="header-nav-hover" className="absolute inset-0 -z-10 rounded-full bg-white/10" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
        {name}
        {active && <motion.span layoutId="header-nav-active" className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#A8C5BA]" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
      </Link>;
    })}
  </nav>;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 80); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  // Pages that open on a light background (login) keep the solid header so its white text stays readable.
  const solid = scrolled || location.pathname === "/login";
  return <header className={`fixed inset-x-0 top-0 z-[80] isolate transition-[padding] duration-500 ${solid ? "px-0 pt-0" : "px-3 pt-3"}`} data-testid="site-header">
    <div className={`border px-5 py-3.5 transition-[background-color,border-color,box-shadow,border-radius] duration-500 lg:px-8 ${solid ? "rounded-b-[20px] rounded-t-none border-transparent border-b-white/15 bg-[#12261F] shadow-[0_14px_38px_rgba(0,0,0,.2)]" : "rounded-[20px] border-transparent bg-transparent shadow-none"}`} data-scrolled={solid ? "true" : "false"}><div className="mx-auto flex max-w-7xl items-center justify-between">
      <Link to="/" className="group flex items-center gap-3" data-testid="header-logo-link"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition-[transform,box-shadow,color,background-color] duration-300 group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-[#A8C5BA] group-hover:text-[#12261F] group-hover:shadow-[0_0_0_4px_rgba(168,197,186,.18)]"><BrandMark className="h-8 w-auto" /></span><span><span className="block text-lg font-bold tracking-tight text-white transition-colors group-hover:text-[#A8C5BA]">SwitchYard</span><span className="block text-[9px] font-bold tracking-[0.2em] text-[#A8C5BA]">FX ADVISORY</span></span></Link>
      <HeaderNav pathname={location.pathname} />
      <div className="hidden items-center gap-3 lg:flex"><LanguageSwitcher /><Link to="/login" className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-white/20 bg-transparent text-white transition-colors hover:border-[#A8C5BA]/60 hover:bg-white/10 hover:text-white"} data-testid="header-login-link">Login</Link><a href={BOOKING_URL} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm" }) + " group rounded-full bg-[#2D6A4F] text-white transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-[#3d8163] hover:shadow-[0_8px_24px_rgba(110,231,168,.25)]"} data-testid="header-book-call-link">Book a Call <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a></div>
      <button type="button" onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white lg:hidden" aria-label="Open menu" data-testid="mobile-menu-open-button"><Menu size={20} /></button>
    </div></div>
    <AnimatePresence>{menuOpen && <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 24 }} className="fixed inset-0 z-50 flex flex-col bg-[#12261F] p-6 lg:hidden" data-testid="mobile-menu"><div className="flex items-center justify-between"><span className="text-lg font-bold text-white">SwitchYard</span><button type="button" onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white" aria-label="Close menu" data-testid="mobile-menu-close-button"><X size={20} /></button></div><nav className="mt-14 grid gap-5">{navLinks.map(([name, href]) => <Link key={href} to={href} aria-current={isActivePath(location.pathname, href) ? "page" : undefined} className={`text-3xl font-bold transition-colors ${isActivePath(location.pathname, href) ? "text-[#A8C5BA]" : "text-white hover:text-[#A8C5BA]"}`} data-testid={`mobile-nav-${name.toLowerCase().replaceAll(" ", "-")}`}>{name}</Link>)}<Link to="/login" className="text-3xl font-bold text-white" data-testid="mobile-nav-login">Login</Link></nav><div className="mt-auto grid gap-4"><LanguageSwitcher mobile /><a href={BOOKING_URL} target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#A8C5BA] text-[#12261F]"} data-testid="mobile-book-call-link">Book a Call <ArrowUpRight size={18} /></a></div></motion.div>}</AnimatePresence>
  </header>;
}

function CookieBanner() {
  const [undecided, setUndecided] = useState(() => { try { return window.localStorage.getItem("switchyard-cookies") === null; } catch { return true; } });
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (!undecided || pastHero) return;
    // The hero is the first section on every page; show the banner once it has scrolled away.
    const check = () => {
      const hero = document.querySelector<HTMLElement>(".site-main > section:first-child");
      const threshold = (hero?.offsetHeight ?? window.innerHeight) * 0.75;
      if (window.scrollY > threshold) setPastHero(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [undecided, pastHero]);
  function decide(value: string) { try { window.localStorage.setItem("switchyard-cookies", value); } catch { /* storage blocked: hide for this visit */ } setUndecided(false); }
  return <AnimatePresence>{undecided && pastHero && <motion.div key="cookie-banner" initial={{ y: 140, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 140, opacity: 0 }} transition={{ type: "spring", damping: 26, stiffness: 260 }} className="fixed bottom-3 left-3 right-3 z-[90] mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-[#DCE5E1] bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:items-center sm:justify-between" data-testid="cookie-consent-banner"><div><p className="font-bold text-[#12261F]" data-testid="cookie-consent-title">Your privacy matters</p><p className="mt-1 max-w-xl text-sm text-[#4A5A55]" data-testid="cookie-consent-copy">We use essential cookies to keep this site working and optional analytics to improve it.</p></div><div className="flex shrink-0 gap-2"><Button variant="outline" onClick={() => decide("declined")} className="rounded-full" data-testid="cookie-decline-button">Decline</Button><Button onClick={() => decide("accepted")} className="rounded-full bg-[#2D6A4F]" data-testid="cookie-accept-button">Accept</Button></div></motion.div>}</AnimatePresence>;
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => { installGoogleTranslate(); }, []);
  useEffect(() => {
    setDocumentLanguage(getStoredLanguage());
    // Swap the page's title, description, canonical, social tags and structured data.
    if (document.head.querySelector("title[data-seo]")?.textContent !== routeMeta(location.pathname).title) {
      document.head.querySelectorAll("[data-seo]").forEach((node) => node.remove());
      document.head.insertAdjacentHTML("afterbegin", renderHead(location.pathname));
    }
  }, [location.pathname]);
  // New pages open at the top; links with a #section (e.g. /services#options) scroll to it.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) { window.scrollTo({ top: 0, behavior: "auto" }); return; }
    const frame = window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  return <div className="min-h-svh bg-[#F5F7F6] text-[#12261F]" data-testid="site-shell"><LandingIntro active={location.pathname === "/"} /><Header /><main className="site-main">{children}</main><footer className="mt-3 overflow-hidden rounded-t-[2rem] bg-[#12261F] text-white shadow-[0_-12px_40px_rgba(18,38,31,.08)]" data-testid="site-footer"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:px-8"><div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white"><BrandMark className="h-8 w-auto" /></span><div><p className="font-bold">SwitchYard</p><p className="text-[9px] font-bold tracking-[0.2em] text-[#A8C5BA]">FX ADVISORY</p></div></div><p className="mt-6 max-w-xs text-sm leading-6 text-white/60">Trusted FX solutions for mid-market corporates. Simplify treasury risk management.</p></div><FooterColumn title="Products" links={[["Forward Contracts", "/services#forward-contracts"], ["Options & Strategies", "/services#options"], ["Payment Services", "/services#payments"], ["Treasury Support", "/services#treasury-support"]]} /><FooterColumn title="Company" links={[["About Us", "/about"], ["Market Insights", "/insights"], ["Contact", "/contact"], ["Login", "/login"]]} /><div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#A8C5BA]">Get in touch</p><a href={PHONE_HREF} className="block text-sm text-white/75 hover:text-white" data-testid="footer-phone-link">{PHONE_DISPLAY}</a><a href={EMAIL_HREF} className="mt-3 block text-sm text-white/75 hover:text-white" data-testid="footer-email-link">{EMAIL}</a><p className="mt-3 text-sm text-white/75" data-testid="footer-location">Sydney, Australia</p></div></div><div className="mx-auto max-w-7xl border-t border-white/10 px-5 py-8 lg:px-8"><div className="max-w-5xl space-y-3 text-xs leading-5 text-white/50" data-testid="footer-compliance-copy"><p>Switchyard Capital Pty Ltd is an Authorised Representative (ASIC AR No. 001318359) of Ebury Partners Australia Pty Limited (ACN 632 570 702) which holds an Australian Financial Services Licence (AFSL 520548).</p><p>Ebury Partners Australia Pty Limited ('Ebury') ACN 632 570 702, Registered Office: Level 20, 201 Elizabeth Street, Sydney NSW 2000. Ebury is authorised and regulated by the Australian Securities and Investments Commission (ASIC) to provide financial services under Australian Financial Services Licence (AFSL) 520548 and is registered with the Australian Transaction Reports and Analysis Centre (AUSTRAC).</p><p>For Australia and New Zealand the Programme Manager must also display Ebury's Legal &amp; Compliance documentation: <a href={EBURY_LEGAL_URL} target="_blank" rel="noreferrer" className="underline hover:text-white" data-testid="footer-ebury-legal-link">ebury.com/en-au/compliance-legal/legal</a></p><p>This information is general in nature and does not constitute financial advice.</p></div><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50"><Link to="/privacy" className="hover:text-white" data-testid="footer-privacy-link">Privacy Policy</Link><Link to="/terms" className="hover:text-white" data-testid="footer-terms-link">Terms of Service</Link><Link to="/compliance" className="hover:text-white" data-testid="footer-compliance-link">Compliance</Link><span>© 2026 SwitchYard FX. All rights reserved.</span><a href="https://usmanxdev.com/" target="_blank" rel="noreferrer" className="hover:text-white" data-testid="footer-designer-link">Design by UxmanKhan</a></div>{getStoredLanguage() !== "en" && <p className="mt-5 text-xs text-[#A8C5BA]" data-testid="translation-disclaimer">Translations are automated for convenience. The English version prevails.</p>}</div></footer><a href={`${WHATSAPP_URL}?text=Hello%20SwitchYard%2C%20I%27d%20like%20to%20discuss%20FX%20risk%20management.`} target="_blank" rel="noreferrer" className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(18,38,31,.24)] transition-[bottom,transform,opacity] duration-300 hover:scale-105 sm:bottom-6 sm:right-6" aria-label="Chat on WhatsApp" data-testid="floating-whatsapp-button"><SiWhatsapp size={28} color="currentColor" aria-hidden="true" /></a><div id="google_translate_element" aria-hidden="true" data-testid="google-translate-hidden-element" /><CookieBanner /><Toaster richColors /> </div>;
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) { return <div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#A8C5BA]">{title}</p><div className="grid gap-3">{links.map(([label, href]) => <Link key={label} to={href} className="text-sm text-white/70 hover:text-white" data-testid={`footer-${label.toLowerCase().replaceAll(" ", "-")}-link`}>{label}</Link>)}</div></div>; }