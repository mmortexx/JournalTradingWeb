"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { fmtNum } from "@/lib/trading/format";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  tone?: "pos" | "neg" | "neutral";
}

/** Animated count-up that triggers when scrolled into view.
 *
 *  Tuning (P5 polish):
 *   - Default `duration = 1.4s` (within the 1.2-1.8s budget). Eased with
 *     `easeOutExpo` so the number settles with a long deceleration — the
 *     last 10% of the value arrives slowly, which reads as "important
 *     number coming to rest" rather than a uniform ramp.
 *   - `prefers-reduced-motion: reduce` → the final value is rendered
 *     immediately on mount (via lazy initial state; no `setState` inside
 *     the effect). No rAF loop, no animation.
 *   - The rAF loop is cancelled on unmount and the IntersectionObserver
 *     disconnects — no leaks, no count-ups racing behind a hidden tab.
 *   - `tnum` (tabular figures) is applied so the digits don't wobble
 *     width-wise while they count: a long number that pulses 1px wider
 *     on every frame is the surest tell of an "amateur" count-up. */
export function CountUp({
  to,
  from = 0,
  duration = 1.4,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
  tone = "neutral",
}: CountUpProps) {
  const { lang } = useLang();
  const ref = useRef<HTMLSpanElement>(null);
  // SSR-safe lazy initial state: under reduced-motion, mount directly at
  // the final value with `started=true` so neither the IntersectionObserver
  // nor the rAF loop ever fires.
  const reduceAtMount =
    typeof window !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [val, setVal] = useState(reduceAtMount ? to : from);
  const [started, setStarted] = useState(reduceAtMount);

  useEffect(() => {
    if (started) return; // reduced-motion path already at final state
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      // easeOutExpo — long deceleration, the last 10% arrives slowly.
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, from, duration]);

  const toneClass =
    tone === "pos"
      ? "text-pnl-pos"
      : tone === "neg"
      ? "text-pnl-neg"
      : "";

  return (
    <span
      ref={ref}
      // aria-live="polite" announces the final settled value to assistive
      // tech without interrupting — the count-up animation runs once per
      // mount, so the live region only fires when the value stabilises
      // (the rapid intermediate values are throttled by the screen reader).
      aria-live="polite"
      className={`tnum ${toneClass} ${className}`}
    >
      {prefix}
      {fmtNum(val, lang, decimals)}
      {suffix}
    </span>
  );
}
