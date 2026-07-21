"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { METRICS, TRADES } from "@/lib/trading/data";
import { Money } from "@/components/tj/Money";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { CountUp } from "@/components/tj/CountUp";

/**
 * MistakeInvoice — creative section showing an "invoice" of indiscipline
 * costs. Real metrics: METRICS.costOfIndiscipline,
 * METRICS.expectancyInPlan vs METRICS.expectancyBrokePlan. The category
 * breakdown is illustrative and sums to the real total.
 *
 * Animation layers:
 *  - Invoice card with subtle entrance (opacity + y).
 *  - "INDISCIPLINA" stamp of shame (rotated -12°, low opacity, fades in).
 *  - Each mistake row: staggered entrance with subtle y-slide + hover nudge.
 *  - TOTAL line: 2.5s count-up with a static red glow (no infinite pulse).
 */

export function MistakeInvoice() {
  const { lang } = useLang();
  const es = lang === "es";

  const brokeCount = TRADES.filter((t) => t.compliance !== "yes").length;
  const gap = METRICS.expectancyInPlan - METRICS.expectancyBrokePlan;
  const total = METRICS.costOfIndiscipline;

  // Illustrative category breakdown — sums to the real total.
  const categories = [
    {
      label: es ? "Entradas fuera de horario" : "Off-hours entries",
      pct: 0.32,
      note: es ? "Asia cuando tu sesión es NY" : "Asia when your session is NY",
    },
    {
      label: es ? "Tamaños por encima del plan" : "Sizes above plan",
      pct: 0.27,
      note: es ? "Riesgo > 1 % de tu equity" : "Risk > 1 % of your equity",
    },
    {
      label: es ? "Sin stop definido" : "No stop defined",
      pct: 0.18,
      note: es ? "Operaciones a ciegas al riesgo" : "Trades blind to risk",
    },
    {
      label: es ? "Perseguir entradas" : "Chasing entries",
      pct: 0.14,
      note: es ? "FOMO después de un movimiento" : "FOMO after a move",
    },
    {
      label: es ? "Mover el stop" : "Moving the stop",
      pct: 0.09,
      note: es ? "No aceptar la pérdida" : "Not accepting the loss",
    },
  ];

  return (
    <section className="section bg-black relative overflow-hidden">
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/3 w-[500px] h-[500px] rounded-full blur-[130px] opacity-12 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(var(--pnl-neg)), transparent 70%)" }}
        aria-hidden="true"
      />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "El coste real" : "The real cost"}
          </Eyebrow>
          <h2
            className="mt-5 t-h2 text-primary"
          >
            {es ? (
              <>
                Lo que tu indisciplina te <span className="text-gradient">cuesta.</span>
              </>
            ) : (
              <>
                What your indiscipline <span className="text-gradient">costs.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-secondary leading-relaxed">
            {es
              ? "Calculado a partir de tus propias operaciones. La diferencia entre lo que ganas siguiendo tu plan y lo que ganas rompiéndolo — multiplicada por cuántas veces lo rompes."
              : "Calculated from your own trades. The difference between what you make following your plan and what you make breaking it — multiplied by how many times you break it."}
          </p>
        </Reveal>

        {/* Invoice card */}
        <Reveal delay={0.1} className="mt-10 max-w-2xl mx-auto">
          <motion.div
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            className="liquid-glass depth-3 rounded-card overflow-hidden relative transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
              {/* "INDISCIPLINA" stamp of shame — subtle fade-in only (no scale,
                  no rotate animation). Sits as a faint, permanent watermark. */}
              <motion.div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 z-10 pointer-events-none select-none"
                style={{ x: "-50%", y: "-50%", rotate: -12 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.08 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="block text-[4.5rem] md:text-[6.5rem] font-black tracking-[0.1em] text-pnl-neg uppercase leading-none whitespace-nowrap">
                  {es ? "Indisciplina" : "Indiscipline"}
                </span>
              </motion.div>

              {/* Invoice header */}
              <div className="relative flex items-start justify-between gap-4 p-5 sm:p-6 md:p-7 border-b">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-semibold">
                    {es ? "Factura" : "Invoice"}
                  </div>
                  <div className="mt-1 text-lg font-medium text-primary tnum">
                    #IND-2026-07
                  </div>
                </div>
                <div className="text-right text-xs text-tertiary">
                  <div>
                    {es ? "Periodo" : "Period"}:{" "}
                    <span className="text-secondary tnum">
                      {es ? "Últimos 180 días" : "Last 180 days"}
                    </span>
                  </div>
                  <div className="mt-1">
                    {es ? "Operaciones" : "Trades"}:{" "}
                    <span className="text-secondary tnum">{TRADES.length}</span>
                  </div>
                  <div className="mt-1">
                    {es ? "Fuera de plan" : "Out of plan"}:{" "}
                    <span className="text-pnl-neg tnum font-medium">{brokeCount}</span>
                  </div>
                </div>
              </div>

              {/* Column headers */}
              <div className="relative grid grid-cols-[1fr_auto_auto] gap-x-3 sm:gap-x-4 md:gap-x-8 px-5 sm:px-6 md:px-7 py-3 text-[10px] uppercase tracking-[0.14em] text-tertiary font-semibold border-b">
                <span>{es ? "Concepto" : "Concept"}</span>
                <span className="text-right w-12 sm:w-20">{es ? "Notas" : "Note"}</span>
                <span className="text-right w-20 sm:w-24 md:w-28">{es ? "Importe" : "Amount"}</span>
              </div>

              {/* Line items */}
              <div className="relative">
                {categories.map((c, i) => {
                  const amount = total * c.pct;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + i * 0.08,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{ x: 2 }}
                      className="grid grid-cols-[1fr_auto_auto] gap-x-3 sm:gap-x-4 md:gap-x-8 px-5 sm:px-6 md:px-7 py-3.5 border-b border-dashed border-white/10 items-center transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm text-primary truncate">{c.label}</div>
                        <div className="text-[11px] text-tertiary mt-0.5 truncate">{c.note}</div>
                      </div>
                      <span className="text-right w-12 sm:w-20 text-[11px] text-tertiary tnum">
                        {(c.pct * 100).toFixed(0)}%
                      </span>
                      <span className="text-right w-20 sm:w-24 md:w-28 text-sm text-pnl-neg tnum font-medium">
                        <Money value={-amount} />
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Subtotal rows */}
              <div className="relative px-5 sm:px-6 md:px-7 py-4 space-y-2 bg-black/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">
                    {es ? "Expectancy en plan (por op.)" : "Expectancy in plan (per trade)"}
                  </span>
                  <span className="tnum text-pnl-pos font-medium">
                    <Money value={METRICS.expectancyInPlan} sign />
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">
                    {es ? "Expectancy fuera de plan (por op.)" : "Expectancy out of plan (per trade)"}
                  </span>
                  <span className="tnum text-pnl-neg font-medium">
                    <Money value={METRICS.expectancyBrokePlan} sign />
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">
                    {es ? "Gap por operación" : "Gap per trade"}
                  </span>
                  <span className="tnum text-pnl-warn font-medium">
                    <Money value={gap} sign />
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="relative flex items-center justify-between px-5 sm:px-6 md:px-7 py-5 border-t-2 border-pnl-neg/40 bg-pnl-neg/5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-tertiary font-semibold">
                    {es ? "Total — coste de indisciplina" : "Total — cost of indiscipline"}
                  </div>
                  <div className="text-[11px] text-tertiary mt-0.5 tnum">
                    {brokeCount} {es ? "operaciones fuera de plan" : "out-of-plan trades"} ×{" "}
                    <Money value={gap} />
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="t-display text-[clamp(1.75rem,3.5vw,2.5rem)] tnum text-pnl-neg"
                  >
                    <CountUp
                      to={total}
                      from={0}
                      duration={2.5}
                      decimals={2}
                      prefix="−$"
                      tone="neg"
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-tertiary mt-1">
                    {es ? "a pagar" : "due"}
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <div className="relative px-5 sm:px-6 md:px-7 py-3 text-[11px] text-tertiary border-t">
                {es
                  ? "Calculado con la misma fórmula que la app: Σ (expectancyEnPlan − netPnl) sobre las operaciones que no cumplieron el plan. La asignación por categorías es ilustrativa; el total es exacto."
                  : "Calculated with the same formula the app uses: Σ (expectancyInPlan − netPnl) over trades that didn't follow the plan. The category allocation is illustrative; the total is exact."}
              </div>
            </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
