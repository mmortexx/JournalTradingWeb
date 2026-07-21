"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

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
 */
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const style = { x: sx, y: sy } as unknown as React.CSSProperties;

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={style}
        className={className}
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
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className={className}
    >
      {children}
    </motion.button>
  );
}
