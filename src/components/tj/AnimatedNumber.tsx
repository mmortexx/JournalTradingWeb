"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/components/tj/useInView";
import { useLang } from "@/lib/i18n";
import { fmtMoney, fmtNum, fmtPct, fmtInt } from "@/lib/trading/format";

type Format = "money" | "percent" | "int" | "decimal";
type Tone = "pos" | "neg" | "neutral";

interface AnimatedNumberProps {
  /** Target value to animate towards. */
  value: number;
  /** Number formatter to apply on each frame. */
  format?: Format;
  /** Decimal places (used by money / decimal / percent). */
  decimals?: number;
  /** String prefixed before the formatted value, e.g. "$". */
  prefix?: string;
  /** String appended after the formatted value, e.g. "M", "/5". */
  suffix?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** Extra classes; `tnum` is always applied. */
  className?: string;
  /** Optional semantic colorization. */
  tone?: Tone;
}

/** easeOutExpo — strong deceleration, premium feel for count-ups. */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * AnimatedNumber — animates from 0 → value with easeOutExpo, triggered when
 * scrolled into view. Locale-aware formatting via the TJ format helpers and
 * the active `useLang()` locale. Pure rAF (no Framer Motion dependency),
 * honors SSR by rendering the formatted 0 until in-view.
 */
export function AnimatedNumber({
  value,
  format = "int",
  decimals,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className = "",
  tone = "neutral",
}: AnimatedNumberProps) {
  const { lang } = useLang();
  const { ref, inView } = useInView<HTMLSpanElement>({
    once: true,
    rootMargin: "60px",
  });
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  function formatValue(v: number): string {
    switch (format) {
      case "money":
        return fmtMoney(v, lang, { decimals: decimals ?? 2 });
      case "percent":
        return fmtPct(v, lang, decimals ?? 1);
      case "int":
        return fmtInt(Math.round(v), lang);
      case "decimal":
        return fmtNum(v, lang, decimals ?? 2);
      default:
        return fmtInt(Math.round(v), lang);
    }
  }

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      const eased = easeOutExpo(p);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const toneClass =
    tone === "pos"
      ? "text-pnl-pos"
      : tone === "neg"
      ? "text-pnl-neg"
      : "";

  const cls = `tnum ${toneClass} ${className}`.replace(/\s+/g, " ").trim();

  return (
    <span ref={ref} className={cls}>
      {prefix}
      {formatValue(display)}
      {suffix}
    </span>
  );
}
