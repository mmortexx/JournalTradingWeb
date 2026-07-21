"use client";

import { useMemo, type ReactNode } from "react";
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
import { useDemo } from "@/components/demo/DemoContext";

/* ============================================================
 * Small primitives
 * ============================================================ */

type FilterGroup = "instrument" | "setup" | "direction" | "compliance";

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

function SectionCard({
  title,
  hint,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-[13px] font-medium text-primary tracking-[-0.01em]">
            {title}
          </h3>
          {hint}
        </div>
        {children}
      </div>
    </Reveal>
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

/** Animated KPI tile. `reKey` forces re-mount (and re-animation) on filter change. */
function KpiTile({
  label,
  children,
  spark,
  reKey,
}: {
  label: string;
  children: ReactNode;
  spark?: ReactNode;
  reKey: string;
}) {
  return (
    <motion.div
      key={reKey}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative rounded-card p-4 liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 overflow-hidden group h-full flex flex-col"
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent)",
        }}
      />
      <div className="text-[10px] uppercase tracking-[0.14em] text-tertiary">
        {label}
      </div>
      <div className="mt-1.5 font-bold text-2xl tnum text-primary leading-none">
        {children}
      </div>
      {spark && <div className="absolute right-2 bottom-2 opacity-60">{spark}</div>}
    </motion.div>
  );
}

/** Refined ratio tile — institutional research feel.
 *  Label (xs uppercase tracking-wide tertiary) + big value (2xl bold tnum)
 *  + small description. No sparkline (keeps the math clean + readable). */
function RatioTile({
  label,
  value,
  desc,
  reKey,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  desc: string;
  reKey: string;
  delay?: number;
}) {
  return (
    <motion.div
      key={reKey}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 22 } }}
      className="relative rounded-card p-4 liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 h-full flex flex-col overflow-hidden group"
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.45), transparent)",
        }}
      />
      <div className="text-xs uppercase tracking-[0.14em] text-tertiary">
        {label}
      </div>
      <div className="mt-1.5 font-bold text-2xl tnum text-primary leading-none">
        {value}
      </div>
      <div className="mt-auto pt-3 text-[11px] text-tertiary/80 leading-snug">
        {desc}
      </div>
    </motion.div>
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
        {/* loss background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgb(var(--pnl-neg) / 0.22)"
          strokeWidth={12}
        />
        {/* win arc — draws in on first scroll-into-view */}
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
 * R-multiple over time — animated scatter / bar
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
        {/* baseline */}
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
 * Heatmap legend — diverging red→neutral→green color scale
 * with min/zero/max labels. Sits below the Heatmap inside the
 * SectionCard so the chart component stays self-contained.
 * ============================================================ */
