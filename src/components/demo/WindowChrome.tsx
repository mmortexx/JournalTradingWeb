"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useDemo } from "./DemoContext";

/* ------------------------------------------------------------------ */
/* Compact MarketClock chip for the title bar                         */
/* ------------------------------------------------------------------ */

/*
 * The four major FX/equity trading sessions (UTC open/close minutes
 * from midnight). Mirrors the SESSIONS array in
 * @/components/tj/MarketClock (kept here as a private duplicate so the
 * title bar doesn't pull the full MarketClock bundle — which renders
 * a wide horizontal strip + SlowMoChart canvas — into the demo's
 * always-mounted chrome).
 */
const SESSIONS = [
  { id: "sydney", name: "Sydney", open: 21 * 60, close: 6 * 60 },
  { id: "tokyo", name: "Tokyo", open: 23 * 60, close: 8 * 60 },
  { id: "london", name: "London", open: 8 * 60, close: 16 * 60 + 30 },
  { id: "newyork", name: "New York", open: 13 * 60 + 30, close: 20 * 60 },
] as const;

function sessionIsOpen(
  open: number,
  close: number,
  utcMin: number
): boolean {
  if (open < close) return utcMin >= open && utcMin < close;
  // Overnight session (wraps midnight UTC).
  return utcMin >= open || utcMin < close;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * MarketClockChip — the title bar's compact market-clock indicator,
 * mirroring the real app's `controls:MarketClock` control (XAML L117
 * in MainWindow.xaml). The real app shows UTC time + the four sessions
 * (Sydney / Tokyo / London / NY) with an open/closed dot, name, local
 * time and progress bar — too wide for our 36px-tall title bar. This
 * chip is the same idea, scaled down: UTC HH:MM + 4 small
 * open/closed dots. Each dot carries a tooltip with the session name +
 * status so the user can recover the full info on hover.
 *
 * Updates every 30 s (the title bar doesn't need second-resolution —
 * the StatusBar's HH:MM:SS clock already shows the live time, and the
 * session open/close transitions happen on the minute, not the
 * second).
 */
