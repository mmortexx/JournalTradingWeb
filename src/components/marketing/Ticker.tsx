"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/**
 * Ticker — infinite horizontal marquee band showing instrument symbols
 * with their P&L %. Duplicated for a seamless loop. Colorized pos/neg.
 * Honors `prefers-reduced-motion` (static fallback — no scroll).
 *
 * Institutional polish (R2-c):
 *  - Liquid-glass chrome band with `border-y border-white/10` hairline
 *    top + bottom edges — reads as a precision-machined ticker tape
 *    floating over the dark page background.
 *  - Slow, dignified base speed: full track (two rows) in 50 s — about
 *    35 px/s on a typical viewport. Never feels frantic.
 *  - Scroll-velocity responsive multiplier (1× → 2.4×) wrapped in
 *    `useSpring` so the speed-up eases in/out smoothly instead of
 *    snapping frame-to-frame as raw scroll velocity fluctuates.
 *  - Symbol in `text-secondary` (theme-adaptive, was raw gray-400);
 *    P&L% in `text-pnl-pos`/`text-pnl-neg` with `tnum` tabular-nums +
 *    slashed zeros so the digits never jitter as the marquee scrolls.
 *  - Dot separators in `bg-[rgb(var(--txt-tertiary)/0.5)]` — uses the
 *    design-system tertiary text token (gray-400 on dark, gray-500 on
 *    light) at 50% opacity so the dots read as a soft machined-rivet
 *    rather than a raw white speck (was `bg-white/15`). The token tie
 *    means the dots shift hue correctly if the theme flips to light.
 *  - Soft black-tinted gradient fades on both left + right edges so
 *    items ease in/out without a hard clip. Floats over the liquid-glass
 *    band's translucent dark surface.
 *  - `prefers-reduced-motion`: the animation loop is skipped entirely;
 *    the track stays at x=0 so the first Row remains statically visible.
 */

interface TickerItem {
  sym: string;
  chg: number;
}

const TICKER_ITEMS: TickerItem[] = [
  { sym: "ES35", chg: 0.84 },
  { sym: "NQ", chg: 1.12 },
  { sym: "SPX", chg: -0.31 },
  { sym: "EURUSD", chg: 0.22 },
  { sym: "BTC", chg: -2.04 },
  { sym: "DAX", chg: 0.57 },
  { sym: "GOLD", chg: 0.41 },
  { sym: "CL", chg: -1.18 },
];

function Row() {
  return (
    <div className="flex items-center shrink-0 gap-11" aria-hidden="true">
      {TICKER_ITEMS.map((it) => {
        const pos = it.chg >= 0;
        return (
          <span key={it.sym} className="tnum flex items-center" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
            {it.sym}{" "}
            <span
              className="tnum"
              style={{ color: pos ? "rgb(var(--pnl-pos))" : "rgb(var(--pnl-neg))", marginLeft: 6 }}
            >
              {pos ? "+" : "−"}
              {Math.abs(it.chg).toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function Ticker() {
  const reduce = useReducedMotion();

  // Scroll-velocity responsive speed: |velocity| 0..4000 → multiplier 1..2.4.
  // Wrapped in useSpring so the speed multiplier eases in/out smoothly
  // instead of snapping frame-to-frame as the raw scroll velocity
  // fluctuates — eliminates the micro-stutter the ticker used to show
  // when the user scrolled aggressively and then stopped.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const rawSpeedFactor = useTransform(scrollVelocity, (v) => {
    const abs = Math.min(Math.abs(v), 4000);
    return 1 + (abs / 4000) * 1.4;
  });
  const speedFactor = useSpring(rawSpeedFactor, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (!half) return;
    // Clamp delta to a single frame's worth (16-32ms) so the first
    // animation frame — which can report a delta of 100ms+ if the tab
    // was backgrounded or the RAF callback was deferred — doesn't
    // catapult the track forward and break the seamless loop.
    const dt = Math.min(delta, 32);
    // Base loop: full track (two rows) in 50s → half in 50s.
    // 50s for the half-loop reads as slow + dignified (was 38s — a touch
    // too brisk for an institutional ticker tape).
    const basePxPerMs = half / 50 / 1000;
    const speed = basePxPerMs * speedFactor.get();
    let next = x.get() - speed * dt;
    if (next <= -half) next += half;
    x.set(next);
  });

  return (
    <div
      role="marquee"
      aria-label="Market ticker"
      className="relative border-y border-[rgb(var(--divider)/0.10)] py-3 liquid-glass overflow-hidden select-none"
    >
      {/* Left edge gradient fade — black-tinted so items ease out into the
          liquid-glass band's translucent dark surface instead of clipping
          at a hard edge. Floats over the dark page background. */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 w-20 md:w-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.5) 55%, transparent 100%)",
        }}
      />
      {/* Right edge gradient fade — mirror of the left. */}
      <div
        className="absolute right-0 top-0 bottom-0 z-10 w-20 md:w-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.5) 55%, transparent 100%)",
        }}
      />

      {/* Scrolling track — duplicated <Row /> gives the seamless loop point
          (the animation resets every `half = scrollWidth / 2` pixels). */}
      <motion.div ref={trackRef} className="flex w-max" style={{ x }}>
        <Row />
        <Row />
      </motion.div>
    </div>
  );
}
