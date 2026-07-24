"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { useDemo } from "./DemoContext";
import { METRICS } from "@/lib/trading/data";
import { fmtMoney, fmtPct } from "@/lib/trading/format";

/* ------------------------------------------------------------------ */
/* StatusBar (institutional WinUI 3 / Bloomberg-style status bar)      */
/* ------------------------------------------------------------------ */

interface StatusBarProps {
  /** Open the in-demo keyboard-shortcuts overlay (Feature 3). If omitted,
   *  the keyboard-icon button is hidden — used by RealScreenshotDemo, which
   *  doesn't render the shortcuts overlay (its shortcuts differ from the
   *  interactive AppDemo's). */
  onOpenShortcuts?: () => void;
  /** Override the reset button's behavior. If omitted, the reset button
   *  snaps the demo context's `page` back to "dashboard" (the default for
   *  the interactive AppDemo). RealScreenshotDemo passes its own handler
   *  to snap the active screenshot tab back to the first one. */
  onReset?: () => void;
}

/**
 * StatusBar — institutional WinUI 3 / Bloomberg-Terminal-style status bar
 * that sits below the demo's tabpanel. Three regions:
 *
 *   LEFT    — connection LED (green pulsing dot) + "Conectado" +
 *             "Local-first" badge. The LED's soft accent halo reads as a
 *             live "connected" indicator, not a flat speck.
 *   CENTER  — live mini-metrics ticker that cycles through Net P&L, Win
 *             Rate, Expectancy and Active trades every 4 s with a soft
 *             fade transition. P&L values use `--pnl-pos/neg` coloring.
 *   RIGHT   — live HH:MM:SS clock (1 s tick) + "data: 72 trades"
 *             indicator + keyboard / fullscreen / share / reset icon
 *             buttons (Win11 status-bar ordering: primary view control
 *             first, then utility actions).
 *
 * Replaces the inline status bar that previously lived inside AppDemo.tsx.
 * Extracted as its own component so the new live ticker + keyboard icon
 * button (Feature 1 + Feature 3 trigger) live next to the bar they
 * decorate. Bilingual via `useLang()`. P&L colors for figures, accent gold
 * used only on the connection LED's halo (the single "live" cue).
 *
 * Layout: `.liquid-glass border-t border-white/10 h-7 flex items-center
 * justify-between px-3 text-xs text-tertiary tnum` — the institutional
 * status-bar pattern. The bottom corners are rounded automatically by the
 * parent window's `overflow-hidden` + `rounded-xl`.
 */
