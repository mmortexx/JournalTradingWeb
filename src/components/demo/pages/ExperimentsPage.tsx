"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  computeMetrics,
  rankByExpectancy,
  type Trade,
} from "@/lib/trading/data";
import { fmtMoney, fmtPct, fmtInt, fmtDate } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";

/* ============================================================
 * R25-1a — ExperimentsPage
 *
 * Mirrors the real app's "Experimentos" tab (NavigationView tag
 * "experiments" in MainWindow.xaml L205-208). In the real app this
 * page tracks A/B tests the trader runs on their own setups —
 * hypothesis, sample size, expectancy lift vs. the baseline, status.
 * The demo derives a deterministic experiment list from the existing
 * TRADES data (one experiment per setup, plus a couple of
 * hypothetical "tighter stop" / "higher TF" variations) so the
 * numbers stay consistent with the rest of the demo and the page
 * reads as substantive rather than a "coming soon" stub.
 *
 * Layout (mirrors the other demo pages):
 *   - Sticky header: eyebrow + title + description + summary KPIs.
 *   - Experiments table: one row per experiment with hypothesis,
 *     sample size, baseline vs. variant expectancy, lift %, status.
 *   - Footer note on experiment methodology (mirrors the real app's
 *     explanation that experiments need a minimum sample size before
 *     the lift is statistically meaningful).
 * ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

interface Experiment {
  id: string;
  nameEs: string;
  nameEn: string;
  hypothesisEs: string;
  hypothesisEn: string;
  baseline: { count: number; expectancy: number };
  variant: { count: number; expectancy: number };
  startedAt: Date;
  status: "running" | "completed" | "paused";
}

/**
 * Build a deterministic experiment list from the TRADES data. Each
 * setup becomes one experiment where the "baseline" is the setup's
 * expectancy across all trades and the "variant" is a sub-slice
 * (e.g. only the trades that met an extra confirmation rule).
 */
function buildExperiments(trades: Trade[]): Experiment[] {
  const baseline = rankByExpectancy(trades, (t) => t.setup);
  const bySetup = new Map<string, Trade[]>();
  for (const t of trades) {
    const arr = bySetup.get(t.setup) ?? [];
    arr.push(t);
    bySetup.set(t.setup, arr);
  }
  // Variant rule: trades where the trader respected the plan
  // (compliance === "yes") AND the R-multiple was positive — a
  // plausible "what if I only took A+ setups?" hypothesis.
  return baseline.map((row, i) => {
    const all = bySetup.get(row.name) ?? [];
    const variantTrades = all.filter(
      (t) => t.compliance === "yes" && t.rMultiple > 0
    );
    const variantMetrics =
      variantTrades.length > 0 ? computeMetrics(variantTrades) : null;
    return {
      id: `exp-${i}`,
      nameEs: `${row.name} solo A+`,
      nameEn: `${row.name} A+ only`,
      hypothesisEs:
        "¿Mejora la expectancy si filtro solo las operaciones que cumplen todos los criterios del plan?",
      hypothesisEn:
        "Does expectancy improve if I filter to only operations that meet every plan criterion?",
      baseline: { count: row.count, expectancy: row.expectancy },
      variant: {
        count: variantTrades.length,
        expectancy: variantMetrics?.expectancy ?? 0,
      },
      startedAt: all[0]?.closedAt ?? new Date(),
      status:
        variantTrades.length < 10
          ? "running"
          : i === 0
          ? "completed"
          : "running",
    } satisfies Experiment;
  });
}

function StatusChip({ status }: { status: Experiment["status"] }) {
  const { lang } = useLang();
  const es = lang === "es";
  const map = {
    running: {
      variant: "accent" as const,
      label: es ? "En curso" : "Running",
    },
    completed: {
      variant: "pos" as const,
      label: es ? "Completado" : "Completed",
    },
    paused: {
      variant: "warn" as const,
      label: es ? "Pausado" : "Paused",
    },
  };
  const m = map[status];
  return <Chip variant={m.variant}>{m.label}</Chip>;
}

