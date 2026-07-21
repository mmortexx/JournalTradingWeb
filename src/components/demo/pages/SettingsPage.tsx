"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { useTheme, PALETTES } from "@/lib/theme";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { TRADES } from "@/lib/trading/data";
import { resetToSample } from "@/lib/trading/demoStore";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/* Inline icon set (no indigo/blue; accent + P&L vars only)            */
/* ------------------------------------------------------------------ */

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7" />
      </g>
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20.4 14.6A8.4 8.4 0 1 1 9.4 3.6a6.6 6.6 0 0 0 11 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 12a8.5 8.5 0 0 1 14.5-6l2 2M20.5 12a8.5 8.5 0 0 1-14.5 6l-2-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 4v4h-4M4 20v-4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5v11M7.5 10l4.5 4.5L16.5 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 16.5v2A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.53 3H20.5l-6.49 7.42L21.5 21h-5.97l-4.68-6.12L5.5 21H2.53l6.94-7.93L2.5 3h6.12l4.23 5.6L17.53 3Zm-1.05 16.13h1.65L7.6 4.78H5.83L16.48 19.13Z" />
    </svg>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.7-9.2C1 8.4 2.6 5 6 5c2 0 3.4 1.1 4.2 2.4C10.9 6 12.3 5 14.3 5c3.4 0 5 3.4 3.7 6.8C19.6 16.4 12 21 12 21Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Tiny inline sparkline — accent-colored so palette switches show     */
/* ------------------------------------------------------------------ */

