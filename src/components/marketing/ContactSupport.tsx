"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentType } from "react";
import { Mail, BookOpen, MessagesSquare, ArrowRight } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * ContactSupport — three contact-option cards shown right under the FAQ.
 *
 * Design:
 *  - `liquid-glass rounded-card p-6` cards in `grid md:grid-cols-3 gap-4`.
 *  - Each card: accent icon chip, title, description, optional meta tag,
 *    and a CTA row with an arrow that nudges on hover.
 *  - Hover lift: `whileHover={{ y: -4 }}` with a soft spring.
 *  - Accent sweep line fades in along the top edge on hover.
 *  - Accent-only palette — no indigo/blue.
 */

type Card = {
  icon: ComponentType<{ className?: string }>;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  metaEs?: string;
  metaEn?: string;
  ctaEs: string;
  ctaEn: string;
  href: string;
};

const CARDS: Card[] = [
  {
    icon: Mail,
    titleEs: "Email",
    titleEn: "Email",
    descEs: "soporte@tradingjournal.app",
    descEn: "soporte@tradingjournal.app",
    metaEs: "Respuesta en 24h",
    metaEn: "Reply in 24h",
    ctaEs: "Escribir",
    ctaEn: "Write us",
    href: "mailto:soporte@tradingjournal.app",
  },
  // `href="#"` for the two cards below is intentional (R20-2b): the docs
  // portal and the Discord/Telegram community are not live yet. Replace
  // with real URLs when those land.
  {
    icon: BookOpen,
    titleEs: "Documentación",
    titleEn: "Documentation",
    descEs: "Guías y tutoriales",
    descEn: "Guides and tutorials",
    ctaEs: "Consultar",
    ctaEn: "Browse",
    href: "#",
  },
  {
    icon: MessagesSquare,
    titleEs: "Comunidad",
    titleEn: "Community",
    descEs: "Discord + Telegram",
    descEn: "Discord + Telegram",
    ctaEs: "Unirme",
    ctaEn: "Join",
    href: "#",
  },
];

export function ContactSupport() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  return (
    <section
      id="support"
      aria-label={es ? "Soporte" : "Support"}
      className="section-tight relative overflow-hidden scroll-mt-24"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="flex justify-center">
              <Eyebrow>{es ? "Soporte" : "Support"}</Eyebrow>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="mt-5 t-h2 text-primary"
            >
              {es ? (
                <>
                  ¿No encuentras tu <span className="text-gradient">respuesta?</span>
                </>
              ) : (
                <>
                  Can&apos;t find your <span className="text-gradient">answer?</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-secondary leading-relaxed max-w-xl mx-auto">
              {es
                ? "Tres caminos para resolver cualquier duda. Te respondemos rápido y en tu idioma."
                : "Three ways to solve any question. We reply quickly and in your language."}
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            const title = es ? c.titleEs : c.titleEn;
            const desc = es ? c.descEs : c.descEn;
            const meta = es ? c.metaEs : c.metaEn;
            const cta = es ? c.ctaEs : c.ctaEn;
            return (
              <Reveal key={c.titleEn} delay={0.12 + i * 0.06} y={20}>
                <motion.a
                  href={c.href}
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  aria-label={`${title} — ${cta}`}
                  className="group relative block liquid-glass depth-2 rounded-card p-5 sm:p-6 h-full overflow-hidden transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgb(var(--accent-base)/0.30)] hover:shadow-[0_12px_36px_rgb(var(--accent-base)/0.14)]"
                >
                  {/* Hover accent sweep */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base)) 50%, transparent 100%)",
                    }}
                  />

                  <div className="flex items-start gap-4">
                    {/* Icon container — accent-tinted on hover so the icon
                        "lights up" in the brand green when the card is
                        hovered. Adds a soft accent drop-shadow on hover
                        to deepen the lift and tie the icon to the accent
                        sweep on the top edge (R20-3c). */}
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] shadow-[inset_0_1px_0_rgb(var(--divider)/0.08)] text-primary group-hover:bg-[rgb(var(--accent-base)/0.12)] group-hover:border-[rgb(var(--accent-base)/0.30)] group-hover:text-[rgb(var(--accent-base))] group-hover:shadow-[inset_0_1px_0_rgb(var(--divider)/0.10),0_4px_14px_-4px_rgb(var(--accent-base)/0.30)] transition-[background-color,border-color,box-shadow,color] duration-300"
                      aria-hidden="true"
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="t-h3 text-primary">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-secondary break-words">
                        {desc}
                      </p>
                      {meta && (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-primary font-semibold tnum">
                          {meta}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {cta}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
