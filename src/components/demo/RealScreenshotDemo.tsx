"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { DemoProvider, useDemo } from "./DemoContext";
import { WindowChrome } from "./WindowChrome";
import { StatusBar } from "./StatusBar";
import { FeatureImage } from "@/components/tj/FeatureImage";

/* ------------------------------------------------------------------ */
/* Tab catalog — 8 real-app screenshots, one per tab                  */
/* ------------------------------------------------------------------ */
/* The real Windows app exposes 9 top-level tabs (Resumen, Operaciones,
 * Analítica, Diario, Playbook, + Experimentos, Fiscal, Negocio), but we
 * only ship 8 screenshots — so this demo's tab strip matches the
 * screenshots we have rather than the app's actual tab list. The 8
 * screenshots span the app's main surfaces plus three drill-down views
 * (Curva = the filtered performance-curve view inside Analítica, Detalle
 * = the trade-detail drill-down from Operaciones, Nueva = the new-trade
 * form reached from Resumen). Tabs use the screenshot's Spanish name as
 * the primary label (matching the app's default locale) with an English
 * fallback for `lang === "en"`.
 *
 * Each tab carries an inline SVG icon (Lucide-style stroke path) so the
 * tab strip reads as a real app's nav rail, not a generic segmented
 * control. Icons are tuned to read at 15px on the dark liquid-glass
 * surface — same strokeWidth (1.8) + round caps as TopNav's icons.
 */
interface Shot {
  id: string;
  src: string;
  labelEs: string;
  labelEn: string;
  altEs: string;
  altEn: string;
  icon: ReactNode;
}

const SHOTS: Shot[] = [
  {
    id: "resumen",
    src: "/img/app-resumen.webp",
    labelEs: "Resumen",
    labelEn: "Dashboard",
    altEs:
      "Pantalla de Resumen: cómo va tu operativa, con curva de rendimiento y calendario P&L",
    altEn:
      "Overview screen: how your trading is going, with performance curve and P&L calendar",
    icon: <path d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" />,
  },
  {
    id: "operaciones",
    src: "/img/app-operaciones.webp",
    labelEs: "Operaciones",
    labelEn: "Trades",
    altEs: "Registro de operaciones con 200 trades filtrables",
    altEn: "Trade log with 200 filterable trades",
    icon: <path d="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    id: "analitica",
    src: "/img/app-analitica.webp",
    labelEs: "Analítica",
    labelEn: "Analytics",
    altEs:
      "Analítica con la tabla de métricas por periodo y ratios institucionales",
    altEn:
      "Analytics with the metrics-by-period table and institutional ratios",
    icon: <path d="M4 19V5M4 19h16M8 16l3-5 3 3 4-7" />,
  },
  {
    id: "curva",
    src: "/img/app-curva.webp",
    labelEs: "Curva",
    labelEn: "Curve",
    altEs:
      "Curva de rendimiento filtrada con drawdown y calidad de la curva",
    altEn: "Filtered performance curve with drawdown and curve quality",
    icon: <path d="M3 17l5-5 4 3 7-8" />,
  },
  {
    id: "diario",
    src: "/img/app-diario.webp",
    labelEs: "Diario",
    labelEn: "Journal",
    altEs:
      "Diario con el check-in del día: sueño, estado mental y físico",
    altEn: "Journal with the daily check-in: sleep, mental and physical state",
    icon: <path d="M5 4h14v16l-7-3-7 3V4z" />,
  },
  {
    id: "playbook",
    src: "/img/app-playbook.webp",
    labelEs: "Playbook",
    labelEn: "Playbook",
    altEs: "Playbook con las fichas de cada setup y sus estadísticas",
    altEn: "Playbook with each setup card and its statistics",
    icon: (
      <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 8h8M8 12h8M8 16h5" />
    ),
  },
  {
    id: "detalle",
    src: "/img/app-detalle.webp",
    labelEs: "Detalle",
    labelEn: "Detail",
    altEs:
      "Detalle de una operación con recorrido, ejecución, plan y revisión",
    altEn: "Trade detail with journey, execution, plan and review",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
  },
  {
    id: "nueva",
    src: "/img/app-nueva.webp",
    labelEs: "Nueva",
    labelEn: "New",
    altEs: "Formulario de nueva operación con cálculo de riesgo",
    altEn: "New trade form with risk calculation",
    icon: <path d="M12 5v14M5 12h14" />,
  },
];

