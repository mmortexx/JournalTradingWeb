"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";

/**
 * HomeCTASection — mid-page navigation-card CTA on the home page.
 * Sits between FeaturePreview and FinalCTA. Three liquid-glass cards
 * linking to the dedicated sub-pages (Features, Demo, Pricing).
 *
 * Institutional polish (R2-c):
 *  - Each card uses the same machined-glass language as Bento +
 *    FeaturePreview: `.liquid-glass rounded-card p-6 h-full flex
 *    flex-col` + spring hover lift + accent-tinted border glow on
 *    hover (`hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)]`).
 *  - IconWell primitive (matches Bento's IconWell): `w-10 h-10
 *    rounded-lg bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]`
 *    with the glyph in `text-primary` — the machined 1px white top
 *    highlight catches the key light along the upper rim.
 *  - Card rhythm: IconWell → `text-xl md:text-2xl font-semibold
 *    text-primary` title → `text-sm text-secondary` description →
 *    CTA button pushed to the bottom via `mt-auto`.
 *  - CTA pattern (matches Pricing): the Pricing card uses the primary
 *    `bg-white text-black` button with accent-tinted shadow + hover
 *    lift; the Features + Demo cards use the secondary `liquid-glass
 *    border border-white/20 text-primary` button. Both share `h-12
 *    px-6 rounded-lg text-sm font-medium` for visual parity.
 *  - `.eyebrow` section header with `.text-gradient` highlight on the
 *    closing clause. `.grain` overlay for the premium printed feel.
 *  - Section background: soft radial accent glow at the top — anchors
 *    the section to the hero's dark video aesthetic without competing
 *    with the cards.
 *
 * Bilingual via `useLang()`. No indigo/blue. Accent gold used sparingly
 * for the headline gradient + the Pricing CTA's accent-tinted shadow.
 */
export function HomeCTASection() {
  const { lang } = useLang();
  const es = lang === "es";

  const cards = [
    {
      href: "/features",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16 14l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      titleEs: "Características",
      titleEn: "Features",
      descEs: "40+ métricas, disciplina, playbook en vivo y calendario P&L.",
      descEn: "40+ metrics, discipline, live playbook and P&L calendar.",
      ctaEs: "Ver todo",
      ctaEn: "See all",
      primary: false,
    },
    {
      href: "/demo",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 8h18M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      titleEs: "Demo en vivo",
      titleEn: "Live demo",
      descEs: "La app recreada en tu navegador, con datos de muestra realistas.",
      descEn: "The app recreated in your browser, with realistic sample data.",
      ctaEs: "Abrir demo",
      ctaEn: "Open demo",
      primary: false,
    },
    {
      href: "/pricing",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      titleEs: "Precios",
      titleEn: "Pricing",
      descEs: "Pago único. Sin suscripciones. Garantía de 30 días sin preguntas.",
      descEn: "One-time payment. No subscriptions. 30-day no-questions guarantee.",
      ctaEs: "Ver precios",
      ctaEn: "See pricing",
      primary: true,
    },
  ];

  return (
    <section className="section-tight cv-auto bg-black relative overflow-hidden">
      {/* Soft radial accent glow at the top — anchors the section to the
          hero's dark video aesthetic without competing with the cards. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-[0.05] bg-white"
      />

      {/* Section grain — opt-in `.grain` utility layers a 3 % fractalNoise
          overlay via ::after for the "expensive printed" feel. Matches
          Bento + FeaturePreview so the three home-page sections read as
          one continuous surface. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <Eyebrow className="justify-center">
            {es ? "Profundiza" : "Go deeper"}
          </Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Cada página, <span className="text-gradient">una razón para comprar.</span>
              </>
            ) : (
              <>
                Every page, <span className="text-gradient">a reason to buy.</span>
              </>
            )}
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {cards.map((card, i) => (
            <Reveal key={card.href} delay={i * 0.08} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                className="liquid-glass rounded-card p-6 h-full flex flex-col group transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)]"
              >
                {/* IconWell — machined icon container (matches Bento's IconWell). */}
                <span
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
                <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
                  {es ? card.titleEs : card.titleEn}
                </h3>
                <p className="mt-2 text-sm text-secondary leading-relaxed flex-1">
                  {es ? card.descEs : card.descEn}
                </p>
                {/* CTA button — pushed to the bottom via mt-auto so cards
                    of varying description length share the same button
                    baseline. Pricing card uses the primary bg-white
                    pattern; Features + Demo use the secondary liquid-glass
                    pattern. Both share h-12 px-6 rounded-lg text-sm
                    font-medium for visual parity. */}
                <Link
                  href={asset(card.href)}
                  className={`mt-6 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                    card.primary
                      ? "bg-white text-black shadow-[0_2px_8px_-2px_rgb(var(--accent-base)/0.40),0_1px_2px_rgb(0_0_0/0.20)] hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(var(--accent-base)/0.55),0_2px_8px_rgb(0_0_0/0.25)]"
                      : "liquid-glass border border-white/20 text-primary hover:bg-white hover:text-black hover:-translate-y-0.5"
                  }`}
                >
                  {es ? card.ctaEs : card.ctaEn}
                  <svg
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
