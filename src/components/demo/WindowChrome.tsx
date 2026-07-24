"use client";

import { useLang } from "@/lib/i18n";
import { useDemo } from "./DemoContext";

/**
 * Windows 11–style title bar.
 *
 * Layout (authentic Win32/WinUI caption button arrangement):
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ ◧ Trading Journal  [DEMO]   · Resumen ·       ─  ▢  ✕     │
 *   └─────────────────────────────────────────────────────────────┘
 *   • Left: 16×16 app icon + app name + static DEMO chip.
 *   • Center: current view name (WinUI 3 doc-title convention; hidden on
 *     narrow viewports so it never collides with the DEMO chip + caption
 *     buttons). pointer-events-none + absolute positioning so it never
 *     intercepts caption-button clicks.
 *   • Right: Minimize / Maximize / Close caption buttons (46×full-height).
 *
 * Caption-button styling mirrors Windows 11:
 *   • Each button is 46px wide and spans the full 36px title-bar height so
 *     the hover background reaches the top and bottom edges (signature look).
 *   • Minimize: a 10px horizontal stroke.
 *   • Maximize: a 10px square outline (flips to "Restore" two-overlapping-
 *     squares glyph when fullscreen is active).
 *   • Close: a 10px × glyph; hover background is the Win11 close-red
 *     #C42B1C with a white icon — non-negotiable for authenticity.
 *   • Hover background for Min/Max is `rgb(255 255 255 / 0.10)` (bumped
 *     from /8 for a more visible Win11 hover wash).
 *
 * Wiring:
 *   • Maximize toggles the demo's fullscreen state (closest web analog to
 *     the native Maximize/Restore behavior).
 *   • Close exits fullscreen when active; otherwise it's a visual control
 *     only (the demo can't be "closed" — there's no parent shell to return
 *     to). Minimize is visual-only with a proper aria-label.
 *
 * `viewLabel` prop: by default the centered doc-title is resolved from the
 * active `page` in the demo context (with the `detail` → trades special
 * case). Callers that drive the centered label from a different source of
 * truth (e.g. RealScreenshotDemo, which has 8 screenshot tabs that don't
 * map 1:1 to the 7-value DemoPage enum) can pass an explicit `viewLabel`
 * string to override the page-based resolution. Backward compatible — if
 * omitted, the page-based resolution is used.
 */
interface WindowChromeProps {
  /** Override the centered doc-title label. If omitted, the label is
   *  resolved from the active `page` in the demo context. */
  viewLabel?: string;
}

