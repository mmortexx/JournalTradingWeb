"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";

/**
 * Guardian — discipline guardian section. Animated SVG shield with a
 * single subtle expanding ring on the left, copy + bullet list of
 * pre-trade checks on the right.
 *
 * Animation layers:
 *  - Single subtle ring that expands once on scroll-into-view.
 *  - Bullet cards wrapped in a liquid-glass frame with hover accent glow.
 *  - Scroll parallax: shield translates slower than copy.
 */

function Shield() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="guard-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent-hover))" />
          <stop offset="100%" stopColor="rgb(var(--accent-pressed))" />
        </linearGradient>
      </defs>
      <path
        d="M60 12L96 24v28c0 22-14 40-36 50C38 92 24 74 24 52V24l36-12z"
        fill="url(#guard-grad)"
        opacity="0.18"
      />
      <path
        d="M60 12L96 24v28c0 22-14 40-36 50C38 92 24 74 24 52V24l36-12z"
        stroke="rgb(var(--accent-base))"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M44 60l11 11 22-22"
        stroke="rgb(var(--accent-base))"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Guardian() {
  const { lang } = useLang();
  const es = lang === "es";

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Shield translates slower than copy → parallax depth.
  // Ranges kept small so the stacked mobile layout (gap-12 = 48px) never overlaps:
  // max gap reduction = 24 + 12 = 36px < 48px.
  const shieldY = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const copyY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  const checks = [
    {
      title: es ? "Horario permitido" : "Allowed time window",
      desc: es
        ? "Tu sesión es NY. Intentas operar a las 03:00 UTC — la app te lo hace notar."
        : "Your session is NY. You try to trade at 03:00 UTC — the app flags it.",
    },
    {
      title: es ? "Tamaño máximo" : "Max size",
      desc: es
        ? "Tu plan dice 1 % de riesgo. Pones 3 % — la app te pide que confirmes con una razón escrita."
        : "Your plan says 1 % risk. You put 3 % — the app asks you to confirm with a written reason.",
    },
    {
      title: es ? "Setup en tu playbook" : "Setup in your playbook",
      desc: es
        ? "Operas un patrón que nunca has documentado — la app te pregunta si lo quieres añadir o salir."
        : "You trade a pattern you've never documented — the app asks if you want to add it or step out.",
    },
    {
      title: es ? "Estado mental" : "Mental state",
      desc: es
        ? "Llevas tres perdedoras seguidas — la app te recuerda tu regla de pausa y te ofrece 15 minutos."
        : "You're on a three-loss streak — the app reminds you of your pause rule and offers 15 minutes.",
    },
  ];

  return (
    <section ref={sectionRef} className="section relative overflow-hidden">
      {/* Soft ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* LEFT — animated shield */}
        <Reveal className="order-2 lg:order-1 flex justify-center py-8 md:py-12">
          <motion.div
            style={{ y: shieldY }}
            className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] flex items-center justify-center"
          >
            {/* Live market backdrop behind the shield has been removed for
                a cleaner, more professional look — the body's acrylic
                background is enough. */}

            {/* Single subtle pulse ring — expands once on scroll-into-view
                (no infinite loop, no stack of shockwaves). */}
            <motion.span
              className="absolute rounded-full border border-white/25"
              style={{ width: "55%", height: "55%" }}
              initial={{ scale: 0.6, opacity: 0.5 }}
              whileInView={{ scale: 1.6, opacity: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            />

            {/* Static ring */}
            <span
              className="absolute rounded-full border border-white/20"
              style={{ width: "70%", height: "70%" }}
              aria-hidden="true"
            />

            {/* Static accent glow behind the shield */}
            <div
              aria-hidden="true"
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "64%",
                height: "64%",
                background:
                  "radial-gradient(circle, rgb(var(--accent-base) / 0.45), transparent 70%)",
                filter: "blur(22px)",
                opacity: 0.5,
              }}
            />

            {/* Inner liquid-glass disc — liquid-glass for the hero shield container. */}
            <div className="relative liquid-glass rounded-full w-[58%] h-[58%] flex items-center justify-center">
              <Shield />
            </div>

            {/* Static check chips */}
            <span
              className="absolute -top-1 right-4 liquid-glass rounded-pill px-3 py-1.5 text-[11px] font-medium text-pnl-pos tnum cursor-default"
            >
              ✓ {es ? "Plan cumplido" : "Plan followed"}
            </span>
            <span
              className="absolute bottom-2 -left-2 liquid-glass rounded-pill px-3 py-1.5 text-[11px] font-medium text-pnl-warn tnum cursor-default"
            >
              ! {es ? "Tamaño > plan" : "Size > plan"}
            </span>
          </motion.div>
        </Reveal>

        {/* RIGHT — copy + checks */}
        <motion.div style={{ y: copyY }} className="order-1 lg:order-2">
          <Reveal>
            <Eyebrow>{es ? "Disciplina preventiva" : "Pre-trade discipline"}</Eyebrow>
            <h2
              className="mt-5 t-h2 text-primary"
            >
              {es ? (
                <>
                  El guardián que te frena{" "}
                  <span className="text-gradient">antes de la tontería.</span>
                </>
              ) : (
                <>
                  The guardian that stops you{" "}
                  <span className="text-gradient">before the dumb trade.</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-lg text-secondary leading-relaxed max-w-xl">
              {es
                ? "Antes de cada operación, la app comprueba si cumples tus propias reglas. Si no las cumples, te pregunta: ¿seguro? No te impide operar — te obliga a decidir a sangre fría."
                : "Before every trade, the app checks whether you're following your own rules. If you're not, it asks: are you sure? It doesn't stop you from trading — it forces you to decide cold-headed."}
            </p>
          </Reveal>

          <div className="mt-10 grid sm:grid-cols-2 gap-3">
            {checks.map((c, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <motion.div
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                  className="group liquid-glass depth-1 rounded-card p-4 h-full relative overflow-hidden transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)]"
                >
                    {/* Accent glow on hover */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 0%, rgb(var(--accent-base) / 0.18), transparent 70%)",
                      }}
                    />
                    <div className="relative flex items-start gap-3">
                      <span
                        className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-white/5 border border-white/10 text-primary flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path
                            d="M3 6.5l2 2 4-4.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <div>
                        <h3 className="t-h3 text-primary">{c.title}</h3>
                        <p className="mt-1 text-xs text-secondary leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
