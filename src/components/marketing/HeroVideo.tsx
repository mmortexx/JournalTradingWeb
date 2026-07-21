"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import { useLang } from "@/lib/i18n";
import { AnimatedHeading } from "@/components/tj/AnimatedHeading";
import { FadeIn } from "@/components/tj/FadeIn";

/**
 * Hero — full-screen image background (user-uploaded golden pathway),
 * institutional fintech-product launch aesthetic.
 *
 * Layered materials:
 *  - Background image (next/image, fills viewport, priority).
 *  - Top scrim (from-black/40 → transparent) for navbar legibility.
 *  - Bottom scrim (transparent → black/100) for headline legibility + a
 *    clean blend into the next section.
 *  - Subtle radial accent glow behind the headline (accent gold, 12%).
 *  - `.grain` opt-in texture (3% fractalNoise overlay) for the
 *    "expensive printed" feel.
 *
 * Left column: eyebrow pill → character-by-character heading with a
 * gradient-highlighted "medida." / "measured." → refined lead paragraph
 * → primary "Comprar — desde $149" CTA (with arrow that translates on
 * hover) + secondary liquid-glass "Probar la demo" → inline trust strip
 * of 4 small-icon credibility signals (100 % local · Pago único ·
 * ES + EN · Garantía 30 días).
 *
 * Right column: liquid-glass "Métricas. Disciplina. Local." tag with an
 * accent left-border. Vertically aligned with the headline baseline on
 * desktop, hidden underneath on mobile.
 *
 * Bottom center: subtle animated scroll cue (chevron + line).
 *
 * Bilingual via `useLang()`. No indigo/blue. Accent gold used sparingly
 * for the gradient headline + eyebrow dot + radial glow + tag left-border.
 */
