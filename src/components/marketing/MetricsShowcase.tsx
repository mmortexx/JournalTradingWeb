"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { CountUp } from "@/components/tj/CountUp";
import { METRICS, INITIAL_BALANCE_CONST } from "@/lib/trading/data";

/**
 * MetricsShowcase — institutional metrics deep-dive placed after the
 * Bento section. Two-column layout:
 *
 *   LEFT  — `.liquid-glass rounded-card` with a live metrics table
 *           (Expectancy, Sharpe, Sortino, Calmar, Profit Factor,
 *           Win Rate, Avg R, Max Drawdown). Each row pairs the metric
 *           name (`text-sm text-secondary`) with a `CountUp`-animated
 *           value (`text-lg font-bold tnum text-primary`) and a tiny
 *           semantic delta arrow (pos/neg/neutral).
 *
 *   RIGHT — `.liquid-glass rounded-card` with an inline equity-curve
 *           SVG (animated draw-in) + a "computed from N trades"
 *           footnote tying the marketing copy to the live demo's
 *           deterministic data.
 *
 * Every metric is pulled from `METRICS` (the same object the live
 * demo renders), so the numbers shown here match what users will see
 * on /demo exactly. Bilingual via `useLang()`. Accent gold used
 * sparingly: only on the headline gradient word + the equity-curve
 * stroke. P&L colors for expectancy, avg R, and max drawdown. `tnum`
 * on every numeric value. No indigo/blue.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export function MetricsShowcase() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      id="metrics-deep"
      aria-label={es ? "Métricas institucionales" : "Institutional metrics"}
      className="section cv-auto relative overflow-hidden"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <Eyebrow>
            {es ? "MÉTRICAS INSTITUCIONALES" : "INSTITUTIONAL METRICS"}
          </Eyebrow>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-primary leading-[1.1]">
            {es ? (
              <>
                Los mismos ratios que usan los{" "}
                <span className="text-gradient">fondos.</span>
              </>
            ) : (
              <>
                The same ratios funds{" "}
                <span className="text-gradient">actually use.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Sharpe, Sortino, Calmar, profit factor, expectancy, drawdown — cada métrica se calcula a partir de tus operaciones, en tiempo real, en tu máquina. Sin estimaciones, sin aproximaciones."
              : "Sharpe, Sortino, Calmar, profit factor, expectancy, drawdown — every metric is computed from your trades, in real time, on your machine. No estimates, no approximations."}
          </p>
        </Reveal>

        {/* 2-col layout: metrics table + equity curve */}
        <div className="mt-10 grid lg:grid-cols-2 gap-5">
          {/* LEFT — metrics table */}
          <Reveal>
            <MetricsTable es={es} />
          </Reveal>

          {/* RIGHT — equity curve */}
          <Reveal delay={0.1} y={24}>
            <EquityCard es={es} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============ LEFT — metrics table ============ */

interface Row {
  nameEs: string;
  nameEn: string;
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  /** Tone for the value text (pos/neg/neutral). */
  tone?: "pos" | "neg" | "neutral";
  /** Delta-arrow tone (good/bad/neutral). */
  delta: "pos" | "neg" | "neutral";
  /** Tiny footnote tooltip explaining the metric. */
  hintEs: string;
  hintEn: string;
}

