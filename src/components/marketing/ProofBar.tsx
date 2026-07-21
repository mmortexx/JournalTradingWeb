"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { AnimatedNumber } from "@/components/tj/AnimatedNumber";

/**
 * ProofBar — thin full-width band of aggregate social-proof stats with
 * animated count-ups. Sits directly under the hero so visitors see proof
 * the moment they land.
 *
 * Compact, single row, no backdrop canvas. Each tile fades + lifts in on
 * view, staggered by 80ms. AnimatedNumber (rAF, easeOutExpo) animates the
 * numeric portion with locale-aware formatting (es → ".", en → ",").
 *
 * NOTE: Not currently composed on the home page — kept as a clean,
 * reusable proof band in case it's needed elsewhere.
 */
export function ProofBar() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  const stats = [
    {
      node: (
        <AnimatedNumber
          value={312}
          format="int"
          className="t-display text-[clamp(1.5rem,3.5vw,2.25rem)]"
        />
      ),
      label: es ? "traders activos" : "active traders",
    },
    {
      node: (
        <AnimatedNumber
          value={48}
          format="int"
          suffix={es ? ".000+" : ",000+"}
          className="t-display text-[clamp(1.5rem,3.5vw,2.25rem)]"
        />
      ),
      label: es ? "operaciones registradas" : "trades logged",
    },
    {
      node: (
        <AnimatedNumber
          value={2.4}
          format="decimal"
          decimals={1}
          prefix="$"
          suffix="M"
          className="t-display text-[clamp(1.5rem,3.5vw,2.25rem)]"
        />
      ),
      label: es ? "en volumen analizado" : "in analyzed volume",
    },
    {
      node: (
        <AnimatedNumber
          value={4.9}
          format="decimal"
          decimals={1}
          suffix="/5"
          className="t-display text-[clamp(1.5rem,3.5vw,2.25rem)]"
        />
      ),
      label: es ? "valoración media" : "average rating",
    },
  ];

  return (
    <section
      aria-label={es ? "Prueba social" : "Social proof"}
      className="section-tight relative liquid-glass border-y border-white/10 overflow-hidden"
    >
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={
                reduce
                  ? undefined
                  : { y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }
              className="liquid-glass depth-2 rounded-card p-5 flex flex-col items-center justify-center text-center relative transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {/* Static accent dot — no ping ring */}
              <span
                className="absolute top-3 right-3 inline-flex h-1.5 w-1.5 rounded-full bg-white/80"
                aria-hidden="true"
              />
              <div className="text-primary">{s.node}</div>
              <div className="mt-1.5 text-xs md:text-sm text-secondary">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