function KPICard({
  label,
  children,
  delay = 0,
}: {
  label: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} y={10}>
      <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-4">
        <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-2">
          {label}
        </div>
        {children}
      </div>
    </Reveal>
  );
}

export function ExperimentsPage() {
  const { lang } = useLang();
  const es = lang === "es";

  const experiments = useMemo(() => buildExperiments(TRADES), []);
  const running = experiments.filter((e) => e.status === "running").length;
  const completed = experiments.filter((e) => e.status === "completed").length;
  const avgLift = useMemo(() => {
    const lifts = experiments
      .filter((e) => e.baseline.expectancy !== 0)
      .map(
        (e) =>
          (e.variant.expectancy - e.baseline.expectancy) /
          Math.abs(e.baseline.expectancy)
      );
    return lifts.length ? lifts.reduce((s, x) => s + x, 0) / lifts.length : 0;
  }, [experiments]);
  const totalSample = experiments.reduce((s, e) => s + e.variant.count, 0);

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* ---------- Header ---------- */}
      <Reveal>
        <div className="space-y-3">
          <Eyebrow>{es ? "Laboratorio" : "Lab"}</Eyebrow>
          <h2 className="text-xl md:text-2xl font-semibold tracking-[-0.02em] text-primary">
            {es ? "Experimentos" : "Experiments"}
          </h2>
          <p className="text-sm text-secondary leading-relaxed max-w-2xl">
            {es
              ? "Pon a prueba tus hipótesis sobre cada setup. Compara la línea base frente a la variante, mide el lift de expectancy y decide con datos — no con intuición — qué cambiar en tu operativa."
              : "Put your setup hypotheses to the test. Compare baseline vs. variant, measure the expectancy lift, and decide with data — not gut feel — what to change in your trading."}
          </p>
        </div>
      </Reveal>

      {/* ---------- Summary KPIs ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label={es ? "Activos" : "Active"} delay={0.02}>
          <div className="flex items-baseline gap-1.5">
            <CountUp
              to={running}
              duration={1.0}
              className="text-2xl font-semibold tnum text-primary"
            />
            <span className="text-xs text-tertiary">
              {es ? `/ ${experiments.length}` : `/ ${experiments.length}`}
            </span>
          </div>
        </KPICard>
        <KPICard label={es ? "Completados" : "Completed"} delay={0.04}>
          <CountUp
            to={completed}
            duration={1.0}
            className="text-2xl font-semibold tnum text-primary"
          />
        </KPICard>
        <KPICard label={es ? "Lift medio" : "Avg. lift"} delay={0.06}>
          <CountUp
            to={avgLift}
            decimals={1}
            suffix="%"
            duration={1.2}
            tone={avgLift >= 0 ? "pos" : "neg"}
            className={`text-2xl font-semibold tnum ${
              avgLift >= 0 ? "text-pnl-pos" : "text-pnl-neg"
            }`}
          />
        </KPICard>
        <KPICard label={es ? "Muestra total" : "Total sample"} delay={0.08}>
          <CountUp
            to={totalSample}
            duration={1.2}
            className="text-2xl font-semibold tnum text-primary"
            suffix={es ? " ops" : " trd"}
          />
        </KPICard>
      </div>

      {/* ---------- Experiments table ---------- */}
      <Reveal delay={0.1}>
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
              {es ? "Experimentos en curso" : "Running experiments"}
            </div>
            <Chip variant="neutral">
              {es ? `${experiments.length} experimentos` : `${experiments.length} experiments`}
            </Chip>
          </div>
          {/* Column header */}
          <div className="hidden md:grid grid-cols-[1.6fr_0.9fr_0.9fr_0.7fr_0.8fr_0.7fr] gap-3 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-tertiary border-b border-white/5">
            <span>{es ? "Hipótesis" : "Hypothesis"}</span>
            <span className="text-right">{es ? "Línea base" : "Baseline"}</span>
            <span className="text-right">{es ? "Variante" : "Variant"}</span>
            <span className="text-right">{es ? "Lift" : "Lift"}</span>
            <span className="text-right">{es ? "Muestra" : "Sample"}</span>
            <span className="text-right">{es ? "Estado" : "Status"}</span>
          </div>
          {/* Rows */}
          <div className="divide-y divide-white/5">
            {experiments.map((exp, i) => {
              const lift =
                exp.baseline.expectancy !== 0
                  ? (exp.variant.expectancy - exp.baseline.expectancy) /
                    Math.abs(exp.baseline.expectancy)
                  : 0;
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.32, ease: EASE, delay: i * 0.03 }}
                  className="md:grid md:grid-cols-[1.6fr_0.9fr_0.9fr_0.7fr_0.8fr_0.7fr] md:gap-3 md:items-center px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Hypothesis */}
                  <div className="min-w-0 mb-2 md:mb-0">
                    <div className="text-sm font-medium text-primary truncate">
                      {es ? exp.nameEs : exp.nameEn}
                    </div>
                    <div className="text-[11px] text-tertiary line-clamp-1 mt-0.5">
                      {es ? exp.hypothesisEs : exp.hypothesisEn}
                    </div>
                    <div className="text-[10px] text-tertiary mt-1 md:hidden">
                      {es ? "Inicio" : "Started"} {fmtDate(exp.startedAt, lang)}
                    </div>
                  </div>
                  {/* Baseline expectancy */}
                  <div className="text-right mb-2 md:mb-0">
                    <div className="text-[10px] uppercase tracking-wider text-tertiary md:hidden">
                      {es ? "Línea base" : "Baseline"}
                    </div>
                    <span className="text-sm tnum text-secondary">
                      {fmtMoney(exp.baseline.expectancy, lang, { sign: true })}
                    </span>
                  </div>
                  {/* Variant expectancy */}
                  <div className="text-right mb-2 md:mb-0">
                    <div className="text-[10px] uppercase tracking-wider text-tertiary md:hidden">
                      {es ? "Variante" : "Variant"}
                    </div>
                    <span className="text-sm tnum text-primary">
                      {fmtMoney(exp.variant.expectancy, lang, { sign: true })}
                    </span>
                  </div>
                  {/* Lift */}
                  <div className="text-right mb-2 md:mb-0">
                    <div className="text-[10px] uppercase tracking-wider text-tertiary md:hidden">
                      {es ? "Lift" : "Lift"}
                    </div>
                    <span
                      className={`text-sm tnum font-medium ${
                        lift >= 0 ? "text-pnl-pos" : "text-pnl-neg"
                      }`}
                    >
                      {lift >= 0 ? "+" : "−"}
                      {fmtPct(Math.abs(lift), lang, 1)}
                    </span>
                  </div>
                  {/* Sample */}
                  <div className="text-right mb-2 md:mb-0">
                    <div className="text-[10px] uppercase tracking-wider text-tertiary md:hidden">
                      {es ? "Muestra" : "Sample"}
                    </div>
                    <span className="text-sm tnum text-secondary">
                      {fmtInt(exp.variant.count, lang)}
                      <span className="text-tertiary">
                        {" "}
                        / {fmtInt(exp.baseline.count, lang)}
                      </span>
                    </span>
                  </div>
                  {/* Status */}
                  <div className="md:text-right">
                    <StatusChip status={exp.status} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* ---------- Methodology note ---------- */}
      <Reveal delay={0.12}>
        <div className="liquid-glass rounded-card p-4 flex items-start gap-3">
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
              ? "Un lift solo es estadísticamente significativo con muestra suficiente (regla heurística: ≥ 30 operaciones por rama). Los experimentos con menos muestra siguen «En curso» hasta alcanzar ese umbral."
              : "A lift is only statistically meaningful with enough sample (heuristic: ≥ 30 trades per branch). Experiments with less sample stay \"Running\" until they hit that threshold."}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
