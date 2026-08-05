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

  /* ── Por qué aquí ya no hay historial ────────────────────────────────
     Esta lista presentaba v1.0, v1.2, v1.3 y v1.4 como versiones YA
     publicadas, con fechas de enero a julio de 2026 —o sea, en el
     pasado— de un producto que todavía no se puede comprar. El pie
     remataba con «v1.4.2» y un punto verde de «sistemas operativos».

     Era el último resto de una tanda de contenido inventado que ya se
     había limpiado en el resto del sitio: se retiraron testimonios de
     personas que no existen y una valoración de 4,8 sobre 47 reseñas que
     tampoco. Esto se quedó, y desentonaba con todo lo demás.

     Hay además una incoherencia de fondo que NO me corresponde resolver
     y que dejo señalada: tres de estas entradas describen funciones que
     la página de precios vende como incluidas desde el primer día —el
     playbook con estadísticas y el Monte Carlo en los planes, el modo
     prop firm y el importador en Pro—. O son del lanzamiento, o son
     futuras, pero no las dos cosas. Al fundir lo publicado en una única
     entrada de lanzamiento, la contradicción se reduce a las dos últimas
     líneas del plan, que son decisión de producto. */
  const entries: Entry[] = es
    ? [
        {
          version: "v1.0",
          title: "Lanzamiento inicial",
          description:
            "El journal completo: métricas, calendario, curva de capital, playbook con estadísticas, el guardián de disciplina e importación por CSV.",
          date: "En preparación",
          kind: "next",
        },
        {
          version: "v1.5",
          title: "Importador de rivales",
          description: "Importa tu historial de otro journal en 5 minutos",
          date: "Después del lanzamiento",
          kind: "next",
        },
        {
          version: "v1.6",
          title: "Backtesting visual",
          description: "Replay del mercado con tus reglas de setup",
          date: "Más adelante",
          kind: "next",
        },
        {
          version: "v2.0",
          title: "Modo prop firm avanzado",
          description:
            "Reglas de pérdida diaria, drawdown máximo y reset",
          date: "Más adelante",
          kind: "next",
        },
      ]
    : [
        {
          version: "v1.0",
          title: "Initial launch",
          description:
            "The full journal: metrics, calendar, equity curve, playbook with live stats, the discipline guardian and CSV import.",
          date: "In preparation",
          kind: "next",
        },
        {
          version: "v1.5",
          title: "Rival importer",
          description: "Import your history from another journal in 5 minutes",
          date: "After launch",
          kind: "next",
        },
        {
          version: "v1.6",
          title: "Visual backtesting",
          description: "Market replay with your setup rules",
          date: "Later",
          kind: "next",
        },
        {
          version: "v2.0",
          title: "Advanced prop firm mode",
          description: "Daily loss rules, max drawdown and reset",
          date: "Later",
          kind: "next",
        },
      ];

  return (
    <section id="changelog" className="section cv-auto bg-veil relative overflow-hidden scroll-mt-24">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 tj-container">
        {/* Header */}
        <div className="relative max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="relative flex justify-center">
              {/* «Changelog» prometía un historial de versiones publicadas
                  que no existe. Esto es un plan, y se llama plan. */}
              <Eyebrow>{es ? "Hoja de ruta" : "Roadmap"}</Eyebrow>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="relative mt-5 t-h2 text-primary"
            >
              {es ? (
                <>
                  Lo que viene, <span className="text-gradient">y en qué orden.</span>
                </>
              ) : (
                <>
                  What's coming, <span className="text-gradient">and in what order.</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="relative mt-4 text-lg text-secondary max-w-xl mx-auto leading-[1.6]">
              {/* Decía «cada versión se construye sobre el feedback de
                  traders reales» y «lo que ya está en tu mano». Ninguna
                  de las dos cosas puede ser cierta todavía: no hay
                  versiones publicadas ni, por tanto, usuarios. */}
              {es
                ? "Sin fechas cerradas: se publican cuando estén, no cuando toque. Apúntate a la lista y te avisamos en cada una."
                : "No fixed dates: they ship when they are ready, not when a calendar says so. Join the list and we'll tell you at each one."}
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
                        className={`tj-paper rounded-[2px] border border-[rgb(var(--divider)/0.13)] p-5 h-full min-w-0 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isPast
                            ? "hover:border-[rgb(var(--accent-base)/0.30)]"
                            : "hover:border-[rgb(var(--divider)/0.25)]"
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

                          {/* Título siempre a pleno contraste. Las
                              entregas futuras se atenuaban por triplicado
                              —tarjeta al 90 %, título al 90 % y descripción
                              en gris terciario—, así que media sección se
                              leía como deshabilitada. El chip "Próximo" y
                              el borde discontinuo ya dicen que aún no está;
                              no hace falta apagar el texto. */}
                          <h3 className="mt-3 t-h4 text-primary">
                            {entry.title}
                          </h3>
                          <p
                            className={`mt-1.5 text-sm leading-[1.6] ${
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

                  {/* Node dot — pops in on view. Past: solid accent dot.
                      Future: hollow ring signals "in progress". */}
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
                      <span className="block w-3.5 h-3.5 rounded-full bg-[rgb(var(--accent-base))]" />
                    ) : (
                      <span className="relative block w-3.5 h-3.5 rounded-full border-2 border-[rgb(var(--pnl-warn)/0.55)] bg-background" />
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
              <span className="text-[rgb(var(--pnl-pos))] font-medium">✓</span>{" "}
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
