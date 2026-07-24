"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { Plus, Check, Sparkles, ChevronRight, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  SETUP_NAMES,
  computeMetrics,
  rankByExpectancy,
  type SetupName,
  type Trade,
} from "@/lib/trading/data";
import { fmtInt, fmtPct } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

/* ============================================================
 * Setup metadata — distinct hue (NO indigo / blue), bilingual
 * description and 3–4 checklist rules per setup.
 * ============================================================ */
interface SetupMeta {
  hue: string;
  desc: { es: string; en: string };
  rules: { es: string; en: string }[];
}

const SETUP_META: Record<SetupName, SetupMeta> = {
  Ruptura: {
    hue: "16 185 129",
    desc: {
      es: "Rotura de nivel con volumen y re-test confirmado.",
      en: "Level breakout with volume and confirmed re-test.",
    },
    rules: [
      { es: "Nivel claro probado 2+ veces", en: "Clear level tested 2+ times" },
      { es: "Volumen creciente en la rotura", en: "Rising volume on breakout" },
      { es: "Re-test aceptado como nuevo soporte", en: "Re-test accepted as new support" },
      { es: "Stop debajo del nivel roto", en: "Stop below the broken level" },
    ],
  },
  Pullback: {
    hue: "245 158 11",
    desc: {
      es: "Compra retroceso en tendencia clara del timeframe mayor.",
      en: "Buy pullback in a clear higher-timeframe trend.",
    },
    rules: [
      { es: "Tendencia clara en TF mayor", en: "Clear trend on higher TF" },
      { es: "Retroceso a media móvil 20 / 50", en: "Pullback to 20 / 50 moving average" },
      { es: "Confirmación con barra de reversión", en: "Confirmation with reversal bar" },
      { es: "Stop más allá del retroceso", en: "Stop beyond the pullback" },
    ],
  },
  Reversión: {
    hue: "244 63 94",
    desc: {
      es: "Reversión en zona de oferta / demanda con divergencia.",
      en: "Reversal in supply / demand zone with divergence.",
    },
    rules: [
      { es: "Zona de oferta / demanda clara", en: "Clear supply / demand zone" },
      { es: "Divergencia en el oscilador", en: "Oscillator divergence" },
      { es: "Vela de agotamiento confirmada", en: "Exhaustion candle confirmed" },
      { es: "Entrada limitada, stop ajustado", en: "Limit entry, tight stop" },
    ],
  },
  Tendencia: {
    hue: "130 145 175", /* silver-blue (was var(--accent-base)) */
    desc: {
      es: "Continuación de tendencia con trailing stop bajo cada HL.",
      en: "Trend continuation with trailing stop below each HL.",
    },
    rules: [
      { es: "HH y HL confirmados (o LL / LH)", en: "Confirmed HH and HL (or LL / LH)" },
      { es: "Entrar en continuación, no en inicio", en: "Enter on continuation, not start" },
      { es: "Trailing stop bajo cada HL", en: "Trailing stop below each HL" },
      { es: "Salir cuando la estructura rompa", en: "Exit when structure breaks" },
    ],
  },
  Rango: {
    hue: "20 184 166",
    desc: {
      es: "Operar extremos de rango lateral definido.",
      en: "Trade the extremes of a defined sideways range.",
    },
    rules: [
      { es: "Soporte y resistencia definidos", en: "Defined support and resistance" },
      { es: "Operar solo en los extremos", en: "Trade only at extremes" },
      { es: "Confirmación con rechazo", en: "Confirmation with rejection" },
      { es: "Stop fuera del rango", en: "Stop outside the range" },
    ],
  },
};

/* ============================================================
 * Small per-setup SVG glyph — 16×16.
 * ============================================================ */
