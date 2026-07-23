"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { DemoProvider, useDemo, type DemoPage } from "./DemoContext";
import { WindowChrome } from "./WindowChrome";
import { TopNav } from "./TopNav";
import { StatusBar } from "./StatusBar";
import { DemoCommandPalette } from "./DemoCommandPalette";
import { DemoShortcutsHint } from "./DemoShortcutsHint";
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

  // Demo-scoped command palette + shortcuts-overlay open state. Lifted here
  // so the capture-phase keydown listener (below) and the StatusBar's
  // keyboard-icon button can both toggle them, and so the overlays render
  // inside the demo window's positioning context.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Ref on the demo window's outer wrapper — used (a) as the positioning
  // context for the absolute overlays and (b) to gate the Cmd+K / `?`
  // capture-phase interceptor (only fires when the demo is hovered or
  // focused-within, so the global CommandPalette / ShortcutsHelp keep
  // working when the user isn't interacting with the demo).
  const demoRootRef = useRef<HTMLDivElement>(null);

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
      if (document.body.dataset.demoPaletteOpen === "true") return;
      if (document.body.dataset.demoShortcutsOpen === "true") return;

      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFullscreen(!fullscreen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, setFullscreen]);

  /* ----------------------------------------------------------------
     Demo-scoped Cmd+K (palette) + `?` (shortcuts overlay) interceptor.
     Capture-phase listener on `window` so it fires BEFORE the global
     CommandPalette / ShortcutsHelp bubble-phase listeners — calling
     `stopPropagation` prevents those global handlers from also firing,
     so the demo gets its own palette / overlay instead of the site-wide
     ones whenever the demo is "active" (hovered or focused-within).

     The `:hover, :focus-within` gate on `demoRootRef` is what scopes
     the interception: when the user isn't interacting with the demo,
     the global Cmd+K / `?` keep working as before. Skipped while typing
     in a form field, while any modifiers are held (so Cmd+Shift+K etc.
     pass through), and while either demo overlay is already open
     (their own Escape handlers own the close action).
     ---------------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = demoRootRef.current;
      if (!root) return;
      // Only intercept when the demo is "active".
      if (!root.matches(":hover, :focus-within")) return;
      // Skip when typing in a form field.
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
      // Cmd+K / Ctrl+K → open the demo command palette.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        setPaletteOpen(true);
        return;
      }
      // `?` (Shift+/) → open the demo shortcuts overlay. Skipped while
      // the demo palette is open (let the palette's own Esc close it
      // first) and while the global ShortcutsHelp is open.
      if (
        document.body.dataset.demoPaletteOpen === "true" ||
        document.body.dataset.shortcutsHelpOpen === "true" ||
        document.body.dataset.demoShortcutsOpen === "true"
      ) {
        return;
      }
      if (
        e.key === "?" ||
        (e.shiftKey && (e.key === "/" || e.code === "Slash"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey, true); // capture phase
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

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
        ref={demoRootRef}
        className={`relative mx-auto transition-[transform,border-radius,box-shadow,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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

          {/* Status bar — extracted into its own `StatusBar` component
              (Feature 1) so the new live mini-metrics ticker + keyboard
              icon button (Feature 3 trigger) live next to the bar they
              decorate. Mirrors a real Windows 11 / WinUI 3 status bar
              (Bloomberg Terminal / Linear desktop convention): left =
              connection LED + "Conectado" + "Local-first", center = live
              mini-metrics ticker (cycles every 4 s), right = HH:MM:SS
              clock + "data: 72 trades" + keyboard / fullscreen / share /
              reset icon buttons. */}
          <StatusBar onOpenShortcuts={() => setShortcutsOpen(true)} />

          {/* In-demo command palette (Feature 2) — Cmd+K when the demo is
              active. Rendered here so it sits inside the demo window's
              positioning context (absolute inset-0 covers only the demo,
              not the whole page). The capture-phase keydown listener above
              opens it; the palette manages its own Esc / arrows / enter. */}
          <DemoCommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
          />

          {/* In-demo keyboard-shortcuts overlay (Feature 3) — `?` when the
              demo is active, or click the keyboard icon in the status bar.
              Anchored bottom-right, just above the status bar. */}
          <DemoShortcutsHint
            open={shortcutsOpen}
            onClose={() => setShortcutsOpen(false)}
          />

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
          {/* Window bottom reflection — mirror of the top key-light, an
              even softer 1px hairline at the bottom of the window. Gives
              the demo window a machined-feel on both top AND bottom edges
              (the bottom edge currently relies only on the StatusBar's
              own border, which reads flat by comparison). Sits above the
              StatusBar (z-10) and never intercepts clicks. */}
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
