import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Globe2, Menu, MessageCircle, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import LandingIntro from "@/components/LandingIntro";
import { getStoredLanguage, installGoogleTranslate, LANGUAGES, setDocumentLanguage, type LanguageCode } from "@/lib/googleTranslate";

const navLinks = [["Home", "/"], ["About", "/about"], ["Services", "/services"], ["Market Insights", "/insights"], ["Contact", "/contact"]];

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.div className={className} initial={reducedMotion ? false : { opacity: 0, y: 28, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: reducedMotion ? 0 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
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

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 80); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <header className="fixed inset-x-0 top-0 z-[80] isolate px-3 pt-3" data-testid="site-header">
    <div className={`mx-auto flex max-w-7xl items-center justify-between rounded-[20px] border px-5 py-3.5 transition-[background-color,border-color,box-shadow,transform] duration-500 lg:px-7 ${scrolled ? "translate-y-0 border-white/15 bg-[#12261F]/94 shadow-[0_14px_38px_rgba(0,0,0,.2)] backdrop-blur-xl" : "translate-y-0 border-transparent bg-transparent shadow-none"}`} data-scrolled={scrolled ? "true" : "false"}>
      <Link to="/" className="group flex items-center gap-3" data-testid="header-logo-link"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#A8C5BA] text-lg font-bold text-[#12261F] transition-transform group-hover:rotate-6">S</span><span><span className="block text-lg font-bold tracking-tight text-white">SwitchYard</span><span className="block text-[9px] font-bold tracking-[0.2em] text-[#A8C5BA]">FX ADVISORY</span></span></Link>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">{navLinks.map(([name, href]) => <Link key={href} to={href} className="text-sm text-white/70 transition-colors hover:text-white" data-testid={`header-nav-${name.toLowerCase().replaceAll(" ", "-")}`}>{name}</Link>)}</nav>
      <div className="hidden items-center gap-3 lg:flex"><LanguageSwitcher /><Link to="/login" className={buttonVariants({ variant: "outline", size: "sm" }) + " rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="header-login-link">Login</Link><a href="https://cal.com/" target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm" }) + " rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="header-book-call-link">Book a Call <ArrowUpRight size={14} /></a></div>
      <button type="button" onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white lg:hidden" aria-label="Open menu" data-testid="mobile-menu-open-button"><Menu size={20} /></button>
    </div>
    <AnimatePresence>{menuOpen && <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 24 }} className="fixed inset-0 z-50 flex flex-col bg-[#12261F] p-6 lg:hidden" data-testid="mobile-menu"><div className="flex items-center justify-between"><span className="text-lg font-bold text-white">SwitchYard</span><button type="button" onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white" aria-label="Close menu" data-testid="mobile-menu-close-button"><X size={20} /></button></div><nav className="mt-14 grid gap-5">{navLinks.map(([name, href]) => <Link key={href} to={href} className="text-3xl font-bold text-white" data-testid={`mobile-nav-${name.toLowerCase().replaceAll(" ", "-")}`}>{name}</Link>)}<Link to="/login" className="text-3xl font-bold text-white" data-testid="mobile-nav-login">Login</Link></nav><div className="mt-auto grid gap-4"><LanguageSwitcher mobile /><a href="https://cal.com/" target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#A8C5BA] text-[#12261F]"} data-testid="mobile-book-call-link">Book a Call <ArrowUpRight size={18} /></a></div></motion.div>}</AnimatePresence>
  </header>;
}