/* ------------------------------------------------------------------ */
/* RealScreenshotDemo                                                 */
/* ------------------------------------------------------------------ */

/**
 * RealScreenshotDemo — the live demo, redesigned to show the REAL app
 * screenshots (8 webp captures from the native Windows app at
 * `/public/img/app-*.webp`) inside the existing demo window chrome
 * (`WindowChrome` + tab strip + `StatusBar`).
 *
 * Why screenshots instead of the hand-built interactive recreation
 * (the old `AppDemo`)? The owner's feedback: the recreation "doesn't
 * look like the real app at all" — small divergences in spacing, color,
 * typography, table density, etc. accumulated until the demo read as a
 * "fan-made tribute" rather than the actual product. Showing the real
 * screenshots makes the demo "look exactly like the real app" because
 * it IS the real app's pixels.
 *
 * Structure (mirrors `AppDemo` so the demo window visually matches what
 * shipped before — same outer section header, same two-layer material +
 * shadow stack, same `WindowChrome` + `StatusBar`):
 *
 *   ┌─ Section header (eyebrow + headline + subtitle) ──────────────┐
 *   │ ┌─ Window (rounded-xl + border + 4-layer shadow) ────────────┐ │
 *   │ │ ┌─ liquid-glass (rounded-xl + overflow-hidden) ──────────┐ │ │
 *   │ │ │ WindowChrome (title bar — viewLabel = active tab)       │ │ │
 *   │ │ │ Tab strip (8 tabs — same styling as TopNav)             │ │ │
 *   │ │ │ Panel (dark #0b0c0d, h-[480/560/640])                   │ │ │
 *   │ │ │   ├─ Shot 0 (absolute, visible)                         │ │ │
 *   │ │ │   ├─ Shot 1 (absolute, invisible)                       │ │ │
 *   │ │ │   ├─ …                                                  │ │ │
 *   │ │ │   └─ Shot 7 (absolute, invisible)                       │ │ │
 *   │ │ │ StatusBar (matches the real app's three-region status bar) │ │ │
 *   │ │ │ Top + bottom 1px key-light reflections                  │ │ │
 *   │ │ └─────────────────────────────────────────────────────────┘ │ │
 *   │ └─────────────────────────────────────────────────────────────┘ │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Instant tab switching: all 8 `FeatureImage`s are pre-rendered and
 * stacked absolutely inside the panel. Only the active one is
 * `visibility: visible`; the rest are `visibility: hidden` (NOT
 * `display: none`). `visibility: hidden` keeps the element in layout
 * (so the IntersectionObserver inside `FeatureImage` fires once on
 * mount, the webp is fetched + cached, and the reveal animation
 * completes) — so when the user later clicks a tab, the newly-shown
 * screenshot is already at its final state (opacity 1, y 0). Tab
 * switches are pure visibility toggling — no re-mount, no animation
 * lag, no network fetch.
 *
 * Always-dark panel: the panel background is hardcoded `#0b0c0d`
 * (the same value as `--bg` in dark theme), NOT a theme token, so the
 * dark-themed app screenshots blend naturally regardless of the site's
 * theme. The `FeatureImage` `surfaceBg="#0b0c0d"` override ensures the
 * screenshot's letterbox area (when the screenshot's 1500×856 aspect
 * doesn't fill the panel's aspect) also stays dark — without the
 * override, `FeatureImage`'s contain mode paints a theme-aware
 * `var(--surface)` fill that turns near-white in light theme, clashing
 * with the dark panel.
 *
 * Wiring:
 *  - `DemoProvider` wraps the inner component so `WindowChrome` +
 *    `StatusBar` (which both call `useDemo()`) have a context to read
 *    from. The demo context's `page` state isn't driven by the
 *    screenshot tabs (they don't map 1:1 to the 7-value `DemoPage`
 *    enum); only `fullscreen` is used (toggled by the title bar's
 *    Maximize button + the status bar's fullscreen icon + the Escape
 *    key listener below).
 *  - `WindowChrome` accepts an explicit `viewLabel` prop (the active
 *    tab's label) so the centered doc-title in the title bar matches
 *    the visible screenshot.
 *  - `StatusBar`'s `onReset` prop is wired to snap the active tab back
 *    to the first one (Resumen), and `onOpenShortcuts` is omitted so
 *    the keyboard-icon button is hidden (the interactive AppDemo's
 *    shortcuts overlay doesn't apply to this screenshot demo).
 *  - Digit shortcuts 1–8 switch tabs (skipped while typing in a form
 *    field). Escape exits fullscreen.
 */
