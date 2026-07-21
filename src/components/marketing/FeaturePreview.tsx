"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { SlowMoChart } from "@/components/tj/SlowMoChart";

/**
 * FeaturePreview — institutional 3-card feature preview that bridges the
 * Bento section and the closing CTA on the home page. Each card pairs a
 * real product screenshot (16/10) with an eyebrow kicker, a single-line
 * value pitch, a short description, and a "Learn more" link to the
 * dedicated /features page.
 *
 * Institutional polish (R2-a):
 *  - Each card uses `.liquid-glass rounded-card overflow-hidden` +
 *    `hover:-translate-y-1 transition-all duration-300` + an accent
 *    border glow on hover (matching the Bento card language exactly so
 *    the two sections read as one system).
 *  - Image frame: `aspect-[16/10]`, `object-cover`, a hairline
 *    `border-b border-white/10` between the image and the content
 *    (Linear / Vercel feature-card pattern), and a subtle image zoom
 *    on hover (`group-hover:scale-105`, `transition-transform
 *    duration-500`) for the "alive" affordance.
 *  - Content rhythm: `.eyebrow` kicker → `text-lg font-semibold
 *    text-primary` title → `text-sm text-secondary` description →
 *    "Learn more →" link with arrow translate-on-hover. Strict `gap-3`
 *    vertical rhythm + `p-5 md:p-6` consistent padding.
 *  - Per-card numbered eyebrows (01 / 02 / 03) so the row reads as a
 *    curated sequence rather than three unrelated cards.
 *
 * Premium motion layer (preserved from prior round):
 *  - SlowMoChart at opacity 0.04 drifting behind the whole strip.
 *  - Animated accent gradient line that draws across the top on view.
 *  - Staggered card entrance (lift + blur clear), 110 ms apart.
 *
 * Bilingual via `useLang()`. No indigo/blue. Accent gold used sparingly
 * for the headline gradient + the gradient line. Dark theme primary;
 * light theme works via `.text-primary / .text-secondary / .text-tertiary`.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

interface PreviewCard {
  src: string;
  altEs: string;
  altEn: string;
  /** Numbered eyebrow — "01" / "02" / "03". Curated-sequence language. */
  num: string;
  /** Small kicker label above the title. */
  kickerEs: string;
  kickerEn: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
}

const CARDS: PreviewCard[] = [
  {
    src: "/img/gems-gold.webp",
    altEs: "Gemas esmeralda y oro — visualización de activos",
    altEn: "Emerald gems and gold — assets visualization",
    num: "01",
    kickerEs: "Métricas",
    kickerEn: "Metrics",
    titleEs: "Métricas institucionales",
    titleEn: "Institutional metrics",
    descEs: "Sharpe, Sortino, Calmar y recovery factor — lo que usan los fondos.",
    descEn: "Sharpe, Sortino, Calmar and recovery factor — what funds actually use.",
  },
  {
    src: "/img/equity-curve.webp",
    altEs: "Visualización abstracta de la curva de equity",
    altEn: "Abstract visualization of the equity curve",
    num: "02",
    kickerEs: "Equity",
    kickerEn: "Equity",
    titleEs: "Curva de equity",
    titleEn: "Equity curve",
    descEs: "Tu capital, dibujado en el tiempo. Sin maquillaje, sin humo.",
    descEn: "Your capital, drawn over time. No makeup, no smoke.",
  },
  {
    src: "/img/discipline-guardian.webp",
    altEs: "Visualización abstracta del guardián de disciplina",
    altEn: "Abstract visualization of the discipline guardian",
    num: "03",
    kickerEs: "Disciplina",
    kickerEn: "Discipline",
    titleEs: "Guardián de disciplina",
    titleEn: "Discipline guardian",
    descEs: "Te frena antes de la operación que rompe tu propio plan.",
    descEn: "Stops you before the trade that breaks your own plan.",
  },
];

export function FeaturePreview() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "Vista previa de características" : "Feature preview"}
      className="section-tight cv-auto relative overflow-hidden"
    >
      {/* Faint slow equity-curve backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <SlowMoChart className="w-full h-full" opacity={0.04} cycle={22} />
      </div>

      {/* Section grain — opt-in `.grain` utility layers a 3 % fractalNoise
          overlay via ::after for the "expensive printed" feel. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header row */}
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <Eyebrow className="justify-center">
            {es ? "Lo más potente" : "Most powerful"}
          </Eyebrow>
          <h2 className="mt-5 t-h2 text-white">
            {es ? (
              <>
                Tres razones para <span className="text-gradient">no salir sin comprar.</span>
              </>
            ) : (
              <>
                Three reasons <span className="text-gradient">not to leave without buying.</span>
              </>
            )}
          </h2>
        </Reveal>

        {/* Animated accent gradient line that draws across the top on view */}
        <motion.div
          aria-hidden
          className="h-px w-full origin-left mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base) / 0.6) 50%, transparent 100%)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
        />

        {/* 3-card grid — same gap language as Bento for visual parity. */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.src}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: 0.15 + i * 0.11,
                duration: 0.7,
                ease: EASE,
              }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="liquid-glass rounded-card overflow-hidden flex flex-col group transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)]"
            >
              {/* Image — 16/10 frame, subtle zoom on hover, hairline
                  border-b separates the image from the content. */}
              <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
                <Image
                  src={asset(card.src)}
                  alt={es ? card.altEs : card.altEn}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Bottom gradient to blend image with the card body */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, rgb(var(--card) / 0.85) 100%)",
                  }}
                />
                {/* Numbered eyebrow chip floating top-left of the image —
                    the curated-sequence indicator (01 / 02 / 03). */}
                <span
                  className="absolute top-3 left-3 inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-md bg-black/50 backdrop-blur-sm border border-white/15 text-[11px] font-semibold tracking-[0.06em] tnum text-white"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  aria-hidden="true"
                >
                  {card.num}
                </span>
              </div>

              {/* Text body — strict vertical rhythm: eyebrow → title →
                  description → link, with gap-3 between each. */}
              <div className="p-5 md:p-6 flex flex-col flex-1 gap-3">
                <span className="eyebrow">{es ? card.kickerEs : card.kickerEn}</span>
                <h3 className="text-lg font-semibold text-primary leading-tight">
                  {es ? card.titleEs : card.titleEn}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {es ? card.descEs : card.descEn}
                </p>
                <Link
                  href={asset("/features")}
                  className="mt-auto pt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[rgb(var(--accent-base))] transition-colors duration-200"
                >
                  {es ? "Más información" : "Learn more"}
                  <svg
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h9M8 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
