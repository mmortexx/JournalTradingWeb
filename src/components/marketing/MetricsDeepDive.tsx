"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

interface MetricCategory {
  /** Uppercase chip monogram, language-agnostic. */
  mark: string;
  /** Localized category label. */
  label: string;
  /** Localized metric pill labels. */
  metrics: string[];
}

/**
 * Metrics deep-dive — every metric the engine computes, grouped by
 * family. Pure marketing surface; the real computation lives in
 * `src/lib/trading/metrics.ts`.
 *
 * Layout: 4 category blocks stacked vertically. Each block has a
 * small header (monogram chip + uppercase label + border-white/10 + count)
 * followed by a `grid grid-cols-2 md:grid-cols-4 gap-2` of metric
 * pills styled identically to the SectionNav pills
 * (`liquid-glass rounded-pill px-3 py-1.5 text-xs`) so the design system
 * reads as one cohesive surface.
 */
export function MetricsDeepDive() {
  const { lang } = useLang();
  const es = lang === "es";

  const categories: MetricCategory[] = [
    {
      mark: "P",
      label: es ? "Performance" : "Performance",
      metrics: [
        "P&L",
        es ? "Tasa de acierto" : "Win rate",
        "Profit factor",
        "Expectancy",
        "Payoff",
        "ROI",
      ],
    },
    {
      mark: "R",
      label: es ? "Riesgo" : "Risk",
      metrics: [
        es ? "Drawdown máx." : "Max drawdown",
        "Sharpe",
        "Sortino",
        "Calmar",
        "Recovery factor",
        es ? "Riesgo de ruina" : "Risk of ruin",
      ],
    },
    {
      mark: "Q",
      label: es ? "Calidad" : "Quality",
      metrics: [
        es ? "Ganancia media" : "Avg win",
        es ? "Pérdida media" : "Avg loss",
        es ? "Mayor ganancia" : "Largest win",
        es ? "Mayor pérdida" : "Largest loss",
        "MAE",
        "MFE",
      ],
    },
    {
      mark: "D",
      label: es ? "Disciplina" : "Discipline",
      metrics: [
        es ? "Cumplimiento %" : "Compliance %",
        es ? "Coste de indisciplina" : "Cost of indiscipline",
        es ? "Racha" : "Streak",
        es ? "Adherencia al plan" : "Plan adherence",
      ],
    },
  ];

  const totalMetrics = categories.reduce((n, c) => n + c.metrics.length, 0);

  return (
    <section className="section bg-black relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Métricas" : "Metrics"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                40+ métricas.{" "}
                <span className="text-gradient">Todas calculadas de tus operaciones.</span>
              </>
            ) : (
              <>
                40+ metrics.{" "}
                <span className="text-gradient">All computed from your trades.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Nada de métricas de marca. Cada número sale de tus operaciones reales y se recalcula al instante cuando entras, editas o cierras un trade."
              : "No vanity metrics. Every number comes from your actual trades and recalculates instantly when you enter, edit, or close a trade."}
          </p>
        </Reveal>

        {/* Summary chip strip */}
        <Reveal delay={0.08} className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="liquid-glass rounded-pill px-3 py-1.5 font-semibold text-primary tnum">
            40+
            <span className="ml-1 text-tertiary font-medium">
              {es ? "métricas" : "metrics"}
            </span>
          </span>
          <span className="text-tertiary tnum">
            {es ? "4 familias" : "4 families"}
          </span>
          <span aria-hidden className="text-tertiary/40">
            ·
          </span>
          <span className="text-tertiary">
            {es ? "Recálculo en vivo" : "Live recalculation"}
          </span>
        </Reveal>

        {/* Category blocks */}
        <div className="mt-10 grid gap-8">
          {categories.map((cat, ci) => (
            <Reveal key={cat.label} delay={0.05 * ci} y={20}>
              <div>
                {/* Category header — monogram + label + border-white/10 + count */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    aria-hidden="true"
                    className="w-6 h-6 rounded-md bg-white/5 border border-white/10 text-primary text-[10px] font-bold flex items-center justify-center"
                  >
                    {cat.mark}
                  </span>
                  <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-tertiary">
                    {cat.label}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="flex-1 h-px bg-white/10"
                  />
                  <span className="text-[11px] text-tertiary/70 tnum">
                    {cat.metrics.length.toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Metric pills — compact card grid → gap-3 (12px) per design system */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cat.metrics.map((m, i) => (
                    <motion.div
                      key={m}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="liquid-glass rounded-pill px-3 py-1.5 text-xs font-medium text-secondary whitespace-nowrap transition-colors hover:text-primary hover:border-white/20"
                    >
                      {m}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Footnote */}
        <Reveal delay={0.15} className="mt-8">
          <p className="text-xs text-tertiary leading-relaxed">
            {es
              ? `Listado no exhaustivo (${totalMetrics} métricas mostradas de 40+). La app calcula además métricas por setup, sesión, día de la semana y etiqueta personalizada.`
              : `Non-exhaustive list (${totalMetrics} of 40+ metrics shown). The app additionally computes metrics per setup, session, day of week and custom tag.`}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
