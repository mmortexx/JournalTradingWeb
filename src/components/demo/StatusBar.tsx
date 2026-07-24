"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { METRICS } from "@/lib/trading/data";
import { fmtPct } from "@/lib/trading/format";

/* ------------------------------------------------------------------ */
/* StatusBar (institutional WinUI 3 / Bloomberg-style status bar —    */
/* restructured R25-1a to match the real app's MainWindow.xaml L286-331) */
/* ------------------------------------------------------------------ */

/**
 * StatusBar — institutional WinUI 3 / Bloomberg-Terminal-style status
 * bar that sits below the demo's tabpanel. Restructured in R25-1a to
 * match the real app's status bar (MainWindow.xaml L286-331), which
 * has three regions:
 *
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │ ● Disciplina: 84 %        Guardado automático en tu equipo    v2.4.1 │
 *   └──────────────────────────────────────────────────────────────────────┘
 *
 *   LEFT    — discipline LED (green dot, matches the real app's
 *             DisciplineLed Ellipse) + "Disciplina: NN %" text. The
 *             % is the deterministic demo's compliancePct — the share
 *             of trades that respected the plan. Reads as the
 *             institutional "are you trading well?" heartbeat the real
 *             app shows (the real app's text + color are managed by
 *             RefreshRiskStatus() in code-behind; the demo uses a
 *             stable deterministic value).
 *   CENTER  — "Guardado automático en tu equipo" / "Auto-saved on your
 *             machine" (the real app's Status_DataNote resource,
 *             Strings/{es-ES,en-GB}/Resources.resw L31). Replaces the
 *             pre-R25-1a live mini-metrics ticker (cycling Net P&L /
 *             Win Rate / Expectancy / Trades every 4 s) — the real app
 *             doesn't have a metrics ticker in the status bar.
 *   RIGHT   — version text "v2.4.1" with tabular numerals (mirrors the
 *             real app's VersionText, managed by code-behind from the
 *             assembly). Replaces the pre-R25-1a clock + data text +
 *             keyboard / fullscreen / share / reset icon buttons — the
 *             real app doesn't have those in the status bar (fullscreen
 *             is via the title bar's Maximize button, keyboard
 *             shortcuts are still accessible via the `?` key, no
 *             share/reset affordance in the native chrome).
 *
 * Layout: `.liquid-glass border-t border-white/10 h-7 flex items-center
 * justify-between px-3 text-[11px] text-tertiary tnum` — the
 * institutional status-bar pattern. The bottom corners are rounded
 * automatically by the parent window's `overflow-hidden` +
 * `rounded-xl`.
 *
 * The pre-R25-1a `onOpenShortcuts` + `onReset` props are removed — the
 * buttons that used them are gone (the keyboard-shortcuts overlay is
 * still accessible via the `?` key, handled by AppDemo's capture-phase
 * keydown listener; reset is handled by clicking the Dashboard tab).
 */
export function StatusBar() {
  const { t, lang } = useLang();

  // Compliance % from the deterministic demo metrics — the share of
  // trades that respected the plan. Used as the "discipline" status
  // value, mirroring the real app's RefreshRiskStatus() output (which
  // derives text + color from a similar compliance calculation against
  // real trades). Capped at [0, 1] for safety.
  const compliance = Math.max(0, Math.min(1, METRICS.compliancePct));
  const isHealthy = compliance >= 0.7;
  const complianceLabel = fmtPct(compliance, lang, 0);

  return (
    <div className="liquid-glass border-t border-white/10 relative flex items-center justify-between px-3 h-7 text-[11px] text-tertiary select-none">
      {/* LEFT — discipline LED + "Disciplina: NN %" text. Static
          (non-clickable) — matches the real app's DisciplineStatus
          StackPanel (XAML L313-318), which is a status indicator, not
          a navigation affordance. The LED carries a subtle breathing
          halo so the bar feels alive without losing the steady-state
          indicator semantic. */}
      <span
        className="flex items-center gap-2 min-w-0"
        title={`${t("discipline")}: ${complianceLabel}`}
        aria-label={`${t("discipline")}: ${complianceLabel}`}
      >
        <DisciplineLED healthy={isHealthy} />
        <span className="truncate">
          {t("discipline")}:{" "}
          <span
            className={`tnum font-medium ${
              isHealthy ? "text-pnl-pos" : "text-pnl-warn"
            }`}
          >
            {complianceLabel}
          </span>
        </span>
      </span>

      {/* CENTER — "Auto-saved on your machine" note. Absolutely centered
          so the layout doesn't shift when the left/right text changes
          width. Hidden on <sm to keep the bar readable on narrow
          viewports (the discipline % and version stay visible). */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1.5 pointer-events-none">
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-tertiary opacity-70"
          aria-hidden="true"
        >
          {/* Local-save / disk icon — a floppy-disk-style mark, evokes
              "saved to your machine" without literal cloud-off imagery. */}
          <path d="M3 3h8l2 2v8H3V3z" />
          <path d="M5 3v3h5V3" />
          <rect x="5" y="9" width="6" height="3" />
        </svg>
        <span className="truncate">{t("autoSaved")}</span>
      </div>

      {/* RIGHT — version text with tabular numerals (mirrors the real
          app's VersionText). The leading accent dot ties the version
          badge to the demo's accent identity; the "v" prefix is dimmer
          than the digits so the version number reads as the focal
          element. Kept in sync with the SettingsPage's "About" build
          info ("Versión 2.4.1") so the two sources of truth never
          diverge. */}
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="w-1 h-1 rounded-full bg-[rgb(var(--accent-base))]"
        />
        <span className="tnum tabular-nums">
          <span className="text-tertiary">v</span>
          <span className="text-secondary">2.4.1</span>
        </span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DisciplineLED                                                      */
/* ------------------------------------------------------------------ */

/**
 * DisciplineLED — steady green dot (matches the real app's
 * DisciplineLed Ellipse, XAML L314-315) with a subtle breathing halo
 * so the status bar feels alive. The real app uses a solid Ellipse
 * with no pulse — the LED is a state indicator (green = healthy
 * discipline), not a heartbeat. We keep the dot steady (so the
 * "always on" semantic is preserved) but add a soft accent halo that
 * scales from 1 to 2.4 and fades over 2s, looping — a gentle
 * "heartbeat" that doesn't compete with the dot's state-indicator
 * role. Respects prefers-reduced-motion (halo hidden, dot only).
 */
function DisciplineLED({ healthy }: { healthy: boolean }) {
  const reduce = useReducedMotion();
  const colorVar = healthy ? "--pnl-pos" : "--pnl-warn";
  return (
    <span
      className="relative inline-flex items-center justify-center w-3 h-3 shrink-0"
      aria-hidden="true"
    >
      {/* Breathing halo — soft ring that scales + fades over 2s. */}
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `rgb(var(${colorVar}))` }}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{
            duration: 2,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.3,
          }}
        />
      )}
      {/* Steady dot — the state indicator (green = healthy, amber = warn). */}
      <span
        className="relative w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: `rgb(var(${colorVar}))`,
          boxShadow: `0 0 5px rgb(var(${colorVar}) / 0.6)`,
        }}
      />
    </span>
  );
}
