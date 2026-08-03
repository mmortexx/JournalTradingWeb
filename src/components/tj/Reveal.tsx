"use client";

import { motion, useReducedMotion, type Variant } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Hard cap on the stagger delay so sections never feel slow or template-y. */
const MAX_DELAY = 0.3;

/** Shared ease + duration family used across every scroll reveal on the site.
 *  Anthropic-grade "soft-settle" curve: a long deceleration that reads as a
 *  graceful one-shot reveal (Bloomberg / FT-style) without ever feeling like
 *  a "demo" animation. Keeping this in one place means every reveal — Reveal,
 *  SectionReveal, FeatureImage, etc. — moves as one. */
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
export const REVEAL_DURATION = 0.55;

/** Scroll-reveal wrapper using framer-motion whileInView.
 *
 *  The `delay` prop is internally capped at MAX_DELAY (0.3s) — long
 *  cascades (1s+) read as template-y and slow the page's perceived
 *  performance, so callers can pass any value and the wrapper will
 *  clamp it.
 *
 *  Default `y = 16` + `duration = 0.55` are tuned to the spec's "subtle
 *  soft-settle" budget: a 16px upward drift over half a second reads as
 *  a graceful one-shot reveal (Bloomberg / FT-style) without ever
 *  feeling like a "demo" animation. Callers passing their own `y` keep
 *  the new shorter duration, so per-section overrides stay in sync with
 *  the tightened cadence.
 *
 *  The viewport margin is `-72px` so the reveal fires when the element
 *  is ~72px inside the viewport — late enough that the visitor has
 *  actually scrolled to it (not while it's still half-cut at the
 *  fold), early enough that it never reads as "I had to scroll to see
 *  it appear".
 *
 *  `prefers-reduced-motion: reduce`: the wrapper renders its children
 *  at the final state with no transition — the global MotionConfig
 *  (`reducedMotion="user"`) already suppresses transforms, but
 *  opacity would still animate; this short-circuits the whole variant
 *  chain so the reveal is truly instant. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  const safeDelay = Math.min(Math.max(delay, 0), MAX_DELAY);

  if (reduce) {
    // Final state, no transition. We still render the same wrapper so the
    // class tree and DOM shape stay identical between motion/no-motion.
    return <div className={className}>{children}</div>;
  }

  const hidden: Variant = { opacity: 0, y };
  const shown: Variant = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once, margin: "-72px" }}
      variants={{ hidden, shown }}
      transition={{ duration: REVEAL_DURATION, delay: safeDelay, ease: REVEAL_EASE }}
    >
      {children}
    </motion.div>
  );
}
