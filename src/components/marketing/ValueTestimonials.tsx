"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * ValueTestimonials — compact 3-testimonial row focused on value-for-money.
 *
 * Sits between TrustStrip and StatsBand on the Pricing page. Distinct from
 * the main SocialProof component:
 *  - Smaller, denser cards (no tilt parallax, no particle constellation).
 *  - Quotes are specifically framed around ROI / "paid for itself" / one-time
 *    vs subscription / price-vs-value, to reinforce the purchase decision.
 *  - Each card carries a "value chip" — a single highlighted stat the trader
 *    attributes to the app (e.g. "−$1,200 / year in indiscipline").
 *  - Names/roles are deliberately different from SocialProof and
 *    TestimonialsWall so the page surfaces fresh voices.
 */

interface ValueTestimonial {
  name: string;
  roleEs: string;
  roleEn: string;
  initials: string;
  hue: string;
  quoteEs: string;
  quoteEn: string;
  /** Short value-chip stat — rendered as a highlighted pill. */
  chipEs: string;
  chipEn: string;
}

const TESTIMONIALS: ValueTestimonial[] = [
  {
    name: "Adrià Vela",
    roleEs: "Day trader · MES",
    roleEn: "Day trader · MES",
    initials: "AV",
    hue: "rgb(var(--accent-base))",
    quoteEs:
      "Una sola operación evitada gracias al guardián de disciplina ya paga la licencia. Lo amorticé la primera semana.",
    quoteEn:
      "A single trade avoided thanks to the discipline guardian already pays for the license. I broke even the first week.",
    chipEs: "Amortizado en 1 semana",
    chipEn: "Paid back in 1 week",
  },
  {
    name: "Marta Lleida",
    roleEs: "Swing · forex",
    roleEn: "Swing · FX",
    initials: "ML",
    hue: "rgb(var(--pnl-pos))",
    quoteEs:
      "Venía pagando 39 €/mes por un journal en la nube. Aquí pagué una vez y dejé de pagar para siempre. Misma información, sin recurrencia.",
    quoteEn:
      "I'd been paying €39/month for a cloud journal. Here I paid once and stopped paying forever. Same insight, no recurrence.",
    chipEs: "−468 €/año vs nube",
    chipEn: "−€468/year vs cloud",
  },
  {
    name: "Iván Riera",
    roleEs: "Prop trader · Topstep",
    roleEn: "Prop trader · Topstep",
    initials: "IR",
    hue: "rgb(var(--pnl-warn))",
    quoteEs:
      "$49 por algo que uso cinco horas al día. El ROI es obsceno. Y sin miedo a que me suban el precio mañana.",
    quoteEn:
      "$49 for something I use five hours a day. The ROI is obscene. And no fear of a price hike tomorrow.",
    chipEs: "ROI ×100",
    chipEn: "ROI ×100",
  },
];

export function ValueTestimonials() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={es ? "Valor por dinero" : "Value for money"}
      className="section-tight relative overflow-hidden"
    >
      {/* Faint accent wash — single radial glow, no particle field, to keep
          this section lighter than the main SocialProof band. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[360px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
          opacity: 0.06,
        }}
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center">
            <Eyebrow>{es ? "Valor por dinero" : "Value for money"}</Eyebrow>
          </div>
          <h2
            className="mt-5 t-h2 text-primary"
          >
            {es ? (
              <>
                Lo que cuesta una <span className="text-gradient">operación tonta.</span>
              </>
            ) : (
              <>
                The cost of one <span className="text-gradient">dumb trade.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-base text-secondary leading-relaxed">
            {es
              ? "No es barato porque sea cutre. Es barato porque no hay servidor que mantener ni accionistas a los que pagar."
              : "It isn't cheap because it's shoddy. It's cheap because there's no server to maintain and no shareholders to pay."}
          </p>
        </Reveal>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={
                reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }
              className="group relative liquid-glass depth-2 rounded-card p-5 flex flex-col gap-4 h-full overflow-hidden"
            >
              {/* Hover accent border glow. */}
              <div
                className="absolute inset-0 rounded-card pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px rgb(var(--accent-base) / 0.35), 0 0 24px rgb(var(--accent-base) / 0.15)`,
                }}
                aria-hidden="true"
              />

              {/* Value chip — the headline stat the trader attributes to the app. */}
              <div className="relative flex items-center justify-between gap-2">
                <span className="pill bg-[rgb(var(--divider)/0.05)] text-primary border border-[rgb(var(--divider)/0.20)] !text-[11px] uppercase tracking-[0.1em] tnum">
                  {es ? t.chipEs : t.chipEn}
                </span>
                <span
                  className="inline-flex items-center gap-0.5"
                  aria-label={es ? "5 de 5 estrellas" : "5 of 5 stars"}
                >
                  {[0, 1, 2, 3, 4].map((k) => (
                    <motion.svg
                      key={k}
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      initial={{ opacity: 0, scale: 0.3 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.4,
                        delay: 0.15 + k * 0.06 + i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <path
                        d="M8 1.5l2 4 4.5.5-3.25 3 .9 4.4L8 11.3l-4.15 2.1.9-4.4L1.5 6 6 5.5l2-4z"
                        fill="rgb(var(--accent-base))"
                      />
                    </motion.svg>
                  ))}
                </span>
              </div>

              {/* Quote — compact, slightly smaller than the main SocialProof.
                  The opening/closing quote marks are lifted to editorial
                  accents: a 2xl serif glyph in the accent green, sitting on
                  the baseline of the body text so they read as decorative
                  drop-cap-style marks rather than inline punctuation (R20-3c). */}
              <blockquote className="relative text-[13.5px] text-secondary leading-relaxed flex-1">
                <span
                  aria-hidden="true"
                  className="font-serif text-2xl leading-none text-[rgb(var(--accent-base))] mr-1 align-[-0.18em]"
                >
                  “
                </span>
                {es ? t.quoteEs : t.quoteEn}
                <span
                  aria-hidden="true"
                  className="font-serif text-2xl leading-none text-[rgb(var(--accent-base))] ml-0.5 align-[-0.18em]"
                >
                  ”
                </span>
              </blockquote>

              {/* Author */}
              <div className="relative pt-3 border-t  flex items-center gap-2.5">
                {/* Avatar — refined with a 1px inset divider ring + a soft
                    drop shadow so the colored circle reads as a polished
                    monogram rather than a flat color swatch. Text uses
                    --accent-pressed (a dark green that pairs with the
                    accent/pnl-pos/pnl-warn backgrounds in BOTH themes) so
                    the initials stay legible regardless of which accent
                    palette is active or which theme is on (R20-3c). */}
                <span
                  className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold text-[rgb(var(--accent-pressed))] shrink-0 ring-1 ring-inset ring-[rgb(var(--divider)/0.15)] shadow-[0_2px_8px_rgb(0_0_0/0.18)]"
                  style={{ background: t.hue }}
                >
                  {t.initials}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-primary truncate">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-tertiary truncate">
                    {es ? t.roleEs : t.roleEn}
                  </span>
                </div>
                {/* Verified check */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="ml-auto text-pnl-pos shrink-0"
                  aria-label={es ? "Verificado" : "Verified"}
                >
                  <circle cx="6" cy="6" r="5.5" fill="rgb(var(--pnl-pos) / 0.18)" />
                  <path
                    d="M3.5 6.2l1.8 1.8L8.5 4.8"
                    stroke="rgb(var(--pnl-pos))"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