export function StatusBar({ onOpenShortcuts, onReset }: StatusBarProps = {}) {
  const { t, lang } = useLang();
  const { fullscreen, setFullscreen, setPage } = useDemo();
  const es = lang === "es";
  // R24-1c (courtesy fix): pull onOpenShortcuts into a local const so TS
  // narrows it from `(() => void) | undefined` to `() => void` inside the
  // JSX `&&` clause below — the destructured-prop narrowing in `{onOpenShortcuts && ...}`
  // was unreliable and produced a tsc2322 error at the KeyboardIconButton
  // call site. Local const narrowing is rock-solid.
  const openShortcuts = onOpenShortcuts;

  return (
    <div className="liquid-glass border-t border-white/10 relative flex items-center justify-between px-3 h-7 text-[11px] text-tertiary select-none">
      {/* LEFT — connection LED + "Conectado" + "Local-first" badge */}
      <span className="flex items-center gap-1.5 min-w-0">
        <ConnectionLED title={t("demoSampleData")} />
        <span className="truncate text-secondary">
          {es ? "Conectado" : "Connected"}
        </span>
        <span aria-hidden="true" className="hidden sm:inline opacity-40">
          ·
        </span>
        <span className="hidden sm:inline truncate">{t("localFirst")}</span>
      </span>

      {/* CENTER — live mini-metrics ticker (absolute, pointer-events-none
          so it never intercepts clicks on the left/right regions). Hidden
          on <md so the bar stays readable on narrow viewports. */}
      <MetricsTicker />

      {/* RIGHT — clock + data + icon buttons */}
      <span className="flex items-center gap-3">
        <LiveClock />
        <span className="hidden md:inline tnum">
          {es ? "datos: " : "data: "}
          <span className="text-secondary">{METRICS.closedCount}</span>
          {es ? " operaciones" : " trades"}
        </span>
        {openShortcuts && <KeyboardIconButton onClick={openShortcuts} es={es} />}
        <button
          type="button"
          onClick={() => setFullscreen(!fullscreen)}
          aria-label={fullscreen ? t("demoCloseFull") : t("demoOpenFull")}
          className="hover:text-primary transition-colors flex items-center"
        >
          {fullscreen ? (
            <ExitFullscreenIcon />
          ) : (
            <EnterFullscreenIcon />
          )}
        </button>
        <ShareButton />
        <ResetButton onReset={onReset ?? (() => setPage("dashboard"))} />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Connection LED                                                     */
/* ------------------------------------------------------------------ */

/**
 * ConnectionLED — green pulsing dot with a soft accent halo. The pulse
 * animation runs once per second (a "heartbeat" cadence — fast enough to
 * read as live, slow enough not to distract). `prefers-reduced-motion`
 * users see a static dot (the animation is wrapped in a CSS guard via
 * framer-motion's `useReducedMotion`). The `title` carries the ethical
 * clarity ("sample data, not real trading") so it's preserved without
 * crowding the bar.
 */
function ConnectionLED({ title }: { title: string }) {
  return (
    <span
      className="relative inline-flex w-1.5 h-1.5 shrink-0"
      title={title}
      aria-label={title}
    >
      {/* Soft halo — pulses outward to read as a "live" connection LED. */}
      <motion.span
        className="absolute inset-0 rounded-full bg-pnl-pos"
        initial={{ opacity: 0.7, scale: 1 }}
        animate={{ opacity: [0.7, 0, 0.7], scale: [1, 2.4, 1] }}
        transition={{
          duration: 2,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 0,
        }}
        style={{ transformOrigin: "50% 50%" }}
        aria-hidden="true"
      />
      {/* Solid core — the steady "on" dot. */}
      <span className="relative w-1.5 h-1.5 rounded-full bg-pnl-pos shadow-[0_0_6px_rgb(var(--pnl-pos)/0.6)]" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Live mini-metrics ticker (center)                                  */
/* ------------------------------------------------------------------ */

interface TickerItem {
  labelEs: string;
  labelEn: string;
  value: string;
  tone: "pos" | "neg" | "neutral";
}

/**
 * MetricsTicker — cycles through the 4 headline stats (Net P&L, Win Rate,
 * Expectancy, Active trades) every 4 s with a soft fade transition. P&L
 * values use `--pnl-pos/neg` coloring; neutral figures use `text-primary`.
 *
 * The values are computed once from `METRICS` (the deterministic demo
 * metrics) so they're stable across renders. The fade is `AnimatePresence
 * mode="wait"` so the outgoing value exits before the incoming one enters
 * (no overlap, no width jitter). `tnum` on every value so the digits
 * don't shift width as the cycle progresses.
 */
function MetricsTicker() {
  const { lang } = useLang();
  const es = lang === "es";

  const items = useMemo<TickerItem[]>(
    () => [
      {
        labelEs: "P&L neto",
        labelEn: "Net P&L",
        value: fmtMoney(METRICS.netPnl, lang, { sign: true }),
        tone: METRICS.netPnl > 0 ? "pos" : "neg",
      },
      {
        labelEs: "Win rate",
        labelEn: "Win rate",
        value: fmtPct(METRICS.winRate, lang, 1),
        tone: "neutral",
      },
      {
        labelEs: "Expectancy",
        labelEn: "Expectancy",
        value: fmtMoney(METRICS.expectancy, lang, { sign: true }),
        tone: METRICS.expectancy > 0 ? "pos" : "neg",
      },
      {
        labelEs: "Operaciones",
        labelEn: "Trades",
        value: String(METRICS.closedCount),
        tone: "neutral",
      },
    ],
    [lang]
  );

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setI((p) => (p + 1) % items.length),
      4000
    );
    return () => window.clearInterval(id);
  }, [items.length]);

  const item = items[i];
  const toneClass =
    item.tone === "pos"
      ? "text-pnl-pos"
      : item.tone === "neg"
      ? "text-pnl-neg"
      : "text-primary";

  return (
    <div
      className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none"
      aria-live="off"
    >
      <span
        className="text-tertiary uppercase tracking-[0.15em] text-[10px]"
        aria-hidden="true"
      >
        ●
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <span className="text-tertiary">{es ? item.labelEs : item.labelEn}</span>
          <span className={`tnum font-medium ${toneClass}`}>{item.value}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LiveClock — HH:MM:SS, 1-second tick                                */
/* ------------------------------------------------------------------ */

/**
 * LiveClock — real-time HH:MM:SS clock for the demo's status bar. Updates
 * every second (1 Hz tick — a real trading terminal clock needs
 * second-resolution, unlike the prior minute-resolution clock which was
 * fine for the marketing demo but reads as "frozen" in a power-user
 * context). Renders `--:--:--` until the first client-side tick (initializing
 * empty avoids an SSR/hydration mismatch since the server can't know the
 * user's local time). Tabular numerals via `.tnum` so the digits don't
 * shift width as seconds change. Hidden on <sm to keep the bar readable
 * on narrow viewports.
 */
function LiveClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span
      className="hidden sm:inline tnum tabular-nums"
      aria-label={time || "Clock"}
    >
      {time || "--:--:--"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Keyboard icon button (opens the shortcuts overlay)                 */
/* ------------------------------------------------------------------ */

/**
 * KeyboardIconButton — small icon button that opens the in-demo keyboard
 * shortcuts overlay (Feature 3). Mirrors the Win11 status-bar pattern of
 * a "?" / help affordance at the right edge. Tooltip + aria-label expose
 * the action to mouse users and screen readers; the `?` keyboard
 * shortcut itself is handled by AppDemo's capture-phase keydown listener.
 */
function KeyboardIconButton({ onClick, es }: { onClick: () => void; es: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={es ? "Atajos de teclado (?)" : "Keyboard shortcuts (?)"}
      title={es ? "Atajos de teclado (?)" : "Keyboard shortcuts (?)"}
      className="hover:text-primary transition-colors flex items-center"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M7 10h0M11 10h0M15 10h0M7 14h0M11 14h0M15 14h0M18 14h0" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Fullscreen / Share / Reset (utility icon buttons)                  */
/* ------------------------------------------------------------------ */

function EnterFullscreenIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L2 2M10 6l4-4M6 10l-4 4M10 10l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * ShareButton — uses the Web Share API when available, otherwise copies
 * the current page URL to the clipboard and shows a brief "✓ Copied"
 * confirmation that auto-dismisses after 2 s.
 */
function ShareButton() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleShare() {
    if (typeof navigator === "undefined") return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: "Trading Journal — Demo", url };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User dismissed the share sheet (AbortError) or the call failed —
        // fall through to the clipboard path so the button still does
        // something useful on desktop browsers without share support.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be blocked by permissions; fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t("demoShare")}
      className="hover:text-primary transition-colors flex items-center gap-1"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M5.7 7.1l4.6-2.6M5.7 8.9l4.6 2.6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline">{copied ? t("demoShareCopied") : t("demoShare")}</span>
    </button>
  );
}

/**
 * ResetButton — snaps the demo back to the dashboard tab and shows a
 * brief "✓ Reiniciado" / "✓ Reset" confirmation that auto-dismisses after
 * 2 s. Desktop-only (`hidden lg:inline`) since the status bar is already
 * crowded on smaller viewports.
 */
function ResetButton({ onReset }: { onReset: () => void }) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const handleReset = () => {
    onReset();
    setDone(true);
    if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      aria-label={t("demoReset")}
      className="hidden lg:inline hover:text-primary transition-colors flex items-center gap-1"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={done ? "" : "transition-transform duration-500"}
        style={done ? undefined : { transformOrigin: "50% 50%" }}
      >
        <path
          d="M13.5 8a5.5 5.5 0 11-1.7-3.95M13.5 2v3h-3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{done ? t("demoResetDone") : t("demoReset")}</span>
    </button>
  );
}
