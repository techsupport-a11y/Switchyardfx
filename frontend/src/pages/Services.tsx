import type { ComponentType } from "react";
import { ArrowRight, Banknote, BriefcaseBusiness, ChartNoAxesCombined, Check, CircleDollarSign, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import { AdvisoryIllustration, ForwardIllustration, OptionsIllustration, PaymentsIllustration, TreasuryIllustration } from "@/components/ServiceIllustrations";
import { BOOKING_URL } from "@/lib/siteLinks";

type Service = {
  id: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  image: ComponentType;
  tag: string;
  title: string;
  summary: string;
  copy: string;
  cta: string;
  benefits: string[];
  uses: string[];
};

// Copy from the original switchyardfx.com.au services pages.
const services: Service[] = [
  { id: "forward-contracts", icon: Banknote, image: ForwardIllustration, tag: "Most popular", title: "Forward Contracts", summary: "Lock in FX rates for future transactions with certainty.",
    copy: "Forward contracts provide certainty for your FX exposures by locking in exchange rates today for future settlements. Ideal for businesses with predictable cross-border cash flows.", cta: "Request pricing",
    benefits: ["Eliminates FX uncertainty on forecasted exposures", "Customisable maturity dates and amounts", "No upfront premium required", "Transparent pricing with competitive rates"],
    uses: ["Overseas supplier payments", "Forecast revenue hedging", "M&A transaction costs", "Dividend repatriation"] },
  { id: "options", icon: ShieldCheck, image: OptionsIllustration, tag: "Flexible", title: "Options & Zero Cost Structures", summary: "Protect downside while preserving profit potential.",
    copy: "Options and zero-cost collar strategies give you asymmetric risk profiles – protecting against downside while preserving profit potential when markets move in your favour.", cta: "Request pricing",
    benefits: ["Caps adverse FX moves while retaining upside", "Flexible premium structures", "Customisable strike prices", "Suited to strategic deals and M&A"],
    uses: ["Earnings protection", "Tender bid defence", "Strategic international expansion", "Seasonal exposure management"] },
  { id: "payments", icon: CircleDollarSign, image: PaymentsIllustration, tag: "Fast & secure", title: "Payments & Settlements", summary: "Competitive rates and efficient execution.",
    copy: "Streamlined cross-border payment solutions with highly competitive rates and transparent fees. Through our partnership with Ebury, we provide access to pricing typically reserved for larger institutions, delivered without the traditional institutional complexity.", cta: "Learn more",
    benefits: ["Competitive FX pricing", "Fast settlement (same-day or T+1)", "Transparent fee structure", "Multi-currency capabilities"],
    uses: ["Cross-border supplier payments", "Dividend repatriation", "International receivables", "Bank transfers and wire instructions"] },
  { id: "risk-advisory", icon: ChartNoAxesCombined, image: AdvisoryIllustration, tag: "Expert led", title: "Risk Strategy Advisory", summary: "Expert guidance on FX risk frameworks and policy.",
    copy: "Our advisory team works with you to design hedging policies, frameworks, and reporting structures that align with your risk appetite and business objectives.", cta: "Book consultation",
    benefits: ["Custom hedging policy development", "Scenario analysis & stress testing", "Board-level reporting frameworks", "Ongoing strategy optimisation"],
    uses: ["Hedging policy development", "Treasury KPI design", "Compliance documentation", "Board reporting standards"] },
  { id: "treasury-support", icon: BriefcaseBusiness, image: TreasuryIllustration, tag: "On demand", title: "Treasury Support", summary: "On-demand advisory for complex transactions.",
    copy: "On-demand treasury support for your most complex FX challenges. Our specialists provide real-time market insights and transaction structuring expertise.", cta: "Request support",
    benefits: ["Real-time market insights", "Complex transaction structuring", "Deal support & negotiation", "Execution oversight"],
    uses: ["Large M&A hedging", "Multi-currency restructuring", "Financing optimisation", "Refinancing FX strategies"] },
];

function ServiceCard({ service, wide = false }: { service: Service; wide?: boolean }) {
  const { id, icon: Icon, image: Image, tag, title, summary, copy, cta, benefits, uses } = service;
  return <article id={id} className={`group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-[2rem] border border-[#DCE5E1] bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl ${wide ? "lg:grid lg:grid-cols-[1.05fr_1fr]" : ""}`} data-testid={`service-card-${id}`}>
    <div className={`relative m-3 overflow-hidden rounded-[1.5rem] bg-[#12261F] px-3 pb-4 pt-16 sm:px-5 ${wide ? "lg:flex lg:items-center lg:pt-16" : ""}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(168,197,186,.16),transparent_55%)]" />
      <span className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A8C5BA]">{tag}</span>
      <span className="absolute right-5 top-4 grid h-10 w-10 place-items-center rounded-xl bg-[#A8C5BA] text-[#12261F] transition-transform duration-300 group-hover:rotate-6"><Icon size={19} /></span>
      <div className="relative w-full"><Image /></div>
    </div>
    <div className="flex flex-1 flex-col px-7 pb-7 pt-4 sm:px-8 sm:pb-8">
      <h2 className="text-2xl font-bold tracking-[-0.02em] sm:text-[1.7rem]" data-testid={`service-title-${id}`}>{title}</h2>
      <p className="mt-2 font-bold text-[#2D6A4F]">{summary}</p>
      <p className="mt-3 leading-7 text-[#4A5A55]">{copy}</p>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Key benefits</p>
      <ul className="mt-3 grid gap-2 text-sm text-[#12261F] sm:grid-cols-2">{benefits.map((item) => <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#2D6A4F]" />{item}</li>)}</ul>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-[#52796F]">Use cases</p>
      <ul className="mt-3 flex flex-wrap gap-2">{uses.map((item) => <li key={item} className="rounded-full border border-[#DCE5E1] bg-[#F5F7F6] px-3 py-1.5 text-xs font-bold text-[#4A5A55]">{item}</li>)}</ul>
      <div className="mt-auto pt-7"><Link to="/contact" className="inline-flex items-center gap-2 font-bold text-[#2D6A4F]" data-testid={`service-cta-${id}`}>{cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link></div>
    </div>
  </article>;
}

export default function Services() { return <>
  <section className="bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-24" data-testid="services-hero"><div className="mx-auto max-w-7xl"><Reveal><SectionLabel>What we do</SectionLabel><h1 className="max-w-5xl text-5xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-6xl" data-testid="services-heading">Corporate FX<br /><span className="text-[#A8C5BA]">solutions.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/60" data-testid="services-description">Tailored strategies for mid-market CFOs. Every solution is built for your business, not a one-size-fits-all approach.</p>
    <nav aria-label="Services on this page" className="mt-10 flex flex-wrap gap-2" data-testid="services-jump-links">{services.map(({ id, title }) => <a key={id} href={`#${id}`} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75 transition-colors hover:border-[#A8C5BA] hover:text-white">{title}</a>)}</nav>
  </Reveal></div></section>
  <section className="bg-[#F5F7F6] px-5 py-20 lg:px-8 lg:py-28" data-testid="services-list-section"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
    {services.map((service, index) => <Reveal key={service.id} delay={(index % 2) * 0.06} className={index === services.length - 1 ? "h-full lg:col-span-2" : "h-full"}><ServiceCard service={service} wide={index === services.length - 1} /></Reveal>)}
  </div></section>
  <section className="bg-white px-5 py-20 lg:px-8 lg:py-24" data-testid="services-cta-section"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[2rem] bg-[#E8EEEB] p-8 sm:p-12 lg:flex-row lg:items-center"><div><SectionLabel>Need a steer?</SectionLabel><h2 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl" data-testid="services-cta-heading">Not sure which solution fits?</h2><p className="mt-4 text-[#4A5A55]">Book a free consultation with our FX specialists to discuss your unique needs.</p></div><a href={BOOKING_URL} target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" }) + " rounded-full bg-[#2D6A4F] text-white hover:bg-[#3d8163]"} data-testid="services-book-consult-button">Book a free consultation <ArrowRight size={17} /></a></div></section>
 </>; }
