"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";

/**
 * GuaranteeBanner — prominent 30-day money-back guarantee banner shown
 * between the PageHeader and the Pricing cards on the Pricing page.
 *
 * Design:
 *  - `glass rounded-card p-5` container, full-bleed within max-w-page.
 *  - Three-column micro-layout on desktop:
 *      [shield + headline]   [supporting copy]   ["30 días" stat chip]
 *    collapses to a single stacked column on mobile.
 *  - Static shield icon (no breathing pulse — clean and premium).
 *  - A faint accent line sweeps across the top edge on view.
 *  - No indigo/blue: accent-only palette.
 */

export function GuaranteeBanner() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "Garantía de devolución" : "Refund guarantee"}
      className="relative px-5 md:px-8 -mt-4 md:-mt-6"
    >
      <div className="max-w-page mx-auto">
        <Reveal y={20}>
          <motion.div
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            className="relative liquid-glass depth-2 rounded-card p-5 md:p-6 overflow-hidden"
          >
            {/* Accent-tinted radial wash in the upper-right corner — adds
                depth without breaking the dark-premium palette. Reads as a
                soft accent halo behind the shield stat chip on the right
                side of the banner (R20-3c). */}
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-16 w-[320px] h-[200px] rounded-full blur-[80px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgb(var(--accent-base) / 0.18), transparent 70%)",
              }}
            />
            {/* Accent sweep — a thin diagonal gradient that wipes across the
                top edge on view. Purely decorative. */}
            <motion.div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base)) 50%, transparent 100%)",
                transformOrigin: "left center",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.9 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-6">
              {/* Shield + headline */}
              <div className="flex items-center gap-4 md:gap-5 md:flex-1">
                {/* Icon container — refined with an accent-tinted gradient
                    fill + accent border + inset accent ring so the shield
                    reads as a premium crest rather than a neutral chip.
                    Ties the banner to the accent palette used across the
                    rest of the pricing page (R20-3c). */}
                <span
                  className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-lg border text-[rgb(var(--accent-base))]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(var(--accent-base) / 0.18), rgb(var(--accent-base) / 0.06))",
                    borderColor: "rgb(var(--accent-base) / 0.32)",
                    boxShadow:
                      "inset 0 1px 0 rgb(var(--divider) / 0.10), 0 4px 14px -4px rgb(var(--accent-base) / 0.25)",
                  }}
                  aria-hidden="true"
                >
                  <ShieldIcon />
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="t-h3 text-primary tnum">
                      {es ? "30 días de garantía" : "30-day guarantee"}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">
                      {es ? "Sin preguntas" : "No questions"}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-secondary leading-snug">
                    {es
                      ? "Reembolso íntegro si no encaja contigo. Tu historial sigue siendo tuyo."
                      : "Full refund if it doesn't fit. Your history stays yours."}
                  </p>
                </div>
              </div>

              {/* Supporting copy — hidden on mobile to keep the banner compact. */}
              <div className="hidden md:block flex-1 border-l pl-6">
                <p className="text-[13px] text-secondary leading-relaxed">
                  {es
                    ? "Pruébalo con tu operativa real. Si en 30 días no te convence, te devolvemos cada céntimo — sin formularios, sin fricción."
                    : "Try it with your real trading. If it doesn't convince you in 30 days, we refund every cent — no forms, no friction."}
                </p>
              </div>

              {/* Stat chip — 30 días / 30 days, tnum. On mobile the chip
                  lands on its own row (the supporting copy is hidden < md),
                  so we center it to read as a deliberate credential pill
                  rather than a stray left-aligned fragment. */}
              <div className="flex justify-center md:flex-none md:justify-start md:text-right">
                <div className="inline-flex items-baseline gap-1.5 pill bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] !px-3 !py-1.5">
                  <span className="text-2xl font-bold tnum text-primary leading-none">30</span>
                  <span className="text-xs uppercase tracking-[0.12em] text-tertiary font-semibold">
                    {es ? "días" : "days"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6 2.8 3.8v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V3.8L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="m5.8 8 1.6 1.6L10.4 6.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