function MetricsTable({ es }: { es: boolean }) {
  const m = METRICS;

  const rows: Row[] = [
    {
      nameEs: "Expectancy",
      nameEn: "Expectancy",
      value: m.expectancy,
      decimals: 2,
      prefix: "$",
      tone: m.expectancy > 0 ? "pos" : m.expectancy < 0 ? "neg" : "neutral",
      delta: m.expectancy > 0 ? "pos" : m.expectancy < 0 ? "neg" : "neutral",
      hintEs: "P&L medio por operación cerrada.",
      hintEn: "Average P&L per closed trade.",
    },
    {
      nameEs: "Sharpe",
      nameEn: "Sharpe",
      value: m.sharpe,
      decimals: 2,
      delta: m.sharpe > 1 ? "pos" : m.sharpe > 0 ? "neutral" : "neg",
      hintEs: "Retorno por unidad de volatilidad.",
      hintEn: "Return per unit of volatility.",
    },
    {
      nameEs: "Sortino",
      nameEn: "Sortino",
      value: m.sortino,
      decimals: 2,
      delta: m.sortino > 1 ? "pos" : m.sortino > 0 ? "neutral" : "neg",
      hintEs: "Sharpe pero solo penaliza la volatilidad negativa.",
      hintEn: "Sharpe but only downside volatility is penalized.",
    },
    {
      nameEs: "Calmar",
      nameEn: "Calmar",
      value: m.calmar,
      decimals: 2,
      delta: m.calmar > 1 ? "pos" : m.calmar > 0 ? "neutral" : "neg",
      hintEs: "Retorno anualizado sobre el drawdown máximo.",
      hintEn: "Annualized return over max drawdown.",
    },
    {
      nameEs: "Profit Factor",
      nameEn: "Profit Factor",
      value: m.profitFactor,
      decimals: 2,
      delta: m.profitFactor > 1 ? "pos" : "neg",
      hintEs: "Ganancias brutas divididas por pérdidas brutas.",
      hintEn: "Gross profit divided by gross loss.",
    },
    {
      nameEs: "Win Rate",
      nameEn: "Win Rate",
      value: m.winRate * 100,
      decimals: 1,
      suffix: "%",
      delta: m.winRate > 0.5 ? "pos" : m.winRate > 0.4 ? "neutral" : "neg",
      hintEs: "Porcentaje de operaciones ganadoras.",
      hintEn: "Percentage of winning trades.",
    },
    {
      nameEs: "Avg R",
      nameEn: "Avg R",
      value: m.expectancyR,
      decimals: 2,
      prefix: "R ",
      tone: m.expectancyR > 0 ? "pos" : m.expectancyR < 0 ? "neg" : "neutral",
      delta: m.expectancyR > 0 ? "pos" : m.expectancyR < 0 ? "neg" : "neutral",
      hintEs: "Expectancy expresada en múltiplos del riesgo asumido.",
      hintEn: "Expectancy expressed in multiples of risk taken.",
    },
    {
      nameEs: "Max Drawdown",
      nameEn: "Max Drawdown",
      value: m.maxDrawdownPct * 100,
      decimals: 1,
      suffix: "%",
      tone: "neg",
      delta: "neg",
      hintEs: "Mayor caída desde el pico histórico de la curva de equity.",
      hintEn: "Largest drop from the equity curve's running peak.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      className="liquid-glass depth-2 hover:depth-3 rounded-card p-6 md:p-7 h-full flex flex-col transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      {/* Card header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="eyebrow">
            {es ? "Ratios en vivo" : "Live ratios"}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-primary">
            {es ? "Motor de métricas" : "Metrics engine"}
          </h3>
        </div>
        <span className="pill bg-white/5 text-tertiary border border-white/10 tnum text-xs">
          {es ? "tiempo real" : "real-time"}
        </span>
      </div>

      {/* Rows */}
      <div className="mt-2 flex-1 flex flex-col">
        {rows.map((r, i) => (
          <div
            key={r.nameEn}
            className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.06] last:border-b-0"
          >
            {/* Name + hint */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-secondary truncate">
                {es ? r.nameEs : r.nameEn}
              </span>
              <span
                className="text-[10px] text-tertiary/70 italic hidden sm:inline truncate"
                title={es ? r.hintEs : r.hintEn}
              >
                {es ? r.hintEs : r.hintEn}
              </span>
            </div>

            {/* Value + delta */}
            <div className="flex items-center gap-2.5 shrink-0">
              <CountUp
                to={r.value}
                decimals={r.decimals}
                prefix={r.prefix}
                suffix={r.suffix}
                tone={r.tone ?? "neutral"}
                className="text-lg font-bold text-primary"
              />
              <DeltaArrow tone={r.delta} />
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-tertiary">
        {es
          ? `Calculado a partir de ${m.closedCount} operaciones cerradas.`
          : `Computed from ${m.closedCount} closed trades.`}
      </div>
    </motion.div>
  );
}

/** Tiny up/down arrow indicating whether the metric is "good" or "bad". */
function DeltaArrow({ tone }: { tone: "pos" | "neg" | "neutral" }) {
  const color =
    tone === "pos"
      ? "text-pnl-pos"
      : tone === "neg"
      ? "text-pnl-neg"
      : "text-tertiary";
  const path =
    tone === "neg" ? "M4 2 L8 6 L12 2" : tone === "pos" ? "M4 6 L8 2 L12 6" : "M4 4 H12";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center w-4 h-4 ${color}`}
    >
      <svg width="14" height="14" viewBox="0 0 16 8" fill="none">
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ============ RIGHT — equity curve card ============ */

function EquityCard({ es }: { es: boolean }) {
  const m = METRICS;

  // Prepend the INITIAL_BALANCE point so the curve starts flat at $10,000.
  const curve = useMemo(() => {
    return [
      { balance: INITIAL_BALANCE_CONST, perf: 0 },
      ...m.equityCurve.map((p) => ({ balance: p.balance, perf: p.perf })),
    ];
  }, [m]);

  // Geometry
  const W = 480;
  const H = 220;
  const padL = 12;
  const padR = 12;
  const padT = 16;
  const padB = 24;

  const { linePath, areaPath, baselineY, minBal, maxBal, finalBal } = useMemo(() => {
    if (!curve.length) {
      return {
        linePath: "",
        areaPath: "",
        baselineY: 0,
        minBal: 0,
        maxBal: 0,
        finalBal: 0,
      };
    }
    const balances = curve.map((p) => p.balance);
    const minBal = Math.min(...balances);
    const maxBal = Math.max(...balances);
    const range = maxBal - minBal || 1;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const pts = balances.map((b, i) => {
      const x = padL + (i / (balances.length - 1)) * innerW;
      const y = padT + (1 - (b - minBal) / range) * innerH;
      return { x, y };
    });

    const linePath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
    const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${H - padB} L${pts[0].x.toFixed(1)},${H - padB} Z`;
    const baselineY =
      padT + (1 - (INITIAL_BALANCE_CONST - minBal) / range) * innerH;

    return {
      linePath,
      areaPath,
      baselineY,
      minBal,
      maxBal,
      finalBal: balances[balances.length - 1],
    };
  }, [curve]);

  const profit = finalBal - INITIAL_BALANCE_CONST;
  const profitTone = profit > 0 ? "pos" : profit < 0 ? "neg" : "neutral";
  const profitColor =
    profitTone === "pos"
      ? "rgb(var(--pnl-pos))"
      : profitTone === "neg"
      ? "rgb(var(--pnl-neg))"
      : "rgb(var(--txt-tertiary))";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      className="liquid-glass depth-2 hover:depth-3 rounded-card p-6 md:p-7 h-full flex flex-col transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      {/* Card header — title + final balance */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="eyebrow">
            {es ? "Curva de equity" : "Equity curve"}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-primary">
            {es ? "Capital en el tiempo" : "Capital over time"}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
            {es ? "Balance final" : "Final balance"}
          </div>
          <div
            className="tnum text-xl font-bold leading-tight"
            style={{ color: profitColor }}
          >
            ${Math.round(finalBal).toLocaleString("en-US")}
          </div>
        </div>
      </div>

      {/* Equity curve SVG */}
      <div className="mt-4 flex-1 flex items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={
            es
              ? `Curva de equity desde $${Math.round(minBal).toLocaleString()} hasta $${Math.round(maxBal).toLocaleString()}`
              : `Equity curve from $${Math.round(minBal).toLocaleString()} to $${Math.round(maxBal).toLocaleString()}`
          }
        >
          <defs>
            <linearGradient id="ms-eq-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--accent-base))" stopOpacity="0.22" />
              <stop offset="100%" stopColor="rgb(var(--accent-base))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ms-eq-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(var(--accent-base))" />
              <stop offset="100%" stopColor="rgb(var(--accent-hover))" />
            </linearGradient>
          </defs>

          {/* Baseline at INITIAL_BALANCE */}
          <line
            x1={padL}
            y1={baselineY}
            x2={W - padR}
            y2={baselineY}
            stroke="rgb(var(--divider) / 0.18)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#ms-eq-area)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          />

          {/* Equity line — animated draw-in */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#ms-eq-line)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE }}
          />

          {/* End-point dot */}
          <motion.circle
            cx={W - padR}
            cy={padT + (1 - (finalBal - minBal) / ((maxBal - minBal) || 1)) * (H - padT - padB)}
            r="4"
            fill={profitColor}
            stroke="rgb(var(--card))"
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.5, ease: EASE }}
          />

          {/* Min/max labels */}
          <text
            x={padL}
            y={padT - 4}
            className="text-[10px] tnum"
            fill="rgb(var(--txt-tertiary))"
          >
            ${Math.round(maxBal / 1000)}k
          </text>
          <text
            x={padL}
            y={H - padB + 14}
            className="text-[10px] tnum"
            fill="rgb(var(--txt-tertiary))"
          >
            ${Math.round(minBal / 1000)}k
          </text>
        </svg>
      </div>

      {/* Footnote — P&L + trade count */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-tertiary">
          {es
            ? `Calculado a partir de ${m.closedCount} operaciones.`
            : `Computed from ${m.closedCount} trades.`}
        </span>
        <span
          className="tnum font-semibold"
          style={{ color: profitColor }}
        >
          {profit >= 0 ? "+" : "−"}${Math.abs(Math.round(profit)).toLocaleString("en-US")}
        </span>
      </div>
    </motion.div>
  );
}
