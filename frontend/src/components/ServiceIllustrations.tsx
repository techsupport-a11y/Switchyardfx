import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

// On-brand line illustrations for the Services cards. Each one draws the shape of the
// instrument it sits on (a locked rate, a protected range, payment corridors, a hedge
// ladder, an engagement timeline) using the site palette, so no stock photography is needed.
// They animate once as the card scrolls into view: lines draw, bars grow and nodes settle.
const SAGE = "#A8C5BA";
const MUTED = "rgba(255,255,255,.35)";
const GRID = "rgba(255,255,255,.07)";
const LABEL = "rgba(255,255,255,.5)";
const EASE = [0.22, 1, 0.36, 1] as const;

type Point = [number, number];
const toPath = (points: Point[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

// Solid strokes draw along their length. Dashed strokes can't (pathLength reuses the dash
// array), so they fade in instead.
const draw = (delay = 0, duration = 1.1): Variants => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { pathLength: { delay, duration, ease: EASE }, opacity: { delay, duration: 0.01 } } },
});
const fade = (delay = 0, duration = 0.6): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delay, duration, ease: EASE } },
});
const pop = (delay = 0): Variants => ({
  hidden: { opacity: 0, scale: 0.4 },
  show: { opacity: 1, scale: 1, transition: { delay, type: "spring", stiffness: 320, damping: 20 } },
});
const grow = (delay = 0): Variants => ({
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { delay, duration: 0.7, ease: EASE } },
});

