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
  /** Avatar background, expressed as a CSS rgb() on a design-system token. */
  hue: string;
  quoteEs: string;
  quoteEn: string;
}

/**
 * Six testimonials of varying length so the CSS-multicol masonry reads natural.
 * Names / roles are distinct from SocialProof's three to add fresh voices.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    name: "Helena Vidal",
    roleEs: "Discretionary · índices",
    roleEn: "Discretionary · indices",
    initials: "HV",
    hue: "rgb(var(--accent-base))",
    quoteEs:
      "Lo uso antes de cada sesión. Cinco minutos de revisión y entro con una idea clara, un plan y un límite. Antes operaba con sensaciones; ahora opero con datos.",
    quoteEn:
      "I use it before every session. Five minutes of review and I enter with a clear idea, a plan and a limit. I used to trade on feelings; now I trade on data.",
  },
  {
    name: "Pau Soler",
    roleEs: "Scalper · NQ",
    roleEn: "Scalper · NQ",
    initials: "PS",
    hue: "rgb(var(--pnl-pos))",
    quoteEs:
      "Por fin un diario que no me obliga a estar 20 minutos rellenando campos después de cada trade.",
    quoteEn:
      "Finally a journal that doesn't make me spend 20 minutes filling in fields after every trade.",
  },
  {
    name: "Núria Camps",
    roleEs: "Swing trader · acciones",
    roleEn: "Swing trader · stocks",
    initials: "NC",
    hue: "rgb(var(--pnl-warn))",
    quoteEs:
      "El filtro de setup me enseñó que uno de mis cuatro setups era simplemente ruido. Lo retiré y la curva mejoró de inmediato.",
    quoteEn:
      "The setup filter taught me that one of my four setups was just noise. I retired it and the curve improved immediately.",
  },
  {
    name: "Jordi Mas",
    roleEs: "Crypto · Binance",
    roleEn: "Crypto · Binance",
    initials: "JM",
    hue: "rgb(var(--accent-base))",
    quoteEs:
      "Importo el CSV de Binance, mapeo las columnas una vez y olvido. Cada semana tengo el P&L desglosado por par, por sesión y por setup sin tocar Excel.",
    quoteEn:
      "I import Binance's CSV, map the columns once and forget. Every week I have P&L broken down by pair, session and setup without touching Excel.",
  },
  {
    name: "Clara Puig",
    roleEs: "Options · SPX",
    roleEn: "Options · SPX",
    initials: "CP",
    hue: "rgb(var(--pnl-pos))",
    quoteEs:
      "El coste de indisciplina me abrió los ojos. Llevaba meses culpando al mercado; el problema era que entraba fuera de plan un 22 % de las veces y esos trades eran el 60 % de mi drawdown. Ahora veo ese número cada mañana y se acabó.",
    quoteEn:
      "The cost-of-indiscipline metric opened my eyes. I'd been blaming the market for months; the problem was I was entering out of plan 22% of the time and those trades were 60% of my drawdown. Now I see that number every morning and it's over.",
  },
  {
    name: "Oriol Gil",
    roleEs: "Prop trader · Topstep",
    roleEn: "Prop trader · Topstep",
    initials: "OG",
    hue: "rgb(var(--pnl-warn))",
    quoteEs:
      "El modo prop firm me avisa antes de que rompa una regla. He salvado dos retos gracias a eso.",
    quoteEn:
      "Prop firm mode warns me before I break a rule. I've saved two challenges thanks to that.",
  },
];

/** Larger testimonials wall — six voices in a masonry layout. Bilingual. */
export function TestimonialsWall() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section cv-auto bg-veil relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Lo que dicen" : "What they say"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Traders que ya operan <span className="text-gradient">con disciplina.</span>
              </>
            ) : (
              <>
                Traders already operating <span className="text-gradient">with discipline.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Voces honestas de traders manuales que ya usan el diario para medir y corregir. No son influencers: pagan la licencia con su operativa."
              : "Honest voices from manual traders who already use the journal to measure and correct. They aren't influencers: they pay for the license with their trading."}
          </p>
        </Reveal>

        <div className="mt-10 columns-1 md:columns-2 lg:columns-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="group relative liquid-glass depth-1 rounded-card p-5 mb-4 break-inside-avoid transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              {/* Accent border glow on hover. */}
              <div
                className="absolute inset-0 rounded-card pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px rgb(var(--accent-base) / 0.35), 0 0 24px rgb(var(--accent-base) / 0.15)`,
                }}
              />

              {/* Rating stars + verified chip. */}
              <div className="relative flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5" aria-label={es ? "5 de 5 estrellas" : "5 of 5 stars"}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <svg
                      key={k}
                      width="13"
                      height="13"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 1.5l2 4 4.5.5-3.25 3 .9 4.4L8 11.3l-4.15 2.1.9-4.4L1.5 6 6 5.5l2-4z"
                        fill="rgb(var(--accent-base))"
                      />
                    </svg>
                  ))}
                </div>
                <span className="pill bg-white/5 text-tertiary border border-white/10 flex items-center gap-1 text-[10px]">
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6.5l2.5 2.5L10 3.5"
                      stroke="rgb(var(--pnl-pos))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {es ? "Verificado" : "Verified"}
                </span>
              </div>

              {/* Quote — curly quotes flank the text, accent-tinted. */}
              <blockquote className="relative text-[14px] text-secondary leading-relaxed">
                <span className="text-primary mr-1 text-base">“</span>
                {es ? t.quoteEs : t.quoteEn}
                <span className="text-primary ml-1 text-base">”</span>
              </blockquote>

              {/* Author — SVG-initials avatar + name + role. */}
              <div className="relative mt-4 pt-4 flex items-center gap-3 border-t">
                <span
                  className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: t.hue }}
                  aria-hidden="true"
                >
                  {t.initials}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-primary truncate">{t.name}</span>
                  <span className="text-xs text-tertiary truncate">{es ? t.roleEs : t.roleEn}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
