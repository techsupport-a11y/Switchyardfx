import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import "@fontsource-variable/outfit";
import GlyphPortal from "@/components/GlyphPortal";
import { buttonVariants } from "@/components/ui/button";
import { BOOKING_URL, WHATSAPP_URL } from "@/lib/siteLinks";

// The closing call to action above the footer: scrolling flies the camera through a letter of
// "SWITCHYARD" into the forest-green field, where the consultation CTA is waiting.
const WORD = "SWITCHYARD";
// GlyphPortal only animates with a face that is already loaded (and that every device has), so
// it uses the bundled Outfit and mounts once that face is ready. Until then the same CTA shows
// as a plain section.
const FONT = '"Outfit Variable", sans-serif';
const FONT_QUERY = `900 100px "Outfit Variable"`;

function Cta() {
  return <div className="mx-auto w-full max-w-7xl" data-testid="final-cta-content">
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#A8C5BA]">Start the conversation</p>
    <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl" data-testid="final-cta-heading">Ready to transform <span className="text-[#A8C5BA]">your treasury?</span></h2>
    <p className="mt-6 max-w-xl text-lg leading-8 text-white/65" data-testid="final-cta-description">Schedule a 15-minute consultation with our FX specialists. No obligation. Just expert advice tailored to your situation.</p>
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      <a href={BOOKING_URL} target="_blank" rel="noreferrer" className={buttonVariants({ size: "lg" }) + " justify-center rounded-full bg-[#A8C5BA] text-[#12261F] hover:bg-white"} data-testid="final-book-consult-button">Book Consultation <ArrowRight size={17} /></a>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "lg" }) + " justify-center rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"} data-testid="final-whatsapp-button">WhatsApp Us</a>
    </div>
  </div>;
}

function BrandField(): ReactNode {
  return <div style={{ position: "absolute", inset: 0, transform: "scale(var(--gp-field-scale,1))", background: "radial-gradient(circle at 18% 10%, rgba(168,197,186,.28), transparent 36%), radial-gradient(circle at 85% 25%, rgba(82,121,111,.45), transparent 32%), radial-gradient(circle at 50% 85%, rgba(45,106,79,.55), transparent 46%), linear-gradient(135deg,#12261F 0%,#1f4a3a 50%,#0d1d17 100%)" }} />;
}

export default function ClosingPortal() {
  const [fontReady, setFontReady] = useState(() => {
    try { return document.fonts.check(FONT_QUERY, WORD); } catch { return false; }
  });
  useEffect(() => {
    if (fontReady) return;
    let alive = true;
    // If the font fails to load, GlyphPortal still renders its static, readable layout.
    document.fonts.load(FONT_QUERY, WORD).finally(() => { if (alive) setFontReady(true); });
    return () => { alive = false; };
  }, [fontReady]);

  if (!fontReady) {
    return <section className="bg-[#12261F] px-5 py-20 lg:px-8 lg:py-28" data-testid="final-cta-section"><Cta /></section>;
  }
  return <div data-testid="final-cta-section">
    <GlyphPortal
      word={WORD}
      fontFamily={FONT}
      fontWeight={900}
      enterLabel="Skip to booking"
      background={<BrandField />}
      front={<p className="absolute inset-x-0 text-center text-xs font-bold uppercase tracking-[0.22em] text-[#52796F]" style={{ top: "calc(var(--gp-word-top, 30%) - 3.5rem)" }}>Clarity in motion</p>}
      style={{ "--gp-paper": "#F5F7F6", "--gp-ink": "#12261F", "--gp-field": "#12261F", "--gp-foreground": "#fff", fontFamily: "inherit" }}
    >
      <Cta />
    </GlyphPortal>
  </div>;
}
