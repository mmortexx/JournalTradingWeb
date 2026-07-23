"use client";

import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { FeatureImage } from "@/components/tj/FeatureImage";

/**
 * Gallery — a visual showcase of the app's key screens using the
 * optimized webp images. Each image is paired with a bilingual caption
 * and sits in a liquid-glass frame with a gradient overlay.
 */
export function Gallery() {
  const { lang } = useLang();
  const es = lang === "es";

  const shots = [
    {
      src: "/img/dashboard-hero.webp",
      alt: es
        ? "Visualización abstracta del panel de trading con métricas institucionales"
        : "Abstract visualization of the trading dashboard with institutional metrics",
      title: es ? "Métricas institucionales" : "Institutional metrics",
      desc: es
        ? "40+ ratios calculados de tus operaciones. Sharpe, Sortino, Calmar, profit factor, expectancy en R."
        : "40+ ratios computed from your trades. Sharpe, Sortino, Calmar, profit factor, expectancy in R.",
      span: "md:col-span-2 md:row-span-2",
    },
    {
      src: "/img/equity-curve.webp",
      alt: es ? "Visualización abstracta de la curva de equity" : "Abstract equity curve visualization",
      title: es ? "Curva de equity" : "Equity curve",
      desc: es ? "Con drawdown sombreado y tooltip al hacer hover." : "With shaded drawdown and hover tooltip.",
      span: "md:col-span-1",
    },
    {
      src: "/img/discipline-guardian.webp",
      alt: es ? "Visualización abstracta del guardián de disciplina" : "Abstract discipline guardian visualization",
      title: es ? "Guardián de disciplina" : "Discipline guardian",
      desc: es ? "Te frena antes de la tontería." : "Stops you before the dumb trade.",
      span: "md:col-span-1",
    },
    {
      src: "/img/playbook-cards.webp",
      alt: es ? "Visualización abstracta del playbook con stats en vivo" : "Abstract playbook with live stats visualization",
      title: es ? "Playbook en vivo" : "Live playbook",
      desc: es
        ? "Cada ficha muestra expectancy, win rate y muestra calculados de tus operaciones."
        : "Each card shows expectancy, win rate and sample computed from your trades.",
      span: "md:col-span-2",
    },
    {
      src: "/img/multi-account.webp",
      alt: es ? "Visualización abstracta de gestión de múltiples cuentas" : "Abstract multi-account management visualization",
      title: es ? "Múltiples cuentas" : "Multi-account",
      desc: es ? "Cuentas ilimitadas en Pro." : "Unlimited accounts on Pro.",
      span: "md:col-span-1",
    },
  ];

  return (
    <section className="section bg-veil relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-[0.06] bg-white"
      />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "Galería" : "Gallery"}
          </Eyebrow>
          <h2
            className="mt-5 t-h2 text-primary"
          >
            {es ? (
              <>
                La app, <span className="text-gradient">en cada pixel.</span>
              </>
            ) : (
              <>
                The app, <span className="text-gradient">in every pixel.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Cada pantalla está pensada para que veas tu operativa con claridad. Sin ruido, sin distracciones."
              : "Every screen is designed so you see your trading with clarity. No noise, no distractions."}
          </p>
        </Reveal>

        {/* Bento-style gallery grid */}
        <div className="mt-10 grid md:grid-cols-3 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
          {shots.map((shot, i) => (
            <Reveal
              key={shot.src}
              delay={i * 0.08}
              className={shot.span}
            >
              <figure className="group relative h-full w-full overflow-hidden rounded-card liquid-glass depth-2 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_2px_4px_rgb(0_0_0/0.08),0_10px_28px_rgb(0_0_0/0.16)]">
                {/* Image wrapper — zooms subtly on hover. Wrapped in a div
                    so the inner FeatureImage's motion.div (which controls the
                    view-reveal scale) doesn't conflict with the hover scale. */}
                <div
                  className="absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  aria-hidden
                >
                  <FeatureImage
                    src={asset(shot.src)}
                    alt={shot.alt}
                    className="absolute inset-0 h-full w-full"
                    overlay={0.55}
                  />
                </div>
                {/* Caption overlay at bottom — slides up slightly on hover */}
                <figcaption className="absolute inset-x-0 bottom-0 p-5 z-10 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary font-semibold">
                      {shot.title}
                    </span>
                  </div>
                  <h3 className="t-body-sm text-primary font-medium leading-tight">
                    {shot.desc}
                  </h3>
                </figcaption>
                {/* Hover: subtle accent border glow */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-card pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent-base) / 0.4), 0 16px 40px -12px rgb(var(--accent-base) / 0.3)" }}
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