function CookieBanner() {
  const [visible, setVisible] = useState(() => window.localStorage.getItem("switchyard-cookies") !== "accepted");
  if (!visible) return null;
  function decide(value: string) { window.localStorage.setItem("switchyard-cookies", value); setVisible(false); }
  return <motion.div initial={{ y: 120 }} animate={{ y: 0 }} className="fixed bottom-3 left-3 right-3 z-[90] mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-[#DCE5E1] bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:items-center sm:justify-between" data-testid="cookie-consent-banner"><div><p className="font-bold text-[#12261F]" data-testid="cookie-consent-title">Your privacy matters</p><p className="mt-1 max-w-xl text-sm text-[#4A5A55]" data-testid="cookie-consent-copy">We use essential cookies to keep this site working and optional analytics to improve it.</p></div><div className="flex shrink-0 gap-2"><Button variant="outline" onClick={() => decide("declined")} className="rounded-full" data-testid="cookie-decline-button">Decline</Button><Button onClick={() => decide("accepted")} className="rounded-full bg-[#2D6A4F]" data-testid="cookie-accept-button">Accept</Button></div></motion.div>;
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => { installGoogleTranslate(); }, []);
  useEffect(() => {
    setDocumentLanguage(getStoredLanguage());
    const metadata: Record<string, [string, string]> = {
      "/": ["SwitchYard FX | Manage FX Risk With Confidence", "Tailored corporate FX risk management for mid-market CFOs and treasury teams."],
      "/about": ["About | SwitchYard FX", "Meet the corporate FX advisory partner helping mid-market CFOs protect margins and unlock growth."],
      "/services": ["Corporate FX Solutions | SwitchYard FX", "Forward contracts, options, global payments, FX risk advisory and treasury support."],
      "/insights": ["Market Insights | SwitchYard FX", "Curated FX insights, trends and analysis for Australian treasury and finance leaders."],
      "/contact": ["Contact | SwitchYard FX", "Book a 15-minute FX strategy consultation with the SwitchYard FX team in Sydney."],
      "/login": ["Client Login | SwitchYard FX", "Secure access to the SwitchYard FX client portal."],
      "/privacy": ["Privacy Policy | SwitchYard FX", "Read the SwitchYard FX privacy policy."],
      "/terms": ["Terms of Service | SwitchYard FX", "Read the SwitchYard FX website terms of service."],
      "/compliance": ["Compliance | SwitchYard FX", "SwitchYard FX regulatory, compliance and legal information."],
    };
    const [title, description] = metadata[location.pathname] ?? (location.pathname.startsWith("/insights/") ? ["FX Market Analysis | SwitchYard FX", "Clear market context for better treasury decisions."] : ["Page Not Found | SwitchYard FX", "Return to SwitchYard FX corporate risk management."]);
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);
  return <div className="min-h-svh bg-[#F5F7F6] text-[#12261F]" data-testid="site-shell"><LandingIntro active={location.pathname === "/"} /><Header /><main className="site-main">{children}</main><footer className="mt-3 overflow-hidden rounded-t-[2rem] bg-[#12261F] text-white shadow-[0_-12px_40px_rgba(18,38,31,.08)]" data-testid="site-footer"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:px-8"><div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#A8C5BA] font-bold text-[#12261F]">S</span><div><p className="font-bold">SwitchYard</p><p className="text-[9px] font-bold tracking-[0.2em] text-[#A8C5BA]">FX ADVISORY</p></div></div><p className="mt-6 max-w-xs text-sm leading-6 text-white/60">Corporate FX risk management for mid-market CFOs, finance leaders and treasury professionals.</p><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="mt-6 inline-flex text-sm font-bold text-[#A8C5BA] hover:text-white" data-testid="footer-linkedin-link">Follow on LinkedIn <ArrowUpRight size={14} /></a></div><FooterColumn title="Products" links={[["Forward Contracts", "/services"], ["Options & Strategies", "/services"], ["Payment Services", "/services"], ["Treasury Support", "/services"]]} /><FooterColumn title="Company" links={[["About Us", "/about"], ["Market Insights", "/insights"], ["Contact", "/contact"], ["Login", "/login"]]} /><div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#A8C5BA]">Get in touch</p><a href="tel:+61272263680" className="block text-sm text-white/75 hover:text-white" data-testid="footer-phone-link">02 7226 3680</a><a href="mailto:admin@switchyardfx.com.au" className="mt-3 block text-sm text-white/75 hover:text-white" data-testid="footer-email-link">admin@switchyardfx.com.au</a><p className="mt-3 text-sm text-white/75" data-testid="footer-location">Sydney, Australia</p></div></div><div className="mx-auto max-w-7xl border-t border-white/10 px-5 py-8 lg:px-8"><p className="max-w-5xl text-xs leading-5 text-white/50" data-testid="footer-compliance-copy">Switchyard Capital Pty Ltd (ASIC AR No. 001318359), Authorised Representative of Ebury Partners Australia Pty Limited, ACN 632 570 702, AFSL 520548. Registered Office: Level 20, 201 Elizabeth Street, Sydney NSW 2000. AUSTRAC registered. <a href="https://www.ebury.com/en-au/compliance-legal/legal" target="_blank" rel="noreferrer" className="underline hover:text-white">Legal information</a>. This information is general in nature and does not constitute financial advice.</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50"><Link to="/privacy" className="hover:text-white" data-testid="footer-privacy-link">Privacy Policy</Link><Link to="/terms" className="hover:text-white" data-testid="footer-terms-link">Terms of Service</Link><Link to="/compliance" className="hover:text-white" data-testid="footer-compliance-link">Compliance</Link><span>© 2026 SwitchYard FX. All rights reserved.</span><a href="https://usmanxdev.com/" target="_blank" rel="noreferrer" className="hover:text-white" data-testid="footer-designer-link">Design by UxmanKhan</a></div>{getStoredLanguage() !== "en" && <p className="mt-5 text-xs text-[#A8C5BA]" data-testid="translation-disclaimer">Translations are automated for convenience. The English version prevails.</p>}</div></footer><a href="https://wa.me/61272263680?text=Hello%20SwitchYard%2C%20I%27d%20like%20to%20discuss%20FX%20risk%20management." target="_blank" rel="noreferrer" className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(18,38,31,.24)] transition-[bottom,transform] duration-300 hover:scale-105 sm:bottom-6 sm:right-6" aria-label="Chat on WhatsApp" data-testid="floating-whatsapp-button"><MessageCircle size={25} /></a><div id="google_translate_element" aria-hidden="true" data-testid="google-translate-hidden-element" /><CookieBanner /><Toaster richColors /> </div>;
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) { return <div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#A8C5BA]">{title}</p><div className="grid gap-3">{links.map(([label, href]) => <Link key={label} to={href} className="text-sm text-white/70 hover:text-white" data-testid={`footer-${label.toLowerCase().replaceAll(" ", "-")}-link`}>{label}</Link>)}</div></div>; }