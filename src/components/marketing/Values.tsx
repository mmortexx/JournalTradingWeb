"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { SectionHeader } from "@/components/layout/SectionHeader";

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
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 tj-container">
        {/* Cabecera PARTIDA — titular a un lado, entradilla al otro.
            Aquí estaba el `max-w-2xl` con todo apilado a la izquierda,
            igual que en las otras diecisiete secciones del sitio: media
            pantalla vacía a la derecha y la misma presentación por
            enésima vez. Esta sección es la que mejor admite la partida
            porque su entradilla tiene cuerpo suficiente para sostener
            una columna propia. Ver `SectionHeader`. */}
        <SectionHeader
          composicion="partida"
          etiqueta={es ? "Principios" : "Principles"}
          titulo={
            es ? (
              <>
                Lo que <span className="text-gradient">creemos.</span>
              </>
            ) : (
              <>
                What we <span className="text-gradient">believe.</span>
              </>
            )
          }
          entradilla={
            es
              ? "Cuatro ideas que no son negociables. Si algún día dejamos de cumplirlas, la app deja de tener sentido."
              : "Four ideas that aren't negotiable. If we ever stop delivering on them, the app stops making sense."
          }
        />

        {/* 2×2 grid
            T2d — `gap-5 md:gap-6` (20px / 24px) entre tarjetas (era
            `gap-5` 20px fijo): en móvil el Δ es nulo, en desktop sube
            4px para que las 4 tarjetas respiren sin abrirse un hueco
            tipográfico. El grid sigue 1-col en móvil, 2-col en md+ (que
            es el 2×2 efectivo en lg). */}
        <div className="mt-10 grid md:grid-cols-2 gap-5 md:gap-6">
          {VALUES.map((v, i) => (
            <Reveal key={v.num} delay={0.1 + i * 0.08} className="h-full">
              <motion.article
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                // T3c — swap `liquid-glass` por `.tj-paper`: las 4 tarjetas
                // de principios ahora son papel cálido translúcido, igual
                // que los bento cards (cohesión entre secciones de cards).
                // depth-2, rounded-card, p-6, hover lift y accent edge
                // intactos.
                className="group relative tj-paper depth-2 rounded-card p-6 h-full overflow-hidden transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
                      className="shrink-0 w-10 h-10 rounded-lg liquid-glass border border-[rgb(var(--accent-base)/0.18)] flex items-center justify-center text-tertiary transition-colors duration-300 group-hover:text-[rgb(var(--accent-base))] group-hover:border-[rgb(var(--accent-base)/0.30)]"
                      aria-hidden="true"
                    >
                      {v.icon}
                    </span>
                    <span className="text-xs uppercase tracking-[0.14em] font-semibold text-tertiary tnum transition-colors duration-300 group-hover:text-secondary">
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
                {/* T2d — `leading-[1.65]` + `max-w-[42em]` en la
                    descripción (era `leading-relaxed` = 1.625 sin
                    tope de ancho). El spec pide line-height 1.6 y
                    max-width ~42em para legibilidad móvil; en móvil el
                    max-width no activa (la tarjeta es <42em) pero en
                    desktop evita que las líneas se estiren demasiado en
                    la columna ancha. */}
                <p className="relative mt-2.5 text-sm text-secondary leading-[1.65] max-w-[42em]">
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

/* ---- Inline icons (stroke = currentColor, 20px) ----
   T2d — bump 18 → 20px para acercarse al rango 24-28px del spec
   sin saturar el container `w-9 h-9` (36px) que les deja 8px de
   padding alrededor. Las 4 mantienen el mismo viewBox 16x16 y
   strokeWidth 1.3 para que el peso visual sea idéntico entre sí. */
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}
function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v6M6.4 6.4h2.4a1.2 1.2 0 0 1 0 2.4H7.2m0 0h1.6a1.2 1.2 0 0 1 0 2.4H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5 3 3.5v3.2c0 3 2.2 5.6 5 6.8 2.8-1.2 5-3.8 5-6.8V3.5L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.8 8.2l1.6 1.6L10.4 6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.2 5.8 8.8 8.8 5.8 10.2 7.2 7.2l3-1.4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
