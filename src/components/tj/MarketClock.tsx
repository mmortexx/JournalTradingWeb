"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLang, type Lang } from "@/lib/i18n";
import { SlowMoChart } from "./SlowMoChart";

/* ------------------------------------------------------------------ */
/* Session definitions (all hours in UTC, minutes from midnight UTC). */
/* ------------------------------------------------------------------ */

interface SessionDef {
  id: "sydney" | "tokyo" | "london" | "newyork";
  nameEs: string;
  nameEn: string;
  tz: string;
  /** UTC open time in minutes from midnight UTC. */
  openUtc: number;
  /** UTC close time in minutes from midnight UTC. May be < openUtc for overnight sessions. */
  closeUtc: number;
  localLabelEs: string;
  localLabelEn: string;
}

const SESSIONS: SessionDef[] = [
  {
    id: "sydney",
    nameEs: "Sídney",
    nameEn: "Sydney",
    tz: "Australia/Sydney",
    openUtc: 21 * 60, // 21:00 UTC
    closeUtc: 6 * 60, // 06:00 UTC (next day)
    localLabelEs: "Hora de Sídney",
    localLabelEn: "Sydney time",
  },
  {
    id: "tokyo",
    nameEs: "Tokio",
    nameEn: "Tokyo",
    tz: "Asia/Tokyo",
    openUtc: 23 * 60, // 23:00 UTC
    closeUtc: 8 * 60, // 08:00 UTC (next day)
    localLabelEs: "Hora de Tokio",
    localLabelEn: "Tokyo time",
  },
  {
    id: "london",
    nameEs: "Londres",
    nameEn: "London",
    tz: "Europe/London",
    openUtc: 8 * 60, // 08:00 UTC
    closeUtc: 16 * 60 + 30, // 16:30 UTC
    localLabelEs: "Hora de Londres",
    localLabelEn: "London time",
  },
  {
    id: "newyork",
    nameEs: "Nueva York",
    nameEn: "New York",
    tz: "America/New_York",
    openUtc: 13 * 60 + 30, // 13:30 UTC
    closeUtc: 20 * 60, // 20:00 UTC
    localLabelEs: "Hora de Nueva York",
    localLabelEn: "New York time",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function utcMinutes(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
}

function sessionStatus(
  s: SessionDef,
  now: Date
): { isOpen: boolean; progress: number } {
  const cur = utcMinutes(now);
  const { openUtc, closeUtc } = s;

  if (openUtc < closeUtc) {
    // Same-day session.
    const isOpen = cur >= openUtc && cur < closeUtc;
    const length = closeUtc - openUtc;
    const elapsed = isOpen ? cur - openUtc : 0;
    return {
      isOpen,
      progress: isOpen ? Math.min(100, (elapsed / length) * 100) : 0,
    };
  }

  // Overnight session that wraps midnight UTC.
  const isOpen = cur >= openUtc || cur < closeUtc;
  const length = 24 * 60 - openUtc + closeUtc;
  const elapsed = isOpen
    ? cur >= openUtc
      ? cur - openUtc
      : 24 * 60 - openUtc + cur
    : 0;
  return {
    isOpen,
    progress: isOpen ? Math.min(100, (elapsed / length) * 100) : 0,
  };
}

const timeFormatters = new Map<string, Intl.DateTimeFormat>();
function getTimeFormatter(tz: string, lang: Lang): Intl.DateTimeFormat {
  const key = `${lang}|${tz}`;
  let f = timeFormatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: tz,
    });
    timeFormatters.set(key, f);
  }
  return f;
}

function fmtTime(d: Date, tz: string, lang: Lang): string {
  return getTimeFormatter(tz, lang).format(d);
}

/* ------------------------------------------------------------------ */
/* Sub-components (module-level so they don't remount every tick)     */
/* ------------------------------------------------------------------ */

function StatusDot({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className="relative inline-flex w-2.5 h-2.5 shrink-0"
      aria-hidden="true"
    >
      <span
        className={`relative inline-flex w-2.5 h-2.5 rounded-full transition-colors ${
          isOpen
            ? "bg-pnl-pos shadow-[0_0_8px_rgb(var(--pnl-pos)/0.55)]"
            : "bg-pnl-neg/70"
        }`}
      />
    </span>
  );
}

