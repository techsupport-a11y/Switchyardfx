// On-brand line illustrations for the Services cards. Each one draws the shape of the
// instrument it sits on (a locked rate, a protected range, payment corridors, a hedge
// ladder, an engagement timeline) using the site palette, so no stock photography is needed.
const SAGE = "#A8C5BA";
const MUTED = "rgba(255,255,255,.35)";
const GRID = "rgba(255,255,255,.07)";
const LABEL = "rgba(255,255,255,.5)";

type Point = [number, number];
const toPath = (points: Point[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

function Grid({ width, height }: { width: number; height: number }) {
  const rows = [0.25, 0.5, 0.75].map((f) => Math.round(height * f));
  return <g stroke={GRID} strokeWidth="1">{rows.map((y) => <line key={y} x1="24" x2={width - 24} y1={y} y2={y} />)}</g>;
}

// The drawings shrink to ~60% on phones, so labels use a larger size in drawing units there
// to stay readable (CSS font-size on SVG text is in the drawing's own units).
const TEXT_SIZES = {
  11: "text-[17px] sm:text-[11px]",
  12: "text-[18px] sm:text-[12px]",
  13: "text-[19px] sm:text-[13px]",
  14: "text-[20px] sm:text-[14px]",
} as const;

function Text({ x, y, children, anchor = "start", fill = LABEL, size = 11, weight = 600 }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end"; fill?: string; size?: keyof typeof TEXT_SIZES; weight?: number }) {
  return <text x={x} y={y} textAnchor={anchor} fill={fill} className={TEXT_SIZES[size]} fontWeight={weight} letterSpacing=".04em">{children}</text>;
}

export function ForwardIllustration() {
  const spot: Point[] = [[40, 120], [70, 96], [100, 132], [130, 104], [160, 150], [190, 118], [220, 162], [250, 132], [280, 176], [310, 140], [340, 184], [370, 148], [400, 172], [440, 142]];
  return <svg viewBox="0 0 480 240" className="h-auto w-full" role="img" aria-label="A volatile spot rate next to a flat locked forward rate">
    <Grid width={480} height={240} />
    <path d={toPath(spot)} fill="none" stroke={MUTED} strokeWidth="2" strokeLinejoin="round" />
    <line x1="40" x2="440" y1="108" y2="108" stroke={SAGE} strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="40" cy="108" r="6" fill={SAGE} /><circle cx="440" cy="108" r="6" fill={SAGE} />
    <Text x={40} y={86} fill={SAGE}>LOCKED RATE</Text>
    <Text x={440} y={194} anchor="end">SPOT</Text>
    <Text x={40} y={224}>Today</Text><Text x={440} y={224} anchor="end">Settlement</Text>
  </svg>;
}

export function OptionsIllustration() {
  const cap = 70, floor = 172;
  const spot: Point[] = [[40, 132], [80, 104], [120, 62], [160, 44], [200, 88], [240, 138], [280, 196], [320, 208], [360, 164], [400, 122], [440, 92]];
  const protectedPath = spot.map(([x, y]) => [x, Math.min(Math.max(y, cap), floor)] as Point);
  return <svg viewBox="0 0 480 240" className="h-auto w-full" role="img" aria-label="A rate path held between a cap and a floor">
    <rect x="40" y={cap} width="400" height={floor - cap} rx="10" fill={SAGE} fillOpacity=".08" />
    <line x1="40" x2="440" y1={cap} y2={cap} stroke={SAGE} strokeOpacity=".6" strokeDasharray="6 6" />
    <line x1="40" x2="440" y1={floor} y2={floor} stroke={SAGE} strokeOpacity=".6" strokeDasharray="6 6" />
    <path d={toPath(spot)} fill="none" stroke={MUTED} strokeWidth="2" strokeLinejoin="round" />
    <path d={toPath(protectedPath)} fill="none" stroke={SAGE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
    <Text x={46} y={cap - 10} fill={SAGE}>CAP</Text>
    <Text x={440} y={floor + 22} anchor="end" fill={SAGE}>FLOOR</Text>
    <Text x={40} y={224}>Protected range</Text>
  </svg>;
}

export function PaymentsIllustration() {
  const from: Point = [104, 120];
  const to: [string, Point][] = [["USD", [380, 56]], ["EUR", [380, 120]], ["GBP", [380, 184]]];
  return <svg viewBox="0 0 480 240" className="h-auto w-full" role="img" aria-label="Payments flowing from AUD to USD, EUR and GBP">
    {to.map(([code, [x, y]]) => <g key={code}>
      <path d={`M${from[0] + 36} ${from[1]} C ${from[0] + 140} ${from[1]}, ${x - 130} ${y}, ${x - 28} ${y}`} fill="none" stroke={SAGE} strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
      <circle cx={x} cy={y} r="26" fill="#1C382E" stroke={SAGE} strokeOpacity=".35" />
      <Text x={x} y={y + 4} anchor="middle" fill="#fff" size={12} weight={700}>{code}</Text>
    </g>)}
    <circle cx={from[0]} cy={from[1]} r="36" fill="#2D6A4F" />
    <Text x={from[0]} y={from[1] + 5} anchor="middle" fill="#fff" size={14} weight={700}>AUD</Text>
    <Text x={40} y={224}>Same-day or T+1 settlement</Text>
  </svg>;
}

export function AdvisoryIllustration() {
  const ratios = [90, 80, 68, 55, 45, 35];
  const base = 196, top = 40, barWidth = 44, gap = 22, left = 52;
  const scale = (pct: number) => ((base - top) * pct) / 100;
  const target: Point[] = ratios.map((pct, i) => [left + i * (barWidth + gap) + barWidth / 2, base - scale(Math.min(pct + 8, 100))]);
  return <svg viewBox="0 0 480 240" className="h-auto w-full" role="img" aria-label="Hedge ratios that step down across a six-month horizon">
    <Grid width={480} height={240} />
    {ratios.map((pct, i) => <rect key={i} x={left + i * (barWidth + gap)} y={base - scale(pct)} width={barWidth} height={scale(pct)} rx="8" fill={SAGE} fillOpacity={1 - i * 0.13} />)}
    <path d={toPath(target)} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="5 5" />
    {ratios.map((_, i) => <Text key={i} x={left + i * (barWidth + gap) + barWidth / 2} y={220} anchor="middle">{`${i + 1}M`}</Text>)}
    <Text x={40} y={28} fill={SAGE}>HEDGE RATIO BY HORIZON</Text>
  </svg>;
}

export function TreasuryIllustration() {
  const steps = ["Exposure", "Structure", "Execute", "Review"];
  const x0 = 60, x1 = 460, y = 112;
  return <svg viewBox="0 0 520 240" className="h-auto w-full" role="img" aria-label="An engagement moving from exposure to structure, execution and review">
    <Grid width={520} height={240} />
    <line x1={x0} x2={x1} y1={y} y2={y} stroke={SAGE} strokeOpacity=".35" strokeWidth="2" />
    <line x1={x0} x2={x0 + ((x1 - x0) * 2) / 3} y1={y} y2={y} stroke={SAGE} strokeWidth="3.5" strokeLinecap="round" />
    {steps.map((step, i) => {
      const x = x0 + ((x1 - x0) * i) / (steps.length - 1);
      const done = i < 3;
      return <g key={step}>
        <circle cx={x} cy={y} r="18" fill={done ? SAGE : "#1C382E"} stroke={SAGE} strokeOpacity={done ? 1 : 0.5} strokeWidth="2" />
        <Text x={x} y={y + 5} anchor="middle" fill={done ? "#12261F" : SAGE} size={12} weight={700}>{String(i + 1)}</Text>
        <Text x={x} y={y + 50} anchor="middle" fill={done ? "#fff" : LABEL} size={13} weight={700}>{step}</Text>
      </g>;
    })}
  </svg>;
}
