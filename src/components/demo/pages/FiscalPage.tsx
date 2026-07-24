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
import { fmtMoney, fmtPct, fmtInt, fmtDate } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";

/* ============================================================
 * R25-1a — FiscalPage
 *
 * Mirrors the real app's "Fiscal" tab (NavigationView tag "fiscal"
 * in MainWindow.xaml L209-211). In the real app this page is the
 * trader's fiscal-year tax summary: gross gains, gross losses, net
 * P&L, estimated tax liability, and a monthly breakdown table that
 * can be exported as CSV for the accountant. The demo derives all
 * numbers from the existing deterministic TRADES data so they're
 * consistent with the rest of the demo and read as substantive
 * rather than a "coming soon" stub.
 *
 * Tax model (visual only — the real app lets the user pick their
 * jurisdiction): Spain's savings-base rate (19 % / 21 % / 23 % /
 * 27 % / 28 % brackets). The demo uses a flat 19 % on positive net
 * P&L for simplicity — clearly labelled as "estimación" so it never
 * reads as actual tax advice.
 * ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;
// Spain savings-base lower bracket — flat for the demo's purposes.
const ESTIMATED_TAX_RATE = 0.19;

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

export function FiscalPage() {
  const { lang } = useLang();
  const es = lang === "es";

  const { grossWin, grossLoss, netPnl, estimatedTax, afterTax } = useMemo(() => {
    const wins = TRADES.filter((t) => t.netPnl > 0);
    const losses = TRADES.filter((t) => t.netPnl < 0);
    const gw = wins.reduce((s, t) => s + t.netPnl, 0);
    const gl = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
    const net = METRICS.netPnl;
    // Tax is only due on POSITIVE net P&L (losses offset gains first).
    const taxable = Math.max(0, net);
    const tax = taxable * ESTIMATED_TAX_RATE;
    return {
      grossWin: gw,
      grossLoss: gl,
      netPnl: net,
      estimatedTax: tax,
      afterTax: net - tax,
    };
  }, []);

  const monthly = useMemo(() => monthlyBreakdown(TRADES), []);
  const bestMonth = useMemo(
    () =>
      monthly.reduce(
        (best, m) => (m.pnl > best.pnl ? m : best),
        monthly[0] ?? { month: "—", pnl: 0 }
      ),
    [monthly]
  );
  const worstMonth = useMemo(
    () =>
      monthly.reduce(
        (worst, m) => (m.pnl < worst.pnl ? m : worst),
        monthly[0] ?? { month: "—", pnl: 0 }
      ),
    [monthly]
  );

  const fiscalYear =
    TRADES.length > 0
      ? TRADES[0].closedAt.getFullYear()
      : new Date().getFullYear();

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* ---------- Header ---------- */}
      <Reveal>
        <div className="space-y-3">
          <Eyebrow>{es ? "Hacienda" : "Tax"}</Eyebrow>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-primary">
              {es ? "Fiscal" : "Fiscal"}
            </h2>
            <Chip variant="neutral">
              {es ? `Ejercicio ${fiscalYear}` : `Fiscal year ${fiscalYear}`}
            </Chip>
          </div>
          <p className="text-sm text-secondary leading-relaxed max-w-2xl">
            {es
              ? "Resumen fiscal de tu operativa: ganancias y pérdidas brutas, P&L neto y estimación de la base del ahorro. Exportable a CSV para tu asesor."
              : "Tax summary of your trading: gross gains and losses, net P&L and savings-base estimate. Exportable to CSV for your accountant."}
          </p>
        </div>
      </Reveal>

      {/* ---------- Summary KPIs ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label={es ? "Ganancias brutas" : "Gross gains"}
          delay={0.02}
        >
          <CountUp
            to={grossWin}
            decimals={0}
            duration={1.2}
            prefix={es ? "+" : "+"}
            className="text-xl md:text-2xl font-semibold tnum text-pnl-pos"
          />
        </KPICard>
        <KPICard
          label={es ? "Pérdidas brutas" : "Gross losses"}
          delay={0.04}
        >
          <CountUp
            to={grossLoss}
            decimals={0}
            duration={1.2}
            prefix="−"
            className="text-xl md:text-2xl font-semibold tnum text-pnl-neg"
          />
        </KPICard>
        <KPICard
          label={es ? "P&L neto" : "Net P&L"}
          delay={0.06}
        >
          <CountUp
            to={netPnl}
            decimals={0}
            duration={1.2}
            className={`text-xl md:text-2xl font-semibold tnum ${
              netPnl >= 0 ? "text-pnl-pos" : "text-pnl-neg"
            }`}
          />
        </KPICard>
        <KPICard
          label={es ? "Estimación IRPF" : "Tax estimate"}
          hint={`${(ESTIMATED_TAX_RATE * 100).toFixed(0)} %`}
          delay={0.08}
        >
          <CountUp
            to={estimatedTax}
            decimals={0}
            duration={1.2}
            className="text-xl md:text-2xl font-semibold tnum text-primary"
          />
        </KPICard>
      </div>

      {/* ---------- Monthly breakdown table ---------- */}
      <Reveal delay={0.1}>
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
              {es ? "Desglose mensual" : "Monthly breakdown"}
            </div>
            <div className="flex items-center gap-2">
              <Chip variant="pos">
                {es ? "Mejor: " : "Best: "}
                {bestMonth.month}
              </Chip>
              <Chip variant="neg">
                {es ? "Peor: " : "Worst: "}
                {worstMonth.month}
              </Chip>
            </div>
          </div>
          {/* Column header */}
          <div className="hidden md:grid grid-cols-[0.8fr_1fr_0.8fr_1fr] gap-3 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-tertiary border-b border-white/5">
            <span>{es ? "Mes" : "Month"}</span>
            <span className="text-right">{es ? "P&L" : "P&L"}</span>
            <span className="text-right">{es ? "Operaciones" : "Trades"}</span>
            <span className="text-right">{es ? "Acumulado" : "Cumulative"}</span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-white/5">
            {(() => {
              const monthsEs = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
              // Pre-compute the cumulative balance per month using reduce
              // (no reassignment across the inner map callback, satisfies
              // react-hooks/immutability).
              const cumulativeByMonth = monthly.reduce<number[]>(
                (acc, m) => {
                  const prev = acc.length ? acc[acc.length - 1]! : INITIAL_BALANCE_CONST;
                  acc.push(prev + m.pnl);
                  return acc;
                },
                []
              );
              return monthly.map((m, i) => {
                const cumulative = cumulativeByMonth[i] ?? INITIAL_BALANCE_CONST;
                // Trades count per month — match by month name → index.
                const count = TRADES.filter(
                  (tr) => monthsEs.indexOf(m.month) === tr.closedAt.getMonth()
                ).length;
                const pct = bestMonth.pnl !== 0
                  ? (m.pnl / Math.abs(bestMonth.pnl)) * 100
                  : 0;
                return (
                  <motion.div
                    key={m.month}
                    initial={{ opacity: 0, y: 4 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.28, ease: EASE, delay: i * 0.025 }}
                    className="md:grid md:grid-cols-[0.8fr_1fr_0.8fr_1fr] md:gap-3 md:items-center px-4 py-2.5 hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Month */}
                    <div className="text-sm font-medium text-primary mb-1 md:mb-0">
                      {m.month}
                    </div>
                    {/* P&L with mini bar */}
                    <div className="flex items-center md:justify-end gap-2 mb-1 md:mb-0">
                      <div
                        className="hidden md:block h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.abs(pct))}%`,
                          background:
                            m.pnl >= 0
                              ? "rgb(var(--pnl-pos))"
                              : "rgb(var(--pnl-neg))",
                          opacity: 0.6,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm tnum font-medium ${
                          m.pnl >= 0 ? "text-pnl-pos" : "text-pnl-neg"
                        }`}
                      >
                        {fmtMoney(m.pnl, lang, { sign: true, decimals: 0 })}
                      </span>
                    </div>
                    {/* Trades count */}
                    <div className="text-right text-sm tnum text-secondary mb-1 md:mb-0">
                      <span className="text-[10px] uppercase tracking-wider text-tertiary md:hidden">
                        {es ? "Ops " : "Trd "}
                      </span>
                      {fmtInt(count, lang)}
                    </div>
                    {/* Cumulative */}
                    <div className="text-right text-sm tnum text-secondary">
                      <span className="text-[10px] uppercase tracking-wider text-tertiary md:hidden">
                        {es ? "Acum " : "Cum "}
                      </span>
                      {fmtMoney(cumulative, lang, { decimals: 0 })}
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
          {/* Footer totals */}
          <div className="grid grid-cols-[0.8fr_1fr_0.8fr_1fr] gap-3 px-4 py-3 border-t border-white/10 bg-white/[0.02] text-sm">
            <span className="font-medium text-primary">
              {es ? "Total" : "Total"}
            </span>
            <span
              className={`text-right tnum font-medium ${
                netPnl >= 0 ? "text-pnl-pos" : "text-pnl-neg"
              }`}
            >
              {fmtMoney(netPnl, lang, { sign: true, decimals: 0 })}
            </span>
            <span className="text-right tnum text-secondary">
              {fmtInt(TRADES.length, lang)}
            </span>
            <span className="text-right tnum text-secondary">
              {fmtMoney(METRICS.finalBalance, lang, { decimals: 0 })}
            </span>
          </div>
        </div>
      </Reveal>

      {/* ---------- After-tax + disclaimer ---------- */}
      <div className="grid md:grid-cols-2 gap-3">
        <Reveal delay={0.12}>
          <div className="liquid-glass rounded-card p-5 h-full">
            <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-2">
              {es ? "Después de impuestos (est.)" : "After tax (est.)"}
            </div>
            <div className="text-2xl md:text-3xl font-semibold tnum text-primary mb-1">
              {fmtMoney(afterTax, lang, { decimals: 0 })}
            </div>
            <div className="text-xs text-tertiary tnum">
              {es ? "Base imponible" : "Taxable base"}:{" "}
              <span className="text-secondary">
                {fmtMoney(Math.max(0, netPnl), lang, { decimals: 0 })}
              </span>{" "}
              · {es ? "Cuota" : "Liability"}:{" "}
              <span className="text-secondary">
                {fmtMoney(estimatedTax, lang, { decimals: 0 })}
              </span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="liquid-glass rounded-card p-5 h-full flex items-start gap-3">
            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-md grid place-items-center bg-white/5 text-tertiary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 7.5v.5" />
              </svg>
            </div>
            <div className="text-xs text-tertiary leading-relaxed">
              {es
                ? "Estimación con la base del ahorro de España (19 % tramo inferior). Las pérdidas compensan ganancias dentro del mismo ejercicio. Consulta a tu asesor para tu caso concreto — esto no es asesoramiento fiscal."
                : "Estimate using Spain's savings base (19 % lower bracket). Losses offset gains within the same fiscal year. Consult your accountant for your specific case — this is not tax advice."}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
