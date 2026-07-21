"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { AnimatedNumber } from "@/components/tj/AnimatedNumber";
import { MarketBackground } from "@/components/tj/MarketBackground";

/**
 * StatsBand — full-width band of six big animated stats.
 *
 * Premium motion layer:
 *  - Live MarketBackground behind the numbers, layered with an aurora wash
 *    and a subtle accent gradient sweep.
 *  - Subtle horizontal parallax (x: +20 → -20) tied to scroll progress.
 *  - Per-stat staggered entrance (single, on scroll-into-view — no infinite float).
 *  - Numbers count up via AnimatedNumber (easeOutExpo, locale-aware).
 *  - The "ES+EN" stat is plain text (no numeric animation).
 *  - Animated accent gradient line that draws across the bottom on view.
 */

type Stat =
  | {
      kind: "num";
      value: number;
      format: "money" | "percent" | "int" | "decimal";
      decimals?: number;
      suffix?: string;
      label: string;
      sub: string;
    }
  | {
      kind: "text";
      text: string;
      label: string;
      sub: string;
    };

export function StatsBand() {
  const { lang } = useLang();
  const es = lang === "es";

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle horizontal parallax: stats drift +20px → -20px as you scroll past.
  const x = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const stats: Stat[] = [
    {
      kind: "num",
      value: 40,
      format: "int",
      suffix: "+",
      label: es ? "Métricas calculadas" : "Calculated metrics",
      sub: es ? "institucionales" : "institutional-grade",
    },
    {
      kind: "num",
      value: 72,
      format: "int",
      label: es ? "Operaciones en demo" : "Trades in demo",
      sub: es ? "datos de muestra" : "sample data",
    },
    {
      kind: "num",
      value: 1,
      format: "percent",
      decimals: 0,
      label: es ? "Local y privado" : "Local & private",
      sub: es ? "sin servidor, sin nube" : "no server, no cloud",
    },
    {
      kind: "num",
      value: 5,
      format: "int",
      label: es ? "Paletas de acento" : "Accent palettes",
      sub: es ? "oro · esmeralda · ónix · aurora · seda" : "gold · emerald · onyx · aurora · silk",
    },
    {
      kind: "num",
      value: 30,
      format: "int",
      label: es ? "Días de garantía" : "Day guarantee",
      sub: es ? "devolución sin preguntas" : "no-questions refund",
    },
    {
      kind: "text",
      text: "ES+EN",
      label: es ? "Bilingüe nativo" : "Native bilingual",
      sub: es ? "diseñado en ambas lenguas" : "designed in both",
    },
  ];

  return (
    <section
      ref={ref}
      aria-label={es ? "Cifras clave" : "Key numbers"}
      className="section-tight relative overflow-hidden border-y border-white/10"
    >
      {/* Live market chart backdrop — big stats float over a slow candlestick feed. */}
      <div className="absolute inset-0 pointer-events-none">
        <MarketBackground opacity={0.10} density={70} speed={1.4} volatility={0.014} />
      </div>

      {/* Aurora + accent gradient wash */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, rgb(var(--accent-base) / 0.10) 0%, transparent 30%, transparent 70%, rgb(var(--accent-base) / 0.06) 100%)",
        }}
      />

      <motion.div
        className="relative z-10 max-w-page mx-auto px-5 md:px-8"
        style={{ x }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label + i}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="flex flex-col items-center justify-center text-center h-full liquid-glass depth-2 rounded-card p-5 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  {s.kind === "num" ? (
                    <AnimatedNumber
                      value={s.value}
                      format={s.format}
                      decimals={s.decimals}
                      suffix={s.suffix ?? ""}
                      className="t-display text-[clamp(2rem,4.5vw,3rem)] text-primary"
                    />
                  ) : (
                    <span className="t-display text-[clamp(2rem,4.5vw,3rem)] tnum text-primary">
                      {s.text}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs md:text-sm font-semibold text-primary uppercase tracking-[0.1em]">
                  {s.label}
                </div>
                <div className="mt-1 text-[11px] md:text-xs text-tertiary">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animated accent gradient line that sweeps across the bottom of the band. */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          transformOrigin: "left center",
          background:
            "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base)) 25%, rgb(var(--accent-base)) 75%, transparent 100%)",
        }}
      />
    </section>
  );
}
