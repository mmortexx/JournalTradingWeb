"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { FeatureImage } from "@/components/tj/FeatureImage";

/**
 * DemoGallery — screenshot gallery that lives below the interactive demo.
 * Shows all 7 optimized webp images from /public/img, each wrapped in a
 * liquid-glass card with a bilingual caption. Uses FeatureImage for the gradient
 * overlay / reveal animation so the gallery matches the rest of the site.
 *
 * Grid: md:grid-cols-2 lg:grid-cols-4. With 7 items the layout is 4 + 3
 * on large screens (the 8th cell of the second row sits empty — visually
 * balanced by the centered max-width page column). Each cell keeps a 4:3
 * aspect ratio so the grid stays tidy regardless of caption length.
 */

interface Shot {
  src: string;
  altEs: string;
  altEn: string;
  capEs: string;
  capEn: string;
}

const shots: Shot[] = [
  {
    src: "/img/hero-bg.webp",
    altEs: "Camino dorado — visualización abstracta del trading",
    altEn: "Golden pathway — abstract trading visualization",
    capEs: "Camino dorado",
    capEn: "Golden path",
  },
  {
    src: "/img/gems-gold.webp",
    altEs: "Gemas esmeralda y oro — visualización de activos",
    altEn: "Emerald gems and gold — assets visualization",
    capEs: "Activos",
    capEn: "Assets",
  },
  {
    src: "/img/dashboard-hero.webp",
    altEs: "Visualización abstracta del panel de trading",
    altEn: "Abstract visualization of the trading dashboard",
    capEs: "Panel de trading",
    capEn: "Trading dashboard",
  },
  {
    src: "/img/equity-curve.webp",
    altEs: "Visualización abstracta de la curva de equity",
    altEn: "Abstract equity curve visualization",
    capEs: "Curva de equity",
    capEn: "Equity curve",
  },
  {
    src: "/img/discipline-guardian.webp",
    altEs: "Visualización abstracta del guardián de disciplina",
    altEn: "Abstract discipline guardian visualization",
    capEs: "Guardián de disciplina",
    capEn: "Discipline guardian",
  },
  {
    src: "/img/analytics-heatmap.webp",
    altEs: "Visualización abstracta del heatmap de analítica",
    altEn: "Abstract analytics heatmap visualization",
    capEs: "Heatmap de analítica",
    capEn: "Analytics heatmap",
  },
  {
    src: "/img/playbook-cards.webp",
    altEs: "Visualización abstracta del playbook con stats",
    altEn: "Abstract playbook with stats visualization",
    capEs: "Playbook en vivo",
    capEn: "Live playbook",
  },
  {
    src: "/img/multi-account.webp",
    altEs: "Visualización abstracta de múltiples cuentas",
    altEn: "Abstract multi-account visualization",
    capEs: "Múltiples cuentas",
    capEn: "Multi-account",
  },
  {
    src: "/img/risk-calculator.webp",
    altEs: "Visualización abstracta de la calculadora de riesgo",
    altEn: "Abstract risk calculator visualization",
    capEs: "Calculadora de riesgo",
    capEn: "Risk calculator",
  },
];

export function DemoGallery() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "Galería de capturas" : "Screenshot gallery"}
      className="section-tight cv-auto relative"
    >
      {/* Subtle accent glow at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[140px] opacity-[0.05] bg-white"
      />

      <div className="relative max-w-page mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-8">
          <span className="eyebrow inline-flex items-center gap-2 justify-center">
            <span className="w-6 h-px bg-white opacity-60" />
            {es ? "Galería" : "Gallery"}
            <span className="w-6 h-px bg-white opacity-60" />
          </span>
          <h2
            className="mt-4 font-medium tracking-[-0.02em] leading-tight text-white"
            style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
          >
            {es ? (
              <>
                Cada pantalla, <span className="text-gradient">en alta resolución.</span>
              </>
            ) : (
              <>
                Every screen, <span className="text-gradient">in high resolution.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-300 leading-relaxed">
            {es
              ? "Capturas reales de la app nativa de Windows."
              : "Real screenshots from the native Windows app."}
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shots.map((s, i) => (
            <Reveal key={s.src} delay={i * 0.05}>
              <motion.figure
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card overflow-hidden h-full flex flex-col group relative"
              >
                <div className="relative aspect-[4/3]">
                  <FeatureImage
                    src={asset(s.src)}
                    alt={es ? s.altEs : s.altEn}
                    className="absolute inset-0"
                    overlay={0.35}
                    // Gallery grid is `md:grid-cols-2 lg:grid-cols-4` → on
                    // mobile a single image fills the viewport, at md each
                    // takes half, at lg+ each takes a quarter.
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <figcaption className="p-3 text-center">
                  <span className="text-xs md:text-sm font-medium text-gray-300">
                    {es ? s.capEs : s.capEn}
                  </span>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
