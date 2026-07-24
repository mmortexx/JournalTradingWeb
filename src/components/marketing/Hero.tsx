"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Hero — sección `#top` del HTML de referencia.
 * - Eyebrow con punto verde pulsante
 * - H1 mayúsculas con la palabra "institucional" en verde
 * - Párrafos lead + CTA doble (Comprar / Ver demo)
 * - Chips de confianza (100 % local, pago único, ES+EN, garantía 30 días)
 * - Indicador "Scroll" abajo
 * - Float-card decorativa superior derecha (con spotlight .tj-spot)
 *
 * Entrada: los elementos llevan `data-seq` y los revela IntroSequence
 * con el escalonado + blur del HTML (tras el loader en primera visita).
 * Por eso este componente NO usa framer-motion para la entrada — dos
 * sistemas animando opacity a la vez se pisan.
 *
 * Reemplaza al antiguo `HeroVideo.tsx`. Sin vídeo de fondo — el hero
 * respira sobre el fondo fijo del body (BackgroundFX) con un halo
 * radial verde sutil.
 *
 * R24-1b — the halo (decorative, NOT data-seq) gets its own subtle
 * framer-motion entrance so the hero materializes as a whole on every
 * mount, not just on first-visit IntroSequence reveals. Safe from the
 * "two systems animating opacity" warning above — that rule is about
 * data-seq elements; the halo is aria-hidden decoration.
 */
