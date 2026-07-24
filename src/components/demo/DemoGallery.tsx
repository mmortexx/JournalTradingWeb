"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { FeatureImage } from "@/components/tj/FeatureImage";
import { WindowFrame } from "@/components/tj/WindowFrame";

/**
 * DemoGallery — screenshot gallery below the interactive demo. Shows the
 * 8 real app screenshots from /public/img, each WHOLE (object-contain)
 * inside a WindowFrame mockup with a bilingual caption label beneath.
 *
 * Grid: md:grid-cols-2 lg:grid-cols-4. Each cell keeps the screenshot's
 * natural 1500×856 aspect (passed to WindowFrame as `bodyClassName=
 * "aspect-[1500/856]"`) so the app reads whole and crisp with zero
 * letterbox bars.
 *
 * Institutional polish:
 *  - WindowFrame (WinUI title bar + theme-aware body) wraps each
 *    FeatureImage fit="contain" — the screenshot is never cropped.
 *  - Caption is a LABEL beneath the frame (not an overlay that covers
 *    the screenshot), so titles stay legible without darkening pixels.
 *    A centered 32px hairline between the frame and the caption anchors
 *    the label to the shot so they read as a single composed unit.
 *  - "View full size" affordance — each frame is wrapped in `<a
 *    target="_blank">` pointing at the raw 1500px webp; an expand-icon
 *    chip (top-right) is always visible at 60% on touch and fades +
 *    lifts in on desktop hover.
 *  - Eyebrow + headline use `text-primary`; subtitle uses `text-secondary`.
 *  - Bottom CTA: primary `bg-white text-black` "Open the demo"
 *    (anchor `#demo` → scrolls to the interactive AppDemoClient section
 *    above, which carries `id="demo"` + `scroll-mt-16`) + secondary
 *    `liquid-glass` "See features" — mirrors FinalCTA's CTA pair.
 */

interface Shot {
  src: string;
  altEs: string;
  altEn: string;
  capEs: string;
  capEn: string;
  caption: string; // window title bar text
}

