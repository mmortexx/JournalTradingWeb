"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { AnimatedHeading } from "@/components/tj/AnimatedHeading";
import { FadeIn } from "@/components/tj/FadeIn";

interface PageHeaderProps {
  eyebrowEs: string;
  eyebrowEn: string;
  titleEs: string;
  titleEn: string;
  /**
   * Optional substring of `titleEs` rendered with the `text-gradient`
   * class. Lets a page keep its "rest + gradient emphasis" design
   * while every char still animates individually. Must live within a
   * single line of `titleEs`.
   */
  titleHighlightEs?: string;
  /** Optional substring of `titleEn` rendered with `text-gradient`. */
  titleHighlightEn?: string;
  subtitleEs: string;
  subtitleEn: string;
  breadcrumbEs: string;
  breadcrumbEn: string;
}

/**
 * Reusable page header banner with breadcrumb, animated title, and
 * subtitle. Used by all sub-pages.
 *
 * Animation cascade (matches the Hero's entrance, all kicked off after
 * the route transition so the page settles in cleanly):
 *   0ms   — breadcrumb (plain framer-motion fade, kept as-is per spec)
 *   200ms — eyebrow (motion.div fade)
 *   200ms — title (AnimatedHeading char-by-char, 30ms stagger, 500ms
 *           duration per char; INITIAL_DELAY=200ms baked into the
 *           AnimatedHeading component)
 *   400ms — subtitle (FadeIn wrapper, 800ms duration)
 *
 * Static accent-glow disc anchored to the top center (no parallax, no
 * market canvas) so the page opens with a single quiet ambient cue,
 * then steps into the four-step cascade using the project signature
 * ease curve. With `prefers-reduced-motion: reduce`, the MotionConfig
 * in providers.tsx reduces the transforms to instant snaps while
 * preserving opacity fades so the content still appears gracefully.
 */
export function PageHeader({
  eyebrowEs,
  eyebrowEn,
  titleEs,
  titleEn,
  titleHighlightEs,
  titleHighlightEn,
  subtitleEs,
  subtitleEn,
  breadcrumbEs,
  breadcrumbEn,
}: PageHeaderProps) {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
      {/* Antes: `bg-black` opaco — tapaba el ojo WebGL global en todas
          las subpáginas. Ahora el header es transparente y la
          legibilidad la garantiza un scrim lateral (mismo lenguaje que
          el hero de la home): el texto vive sobre la zona velada y el
          iris respira a la derecha. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--bg) 76%, transparent), color-mix(in srgb, var(--bg) 30%, transparent) 46%, transparent 68%)",
        }}
      />
      {/* Fade inferior: entrega suave hacia la primera sección velada. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{
          background:
            "linear-gradient(180deg, transparent, color-mix(in srgb, var(--bg) 52%, transparent))",
        }}
      />
      {/* Static accent glow — pinned to the top center, soft enough not to
          compete with the headline. The 600×300 px disc is intentionally
          larger than the heading column so its falloff reads as ambient
          light rather than a backdrop "behind" the text. No animation,
          no parallax — just a quiet halo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-[0.14]"
        style={{ background: "rgb(var(--accent-base))" }}
      />
      {/* Section grain — opt-in 3 % fractalNoise overlay so the page
          header reads as the same machined surface as the sections below
          it (Bento, HowItWorks, Pricing, etc.) rather than a flat black
          void. Sits under the accent halo so both layers read together. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Breadcrumb — Home / <current page>. Plain text on the trailing
            crumb (no link) so users can't tap into the page they're already
            on; the home crumb is the only navigable one. Kept as a plain
            framer-motion fade-in (no FadeIn wrapper) per the task spec:
            "Keep the breadcrumb and eyebrow as-is". Uses the design-system
            tertiary/secondary text tokens (gray-400/gray-300 on dark) so
            the colors shift correctly when the theme flips to light. */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-tertiary mb-6"
          aria-label={es ? "Migas de pan" : "Breadcrumb"}
        >
          <Link href="/" className="hover:text-primary transition-colors">
            {es ? "Inicio" : "Home"}
          </Link>
          <span className="opacity-40" aria-hidden="true">/</span>
          <span className="text-secondary" aria-current="page">
            {es ? breadcrumbEs : breadcrumbEn}
          </span>
        </motion.nav>

        {/* Eyebrow — fades in at 200ms. Kept as a motion.div (same pattern
            as before) so the Eyebrow component itself stays untouched;
            only the delay is moved from 100ms to 200ms so the eyebrow
            lines up with the title's char-by-char entrance. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Eyebrow>{es ? eyebrowEs : eyebrowEn}</Eyebrow>
        </motion.div>

        {/* Title — character-by-character entrance starting at 200ms
            (AnimatedHeading's INITIAL_DELAY=200ms), 30ms stagger, 500ms
            duration per char. The optional `highlight` substring is
            rendered with the `text-gradient` class to preserve the
            original "rest + gradient emphasis" design of every page
            header (features, demo, pricing, about, faq). */}
        <AnimatedHeading
          text={es ? titleEs : titleEn}
          highlight={es ? titleHighlightEs : titleHighlightEn}
          className="mt-5 t-h1 text-primary"
        />

        {/* Subtitle — fades in at 400ms per the task spec. Uses the
            design-system secondary text token (gray-300 on dark) so the
            lead reads coherently against both the dark backdrop and the
            grain overlay. */}
        <FadeIn delay={400} duration={800}>
          <p className="mt-5 text-lg md:text-xl text-secondary leading-relaxed max-w-2xl">
            {es ? subtitleEs : subtitleEn}
          </p>
        </FadeIn>
      </div>

      {/* Accent gradient divider — a 1px hairline that transitions from
          transparent → accent → transparent. Reads as a "machined edge"
          that separates the header from the first content section with
          a quiet brand-colored cue. Theme-aware via --accent-base. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, rgb(var(--accent-base) / 0.35) 38%, rgb(var(--accent-base) / 0.5) 50%, rgb(var(--accent-base) / 0.35) 62%, transparent 92%)",
        }}
      />
    </section>
  );
}