function ProgressBar({
  progress,
  isOpen,
}: {
  progress: number;
  isOpen: boolean;
}) {
  return (
    <div
      className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isOpen ? Math.round(progress) : 0}
    >
      <motion.div
        className={`h-full rounded-full ${
          isOpen ? "bg-white" : "bg-pnl-neg/40"
        }`}
        initial={false}
        animate={{ width: `${isOpen ? progress : 0}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

/**
 * Live market clock with the four major FX/equity trading sessions
 * (Sydney, Tokyo, London, New York). Updates every second via setInterval
 * (cleared on unmount). Shows current UTC time, each session's local time,
 * an open/closed status dot (green=open w/ pulse + glow, red=closed), and a
 * 0–100% progress bar tracking how far through its session window we are.
 *
 * `compact` → single horizontal strip (navbar / dashboard strip).
 * `!compact` → small panel with a 2×2 session grid.
 *
 * SlowMoChart renders behind at opacity 0.04 for that "trading terminal"
 * living-background feel.
 */
export function MarketClock({ compact = false }: { compact?: boolean }) {
  const { lang } = useLang();
  const es = lang === "es";

  // Lazy-initialize so the first paint has a real time AND we never call
  // setState inside the effect body (avoids react-hooks/set-state-in-effect).
  // The component only ever mounts inside the client-only demo subtree
  // (AppDemoClient uses next/dynamic({ ssr: false })), so there is no SSR
  // hydration concern with the lazy initializer.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(
    () => SESSIONS.map((s) => ({ s, ...sessionStatus(s, now) })),
    [now]
  );

  const utcTime = fmtTime(now, "UTC", lang);
  const openCount = data.filter((d) => d.isOpen).length;

  const labels = {
    sessions: es ? "Sesiones de mercado" : "Market sessions",
    open: es ? "Abierta" : "Open",
    closed: es ? "Cerrada" : "Closed",
    utc: "UTC",
    utcLabel: es ? "Hora UTC" : "UTC time",
    sessionsOpen: es ? `${openCount} abiertas` : `${openCount} open`,
    noneOpen: es ? "Sin sesiones abiertas" : "No sessions open",
    openNow: (n: number) =>
      es
        ? `${n} sesión${n > 1 ? "es" : ""} abierta${n > 1 ? "s" : ""} ahora`
        : `${n} session${n > 1 ? "s" : ""} open now`,
  };

  /* ---------------- compact mode: horizontal strip ---------------- */
  if (compact) {
    return (
      <div
        className="liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card p-3 relative overflow-hidden"
        role="status"
        aria-label={labels.sessions}
      >
        {/* No <canvas> here — compact mode is always embedded alongside a
            page that already runs its own ambient canvas (e.g. the
            Dashboard composer's MarketBackground). Keeping the strip
            canvas-free honors the "max 1 canvas per demo page" rule. */}
        <div className="relative z-10 flex items-center gap-3 overflow-x-auto custom-scroll min-w-0">
          {/* UTC time anchor */}
          <div className="flex items-center gap-2 pr-3 border-r  shrink-0">
            <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
              {labels.utc}
            </span>
            <span className="text-sm font-semibold tnum text-white">
              {utcTime}
            </span>
          </div>

          {/* Sessions */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {data.map(({ s, isOpen, progress }) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md shrink-0 transition-colors ${
                  isOpen ? "bg-white/[0.08]" : "bg-white/[0.02]"
                }`}
                title={`${es ? s.nameEs : s.nameEn} · ${
                  isOpen ? labels.open : labels.closed
                }`}
              >
                <StatusDot isOpen={isOpen} />
                <div className="flex flex-col min-w-0 leading-tight">
                  <span
                    className={`text-[11px] font-semibold ${
                      isOpen ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {es ? s.nameEs : s.nameEn}
                  </span>
                  <span className="text-[10px] tnum text-gray-300">
                    {fmtTime(now, s.tz, lang)}
                  </span>
                </div>
                <div className="w-10 shrink-0">
                  <ProgressBar progress={progress} isOpen={isOpen} />
                </div>
              </div>
            ))}
          </div>

          {/* Open count pill */}
          <div className="shrink-0 pl-3 border-l ">
            <span
              className={`pill text-[10px] tnum ${
                openCount > 0
                  ? "bg-pnl-pos/10 text-pnl-pos border border-pnl-pos/25"
                  : "bg-white/5 text-gray-400 border border-white/10"
              }`}
            >
              {labels.sessionsOpen}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- full mode: 2×2 panel ---------------- */
  return (
    <div
      className="liquid-glass rounded-card p-4 relative overflow-hidden"
      role="status"
      aria-label={labels.sessions}
    >
      <SlowMoChart className="absolute inset-0 w-full h-full" opacity={0.04} />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400">
              {labels.sessions}
            </div>
            <div className="mt-1 text-sm text-gray-300 truncate">
              {openCount > 0 ? labels.openNow(openCount) : labels.noneOpen}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
              {labels.utcLabel}
            </div>
            <div className="text-xl font-bold tnum text-white leading-tight">
              {utcTime}
            </div>
          </div>
        </div>

        {/* Sessions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map(({ s, isOpen, progress }) => (
            <div
              key={s.id}
              className={`relative rounded-md p-3 border transition-colors ${
                isOpen
                  ? "border-white/20 bg-white/[0.06]"
                  : " bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot isOpen={isOpen} />
                  <span
                    className={`text-sm font-semibold truncate ${
                      isOpen ? "text-white" : "text-white"
                    }`}
                  >
                    {es ? s.nameEs : s.nameEn}
                  </span>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider shrink-0 ${
                    isOpen ? "text-pnl-pos" : "text-gray-400"
                  }`}
                >
                  {isOpen ? labels.open : labels.closed}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 mb-2.5">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400">
                  {es ? s.localLabelEs : s.localLabelEn}
                </span>
                <span className="text-base font-semibold tnum text-white">
                  {fmtTime(now, s.tz, lang)}
                </span>
              </div>

              <ProgressBar progress={progress} isOpen={isOpen} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
