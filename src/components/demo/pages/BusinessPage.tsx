"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  METRICS,
  monthlyBreakdown,
  INITIAL_BALANCE_CONST,
} from "@/lib/trading/data";
import { fmtMoney, fmtPct, fmtInt } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";

/* ============================================================
 * R25-1a — BusinessPage
 *
 * Mirrors the real app's "Negocio" tab (NavigationView tag "business"
 * in MainWindow.xaml L212-214). In the real app this page is the
 * trader's business-of-one dashboard: trading as a business — monthly
 * net, quarterly net, operating margin (after estimated costs), profit
 * consistency, and a month-by-month P&L bar chart. The demo derives
 * all numbers from the existing deterministic TRADES data so they're
 * consistent with the rest of the demo and read as substantive
 * rather than a "coming soon" stub.
 *
 * Layout (mirrors the other demo pages):
 *   - Sticky header: eyebrow + title + description + health chips.
 *   - 4 KPI cards: monthly net avg, quarterly net, ROI %, consistency.
 *   - Monthly P&L bar chart (CSS bars — no canvas, lightweight).
 *   - Operating-cost note explaining the margin model.
 * ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;
// Fictional operating cost (platform fees, data feeds, software) used
// purely for the demo's operating-margin calculation. Clearly labelled
// as an estimate so it doesn't read as actual cost data.
const MONTHLY_OPERATING_COST = 75; // USD / month

function KPICard({
  label,
  hint,
  children,
  delay = 0,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} y={10}>
      <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
            {label}
          </div>
          {hint && (
            <span className="text-[10px] text-tertiary opacity-70">{hint}</span>
          )}
        </div>
        {children}
      </div>
    </Reveal>
  );
}

export function BusinessPage() {
  const { lang } = useLang();
  const es = lang === "es";

  const monthly = useMemo(() => monthlyBreakdown(TRADES), []);

  const {
    monthsTraded,
    monthlyAvgNet,
    quarterlyNet,
    operatingCostsTotal,
    netAfterCosts,
    consistencyPct,
    bestMonth,
  } = useMemo(() => {
    const mCount = monthly.length;
    const total = monthly.reduce((s, m) => s + m.pnl, 0);
    const avg = mCount ? total / mCount : 0;
    // Last ~3 months as "this quarter" (deterministic from sample data).
    const quarter = monthly.slice(-3).reduce((s, m) => s + m.pnl, 0);
    const opCosts = mCount * MONTHLY_OPERATING_COST;
    const net = total - opCosts;
    // Consistency: % of months that were profitable.
    const profitableMonths = monthly.filter((m) => m.pnl > 0).length;
    const consistency = mCount ? profitableMonths / mCount : 0;
    const best = monthly.reduce(
      (b, m) => (m.pnl > b.pnl ? m : b),
      monthly[0] ?? { month: "—", pnl: 0 }
    );
    return {
      monthsTraded: mCount,
      monthlyAvgNet: avg,
      quarterlyNet: quarter,
      operatingCostsTotal: opCosts,
      netAfterCosts: net,
      consistencyPct: consistency,
      bestMonth: best,
    };
  }, [monthly]);

  const roiPct = METRICS.roiPct;
  // Max abs month P&L — used to scale the bar chart heights.
  const maxAbs = useMemo(
    () =>
      Math.max(
        1,
        ...monthly.map((m) => Math.abs(m.pnl))
      ),
    [monthly]
  );

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* ---------- Header ---------- */}
      <Reveal>
        <div className="space-y-3">
          <Eyebrow>{es ? "Empresa" : "Business"}</Eyebrow>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-primary">
              {es ? "Negocio" : "Business"}
            </h2>
            <Chip
              variant={netAfterCosts >= 0 ? "pos" : "neg"}
            >
              {netAfterCosts >= 0
                ? es
                  ? "Rentable después de costes"
                  : "Profitable after costs"
                : es
                ? "En pérdida después de costes"
                : "Loss-making after costs"}
            </Chip>
          </div>
          <p className="text-sm text-secondary leading-relaxed max-w-2xl">
            {es
              ? "Tu operativa como negocio: neto mensual, neto trimestral, ROI sobre el capital inicial y consistencia. Los costes operativos estimados (plataforma, datos, software) se restan del P&L bruto para mostrar el margen real."
              : "Your trading as a business: monthly net, quarterly net, ROI on starting capital and consistency. Estimated operating costs (platform, data, software) are subtracted from gross P&L to show the true margin."}
          </p>
        </div>
      </Reveal>

      {/* ---------- Summary KPIs ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label={es ? "Neto mensual medio" : "Avg. monthly net"}
          delay={0.02}
        >
          <CountUp
            to={monthlyAvgNet}
            decimals={0}
            duration={1.2}
            prefix={monthlyAvgNet >= 0 ? "+" : "−"}
            className={`text-xl md:text-2xl font-semibold tnum ${
              monthlyAvgNet >= 0 ? "text-pnl-pos" : "text-pnl-neg"
            }`}
          />
        </KPICard>
        <KPICard
          label={es ? "Neto trimestral" : "Quarterly net"}
          hint={es ? "Últimos 3 meses" : "Last 3 months"}
          delay={0.04}
        >
          <CountUp
            to={quarterlyNet}
            decimals={0}
            duration={1.2}
            prefix={quarterlyNet >= 0 ? "+" : "−"}
            className={`text-xl md:text-2xl font-semibold tnum ${
              quarterlyNet >= 0 ? "text-pnl-pos" : "text-pnl-neg"
            }`}
          />
        </KPICard>
        <KPICard
          label={es ? "ROI" : "ROI"}
          hint={es ? "s/ capital inicial" : "on starting capital"}
          delay={0.06}
        >
          <CountUp
            to={roiPct}
            decimals={1}
            suffix="%"
            duration={1.2}
            prefix={roiPct >= 0 ? "+" : "−"}
            className={`text-xl md:text-2xl font-semibold tnum ${
              roiPct >= 0 ? "text-pnl-pos" : "text-pnl-neg"
            }`}
          />
        </KPICard>
        <KPICard
          label={es ? "Consistencia" : "Consistency"}
          hint={es ? "meses rentables" : "profitable months"}
          delay={0.08}
        >
          <CountUp
            to={consistencyPct}
            decimals={0}
            suffix="%"
            duration={1.2}
            tone={consistencyPct >= 0.5 ? "pos" : "neg"}
            className={`text-xl md:text-2xl font-semibold tnum ${
              consistencyPct >= 0.5 ? "text-pnl-pos" : "text-pnl-neg"
            }`}
          />
        </KPICard>
      </div>

      {/* ---------- Monthly P&L bar chart ---------- */}
      <Reveal delay={0.1}>
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
              {es ? "P&L por mes" : "P&L by month"}
            </div>
            <Chip variant="neutral">
              {es ? `${monthsTraded} meses` : `${monthsTraded} months`}
            </Chip>
          </div>
          {/* Bars — flex row with each bar proportional to |pnl|. Zero-line
              sits at the vertical midpoint so positive bars grow up and
              negative bars grow down from the same axis. */}
          <div className="relative h-44 flex items-stretch gap-2">
            {/* Zero axis line */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-1/2 h-px bg-white/10"
            />
            {monthly.map((m, i) => {
              const heightPct = (Math.abs(m.pnl) / maxAbs) * 50; // 50% max half-height
              const positive = m.pnl >= 0;
              return (
                <motion.div
                  key={m.month}
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    ease: EASE,
                    delay: i * 0.05,
                  }}
                  style={{ transformOrigin: positive ? "bottom" : "top" }}
                  className="relative flex-1 flex flex-col items-center justify-center group"
                >
                  <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
                    <div className="flex-1 flex flex-col justify-end">
                      {positive && (
                        <div
                          className="w-full rounded-t-sm bg-pnl-pos/70 group-hover:bg-pnl-pos/90 transition-colors"
                          style={{ height: `${heightPct * 2}%` }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-start">
                      {!positive && (
                        <div
                          className="w-full rounded-b-sm bg-pnl-neg/70 group-hover:bg-pnl-neg/90 transition-colors"
                          style={{ height: `${heightPct * 2}%` }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                  {/* Hover tooltip */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] tnum text-primary whitespace-nowrap pointer-events-none z-10">
                    {fmtMoney(m.pnl, lang, { sign: true, decimals: 0 })}
                  </div>
                  {/* Month label */}
                  <div className="absolute -bottom-5 left-0 right-0 text-center text-[10px] text-tertiary">
                    {m.month}
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* Spacer for month labels */}
          <div className="h-5" />
        </div>
      </Reveal>

      {/* ---------- Operating costs + after-costs summary ---------- */}
      <div className="grid md:grid-cols-3 gap-3">
        <Reveal delay={0.12}>
          <div className="liquid-glass rounded-card p-5 h-full">
            <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-2">
              {es ? "P&L bruto" : "Gross P&L"}
            </div>
            <div
              className={`text-xl md:text-2xl font-semibold tnum mb-1 ${
                METRICS.netPnl >= 0 ? "text-pnl-pos" : "text-pnl-neg"
              }`}
            >
              {fmtMoney(METRICS.netPnl, lang, { sign: true, decimals: 0 })}
            </div>
            <div className="text-xs text-tertiary tnum">
              {es ? "Antes de costes operativos" : "Before operating costs"}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="liquid-glass rounded-card p-5 h-full">
            <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-2">
              {es ? "Costes operativos" : "Operating costs"}
            </div>
            <div className="text-xl md:text-2xl font-semibold tnum text-primary mb-1">
              −{fmtMoney(operatingCostsTotal, lang, { decimals: 0 })}
            </div>
            <div className="text-xs text-tertiary tnum">
              {es
                ? `${fmtMoney(MONTHLY_OPERATING_COST, lang, { decimals: 0 })}/mes · ${monthsTraded} meses`
                : `${fmtMoney(MONTHLY_OPERATING_COST, lang, { decimals: 0 })}/mo · ${monthsTraded} months`}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="liquid-glass rounded-card p-5 h-full">
            <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-2">
              {es ? "Margen neto" : "Net margin"}
            </div>
            <div
              className={`text-xl md:text-2xl font-semibold tnum mb-1 ${
                netAfterCosts >= 0 ? "text-pnl-pos" : "text-pnl-neg"
              }`}
            >
              {fmtMoney(netAfterCosts, lang, { sign: true, decimals: 0 })}
            </div>
            <div className="text-xs text-tertiary tnum">
              {es ? "Después de costes" : "After costs"} ·{" "}
              <span className="text-secondary">
                {fmtPct(
                  METRICS.netPnl !== 0
                    ? netAfterCosts / Math.abs(METRICS.netPnl)
                    : 0,
                  lang,
                  0
                )}
              </span>{" "}
              {es ? "del bruto" : "of gross"}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ---------- Capital + balance row ---------- */}
      <Reveal delay={0.18}>
        <div className="liquid-glass rounded-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md grid place-items-center bg-white/5 text-primary shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8h18v12H3zM8 8V5a2 2 0 012-2h4a2 2 0 012 2v3M3 13h18" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
                {es ? "Capital inicial → balance final" : "Starting capital → final balance"}
              </div>
              <div className="text-sm tnum text-secondary mt-0.5">
                <span className="text-tertiary">
                  {fmtMoney(INITIAL_BALANCE_CONST, lang, { decimals: 0 })}
                </span>{" "}
                <span className="text-tertiary">→</span>{" "}
                <span className="text-primary font-medium">
                  {fmtMoney(METRICS.finalBalance, lang, { decimals: 0 })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Chip variant="neutral">
              {es ? "Mejor mes: " : "Best month: "}
              {bestMonth.month}{" "}
              <span className="text-pnl-pos tnum">
                +{fmtMoney(Math.abs(bestMonth.pnl), lang, { decimals: 0 })}
              </span>
            </Chip>
            <Chip variant="neutral">
              {es ? `${fmtInt(TRADES.length, lang)} operaciones` : `${fmtInt(TRADES.length, lang)} trades`}
            </Chip>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