function MiniSparkline() {
  const pts = [10, 14, 11, 18, 15, 22, 19, 27, 24, 33, 30, 41, 38, 52];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const W = 140;
  const H = 44;
  const pad = 2;
  const line = pts
    .map((p, i) => {
      const x = pad + (i / (pts.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (p - min) / (max - min)) * (H - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${line} L${W - pad},${H - pad} L${pad},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-32 md:w-40 h-12" aria-hidden="true">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="rgb(var(--accent-base))"
            stopOpacity="0.42"
            style={{ transition: "stop-color 0.4s ease" }}
          />
          <stop
            offset="100%"
            stopColor="rgb(var(--accent-base))"
            stopOpacity="0"
            style={{ transition: "stop-color 0.4s ease" }}
          />
        </linearGradient>
      </defs>
      <motion.path
        key={`area-${line}`}
        d={area}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      />
      <motion.path
        key={`line-${line}`}
        d={line}
        fill="none"
        stroke="rgb(var(--accent-base))"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.4s ease" }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* end dot */}
      <motion.circle
        cx={W - pad}
        cy={pad + (1 - (pts[pts.length - 1] - min) / (max - min)) * (H - pad * 2)}
        r="2.5"
        fill="rgb(var(--accent-base))"
        style={{ transition: "fill 0.4s ease" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.35, type: "spring", stiffness: 500, damping: 18 }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Section wrapper                                                     */
/* ------------------------------------------------------------------ */

function SettingSection({
  eyebrow,
  title,
  delay,
  children,
}: {
  eyebrow?: string;
  title: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} y={18}>
      <section>
        <div className="flex items-baseline gap-3 mb-4">
          {eyebrow && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              {eyebrow}
            </span>
          )}
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-tertiary">
            {title}
          </h2>
          <div className="flex-1 divider-grad" />
        </div>
        {children}
      </section>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Settings page                                                       */
/* ------------------------------------------------------------------ */

const LANG_OPTIONS = [
  { code: "es", label: "Español", code2: "ES" },
  { code: "en", label: "English", code2: "EN" },
] as const;

export function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const { toast } = useToast();
  const { theme, setTheme, palette, setPalette } = useTheme();
  const es = lang === "es";
  const reduce = useReducedMotion();
  const [sampleState, setSampleState] = useState<"idle" | "loading" | "loaded">(
    "idle"
  );
  const [downloadState, setDownloadState] = useState<"idle" | "loaded">("idle");

  // Track pending UI-state timeouts so we can clear them on unmount and
  // avoid calling setState on a gone component. (The URL.revokeObjectURL
  // timeout below is intentionally not tracked — it doesn't touch React
  // state and is safe to fire after unmount.)
  const uiTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const pushUiTimer = (id: ReturnType<typeof setTimeout>) => {
    uiTimers.current.push(id);
  };
  useEffect(() => {
    return () => {
      for (const id of uiTimers.current) window.clearTimeout(id);
      uiTimers.current = [];
    };
  }, []);

  function handleLoadSample() {
    if (sampleState !== "idle") return;
    setSampleState("loading");
    // Clear any custom trades the user logged from the Dashboard composer so
    // the demo returns to the deterministic 60-trade sample. The brief
    // loading animation then signals success visually.
    resetToSample();
    pushUiTimer(setTimeout(() => setSampleState("loaded"), 450));
    pushUiTimer(setTimeout(() => setSampleState("idle"), 2600));
    pushUiTimer(
      setTimeout(
        () =>
          toast({
            title: t("sampleResetToast"),
            description: t("sampleResetDesc"),
          }),
        450
      )
    );
  }

  function handleDownloadData() {
    if (downloadState !== "idle") return;

    // Build a CSV string from the in-memory TRADES array. Columns chosen
    // per spec; numbers are emitted raw (no locale grouping) so the file
    // imports cleanly into Excel/Sheets/Numbers. Dates serialize as ISO.
    const headers = [
      "id",
      "instrument",
      "setup",
      "direction",
      "entry",
      "exit",
      "qty",
      "netPnl",
      "rMultiple",
      "closedAt",
    ];
    const escapeCsv = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = TRADES.map((tr) =>
      [
        tr.id,
        tr.instrument,
        tr.setup,
        tr.direction,
        tr.entry,
        tr.exit,
        tr.qty,
        tr.netPnl,
        tr.rMultiple,
        tr.closedAt instanceof Date && !Number.isNaN(tr.closedAt.getTime())
          ? tr.closedAt.toISOString()
          : "",
      ]
        .map(escapeCsv)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");

    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "trading-journal-sample.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke on the next tick so the download has time to start.
      window.setTimeout(() => URL.revokeObjectURL(url), 0);

      setDownloadState("loaded");
      pushUiTimer(setTimeout(() => setDownloadState("idle"), 2000));
    } catch {
      // Blob/URL may be unavailable in restricted contexts; fail silently.
    }
  }

  return (
    <div className="relative p-5 md:p-6 space-y-5">
      {/* ---------- Header ---------- */}
      <Reveal delay={0}>
        <header className="relative overflow-hidden rounded-card">
          <div className="relative py-2">
            <Eyebrow>{t("settingsEyebrow")}</Eyebrow>
            <h1 className="mt-3 text-3xl md:text-4xl font-medium tracking-[-0.03em] text-primary">
              {t("settingsTitle")}
            </h1>
            <p className="mt-2 text-sm text-secondary max-w-xl leading-relaxed">
              {es
                ? "Personaliza la apariencia, el idioma y los datos del diario. Todo se guarda en tu equipo."
                : "Customize the journal's appearance, language and data. Everything is saved on your machine."}
            </p>
          </div>
        </header>
      </Reveal>

      {/* ---------- Language ---------- */}
      <SettingSection
        eyebrow="01"
        title={t("language")}
        delay={0.05}
      >
        <div
          role="radiogroup"
          aria-label={t("language")}
          className="grid grid-cols-2 gap-3"
        >
          {LANG_OPTIONS.map((opt) => {
            const active = lang === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setLang(opt.code)}
                className={`relative h-[68px] rounded-card overflow-hidden border border-solid transition-colors duration-300 ${
                  active
                    ? "border-white/30"
                    : "border-white/10 hover:border-white/20"
                }`}
                style={{
                  backgroundColor: active
                    ? undefined
                    : "rgb(var(--card) / var(--card-op))",
                }}
              >
                {/* Sliding selection pill */}
                {active && (
                  <motion.span
                    layoutId="lang-pill"
                    className="absolute inset-0 bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {/* Hover wash on inactive */}
                {!active && (
                  <span className="absolute inset-0 bg-transparent hover:bg-white/8 transition-colors duration-300" />
                )}
                <span className="relative z-10 h-full flex items-center justify-center gap-3 px-4">
                  <span
                    className={`shrink-0 grid place-items-center w-9 h-9 rounded-full text-[11px] font-bold tracking-wider tnum border border-solid ${
                      active
                        ? "border-white/40 text-primary bg-white/15"
                        : "border-white/20 text-primary bg-white/5"
                    }`}
                    aria-hidden="true"
                  >
                    {opt.code2}
                  </span>
                  <span
                    className={`text-base font-semibold ${
                      active ? "text-primary" : "text-primary"
                    }`}
                    style={
                      active
                        ? { color: "rgb(var(--accent-foreground))" }
                        : undefined
                    }
                  >
                    {opt.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SettingSection>

      {/* ---------- Appearance ---------- */}
      <SettingSection
        eyebrow="02"
        title={t("appearance")}
        delay={0.1}
      >
        {/* Theme toggle */}
        <div
          role="radiogroup"
          aria-label={t("appearance")}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          {(["light", "dark"] as const).map((mode) => {
            const active = theme === mode;
            const Icon = mode === "light" ? SunIcon : MoonIcon;
            const label = mode === "light" ? t("light") : t("dark");
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={label}
                onClick={() => setTheme(mode)}
                className={`relative h-14 rounded-card overflow-hidden border border-solid transition-colors duration-300 ${
                  active
                    ? "border-white/30"
                    : "border-white/10 hover:border-white/20"
                }`}
                style={{
                  backgroundColor: active
                    ? undefined
                    : "rgb(var(--card) / var(--card-op))",
                }}
              >
                {active && (
                  <motion.span
                    layoutId="theme-pill"
                    className="absolute inset-0 bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {!active && (
                  <span className="absolute inset-0 bg-transparent hover:bg-white/8 transition-colors duration-300" />
                )}
                <span className="relative z-10 h-full flex items-center justify-center gap-2.5">
                  <Icon
                    className={`w-[18px] h-[18px] ${
                      active ? "text-primary" : "text-primary"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      active ? "text-primary" : "text-primary"
                    }`}
                    style={
                      active
                        ? { color: "rgb(var(--accent-foreground))" }
                        : undefined
                    }
                  >
                    {label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Live preview card */}
        <div className="relative liquid-glass depth-3 hover:shadow-[0_6px_14px_rgb(0_0_0_/_0.32),0_24px_56px_rgb(0_0_0_/_0.36),0_0_44px_rgb(255_255_255_/_0.08)] transition-shadow duration-300 rounded-card p-5 overflow-hidden">
          {/* Shimmer on theme switch (keyed on theme → remounts → animation replays) */}
          <motion.div
            key={`shimmer-${theme}`}
            className="pointer-events-none absolute inset-0 z-30"
            initial={{ opacity: 0.85, x: "-100%" }}
            animate={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "linear-gradient(110deg, transparent 0%, rgb(var(--accent-base) / 0.35) 50%, transparent 100%)",
            }}
          />
          {/* Palette flash overlay (keyed on palette → soft radial flash) */}
          <motion.div
            key={`flash-${palette}`}
            className="pointer-events-none absolute inset-0 z-30"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "radial-gradient(70% 60% at 50% 50%, rgb(var(--accent-base) / 0.55), transparent 70%)",
            }}
          />

          {/* Preview header */}
          <div className="relative z-20 flex items-center justify-between mb-4">
            <span className="eyebrow flex items-center gap-2 transition-colors duration-[400ms]">
              <span className="w-1.5 h-1.5 rounded-full bg-pnl-pos transition-colors duration-[400ms]" />
              {es ? "Vista previa en vivo" : "Live preview"}
            </span>
            <span className="pill bg-white/8 text-primary tnum transition-colors duration-[400ms]">
              {palette}
            </span>
          </div>

          {/* Preview body — P&L + featured KPI tile on the left, mini equity
              curve on the right. Every colored element has an explicit
              `transition-colors duration-[400ms]` so palette/theme switches
              recolor the whole card in lockstep with the rest of the app. */}
          <div className="relative z-20 flex flex-col sm:flex-row sm:items-stretch gap-5">
            {/* Left column: P&L + featured KPI tile (pos/neg sample) */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary mb-1.5 transition-colors duration-[400ms]">
                  {t("pnlTotal")}
                </div>
                <motion.div
                  key={`pnl-${theme}-${palette}`}
                  initial={{ opacity: 0.5, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl md:text-[2.5rem] leading-none font-bold text-pnl-pos tnum tracking-[-0.02em] transition-colors duration-[400ms]"
                >
                  +$2,847.50
                </motion.div>
                <div className="mt-2 flex items-center gap-2 text-xs text-tertiary tnum transition-colors duration-[400ms]">
                  <span className="text-pnl-pos transition-colors duration-[400ms]">
                    {es ? "Hoy · 4 operaciones" : "Today · 4 trades"}
                  </span>
                  <span className="opacity-50">·</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white transition-colors duration-[400ms]" />
                    {es ? "Disciplina 92 %" : "Discipline 92%"}
                  </span>
                </div>
              </div>

              {/* Sample KPI tile — best vs. worst trade, showing pos/neg coloring. */}
              <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 transition-colors duration-[400ms]">
                <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1 transition-colors duration-[400ms]">
                  {es ? "Operaciones de hoy" : "Today's trades"}
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-tertiary tnum transition-colors duration-[400ms]">
                      {es ? "Mejor" : "Best"}
                    </span>
                    <span className="text-base font-medium text-pnl-pos tnum transition-colors duration-[400ms]">
                      +$642.00
                    </span>
                  </span>
                  <span className="opacity-30" aria-hidden="true">·</span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-tertiary tnum transition-colors duration-[400ms]">
                      {es ? "Peor" : "Worst"}
                    </span>
                    <span className="text-base font-medium text-pnl-neg tnum transition-colors duration-[400ms]">
                      −$218.00
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right column: mini equity curve recoloring with the palette */}
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary transition-colors duration-[400ms]">
                {es ? "Curva" : "Equity"}
              </div>
              <MiniSparkline />
            </div>
          </div>

          {/* Tiny KPI strip at bottom */}
          <div className="relative z-20 mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
            {[
              { label: t("winRate"), value: "68.3%", tone: "text-pnl-pos" },
              { label: t("expectancy"), value: "+$318", tone: "text-pnl-pos" },
              { label: t("profitFactor"), value: "2.41", tone: "text-primary" },
            ].map((kpi) => (
              <div key={kpi.label}>
                <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1 transition-colors duration-[400ms]">
                  {kpi.label}
                </div>
                <div className={`text-base font-medium tnum transition-colors duration-[400ms] ${kpi.tone}`}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* ---------- Accent color ---------- */}
      <SettingSection
        eyebrow="03"
        title={t("accentColor")}
        delay={0.15}
      >
        <div
          role="radiogroup"
          aria-label={t("accentColor")}
          className="grid grid-cols-3 sm:grid-cols-5 gap-4 md:gap-5"
        >
          {PALETTES.map((p, i) => {
            const active = palette === p.name;
            return (
              <motion.button
                key={p.name}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={t(p.labelKey)}
                onClick={() => setPalette(p.name)}
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.2 + i * 0.06,
                  type: "spring",
                  stiffness: 320,
                  damping: 22,
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex flex-col items-center gap-2.5 focus:outline-none focus-visible:outline-offset-4 rounded-card py-2"
              >
                {/* Active ring (layoutId slides between swatches) — 3px accent
                    border for the active palette, per the enhanced settings spec. */}
                {active && (
                  <motion.span
                    layoutId="palette-active-ring"
                    className="absolute top-1 left-1/2 -translate-x-1/2 w-[68px] h-[68px] rounded-full pointer-events-none"
                    style={{
                      boxShadow: `0 0 0 3px rgb(var(--accent-base)), 0 0 24px rgb(var(--accent-base) / 0.35)`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Hover tooltip — palette name colored with the palette's
                    own dark accent so it doubles as a tiny color preview.
                    Purely visual (the visible label below conveys the same
                    text to assistive tech), hence aria-hidden. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-primary text-[11px] font-semibold whitespace-nowrap z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  style={{ backgroundColor: p.dark }}
                >
                  {t(p.labelKey)}
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-2 h-2 rotate-45"
                    style={{ backgroundColor: p.dark }}
                  />
                </span>

                {/* Glow (always present, intensifies on hover/active) */}
                <motion.span
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-[68px] h-[68px] rounded-full blur-xl pointer-events-none"
                  style={{ background: p.dark }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: active ? 0.5 : 0 }}
                  whileHover={{ opacity: 0.55 }}
                  transition={{ duration: 0.4 }}
                />

                {/* Swatch */}
                <div
                  className="relative w-14 h-14 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${p.dark} 0%, ${p.light} 100%)`,
                  }}
                >
                  {/* Inner highlight */}
                  <span
                    className="absolute -inset-1 rounded-full pointer-events-none"
                    style={{
                      boxShadow:
                        "inset 0 1px 1px rgb(255 255 255 / 0.35), inset 0 -2px 4px rgb(0 0 0 / 0.25)",
                    }}
                  />
                  {/* Active check */}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 22,
                          delay: 0.05,
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <CheckIcon className="w-6 h-6 text-primary drop-shadow-[0_1px_2px_rgb(0_0_0/0.5)]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium tracking-wide transition-colors ${
                    active ? "text-primary" : "text-secondary group-hover:text-primary"
                  }`}
                >
                  {t(p.labelKey)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </SettingSection>

      {/* ---------- Sample data ---------- */}
      <SettingSection
        eyebrow="04"
        title={t("sampleData")}
        delay={0.2}
      >
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-secondary leading-relaxed">
              {es
                ? "El diario se carga con 60 operaciones de muestra deterministas en 12 instrumentos y 3 meses. Recarga los datos cuando quieras reiniciar el estado."
                : "The journal ships with 60 deterministic sample trades across 12 instruments and 3 months. Reload the data whenever you want to reset."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-tertiary tnum">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pnl-pos" />
                {es ? "60 operaciones" : "60 trades"}
              </span>
              <span className="opacity-50">·</span>
              <span>{es ? "12 instrumentos" : "12 instruments"}</span>
              <span className="opacity-50">·</span>
              <span>{es ? "3 meses" : "3 months"}</span>
              <span className="opacity-50">·</span>
              <span>{es ? "Determinista" : "Deterministic"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <motion.button
              type="button"
              onClick={handleLoadSample}
              disabled={sampleState !== "idle"}
              whileHover={{ scale: sampleState === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: sampleState === "idle" ? 0.97 : 1, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              aria-label={t("loadSample")}
              className="relative shrink-0 h-11 px-5 rounded-card border border-white/10 bg-white/5 hover:bg-white/8 text-sm font-medium text-primary overflow-hidden min-w-[200px] transition-colors disabled:cursor-default"
            >
              <AnimatePresence mode="wait" initial={false}>
                {sampleState === "idle" && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center gap-2"
                  >
                    <RefreshIcon className="w-4 h-4 text-primary" />
                    {t("loadSample")}
                  </motion.span>
                )}
                {sampleState === "loading" && (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 text-tertiary"
                  >
                    <motion.span
                      className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white"
                      animate={reduce ? undefined : { rotate: 360 }}
                      transition={{ duration: 0.4, ease: "linear" }}
                    />
                    {es ? "Cargando…" : "Loading…"}
                  </motion.span>
                )}
                {sampleState === "loaded" && (
                  <motion.span
                    key="loaded"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 text-pnl-pos"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {es ? "✓ Cargado" : "✓ Loaded"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Download sample data as CSV. Mirrors the Load button's
                visual language but uses a download icon and a brief
                "✓ Descargado / ✓ Downloaded" confirmation. */}
            <motion.button
              type="button"
              onClick={handleDownloadData}
              disabled={downloadState !== "idle"}
              whileHover={{ scale: downloadState === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: downloadState === "idle" ? 0.97 : 1, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              aria-label={t("downloadData")}
              className="relative shrink-0 h-11 px-5 rounded-card border border-white/25 border-solid bg-white/5 hover:bg-white/8 text-sm font-medium text-primary overflow-hidden min-w-[200px] transition-colors disabled:cursor-default"
            >
              <AnimatePresence mode="wait" initial={false}>
                {downloadState === "idle" && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4 text-primary" />
                    {t("downloadData")}
                  </motion.span>
                )}
                {downloadState === "loaded" && (
                  <motion.span
                    key="loaded"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 text-pnl-pos"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {t("dataDownloaded")}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </SettingSection>

      {/* ---------- About ---------- */}
      <SettingSection
        eyebrow="05"
        title={t("about")}
        delay={0.25}
      >
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 mt-0.5 w-9 h-9 rounded-card grid place-items-center bg-white/8 text-primary">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 11v5M12 7.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-secondary leading-relaxed pt-1">
              {t("aboutHelp")}
            </p>
          </div>

          {/* Build info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              {
                label: es ? "Versión" : "Version",
                value: "2.4.1",
              },
              {
                label: es ? "Compilación" : "Build",
                value: "2024.11.07",
              },
              {
                label: es ? "Plataforma" : "Platform",
                value: "Windows · Web",
              },
              {
                label: es ? "Idiomas" : "Languages",
                value: "ES · EN",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/[0.04] border border-white/10 rounded-md p-3"
              >
                <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-primary tnum">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="divider-grad mb-4" />

          {/* Made-with + social */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="flex items-center gap-1.5 text-xs text-tertiary">
              {es ? "Hecho con" : "Made with"}
              <HeartIcon className="w-3.5 h-3.5 text-primary" />
              {es
                ? "para el trader manual serio."
                : "for the serious manual trader."}
            </p>
            <div className="flex items-center gap-2">
              {[
                {
                  label: "GitHub",
                  href: "https://github.com/mmortexx/JournalTradingWeb",
                  Icon: GithubIcon,
                },
                {
                  label: "X / Twitter",
                  href: "#",
                  Icon: XIcon,
                },
                {
                  label: es ? "Sitio web" : "Website",
                  href: "#",
                  Icon: GlobeIcon,
                },
              ].map(({ label, href, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="w-9 h-9 rounded-card grid place-items-center border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/25 hover:text-primary text-secondary transition-colors duration-200"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Tiny license + copyright */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-tertiary tnum">
            <span>© 2024 Trading Journal. {t("rights")}</span>
            <span className="flex items-center gap-2">
              <span className="pill bg-white/5 text-tertiary">
                {es ? "Licencia personal" : "Personal license"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pnl-pos" />
                {es ? "Activada" : "Activated"}
              </span>
            </span>
          </div>
        </div>
      </SettingSection>

      {/* Footer spacer */}
      <div className="h-2" />
    </div>
  );
}
