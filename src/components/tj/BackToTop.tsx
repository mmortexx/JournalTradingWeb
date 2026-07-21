"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * BackToTop — circular accent-liquid-glass floating button.
 *
 * - Hidden until the user scrolls more than 600 px down.
 * - Smooth-scrolls to top on click via the browser's native
 *   `window.scrollTo({ behavior: "smooth" })` — no custom RAF tween,
 *   no arrow rotation, no spring. The simpler, cleaner primitive.
 * - Hover: lifts (-2 px) and gains an accent-tinted glow.
 *
 * State strategy: `visible` uses a lazy initializer so a back/forward
 * navigation that restores scroll > 600 px shows the button immediately
 * without a setState-in-effect. Subsequent updates come from the scroll
 * listener (event-handler semantics).
 */
const SHOW_AFTER = 600;

export function BackToTop() {
  const { lang } = useLang();
  const es = lang === "es";

  const [visible, setVisible] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.scrollY > SHOW_AFTER : false
  );

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <svg
            width="18"
            height="18"
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
