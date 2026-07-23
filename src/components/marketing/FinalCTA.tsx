"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { MagneticButton } from "@/components/tj/MagneticButton";
import { ParticleField } from "@/components/tj/ParticleField";

/**
 * Closing CTA — centered headline + subtitle + 2 CTAs + 4-item guarantee
 * row. Dark base with subtle low-opacity aurora orbs + opt-in grain
 * texture. Echoes the hero's dark video aesthetic and blends into the
 * footer via a bottom fade gradient.
 *
 * Institutional polish (R2-b):
 *  - `.aurora-bg opacity-25` base wash + three tasteful low-opacity
 *    accent gold orbs (0.08–0.12) positioned top-left / right-mid /
 *    bottom-center. All wrapped in a single pointer-events-none absolute
 *    layer with `overflow-hidden` on the section so no orb leaks
 *    horizontally. The aurora-bg adds a barely-there cool wash that
 *    counterbalances the warm gold orbs — premium fintech landing-page
 *    pattern (Stripe / Vercel).
 *  - `ParticleField` constellation overlay (28 nodes, 12% opacity, 110px
 *    link distance) — canvas-based, pauses offscreen, respects
 *    prefers-reduced-motion. Sits above the orbs but below the content
 *    so it reads as floating particles in the air, never competing with
 *    the headline. Mirrors the not-found page's particle treatment.
 *  - Opt-in `.grain` 3% fractalNoise texture (matches HeroVideo / Bento
 *    / Pricing) so the closing band reads as one continuous printed
 *    surface with the rest of the conversion story.
 *  - Headline `text-4xl md:text-5xl lg:text-6xl font-semibold
 *    tracking-tight` with `.text-gradient` on "disciplina." (accent
 *    gold gradient) — large enough to be the page's final visual
 *    anchor without crowding the CTAs.
 *  - Both CTAs share the same `h-12` height for visual parity. Primary
 *    CTA carries an accent-tinted shadow so it reads as the preferred
 *    path; secondary CTA uses `.liquid-glass border border-white/20`.
 *  - 4-item guarantee row, dot-separated, `text-xs text-tertiary` with
 *    small emerald check icons (Garantía 30 días / Sin suscripción /
 *    Datos locales / ES + EN).
 *  - Bottom fade gradient (h-24, transparent → black) blends the
 *    section's lower edge into the page background / footer below.
 *
 * Bilingual via `useLang()`. No indigo/blue. Accent gold (`--accent-base`)
 * used sparingly for the headline gradient + the primary CTA's tinted
 * shadow. Dark theme primary; uses `text-primary/.text-secondary/
 * .text-tertiary` throughout.
 */
export function FinalCTA() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="relative bg-black overflow-hidden py-20 md:py-28">
      {/* Aurora base wash — very low opacity so the cool radial gradients
          read as ambient atmosphere, not as visible color. The accent
          gold orbs layered above carry the warmth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 aurora-bg opacity-25"
      />

      {/* Subtle aurora orbs — three tasteful low-opacity accent glows.
          All clipped to the section via overflow-hidden. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--accent-base) / 0.12), transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[420px] h-[420px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--accent-base) / 0.08), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[640px] h-[340px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--accent-base) / 0.10), transparent 70%)",
          }}
        />
      </div>

      {/* Particle constellation overlay — floating nodes connected by
          faint accent lines. Pauses offscreen, respects reduced-motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <ParticleField count={28} opacity={0.12} linkDistance={110} />
      </div>

      {/* Opt-in grain texture. */}
      <div
        className="grain absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom fade — blends the section into the footer below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black"
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary text-balance">
              {es ? (
                <>
                  Empieza a operar con{" "}
                  <span className="text-gradient">disciplina.</span>
                </>
              ) : (
                <>
                  Start trading with{" "}
                  <span className="text-gradient">discipline.</span>
                </>
              )}
            </h2>
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-6 text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
              {es
                ? "Tu operativa se mide en meses, no en días. El trader que llevas dentro está a una decisión de distancia."
                : "Your trading is measured in months, not days. The trader inside you is one decision away."}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="inline-block"
              >
                <MagneticButton
                  href={asset("/pricing")}
                  strength={0.22}
                  className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg bg-white text-black text-sm font-medium shadow-[0_2px_8px_-2px_rgb(var(--accent-base)/0.40),0_1px_2px_rgb(0_0_0/0.20)] hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(var(--accent-base)/0.55),0_2px_8px_rgb(0_0_0/0.25)] transition-all duration-200"
                >
                  {es ? "Comprar — desde " : "Buy — from "}
                  <span className="tnum">$29</span>
                  <svg
                    className="ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5"
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
                </MagneticButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="inline-block"
              >
                <MagneticButton
                  href={asset("/demo")}
                  strength={0.15}
                  className="liquid-glass border border-white/20 text-primary inline-flex items-center justify-center gap-2 h-12 px-7 rounded-lg text-sm font-medium shadow-[0_1px_2px_rgb(0_0_0/0.20)] hover:bg-white hover:text-black hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(0_0_0/0.40)] transition-all duration-200"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M5 3.5v9l7-4.5-7-4.5Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {es ? "Probar la demo" : "Try the demo"}
                </MagneticButton>
              </motion.div>
            </div>
          </Reveal>

          {/* Guarantee row — 4 items, dot-separated, small emerald checks. */}
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-tertiary tnum">
              <span className="inline-flex items-center gap-1.5">
                <CheckSmall />
                {es ? "Garantía 30 días" : "30-day guarantee"}
              </span>
              <span className="text-tertiary/50" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckSmall />
                {es ? "Sin suscripción" : "No subscription"}
              </span>
              <span className="text-tertiary/50" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckSmall />
                {es ? "Datos 100 % locales" : "100 % local data"}
              </span>
              <span className="text-tertiary/50" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckSmall />
                ES + EN
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CheckSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 8 2.5 2.5L12 5"
        stroke="rgb(var(--pnl-pos))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