export function RealScreenshotDemo() {
  return (
    <DemoProvider>
      <RealScreenshotDemoInner />
    </DemoProvider>
  );
}

function RealScreenshotDemoInner() {
  const { t, lang } = useLang();
  const es = lang === "es";
  const { fullscreen, setFullscreen } = useDemo();
  const [activeIndex, setActiveIndex] = useState(0);

  // Escape exits fullscreen — listener attaches only while fullscreen is
  // active (mirrors AppDemo's pattern: re-attaches whenever `fullscreen`
  // flips so the handler closure always reads the current value).
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, setFullscreen]);

  // Digit shortcuts 1–8 — switch to the corresponding tab. Skipped while
  // typing in a form field so we don't hijack typing. Mirrors TopNav's
  // 1–6 handler (extended to 8 because we have 8 tabs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      const num = Number.parseInt(e.key, 10);
      if (Number.isInteger(num) && num >= 1 && num <= SHOTS.length) {
        e.preventDefault();
        setActiveIndex(num - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeShot = SHOTS[activeIndex];
  const activeLabel = es ? activeShot.labelEs : activeShot.labelEn;

  // Keyboard arrow navigation within the tablist (Left/Right/Home/End),
  // mirroring TopNav's handler. Skipped while typing in a form field.
  const focusTab = (index: number) => {
    const root = document.getElementById("demo-tablist");
    if (!root) return;
    const buttons = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const clamped = Math.max(0, Math.min(SHOTS.length - 1, index));
    buttons[clamped]?.focus();
    setActiveIndex(clamped);
  };

  const onTablistKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(SHOTS.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-page mx-auto px-5 md:px-8">
      {/* Section header — same composition as AppDemo (eyebrow + headline
          with text-gradient accent + subtitle). The copy stays as the
          existing i18n strings (`demoTitle`, `demoSubtitle`) so the
          section reads consistently with the rest of the marketing page. */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="eyebrow inline-flex items-center gap-2 justify-center mb-3">
          <span className="w-6 h-px bg-white opacity-60" />
          {t("demoTitle")}
          <span className="w-6 h-px bg-white opacity-60" />
        </div>
        <h2
          className="font-medium tracking-[-0.03em] leading-tight"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
        >
          {es ? (
            <>
              La app, <span className="text-gradient">en tu navegador.</span>
            </>
          ) : (
            <>
              The app, <span className="text-gradient">in your browser.</span>
            </>
          )}
        </h2>
        <p className="text-lg text-secondary mt-4 leading-relaxed">
          {t("demoSubtitle")}
        </p>
      </div>

      {/* App window — same two-layer material + shadow stack as AppDemo.
          Outer wrapper carries the 1px hairline border + a 4-layer shadow
          stack (kept off the `.liquid-glass` element so it isn't
          overridden by the class's own `border: none` + `box-shadow`).
          When fullscreen is active, the wrapper goes `fixed inset-3
          z-[100]` so the demo window fills the viewport (matches AppDemo). */}
      <div
        className={`relative mx-auto transition-[transform,border-radius,box-shadow,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          fullscreen ? "fixed inset-3 z-[100] rounded-xl" : "rounded-xl"
        }`}
      >
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_10px_rgb(0_0_0/0.26),0_18px_40px_rgb(0_0_0/0.3),0_0_28px_rgb(var(--accent-base)/0.1),0_24px_80px_-12px_rgb(0_0_0/0.6)]">
          <div className="liquid-glass rounded-xl overflow-hidden">
            <WindowChrome />

            {/* Tab strip — 8 tabs with the SAME styling as TopNav
                (liquid-glass surface, h-11, animated accent underline
                via shared `layoutId="demo-tab"` + `layoutId="demo-tab-
                underline"`, pill background, 15px Lucide-style stroke
                icon, label hidden on `<sm`). The `layoutId` values match
                TopNav's so the spring-animated pill + underline slide
                between tabs with the same feel. */}
            <div className="liquid-glass border-b border-white/10 flex items-stretch h-11 shrink-0">
              <div
                id="demo-tablist"
                role="tablist"
                aria-label={t("demoTitle")}
                onKeyDown={onTablistKeyDown}
                className="flex items-center gap-1 px-2 flex-1 min-w-0 overflow-x-auto no-scrollbar"
              >
                {SHOTS.map((shot, i) => {
                  const active = i === activeIndex;
                  const label = es ? shot.labelEs : shot.labelEn;
                  return (
                    <button
                      key={shot.id}
                      role="tab"
                      aria-selected={active}
                      aria-label={label}
                      aria-controls="demo-tabpanel"
                      tabIndex={active ? 0 : -1}
                      onClick={() => setActiveIndex(i)}
                      className={`relative h-9 px-3 rounded-md flex items-center gap-2 text-[13px] font-medium transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.45)] focus-visible:ring-offset-0 ${
                        active
                          ? "text-primary"
                          : "text-tertiary hover:text-secondary hover:bg-white/5"
                      }`}
                    >
                      {/* Active background pill — animated between tabs
                          via layoutId (same id as TopNav, so the spring
                          physics match). */}
                      {active && (
                        <motion.span
                          layoutId="demo-tab"
                          className="absolute inset-0 rounded-md bg-white/10"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                      {/* Active accent underline — 2px accent bar at the
                          tab's bottom edge. Animated via layoutId so it
                          slides in sync with the pill. */}
                      {active && (
                        <motion.span
                          layoutId="demo-tab-underline"
                          aria-hidden="true"
                          className="absolute bottom-[5px] left-3 right-3 h-0.5 rounded-full"
                          style={{ background: "rgb(var(--accent-base))" }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="relative shrink-0"
                        aria-hidden="true"
                      >
                        {shot.icon}
                      </svg>
                      <span className="relative hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screenshot panel — always-dark surface (#0b0c0d, NOT a
                theme token) so the dark-themed app screenshots blend
                naturally. All 8 shots are pre-rendered and stacked
                absolutely; only the active one is `visibility: visible`.
                Using `visibility: hidden` (NOT `display: none`) keeps the
                inactive shots in layout so their `FeatureImage`'s
                IntersectionObserver fires once on mount, the webp is
                fetched + cached, and the reveal animation completes — so
                tab switches are pure visibility toggling (instant, no
                re-mount, no animation lag, no network fetch). */}
            <div
              role="tabpanel"
              id="demo-tabpanel"
              aria-label={activeLabel}
              tabIndex={0}
              className="relative h-[480px] sm:h-[560px] md:h-[640px] overflow-hidden focus:outline-none"
              style={{ background: "#0b0c0d" }}
            >
              {SHOTS.map((shot, i) => (
                <div
                  key={shot.id}
                  className={`absolute inset-0 ${
                    i === activeIndex ? "" : "invisible"
                  }`}
                  aria-hidden={i !== activeIndex}
                >
                  <FeatureImage
                    src={asset(shot.src)}
                    alt={es ? shot.altEs : shot.altEn}
                    fit="contain"
                    surfaceBg="#0b0c0d"
                    className="absolute inset-0 h-full w-full"
                    overlay={0}
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </div>
              ))}
            </div>

            {/* StatusBar — restructured in R25-1a to match the real
                app's status bar (discipline LED + auto-saved note +
                version). The pre-R25-1a `onReset` prop is removed; the
                ResetButton that snapped the active tab back to the first
                one is gone (matching the real app's status bar, which
                has no reset affordance). To reset, the user just clicks
                the first tab. */}
            <StatusBar />

            {/* Window top reflection — 1px white-to-transparent gradient
                at the very top of the window (matches AppDemo). */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-b from-white/15 to-transparent pointer-events-none z-10"
            />
            {/* Window bottom reflection — softer 1px hairline at the
                bottom (matches AppDemo). */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-t from-white/[0.06] to-transparent pointer-events-none z-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
