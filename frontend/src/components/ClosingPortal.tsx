import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import "@fontsource-variable/plus-jakarta-sans";
import GlyphPortal from "@/components/ui/glyph-portal";
import KineticGrid from "@/components/ui/kinetic-grid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BOOKING_URL, WHATSAPP_URL } from "@/lib/siteLinks";

// The closing call to action above the footer, laid out like the Glyph Portal demo: scrolling
// flies the camera through a letter of "SWITCHYARD" into the forest-green field, where our
// process and consultation CTA are waiting.
const WORD = "SWITCHYARD";
// GlyphPortal only animates with a face that is already loaded, so it uses the bundled Plus
// Jakarta Sans (the demo's face) and mounts once that face is ready. Until then the same
// content shows as a plain section.
// Only the bundled face plus a generic fallback: GlyphPortal stays static if any named family in
// the stack isn't installed (Arial, for example, is missing on Android).
const FACE = '"Plus Jakarta Sans Variable", sans-serif';
const FONT_QUERY = `700 100px "Plus Jakarta Sans Variable"`;

// Copy from the original switchyardfx.com.au "How we work" and CTA sections.
const steps = [
  ["01", "Assess", "We analyse your FX exposure, cash flows, and risk tolerance to understand your unique situation."],
  ["02", "Hedge", "Design and execute tailored strategies. Forward contracts, options, or custom structures."],
  ["03", "Track", "Real-time monitoring and reporting. Transparent dashboards showing P&L and position management."],
];

function Content() {
  return <div data-closing-copy data-testid="final-cta-content">
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#52796F]">Start the conversation</p>
      <h2 data-testid="final-cta-heading">Ready to transform your treasury?</h2>
      <p data-closing-lede data-testid="final-cta-description">Schedule a 15-minute consultation with our FX specialists. No obligation. Just expert advice tailored to your situation.</p>
    </div>
    <div data-closing-features>
      {steps.map(([no, title, copy]) => <div data-closing-feature key={no}><h3><span data-closing-no>{no}</span>{title}</h3><p>{copy}</p></div>)}
    </div>
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <a href={BOOKING_URL} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "lg" }), "justify-center rounded-full bg-[#2D6A4F] text-white hover:bg-[#12261F]")} data-testid="final-book-consult-button">Book Consultation <ArrowRight size={17} /></a>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "justify-center rounded-full border-[#2D6A4F] bg-white text-[#12261F] hover:bg-[#E8EEEB] hover:text-[#12261F]")} data-testid="final-whatsapp-button">WhatsApp Us</a>
    </div>
  </div>;
}

// White field with the interactive olive kinetic grid: plain lines that warp toward
// the pointer and ripple on click.
function BrandField() {
  return <>
    <div style={{ position: "absolute", inset: 0, transform: "scale(var(--gp-field-scale,1))", background: "#FFFFFF" }} />
    <KineticGrid globalColor="olive" className="absolute inset-0 min-h-0" />
  </>;
}

