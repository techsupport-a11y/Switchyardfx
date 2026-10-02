import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SESSION_KEY = "switchyard-intro-seen";

export default function LandingIntro({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => reducedMotion !== true && active && window.sessionStorage.getItem(SESSION_KEY) !== "true");

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setVisible(false);
      return;
    }
    if (window.sessionStorage.getItem(SESSION_KEY) !== "true") setVisible(true);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (!visible) return;
    window.sessionStorage.setItem(SESSION_KEY, "true");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(() => setVisible(false), reducedMotion ? 0 : 820);
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [reducedMotion, visible]);

  return <AnimatePresence>{visible && <motion.div
    className="fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#12261F] text-white"
    initial={reducedMotion ? false : { opacity: 1 }}
    exit={reducedMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.28, ease: [0.76, 0, 0.24, 1] } }}
    data-testid="landing-intro"
  >
    <motion.div className="absolute h-72 w-72 rounded-full border border-[#A8C5BA]/10" initial={reducedMotion ? false : { scale: 0.55, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.62, ease: "easeOut" }} />
    <motion.div className="absolute h-48 w-48 rounded-full border border-[#A8C5BA]/15" initial={reducedMotion ? false : { scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }} />
    <div className="relative flex flex-col items-center">
      <motion.div
        className="grid h-20 w-20 place-items-center rounded-[1.6rem] bg-[#A8C5BA] text-4xl font-bold text-[#12261F] shadow-[0_20px_70px_rgba(168,197,186,.2)]"
        initial={reducedMotion ? false : { scale: 0.7, rotate: -9, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 230, damping: 19 }}
        data-testid="landing-intro-mark"
      >S</motion.div>
      <motion.p className="mt-6 text-2xl font-bold tracking-[-0.03em]" initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.2 }} data-testid="landing-intro-brand">SwitchYard</motion.p>
      <motion.div className="mt-3 h-px bg-[#A8C5BA]/60" initial={reducedMotion ? false : { width: 0 }} animate={{ width: 88 }} transition={{ duration: 0.38, delay: 0.28, ease: "easeOut" }} />
      <motion.p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#A8C5BA]" initial={reducedMotion ? false : { opacity: 0, letterSpacing: "0.45em" }} animate={{ opacity: 1, letterSpacing: "0.28em" }} transition={{ duration: 0.35, delay: 0.35 }} data-testid="landing-intro-tagline">Clarity in motion</motion.p>
    </div>
  </motion.div>}</AnimatePresence>;
}