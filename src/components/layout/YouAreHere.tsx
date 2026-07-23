"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { FEATURE_SECTIONS, useActiveSection } from "./SectionNav";

/**
 * Cached once at module load — see SectionNav.tsx for rationale. Used
 * here to switch the click-to-top scroll from smooth to instant for
 * users with `prefers-reduced-motion: reduce`.
 */
const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Show the pill once the user has scrolled past the PageHeader +
 * SectionNav and into the actual section content. Before this point
 * the "you are here" label would be misleading (the user is still in
 * the header area).
 */
const SHOW_AFTER = 480;

/**
 * YouAreHere — a small floating "you are here" indicator pinned to the
 * bottom-right of the Features page, stacked above the global BackToTop
 * button. It displays the name of the section currently in view (driven
 * by the same IntersectionObserver logic as the SectionNav) and, on
 * click, smooth-scrolls the user back to the top of the page.
 *
 * Positioning: `bottom-24 right-6 z-40` sits directly above the
 * BackToTop button (`bottom-6 right-6`, 44px tall → top at ~68px from
 * the bottom). z-40 matches BackToTop so they layer as a coherent
 * floating cluster without one shadowing the other.
 *
 * A simple static accent dot marks the active location (no pulsing halo)
 * and the up-arrow icon on the right reinforces the click-to-top
 * affordance, mirroring the BackToTop iconography for visual consistency.
 */
export function YouAreHere() {
  const { lang } = useLang();
  const es = lang === "es";
  const activeId = useActiveSection();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = FEATURE_SECTIONS.find((s) => s.id === activeId);
  const label = active ? (es ? active.labelEs : active.labelEn) : "";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: PREFERS_REDUCED_MOTION ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && active && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label={
            es
              ? `Volver arriba — estás en: ${label}`
              : `Back to top — you are in: ${label}`
          }
          className="fixed bottom-24 right-6 z-40 liquid-glass rounded-pill pl-3 pr-3 py-2 text-xs font-medium flex items-center gap-2 text-secondary hover:text-primary transition-colors group"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Static location dot — a single solid accent disc reads as a
              "you are here" marker without an animated ping halo. Calmer
              and less attention-grabbing than a pulsing indicator. */}
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: "rgb(var(--accent-base))" }}
          />
          <span className="text-tertiary text-[10px] uppercase tracking-[0.12em] whitespace-nowrap">
            {es ? "Estás en" : "You are in"}
          </span>
          <span className="text-primary font-semibold whitespace-nowrap">
            {label}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-tertiary group-hover:text-primary transition-colors shrink-0"
          >
            <path d="M9 14V4M4 8l5-5 5 5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
