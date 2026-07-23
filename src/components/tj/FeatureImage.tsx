"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface FeatureImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Overlay gradient opacity (0-1). Set 0 for real screenshots that
   *  must read whole and crisp (galleries). */
  overlay?: number;
  /** Priority loading (for above-the-fold images). */
  priority?: boolean;
  /** Animation delay for reveal. */
  delay?: number;
  /**
   * Object-fit behaviour. `"cover"` (default, legacy) crops the image to
   * fill the frame — fine for abstract/stock art. `"contain"` shows the
   * WHOLE image letterboxed on a theme-aware surface — use for real app
   * screenshots so the visitor reads every pixel of the app.
   */
  fit?: "cover" | "contain";
  /**
   * `sizes` attribute forwarded to next/image. Defaults to a sensible
   * 1/2/3-column responsive hint. Pass a more specific value when the
   * image lives in a different grid (e.g. a 4-up gallery should pass
   * `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw`).
   */
  sizes?: string;
}

/**
 * Feature image with glass overlay and reveal animation.
 * Uses next/image with unoptimized for static export compatibility.
 * The overlay ensures images blend with the dark glass theme.
 */
export function FeatureImage({
  src,
  alt,
  className = "",
  overlay = 0.4,
  priority = false,
  delay = 0,
  fit = "cover",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: FeatureImageProps) {
  const isContain = fit === "contain";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden rounded-card ${isContain ? "bg-[color-mix(in_srgb,var(--surface)_92%,transparent)]" : ""} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized
        className={isContain ? "object-contain" : "object-cover"}
        sizes={sizes}
      />
      {/* Gradient overlay to blend with the dark theme — only for cover
          mode. In contain mode the screenshot must read whole and crisp,
          so we skip the tint veil entirely (the theme-aware surface bg
          above already provides letterbox contrast). */}
      {!isContain && overlay > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgb(var(--tint) / ${overlay * 0.3}) 0%, rgb(var(--tint) / ${overlay * 0.6}) 60%, rgb(var(--tint) / ${overlay * 0.9}) 100%)`,
          }}
          aria-hidden="true"
        />
      )}
      {/* Accent tint at top — cover mode only (would muddy a screenshot). */}
      {!isContain && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background: `radial-gradient(60% 40% at 80% 0%, rgb(var(--accent-base) / 0.15), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