function SetupGlyph({
  name,
  className,
}: {
  name: SetupName;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "Ruptura":
      return (
        <svg {...common}>
          <path d="M2 13 L6 13 L6 3 L14 3" />
          <path d="M11 1 L14 3 L11 5" />
        </svg>
      );
    case "Pullback":
      return (
        <svg {...common}>
          <path d="M2 4 L14 12" />
          <path d="M5 5 L8 8 L5 8" opacity={0.55} />
        </svg>
      );
    case "Reversión":
      return (
        <svg {...common}>
          <path d="M2 4 Q4 12 8 8 Q12 4 14 12" />
          <path d="M11 10 L14 12 L12 14" opacity={0.6} />
        </svg>
      );
    case "Tendencia":
      return (
        <svg {...common}>
          <path d="M2 12 L6 8 L9 11 L14 4" />
          <path d="M11 4 L14 4 L14 7" />
        </svg>
      );
    case "Rango":
      return (
        <svg {...common}>
          <path d="M2 5 L14 5 M2 11 L14 11" />
          <path d="M5 5 L5 11 M11 5 L11 11" opacity={0.55} />
        </svg>
      );
  }
}

/* ============================================================
 * Sparkline — tiny equity-curve SVG with pathLength draw-in.
 * ============================================================ */
function buildSparkPath(
  balances: number[],
  w = 100,
  h = 28,
  pad = 3
): string {
  if (balances.length < 2) {
    return `M ${pad} ${h / 2} L ${w - pad} ${h / 2}`;
  }
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const range = max - min || 1;
  const n = balances.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const x = pad + (i / (n - 1)) * (w - pad * 2);
    const y = pad + (1 - (balances[i] - min) / range) * (h - pad * 2);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d.trim();
}

function Sparkline({
  balances,
  replayKey,
  className,
}: {
  balances: number[];
  replayKey: number | string;
  className?: string;
}) {
  const path = useMemo(() => buildSparkPath(balances), [balances]);
  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <motion.path
        key={replayKey}
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.25 },
        }}
      />
    </svg>
  );
}

/* ============================================================
 * New-setup Dialog — visually complete, non-functional save.
 * ============================================================ */
