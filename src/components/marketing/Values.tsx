"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * Values — the four product principles. Local always · One-time payment ·
 * Discipline > metrics · Made by traders. A 2×2 grid of liquid-glass cards with a
 * number, title, and description; subtle accent edge + lift on hover.
 *
 * Motion: cards reveal with staggered y, the accent rule grows on hover,
 * the number ghost-tracks the accent color on hover.
 */

interface Value {
  num: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  /** Small SVG mark per card — keeps the grid visually rhythmic. */
  icon: React.ReactNode;
}

const VALUES: Value[] = [
  {
    num: "01",
    titleEs: "Local siempre",
    titleEn: "Local always",
    descEs:
      "Tus datos son tuyos. Punto. Sin nube, sin servidores, sin tracking.",
    descEn:
      "Your data is yours. Period. No cloud, no servers, no tracking.",
    icon: <LockIcon />,
  },
  {
    num: "02",
    titleEs: "Pago único, no suscripción",
    titleEn: "One-time, not subscription",
    descEs:
      "Compras una vez. Es tuyo para siempre. No te retenemos con pagos mensuales.",
    descEn:
      "Buy once. It's yours forever. We don't hold you with monthly payments.",
    icon: <CoinIcon />,
  },
  {
    num: "03",
    titleEs: "Disciplina > métricas",
    titleEn: "Discipline > metrics",
    descEs:
      "Las métricas sin disciplina son ruido. El journal te frena antes de la tontería.",
    descEn:
      "Metrics without discipline are noise. The journal stops you before the dumb trade.",
    icon: <ShieldIcon />,
  },
  {
    num: "04",
    titleEs: "Hecho por traders, para traders",
    titleEn: "Made by traders, for traders",
    descEs:
      "No es un SaaS de Silicon Valley. Es una app de escritorio hecha por alguien que opera.",
    descEn:
      "Not a Silicon Valley SaaS. A desktop app made by someone who trades.",
    icon: <CompassIcon />,
  },
];

export function Values() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section id="values" className="section bg-veil relative overflow-hidden scroll-mt-24">
      {/* subtle aurora tint to separate from neighbors */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none aurora-bg opacity-30"
      />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{es ? "Principios" : "Principles"}</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="mt-5 t-h2 text-primary"
            >
              {es ? (
                <>
                  Lo que <span className="text-gradient">creemos.</span>
                </>
              ) : (
                <>
                  What we <span className="text-gradient">believe.</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 text-lg text-secondary leading-relaxed">
              {es
                ? "Cuatro ideas que no son negociables. Si algún día dejamos de cumplirlas, la app deja de tener sentido."
                : "Four ideas that aren't negotiable. If we ever stop delivering on them, the app stops making sense."}
            </p>
          </Reveal>
        </div>

        {/* 2×2 grid */}
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {VALUES.map((v, i) => (
            <Reveal key={v.num} delay={0.1 + i * 0.08} className="h-full">
              <motion.article
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative liquid-glass depth-2 rounded-card p-6 h-full overflow-hidden transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                {/* Accent edge — grows on hover. Scaled up from 1.25 → 1.4
                    for a more pronounced lift; the base color is now a low
                    alpha accent tint (20 %) instead of a neutral divider
                    hairline so the brand reads through at rest and the rule
                    reads as a deliberate accent stripe, not just a brighter
                    neutral separator. Hover pushes to a 65 % accent tint. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-6 bottom-6 w-px bg-[rgb(var(--accent-base)/0.20)] origin-center transition-[transform,background-color] duration-300 group-hover:scale-y-[1.4] group-hover:bg-[rgb(var(--accent-base)/0.65)]"
                />
                {/* Soft corner glow on hover */}
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgb(var(--accent-base) / 0.35), transparent 70%)",
                  }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Icon container — switched from rounded-md to rounded-lg
                        to mirror the card radius (8px / .rounded-card) for a
                        cohesive surface language. Hover tints the icon stroke
                        to the accent green so the affordance reads as a live
                        accent, not a static mono glyph. Adds an inset accent
                        ring at base (0.18 alpha) so the icon reads as a
                        branded mark at rest, not a neutral chip — the brand
                        color is present before hover. The base ring deepens
                        to 0.30 on hover to match the existing hover shadow. */}
                    <span
                      className="shrink-0 w-9 h-9 rounded-lg liquid-glass flex items-center justify-center text-tertiary shadow-[inset_0_0_0_1px_rgb(var(--accent-base)/0.18)] transition-[color,box-shadow] duration-300 group-hover:text-[rgb(var(--accent-base))] group-hover:shadow-[inset_0_0_0_1px_rgb(var(--accent-base)/0.30)]"
                      aria-hidden="true"
                    >
                      {v.icon}
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] font-semibold text-tertiary tnum transition-colors duration-300 group-hover:text-secondary">
                      {/* Number split: current in secondary, total in tertiary
                          — same editorial treatment as Story's phase index. */}
                      <span className="text-secondary">{v.num}</span>
                      {" / 04"}
                    </span>
                  </div>
                </div>

                <h3 className="relative mt-5 t-h3 text-primary">
                  {es ? v.titleEs : v.titleEn}
                </h3>
                <p className="relative mt-2 text-sm text-secondary leading-relaxed">
                  {es ? v.descEs : v.descEn}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>

        {/* Footer coda — divider hidden on mobile so the long ES copy
            ("No son eslóganes. Son decisiones de producto." ~280px at
            text-sm) doesn't overflow the 335px content box when paired
            with the 64px divider + 12px gap. Text centers on mobile,
            returns to the left-aligned divider+text rhythm at sm+. */}
        <Reveal delay={0.4}>
          <div className="mt-10 flex items-center gap-3 text-sm text-tertiary justify-center text-center sm:justify-start sm:text-left">
            <span className="divider-grad w-16 hidden sm:block" aria-hidden />
            <span>
              {es
                ? "No son eslóganes. Son decisiones de producto."
                : "Not slogans. Product decisions."}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---- Inline icons (stroke = currentColor, 18px) ---- */
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v6M6.4 6.4h2.4a1.2 1.2 0 0 1 0 2.4H7.2m0 0h1.6a1.2 1.2 0 0 1 0 2.4H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5 3 3.5v3.2c0 3 2.2 5.6 5 6.8 2.8-1.2 5-3.8 5-6.8V3.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.8 8.2l1.6 1.6L10.4 6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.2 5.8 8.8 8.8 5.8 10.2 7.2 7.2l3-1.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
