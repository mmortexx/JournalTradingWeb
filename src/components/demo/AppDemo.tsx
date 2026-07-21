"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { DemoProvider, useDemo, type DemoPage } from "./DemoContext";
import { WindowChrome } from "./WindowChrome";
import { TopNav } from "./TopNav";
import { DashboardPage } from "./pages/DashboardPage";
import { TradesPage } from "./pages/TradesPage";
import { TradeDetailPage } from "./pages/TradeDetailPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { JournalPage } from "./pages/JournalPage";
import { PlaybookPage } from "./pages/PlaybookPage";
import { SettingsPage } from "./pages/SettingsPage";

/** The demo: a windowed recreation of the native app, fully interactive. */
export function AppDemo() {
  return (
    <DemoProvider>
      <AppDemoInner />
    </DemoProvider>
  );
}

function AppDemoInner() {
  const { t, lang } = useLang();
  const { page, fullscreen, setFullscreen, setPage, goBack } = useDemo();

  // Label the scrollable panel with the active page name (used by role="tabpanel").
  const panelLabelKey =
    page === "detail"
      ? "pageTrades"
      : (`page${page.charAt(0).toUpperCase()}${page.slice(1)}` as
          | "pageDashboard"
          | "pageTrades"
          | "pageAnalytics"
          | "pageJournal"
          | "pagePlaybook"
          | "pageSettings");

  // Exit fullscreen on Escape — listener attaches only while fullscreen is
  // active. The `setFullscreen(false)` call lives inside the event handler,
  // not in the effect body, so we don't trip the set-state-in-effect rule.
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

  /* ----------------------------------------------------------------
     F key — toggles fullscreen from anywhere on the page (when not
     typing in a form field and no modifiers are held, so we never
     hijack the browser's Cmd/Ctrl+F find-in-page). Also skipped while
     the CommandPalette or ShortcutsHelp overlay is open so those
     surfaces keep owning the keyboard. Mirrors the Escape listener's
     pattern: re-attaches whenever `fullscreen` flips so the handler
     closure always reads the current value.
     ---------------------------------------------------------------- */
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
      // Never hijack browser-owned combos (Cmd/Ctrl/Alt + F = find, etc.).
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Defer to the command palette / shortcuts overlay when they're open.
      if (document.querySelector("[cmdk-root]")) return;
      if (document.body.dataset.shortcutsHelpOpen === "true") return;

      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFullscreen(!fullscreen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, setFullscreen]);

  /* ----------------------------------------------------------------
     Touch swipe — horizontal swipe on the demo content area advances
     to the next/previous page in the main navigation chain:
       dashboard → trades → analytics → journal → playbook → settings
     The TradeDetailPage ("detail") is a drill-down from trades; a
     swipe-right there pops back to trades (matching the back button),
     a swipe-left jumps forward to analytics (the next main page).
     Threshold: 50px horizontal, dominant axis (|dx| > |dy|) so
     vertical scroll never triggers a page change. The gesture is
     ignored when it starts on an interactive control (button, input,
     select, textarea, contentEditable) so taps and form interactions
     are never hijacked.
     ---------------------------------------------------------------- */
  const PAGES_ORDER: readonly DemoPage[] = [
    "dashboard",
    "trades",
    "analytics",
    "journal",
    "playbook",
    "settings",
  ] as const;
  const SWIPE_THRESHOLD = 50;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target) {
      const tag = target.tagName;
      if (
        tag === "BUTTON" ||
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA" ||
        target.isContentEditable
      ) {
        touchStart.current = null;
        return;
      }
    }
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    // Vertical-dominant gestures are scroll, not swipe.
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (dx < 0) {
      // Swipe left → next page
      if (page === "detail") {
        setPage(PAGES_ORDER[2]); // analytics (the page after trades)
      } else {
        const i = PAGES_ORDER.indexOf(page);
        if (i >= 0 && i < PAGES_ORDER.length - 1) {
          setPage(PAGES_ORDER[i + 1]);
        }
      }
    } else {
      // Swipe right → previous page
      if (page === "detail") {
        goBack(); // pop back to the trades list
      } else {
        const i = PAGES_ORDER.indexOf(page);
        if (i > 0) {
          setPage(PAGES_ORDER[i - 1]);
        }
      }
    }
  };

  return (
    <div className="max-w-page mx-auto px-5 md:px-8">
      {/* Section header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="eyebrow inline-flex items-center gap-2 justify-center mb-3">
          <span className="w-6 h-px bg-white opacity-60" />
          {t("demoTitle")}
          <span className="w-6 h-px bg-white opacity-60" />
        </div>
        <h2 className="font-medium tracking-[-0.03em] leading-tight" style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
          {lang === "es" ? (
            <>La app, <span className="text-gradient">en tu navegador.</span></>
          ) : (
            <>The app, <span className="text-gradient">in your browser.</span></>
          )}
        </h2>
        <p className="text-lg text-secondary mt-4 leading-relaxed">{t("demoSubtitle")}</p>
      </div>

      {/* App window — floats over the page like a real OS window.
          Two-layer structure so the drop shadow + hairline border actually
          render (the `.liquid-glass` class sets `border: none` and its own
          `box-shadow`, which would silently override any `border-*` or
          `shadow-*` Tailwind utility on the same element):
            • Outer wrapper: `rounded-xl overflow-hidden border border-white/10
              shadow-[...]` — the 1px hairline border + a 4-layer shadow stack
              (depth-3's key/fill/accent-glow + the task's heavier
              `0 24px 80px -12px rgb(0 0 0/0.6)` drop shadow) that reads as a
              real floating window, not a flat card.
            • Inner: `liquid-glass rounded-xl overflow-hidden` — the machined
              glass material (translucent fill, 4px backdrop blur, 1px white
              top inset highlight, 1px black bottom inset, ::before rim
              gradient). `overflow-hidden` clips every child (title bar, nav,
              content, status bar) to the 12px window radius. */}
      <div
        className={`relative mx-auto transition-all duration-500 ${
          fullscreen
            ? "fixed inset-3 z-[100] rounded-xl"
            : "rounded-xl"
        }`}
      >
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_10px_rgb(0_0_0/0.26),0_18px_40px_rgb(0_0_0/0.3),0_0_28px_rgb(var(--accent-base)/0.1),0_24px_80px_-12px_rgb(0_0_0/0.6)]">
        <div className="liquid-glass rounded-xl overflow-hidden">
          <WindowChrome />
          <TopNav />

          {/* Page content */}
          <div className="relative">
            <div
              role="tabpanel"
              id="demo-tabpanel"
              aria-label={t(panelLabelKey)}
              tabIndex={0}
              className="relative h-[480px] sm:h-[560px] md:h-[640px] overflow-y-auto custom-scroll focus:outline-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="min-h-full"
                >
                  {page === "dashboard" && <DashboardPage />}
                  {page === "trades" && <TradesPage />}
                  {page === "detail" && <TradeDetailPage />}
                  {page === "analytics" && <AnalyticsPage />}
                  {page === "journal" && <JournalPage />}
                  {page === "playbook" && <PlaybookPage />}
                  {page === "settings" && <SettingsPage />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Status bar — 28px tall, mirrors a real Windows 11 / WinUI 3 app
              status bar (Bloomberg Terminal / Linear desktop convention):
              left = connection indicator (green dot + "Conectado" +
              "Local-first"), center = current view name, right = live clock +
              keyboard hint + fullscreen + share + reset. `liquid-glass`
              background with a `border-t border-white/10` hairline; the
              bottom corners are rounded automatically by the parent
              window's `overflow-hidden` + `rounded-xl`. All text uses
              `text-tertiary` (gray-400 on dark) so the bar reads as quiet
              chrome, not content. Numbers use `.tnum` for tabular alignment. */}
          <div className="liquid-glass border-t border-white/10 flex items-center justify-between px-3 h-7 text-[11px] text-tertiary select-none">
            {/* Left — connection status. The green dot has a soft accent halo
                (`shadow-[0_0_6px_rgb(var(--pnl-pos)/0.6)]`) so it reads as a
                live "connected" LED, not a flat speck. The demoSampleData
                notice moves into the dot's `title` attribute so the ethical
                clarity ("sample data, not real trading") is preserved
                without crowding the bar. "Conectado" / "Connected" is
                inline-bilingual since no STR key exists for it; "Local-first"
                reuses the existing `localFirst` STR key. */}
            <span className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full bg-pnl-pos shrink-0 shadow-[0_0_6px_rgb(var(--pnl-pos)/0.6)]"
                title={t("demoSampleData")}
                aria-label={t("demoSampleData")}
              />
              <span className="truncate text-secondary">
                {lang === "es" ? "Conectado" : "Connected"}
              </span>
              <span aria-hidden="true" className="hidden sm:inline opacity-40">·</span>
              <span className="hidden sm:inline truncate">{t("localFirst")}</span>
              {/* Keyboard-shortcut hint — desktop only. Teases the 1–6
                  digit shortcuts so power users discover them without
                  opening the full ? help overlay. */}
              <span
                aria-hidden="true"
                className="hidden lg:inline opacity-40 ml-0.5"
              >
                ·
              </span>
              <span
                className="hidden lg:inline text-[10px] tnum"
                title={t("navShortcuts")}
              >
                {t("demoKeyHint")}
              </span>
            </span>
            {/* Center — current view name. Mirrors how WinUI 3 apps show the
                active document/view in the status bar. Hidden on <sm so the
                bar stays readable on narrow viewports; the active tab in
                TopNav already conveys the current view to mobile users. */}
            <span className="hidden md:inline text-tertiary truncate absolute left-1/2 -translate-x-1/2 pointer-events-none">
              {t(panelLabelKey)}
            </span>
            {/* Right side — live clock + fullscreen + share + reset (Win11
                status-bar ordering: primary view control first, then utility
                actions). All three keep their existing behavior; only the
                visual order was changed to match the Windows 11 convention. */}
            <span className="flex items-center gap-3">
              <LiveClock />
              <button
                onClick={() => setFullscreen(!fullscreen)}
                aria-label={fullscreen ? t("demoCloseFull") : t("demoOpenFull")}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                {fullscreen ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 6L2 2M10 6l4-4M6 10l-4 4M10 10l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    <span className="hidden sm:inline">{t("demoCloseFull")}</span>
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="hidden sm:inline">{t("demoOpenFull")}</span>
                  </>
                )}
              </button>
              <ShareButton />
              {/* Reset — desktop only. Snaps the demo back to the
                  dashboard tab and shows a brief "✓ Reiniciado" / "✓ Reset"
                  confirmation that auto-dismisses after 2 s. */}
              <ResetButton />
            </span>
          </div>

          {/* Window top reflection — thin 1px white-to-transparent gradient
              at the very top of the window. Mimics the subtle highlight
              where light catches the top edge of a real Windows 11 floating
              OS window. `from-white/15` (bumped from /8) so the key-light
              edge reads clearly even against the dark liquid-glass surface.
              pointer-events-none so it never intercepts clicks. Sits above
              the title bar (z-10) so it overlaps the WindowChrome's top edge. */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-b from-white/15 to-transparent pointer-events-none z-10"
          />
        </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LiveClock (status bar)                                             */
/* ------------------------------------------------------------------ */

/**
 * LiveClock — a real-time HH:MM clock for the demo's status bar, mirroring
 * the live-clock convention in Bloomberg Terminal / TradingView desktop
 * apps. Updates every 30 s (a minute-resolution clock doesn't need a
 * 1-second tick — saves a re-render per second). Renders `--:--` until the
 * first client-side tick (initializing empty avoids an SSR/hydration
 * mismatch since the server can't know the user's local time). Tabular
 * numerals via `.tnum` so the digits don't shift width as minutes change.
 * Hidden on <sm to keep the status bar readable on narrow viewports.
 */
function LiveClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hh}:${mm}`);
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="hidden sm:inline tnum tabular-nums" aria-label={time || "Clock"}>
      {time || "--:--"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Share button (status bar)                                          */
/* ------------------------------------------------------------------ */

/**
 * ShareButton — uses the Web Share API when available, otherwise copies
 * the current page URL to the clipboard and shows a brief "✓ Copied"
 * confirmation. The confirmation auto-dismisses after 2 s. Lives in the
 * demo's status bar so it's reachable from any page in the demo.
 */
function ShareButton() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  // Track the "✓ Copied" reset timeout so we can clear it on unmount and
  // avoid a late setState on a gone component.
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

    // Prefer the native share sheet when the browser exposes it.
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

/* ------------------------------------------------------------------ */
/* Reset button (status bar, desktop only)                            */
/* ------------------------------------------------------------------ */

/**
 * ResetButton — snaps the demo back to the dashboard tab and shows a brief
 * "✓ Reiniciado" / "✓ Reset" confirmation that auto-dismisses after 2 s,
 * mirroring the ShareButton's confirmation pattern. Desktop-only
 * (`hidden lg:inline`) since the status bar is already crowded on smaller
 * viewports.
 */
function ResetButton() {
  const { t } = useLang();
  const { setPage } = useDemo();
  const [done, setDone] = useState(false);
  // Track the "✓ Done" reset timeout so we can clear it on unmount.
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const handleReset = () => {
    setPage("dashboard");
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
