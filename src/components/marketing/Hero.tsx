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
        // R26-2c — `-translate-x-1/2` removed from className: framer-motion
        // sets `transform` via inline style when any transform prop (scale)
        // is animated, which overrides the Tailwind class and left the halo
        // offset to the right of center. `x: "-50%"` is now set in
        // initial/animate so framer-motion composes `translateX(-50%)
        // scale(...)` and the halo materializes centered above the headline.
        className="pointer-events-none absolute left-1/2 top-[6%]"
        initial={{ opacity: 0, scale: 0.88, x: "-50%" }}
        animate={{ opacity: 0.5, scale: 1, x: "-50%" }}
        // R25-1e — tightened from 1.6s/0.1d to 1.2s/0.05d so the halo
        // leads the data-seq content reveals by a beat (was lagging
        // them — the hero felt like it was "catching up" on repeat
        // visits). 1.2s is still in the "subtle materialization" range.
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
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
              letterSpacing: "0.14em",
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
          // R26-2c — `hyphens-auto` removed: on 320px viewports the long
          // ES word "institucional" would auto-hyphenate mid-glyph
          // ("insti-tucional"), which reads as a typo on a display H1.
          // `break-words` (overflow-wrap: break-word) still catches any
          // overflow at the space, giving a clean "mesa\ninstitucional."
          // wrap on the narrowest phones instead of an ugly hyphen.
          className="m-0 mb-2 font-sans uppercase break-words"
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
                  // R26-2c — `1px` → `0.035em`: at the headline's max
                  // (5.8rem ≈ 93px) the fixed 1px hairline was barely
                  // perceptible against the heavy display weight; at the
                  // mobile min (2rem ≈ 32px) it read as a confident rule.
                  // Scaling with the font (0.035em matches the headline's
                  // -0.035em letter-spacing for visual cohesion) keeps
                  // the underline a deliberate accent hairline at every
                  // breakpoint — ~1px on mobile, ~3.25px on wide desktop.
                  textDecorationThickness: "0.035em",
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
                  textDecorationThickness: "0.035em",
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
            // R26-2c — hover shadow layered with a 4px accent halo
            // (`0_0_0_4px_rgb(var(--accent-base)/0.12)`) so the lift +
            // brightness + drop shadow is now joined by a subtle accent
            // RING that blooms around the pill on hover — the "perfect
            // hover state (lift + accent ring + shadow)" the polish
            // brief calls for. The halo sits UNDER the drop shadow in
            // the box-shadow stack so the drop shadow still leads.
            className="tj-cta-sheen inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2.5 rounded-full h-[54px] px-7 bg-[rgb(var(--accent-base))] text-[#06130d] text-[15px] font-semibold shadow-[0_18px_46px_-15px_rgb(var(--accent-base)/0.7)] ring-1 ring-inset ring-[rgb(var(--accent-base)/0.40)] transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-[1.08] hover:shadow-[0_0_0_4px_rgb(var(--accent-base)/0.12),0_22px_54px_-15px_rgb(var(--accent-base)/0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            {es ? "Comprar — desde 29 $" : "Buy — from $29"}
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/demo"
            className="liquid-glass inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2.5 rounded-full h-[54px] px-[26px] border border-[rgb(var(--divider)/0.13)] text-[var(--ink)] text-[15px] font-semibold transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--accent-base)/0.35)] hover:bg-[rgb(var(--divider)/0.05)] hover:shadow-[0_0_0_4px_rgb(var(--accent-base)/0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
                  className="hidden sm:inline-block rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    // R25-1e — swapped the 1×12 neutral hairline for a
                    // 4px round accent dot. Ties the hero trust row to the
                    // accent palette used across the site's credential
                    // markers (TrustStrip dots, PricingFAQ reassurance pills,
                    // ValueTestimonials value chips, StatsBandNew stats).
                    // 4px (vs 6px elsewhere) keeps a deliberate size
                    // hierarchy: the eyebrow's pulsing 6px dot leads, the
                    // trust row's 4px separator dots follow.
                    background: "rgb(var(--accent-base) / 0.55)",
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
          // R25-1e — paddingLeft matches letterSpacing so the text's
          // bounding box is symmetric. Without it, the trailing
          // letter-spacing on "Scroll" adds extra space to the right
          // of the last glyph, making the visual glyph center sit ~1px
          // left of the 1px rail center. The padding balances the box
          // and the glyphs center perfectly on the rail.
          style={{ fontSize: 9, letterSpacing: "0.2em", paddingLeft: "0.2em", color: "var(--ink-3)" }}
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
              // R26-2c — glow radius 6px → 8px: in light theme the
              // rail's accent gradient fades to invisible before reaching
              // the bottom, leaving the bead as the sole scroll cue. 8px
              // bloom keeps the bead readable on the bright surface
              // without oversaturating it in dark theme.
              boxShadow: "0 0 8px rgb(var(--accent-base))",
              animation: "tj-scroll-bead 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
            }}
          />
        </span>
      </div>
    </section>
  );
}