function HeatmapLegend({ trades }: { trades: Trade[] }) {
  const { lang } = useLang();
  // Mirror the Heatmap component's own per-cell maxAbs so the legend
  // color scale stays visually consistent with the rendered cells.
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

  // Build a 9-step diverging gradient swatch.
  const swatches = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8; // 0..1
    const intensity = Math.abs(t - 0.5) * 2; // 0 at center, 1 at edges
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
 * Histogram legend — small inline key below each Histogram card.
 * Mirrors the HeatmapLegend pattern so every distribution card has
 * the same header + legend rhythm (per spec). Two modes:
 *   - "pos-neg": red swatch + "−X" label, green swatch + "+X" label
 *   - "accent":  single gold swatch + count-of-trades label
 * Sits inside the SectionCard after the Histogram component so the
 * chart itself stays self-contained.
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
 * Main page
 * ============================================================ */
export function AnalyticsPage() {
  const { t, lang } = useLang();
  const { filters, setFilters, clearFilters } = useDemo();

  // Filtered trades — single source of truth for every metric below.
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

  // Pre-compute all derived analytics once per filter change.
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

  // Signature so CountUps / rankings re-animate on filter change.
  const filterSig = `${filters.instrument}|${filters.setup}|${filters.direction}|${filters.compliance}`;

  // Sparkline source: last 8 trades' net P&L (chronological).
  const sparkPnl = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime())
      .slice(-8)
      .map((tr) => tr.netPnl);
  }, [filteredTrades]);
  // Sparkline source: last 8 R-multiples.
  const sparkR = useMemo(() => {
    return [...filteredTrades]
      .sort((a, b) => a.closedAt.getTime() - b.closedAt.getTime())
      .slice(-8)
      .map((tr) => tr.rMultiple);
  }, [filteredTrades]);
  // Sparkline source: equity curve tail.
  const sparkEquity = useMemo(() => {
    return m.equityCurve.slice(-8).map((e) => e.balance);
  }, [m.equityCurve]);

  const filterActive =
    filters.instrument !== "all" ||
    filters.setup !== "all" ||
    filters.direction !== "all" ||
    filters.compliance !== "all";

  const shortSample = m.closedCount < 30;

  // Compact money format for axis labels.
  const compactMoney = (v: number) =>
    fmtMoney(v, lang, { compact: true, decimals: 0 });

  // Bilingual ratio descriptions.
  const desc = (es: string, en: string) => (lang === "es" ? es : en);

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* ============ STICKY FILTER BAR ============ */}
      <div
        className="sticky top-0 z-10 -mx-5 md:-mx-6 -mt-5 md:-mt-6 px-5 md:px-6 pt-5 md:pt-6 pb-3 backdrop-blur-md bg-[rgb(var(--tint)/0.75)] border-b border-white/10"
      >
        <div className="liquid-glass depth-3 hover:depth-4 transition-shadow duration-300 rounded-card p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {/* Instrument select */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
                {t("colInstrument")}
              </span>
              <div className="relative">
                <select
                  aria-label={t("colInstrument")}
                  value={filters.instrument}
                  onChange={(e) => setFilters({ instrument: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-md h-7 pl-2 pr-7 text-xs text-primary tnum focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">{t("all")}</option>
                  {INSTRUMENTS.map((inst) => (
                    <option key={inst.symbol} value={inst.symbol}>
                      {inst.symbol}
                    </option>
                  ))}
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

            {/* Setup select */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
                {t("colSetup")}
              </span>
              <div className="relative">
                <select
                  aria-label={t("colSetup")}
                  value={filters.setup}
                  onChange={(e) => setFilters({ setup: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-md h-7 pl-2 pr-7 text-xs text-primary tnum focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer max-w-[120px]"
                >
                  <option value="all">{t("all")}</option>
                  {SETUP_NAMES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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

            <span className="hidden md:inline w-px h-5 bg-white/10" aria-hidden="true" />

            {/* Direction chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary mr-0.5">
                {t("direction")}
              </span>
              {(["all", "long", "short"] as const).map((d) => (
                <FilterChip
                  key={d}
                  active={filters.direction === d}
                  onClick={() => setFilters({ direction: d })}
                  group="direction"
                  label={d === "all" ? t("all") : t(d)}
                >
                  {d === "all" ? t("all") : t(d)}
                </FilterChip>
              ))}
            </div>

            <span className="hidden md:inline w-px h-5 bg-white/10" aria-hidden="true" />

            {/* Compliance chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary mr-0.5">
                {t("compliance")}
              </span>
              <FilterChip
                active={filters.compliance === "all"}
                onClick={() => setFilters({ compliance: "all" })}
                group="compliance"
                label={t("all")}
              >
                {t("all")}
              </FilterChip>
              <FilterChip
                active={filters.compliance === "yes"}
                onClick={() => setFilters({ compliance: "yes" })}
                group="compliance"
                label={t("complied")}
              >
                {t("complied")}
              </FilterChip>
              <FilterChip
                active={filters.compliance === "no"}
                onClick={() => setFilters({ compliance: "no" })}
                group="compliance"
                label={t("notComplied")}
              >
                {t("notComplied")}
              </FilterChip>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="text-[11px] text-tertiary tnum hidden sm:block">
                {t("operations")}:{" "}
                <span className="text-secondary font-medium">
                  {fmtInt(m.closedCount, lang)}
                </span>
              </div>
              {filterActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-tertiary hover:text-secondary transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                  aria-label={t("clearFilters")}
                >
                  ✕ {t("clearFilters")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <section className="relative overflow-hidden rounded-card">
        {/* Soft static accent halo behind the eyebrow — a whisper of
            gold that anchors the section without competing with the
            title. Sits under the Reveal so it doesn't move with the
            scroll-in animation. */}
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

      {/* ============ KPI GRID — RISK & QUALITY ============ */}
      <Reveal>
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-[13px] font-medium text-primary tracking-[-0.01em]">
              {t("riskQuality")}
            </h3>
            {shortSample && (
              <Chip variant="warn" className="text-[10px]">
                ⚠ {t("sampleShort")}
              </Chip>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-fr">
            <KpiTile
              label={t("avgWin")}
              reKey={`avgWin-${filterSig}`}
              spark={<Sparkline values={sparkPnl.filter((v) => v > 0)} tone="pos" />}
            >
              <Money value={m.avgWin} colorizeSign tone="pos" decimals={0} />
            </KpiTile>
            <KpiTile
              label={t("avgLoss")}
              reKey={`avgLoss-${filterSig}`}
              spark={
                <Sparkline
                  values={sparkPnl.filter((v) => v < 0).map((v) => -v)}
                  tone="neg"
                />
              }
            >
              <Money value={m.avgLoss} colorizeSign tone="neg" decimals={0} />
            </KpiTile>
            <KpiTile
              label={t("payoff")}
              reKey={`payoff-${filterSig}`}
              spark={<Sparkline values={[1, 1.2, 1.1, 1.4, 1.3, m.payoff]} tone="neutral" />}
            >
              <span className={`tnum ${m.payoff >= 1 ? "text-pnl-pos" : "text-pnl-warn"}`}>
                {fmtNum(m.payoff, lang, 2)}
              </span>
            </KpiTile>
            <KpiTile
              label={t("expectancyR")}
              reKey={`expR-${filterSig}`}
              spark={<Sparkline values={sparkR} tone={m.expectancyR >= 0 ? "pos" : "neg"} />}
            >
              <span
                className={`tnum ${
                  m.expectancyR >= 0 ? "text-pnl-pos" : "text-pnl-neg"
                }`}
              >
                {m.expectancyR >= 0 ? "+" : "−"}
                {fmtNum(Math.abs(m.expectancyR), lang, 2)}R
              </span>
            </KpiTile>

            <KpiTile
              label={t("largestWin")}
              reKey={`lw-${filterSig}`}
              spark={<Sparkline values={sparkEquity} tone="pos" />}
            >
              <Money value={m.largestWin} colorizeSign tone="pos" decimals={0} />
            </KpiTile>
            <KpiTile
              label={t("largestLoss")}
              reKey={`ll-${filterSig}`}
              spark={<Sparkline values={sparkEquity} tone="neg" />}
            >
              <Money value={m.largestLoss} colorizeSign tone="neg" decimals={0} />
            </KpiTile>
            <KpiTile
              label={t("maxDrawdown")}
              reKey={`mdd-${filterSig}`}
              spark={
                <Sparkline
                  values={[0, -0.2, -0.4, -0.3, -0.5, -Math.min(0, m.maxDrawdown / 1000)]}
                  tone="neg"
                />
              }
            >
              <Money value={m.maxDrawdown} colorizeSign tone="neg" decimals={0} />
            </KpiTile>
            <KpiTile
              label={t("recoveryFactor")}
              reKey={`rf-${filterSig}`}
              spark={
                <Sparkline
                  values={[0.5, 1.0, 1.5, 2.0, 2.5, m.recoveryFactor]}
                  tone={m.recoveryFactor >= 1 ? "pos" : "neg"}
                />
              }
            >
              <CountUp
                to={m.recoveryFactor}
                decimals={2}
                className={m.recoveryFactor >= 1 ? "text-pnl-pos" : "text-pnl-warn"}
              />
            </KpiTile>
          </div>
        </div>
      </Reveal>

      {/* ============ RATIOS CARD — REFINED INSTITUTIONAL GRID ============ */}
      <Reveal delay={0.04}>
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h3 className="text-[13px] font-medium text-primary tracking-[-0.01em]">
                {lang === "es" ? "Ratios de rendimiento" : "Performance ratios"}
              </h3>
              <p className="text-[11px] text-tertiary mt-0.5">
                {lang === "es"
                  ? "Ratios sin dimensión para comparar estrategias"
                  : "Dimensionless ratios for strategy comparison"}
              </p>
            </div>
            {shortSample && (
              <Chip variant="warn" className="text-[10px]">
                ⚠ {t("sampleShort")}
              </Chip>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr">
            <RatioTile
              label={t("sharpe")}
              reKey={`sharpe-${filterSig}`}
              delay={0}
              value={
                <CountUp
                  to={m.sharpe}
                  decimals={2}
                  className={m.sharpe >= 0 ? "text-pnl-pos" : "text-pnl-neg"}
                />
              }
              desc={desc(
                "Retorno medio / desviación estándar",
                "Mean return / standard deviation"
              )}
            />
            <RatioTile
              label={t("sortino")}
              reKey={`sortino-${filterSig}`}
              delay={0.04}
              value={
                <CountUp
                  to={m.sortino}
                  decimals={2}
                  className={m.sortino >= 0 ? "text-pnl-pos" : "text-pnl-neg"}
                />
              }
              desc={desc(
                "Como Sharpe pero solo penaliza la volatilidad a la baja",
                "Sharpe but only penalizes downside volatility"
              )}
            />
            <RatioTile
              label={t("calmar")}
              reKey={`calmar-${filterSig}`}
              delay={0.08}
              value={
                <CountUp
                  to={m.calmar}
                  decimals={2}
                  className={m.calmar >= 0 ? "text-pnl-pos" : "text-pnl-neg"}
                />
              }
              desc={desc(
                "Retorno anualizado / max drawdown",
                "Annualized return / max drawdown"
              )}
            />
            <RatioTile
              label={t("profitFactor")}
              reKey={`pf-${filterSig}`}
              delay={0.12}
              value={
                <CountUp
                  to={m.profitFactor}
                  decimals={2}
                  className={m.profitFactor >= 1 ? "text-pnl-pos" : "text-pnl-neg"}
                />
              }
              desc={desc(
                "Ganancias brutas / pérdidas brutas",
                "Gross profit / gross loss"
              )}
            />
            <RatioTile
              label={t("expectancy")}
              reKey={`exp-${filterSig}`}
              delay={0.16}
              value={
                <Money
                  value={m.expectancy}
                  sign
                  colorizeSign
                  decimals={0}
                />
              }
              desc={desc(
                "P&L neto medio por operación",
                "Average net P&L per trade"
              )}
            />
            <RatioTile
              label={t("maxDrawdownPct")}
              reKey={`mddpct-${filterSig}`}
              delay={0.2}
              value={
                <span className="text-pnl-warn">
                  {fmtPct(m.maxDrawdownPct, lang, 1)}
                </span>
              }
              desc={desc(
                "Caída máxima desde el pico",
                "Largest drop from peak"
              )}
            />
          </div>
        </div>
      </Reveal>

      {/* ============ WINNERS vs LOSERS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title={t("winnersVsLosers")} className="lg:col-span-1">
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

        {/* R-over-time chart spans 2 cols */}
        <SectionCard
          title={t("rOverTime")}
          className="lg:col-span-2"
          delay={0.04}
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
        <SectionCard title={t("rDistribution")}>
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
        <SectionCard title={t("pnlDistribution")} delay={0.04}>
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
        <SectionCard title={t("durationDistribution")} delay={0.08}>
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
        <SectionCard title={t("pnlByWeekday")}>
          <WeekdayBars trades={filteredTrades} />
        </SectionCard>
        <SectionCard title={t("pnlByMonth")} delay={0.04}>
          <MonthlyBars trades={filteredTrades} />
        </SectionCard>
      </div>

      {/* ============ HEATMAP + LEGEND ============ */}
      <SectionCard
        title={t("heatmapTitle")}
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

      {/* Footer spacer so last card breathes inside the scroll
          container. Two-pixel tail keeps the final card's depth-3
          hover shadow from being clipped by the demo window's
          bottom edge. */}
      <div className="h-2" aria-hidden="true" />
    </div>
  );
}