// Demo-style composition around the word, scoped to this section.
const styles = `
  [data-closing-portal] [data-gp-caption]{inset:calc(var(--gp-word-bottom,50%) + 82px) 24px auto;justify-content:center;}
  [data-closing-portal] [data-gp-hint]{display:none;}
  [data-closing-portal] [data-gp-enter]{min-height:46px;padding:0 22px;gap:28px;background:#A8C5BA;border:1px solid #A8C5BA;border-radius:999px;color:#12261F;font-size:13px;font-weight:600;box-shadow:0 1px 2px rgba(18,38,31,.1);transition:background .18s,box-shadow .18s;}
  [data-closing-portal] [data-gp-enter]:hover{background:#FFFFFF;box-shadow:0 3px 8px rgba(18,38,31,.1);}
  [data-closing-portal] [data-gp-enter]:focus-visible{outline:2px solid #A8C5BA;outline-offset:4px;}
  [data-closing-portal] [data-gp-touch-picker]{top:auto;bottom:18px;left:50%;}
  [data-closing-portal] [data-gp-select]{border-color:transparent;border-radius:8px;font-size:12px;color:#A8C5BA;}
  [data-closing-eyebrow]{position:absolute;inset:auto 24px calc(100% - var(--gp-word-top,35%) + 32px);margin:0;text-align:center;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#A8C5BA;}
  [data-closing-support]{position:absolute;inset:calc(var(--gp-word-bottom,50%) + 32px) 24px auto;margin:0;text-align:center;font-size:16px;line-height:1.5;color:rgba(255,255,255,.72);}
  [data-closing-scroll]{position:absolute;inset:auto 24px 7%;text-align:center;color:rgba(168,197,186,.75);font-size:11px;letter-spacing:.01em;}
  @media(any-pointer:coarse){[data-closing-scroll]{bottom:13%;}}
  @media(max-width:450px){[data-closing-eyebrow]{font-size:11px;}[data-closing-support]{font-size:14px;}[data-closing-portal] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 76px);}}
  @media(max-height:479px){[data-closing-support]{top:calc(var(--gp-word-bottom,50%) + 16px);}[data-closing-portal] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 60px);}[data-closing-scroll]{display:none;}}
  [data-closing-portal] [data-gp-content]{padding:6.5rem clamp(1.25rem,5vw,5rem) 6.5rem;font-family:inherit;}
  [data-closing-portal] section,[data-closing-portal] [data-gp-caption]{font-family:inherit;}
  [data-closing-copy]{display:flex;width:min(100%,80rem);margin:auto;flex-direction:column;align-items:flex-start;gap:clamp(2rem,5svh,3.5rem);}
  [data-closing-copy] h2{max-width:48rem;margin:0;color:#12261F;font-size:clamp(2rem,1.2rem + 2.6vw,3.25rem);font-weight:700;line-height:1.1;letter-spacing:-.03em;text-wrap:balance;}
  [data-closing-lede]{max-width:38rem;margin:1rem 0 0;color:#4A5A55;font-size:1.0625rem;line-height:1.6;}
  [data-closing-features]{display:grid;width:100%;grid-template-columns:1fr;gap:1.75rem;}
  [data-closing-feature]{border-top:1px solid rgba(18,38,31,.14);padding-top:1.1rem;}
  [data-closing-feature] h3{margin:0;color:#12261F;font-size:1.125rem;font-weight:600;line-height:1.2;}
  [data-closing-feature] p{margin:.55rem 0 0;color:#4A5A55;font-size:.9375rem;line-height:1.55;}
  [data-closing-no]{display:inline-block;margin-right:.7rem;color:#708238;font:600 .75rem ui-monospace,monospace;letter-spacing:.08em;transform:translateY(-.1em);}
  @media(min-width:768px){[data-closing-features]{grid-template-columns:repeat(3,minmax(0,1fr));gap:3.5rem;}}
`;

export default function ClosingPortal() {
  const [fontReady, setFontReady] = useState(() => {
    try { return document.fonts.check(FONT_QUERY, WORD); } catch { return false; }
  });
  useEffect(() => {
    if (fontReady) return;
    let alive = true;
    // If the face fails to load, GlyphPortal still renders its static, readable layout.
    document.fonts.load(FONT_QUERY, WORD).finally(() => { if (alive) setFontReady(true); });
    return () => { alive = false; };
  }, [fontReady]);

  return <div data-closing-portal data-testid="final-cta-section" style={{ fontFamily: FACE }}>
    <style>{styles}</style>
    {fontReady
      ? <GlyphPortal
          word={WORD}
          fontFamily={FACE}
          fontWeight={700}
          enterLabel="Step inside"
          background={<BrandField />}
          style={{ "--gp-paper": "#12261F", "--gp-ink": "#FFFFFF", "--gp-field": "#FFFFFF", "--gp-foreground": "#12261F", fontFamily: FACE }}
          front={<>
            <p data-closing-eyebrow>Clarity in motion</p>
            <p data-closing-support>Manage FX risk with confidence.</p>
            <span data-closing-scroll>Scroll for a closer look ↓</span>
          </>}
        >
          <Content />
        </GlyphPortal>
      : <section className="relative isolate overflow-hidden bg-white px-5 py-24 lg:px-8"><div className="absolute inset-0 -z-10"><BrandField /></div><Content /></section>}
  </div>;
}