function Scene({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return <motion.svg viewBox={viewBox} className="h-auto w-full" role="img" aria-label={label}
    initial={reducedMotion ? false : "hidden"} whileInView="show" viewport={{ once: true, amount: 0.45 }}>
    {children}
  </motion.svg>;
}

function Grid({ width, height }: { width: number; height: number }) {
  const rows = [0.25, 0.5, 0.75].map((f) => Math.round(height * f));
  return <motion.g stroke={GRID} strokeWidth="1" variants={fade(0, 0.4)}>{rows.map((y) => <line key={y} x1="24" x2={width - 24} y1={y} y2={y} />)}</motion.g>;
}

// The drawings shrink to ~60% on phones, so labels use a larger size in drawing units there
// to stay readable (CSS font-size on SVG text is in the drawing's own units).
const TEXT_SIZES = {
  11: "text-[17px] sm:text-[11px]",
  12: "text-[18px] sm:text-[12px]",
  13: "text-[19px] sm:text-[13px]",
  14: "text-[20px] sm:text-[14px]",
} as const;

function Text({ x, y, children, anchor = "start", fill = LABEL, size = 11, weight = 600, delay = 0.6 }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end"; fill?: string; size?: keyof typeof TEXT_SIZES; weight?: number; delay?: number }) {
  return <motion.text x={x} y={y} textAnchor={anchor} fill={fill} className={TEXT_SIZES[size]} fontWeight={weight} letterSpacing=".04em" variants={fade(delay, 0.5)}>{children}</motion.text>;
}

export function ForwardIllustration() {
  const spot: Point[] = [[40, 120], [70, 96], [100, 132], [130, 104], [160, 150], [190, 118], [220, 162], [250, 132], [280, 176], [310, 140], [340, 184], [370, 148], [400, 172], [440, 142]];
  return <Scene viewBox="0 0 480 240" label="A volatile spot rate next to a flat locked forward rate">
    <Grid width={480} height={240} />
    <motion.path d={toPath(spot)} fill="none" stroke={MUTED} strokeWidth="2" strokeLinejoin="round" variants={draw(0.1, 1.4)} />
    <motion.circle cx="40" cy="108" r="6" fill={SAGE} variants={pop(0.35)} />
    <motion.line x1="40" x2="440" y1="108" y2="108" stroke={SAGE} strokeWidth="3.5" strokeLinecap="round" variants={draw(0.45, 0.9)} />
    <motion.circle cx="440" cy="108" r="6" fill={SAGE} variants={pop(1.25)} />
    <Text x={40} y={86} fill={SAGE} delay={0.5}>LOCKED RATE</Text>
    <Text x={440} y={194} anchor="end" delay={1.2}>SPOT</Text>
    <Text x={40} y={224} delay={0.3}>Today</Text><Text x={440} y={224} anchor="end" delay={1.3}>Settlement</Text>
  </Scene>;
}

export function OptionsIllustration() {
  const cap = 70, floor = 172;
  const spot: Point[] = [[40, 132], [80, 104], [120, 62], [160, 44], [200, 88], [240, 138], [280, 196], [320, 208], [360, 164], [400, 122], [440, 92]];
  const protectedPath = spot.map(([x, y]) => [x, Math.min(Math.max(y, cap), floor)] as Point);
  return <Scene viewBox="0 0 480 240" label="A rate path held between a cap and a floor">
    <motion.rect x="40" y={cap} width="400" height={floor - cap} rx="10" fill={SAGE} fillOpacity=".08" style={{ originY: 0.5 }} variants={grow(0.05)} />
    <motion.line x1="40" x2="440" y1={cap} y2={cap} stroke={SAGE} strokeOpacity=".6" strokeDasharray="6 6" variants={fade(0.25)} />
    <motion.line x1="40" x2="440" y1={floor} y2={floor} stroke={SAGE} strokeOpacity=".6" strokeDasharray="6 6" variants={fade(0.25)} />
    <motion.path d={toPath(spot)} fill="none" stroke={MUTED} strokeWidth="2" strokeLinejoin="round" variants={draw(0.35, 1.3)} />
    <motion.path d={toPath(protectedPath)} fill="none" stroke={SAGE} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" variants={draw(0.75, 1.3)} />
    <Text x={46} y={cap - 10} fill={SAGE} delay={0.4}>CAP</Text>
    <Text x={440} y={floor + 22} anchor="end" fill={SAGE} delay={0.4}>FLOOR</Text>
    <Text x={40} y={224} delay={1.4}>Protected range</Text>
  </Scene>;
}

export function PaymentsIllustration() {
  const from: Point = [104, 120];
  const to: [string, Point][] = [["USD", [380, 56]], ["EUR", [380, 120]], ["GBP", [380, 184]]];
  return <Scene viewBox="0 0 480 240" label="Payments flowing from AUD to USD, EUR and GBP">
    {to.map(([code, [x, y]], i) => <g key={code}>
      {/* The corridor fades in, then its dashes keep flowing towards the destination. */}
      <motion.path d={`M${from[0] + 36} ${from[1]} C ${from[0] + 140} ${from[1]}, ${x - 130} ${y}, ${x - 28} ${y}`} className="flow-dash" fill="none" stroke={SAGE} strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" variants={fade(0.35 + i * 0.15)} />
      <motion.g variants={pop(0.6 + i * 0.15)}>
        <circle cx={x} cy={y} r="26" fill="#1C382E" stroke={SAGE} strokeOpacity=".35" />
        <text x={x} y={y + 4} textAnchor="middle" fill="#fff" className={TEXT_SIZES[12]} fontWeight={700} letterSpacing=".04em">{code}</text>
      </motion.g>
    </g>)}
    <motion.g variants={pop(0.1)}>
      <circle cx={from[0]} cy={from[1]} r="36" fill="#2D6A4F" />
      <text x={from[0]} y={from[1] + 5} textAnchor="middle" fill="#fff" className={TEXT_SIZES[14]} fontWeight={700} letterSpacing=".04em">AUD</text>
    </motion.g>
    <Text x={40} y={224} delay={1}>Same-day or T+1 settlement</Text>
  </Scene>;
}

export function AdvisoryIllustration() {
  const ratios = [90, 80, 68, 55, 45, 35];
  const base = 196, top = 40, barWidth = 44, gap = 22, left = 52;
  const scale = (pct: number) => ((base - top) * pct) / 100;
  const target: Point[] = ratios.map((pct, i) => [left + i * (barWidth + gap) + barWidth / 2, base - scale(Math.min(pct + 8, 100))]);
  return <Scene viewBox="0 0 480 240" label="Hedge ratios that step down across a six-month horizon">
    <Grid width={480} height={240} />
    {ratios.map((pct, i) => <motion.rect key={i} x={left + i * (barWidth + gap)} y={base - scale(pct)} width={barWidth} height={scale(pct)} rx="8" fill={SAGE} fillOpacity={1 - i * 0.13} style={{ originY: 1 }} variants={grow(0.1 + i * 0.09)} />)}
    <motion.path d={toPath(target)} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="5 5" variants={fade(0.85)} />
    {ratios.map((_, i) => <Text key={i} x={left + i * (barWidth + gap) + barWidth / 2} y={220} anchor="middle" delay={0.15 + i * 0.09}>{`${i + 1}M`}</Text>)}
    <Text x={40} y={28} fill={SAGE} delay={0.1}>HEDGE RATIO BY HORIZON</Text>
  </Scene>;
}

export function TreasuryIllustration() {
  const steps = ["Exposure", "Structure", "Execute", "Review"];
  const x0 = 60, x1 = 460, y = 112;
  return <Scene viewBox="0 0 520 240" label="An engagement moving from exposure to structure, execution and review">
    <Grid width={520} height={240} />
    <motion.line x1={x0} x2={x1} y1={y} y2={y} stroke={SAGE} strokeOpacity=".35" strokeWidth="2" variants={fade(0.05)} />
    <motion.line x1={x0} x2={x0 + ((x1 - x0) * 2) / 3} y1={y} y2={y} stroke={SAGE} strokeWidth="3.5" strokeLinecap="round" variants={draw(0.2, 1.2)} />
    {steps.map((step, i) => {
      const x = x0 + ((x1 - x0) * i) / (steps.length - 1);
      const done = i < 3;
      // Each step settles as the progress line reaches it.
      const at = 0.2 + i * 0.4;
      return <g key={step}>
        <motion.g variants={pop(at)}>
          <circle cx={x} cy={y} r="18" fill={done ? SAGE : "#1C382E"} stroke={SAGE} strokeOpacity={done ? 1 : 0.5} strokeWidth="2" />
          <text x={x} y={y + 5} textAnchor="middle" fill={done ? "#12261F" : SAGE} className={TEXT_SIZES[12]} fontWeight={700} letterSpacing=".04em">{String(i + 1)}</text>
        </motion.g>
        <Text x={x} y={y + 50} anchor="middle" fill={done ? "#fff" : LABEL} size={13} weight={700} delay={at + 0.1}>{step}</Text>
      </g>;
    })}
  </Scene>;
}
