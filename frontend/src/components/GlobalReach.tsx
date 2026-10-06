import type { ComponentType, CSSProperties, SVGProps } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Flags from "country-flag-icons/react/3x2";
import { FlagGlobe, type FlagGlobeMarker } from "@/components/ui/flag-globe";
import { Reveal, SectionLabel } from "@/components/SiteShell";
import { switchyardService } from "@/services/switchyard";

// The currencies tracked on the original switchyardfx.com.au market chart, each pinned at its
// issuer. The euro has no single country, so it sits at Brussels under the EU flag.
const CURRENCIES = [
  { currency: "AUD", code: "AU" }, { currency: "USD", code: "US" }, { currency: "EUR", code: "EU", location: [50.8503, 4.3517] as [number, number], label: "Eurozone" },
  { currency: "GBP", code: "GB" }, { currency: "JPY", code: "JP" }, { currency: "NZD", code: "NZ" },
  { currency: "CAD", code: "CA" }, { currency: "CNY", code: "CN" }, { currency: "SGD", code: "SG" },
  { currency: "HKD", code: "HK" }, { currency: "INR", code: "IN" }, { currency: "MXN", code: "MX" },
];
const MARKERS: FlagGlobeMarker[] = CURRENCIES.map(({ code, location, label }) => ({ code, location, label }));
// Rotation that turns Australia toward the viewer on first paint.
const FACE_AUSTRALIA = 2.4;

type FlagSvg = ComponentType<SVGProps<SVGSVGElement>>;
const flagFor = (code: string) => (Flags as unknown as Record<string, FlagSvg | undefined>)[code];

// The globe reads the shadcn theme tokens, so this dark section re-scopes them to the brand.
const darkTokens = {
  "--background": "#12261F",
  "--foreground": "#F5F7F6",
  "--primary": "#A8C5BA",
  "--muted": "#1C382E",
  "--muted-foreground": "#A8C5BA",
  "--border": "rgba(255,255,255,.12)",
  "--ring": "#A8C5BA",
} as CSSProperties;

export default function GlobalReach() {
  // Shares the hero's live market query, so no extra request is made.
  const market = useQuery({ queryKey: ["market-overview"], queryFn: switchyardService.getMarketOverview, retry: false, staleTime: 60_000, refetchInterval: 60_000 });
  const quotes = market.data?.quotes ?? [];
  const live = market.data?.source === "live";

  return <section className="relative overflow-hidden bg-[#12261F] px-5 py-20 text-white lg:px-8 lg:py-28" style={darkTokens} data-testid="global-reach-section">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(82,121,111,.28),transparent_45%)]" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
      <Reveal from="left">
        <SectionLabel>Global reach</SectionLabel>
        <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl" data-testid="global-reach-heading">From Australia<br /><span className="text-[#A8C5BA]">to the world.</span></h2>
        <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">Robust and fully secure payment infrastructure to enable reliable transfers across the globe, with live AUD pricing on the corridors you use most.</p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5" data-testid="global-reach-rates">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            <span>AUD pricing</span>
            <span className={`flex items-center gap-2 ${live ? "text-[#6EE7A8]" : "text-[#E8D9A0]"}`}><span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-[#6EE7A8]" : "bg-[#E8D9A0]"}`} />{market.isLoading ? "Updating" : live ? "Live" : "Indicative"}</span>
          </div>
          <div className="mt-4 grid gap-2">
            {(quotes.length ? quotes : [{ pair: "AUD/USD" }, { pair: "AUD/EUR" }, { pair: "AUD/GBP" }]).map((quote) => {
              const rate = "rate" in quote ? quote.rate : undefined;
              const change = "change" in quote ? quote.change : undefined;
              const Flag = flagFor(CURRENCIES.find((c) => c.currency === quote.pair.split("/")[1])?.code ?? "");
              return <div key={quote.pair} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3" data-testid={`global-rate-${quote.pair.replace("/", "-").toLowerCase()}`}>
                <span className="flex items-center gap-3 font-bold">{Flag && <span className="block h-3.5 w-5 overflow-hidden rounded-[2px]"><Flag width="100%" height="100%" /></span>}{quote.pair}</span>
                <span className="flex items-baseline gap-3"><span className="text-lg font-bold tabular-nums">{rate !== undefined ? rate.toFixed(4) : "—"}</span>{change !== undefined && <span className={`text-xs font-bold tabular-nums ${change >= 0 ? "text-[#6EE7A8]" : "text-red-300"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>}</span>
              </div>;
            })}
          </div>
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-white/50">{CURRENCIES.length} currencies in our market coverage</p>
        <ul className="mt-3 flex flex-wrap gap-2" data-testid="global-reach-currencies">
          {CURRENCIES.map(({ currency, code }) => { const Flag = flagFor(code); return <li key={currency} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/80">{Flag && <span className="block h-3 w-[18px] overflow-hidden rounded-[2px]"><Flag width="100%" height="100%" /></span>}{currency}</li>; })}
        </ul>
      </Reveal>

      <Reveal from="scale" delay={0.1} className="flex justify-center">
        <FlagGlobe
          markers={MARKERS}
          dark
          phi={FACE_AUSTRALIA}
          altitude={0.2}
          rotationSpeed={0.16}
          baseColor="#1f4a3a"
          glowColor="#52796F"
          markerDots
          style={{ width: "min(560px, 100%)" }}
          data-testid="global-reach-globe"
        />
      </Reveal>
    </div>
  </section>;
}
