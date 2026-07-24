"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  computeMetrics,
  INSTRUMENTS,
  SETUP_NAMES,
  rHistogram,
  pnlHistogram,
  durationHistogram,
  weekdayBreakdown,
  monthlyBreakdown,
  rankByExpectancy,
  heatmap as heatmapGrid,
  type Trade,
  type RankingRow,
} from "@/lib/trading/data";
import { fmtMoney, fmtNum, fmtPct, fmtInt } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";
import { Histogram } from "@/components/charts/Histogram";
import { Heatmap } from "@/components/charts/Heatmap";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { useDemo } from "@/components/demo/DemoContext";

/* ============================================================
 * Small primitives
 * ============================================================ */

type FilterGroup = "direction" | "compliance";

function FilterChip({
  active,
  onClick,
  children,
  group,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  group: FilterGroup;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center"
    >
      {active && (
        <motion.span
          layoutId={`analytics-filter-${group}`}
          className="pointer-events-none absolute inset-0 rounded-full border border-white/20 bg-white/8"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Chip variant={active ? "accent" : "default"} className="relative">
        {children}
      </Chip>
    </motion.button>
  );
}

/** Section card — premium card border with eyebrow header. Mirrors
 *  AnalyticsPage.xaml's PremiumCardBorderStyle + EyebrowTextStyle. */
function SectionCard({
  eyebrow,
  title,
  hint,
  children,
  className = "",
  delay = 0,
}: {
  eyebrow?: string;
  title?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full">
        {(eyebrow || title || hint) && (
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            {title && (
              <h3 className="text-[13px] font-medium text-primary tracking-[-0.01em]">
                {title}
              </h3>
            )}
            {hint}
          </div>
        )}
        {children}
      </div>
    </Reveal>
  );
}

/** Compact ratio cell — label (xs uppercase tertiary) + value (lg semibold
 *  tnum). No box, no border. Mirrors the inner StackPanel of the XAML
 *  RatioTile / DataCaptionTextStyle + DataLargeTextStyle pairs. */
function RatioCell({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 items-center text-center" title={hint}>
      <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
        {label}
      </span>
      <span className="font-semibold tnum text-primary text-base md:text-lg leading-none">
        {children}
      </span>
    </div>
  );
}

/** KPI strip cell — loose on canvas, vertical hairline separator.
 *  Mirrors AnalyticsPage.xaml lines 187-246 (summary strip with
 *  VerticalHairlineStyle separators, no enclosing box). */
function KpiStripCell({
  label,
  children,
  showHairline,
  reKey,
}: {
  label: string;
  children: ReactNode;
  showHairline: boolean;
  reKey: string;
}) {
  return (
    <div className="flex items-stretch flex-1 min-w-0">
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 px-2 sm:px-3 items-center text-center rounded-md transition-colors hover:bg-white/[0.03]">
        <div className="text-[10px] uppercase tracking-[0.14em] text-tertiary truncate">
          {label}
        </div>
        <div className="font-semibold tnum text-primary text-lg md:text-xl leading-none">
          <span key={reKey}>{children}</span>
        </div>
      </div>
      {showHairline && (
        <div
          className="self-stretch w-px my-1 bg-gradient-to-b from-transparent via-white/15 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/** Tiny inline sparkline shown on KPI tiles. */
function Sparkline({
  values,
  tone,
}: {
  values: number[];
  tone: "pos" | "neg" | "neutral";
}) {
  if (values.length < 2) return null;
  const w = 56;
  const h = 16;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color =
    tone === "pos"
      ? "rgb(var(--pnl-pos))"
      : tone === "neg"
      ? "rgb(var(--pnl-neg))"
      : "rgb(var(--txt-tertiary))";
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="opacity-70"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

/* ============================================================
 * Donut: winners vs losers — draw-in arc.
 * ============================================================ */
function WinnersDonut({
  wins,
  losses,
  reKey,
}: {
  wins: number;
  losses: number;
  reKey: string;
}) {
  const { t } = useLang();
  const total = wins + losses || 1;
  const winFrac = wins / total;
  const r = 56;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const winLen = winFrac * circ;
  return (
    <div
      className="relative mx-auto"
      style={{ width: 140, height: 140 }}
    >
      <svg viewBox="0 0 140 140" width={140} height={140} aria-hidden="true">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgb(var(--pnl-neg) / 0.22)"
          strokeWidth={12}
        />
        <motion.circle
          key={`donut-arc-${reKey}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgb(var(--pnl-pos))"
          strokeWidth={12}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeDasharray={`${winLen} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold tnum text-pnl-pos leading-none">
          <CountUp
            key={`donut-pct-${reKey}`}
            to={winFrac * 100}
            decimals={1}
            suffix="%"
          />
        </div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mt-1.5">
          {t("winRate")}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * R-multiple over time — animated bar chart.
 * ============================================================ */
function ROverTimeChart({ trades }: { trades: Trade[] }) {
  const H = 150;
  const W = 560;
  const padTop = 8;
  const padBottom = 14;
  const plotH = H - padTop - padBottom;
  const sorted = useMemo(
    () => [...trades].sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime()),
    [trades]
  );
  const n = sorted.length;
  const maxAbs = useMemo(() => {
    if (!n) return 1;
    return Math.max(
      1,
      ...sorted.map((t) => Math.abs(t.rMultiple))
    );
  }, [sorted, n]);
  const baselineY = padTop + plotH / 2;

  if (n === 0) {
    return <div className="text-xs text-tertiary text-center py-8">—</div>;
  }

  const barW = Math.max(2, (W / n) * 0.7);
  const gap = (W - barW * n) / Math.max(1, n - 1);

  return (
    <div className="overflow-x-auto custom-scroll -mx-1 px-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        role="img"
        aria-label="R-multiple over time chart"
      >
        <line
          x1={0}
          x2={W}
          y1={baselineY}
          y2={baselineY}
          stroke="rgb(var(--divider) / 0.4)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        {sorted.map((t, i) => {
          const x = i * (barW + gap);
          const sign = t.rMultiple >= 0 ? 1 : -1;
          const mag = (Math.abs(t.rMultiple) / maxAbs) * (plotH / 2);
          const h = Math.max(1, mag);
          const y = sign === 1 ? baselineY - h : baselineY;
          const color =
            sign === 1 ? "rgb(var(--pnl-pos))" : "rgb(var(--pnl-neg))";
          return (
            <motion.rect
              key={t.id}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={1}
              fill={color}
              fillOpacity={0.85}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: Math.min(0.6, i * 0.012),
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: `center ${baselineY}px` }}
            >
              <title>{`R ${t.rMultiple >= 0 ? "+" : ""}${t.rMultiple.toFixed(2)}`}</title>
            </motion.rect>
          );
        })}
      </svg>
    </div>
  );
}

/* ============================================================
 * P&L by weekday — horizontal bars
 * ============================================================ */
function WeekdayBars({ trades }: { trades: Trade[] }) {
  const { lang } = useLang();
  const rows = useMemo(() => weekdayBreakdown(trades), [trades]);
  const maxAbs = useMemo(
    () => Math.max(1, ...rows.map((r) => Math.abs(r.pnl))),
    [rows]
  );
  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const pos = r.pnl >= 0;
        const pct = (Math.abs(r.pnl) / maxAbs) * 100;
        return (
          <div key={r.day} className="flex items-center gap-3">
            <div className="w-8 text-[11px] text-tertiary tnum">{r.day}</div>
            <div className="flex-1 h-5 bg-white/[0.03] rounded-sm overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-sm"
                style={{
                  backgroundColor: pos
                    ? "rgb(var(--pnl-pos) / 0.7)"
                    : "rgb(var(--pnl-neg) / 0.7)",
                }}
              />
            </div>
            <div
              className={`w-16 text-right text-[11px] tnum ${
                pos ? "text-pnl-pos" : "text-pnl-neg"
              }`}
            >
              {fmtMoney(r.pnl, lang, { sign: true, decimals: 0 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * P&L by month — vertical bars
 * ============================================================ */
function MonthlyBars({ trades }: { trades: Trade[] }) {
  const { lang } = useLang();
  const rows = useMemo(() => monthlyBreakdown(trades), [trades]);
  const maxAbs = useMemo(
    () => Math.max(1, ...rows.map((r) => Math.abs(r.pnl))),
    [rows]
  );
  const H = 140;
  const padTop = 6;
  const padBottom = 18;
  const plotH = H - padTop - padBottom;
  const baselineY = padTop + plotH / 2;

  if (!rows.length) {
    return <div className="text-xs text-tertiary text-center py-8">—</div>;
  }
  const barW = 28;
  const gap = 10;
  const W = rows.length * barW + (rows.length - 1) * gap;

  return (
    <div className="overflow-x-auto custom-scroll -mx-1 px-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        role="img"
        aria-label="P&L by month chart"
      >
        <line
          x1={0}
          x2={W}
          y1={baselineY}
          y2={baselineY}
          stroke="rgb(var(--divider) / 0.4)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
        {rows.map((r, i) => {
          const pos = r.pnl >= 0;
          const mag = (Math.abs(r.pnl) / maxAbs) * (plotH / 2);
          const h = Math.max(2, mag);
          const x = i * (barW + gap);
          const y = pos ? baselineY - h : baselineY;
          const color = pos
            ? "rgb(var(--pnl-pos))"
            : "rgb(var(--pnl-neg))";
          return (
            <g key={`${r.month}-${i}`}>
              <motion.rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                fill={color}
                fillOpacity={0.85}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformOrigin: `center ${baselineY}px` }}
              >
                <title>{`${r.month}: ${fmtMoney(r.pnl, lang, { sign: true })}`}</title>
              </motion.rect>
              <text
                x={x + barW / 2}
                y={H - 4}
                textAnchor="middle"
                className="fill-[rgb(var(--txt-tertiary))]"
                style={{ fontSize: 10 }}
              >
                {r.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ============================================================
 * Ranking card (setups / instruments by expectancy)
 * ============================================================ */
function RankingCard({
  title,
  rows,
  reKey,
}: {
  title: string;
  rows: RankingRow[];
  reKey: string;
}) {
  const { lang } = useLang();
  const maxAbs = useMemo(
    () => Math.max(1, ...rows.map((r) => Math.abs(r.expectancy))),
    [rows]
  );

  return (
    <Reveal className="h-full">
      <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full">
        <h3 className="text-[13px] font-medium text-primary tracking-[-0.01em] mb-3">
          {title}
        </h3>
        <div className="space-y-2.5">
          {rows.length === 0 && (
            <div className="text-xs text-tertiary text-center py-6">—</div>
          )}
          {rows.map((r, i) => {
            const pos = r.expectancy >= 0;
            const pct = (Math.abs(r.expectancy) / maxAbs) * 100;
            return (
              <div key={`${reKey}-${r.name}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-tertiary tnum w-3">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-primary truncate">
                      {r.name}
                    </span>
                    <Chip variant="neutral" className="text-[9px] py-0 px-1.5 tnum">
                      {fmtInt(r.count, lang)}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-tertiary tnum">
                      {fmtPct(r.winRate, lang, 0)}
                    </span>
                    <span
                      className={`text-[11px] tnum font-semibold ${
                        pos ? "text-pnl-pos" : "text-pnl-neg"
                      }`}
                    >
                      {fmtMoney(r.expectancy, lang, { sign: true, decimals: 0 })}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/[0.03] rounded-sm overflow-hidden ml-5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-sm"
                    style={{
                      backgroundColor: pos
                        ? "rgb(var(--pnl-pos) / 0.7)"
                        : "rgb(var(--pnl-neg) / 0.7)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

/* ============================================================
 * Heatmap legend
 * ============================================================ */
function HeatmapLegend({ trades }: { trades: Trade[] }) {
  const { lang } = useLang();
  const maxAbs = useMemo(() => {
    const grid = heatmapGrid(trades);
    let m = 0;
    for (const row of grid) for (const v of row) m = Math.max(m, Math.abs(v));
    return m || 1;
  }, [trades]);

  const maxLabel =
    maxAbs >= 1000
      ? `$${(maxAbs / 1000).toFixed(1)}k`
      : `$${Math.round(maxAbs)}`;

  const swatches = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const intensity = Math.abs(t - 0.5) * 2;
    const pos = t >= 0.5;
    return pos
      ? `rgb(var(--pnl-pos) / ${0.12 + intensity * 0.6})`
      : `rgb(var(--pnl-neg) / ${0.12 + intensity * 0.6})`;
  });

  return (
    <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-tertiary">
          {lang === "es" ? "Escala" : "Scale"}
        </span>
        <div className="flex items-center gap-0.5 h-3 rounded-sm overflow-hidden">
          {swatches.map((bg, i) => (
            <div
              key={i}
              className="w-4 h-full"
              style={{ backgroundColor: bg }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] tnum text-tertiary">
          <span className="text-pnl-neg">−{maxLabel}</span>
          <span>0</span>
          <span className="text-pnl-pos">+{maxLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-pnl-pos/70" />
          {lang === "es" ? "Positivo" : "Positive"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-pnl-neg/70" />
          {lang === "es" ? "Negativo" : "Negative"}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
 * Histogram legend
 * ============================================================ */
function HistogramLegend({
  kind,
  total,
  symbol,
}: {
  kind: "pos-neg" | "accent";
  total: number;
  symbol: string;
}) {
  const { lang } = useLang();
  const tradesLabel =
    lang === "es"
      ? `${fmtInt(total, lang)} operaciones`
      : `${fmtInt(total, lang)} trades`;
  return (
    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-tertiary">
        {kind === "pos-neg" ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-pnl-neg/70" />
              {lang === "es" ? "Negativo" : "Negative"} {symbol}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-pnl-pos/70" />
              {lang === "es" ? "Positivo" : "Positive"} {symbol}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[rgb(var(--accent-base)/0.7)]" />
            {lang === "es" ? "Frecuencia" : "Frequency"}
          </span>
        )}
      </div>
      <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary tnum">
        {tradesLabel}
      </span>
    </div>
  );
}

/* ============================================================
 * Period row — slice trades by time window and compute per-period
 * summary metrics. Mirrors AnalyticsPage.xaml's PeriodRow grid
 * (lines 133-184): Period | Count | Net | Win% | PF | MaxDD%.
 * ============================================================ */
interface PeriodRow {
  label: string;
  count: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  maxDdPct: number;
}

function buildPeriodRows(trades: Trade[]): PeriodRow[] {
  if (trades.length === 0) return [];
  const now = Math.max(...trades.map((t) => t.closedAt.getTime()));
  const dayMs = 86_400_000;
  const windows: { label: string; days: number }[] = [
    { label: "Mes", days: 30 },
    { label: "Trimestre", days: 90 },
    { label: "Año", days: 365 },
    { label: "Histórico", days: Infinity },
  ];
  return windows.map(({ label, days }) => {
    const slice =
      days === Infinity
        ? trades
        : trades.filter((t) => now - t.closedAt.getTime() <= days * dayMs);
    const n = slice.length;
    const wins = slice.filter((t) => t.netPnl > 0);
    const losses = slice.filter((t) => t.netPnl < 0);
    const grossWin = wins.reduce((s, t) => s + t.netPnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
    const netPnl = slice.reduce((s, t) => s + t.netPnl, 0);

    // Max drawdown % over the slice's equity curve (starting at $10,000).
    let peak = 10_000;
    let bal = 10_000;
    let maxDdPct = 0;
    const chrono = [...slice].sort(
      (a, b) => a.closedAt.getTime() - b.closedAt.getTime()
    );
    for (const t of chrono) {
      bal += t.netPnl;
      if (bal > peak) peak = bal;
      const dd = peak > 0 ? (peak - bal) / peak : 0;
      if (dd > maxDdPct) maxDdPct = dd;
    }

    return {
      label,
      count: n,
      netPnl,
      winRate: n ? wins.length / n : 0,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0,
      maxDdPct: maxDdPct * 100,
    };
  });
}

/* ============================================================
 * Equity quality — R², K-Ratio, slope of the equity curve.
 * Mirrors AnalyticsPage.xaml's EquityQualityCard (lines 560-591).
 * ============================================================ */
function computeEquityQuality(trades: Trade[]) {
  if (trades.length < 3) {
    return { r2: 0, kRatio: 0, slope: 0 };
  }
  const chrono = [...trades].sort(
    (a, b) => a.closedAt.getTime() - b.closedAt.getTime()
  );
  let bal = 10_000;
  const ys: number[] = [];
  for (const t of chrono) {
    bal += t.netPnl;
    ys.push(bal);
  }
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - meanX) ** 2;
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    syy += (ys[i] - meanY) ** 2;
  }
  const slope = sxx > 0 ? sxy / sxx : 0;
  const ssRes = Math.max(0, syy - slope * sxy);
  const r2 = syy > 0 ? 1 - ssRes / syy : 0;
  // Residual stddev for K-Ratio approximation.
  const residVar = ssRes / Math.max(1, n - 2);
  const residStd = Math.sqrt(residVar);
  const stderrSlope = residStd / Math.sqrt(sxx || 1);
  const kRatio = stderrSlope > 0 ? slope / stderrSlope : 0;
  return { r2, kRatio, slope };
}

/* ============================================================
 * Edge verdict — bootstrap CI approximation. With <30 trades the
 * verdict is "Inconclusive"; with 30-100 it's "Suggestive" if the
 * CI excludes zero; with 100+ it's "Confirmed".
 * ============================================================ */
function computeEdge(trades: Trade[]) {
  const n = trades.length;
  if (n < 5) {
    return {
      verdict: "Inconclusive",
      verdictTone: "neutral" as const,
      hint: "Muy pocas operaciones para emitir veredicto.",
      pValue: 1,
      winRate: 0,
      winRateCi: "—",
      expectancyR: 0,
      expectancyRCi: "—",
      profitFactor: 0,
      profitFactorCi: "—",
      tradesNeeded: 100,
    };
  }
  const rs = trades.map((t) => t.rMultiple);
  const meanR = rs.reduce((s, v) => s + v, 0) / n;
  const varR =
    rs.reduce((s, v) => s + (v - meanR) ** 2, 0) / Math.max(1, n - 1);
  const stdR = Math.sqrt(varR);
  const seR = stdR / Math.sqrt(n);
  // 95 % CI bounds.
  const loR = meanR - 1.96 * seR;
  const hiR = meanR + 1.96 * seR;
  // Approximate two-sided p-value from z-score (normal approximation).
  const z = seR > 0 ? Math.abs(meanR) / seR : 0;
  // Survival function approximation: 2 * (1 - Φ(|z|)).
  const pValue = z > 0 ? 2 * (1 - normCdf(z)) : 1;

  const wins = trades.filter((t) => t.netPnl > 0).length;
  const winRate = wins / n;
  const seW = Math.sqrt((winRate * (1 - winRate)) / n);
  const loW = Math.max(0, winRate - 1.96 * seW);
  const hiW = Math.min(1, winRate + 1.96 * seW);

  const grossWin = trades
    .filter((t) => t.netPnl > 0)
    .reduce((s, t) => s + t.netPnl, 0);
  const grossLoss = Math.abs(
    trades.filter((t) => t.netPnl < 0).reduce((s, t) => s + t.netPnl, 0)
  );
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0;

  let verdict: string;
  let verdictTone: "pos" | "warn" | "neutral";
  let hint: string;
  if (n < 30) {
    verdict = "Inconclusive";
    verdictTone = "neutral";
    hint = "Necesitas al menos 30 operaciones para emitir un veredicto con confianza estadística.";
  } else if (loR > 0) {
    verdict = "Edge confirmado";
    verdictTone = "pos";
    hint = "El intervalo de confianza del 95 % de la expectativa R excluye al cero: tu ventaja es estadísticamente significativa.";
  } else if (loR > -0.1) {
    verdict = "Sugerente";
    verdictTone = "warn";
    hint = "La señal apunta en la dirección correcta pero el intervalo aún incluye al cero — sigue operando para estrecharlo.";
  } else {
    verdict = "Sin edge";
    verdictTone = "neutral";
    hint = "El intervalo de confianza incluye al cero y la media es cercana o negativa: no hay evidencia de ventaja real.";
  }

  const tradesNeeded = Math.max(0, Math.ceil(((1.96 * stdR) / Math.max(0.05, Math.abs(meanR) || 0.05)) ** 2) - n);

  return {
    verdict,
    verdictTone,
    hint,
    pValue,
    winRate,
    winRateCi: `[${fmtPct(loW, "es", 0)}, ${fmtPct(hiW, "es", 0)}]`,
    expectancyR: meanR,
    expectancyRCi: `[${loR.toFixed(2)}, ${hiR.toFixed(2)}]`,
    profitFactor,
    profitFactorCi: `[${(profitFactor - 1.96 * seR).toFixed(2)}, ${(profitFactor + 1.96 * seR).toFixed(2)}]`,
    tradesNeeded,
  };
}

/** Standard-normal CDF approximation (Abramowitz & Stegun 26.2.17). */
function normCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 1 - p;
}

/* ============================================================
 * Advanced metrics — SQN, Ulcer index, CAGR. Local computations
 * (the demo Metrics object doesn't expose them).
 * ============================================================ */
function computeAdvanced(trades: Trade[]) {
  const n = trades.length;
  if (n < 2) return { sqn: 0, ulcer: 0, cagr: 0 };

  // SQN = sqrt(n) * mean(R) / std(R).
  const rs = trades.map((t) => t.rMultiple);
  const meanR = rs.reduce((s, v) => s + v, 0) / n;
  const varR = rs.reduce((s, v) => s + (v - meanR) ** 2, 0) / (n - 1);
  const stdR = Math.sqrt(varR);
  const sqn = stdR > 0 ? Math.sqrt(n) * meanR / stdR : 0;

  // Ulcer index over the equity curve.
  const chrono = [...trades].sort(
    (a, b) => a.closedAt.getTime() - b.closedAt.getTime()
  );
  let peak = 10_000;
  let bal = 10_000;
  let sumSq = 0;
  for (const t of chrono) {
    bal += t.netPnl;
    if (bal > peak) peak = bal;
    const ddPct = peak > 0 ? ((peak - bal) / peak) * 100 : 0;
    sumSq += ddPct * ddPct;
  }
  const ulcer = Math.sqrt(sumSq / n);

  // CAGR — time-weighted, ~180 days of history.
  const netPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const final = 10_000 + netPnl;
  const yearsSpan = Math.max(
    1 / 365,
    (chrono[chrono.length - 1]!.closedAt.getTime() - chrono[0]!.closedAt.getTime()) /
      (365 * dayMs)
  );
  const cagr =
    final > 0 && 10_000 > 0
      ? (Math.pow(final / 10_000, 1 / yearsSpan) - 1) * 100
      : 0;

  return { sqn, ulcer, cagr };
}

const dayMs = 86_400_000;

/* ============================================================
 * Section nav — SelectorBar-style horizontal tab strip.
 * Mirrors AnalyticsPage.xaml lines 50-62 (six SelectorBarItems).
 * Visual-only: the demo doesn't actually swap content per tab,
 * but the strip reads as the page's primary navigation.
 * ============================================================ */
const SECTIONS = [
  { id: "summary", labelEs: "Resumen", labelEn: "Summary" },
  { id: "risk", labelEs: "Riesgo", labelEn: "Risk" },
  { id: "distributions", labelEs: "Distribuciones", labelEn: "Distributions" },
  { id: "time", labelEs: "Tiempo", labelEn: "Time" },
  { id: "attribution", labelEs: "Atribución", labelEn: "Attribution" },
  { id: "behaviour", labelEs: "Conducta", labelEn: "Behaviour" },
] as const;

function SectionBar({
  active,
  onChange,
  lang,
}: {
  active: string;
  onChange: (id: string) => void;
  lang: "es" | "en";
}) {
  return (
    <div className="space-y-2">
      <div
        role="tablist"
        aria-label={lang === "es" ? "Secciones" : "Sections"}
        className="flex items-center gap-1 overflow-x-auto custom-scroll -mx-1 px-1"
      >
        {SECTIONS.map((s, i) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(s.id)}
              className={`relative whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${
                isActive
                  ? "text-primary"
                  : "text-tertiary hover:text-secondary hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {lang === "es" ? s.labelEs : s.labelEn}
                <span className="text-[9px] text-tertiary tnum">
                  · {i + 1}
                </span>
              </span>
              {isActive && (
                <motion.span
                  layoutId="analytics-section-underline"
                  className="absolute left-2 right-2 -bottom-0.5 h-[2px] rounded-full bg-[rgb(var(--accent-base))] shadow-[0_0_8px_rgb(var(--accent-base)/0.5)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="h-px bg-[rgb(var(--divider)/0.18)]" />
    </div>
  );
}

/* ============================================================
 * ComboBox-style filter — small header label above a native select.
 * Mirrors AnalyticsPage.xaml's ComboBox-with-Header filter row
 * (lines 68-105).
 * ============================================================ */
function FilterSelect({
  header,
  value,
  onChange,
  children,
  minWidth = 200,
}: {
  header: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="flex flex-col gap-1" style={{ minWidth }}>
      <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
        {header}
      </span>
      <div className="relative">
        <select
          aria-label={header}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md h-8 pl-2.5 pr-7 text-xs text-primary tnum focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer w-full"
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          width={10}
          height={10}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-tertiary"
        >
          <path
            d="M2.5 4 L6 7.5 L9.5 4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ============================================================
 * Main page
 * ============================================================ */
export function AnalyticsPage() {
  const { t, lang } = useLang();
  const { filters, setFilters, clearFilters } = useDemo();
  const [activeSection, setActiveSection] = useState<string>("summary");

  const filteredTrades = useMemo(() => {
    return TRADES.filter((tr) => {
      if (filters.instrument !== "all" && tr.instrument !== filters.instrument)
        return false;
      if (filters.setup !== "all" && tr.setup !== filters.setup) return false;
      if (filters.direction !== "all" && tr.direction !== filters.direction)
        return false;
      if (filters.compliance === "yes" && tr.compliance !== "yes") return false;
      if (filters.compliance === "no" && tr.compliance === "yes") return false;
      return true;
    });
  }, [
    filters.instrument,
    filters.setup,
    filters.direction,
    filters.compliance,
  ]);

  const m = useMemo(() => computeMetrics(filteredTrades), [filteredTrades]);

  const rHist = useMemo(() => rHistogram(filteredTrades), [filteredTrades]);
  const pnlHist = useMemo(() => pnlHistogram(filteredTrades), [filteredTrades]);
  const durHist = useMemo(() => durationHistogram(filteredTrades), [filteredTrades]);
  const setupRanks = useMemo(
    () => rankByExpectancy(filteredTrades, (tr) => tr.setup),
    [filteredTrades]
  );
  const instRanks = useMemo(
    () => rankByExpectancy(filteredTrades, (tr) => tr.instrument),
    [filteredTrades]
  );
  const periodRows = useMemo(() => buildPeriodRows(filteredTrades), [filteredTrades]);
  const equityQ = useMemo(() => computeEquityQuality(filteredTrades), [filteredTrades]);
  const edge = useMemo(() => computeEdge(filteredTrades), [filteredTrades]);
  const adv = useMemo(() => computeAdvanced(filteredTrades), [filteredTrades]);

  const filterSig = `${filters.instrument}|${filters.setup}|${filters.direction}|${filters.compliance}`;

  const sparkPnl = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime())
      .slice(-8)
      .map((tr) => tr.netPnl);
  }, [filteredTrades]);
  const sparkR = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime())
      .slice(-8)
      .map((tr) => tr.rMultiple);
  }, [filteredTrades]);
  const sparkEquity = useMemo(() => {
    return m.equityCurve.slice(-8).map((e) => e.balance);
  }, [m.equityCurve]);

  const filterActive =
    filters.instrument !== "all" ||
    filters.setup !== "all" ||
    filters.direction !== "all" ||
    filters.compliance !== "all";

  const shortSample = m.closedCount < 30;

  const compactMoney = (v: number) =>
    fmtMoney(v, lang, { compact: true, decimals: 0 });

  const desc = (es: string, en: string) => (lang === "es" ? es : en);

  const verdictLedClass =
    edge.verdictTone === "pos"
      ? "bg-pnl-pos"
      : edge.verdictTone === "warn"
      ? "bg-pnl-warn"
      : "bg-tertiary";
  const verdictTextClass =
    edge.verdictTone === "pos"
      ? "text-pnl-pos"
      : edge.verdictTone === "warn"
      ? "text-pnl-warn"
      : "text-secondary";

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* ============ HEADER ============ */}
      <section className="relative overflow-hidden rounded-card">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-10 w-56 h-32 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(closest-side, rgb(var(--accent-base) / 0.16), transparent 70%)",
          }}
        />
        <Reveal className="relative">
          <Eyebrow>{t("analyticsEyebrow")}</Eyebrow>
          <h1 className="mt-2 font-medium tracking-[-0.02em] text-primary text-2xl md:text-3xl">
            {t("analyticsTitle")}
          </h1>
          <p className="text-sm text-tertiary mt-1.5 max-w-2xl leading-relaxed">
            {t("analyticsDesc")}
          </p>
        </Reveal>
      </section>

      {/* ============ SECTION NAV (SelectorBar) ============ */}
      <SectionBar
        active={activeSection}
        onChange={setActiveSection}
        lang={lang}
      />

      {/* ============ FILTER BAR — ComboBox-with-header style ============ */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            header={t("colInstrument")}
            value={filters.instrument}
            onChange={(v) => setFilters({ instrument: v })}
          >
            <option value="all">{t("all")}</option>
            {INSTRUMENTS.map((inst) => (
              <option key={inst.symbol} value={inst.symbol}>
                {inst.symbol}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            header={t("colSetup")}
            value={filters.setup}
            onChange={(v) => setFilters({ setup: v })}
            minWidth={180}
          >
            <option value="all">{t("all")}</option>
            {SETUP_NAMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            header={t("direction")}
            value={filters.direction}
            onChange={(v) => setFilters({ direction: v as typeof filters.direction })}
            minWidth={140}
          >
            <option value="all">{t("all")}</option>
            <option value="long">{t("long")}</option>
            <option value="short">{t("short")}</option>
          </FilterSelect>

          <FilterSelect
            header={t("compliance")}
            value={filters.compliance}
            onChange={(v) => setFilters({ compliance: v as typeof filters.compliance })}
            minWidth={170}
          >
            <option value="all">{t("all")}</option>
            <option value="yes">{t("complied")}</option>
            <option value="no">{t("notComplied")}</option>
          </FilterSelect>

          {filterActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-tertiary hover:text-secondary transition-colors px-2 py-1 rounded-md hover:bg-white/5 mb-0.5"
              aria-label={t("clearFilters")}
            >
              ✕ {t("clearFilters")}
            </button>
          )}
        </div>
      </div>

      {/* ============ EMPTY STATE ============ */}
      {filteredTrades.length === 0 && (
        <SectionCard>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-tertiary"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <p className="text-secondary text-sm">
              {lang === "es"
                ? "Sin operaciones con esos filtros."
                : "No trades match these filters."}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-white/10 hover:bg-white/5 transition-colors text-secondary"
            >
              {t("clearFilters")}
            </button>
          </div>
        </SectionCard>
      )}

      {filteredTrades.length > 0 && (
        <>
          {/* ============ PERIOD COMPARISON CARD ============ */}
          <SectionCard
            eyebrow={lang === "es" ? "De un vistazo" : "At a glance"}
          >
            <div className="overflow-x-auto custom-scroll -mx-1">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="text-left">
                    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-tertiary font-medium">
                      {lang === "es" ? "Periodo" : "Period"}
                    </th>
                    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-tertiary font-medium text-right">
                      {lang === "es" ? "Ops" : "Trades"}
                    </th>
                    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-tertiary font-medium text-right">
                      {lang === "es" ? "P&L neto" : "Net P&L"}
                    </th>
                    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-tertiary font-medium text-right">
                      {t("winRate")}
                    </th>
                    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-tertiary font-medium text-right">
                      {t("profitFactor")}
                    </th>
                    <th className="px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-tertiary font-medium text-right">
                      {lang === "es" ? "Max DD" : "Max DD"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periodRows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-t border-white/[0.06] ${
                        i === periodRows.length - 1 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="px-2 py-2.5 font-medium text-primary text-sm">
                        {row.label === "Mes"
                          ? lang === "es" ? "Mes" : "Month"
                          : row.label === "Trimestre"
                          ? lang === "es" ? "Trimestre" : "Quarter"
                          : row.label === "Año"
                          ? lang === "es" ? "Año" : "Year"
                          : lang === "es" ? "Histórico" : "All-time"}
                      </td>
                      <td className="px-2 py-2.5 tnum text-tertiary text-xs text-right">
                        {fmtInt(row.count, lang)}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <Money value={row.netPnl} sign colorizeSign decimals={0} className="text-sm font-semibold" />
                      </td>
                      <td className="px-2 py-2.5 tnum text-secondary text-xs text-right">
                        {fmtPct(row.winRate, lang, 0)}
                      </td>
                      <td className="px-2 py-2.5 tnum text-secondary text-xs text-right">
                        {fmtNum(row.profitFactor, lang, 2)}
                      </td>
                      <td className="px-2 py-2.5 tnum text-pnl-neg text-xs text-right">
                        −{fmtNum(row.maxDdPct, lang, 1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ============ KPI STRIP — loose, vertical hairlines ============ */}
          <div className="space-y-2">
            <Eyebrow>
              {lang === "es" ? "Resumen del universo filtrado" : "Filtered universe summary"}
            </Eyebrow>
            <div className="flex items-stretch rounded-card liquid-glass depth-1 p-4">
              <KpiStripCell
                label={lang === "es" ? "Operaciones" : "Trades"}
                showHairline
                reKey={`count-${filterSig}`}
              >
                <CountUp to={m.closedCount} decimals={0} />
              </KpiStripCell>
              <KpiStripCell
                label={t("pnlTotal")}
                showHairline
                reKey={`net-${filterSig}`}
              >
                <Money value={m.netPnl} sign colorizeSign decimals={0} className="text-base md:text-lg" />
              </KpiStripCell>
              <KpiStripCell
                label={t("winRate")}
                showHairline
                reKey={`wr-${filterSig}`}
              >
                <CountUp to={m.winRate * 100} decimals={1} suffix="%" />
              </KpiStripCell>
              <KpiStripCell
                label={t("expectancy")}
                showHairline
                reKey={`exp-${filterSig}`}
              >
                <Money value={m.expectancy} sign colorizeSign decimals={0} className="text-base md:text-lg" />
              </KpiStripCell>
              <KpiStripCell
                label={t("profitFactor")}
                showHairline={false}
                reKey={`pf-${filterSig}`}
              >
                <CountUp to={m.profitFactor} decimals={2} />
              </KpiStripCell>
            </div>
          </div>

          {/* ============ WIN/LOSS + RISK/QUALITY 2-CARD ROW (3:4 ratio) ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
            {/* Win/loss card — 3×2 grid. */}
            <SectionCard
              eyebrow={lang === "es" ? "Ganadoras vs perdedoras" : "Winners vs losers"}
              className="lg:col-span-3"
            >
              <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                <RatioCell label={t("avgWin")}>
                  <Money value={m.avgWin} sign colorizeSign tone="pos" decimals={0} />
                </RatioCell>
                <RatioCell label={t("avgLoss")}>
                  <Money value={m.avgLoss} sign colorizeSign tone="neg" decimals={0} />
                </RatioCell>
                <RatioCell
                  label={t("payoff")}
                  hint={desc("Ganancia media / pérdida media", "Avg win / avg loss")}
                >
                  <span className={m.payoff >= 1 ? "text-pnl-pos" : "text-pnl-warn"}>
                    {fmtNum(m.payoff, lang, 2)}
                  </span>
                </RatioCell>

                <RatioCell label={t("largestWin")}>
                  <Money value={m.largestWin} sign colorizeSign tone="pos" decimals={0} />
                </RatioCell>
                <RatioCell label={t("largestLoss")}>
                  <Money value={m.largestLoss} sign colorizeSign tone="neg" decimals={0} />
                </RatioCell>
                <RatioCell label={t("expectancyR")}>
                  <span className={m.expectancyR >= 0 ? "text-pnl-pos" : "text-pnl-neg"}>
                    {m.expectancyR >= 0 ? "+" : "−"}
                    {fmtNum(Math.abs(m.expectancyR), lang, 2)}R
                  </span>
                </RatioCell>
              </div>
            </SectionCard>

            {/* Risk/quality card — 4×3 grid. */}
            <SectionCard
              eyebrow={lang === "es" ? "Riesgo, calidad y rachas" : "Risk, quality & streaks"}
              className="lg:col-span-4"
              hint={
                shortSample ? (
                  <Chip variant="warn" className="text-[10px]">
                    ⚠ {t("sampleShort")}
                  </Chip>
                ) : null
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
                <RatioCell label={t("maxDrawdown")}>
                  <Money value={m.maxDrawdown} sign colorizeSign tone="neg" decimals={0} />
                </RatioCell>
                <RatioCell label={t("maxDrawdownPct")}>
                  <span className="text-pnl-warn">
                    {fmtPct(m.maxDrawdownPct, lang, 1)}
                  </span>
                </RatioCell>
                <RatioCell
                  label={t("sharpe")}
                  hint={desc("Retorno medio / desviación estándar", "Mean return / std dev")}
                >
                  <span className={m.sharpe >= 0 ? "text-pnl-pos" : "text-pnl-neg"}>
                    {fmtNum(m.sharpe, lang, 2)}
                  </span>
                </RatioCell>
                <RatioCell
                  label={t("sortino")}
                  hint={desc("Sharpe pero solo penaliza la baja", "Sharpe but only downside")}
                >
                  <span className={m.sortino >= 0 ? "text-pnl-pos" : "text-pnl-neg"}>
                    {fmtNum(m.sortino, lang, 2)}
                  </span>
                </RatioCell>

                <RatioCell
                  label={t("calmar")}
                  hint={desc("Retorno anualizado / max DD", "Annual return / max DD")}
                >
                  <span className={m.calmar >= 0 ? "text-pnl-pos" : "text-pnl-neg"}>
                    {fmtNum(m.calmar, lang, 2)}
                  </span>
                </RatioCell>
                <RatioCell
                  label={t("recoveryFactor")}
                  hint={desc("P&L neto / max DD", "Net P&L / max DD")}
                >
                  <span className={m.recoveryFactor >= 1 ? "text-pnl-pos" : "text-pnl-warn"}>
                    {fmtNum(m.recoveryFactor, lang, 2)}
                  </span>
                </RatioCell>
                <RatioCell
                  label="SQN"
                  hint={desc("System Quality Number", "System Quality Number")}
                >
                  <span className={adv.sqn >= 1.6 ? "text-pnl-pos" : "text-pnl-warn"}>
                    {fmtNum(adv.sqn, lang, 2)}
                  </span>
                </RatioCell>
                <RatioCell label={lang === "es" ? "Racha" : "Streak"}>
                  <span className="tnum">
                    <span className="text-pnl-pos">{m.maxWinStreak}</span>
                    <span className="text-tertiary"> / </span>
                    <span className="text-pnl-neg">{m.maxLossStreak}</span>
                  </span>
                </RatioCell>

                <RatioCell
                  label={lang === "es" ? "Úlcer" : "Ulcer"}
                  hint={desc("Índice de Úlcera (Peter Martin)", "Ulcer Index (Peter Martin)")}
                >
                  <span className="text-pnl-warn">
                    {fmtNum(adv.ulcer, lang, 2)}
                  </span>
                </RatioCell>
                <RatioCell
                  label="CAGR"
                  hint={desc("Tasa anualizada time-weighted", "Time-weighted annualized return")}
                >
                  <span className={adv.cagr >= 0 ? "text-pnl-pos" : "text-pnl-neg"}>
                    {adv.cagr >= 0 ? "+" : "−"}
                    {fmtNum(Math.abs(adv.cagr), lang, 1)}%
                  </span>
                </RatioCell>
              </div>
            </SectionCard>
          </div>

          {/* ============ EDGE CARD — verdict + CI intervals ============ */}
          <SectionCard
            eyebrow={lang === "es" ? "¿Ventaja real o suerte?" : "Real edge or luck?"}
          >
            <div className="space-y-4">
              {/* Verdict row — LED + label + p-value pill. */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="relative inline-flex items-center justify-center">
                  {/* Verdict LED — larger + with a soft pulsing glow so the
                      verdict reads as the card's focal point. Mirrors the
                      real app's verdict Ellipse with a subtle glow halo. */}
                  <span
                    aria-hidden
                    className={`absolute -inset-1.5 rounded-full blur-md ${verdictLedClass} opacity-40`}
                  />
                  <motion.span
                    animate={{ opacity: [1, 0.65, 1] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`relative inline-block w-4 h-4 rounded-full ${verdictLedClass} ring-2 ring-white/10`}
                    aria-hidden="true"
                  />
                </span>
                <span className={`text-base font-semibold ${verdictTextClass}`}>
                  {lang === "es" && edge.verdict === "Edge confirmado"
                    ? "Edge confirmado"
                    : lang === "es" && edge.verdict === "Sugerente"
                    ? "Sugerente"
                    : lang === "es" && edge.verdict === "Sin edge"
                    ? "Sin edge"
                    : lang === "es"
                    ? "Inconcluso"
                    : edge.verdict}
                </span>
                <span className="pill text-[11px] bg-[rgb(var(--divider)/0.08)] text-tertiary border border-[rgb(var(--divider)/0.12)]">
                  <span>p =</span>
                  <span className="tnum">{fmtNum(edge.pValue, lang, 3)}</span>
                </span>
              </div>

              {/* Hint sentence. */}
              <p className="text-sm text-secondary leading-relaxed max-w-3xl">
                {edge.verdict === "Inconclusive"
                  ? lang === "es"
                    ? "Necesitas al menos 30 operaciones para emitir un veredicto con confianza estadística."
                    : "You need at least 30 trades to issue a statistically confident verdict."
                  : edge.hint}
              </p>

              {/* 4 intervals grid. */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="flex flex-col gap-1 items-center text-center">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                    {t("winRate")}
                  </span>
                  <span className="font-semibold tnum text-primary text-lg">
                    {fmtPct(edge.winRate, lang, 0)}
                  </span>
                  <span className="text-[10px] text-tertiary tnum">
                    {edge.winRateCi}
                  </span>
                </div>
                <div className="flex flex-col gap-1 items-center text-center">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                    {t("expectancyR")}
                  </span>
                  <span className={`font-semibold tnum text-lg ${edge.expectancyR >= 0 ? "text-pnl-pos" : "text-pnl-neg"}`}>
                    {edge.expectancyR >= 0 ? "+" : "−"}
                    {fmtNum(Math.abs(edge.expectancyR), lang, 2)}R
                  </span>
                  <span className="text-[10px] text-tertiary tnum">
                    {edge.expectancyRCi}
                  </span>
                </div>
                <div className="flex flex-col gap-1 items-center text-center">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                    {t("profitFactor")}
                  </span>
                  <span className={`font-semibold tnum text-lg ${edge.profitFactor >= 1 ? "text-pnl-pos" : "text-pnl-neg"}`}>
                    {fmtNum(edge.profitFactor, lang, 2)}
                  </span>
                  <span className="text-[10px] text-tertiary tnum">
                    {edge.profitFactorCi}
                  </span>
                </div>
                <div className="flex flex-col gap-1 items-center text-center">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                    {lang === "es" ? "Ops necesarias" : "Trades needed"}
                  </span>
                  <span className="font-semibold tnum text-primary text-lg">
                    {edge.tradesNeeded > 0 ? fmtInt(edge.tradesNeeded, lang) : "—"}
                  </span>
                  <span className="text-[10px] text-tertiary">
                    {lang === "es" ? "para estrechar el IC" : "to tighten CI"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ============ EQUITY CURVE + EQUITY QUALITY (2:1) ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SectionCard
              eyebrow={lang === "es" ? "Curva de rendimiento" : "Equity curve"}
              className="lg:col-span-2"
            >
              <EquityCurve metrics={m} height={320} showDrawdown />
            </SectionCard>
            <SectionCard
              eyebrow={lang === "es" ? "Calidad de la curva" : "Curve quality"}
              className="lg:col-span-1"
            >
              <p className="text-[11px] text-tertiary leading-relaxed mb-4">
                {desc(
                  "R² = cuánta escalera hay en el dibujo; K-Ratio = pendiente alta y estable; pendiente = € por operación según el ajuste.",
                  "R² = how much staircase is in the chart; K-Ratio = high & stable slope; slope = € per trade from the fit."
                )}
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5 rounded-md p-2 -mx-2 transition-colors hover:bg-white/[0.03]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                      R²
                    </span>
                    <span className="text-[10px] text-tertiary tnum">
                      {lang === "es" ? "bondad del ajuste" : "goodness of fit"}
                    </span>
                  </div>
                  <div className="font-semibold tnum text-primary text-2xl leading-none">
                    {fmtNum(equityQ.r2, lang, 3)}
                  </div>
                </div>
                <div className="h-px bg-[rgb(var(--divider)/0.18)]" />
                <div className="space-y-1.5 rounded-md p-2 -mx-2 transition-colors hover:bg-white/[0.03]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                      K-Ratio
                    </span>
                    <span className="text-[10px] text-tertiary tnum">
                      {lang === "es" ? "pendiente / error" : "slope / error"}
                    </span>
                  </div>
                  <div className="font-semibold tnum text-primary text-2xl leading-none">
                    {fmtNum(equityQ.kRatio, lang, 2)}
                  </div>
                </div>
                <div className="h-px bg-[rgb(var(--divider)/0.18)]" />
                <div className="space-y-1.5 rounded-md p-2 -mx-2 transition-colors hover:bg-white/[0.03]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
                      {lang === "es" ? "Pendiente" : "Slope"}
                    </span>
                    <span className="text-[10px] text-tertiary tnum">
                      {lang === "es" ? "€ / operación" : "$ / trade"}
                    </span>
                  </div>
                  <div className="font-semibold tnum text-2xl leading-none">
                    <Money value={equityQ.slope} sign colorizeSign decimals={0} />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ============ WINNERS DONUT + R-OVER-TIME ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SectionCard
              eyebrow={t("winnersVsLosers")}
              className="lg:col-span-1"
            >
              <div className="flex flex-col items-center gap-4 py-2">
                <WinnersDonut wins={m.wins} losses={m.losses} reKey={filterSig} />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: "rgb(var(--pnl-pos))" }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-tertiary">
                      {lang === "es" ? "Ganadoras" : "Winners"}{" "}
                      <span className="text-secondary tnum font-medium">
                        {fmtInt(m.wins, lang)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: "rgb(var(--pnl-neg))" }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-tertiary">
                      {lang === "es" ? "Perdedoras" : "Losers"}{" "}
                      <span className="text-secondary tnum font-medium">
                        {fmtInt(m.losses, lang)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow={t("rOverTime")}
              className="lg:col-span-2"
            >
              <ROverTimeChart trades={filteredTrades} />
              <div className="flex items-center justify-between mt-2 text-[10px] text-tertiary">
                <span>
                  {lang === "es" ? "Primera operación" : "First trade"} →{" "}
                  {lang === "es" ? "Última" : "Last"}
                </span>
                <span>
                  {lang === "es" ? "Cada barra = R de una operación" : "Each bar = one trade R"}
                </span>
              </div>
            </SectionCard>
          </div>

          {/* ============ DISTRIBUTIONS (3 cards) ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SectionCard eyebrow={t("rDistribution")}>
              <Histogram
                data={rHist}
                height={140}
                colorize="pos-neg"
                formatX={(x) => `${x}R`}
              />
              <HistogramLegend
                kind="pos-neg"
                total={filteredTrades.length}
                symbol="R"
              />
            </SectionCard>
            <SectionCard eyebrow={t("pnlDistribution")}>
              <Histogram
                data={pnlHist}
                height={140}
                colorize="pos-neg"
                formatX={(x) => compactMoney(Number(x))}
              />
              <HistogramLegend
                kind="pos-neg"
                total={filteredTrades.length}
                symbol="$"
              />
            </SectionCard>
            <SectionCard eyebrow={t("durationDistribution")}>
              <Histogram
                data={durHist.map((d) => ({ x: d.label, count: d.count }))}
                height={140}
                colorize="accent"
                formatX={(x) => String(x)}
              />
              <HistogramLegend
                kind="accent"
                total={filteredTrades.length}
                symbol=""
              />
            </SectionCard>
          </div>

          {/* ============ WEEKDAY + MONTH ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard eyebrow={t("pnlByWeekday")}>
              <WeekdayBars trades={filteredTrades} />
            </SectionCard>
            <SectionCard eyebrow={t("pnlByMonth")}>
              <MonthlyBars trades={filteredTrades} />
            </SectionCard>
          </div>

          {/* ============ HEATMAP + LEGEND ============ */}
          <SectionCard
            eyebrow={t("heatmapTitle")}
            hint={
              <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary tnum">
                {lang === "es" ? "Lun–Vie × 4h" : "Mon–Fri × 4h"}
              </span>
            }
          >
            <Heatmap trades={filteredTrades} />
            <HeatmapLegend trades={filteredTrades} />
          </SectionCard>

          {/* ============ RANKINGS ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RankingCard
              title={t("setupsByExpectancy")}
              rows={setupRanks}
              reKey={`setup-${filterSig}`}
            />
            <RankingCard
              title={t("instrumentsByExpectancy")}
              rows={instRanks}
              reKey={`inst-${filterSig}`}
            />
          </div>
        </>
      )}

      {/* Footer spacer. */}
      <div className="h-2" aria-hidden="true" />
    </div>
  );
}