export function HeroVideo() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black pt-16">
      {/* Image background — user-uploaded golden pathway, covers viewport */}
      <div className="absolute inset-0 z-0">
        <Image
          src={asset("/img/hero-bg.webp")}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Top scrim — softens the navbar edge for legibility without
          darkening the hero image. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[1] h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
        }}
      />

      {/* Subtle radial accent glow behind the headline — gives the gold
          a "lit" quality without an obvious orb. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-[1] left-1/2 -translate-x-1/2 bottom-[18%] w-[840px] h-[420px] rounded-full blur-[150px] opacity-[0.14]"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
        }}
      />

      {/* Bottom scrim — anchors headline legibility and blends the hero
          into the next dark section. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-[1] h-2/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.75) 70%, #000000 100%)",
        }}
      />

      {/* Grain texture — opt-in `.grain` utility layers a 3% fractalNoise
          overlay via ::after. Sits over the image + scrims (z-[2]). */}
      <div aria-hidden="true" className="grain absolute inset-0 z-[2] pointer-events-none" />

      {/* Hero content — bottom of viewport */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-16 lg:pb-20">
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
          {/* Left column — main content (8/12 cols on desktop) */}
          <div className="lg:col-span-8">
            {/* Eyebrow / kicker — small pill with accent dot + tracked label.
                Signals "institutional product" immediately. */}
            <FadeIn delay={150} duration={800}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm px-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-1.5 w-1.5"
                >
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                    style={{ background: "rgb(var(--accent-base))" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: "rgb(var(--accent-base))" }}
                  />
                </span>
                <span className="eyebrow !text-[10.5px] !text-gray-300">
                  {es
                    ? "DIARIO DE TRADING · NATIVO DE WINDOWS"
                    : "TRADING JOURNAL · WINDOWS NATIVE"}
                </span>
              </div>
            </FadeIn>

            {/* Headline — character-by-character reveal with the final
                word in accent gold gradient (via AnimatedHeading.highlight). */}
            <AnimatedHeading
              text={es ? "Tu operativa,\nmedida." : "Your trading,\nmeasured."}
              highlight={es ? "medida." : "measured."}
              className="text-white font-normal mb-5"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
              }}
            />

            {/* Sub-headline — refined lead paragraph */}
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-7 max-w-xl leading-relaxed">
                {es
                  ? "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina que te frena antes de la tontería y tus datos 100% en tu máquina."
                  : "The professional trading journal, native to Windows. Institutional metrics, discipline that stops you before the dumb trade, and your data 100% on your machine."}
              </p>
            </FadeIn>

            {/* CTAs — primary white + secondary liquid-glass, same height */}
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={asset("/pricing")}
                  className="group inline-flex items-center gap-2 rounded-lg bg-white text-black px-8 py-3.5 font-medium shadow-[0_1px_2px_rgb(0_0_0/0.20)] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgb(0_0_0/0.30)] transition-all duration-200"
                >
                  {es ? "Comprar — desde $149" : "Buy — from $149"}
                  <svg
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    width="18"
                    height="18"
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
                <a
                  href={asset("/demo")}
                  className="liquid-glass border border-white/20 text-white inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-200"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 3.5v9l7-4.5-7-4.5Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {es ? "Probar la demo" : "Try the demo"}
                </a>
              </div>
            </FadeIn>

            {/* Trust strip — inline credibility row with small icons.
                Separated by faint dots. */}
            <FadeIn delay={1400} duration={1000}>
              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400">
                <TrustItem
                  icon={
                    <path
                      d="M4 7V5a3 3 0 016 0v2M3 7h8v6H3V7zM7 10v1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  }
                  label={es ? "100% local" : "100% local"}
                />
                <span aria-hidden="true" className="text-gray-600">·</span>
                <TrustItem
                  icon={
                    <path
                      d="m4 8 2.5 2.5L12 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  }
                  label={es ? "Pago único" : "One-time payment"}
                />
                <span aria-hidden="true" className="text-gray-600">·</span>
                <TrustItem
                  icon={
                    <>
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" fill="none" />
                      <path
                        d="M2 8h12M8 2c1.8 1.6 2.8 3.7 2.8 6S9.8 12.4 8 14C6.2 12.4 5.2 10.3 5.2 8S6.2 3.6 8 2Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinejoin="round"
                      />
                    </>
                  }
                  label="ES + EN"
                />
                <span aria-hidden="true" className="text-gray-600">·</span>
                <TrustItem
                  icon={
                    <>
                      <path
                        d="M8 2 2.5 4.5v3.5c0 3 2.4 5.2 5.5 6 3.1-0.8 5.5-3 5.5-6V4.5L8 2Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m6 8 1.5 1.5L10 7"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </>
                  }
                  label={es ? "Garantía 30 días" : "30-day guarantee"}
                />
              </ul>
            </FadeIn>
          </div>

          {/* Right column — tag (4/12 cols on desktop, hidden on mobile) */}
          <FadeIn delay={1400} duration={1000}>
            <div className="hidden lg:flex lg:col-span-4 items-end justify-end mt-0">
              <div
                className="liquid-glass border border-white/20 rounded-xl px-6 py-4 max-w-[320px]"
                style={{ borderLeft: "2px solid rgb(var(--accent-base) / 0.55)" }}
              >
                <p className="text-lg lg:text-xl font-light text-white leading-snug whitespace-nowrap">
                  {es ? "Métricas. Disciplina. Local." : "Metrics. Discipline. Local."}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-gray-400">
                  {es ? "Tres promesas, una app." : "Three promises, one app."}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll cue — bottom center, animated chevron. */}
      <FadeIn delay={1800} duration={1000}>
        <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
            {es ? "Desplázate" : "Scroll"}
          </span>
          <svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            fill="none"
            aria-hidden="true"
            className="animate-bounce"
            style={{ animationDuration: "2.4s" }}
          >
            <rect
              x="1"
              y="1"
              width="16"
              height="20"
              rx="8"
              stroke="rgb(255 255 255 / 0.25)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M9 5v5"
              stroke="rgb(255 255 255 / 0.7)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M5 13l4 3 4-3"
              stroke="rgb(var(--accent-base) / 0.85)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </FadeIn>
    </section>
  );
}

/** Single trust-strip item: 12px icon + label, inline. */
function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="text-gray-400"
      >
        {icon}
      </svg>
      <span>{label}</span>
    </li>
  );
}
