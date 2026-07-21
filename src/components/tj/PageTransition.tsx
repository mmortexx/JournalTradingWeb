"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition — wraps page content with a subtle fade + slide-up entrance
 * on mount. Used at the root of every routed page so client-side navigations
 * feel intentional and premium instead of an abrupt swap.
 *
 * The animation is intentionally tiny (8px slide, 0.4s duration, custom
 * [0.22, 1, 0.36, 1] ease = a fast "decelerate" curve) so it reads as a
 * gentle settle rather than a heavy transition. Honors prefers-reduced-motion
 * via the global CSS rule in globals.css that clamps transition-duration to
 * ~0ms.
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