export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-end overflow-hidden border-b"
      style={{ borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      {/* Halo verde superior — R24-1b: subtle entrance fade+scale on
          every mount (the halo is decorative, NOT data-seq, so this
          framer-motion entrance does not collide with IntroSequence's
          staggered reveals). The hero breathes in even on repeat visits
          where the loader / IntroSequence don't run. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          width: "min(1100px, 92%)",
          height: 360,
          background:
            "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, rgb(var(--accent-base)) 24%, transparent), transparent 70%)",
          filter: "blur(64px)",
          zIndex: 1,
        }}
      />
      {/* Viñeta lateral + inferior — aligerada tras el rediseño del
          fondo: el ojo WebGL es el protagonista del hero y un lavado al
          90 % sobre el 58 % del ancho lo borraba entero. El scrim ahora
          protege solo la columna de texto y se disuelve antes del
          centro del iris.

          R21-2d — la opacidad del scrim vive ahora en la clase
          `.hero-side-scrim` (globals.css), con un override de tema
          claro (88 % en lugar de 72 %) para que el velo siga siendo
          claro en light theme en vez de tornarse gris medio sobre el
          iris del ojo. */}
      <div
        aria-hidden
        className="hero-side-scrim pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, var(--bg), transparent 46%)",
          zIndex: 1,
        }}
      />
      {/* Líneas guía verticales 25/50/75 % */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, #000 16%, #000 82%, transparent)",
          maskImage:
            "linear-gradient(180deg, transparent, #000 16%, #000 82%, transparent)",
          zIndex: 1,
        }}
      >
        <span className="absolute top-0 bottom-0 left-1/4 w-px" style={{ background: "rgb(var(--divider) / 0.06)" }} />
        <span className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "rgb(var(--divider) / 0.06)" }} />
        <span className="absolute top-0 bottom-0 left-3/4 w-px" style={{ background: "rgb(var(--divider) / 0.06)" }} />
      </div>

      {/* Float-card decorativa */}
      <div
        data-seq
        className="tj-spot absolute right-[6%] top-[120px] z-10 hidden lg:flex flex-col justify-between"
        style={{
          width: 220,
          height: 220,
          padding: 18,
          borderRadius: 18,
          border: "1px solid rgb(var(--divider) / 0.13)",
          background: "color-mix(in oklab, var(--surface) 22%, transparent)",
          backdropFilter: "blur(7px) saturate(1.3)",
          WebkitBackdropFilter: "blur(7px) saturate(1.3)",
          boxShadow:
            "inset 0 1px 1px rgb(255 255 255 / 0.14), 0 24px 60px -30px rgb(0 0 0 / 0.7)",
        }}
      >
        <span
          className="tnum"
          style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-2)" }}
        >
          [ 2026 ]
        </span>
        <div>
          <div
            className="font-serif"
            style={{ fontSize: 20, lineHeight: 1.22, color: "var(--ink)" }}
          >
            {es ? "Hecho para el " : "Built for the "}
            <span style={{ fontStyle: "italic" }}>{es ? "trader" : "trader"}</span>
            {es ? " serio." : " serious."}
          </div>
          <div
            className="tnum mt-2"
            style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "var(--ink-3)" }}
          >
            {es ? "Nativo de Windows · v1.4.2" : "Windows native · v1.4.2"}
          </div>
        </div>
      </div>

      {/* Contenido — `.tj-legible-text` (R21-2d) añade un halo de
          text-shadow theme-aware para levantar el contraste del eyebrow,
          los párrafos y los chips de confianza sobre las zonas donde el
          scrim lateral se desvanece (x > 52 %) y el iris del ojo sigue
          mostrándose. En dark sombra oscura, en light halo claro. */}
      <div className="tj-legible-text relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-10 pt-32 pb-20">
        <div data-seq className="inline-flex items-center gap-2.5 mb-5">
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "rgb(var(--accent-base))",
              boxShadow: "0 0 12px rgb(var(--accent-base))",
              animation: "tj-glow 2.6s ease-in-out infinite",
            }}
          />
          <span
            className="uppercase tnum"
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              color: "rgb(var(--accent-base))",
            }}
          >
            {es
              ? "Diario de trading · Windows nativo"
              : "Trading journal · Windows native"}
          </span>
        </div>
        <h1
          data-seq
          className="m-0 mb-2 font-sans uppercase break-words hyphens-auto"
          style={{
            fontSize: "clamp(2rem, 7.6vw, 5.8rem)",
            fontWeight: 600,
            lineHeight: 1.01,
            letterSpacing: "-0.035em",
            color: "var(--ink)",
            // Crisp rendering in both themes — optimizeLegibility enables
            // kerning + ligatures on the large display type (matters most
            // for the tight -0.035em tracking where glyph stems would
            // otherwise rasterize soft); antialiased smoothing kills the
            // sub-pixel fringe the accent word picks up on the dark
            // glass backdrop. Both props are theme-agnostic.
            textRendering: "optimizeLegibility",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {es ? (
            <>
              Opera como una
              <br />
              mesa{" "}
              <span
                style={{
                  color: "rgb(var(--accent-base))",
                  // R24-1b — italic + crisp accent underline on the
                  // accent word. Italic gives an editorial flourish
                  // against the rigid uppercase sans; the 1px underline
                  // at 0.16em offset is theme-agnostic and stays crisp
                  // at every DPR (text-decoration renders as a vector
                  // hairline, not a rasterized stroke). 35% accent keeps
                  // it from shouting next to the bright accent word.
                  fontStyle: "italic",
                  textDecoration: "underline",
                  textDecorationColor: "rgb(var(--accent-base) / 0.35)",
                  textDecorationThickness: "1px",
                  textUnderlineOffset: "0.16em",
                }}
              >
                institucional
              </span>
              <span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          ) : (
            <>
              Trade like an
              <br />
              institutional{" "}
              <span
                style={{
                  color: "rgb(var(--accent-base))",
                  fontStyle: "italic",
                  textDecoration: "underline",
                  textDecorationColor: "rgb(var(--accent-base) / 0.35)",
                  textDecorationThickness: "1px",
                  textUnderlineOffset: "0.16em",
                }}
              >
                desk
              </span>
              <span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          )}
        </h1>
        <p
          data-seq
          className="m-0 mb-3 break-words"
          style={{
            fontSize: "clamp(1.1rem, 2.2vw, 1.7rem)",
            fontWeight: 300,
            lineHeight: 1.25,
            color: "color-mix(in oklab, var(--ink) 82%, transparent)",
            maxWidth: "22em",
          }}
        >
          {es
            ? "Mídela con el rigor de una mesa profesional."
            : "Measure it with institutional-grade rigour."}
        </p>
        <p
          data-seq
          className="m-0 mb-8 break-words"
          style={{
            fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
            fontWeight: 300,
            lineHeight: 1.6,
            color: "var(--ink-2)",
            maxWidth: "36em",
          }}
        >
          {es
            ? "40+ métricas institucionales, un guardián que te frena antes del error y tus datos 100 % en tu máquina. Nativo de Windows, pago único desde 29 $."
            : "40+ institutional metrics, a guardian that brakes before the error, and your data 100% on your machine. Windows-native, one-time payment from $29."}
        </p>
        {/* R21-3a — CTA buttons stack vertically full-width on mobile
            (375px) so neither pill overflows nor wraps awkwardly; side
            by side on >= sm. `justify-center` centers content within
            the full-width pill on mobile for a clean native CTA look.
            R24-1b — gap bumped 3 → 4 (16 px) so the two 54-px-tall
            pills breathe when stacked on mobile; 12 px felt tight for
            chunky primary CTAs and read as a single dense block. */}
        <div data-seq className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/pricing"
            className="inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2.5 rounded-full"
            style={{
              height: 54,
              padding: "0 28px",
              background: "rgb(var(--accent-base))",
              color: "#06130d",
              fontSize: 15,
              fontWeight: 600,
              boxShadow:
                "0 14px 38px -14px color-mix(in oklab, rgb(var(--accent-base)) 75%, #000)",
              transition: "transform 0.2s, filter 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(1.08)";
              // Intensify the accent glow + add a 1px accent ring so the
              // primary CTA reads as "pressed forward" on hover — the
              // ring is what makes the lift feel deliberate rather than
              // just a brightness shift.
              e.currentTarget.style.boxShadow =
                "0 18px 44px -12px color-mix(in oklab, rgb(var(--accent-base)) 85%, #000), 0 0 0 1px rgb(var(--accent-base) / 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
              e.currentTarget.style.boxShadow =
                "0 14px 38px -14px color-mix(in oklab, rgb(var(--accent-base)) 75%, #000)";
            }}
          >
            {es ? "Comprar — desde 29 $" : "Buy — from $29"}
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/demo"
            className="tj-cta-sheen inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2.5 rounded-full"
            style={{
              height: 54,
              padding: "0 26px",
              background: "var(--ink)",
              color: "var(--bg)",
              fontSize: 15,
              fontWeight: 600,
              transition: "transform 0.2s, filter 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(0.94)";
              // Subtle accent ring on the dark CTA — pairs with the
              // primary CTA's hover ring so both buttons lift together
              // and read as a coordinated pair rather than two
              // unrelated hover treatments.
              e.currentTarget.style.boxShadow =
                "0 12px 30px -14px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(var(--accent-base) / 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <Play size={15} fill="currentColor" aria-hidden />
            {es ? "Ver la demo" : "See the demo"}
          </Link>
        </div>
        {/* R24-1b — trust badge row alignment: the per-item span used
            `gap-x-4` (16 px) between separator and its label while the
            outer flex used `gap-x-5` (20 px) between items — so a label
            sat 16 px from its leading separator but 20 px from the
            previous label, an asymmetric rhythm. Aligned both to gap-x-5
            so every gap (label↔separator, separator↔label) is a uniform
            20 px and the row reads as a machined rule. */}
        <div data-seq className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5">
          {[
            es ? "100 % LOCAL" : "100% LOCAL",
            es ? "PAGO ÚNICO" : "ONE-TIME",
            "ES · EN",
            es ? "GARANTÍA 30 DÍAS" : "30-DAY GUARANTEE",
          ].map((label, i) => (
            <span key={label} className="flex items-center gap-x-5">
              {i > 0 && (
                <span
                  aria-hidden
                  className="hidden sm:inline-block"
                  style={{
                    width: 1,
                    height: 12,
                    // 0.20 (was 0.13) so the rule reads as a deliberate
                    // machined hairline in both themes — the prior 0.13
                    // faded too far on the dark glass and disappeared
                    // entirely on the light theme's bright surface.
                    background: "rgb(var(--divider) / 0.20)",
                  }}
                />
              )}
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)" }}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Indicador Scroll — R24-1b polish:
          • Visible on mobile too (was `hidden sm:flex`): the indicator
            is small + pointer-events-none, and the hero's `pb-20` keeps
            clear space above it on 375 px viewports.
          • Theme-agnostic baseline: a 1-px hairline at `--divider / 0.28`
            spans the full 30-px track so the line reads on the bright
            light-theme surface where the accent gradient alone fades to
            invisible before reaching the bottom.
          • Animated traveling bead: a 2×6-px accent dot sweeps top→bottom
            on a 2.2 s loop (`tj-scroll-bead` keyframe) so the indicator
            feels alive rather than static — the bead is what reads as
            "scroll" motion, the gradient is just the rail. */}
      <div
        aria-hidden
        className="absolute left-1/2 bottom-5 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span
          className="uppercase tnum"
          style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--ink-3)" }}
        >
          Scroll
        </span>
        <span className="relative block" style={{ width: 1, height: 30 }}>
          {/* Baseline rail — visible in both themes */}
          <span
            className="absolute inset-0 block"
            style={{ background: "rgb(var(--divider) / 0.28)" }}
          />
          {/* Accent gradient overlay — green at top, fading down */}
          <span
            className="absolute inset-0 block"
            style={{
              background:
                "linear-gradient(180deg, rgb(var(--accent-base)), transparent)",
            }}
          />
          {/* Traveling bead — sweeps top→bottom on a 2.2 s loop */}
          <span
            className="absolute left-1/2 block rounded-full"
            style={{
              width: 2,
              height: 6,
              marginLeft: -1,
              top: 0,
              background: "rgb(var(--accent-base))",
              boxShadow: "0 0 6px rgb(var(--accent-base))",
              animation: "tj-scroll-bead 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
            }}
          />
        </span>
      </div>
    </section>
  );
}
