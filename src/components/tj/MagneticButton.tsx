"use client";

import { motion, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  href?: string;
  /** Anchor-only: open in a new tab/window. */
  target?: string;
  /** Anchor-only: rel attribute (use "noopener noreferrer" with target="_blank"). */
  rel?: string;
  /** Accessible label (forwarded to aria-label on the underlying element). */
  ariaLabel?: string;
  /** Button-only: type attribute, defaults to "button". */
  type?: "button" | "submit" | "reset";
}

/**
 * Button/link that subtly attracts toward the cursor — a premium micro-interaction.
 *
 * The magnetic pull is driven by `useMotionValue` + `useSpring` so the element
 * eases back to its origin on `mouseleave` instead of snapping. Anchor mode
 * (`href`) forwards `target` / `rel` / `aria-label` for external links.
 *
 * Tuning (P5 polish):
 *  - Max translate is clamped to 6 px regardless of `strength` or cursor
 *    distance — the spec asks for 4-6 px ("subtle > spectacular"); without
 *    the clamp, a wide CTA can hit 30+ px of drift when the cursor is far
 *    from the centre, which reads as a juvenile wiggle rather than a
 *    magnetic nudge.
 *  - The pull is disabled on touch pointers (no hover) and under
 *    `prefers-reduced-motion: reduce`. On mobile the element is a plain
 *    button/anchor with zero transform overhead.
 *  - `will-change: transform` is set only while the pointer is inside the
 *    element, so the compositor layer is promoted on demand and released
 *    on leave — no permanent layer for an interaction that fires briefly.
 */
const MAX_TRANSLATE = 6; // px — clamps the magnetic drift to a premium nudge

export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  onClick,
  href,
  target,
  rel,
  ariaLabel,
  type = "button",
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  // Hover capability: only devices that actually deliver a fine pointer
  // (mouse/trackpad) get the magnetic pull. Touch screens report
  // `(hover: none)` and skip the entire motion layer.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enabled = !reduce && canHover;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 320, damping: 22, mass: 0.4 });
  const [active, setActive] = useState(false);

  function onMove(e: React.MouseEvent) {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) * strength;
    let dy = (e.clientY - cy) * strength;
    // Clamp to a premium nudge — see MAX_TRANSLATE comment above.
    const dl = Math.hypot(dx, dy);
    if (dl > MAX_TRANSLATE) {
      const k = MAX_TRANSLATE / dl;
      dx *= k;
      dy *= k;
    }
    x.set(dx);
    y.set(dy);
  }
  function onEnter() {
    if (!enabled) return;
    setActive(true);
  }
  function onLeave() {
    setActive(false);
    x.set(0);
    y.set(0);
  }

  // When disabled, keep the motion values at 0 — the spring never fires and
  // the element stays at its origin. We still render the motion.* element so
  // the DOM shape is stable across breakpoints / motion preferences.
  //
  // `touchAction: "manipulation"` is set unconditionally (even on touch where
  // the magnetic pull is disabled) because the element is still a tappable
  // button/anchor: removing the 300ms double-tap-zoom delay makes every tap
  // feel instant on mobile, which is the same premium goal as the magnetic
  // pull on desktop. Panning and pinching still work — only double-tap-zoom
  // is suppressed — so the page scrolls normally when a swipe starts on the
  // button.
  const style = (enabled ? { x: sx, y: sy } : { x: 0, y: 0 }) as unknown as React.CSSProperties;
  const willChange = active ? "transform" : undefined;

  const handlers = enabled
    ? { onMouseMove: onMove, onMouseEnter: onEnter, onMouseLeave: onLeave }
    : {};

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        style={{ ...style, willChange, touchAction: "manipulation" }}
        className={className}
        {...handlers}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ ...style, willChange, touchAction: "manipulation" }}
      className={className}
      {...handlers}
    >
      {children}
    </motion.button>
  );
}
