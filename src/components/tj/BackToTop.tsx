"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * BackToTop — circular floating button with a scroll-progress ring.
 *
 * - Hidden until the user scrolls more than 600 px down.
 * - An SVG ring around the arrow fills clockwise as the user scrolls
 *   down, reaching 100% at the bottom of the page. The ring is
 *   `rgb(var(--accent-base))` so it reads as a quiet brand-colored
 *   progress cue layered on top of the liquid-glass button.
 * - The arrow sits in the center; the ring lives in the background
 *   (rotated -90deg so 0% starts at 12 o'clock).
 * - Smooth-scrolls to top on click via `window.scrollTo({ behavior:
 *   "smooth" })`.
 * - Hover: lifts (-2 px) and gains an accent-tinted glow.
 * - rAF-throttled scroll listener for smooth ring updates without jank.
 *
 * State strategy: `visible` uses a lazy initializer so a back/forward
 * navigation that restores scroll > 600 px shows the button immediately
 * without a setState-in-effect. Subsequent updates come from the scroll
 * listener (event-handler semantics). `progress` is a separate state
 * updated via rAF.
 */
const SHOW_AFTER = 600;
const RING_RADIUS = 18; // px — matches the 44px button with 4px padding
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function BackToTop() {
  const { lang } = useLang();
  const es = lang === "es";

  const [visible, setVisible] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.scrollY > SHOW_AFTER : false
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
      setVisible(scrollTop > SHOW_AFTER);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ring dash: the filled portion = progress% of the circumference.
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress / 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label={es ? "Volver arriba" : "Back to top"}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full liquid-glass flex items-center justify-center text-primary transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgb(var(--accent-base)/0.40)] active:scale-95"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Scroll-progress ring — SVG circle with a dash that fills
              clockwise as the user scrolls. Rotated -90deg so 0% starts
              at 12 o'clock. Sits behind the arrow. */}
          <svg
            className="absolute inset-0 -rotate-90"
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            aria-hidden="true"
          >
            {/* Track — faint full circle */}
            <circle
              cx="22"
              cy="22"
              r={RING_RADIUS}
              stroke="rgb(var(--divider) / 0.15)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Progress — accent, dashoffset = (1 - pct) * circumference.
                A subtle drop-shadow glow on the progress arc makes it
                read as "active" against the liquid-glass button surface.
                The glow intensifies on hover via the parent button's
                group-hover. */}
            <circle
              cx="22"
              cy="22"
              r={RING_RADIUS}
              stroke="rgb(var(--accent-base))"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transition: "stroke-dashoffset 0.1s linear, filter 0.2s ease",
                filter: "drop-shadow(0 0 2px rgb(var(--accent-base) / 0.5))",
              }}
            />
          </svg>
          {/* Arrow icon — sits above the ring */}
          <svg
            className="relative"
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 14V4M4 8l5-5 5 5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