function NewSetupDialog({
  trigger,
  label,
}: {
  trigger: ReactNode;
  label: string;
}) {
  const { lang } = useLang();
  const es = lang === "es";

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-md h-9 px-3 text-sm text-primary placeholder:text-tertiary focus:border-white/20 focus:bg-white/8 transition-colors";
  const labelCls =
    "block text-[11px] uppercase tracking-[0.15em] text-tertiary mb-1.5";

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="liquid-glass border border-white/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-primary">
            {label}
          </DialogTitle>
          <DialogDescription className="text-tertiary text-sm">
            {es
              ? "Define tu setup con nombre, descripción y reglas. Se guardará localmente."
              : "Define your setup with name, description and rules. Saved locally."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
          aria-label={label}
        >
          <div>
            <label htmlFor="pb-name" className={labelCls}>
              {es ? "Nombre" : "Name"}
            </label>
            <input
              id="pb-name"
              type="text"
              className={`${inputCls} tnum`}
              placeholder={es ? "p. ej. Rotura de rango" : "e.g. Range breakout"}
            />
          </div>

          <div>
            <label htmlFor="pb-desc" className={labelCls}>
              {es ? "Descripción" : "Description"}
            </label>
            <textarea
              id="pb-desc"
              rows={2}
              className={`${inputCls} h-auto py-2 resize-none`}
              placeholder={
                es
                  ? "Una línea que describe el setup…"
                  : "One line describing the setup…"
              }
            />
          </div>

          <div>
            <span className={labelCls}>{es ? "Reglas" : "Rules"}</span>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  className={`${inputCls} tnum`}
                  placeholder={es ? `Regla ${i + 1}` : `Rule ${i + 1}`}
                  aria-label={es ? `Regla ${i + 1}` : `Rule ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <button
                type="button"
                className="h-9 px-4 rounded-md text-sm text-secondary hover:text-primary hover:bg-white/5 transition-colors"
              >
                {es ? "Cancelar" : "Cancel"}
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                type="submit"
                className="h-9 px-4 rounded-md text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" aria-hidden />
                {es ? "Guardar ficha" : "Save setup"}
              </button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
 * R-spread box plot — mirrors the real app's "Reparto de R" mini
 * box-plot: P5–P95 rail with a P25–P75 box and a median tick.
 * Two setups with the same expectancy can have opposite R
 * distributions, which is what decides whether one can be scaled.
 * ============================================================ */
function RSpread({
  trades,
  hue,
  label,
}: {
  trades: Trade[];
  hue: string;
  label: string;
}) {
  const { lang } = useLang();
  const rs = trades.map((t) => t.rMultiple).filter(Number.isFinite);
  if (rs.length < 4) return null;
  const sorted = [...rs].sort((a, b) => a - b);
  const pct = (p: number) => {
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
    return sorted[idx]!;
  };
  const p5 = pct(0.05);
  const p25 = pct(0.25);
  const p50 = pct(0.5);
  const p75 = pct(0.75);
  const p95 = pct(0.95);
  const min = p5;
  const max = p95;
  const range = max - min || 1;
  const leftPct = ((p25 - min) / range) * 100;
  const boxPct = ((p75 - p25) / range) * 100;
  const medianPct = ((p50 - min) / range) * 100;

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase tracking-[0.08em] text-tertiary">
        {label}
      </span>
      <div
        className="relative h-2.5 rounded-sm"
        role="img"
        aria-label={`${label}: P25 ${p25.toFixed(2)}R · mediana ${p50.toFixed(2)}R · P75 ${p75.toFixed(2)}R`}
      >
        {/* P5–P95 rail */}
        <div
          className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
          style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          aria-hidden
        />
        {/* P25–P75 box */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-sm"
          style={{
            left: `${leftPct}%`,
            width: `${boxPct}%`,
            backgroundColor: `rgb(${hue} / 0.55)`,
          }}
          aria-hidden
        />
        {/* Median tick */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-white"
          style={{ left: `${medianPct}%` }}
          aria-hidden
        />
      </div>
      <div className="text-[10px] text-tertiary tnum">
        {lang === "es" ? "P25" : "P25"} {p25.toFixed(2)}R ·{" "}
        {lang === "es" ? "mediana" : "median"} {p50.toFixed(2)}R ·{" "}
        P75 {p75.toFixed(2)}R
      </div>
    </div>
  );
}

/* ============================================================
 * SetupCard — one liquid-glass card per setup with live stats.
 * Mirrors the real app's setup-card layout: header (name + desc
 * + edit + chevron), accent bar, sparkline, 4-stat row with
 * vertical hairlines (Sample | Expectancy | Win rate | Total),
 * significance + best-session + compliance pills, R-spread box
 * plot, win/loss bar, rules checklist.
 * ============================================================ */
function SetupCard({
  name,
  index,
}: {
  name: SetupName;
  index: number;
}) {
  const { t, lang } = useLang();
  const es = lang === "es";
  const meta = SETUP_META[name];

  const trades = useMemo(
    () => TRADES.filter((tr: Trade) => tr.setup === name),
    [name]
  );
  const metrics = useMemo(() => computeMetrics(trades), [trades]);
  const balances = useMemo(
    () => metrics.equityCurve.map((p) => p.balance),
    [metrics]
  );

  const [replayKey, setReplayKey] = useState(0);

  const total = metrics.wins + metrics.losses;
  const realWinPct = total > 0 ? (metrics.wins / total) * 100 : 0;
  const realLossPct = total > 0 ? (metrics.losses / total) * 100 : 0;
  const winPct = realWinPct;
  const lossPct = realLossPct;

  // Compliance % for this setup — derives from the same field the
  // global DisciplineCalculator uses.
  const compliancePct = trades.length
    ? trades.filter((tr) => tr.compliance === "yes").length / trades.length
    : 0;
  const isComplianceLow = compliancePct < 0.6;

  // Significance verdict — mirrors the real app's edge-verdict pill.
  // With ≥20 trades and positive expectancy, "Edge confirmado"; with
  // 10-19 trades or marginal expectancy, "A revisar".
  const sample = metrics.closedCount;
  const hasEdgeVerdict = sample >= 10;
  const isEdgeConfirmed = hasEdgeVerdict && metrics.expectancy > 0;

  // Best session by expectancy for this setup.
  const bestSession = useMemo(() => {
    if (!trades.length) return null;
    const bySession = new Map<string, Trade[]>();
    for (const tr of trades) {
      const arr = bySession.get(tr.session) ?? [];
      arr.push(tr);
      bySession.set(tr.session, arr);
    }
    let best: { name: string; expectancy: number } | null = null;
    for (const [sname, ts] of bySession) {
      const exp = ts.reduce((s, x) => s + x.netPnl, 0) / ts.length;
      if (!best || exp > best.expectancy) {
        best = { name: sname, expectancy: exp };
      }
    }
    return best;
  }, [trades]);

  const hue = meta.hue;
  const colorCss = `rgb(${hue})`;
  const tintCss = `rgb(${hue} / 0.14)`;

  function onHoverStart() {
    setReplayKey((k) => k + 1);
  }

  return (
    <Reveal delay={index * 0.07} y={28} className="h-full">
      <motion.div
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
        className="h-full"
        onHoverStart={onHoverStart}
      >
        <article
          className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full flex flex-col gap-4 relative overflow-hidden"
          aria-label={`${es ? "Setup" : "Setup"} ${name}`}
        >
          {/* Accent top-edge bar — mirrors the real app's `Border Height="3"`
              accent strip atop each setup card. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] rounded-t-card"
            style={{ background: colorCss, opacity: 0.85 }}
          />

          {/* Header: glyph + name + edit + chevron (mirrors the real
              app's header row with name + edit + chevron affordance). */}
          <header className="flex items-start justify-between gap-3 mt-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span
                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md border"
                style={{
                  color: colorCss,
                  backgroundColor: tintCss,
                  borderColor: `rgb(${hue} / 0.3)`,
                }}
                aria-hidden
              >
                <SetupGlyph name={name} className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-medium text-primary leading-tight truncate">
                  {name}
                </h3>
                <p className="text-xs text-tertiary mt-0.5 line-clamp-1">
                  {es ? meta.desc.es : meta.desc.en}
                </p>
              </div>
            </div>
            <ChevronRight
              className="w-4 h-4 text-tertiary flex-shrink-0 mt-2"
              aria-hidden
            />
          </header>

          {/* Sparkline — colored by the setup hue; redraws on hover */}
          <div
            className="relative h-8 w-full"
            style={{ color: colorCss }}
            aria-hidden
          >
            <Sparkline
              balances={balances}
              replayKey={replayKey}
              className="w-full h-8"
            />
          </div>

          {/* Live stats row — 4 stats with vertical hairline dividers
              (Sample | Expectancy | Win rate | Total), mirroring the
              real app's setup-card Grid with VerticalHairlineStyle. */}
          <div className="grid grid-cols-4 gap-0">
            <StatCell label={t("sample")}>
              <span className="text-base font-medium text-primary tnum">
                {fmtInt(metrics.closedCount, lang)}
              </span>
            </StatCell>
            <StatCell label={t("expectancy")} divider>
              <Money
                value={metrics.expectancy}
                sign
                colorizeSign
                className="text-base font-semibold"
              />
            </StatCell>
            <StatCell label={t("winRate")} divider>
              <CountUp
                to={metrics.winRate * 100}
                decimals={1}
                suffix="%"
                tone={metrics.winRate >= 0.5 ? "pos" : "neg"}
                className="text-base font-medium"
              />
            </StatCell>
            <StatCell label={t("pnlTotal")} divider>
              <Money
                value={metrics.netPnl}
                sign
                colorizeSign
                className="text-base font-semibold"
              />
            </StatCell>
          </div>

          {/* Significance + best-session + compliance pills (mirrors
              the real app's verdict / best-session / compliance row). */}
          {metrics.closedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {hasEdgeVerdict && (
                <span
                  className="pill inline-flex items-center gap-1.5 text-[11px] border"
                  style={{
                    color: isEdgeConfirmed
                      ? "rgb(var(--pnl-pos))"
                      : "rgb(var(--pnl-warn))",
                    borderColor: isEdgeConfirmed
                      ? "rgb(var(--pnl-pos) / 0.3)"
                      : "rgb(var(--pnl-warn) / 0.3)",
                    backgroundColor: isEdgeConfirmed
                      ? "rgb(var(--pnl-pos) / 0.08)"
                      : "rgb(var(--pnl-warn) / 0.08)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isEdgeConfirmed
                        ? "rgb(var(--pnl-pos))"
                        : "rgb(var(--pnl-warn))",
                    }}
                    aria-hidden
                  />
                  {isEdgeConfirmed
                    ? es ? "Edge confirmado" : "Edge confirmed"
                    : es ? "A revisar" : "To review"}
                </span>
              )}
              {bestSession && (
                <span className="pill inline-flex items-center gap-1.5 text-[11px] bg-white/5 text-secondary border border-white/10">
                  <span className="text-tertiary">
                    {es ? "Mejor sesión" : "Best session"}
                  </span>
                  <span className="text-primary">{bestSession.name}</span>
                  <Money
                    value={bestSession.expectancy}
                    sign
                    colorizeSign
                    className="text-[11px] font-semibold"
                  />
                </span>
              )}
              <span
                className={`pill inline-flex items-center gap-1.5 text-[11px] border ${
                  isComplianceLow
                    ? "text-pnl-warn border-pnl-warn/30 bg-pnl-warn/8"
                    : "text-secondary border-white/10 bg-white/5"
                }`}
              >
                {isComplianceLow && (
                  <AlertTriangle className="w-3 h-3" aria-hidden />
                )}
                <span className="text-tertiary">
                  {es ? "Cumplimiento" : "Compliance"}
                </span>
                <span className="font-semibold tnum">
                  {fmtPct(compliancePct, lang, 0)}
                </span>
              </span>
            </div>
          )}

          {/* R distribution box plot — mirrors the real app's R-spread
              P25–P75 over P5–P95 rail with a median tick. */}
          {metrics.closedCount >= 4 && (
            <RSpread
              trades={trades}
              hue={hue}
              label={es ? "Reparto de R" : "R distribution"}
            />
          )}

          {/* Win / loss bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.08em] text-tertiary">
                {es ? "Ganadoras / Perdedoras" : "Winners / Losers"}
              </span>
              <span className="tnum text-[11px] text-tertiary">
                <span className="text-pnl-pos">
                  {fmtInt(metrics.wins, lang)}
                </span>
                <span className="mx-1 opacity-50">/</span>
                <span className="text-pnl-neg">
                  {fmtInt(metrics.losses, lang)}
                </span>
              </span>
            </div>
            <div
              className="flex h-1.5 rounded-full overflow-hidden bg-white/5"
              role="img"
              aria-label={
                es
                  ? `${metrics.wins} ganadoras, ${metrics.losses} perdedoras`
                  : `${metrics.wins} winners, ${metrics.losses} losers`
              }
            >
              {total > 0 ? (
                <>
                  <motion.div
                    className="bg-pnl-pos"
                    initial={{ width: 0 }}
                    animate={{ width: `${winPct}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                      delay: 0.35 + index * 0.06,
                    }}
                  />
                  <motion.div
                    className="bg-pnl-neg"
                    initial={{ width: 0 }}
                    animate={{ width: `${lossPct}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                      delay: 0.5 + index * 0.06,
                    }}
                  />
                </>
              ) : (
                <div className="bg-white/10 w-full" />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="divider-grad" aria-hidden />

          {/* Rules checklist */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block w-1 h-3 rounded-sm"
                style={{ backgroundColor: colorCss }}
                aria-hidden
              />
              <span className="text-[11px] uppercase tracking-[0.15em] text-tertiary font-semibold">
                {t("rules")}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {meta.rules.map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-secondary leading-snug"
                >
                  <span
                    className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-sm border inline-flex items-center justify-center"
                    style={{
                      borderColor: `rgb(${hue} / 0.4)`,
                      backgroundColor: `rgb(${hue} / 0.1)`,
                      color: colorCss,
                    }}
                    aria-hidden
                  >
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span>{es ? rule.es : rule.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </motion.div>
    </Reveal>
  );
}

/* ============================================================
 * StatCell — single cell in the 4-stat row with optional left
 * hairline divider (mirrors VerticalHairlineStyle in the XAML).
 * ============================================================ */
function StatCell({
  label,
  divider,
  children,
}: {
  label: string;
  divider?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative px-3 first:pl-0 last:pr-0 ${
        divider ? "before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-white/10" : ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.08em] text-tertiary mb-1 text-center">
        {label}
      </div>
      <div className="text-center">{children}</div>
    </div>
  );
}

/* ============================================================
 * SummaryStat — single cell in the summary band, separated by
 * vertical hairlines (mirrors the real app's summary-band Grid
 * with VerticalHairlineStyle between best / most-traded / worst
 * / total).
 * ============================================================ */
function SummaryStat({
  label,
  delay,
  divider,
  children,
}: {
  label: string;
  delay: number;
  divider?: boolean;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} y={18} className="h-full">
      <motion.div
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
        className={`h-full relative ${divider ? "lg:before:absolute lg:before:left-0 lg:before:top-2 lg:before:bottom-2 lg:before:w-px lg:before:bg-white/10" : ""}`}
      >
        <div className="liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card p-4 h-full flex flex-col gap-1.5 lg:mx-3">
          <div className="eyebrow text-[10px]">{label}</div>
          {children}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ============================================================
 * Playbook page
 * ============================================================ */
export function PlaybookPage() {
  const { t, lang } = useLang();
  const es = lang === "es";

  const ranking = useMemo(
    () => rankByExpectancy(TRADES, (tr) => tr.setup),
    []
  );
  const best = ranking[0];
  const mostTraded = useMemo(
    () => [...ranking].sort((a, b) => b.count - a.count)[0],
    [ranking]
  );
  // Worst discipline — setup with the lowest compliance %. Mirrors
  // the real app's "Más incumplido" stat (closes the question
  // "where do I lose discipline even when expectancy is good?").
  const worstDiscipline = useMemo(() => {
    const rows = SETUP_NAMES.map((name) => {
      const ts = TRADES.filter((tr) => tr.setup === name);
      const complied = ts.filter((tr) => tr.compliance === "yes").length;
      const pct = ts.length ? complied / ts.length : 1;
      return { name, pct, count: ts.length };
    }).filter((r) => r.count > 0);
    return [...rows].sort((a, b) => a.pct - b.pct)[0];
  }, []);
  const totalSetups = SETUP_NAMES.length;

  const bestMeta = best ? SETUP_META[best.name as SetupName] : null;

  return (
    <div className="relative p-5 md:p-6 space-y-5">
      {/* ===== Header ===== */}
      <section className="relative overflow-hidden rounded-card">
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4 py-2">
          <div className="max-w-xl">
            <Reveal delay={0}>
              <Eyebrow>{t("playbookEyebrow")}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-2 text-3xl md:text-4xl font-medium tracking-tight text-primary">
                {t("playbookTitle")}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                {t("playbookDesc")}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="flex-shrink-0">
            <NewSetupDialog
              label={t("newSetup")}
              trigger={
                <motion.button
                  type="button"
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden />
                  {t("newSetup")}
                </motion.button>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* ===== Summary band — 4 cells with vertical hairlines =====
          (best setup / most traded / worst discipline / total setups).
          Mirrors the real app's "Cabecera de resumen" Grid with
          VerticalHairlineStyle dividers. */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0">
        <SummaryStat
          label={es ? "Mejor setup" : "Best setup"}
          delay={0.05}
        >
          {best && bestMeta ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: `rgb(${bestMeta.hue})` }}
                  aria-hidden
                />
                <span className="text-xl font-medium text-primary truncate">
                  {best.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-tertiary">
                <span>{t("expectancy")}</span>
                <Money
                  value={best.expectancy}
                  sign
                  colorizeSign
                  className="font-medium"
                />
              </div>
            </>
          ) : (
            <span className="text-sm text-tertiary">{t("noTradesYet")}</span>
          )}
        </SummaryStat>

        <SummaryStat
          label={es ? "Más operado" : "Most traded"}
          delay={0.1}
          divider
        >
          {mostTraded ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-medium text-primary truncate">
                  {mostTraded.name}
                </span>
                <CountUp
                  to={mostTraded.count}
                  className="text-sm font-medium text-primary"
                />
              </div>
              <div className="text-xs text-tertiary">
                {es ? "operaciones" : "trades"}
              </div>
            </>
          ) : (
            <span className="text-sm text-tertiary">{t("noTradesYet")}</span>
          )}
        </SummaryStat>

        <SummaryStat
          label={es ? "Más incumplido" : "Worst discipline"}
          delay={0.15}
          divider
        >
          {worstDiscipline ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-medium text-primary truncate">
                  {worstDiscipline.name}
                </span>
                <span className="text-sm font-medium text-pnl-warn tnum">
                  {fmtPct(worstDiscipline.pct, lang, 0)}
                </span>
              </div>
              <div className="text-xs text-tertiary">
                {es ? "cumplimiento" : "compliance"}
              </div>
            </>
          ) : (
            <span className="text-sm text-tertiary">{t("noTradesYet")}</span>
          )}
        </SummaryStat>

        <SummaryStat
          label={es ? "Setups totales" : "Total setups"}
          delay={0.2}
          divider
        >
          <div className="flex items-baseline gap-2">
            <CountUp
              to={totalSetups}
              className="text-2xl font-medium text-primary"
            />
            <span className="text-xs text-tertiary">
              {es ? "en tu playbook" : "in your playbook"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tertiary">
            <Sparkles className="w-3 h-3 text-primary" aria-hidden />
            <span>{es ? "Vivos, con métricas en tiempo real" : "Live, with real-time metrics"}</span>
          </div>
        </SummaryStat>
      </section>

      {/* ===== Setup cards grid ===== */}
      <section
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-label={es ? "Fichas de setups" : "Setup cards"}
      >
        {SETUP_NAMES.map((name, i) => (
          <SetupCard key={name} name={name} index={i} />
        ))}

        {/* 6th cell — CTA card to add a new setup (fills the grid). */}
        <Reveal delay={SETUP_NAMES.length * 0.07} y={28} className="h-full">
          <motion.div
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            className="h-full"
          >
            <NewSetupDialog
              label={t("newSetup")}
              trigger={
                <button
                  type="button"
                  className="w-full h-full min-h-[260px] rounded-card border-2 border-dashed border-white/20 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex flex-col items-center justify-center gap-3 text-primary group"
                  aria-label={t("newSetup")}
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/20 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">
                    {t("newSetup")}
                  </span>
                  <span className="text-xs text-tertiary px-6 text-center max-w-[220px]">
                    {es
                      ? "Define tu propio setup con reglas y métricas en vivo."
                      : "Define your own setup with rules and live metrics."}
                  </span>
                </button>
              }
            />
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
}