function MarketClockChip() {
  const { lang } = useLang();
  const es = lang === "es";
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const utcTime = `${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())}`;
  const openCount = SESSIONS.filter((s) =>
    sessionIsOpen(s.open, s.close, utcMin)
  ).length;

  return (
    <div
      className="hidden md:flex items-center gap-2"
      role="status"
      aria-label={
        es
          ? `Reloj de mercado · UTC ${utcTime} · ${openCount} sesiones abiertas`
          : `Market clock · UTC ${utcTime} · ${openCount} sessions open`
      }
      title={
        es
          ? `UTC ${utcTime} · ${openCount} ${openCount === 1 ? "sesión abierta" : "sesiones abiertas"}`
          : `UTC ${utcTime} · ${openCount} ${openCount === 1 ? "session open" : "sessions open"}`
      }
    >
      <span className="text-[10px] uppercase tracking-[0.12em] text-tertiary">
        UTC
      </span>
      <span className="text-xs tnum tabular-nums text-secondary font-medium">
        {utcTime}
      </span>
      <div className="flex items-center gap-1">
        {SESSIONS.map((s) => {
          const open = sessionIsOpen(s.open, s.close, utcMin);
          return (
            <span
              key={s.id}
              title={`${s.name} · ${open ? (es ? "Abierta" : "Open") : (es ? "Cerrada" : "Closed")}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                open
                  ? "bg-pnl-pos shadow-[0_0_4px_rgb(var(--pnl-pos)/0.6)]"
                  : "bg-pnl-neg/40"
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Local-first LED                                                    */
/* ------------------------------------------------------------------ */

/**
 * LocalFirstLED — green dot + "Local-first" label, mirroring the real
 * app's LocalFirstPanel (XAML L120-128). The real app uses a solid
 * Ellipse (no pulse) since the LED is a state indicator (always "on"
 * in the local-first app), not a heartbeat. We match that — no
 * animation, just a steady green dot. Tooltip carries the longer
 * "Local-first · sin nube / no cloud" string from the real app's
 * TitleBar_LocalFirstLed resource (Strings/{es-ES,en-GB}/Resources.resw
 * L12).
 */
function LocalFirstLED() {
  const { t } = useLang();
  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-3 h-full"
      title={t("titleLocalFirstLed")}
      aria-label={t("titleLocalFirstLed")}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-pnl-pos shadow-[0_0_5px_rgb(var(--pnl-pos)/0.55)]"
        aria-hidden="true"
      />
      <span className="text-[11px] text-tertiary truncate">
        {t("localFirst")}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WindowChrome (Windows 11 title bar — restructured to match the     */
/* real app's MainWindow.xaml L76-128)                                */
/* ------------------------------------------------------------------ */

/**
 * Windows 11 / WinUI 3 title bar, restructured (R25-1a) to match the
 * real app's title bar (MainWindow.xaml L76-128). The pre-R25-1a
 * version had a Win11 doc-title centered between the app name + DEMO
 * chip on the left and the caption buttons on the right — the real
 * app's title bar is asymmetric and richer:
 *
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │ ◧ Trading Journal    [DEMO · 10.000 $]  UTC 14:32 ●●●○    ●  ⤢  ✕  │
 *   │                                              Local-first             │
 *   └──────────────────────────────────────────────────────────────────────┘
 *
 * Three regions (mirrors the real app's 4-column Grid):
 *   • LEFT (col 0):   16×16 app icon + "Trading Journal" name. No
 *                     DEMO chip — the DEMO marker lives in the account
 *                     chip's text ("DEMO · 10.000 $") per the real app.
 *   • CENTER (col 2): Account demo chip (terminal-style pill with a
 *                     small account icon + monospace "DEMO · 10.000 $"
 *                     text, left-aligned) + MarketClockChip (right-
 *                     aligned: UTC time + 4 open/closed session dots).
 *   • RIGHT (col 3):  Local-first LED + "Local-first" label, then the
 *                     Win11 caption buttons (Min / Max / Close) at the
 *                     far right.
 *
 * Caption-button styling is unchanged from pre-R25-1a — Windows 11
 * authentic: each button 46px wide × full title-bar height so the hover
 * wash reaches the top & bottom edges, Min = 10px stroke, Max = 10px
 * square outline (flips to "Restore" two-overlapping-squares glyph in
 * fullscreen), Close = 10px × glyph with the Win11 close-red #C42B1C
 * on hover. Close exits fullscreen when active; otherwise visual-only
 * (the demo can't be "closed" — there's no parent shell to return to).
 *
 * The `viewLabel` prop is removed (R25-1a) — the real app's title bar
 * doesn't have a centered doc-title (it has the account chip +
 * MarketClock instead). The pre-R25-1a caller `RealScreenshotDemo.tsx`
 * was updated to stop passing it.
 */
export function WindowChrome() {
  const { t } = useLang();
  const { fullscreen, setFullscreen } = useDemo();

  return (
    <div className="liquid-glass border-b border-white/10 flex items-center justify-between h-9 text-xs shrink-0 relative cursor-default select-none">
      {/* Subtle draggable-area texture — a 2px machined top edge that
          reads as the top rim of a real WinUI 3 title bar. The accent
          tint at the very top ties the chrome to the demo's accent
          identity; the white/10 below it is the machined-edge specular.
          Sits under the caption buttons so they stay crisp. The texture
          is pointer-events-none so it never blocks clicks. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--accent-base) / 0.40) 0%, rgb(255 255 255 / 0.10) 50%, transparent 100%)",
        }}
      />

      {/* ── LEFT: app icon + name ── */}
      <div className="flex items-center px-3 min-w-0 relative z-[1]">
        <AppIcon />
        <span
          className="text-xs font-medium text-secondary ml-2 hidden sm:inline truncate"
          style={{
            fontFamily:
              '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
          }}
        >
          {t("appName")}
        </span>
      </div>

      {/* ── CENTER: account demo chip + market clock ──
          Absolutely centered so the layout doesn't shift when the account
          text changes. The account chip is left-aligned within the center
          cluster (per the real app's HorizontalAlignment="Left"), the
          market clock right-aligned (HorizontalAlignment="Right") — both
          pinned to the center axis so they don't drift toward the edges.
          Hidden below md to avoid colliding with the icon/name + caption
          buttons on narrow viewports. pointer-events-none on the cluster
          wrapper so it never intercepts the title-bar's hover texture or
          caption clicks (the chip itself is non-interactive, matching
          the real app's IsHitTestVisible="False"). */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 pointer-events-none z-[1]">
        <AccountChip />
        <MarketClockChip />
      </div>

      {/* ── RIGHT: Local-first LED + Windows 11 caption buttons ── */}
      <div className="flex items-stretch h-full relative z-[1]">
        <LocalFirstLED />
        {/* Vertical hairline divider — visual grouping so the Win11
            caption buttons read as a distinct cluster. Mirrors the
            subtle separator the real app shows between the title-bar
            content and the caption buttons. Hidden on <sm alongside
            the Local-first LED so the divider never appears alone. */}
        <div
          aria-hidden="true"
          className="hidden sm:block w-px h-full bg-white/10"
        />
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

/* ------------------------------------------------------------------ */
/* AccountChip — terminal-style DEMO account pill (center cluster)   */
/* ------------------------------------------------------------------ */

/**
 * AccountChip — the centered terminal-style account pill that mirrors
 * the real app's title-bar account chip (XAML L102-113). The real app
 * uses PillBorderStyle + a FontIcon (E8C7) + monospace "DEMO · 10.000 $"
 * text. We replicate the same shape: a hairline-bordered pill with a
 * small account/wallet icon + monospace tabular-figures text. The
 * "DEMO" prefix in the text is what flags this as a demo account —
 * the real app doesn't have a separate DEMO badge on the left of the
 * title bar (the pre-R25-1a version did; that was wrong).
 *
 * Non-interactive (pointer-events-none on the parent cluster) so the
 * title bar's drag texture and caption buttons stay clickable —
 * matches the real app's IsHitTestVisible="False" on the chip.
 */
function AccountChip() {
  const { t } = useLang();
  return (
    <span className="pill bg-white/5 border border-white/15 text-secondary flex items-center gap-1.5">
      {/* Live-terminal accent dot — a tiny accent-tinted LED that reads
          as a "connected / live" indicator, matching the Bloomberg /
          terminal aesthetic of the chip's monospace text. Sits before
          the wallet icon so the dot reads as the chip's status, not
          part of the account icon. */}
      <span
        aria-hidden="true"
        className="w-1 h-1 rounded-full bg-[rgb(var(--accent-base))] shadow-[0_0_4px_rgb(var(--accent-base)/0.7)]"
      />
      {/* Account/wallet icon — small (10px) so it reads as a leading
          glyph, not a feature icon. Matches the real app's FontIcon
          FontSize="12" E8C7. */}
      <svg
        width="10"
        height="10"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-tertiary"
        aria-hidden="true"
      >
        <path d="M2 5a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" />
        <path d="M2 7h12" />
        <circle cx="11" cy="9.5" r="0.6" fill="currentColor" />
      </svg>
      <span
        className="text-[11px] tabular-nums"
        style={{ fontFamily: '"Cascadia Mono", Consolas, "Courier New", monospace' }}
      >
        {t("demoAccount")}
      </span>
    </span>
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
      className="w-4 h-4 rounded-[3px] flex items-center justify-center shrink-0 shadow-[0_0_0_1px_rgb(255_255_255_/_0.10),inset_0_0_0_1px_rgb(255_255_255_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.35)]"
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
