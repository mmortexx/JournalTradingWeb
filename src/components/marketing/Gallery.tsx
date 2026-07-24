"use client";

import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { FeatureImage } from "@/components/tj/FeatureImage";
import { WindowFrame } from "@/components/tj/WindowFrame";

/**
 * Gallery — visual showcase of the app's key screens using the real
 * webp screenshots. Each screenshot is shown WHOLE (object-contain)
 * inside a WindowFrame mockup so the visitor reads every pixel of the
 * app, with a bilingual caption beneath the frame (never an overlay
 * that crops or covers the screenshot).
 *
 * Layout — responsive grid that respects the screenshots' natural
 * 1500×856 aspect (ratio 1.7523, passed to WindowFrame as
 * `bodyClassName="aspect-[1500/856]"` so the screenshot fills the
 * frame body edge-to-edge with zero letterbox bars):
 *  - mobile: 1 column (full width)
 *  - md (768+): 2 columns
 *  - lg (1024+): 3 columns
 * Each cell = WindowFrame (title bar + body with object-contain
 * screenshot) + caption block below. Lazy-loaded via next/image
 * `loading="lazy"` (FeatureImage), `sizes` tuned to the grid.
 *
 * "View full size" affordance — each frame is wrapped in an `<a
 * target="_blank">` pointing at the raw 1500px webp, so a click/tap
 * opens the full-resolution screenshot in a new tab. A subtle
 * expand-icon chip (top-right of the frame) communicates the
 * affordance: always visible at 60% opacity on touch (no hover),
 * fades + lifts in on desktop hover. Keyboard users get a
 * focus-visible accent ring on the anchor.
 */
export function Gallery() {
  const { lang } = useLang();
  const es = lang === "es";

  const shots = [
    {
      src: "/img/app-analitica.webp",
      alt: es
        ? "Pantalla de Analítica de Trading Journal con la tabla de métricas por periodo, win rate, profit factor, Sharpe y Sortino"
        : "Trading Journal Analytics screen with the metrics-by-period table, win rate, profit factor, Sharpe and Sortino",
      caption: "Trading Journal — Analytics",
      title: es ? "Métricas institucionales" : "Institutional metrics",
      desc: es
        ? "40+ ratios calculados de tus operaciones. Sharpe, Sortino, Calmar, profit factor, expectancy en R."
        : "40+ ratios computed from your trades. Sharpe, Sortino, Calmar, profit factor, expectancy in R.",
    },
    {
      src: "/img/app-curva.webp",
      alt: es ? "Curva de rendimiento filtrada con drawdown sombreado y calidad de la curva" : "Filtered performance curve with shaded drawdown and curve quality",
      caption: "Trading Journal — Performance",
      title: es ? "Curva de rendimiento" : "Performance curve",
      desc: es ? "Rendimiento vs balance, con drawdown sombreado y calidad de la curva (R², K-Ratio)." : "Performance vs balance, with shaded drawdown and curve quality (R², K-Ratio).",
    },
    {
      src: "/img/app-diario.webp",
      alt: es ? "Diario de trading con el check-in del día: horas de sueño, estado mental y físico" : "Trading journal with the daily check-in: hours of sleep, mental and physical state",
      caption: "Trading Journal — Journal",
      title: es ? "Diario y disciplina" : "Journal and discipline",
      desc: es ? "Check-in diario: sueño, estado mental y físico, y si tenías plan." : "Daily check-in: sleep, mental and physical state, and whether you had a plan.",
    },
    {
      src: "/img/app-playbook.webp",
      alt: es ? "Playbook con las fichas de cada setup: Ruptura, Reversión, Pullback, Rango y Tendencia" : "Playbook with each setup card: Breakout, Reversal, Pullback, Range and Trend",
      caption: "Trading Journal — Playbook",
      title: es ? "Playbook en vivo" : "Live playbook",
      desc: es
        ? "Cada setup con su expectancy, win rate, muestra y reparto de R calculados de tus operaciones."
        : "Each setup with its expectancy, win rate, sample and R distribution computed from your trades.",
    },
    {
      src: "/img/app-operaciones.webp",
      alt: es ? "Registro de operaciones con 200 trades filtrables por instrumento, setup y resultado" : "Trade log with 200 trades filterable by instrument, setup and outcome",
      caption: "Trading Journal — Trades",
      title: es ? "Registro de operaciones" : "Trade log",
      desc: es ? "200 operaciones filtrables por instrumento, setup, dirección y resultado." : "200 trades filterable by instrument, setup, direction and outcome.",
    },
    {
      src: "/img/app-resumen.webp",
      alt: es ? "Pantalla de resumen con curva de rendimiento y calendario P&L" : "Overview screen with performance curve and P&L calendar",
      caption: "Trading Journal — Overview",
      title: es ? "Resumen" : "Overview",
      desc: es ? "Cómo va tu operativa, con curva de rendimiento y calendario P&L." : "How your trading is going, with performance curve and P&L calendar.",
    },
  ];

  return (
    <section className="section bg-veil relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-[0.06] bg-[rgb(var(--divider))]"
      />
      {/* Section grain */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "Galería" : "Gallery"}
          </Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
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
              ? "Cada pantalla entera, sin recortes. Tal cual la verías en tu Windows."
              : "Every screen in full, uncropped. Exactly as you'd see it on your Windows."}
          </p>
        </Reveal>

        {/* Uniform grid — no bento spans that force crops. */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shots.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 0.06}>
              <figure className="group relative">
                {/* Anchor wraps ONLY the WindowFrame (not the caption) so
                    the focus ring + click target are scoped to the frame,
                    and the accent glow below is also scoped to the frame
                    (previously it spanned the whole figure including the
                    caption, which anchored the drop shadow below the
                    caption instead of the frame). */}
                <a
                  href={asset(shot.src)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={es
                    ? `Ver "${shot.title}" a tamaño completo (se abre en pestaña nueva)`
                    : `View "${shot.title}" at full size (opens in a new tab)`}
                  className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1"
                >
                  <div className="relative">
                    <WindowFrame
                      caption={shot.caption}
                      bodyClassName="aspect-[1500/856]"
                    >
                      <FeatureImage
                        src={asset(shot.src)}
                        alt={shot.alt}
                        fit="contain"
                        className="absolute inset-0 h-full w-full"
                        overlay={0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </WindowFrame>
                    {/* Hover: subtle accent border glow scoped to the
                        frame only (absolute inset-0 of the `relative`
                        wrapper, NOT the figure). */}
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent-base) / 0.4), 0 16px 40px -12px rgb(var(--accent-base) / 0.2)" }}
                    />
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
                {/* Caption BENEATH the frame — never an overlay that
                    covers the screenshot. */}
                <figcaption className="mt-3.5 px-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "rgb(var(--accent-base))" }}
                      aria-hidden
                    />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary font-semibold">
                      {shot.title}
                    </span>
                  </div>
                  <p className="t-body-sm text-secondary leading-relaxed">
                    {shot.desc}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
