"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

interface Testimonial {
  name: string;
  roleEs: string;
  roleEn: string;
  initials: string;
  hue: string;
  quoteEs: string;
  quoteEn: string;
  yearsTrading: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Marc Riba",
    roleEs: "Prop trader · FTMO",
    roleEn: "Prop trader · FTMO",
    initials: "MR",
    hue: "rgb(var(--accent-base))",
    quoteEs:
      "Llevaba años en Excel. La primera semana con este diario descubrí que mis operaciones fuera de plan me estaban costando un 18 % de la cuenta al año. Brutal.",
    quoteEn:
      "I'd been on Excel for years. The first week with this journal I discovered that my out-of-plan trades were costing me 18% of my account per year. Brutal.",
    yearsTrading: 7,
  },
  {
    name: "Aina Forns",
    roleEs: "Swing trader · divisas",
    roleEn: "Swing trader · FX",
    initials: "AF",
    hue: "rgb(var(--pnl-pos))",
    quoteEs:
      "El ritual pre y post mercado me ha devuelto una disciplina que creía perdida. Lo más útil: ver el coste de indisciplina en dinero, no en sensaciones.",
    quoteEn:
      "The pre- and post-market ritual has given me back a discipline I thought I'd lost. The most useful thing: seeing the cost of indiscipline in money, not in feelings.",
    yearsTrading: 4,
  },
  {
    name: "Daniel Sáez",
    roleEs: "Futuros · ES & NQ",
    roleEn: "Futures · ES & NQ",
    initials: "DS",
    hue: "rgb(var(--pnl-warn))",
    quoteEs:
      "Probar 1.000 veces mi secuencia con Monte Carlo me hizo reducir el riesgo de 1.5 % a 0.8 %. Lo pagué una vez; me ha ahorrado mucho más que eso.",
    quoteEn:
      "Running 1,000 permutations of my sequence with Monte Carlo made me cut risk from 1.5% to 0.8%. I paid once; it has saved me much more than that.",
    yearsTrading: 11,
  },
];

/** Testimonials section. Three cards with avatar, role, quote, rating, verified badge. */
export function SocialProof() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section cv-auto bg-veil relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Voces reales" : "Real voices"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Traders que ya <span className="text-gradient">dejaron Excel.</span>
              </>
            ) : (
              <>
                Traders who already <span className="text-gradient">left Excel.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "No son influencers. Son traders manuales serios que operan todos los días y nos dicen lo que cambiarían."
              : "They aren't influencers. They are serious manual traders who trade every day and tell us what they would change."}
          </p>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="group relative liquid-glass depth-2 rounded-card overflow-hidden h-full transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {/* Accent border glow on hover. */}
              <div
                className="absolute inset-0 rounded-card pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px rgb(var(--accent-base) / 0.35), 0 0 24px rgb(var(--accent-base) / 0.15)`,
                }}
              />

              <div className="p-6 flex flex-col gap-5 h-full">
                {/* Rating — stars pop in sequence on view. */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5" aria-label="5 de 5 estrellas">
                      {[0, 1, 2, 3, 4].map((k) => (
                        <motion.svg
                          key={k}
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          initial={{ opacity: 0, scale: 0.3, rotate: -40 }}
                          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{
                            duration: 0.45,
                            delay: 0.2 + k * 0.1 + i * 0.12,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <path
                            d="M8 1.5l2 4 4.5.5-3.25 3 .9 4.4L8 11.3l-4.15 2.1.9-4.4L1.5 6 6 5.5l2-4z"
                            fill="rgb(var(--accent-base))"
                          />
                        </motion.svg>
                      ))}
                    </div>
                    <span className="pill bg-[rgb(var(--divider)/0.05)] text-tertiary border border-[rgb(var(--divider)/0.10)] tnum">
                      {t.yearsTrading} {es ? "años operando" : "yrs trading"}
                    </span>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-[14.5px] text-secondary leading-relaxed">
                    <span className="text-primary mr-1 text-base">“</span>
                    {es ? t.quoteEs : t.quoteEn}
                    <span className="text-primary ml-1 text-base">”</span>
                  </blockquote>

                  {/* Author */}
                  <div className="mt-auto pt-4 flex items-center gap-3 border-t ">
                    {/* Avatar wrapper — relative so the verified badge (sibling) can sit at the corner without being clipped by the avatar's overflow-hidden. */}
                    <div className="relative shrink-0">
                      <span
                        className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: t.hue }}
                      >
                        {t.initials}
                      </span>
                      {/* Verified badge — scales in, then the check draws via pathLength. Sits outside the avatar so it isn't clipped. */}
                      <motion.span
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-pnl-pos border-2 border-[rgb(var(--card))] flex items-center justify-center"
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 18,
                          delay: 0.35 + i * 0.12,
                        }}
                      >
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" aria-label={es ? "Verificado" : "Verified"}>
                          <motion.path
                            d="M2 6.5l2.5 2.5L10 3.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                              duration: 0.6,
                              delay: 0.55 + i * 0.12,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          />
                        </svg>
                      </motion.span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="t-h4 text-primary truncate">{t.name}</span>
                      <span className="text-xs text-tertiary truncate">{es ? t.roleEs : t.roleEn}</span>
                    </div>
                  </div>
                </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
