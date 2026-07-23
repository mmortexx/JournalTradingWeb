"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

/**
 * Cached at module scope — read once on first paint. We don't re-check on
 * `change` events because a user toggling the OS setting mid-session is
 * rare enough that the cost of subscribing outweighs the benefit, and the
 * global CSS rule in globals.css already clamps scroll-behavior to `auto`
 * for any CSS-driven smooth scroll. This guard covers the JS-driven
 * `scrollIntoView({ behavior: "smooth" })` call below.
 */
const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface FeatureSection {
  id: string;
  labelEs: string;
  labelEn: string;
}

/**
 * The canonical list of in-page sections for the Features page, in DOM
 * order. This drives both the sticky SectionNav pills and the
 * YouAreHere floating indicator (which needs the active section's
 * label). Keeping the list in one place guarantees the two stay in
 * sync if a section is ever added or renamed.
 */
export const FEATURE_SECTIONS: FeatureSection[] = [
  { id: "disciplina", labelEs: "Características", labelEn: "Features" },
  { id: "galeria", labelEs: "Galería", labelEn: "Gallery" },
  { id: "guardian", labelEs: "Guardián", labelEn: "Guardian" },
  { id: "coste", labelEs: "Coste", labelEn: "Cost" },
  { id: "transformacion", labelEs: "Transformación", labelEn: "Transformation" },
  { id: "como-funciona", labelEs: "Cómo funciona", labelEn: "How it works" },
  { id: "metricas", labelEs: "Métricas", labelEn: "Metrics" },
  { id: "riesgo", labelEs: "Riesgo", labelEn: "Risk" },
  { id: "mas-features", labelEs: "Más features", labelEn: "More features" },
  { id: "playbook", labelEs: "Playbook", labelEn: "Playbook" },
  { id: "local", labelEs: "Local", labelEn: "Local" },
  { id: "tecnico", labelEs: "Técnico", labelEn: "Technical" },
  { id: "integraciones", labelEs: "Integraciones", labelEn: "Integrations" },
];

/**
 * useActiveSection — tracks which section is currently in view using a
 * single IntersectionObserver.
 *
 * Root-margin strategy: the observation "active band" starts 120px
 * below the top of the viewport (clearing the fixed Navbar at 64px +
 * the sticky SectionNav at ~48px + a sliver of breathing room) and
 * extends down to 55% of the viewport height. A section is considered
 * active while its heading sits inside that band; once it scrolls past
 * the 55% line the next section takes over. Among multiple intersecting
 * entries, the one with the largest intersection ratio wins — this
 * handles the transition between two adjacent sections cleanly.
 *
 * Returns the active section id, defaulting to the first section before
 * any intersection event fires (so the leading pill is highlighted on
 * initial load even when the PageHeader is still partly visible).
 */
export function useActiveSection(): string {
  const [activeId, setActiveId] = useState<string>(FEATURE_SECTIONS[0].id);

  useEffect(() => {
    const elements = FEATURE_SECTIONS.map((s) =>
      document.getElementById(s.id)
    ).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0, 0.15, 0.3, 0.5, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeId;
}

/**
 * SectionNav — sticky horizontal pill-nav that sits directly below the
 * PageHeader and stays pinned under the Navbar while the user scrolls
 * through the Features page. Each pill smooth-scrolls to its section;
 * the active pill is highlighted via the IntersectionObserver-driven
 * `useActiveSection` hook.
 *
 * Sticky position: `top-16` so it locks exactly under the 64px Navbar.
 * z-30 keeps it below the Navbar (z-50) and the global BackToTop /
 * YouAreHere floating buttons (z-40) but above page content.
 *
 * `liquid-glass border-b border-white/5` gives it the same frosted
 * title-bar material as the Navbar, with a very subtle white-on-5%
 * border-white/10 separating it from the page below (matches the Navbar's
 * scrolled surface for visual continuity). On mobile the pill row scrolls horizontally
 * with the scrollbar hidden (`overflow-x-auto no-scrollbar`) so the
 * pills feel like a single clean strip.
 */
export function SectionNav() {
  const { lang } = useLang();
  const es = lang === "es";
  const activeId = useActiveSection();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        // Respect `prefers-reduced-motion`: jump instantly for users who
        // asked for less motion. CSS `scroll-behavior: smooth` is already
        // clamped to `auto` globally, but `scrollIntoView({ behavior })`
        // is a JS-level API that bypasses that rule.
        el.scrollIntoView({
          behavior: PREFERS_REDUCED_MOTION ? "auto" : "smooth",
          block: "start",
        });
        // Reflect the target in the URL without triggering a native jump
        // (we already handled the scroll). replaceState, not pushState,
        // so the back button doesn't cycle through every pill clicked.
        history.replaceState(null, "", `#${id}`);
      }
    },
    []
  );

  return (
    <div className="sticky top-16 z-30 liquid-glass border-b border-white/5 relative">
      <div className="max-w-page mx-auto px-5 md:px-8">
        <nav
          aria-label={es ? "Secciones de la página" : "Page sections"}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5"
        >
          {FEATURE_SECTIONS.map((s) => {
            const active = s.id === activeId;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                aria-current={active ? "true" : undefined}
                className={`liquid-glass rounded-pill px-3 py-1.5 text-xs whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-white/8 text-white font-medium"
                    : "font-medium text-gray-300 hover:text-white"
                }`}
              >
                {/* Active pill gets a tiny accent dot prefix so the active
                    state is identifiable even at a glance, not just by hue
                    (color is the weakest signal for accessibility). */}
                <span
                  aria-hidden="true"
                  className={`h-1 w-1 rounded-full bg-white transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                {es ? s.labelEs : s.labelEn}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