const shots: Shot[] = [
  {
    src: "/img/app-resumen.webp",
    altEs: "Pantalla de Resumen: cómo va tu operativa, con curva de rendimiento y calendario P&L",
    altEn: "Overview screen: how your trading is going, with performance curve and P&L calendar",
    capEs: "Resumen",
    capEn: "Overview",
    caption: "Trading Journal — Overview",
  },
  {
    src: "/img/app-operaciones.webp",
    altEs: "Registro de operaciones con 200 trades filtrables",
    altEn: "Trade log with 200 filterable trades",
    capEs: "Operaciones",
    capEn: "Trades",
    caption: "Trading Journal — Trades",
  },
  {
    src: "/img/app-analitica.webp",
    altEs: "Analítica con la tabla de métricas por periodo y ratios institucionales",
    altEn: "Analytics with the metrics-by-period table and institutional ratios",
    capEs: "Analítica",
    capEn: "Analytics",
    caption: "Trading Journal — Analytics",
  },
  {
    src: "/img/app-curva.webp",
    altEs: "Curva de rendimiento filtrada con drawdown y calidad de la curva",
    altEn: "Filtered performance curve with drawdown and curve quality",
    capEs: "Curva de rendimiento",
    capEn: "Performance curve",
    caption: "Trading Journal — Performance",
  },
  {
    src: "/img/app-diario.webp",
    altEs: "Diario con el check-in del día: sueño, estado mental y físico",
    altEn: "Journal with the daily check-in: sleep, mental and physical state",
    capEs: "Diario",
    capEn: "Journal",
    caption: "Trading Journal — Journal",
  },
  {
    src: "/img/app-playbook.webp",
    altEs: "Playbook con las fichas de cada setup y sus estadísticas",
    altEn: "Playbook with each setup card and its statistics",
    capEs: "Playbook",
    capEn: "Playbook",
    caption: "Trading Journal — Playbook",
  },
  {
    src: "/img/app-detalle.webp",
    altEs: "Detalle de una operación con recorrido, ejecución, plan y revisión",
    altEn: "Trade detail with journey, execution, plan and review",
    capEs: "Detalle de operación",
    capEn: "Trade detail",
    caption: "Trading Journal — Trade detail",
  },
  {
    src: "/img/app-nueva.webp",
    altEs: "Formulario de nueva operación con cálculo de riesgo",
    altEn: "New trade form with risk calculation",
    capEs: "Nueva operación",
    capEn: "New trade",
    caption: "Trading Journal — New trade",
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
            <span className="w-6 h-px bg-current opacity-60" />
            {es ? "Galería" : "Gallery"}
            <span className="w-6 h-px bg-current opacity-60" />
          </span>
          <h2
            className="mt-4 font-medium tracking-[-0.02em] leading-tight text-primary"
            style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)" }}
          >
            {es ? (
              <>
                Cada pantalla, <span className="text-gradient">entera.</span>
              </>
            ) : (
              <>
                Every screen, <span className="text-gradient">in full.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-sm md:text-base text-secondary leading-relaxed">
            {es
              ? "Capturas reales de la app nativa de Windows, sin recortes."
              : "Real screenshots from the native Windows app, uncropped."}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shots.map((s, i) => (
            <Reveal key={s.src} delay={i * 0.05}>
              <motion.figure
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                className="group relative"
              >
                {/* Anchor wraps ONLY the WindowFrame so the click target +
                    focus ring are scoped to the frame (not the caption).
                    Opens the raw 1500px webp in a new tab — genuine "view
                    full size" functionality, not just a visual affordance. */}
                <a
                  href={asset(s.src)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={es
                    ? `Ver "${s.capEs}" a tamaño completo (se abre en pestaña nueva)`
                    : `View "${s.capEn}" at full size (opens in a new tab)`}
                  className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <div className="relative transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">
                    <WindowFrame
                      caption={s.caption}
                      bodyClassName="aspect-[1500/856]"
                    >
                      <FeatureImage
                        src={asset(s.src)}
                        alt={es ? s.altEs : s.altEn}
                        fit="contain"
                        className="absolute inset-0 h-full w-full"
                        overlay={0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </WindowFrame>
                    {/* "View full size" affordance — expand-icon chip at
                        the top-right of the frame. Always visible at 60%
                        opacity on touch (no hover), fades + lifts in on
                        desktop hover. Sits over the title bar's right
                        spacer (empty, aria-hidden) so it never clashes
                        with the centered caption or left traffic lights. */}
                    <span
                      aria-hidden
                      className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-7 h-7 rounded-md bg-black/45 backdrop-blur-sm border border-white/10 text-white/85 opacity-60 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-200"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13 3l-4.5 4.5M3 13l4.5-4.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </a>
                {/* Hairline beneath the frame — a 32px centered rule that
                    anchors the caption to the shot so they read as a single
                    composed unit (editorial gallery rhythm). */}
                <div
                  aria-hidden
                  className="mt-3 mx-auto h-px w-8 bg-[rgb(var(--divider)/0.25)]"
                />
                {/* Caption LABEL beneath the frame — not an overlay.
                    Two-line stack: a tiny muted index ("01 / 08") in tnum
                    for an editorial gallery rhythm, then the screen name. */}
                <figcaption className="mt-2 flex flex-col items-center gap-1 text-center">
                  <span className="tnum text-[10px] tracking-[0.18em] uppercase text-tertiary">
                    {String(i + 1).padStart(2, "0")}
                    <span className="mx-1 opacity-50">/</span>
                    {String(shots.length).padStart(2, "0")}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-primary">
                    {es ? s.capEs : s.capEn}
                  </span>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>

        {/* CTA row — primary (accent-glow) + secondary (glass + accent-tinted hover) */}
        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <motion.a
            href="#demo"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="group inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_2px_8px_-2px_rgb(var(--accent-base)/0.30),0_1px_2px_rgb(0_0_0/0.20)] hover:shadow-[0_8px_20px_-4px_rgb(var(--accent-base)/0.50),0_2px_8px_rgb(0_0_0/0.25)]"
          >
            {es ? "Abrir la demo" : "Open the demo"}
            <svg
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h9M8 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
          <motion.a
            href={asset("/features")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="liquid-glass group inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-medium text-primary border border-[rgb(var(--divider)/0.18)] hover:border-[rgb(var(--accent-base)/0.35)] hover:bg-[rgb(var(--accent-base)/0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(0_0_0/0.40)] transition-all duration-200"
          >
            {es ? "Ver características" : "See features"}
            <svg
              className="transition-transform duration-200 group-hover:translate-x-0.5 text-tertiary group-hover:text-[rgb(var(--accent-base))]"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h9M8 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </Reveal>
      </div>
    </section>
  );
}