export function WindowChrome({ viewLabel }: WindowChromeProps = {}) {
  const { t } = useLang();
  const { page, fullscreen, setFullscreen } = useDemo();

  // Resolve the current view's i18n label key for the centered doc title.
  // "detail" is a drill-down from trades, so it shows the trades label.
  const viewLabelKey =
    page === "detail"
      ? "pageTrades"
      : (`page${page.charAt(0).toUpperCase()}${page.slice(1)}` as
          | "pageDashboard"
          | "pageTrades"
          | "pageAnalytics"
          | "pageJournal"
          | "pagePlaybook"
          | "pageSettings");

  // Explicit `viewLabel` prop overrides the page-based resolution. Used by
  // RealScreenshotDemo, where the active tab isn't one of the 7 DemoPages.
  const resolvedLabel = viewLabel ?? t(viewLabelKey);

  return (
    <div className="liquid-glass border-b border-white/10 flex items-center justify-between h-9 text-xs shrink-0 relative cursor-default select-none">
      {/* Subtle draggable-area texture — a 1px noise-free top highlight that
          reads as the machined top edge of a real WinUI 3 title bar. Sits
          under the caption buttons so they stay crisp. The texture is
          pointer-events-none so it never blocks clicks. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
      />

      {/* ── Left: app icon + name + static DEMO chip ── */}
      <div className="flex items-center px-3 min-w-0 relative z-[1]">
        <AppIcon />
        <span className="text-xs font-medium text-secondary ml-2 hidden sm:inline truncate" style={{ fontFamily: '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif' }}>
          {t("appName")}
        </span>
        {/* DEMO chip — static (no pulse). Sits immediately after the app
            name so the demo nature is unmistakable, mirroring how the
            native app shows its dev-build badge in the title bar. */}
        <span className="pill bg-white/8 text-primary border border-white/20 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-base))]" />
          DEMO
        </span>
      </div>

      {/* ── Center: current view name (WinUI 3 doc-title convention) ──
          Absolutely centered so the layout doesn't shift when the view
          changes. Hidden below md to avoid colliding with the DEMO chip +
          caption buttons on narrow viewports. pointer-events-none so it
          never intercepts the title-bar's hover texture or caption clicks. */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-[1]">
        <span className="text-xs text-tertiary hidden md:inline truncate max-w-[220px]">
          {resolvedLabel}
        </span>
      </div>

      {/* ── Right: Windows 11 caption buttons (Minimize / Maximize / Close) ──
          Each button spans the full title-bar height so the hover wash
          reaches the top & bottom edges, exactly like WinUI 3 caption
          buttons. The Close button is rightmost and uses the Win11 close-red
          #C42B1C on hover with a white glyph. */}
      <div className="flex items-stretch h-full relative z-[1]">
        {/* Minimize — visual only (no web analog to "minimize window"). */}
        <button
          type="button"
          aria-label={t("winMinimize")}
          tabIndex={-1}
          className="w-[46px] h-full flex items-center justify-center text-tertiary hover:bg-white/10 hover:text-primary transition-colors duration-150 rounded-none"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="0.5" y1="5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>
        {/* Maximize / Restore — toggles the demo fullscreen state. */}
        <button
          type="button"
          aria-label={fullscreen ? t("winRestore") : t("winMaximize")}
          onClick={() => setFullscreen(!fullscreen)}
          className="w-[46px] h-full flex items-center justify-center text-tertiary hover:bg-white/10 hover:text-primary transition-colors duration-150 rounded-none"
        >
          {fullscreen ? (
            // Restore glyph — two overlapping squares (Win11 "Restore" icon).
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="0.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M2.5 2.5V1.5A1 1 0 0 1 3.5 0.5H8.5A1 1 0 0 1 9.5 1.5V6.5A1 1 0 0 1 8.5 7.5H7.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round" />
            </svg>
          ) : (
            // Maximize glyph — square outline.
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          )}
        </button>
        {/* Close — Win11 close-red hover (#C42B1C) with a white glyph.
            Exits fullscreen when active; otherwise visual-only. */}
        <button
          type="button"
          aria-label={t("winClose")}
          onClick={() => {
            if (fullscreen) setFullscreen(false);
          }}
          className="w-[46px] h-full flex items-center justify-center text-tertiary hover:bg-[#C42B1C] hover:text-primary transition-colors duration-150 rounded-none"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="0.5" y1="0.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="9.5" y1="0.5" x2="0.5" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * AppIcon — 16×16 trading-journal mark. A rounded-square accent gradient
 * tile with three white candlestick bars of varying heights, evoking a
 * chart at a glance. Inline SVG (no external asset) so it inherits the
 * active accent palette (oro / esmeralda / onix / aurora / seda) and
 * stays crisp at 16px on HiDPI displays. The accent gradient + 1px white
 * inner ring gives the tile a tactile "keycap" feel that reads as a real
 * app icon (not a flat colored square).
 */
function AppIcon() {
  return (
    <span
      className="w-4 h-4 rounded-[3px] flex items-center justify-center shrink-0 shadow-[0_0_0_1px_rgb(255_255_255_/_0.10),inset_0_0_0_1px_rgb(255_255_255_/_0.18)]"
      style={{
        background:
          "linear-gradient(135deg, rgb(var(--accent-base)) 0%, rgb(var(--accent-hover)) 100%)",
      }}
      aria-hidden="true"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="1" y="5.5" width="1.4" height="3" fill="white" opacity="0.95" />
        <rect x="4.3" y="3" width="1.4" height="5.5" fill="white" opacity="0.95" />
        <rect x="7.6" y="4" width="1.4" height="4.5" fill="white" opacity="0.95" />
      </svg>
    </span>
  );
}
