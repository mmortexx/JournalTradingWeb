"use client";

import { motion, type Variant } from "framer-motion";
import type { ReactNode } from "react";

export type ScrollRevealDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Direction the content travels into place from. Defaults to "up". */
  direction?: ScrollRevealDirection;
  /** Travel distance in px (ignored when direction === "scale"). Defaults to 24. */
  distance?: number;
  /** Reveal only once vs every time it enters the viewport. Defaults to true. */
  once?: boolean;
  /** Animation duration in seconds. Defaults to 0.7. */
  duration?: number;
  /** Optional `as` prop to render a different motion element (e.g. "li"). */
  as?: "div" | "span" | "li" | "section" | "article";
}

/**
 * Flexible scroll-reveal wrapper.
 *
 * Compared to the simpler {@link Reveal} primitive (which only supports a
 * vertical translateY), this version supports directional reveals — slide
 * in from up / down / left / right, or scale in from 0.92 → 1. The easing
 * curve and viewport config follow the same premium signature so the two
 * components feel like siblings.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  once = true,
  duration = 0.7,
  as = "div",
}: ScrollRevealProps) {
  const hidden: Variant = (() => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      case "scale":
        return { opacity: 0, scale: 0.92 };
      default:
        return { opacity: 0, y: distance };
    }
  })();

  const shown: Variant =
    direction === "scale"
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, x: 0, y: 0 };

  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once, margin: "-80px" }}
      variants={{ hidden, shown }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
