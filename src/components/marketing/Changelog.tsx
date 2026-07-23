"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { Chip } from "@/components/tj/Chip";

/**
 * Changelog & Roadmap — vertical timeline that shows the product is
 * actively developed and gives transparency about where it's going.
 *
 * Premium motion layer:
 *  - Center accent line that fades in at top/bottom.
 *  - Timeline dots pop in (scale 0→1, springy) on view.
 *  - Cards slide in from alternating sides on desktop (left/right),
 *    stack on mobile with the line on the left.
 *  - Upcoming dots use a hollow ring to signal "in progress".
 *  - Each card uses a spring hover lift for subtle interactivity.
 */

type Entry = {
  version: string;
  title: string;
  description: string;
  date: string;
  kind: "past" | "next";
};

export function Changelog() {
  const { lang } = useLang();
  const es = lang === "es";

  const entries: Entry[] = es
    ? [
        {
          version: "v1.4",
          title: "Discipline Guardian",
          description:
            "El guardián te frena antes de operar fuera de plan",
          date: "Jul 2026",
          kind: "past",
        },
        {
          version: "v1.3",
          title: "Monte Carlo + Risk of ruin",
          description: "Simula 10.000 escenarios de tu curva de equity",
          date: "May 2026",
          kind: "past",
        },
        {
          version: "v1.2",
          title: "Playbook con stats en vivo",
          description:
            "Cada setup muestra expectancy calculada de tus operaciones",
          date: "Mar 2026",
          kind: "past",
        },
        {
          version: "v1.0",
          title: "Lanzamiento inicial",
          description:
            "El primer release público de Trading Journal, nativo de Windows.",
          date: "Ene 2026",
          kind: "past",
        },
        {
          version: "v1.5",
          title: "Importador de rivales",
          description: "Importa tu historial de otro journal en 5 minutos",
          date: "Q3 2026",
          kind: "next",
        },
        {
          version: "v1.6",
          title: "Backtesting visual",
          description: "Replay del mercado con tus reglas de setup",
          date: "Q4 2026",
          kind: "next",
        },
        {
          version: "v2.0",
          title: "Modo prop firm avanzado",
          description:
            "Reglas de pérdida diaria, drawdown máximo y reset",
          date: "2027",
          kind: "next",
        },
      ]
    : [
        {
          version: "v1.4",
          title: "Discipline Guardian",
          description: "The guardian stops you before trading off-plan",
          date: "Jul 2026",
          kind: "past",
        },
        {
          version: "v1.3",
          title: "Monte Carlo + Risk of ruin",
          description: "Simulate 10,000 scenarios of your equity curve",
          date: "May 2026",
          kind: "past",
        },
        {
          version: "v1.2",
          title: "Playbook with live stats",
          description:
            "Each setup shows expectancy computed from your trades",
          date: "Mar 2026",
          kind: "past",
        },
        {
          version: "v1.0",
          title: "Initial launch",
          description:
            "The first public release of Trading Journal, native to Windows.",
          date: "Jan 2026",
          kind: "past",
        },
        {
          version: "v1.5",
          title: "Rival importer",
          description: "Import your history from another journal in 5 minutes",
          date: "Q3 2026",
          kind: "next",
        },
        {
          version: "v1.6",
          title: "Visual backtesting",
          description: "Market replay with your setup rules",
          date: "Q4 2026",
          kind: "next",
        },
        {
          version: "v2.0",
          title: "Advanced prop firm mode",
          description: "Daily loss rules, max drawdown and reset",
          date: "2027",
          kind: "next",
        },
      ];

  return (
    <section id="changelog" className="section cv-auto bg-veil relative overflow-hidden scroll-mt-24">
      {/* Aurora tint to lift the section off the page */}
      <div
        className="absolute inset-0 pointer-events-none aurora-bg opacity-40"
        aria-hidden
      />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="relative flex justify-center">
              <Eyebrow>{es ? "Changelog & Roadmap" : "Changelog & Roadmap"}</Eyebrow>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="relative mt-5 t-h2 text-primary"
            >
              {es ? (
                <>
                  En constante <span className="text-gradient">evolución.</span>
                </>
              ) : (
                <>
                  Constantly <span className="text-gradient">evolving.</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="relative mt-4 text-lg text-secondary max-w-xl mx-auto leading-relaxed">
              {es
                ? "Cada versión se construye sobre el feedback de traders reales. Esto es lo que ya está en tu mano y lo que viene."
                : "Every version is built on feedback from real traders. Here's what's already in your hands and what's coming."}
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <div className="relative mt-16 md:mt-20">
          {/* Center line — left on mobile, center on desktop */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2 bg-gradient-to-b from-transparent via-[rgb(var(--divider)/0.35)] to-transparent"
            aria-hidden
          />

          <div className="space-y-8 md:space-y-10">
            {entries.map((entry, i) => {
              const isPast = entry.kind === "past";
              const isLeft = i % 2 === 0; // even → left side on desktop
              // Slide-in direction: left card slides from left, right card from right
              const slideX = isLeft ? -48 : 48;

              return (
                <div
                  key={entry.version}
                  className={`relative md:flex md:items-center ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Card column */}
                  <div
                    className={`pl-12 md:pl-0 md:w-1/2 ${
                      isLeft ? "md:pr-12 md:text-right" : "md:pl-12"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: slideX }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.05,
                      }}
                      className="h-full"
                    >
                      <motion.div
                        whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                        className={`liquid-glass depth-1 rounded-card p-5 h-full transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isPast
                            ? "hover:shadow-[0_0_36px_-10px_rgb(var(--accent-base)/0.45)] hover:border-[rgb(var(--accent-base)/0.30)]"
                            : "opacity-90 hover:opacity-100 hover:border-[rgb(var(--divider)/0.25)]"
                        }`}
                      >
                          <div
                            className={`flex flex-wrap items-center gap-2 ${
                              isLeft ? "md:justify-end" : "md:justify-start"
                            }`}
                          >
                            <Chip
                              variant={isPast ? "accent" : "neutral"}
                              className={
                                isPast
                                  ? ""
                                  : "border-dashed border-[rgb(var(--divider)/0.22)] text-tertiary"
                              }
                            >
                              <span className="t-h4 tnum">{entry.version}</span>
                            </Chip>
                            {!isPast && (
                              <Chip variant="warn">
                                {es ? "Próximo" : "Next"}
                              </Chip>
                            )}
                          </div>

                          <h3
                            className={`mt-3 t-h4 ${
                              isPast ? "text-primary" : "text-primary/90"
                            }`}
                          >
                            {entry.title}
                          </h3>
                          <p
                            className={`mt-1.5 text-sm leading-relaxed ${
                              isPast ? "text-secondary" : "text-tertiary"
                            }`}
                          >
                            {entry.description}
                          </p>

                          <div
                            className={`mt-3 flex items-center gap-1.5 text-xs text-tertiary tnum ${
                              isLeft ? "md:justify-end" : "md:justify-start"
                            }`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                isPast ? "bg-[rgb(var(--divider)/0.70)]" : "bg-pnl-warn/70"
                              }`}
                              aria-hidden
                            />
                            {entry.date}
                          </div>
                        </motion.div>
                    </motion.div>
                  </div>

                  {/* Node dot — pops in on view. Past: solid accent with
                      glow ring. Future: hollow ring with a faint pulsing
                      halo behind it (single keyframe loop) so the "in
                      progress" state reads as alive, not just absent. */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                      delay: 0.12,
                    }}
                    className="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10"
                    aria-hidden
                  >
                    {isPast ? (
                      <span className="block w-3.5 h-3.5 rounded-full bg-[rgb(var(--accent-base))] ring-4 ring-[rgb(var(--accent-base)/0.15)] shadow-[0_0_12px_-2px_rgb(var(--accent-base)/0.6)]" />
                    ) : (
                      <span className="relative block w-3.5 h-3.5">
                        {/* Pulsing halo — sits behind the hollow ring,
                            scales 1 → 1.8 and fades 0.5 → 0 over 1.6s
                            on a 0.4s delay (yoyo loop). Marks the
                            upcoming item as "in progress". */}
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-[rgb(var(--pnl-warn)/0.45)]"
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{
                            duration: 1.6,
                            delay: 0.4,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeOut",
                          }}
                        />
                        <span className="relative block w-3.5 h-3.5 rounded-full border-2 border-[rgb(var(--pnl-warn)/0.55)] bg-background" />
                      </span>
                    )}
                  </motion.div>

                  {/* Spacer for the other half on desktop */}
                  <div className="hidden md:block md:w-1/2" aria-hidden />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer line */}
        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-col items-center gap-3 text-center">
            <div className="divider-grad w-40" aria-hidden />
            <p className="text-sm text-secondary">
              <span className="text-primary font-medium">✓</span>{" "}
              {es
                ? "Tu licencia incluye las actualizaciones de tu versión mayor. Las próximas, con descuento."
                : "Your license includes updates within your major version. Future majors at a discount."}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
