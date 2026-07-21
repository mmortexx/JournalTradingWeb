"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { asset } from "@/lib/asset";

/**
 * BlogPreview — 3 editorial preview cards teasing future long-form posts
 * (the blog itself ships later). Bilingual, accent-only palette, glass
 * cards with a colored top strip per category.
 *
 * Premium motion layer:
 *  - Staggered card reveal (each card slides up + fades in).
 *  - On hover: lift (-6px), accent border glow (box-shadow ring) and the
 *    top strip brightens.
 *  - "Read more" arrow translates x on card hover (CSS group-hover).
 *  - Static clock icon + read-time text (no gimmicky fill ring).
 *
 * No indigo/blue: each card's strip uses a distinct accent variant
 * (accent / pnl-pos / pnl-warn) — all from the project's P&L palette.
 */

type Post = {
  /** Category chip label (bilingual via es flag below). */
  catEs: string;
  catEn: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  read: string; // e.g. "5 min read" — read time, language-neutral label suffix
  readLabelEs: string; // "min de lectura"
  readLabelEn: string; // "min read"
  readNum: number; // numeric minutes — rendered with `tnum`
  /** Strip gradient — expressed as a CSS gradient string using accent tokens. */
  strip: string;
  /** Tone key, drives the chip text color + the glow color. */
  tone: "accent" | "pos" | "warn";
};

const POSTS: Post[] = [
  {
    catEs: "Psicología",
    catEn: "Psychology",
    titleEs: "Por qué tu win rate no importa",
    titleEn: "Why your win rate doesn't matter",
    excerptEs: "Expectancy > win rate. Te explicamos por qué.",
    excerptEn: "Expectancy > win rate. We explain why.",
    read: "",
    readLabelEs: "min de lectura",
    readLabelEn: "min read",
    readNum: 5,
    strip:
      "linear-gradient(90deg, rgb(var(--accent-base)) 0%, rgb(var(--accent-hover)) 100%)",
    tone: "accent",
  },
  {
    catEs: "Disciplina",
    catEn: "Discipline",
    titleEs: "El coste real de la indisciplina",
    titleEn: "The real cost of indiscipline",
    excerptEs:
      "Calculamos cuánto pierde un trader medio por operar fuera de plan.",
    excerptEn:
      "We calculate how much the average trader loses by trading off-plan.",
    read: "",
    readLabelEs: "min de lectura",
    readLabelEn: "min read",
    readNum: 7,
    strip:
      "linear-gradient(90deg, rgb(var(--pnl-pos)) 0%, rgb(var(--accent-base)) 100%)",
    tone: "pos",
  },
  {
    catEs: "Herramientas",
    catEn: "Tools",
    titleEs: "Monte Carlo para traders",
    titleEn: "Monte Carlo for traders",
    excerptEs: "Cómo simular 10.000 escenarios de tu curva de equity.",
    excerptEn: "How to simulate 10,000 scenarios of your equity curve.",
    read: "",
    readLabelEs: "min de lectura",
    readLabelEn: "min read",
    readNum: 10,
    strip:
      "linear-gradient(90deg, rgb(var(--pnl-warn)) 0%, rgb(var(--accent-base)) 100%)",
    tone: "warn",
  },
];

// TONE_TEXT maps each post tone to a design-system text token. `accent`
// uses primary (white on dark / near-black on light) so the chip text
// reads at full chroma against the colored strip; `pos` / `warn` use
// the P&L palette so the chip color matches its strip gradient.
const TONE_TEXT: Record<Post["tone"], string> = {
  accent: "text-primary",
  pos: "text-pnl-pos",
  warn: "text-pnl-warn",
};

const TONE_GLOW: Record<Post["tone"], string> = {
  accent: "rgb(var(--accent-base))",
  pos: "rgb(var(--pnl-pos))",
  warn: "rgb(var(--pnl-warn))",
};

export function BlogPreview() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "Blog" : "Blog"}
      className="section cv-auto relative overflow-hidden"
    >
      {/* Subtle aurora wash — keeps the section cohesive with its neighbours
          without adding a second canvas (no MarketBackground here, so the
          page keeps its single-canvas-per-section rhythm where one exists). */}
      <div aria-hidden="true" className="absolute inset-0 aurora-bg opacity-50 pointer-events-none" />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Blog" : "Blog"}</Eyebrow>
          <h2
            className="mt-5 t-h2 text-primary"
          >
            {es ? (
              <>
                Últimas <span className="text-gradient">reflexiones.</span>
              </>
            ) : (
              <>
                Latest <span className="text-gradient">insights.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-secondary leading-relaxed text-lg">
            {es
              ? "Ensayos sobre operativa, disciplina y métricas. Sin ruido, sin titular clickbait — solo lo que de verdad mueve la aguja."
              : "Essays on trading, discipline and metrics. No noise, no clickbait headlines — just what actually moves the needle."}
          </p>
        </Reveal>

        {/* Cards */}
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {POSTS.map((p, i) => (
            <BlogCard key={i} post={p} index={i} es={es} />
          ))}
        </div>

        {/* Footer link to (future) blog index */}
        <Reveal delay={0.3}>
          <div className="mt-10 flex justify-center">
            <a
              href={asset("#blog-index")}
              className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              {es ? "Ver todos los artículos" : "View all articles"}
              <svg
                width="14"
                height="14"
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
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BlogCard                                                           */
/* ------------------------------------------------------------------ */

/**
 * BlogCard — extracted from the inline map for a clean per-card render.
 * Hover lift + accent border glow are CSS-driven (group-hover); no
 * gimmicky read-progress ring, no infinite sheen sweep.
 */
function BlogCard({
  post: p,
  index: i,
  es,
}: {
  post: Post;
  index: number;
  es: boolean;
}) {
  return (
    <Reveal delay={i * 0.08} y={28}>
      <motion.article
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
        className="group liquid-glass depth-2 rounded-card overflow-hidden h-full flex flex-col relative transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={({ ["--glow" as string]: TONE_GLOW[p.tone] } as React.CSSProperties)}
      >
        {/* Accent border glow on hover — uses the card's --glow var. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-card pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow:
              "0 18px 48px -16px var(--glow), 0 0 0 1px var(--glow)",
          }}
        />

        {/* Colored top strip — accent gradient per category. */}
        <div className="relative h-1.5 w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: p.strip }}
          />
        </div>

        <div className="relative flex flex-col flex-1 p-5">
          {/* Category chip + read time */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={`pill bg-white/5 border border-white/10 ${TONE_TEXT[p.tone]}`}
            >
              {es ? p.catEs : p.catEn}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-tertiary">
              <ClockIcon />
              <span className="tnum">{p.readNum}</span>{" "}
              {es ? p.readLabelEs : p.readLabelEn}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-4 t-h3 text-primary leading-snug mb-3">
            {es ? p.titleEs : p.titleEn}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-secondary leading-relaxed flex-1">
            {es ? p.excerptEs : p.excerptEn}
          </p>

          {/* Read more link */}
          <a
            href={asset("#blog-" + (i + 1))}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[rgb(var(--accent-base))] transition-colors duration-200 group/link"
          >
            {es ? "Leer más" : "Read more"}
            <svg
              className="transition-transform duration-200 group-hover/link:translate-x-1 group-hover:translate-x-1"
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
          </a>
        </div>
      </motion.article>
    </Reveal>
  );
}

/** Simple clock icon — replaces the gimmicky read-progress ring. */
function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8l2.2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
