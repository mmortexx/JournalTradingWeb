"use client";

import { motion, type Variant } from "framer-motion";
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

/** Scroll-reveal wrapper using framer-motion whileInView.
 *
 *  The `delay` prop is internally capped at MAX_DELAY (0.3s) — long
 *  cascades (1s+) read as template-y and slow the page's perceived
 *  performance, so callers can pass any value and the wrapper will
 *  clamp it.
 *
 *  Default `y = 16` + `duration = 0.5` are tuned to the spec's "subtle
 *  soft-settle" budget: a 16px upward drift over half a second reads as
 *  a graceful one-shot reveal (Bloomberg / FT-style) without ever
 *  feeling like a "demo" animation. Callers passing their own `y` keep
 *  the new shorter duration, so per-section overrides stay in sync with
 *  the tightened cadence. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  once = true,
}: RevealProps) {
  const hidden: Variant = { opacity: 0, y };
  const shown: Variant = { opacity: 1, y: 0 };
  const safeDelay = Math.min(Math.max(delay, 0), MAX_DELAY);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once, margin: "-60px" }}
      variants={{ hidden, shown }}
      transition={{ duration: 0.5, delay: safeDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
