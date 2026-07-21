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

/** Animated count-up that triggers when scrolled into view. */
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
  const [val, setVal] = useState(from);
  const [started, setStarted] = useState(false);

  useEffect(() => {
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
      // easeOutExpo
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
