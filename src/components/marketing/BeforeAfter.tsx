"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * BeforeAfter — "Antes vs Después" transformation section.
 *
 * Two liquid-glass cards side-by-side on desktop, stacked on mobile, separated by a
 * center arrow divider (→ desktop / ↓ mobile) labelled
 * "La transformación" / "The transformation".
 *
 * Left card (Antes / Before): muted, slightly desaturated, opacity 0.7,
 *   red ✗ icons, red-tinted border + wash.
 * Right card (Después / After): vibrant, full opacity, accent-glow border,
 *   green ✓ icons, slightly larger padding.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export function BeforeAfter() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  const before = es
    ? [
        "Operas por instinto",
        "No recuerdas por qué entraste",
        "Repites los mismos errores",
        "No sabes tu win rate real",
        "Pierdes dinero y no sabes por qué",
      ]
    : [
        "You trade on instinct",
        "You don't remember why you entered",
        "You repeat the same mistakes",
        "You don't know your real win rate",
        "You lose money and don't know why",
      ];

  const after = es
    ? [
        "Cada operación tiene un plan",
        "Sabes exactamente qué funcionó y qué no",
        "Tu disciplina se mide en dinero",
        "Conoces tu expectancy por setup",
        "Mejoras cada semana, medido",
      ]
    : [
        "Every trade has a plan",
        "You know exactly what worked and what didn't",
        "Your discipline is measured in money",
        "You know your expectancy per setup",
        "You improve every week, measured",
      ];

  return (
    <section className="section bg-veil relative overflow-hidden">
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "La transformación" : "The transformation"}
          </Eyebrow>
          <h2
            className="mt-5 t-h2 text-primary"
          >
            {es ? (
              <>
                El mismo trader.{" "}
                <span className="text-gradient">Dos resultados.</span>
              </>
            ) : (
              <>
                The same trader.{" "}
                <span className="text-gradient">Two outcomes.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-secondary leading-relaxed">
            {es
              ? "No te prometemos magia. Te prometemos un espejo: lo que haces hoy, sin maquillaje, y lo que podrías hacer si cada operación tuviera un plan."
              : "We don't promise magic. We promise a mirror: what you do today, without makeup, and what you could do if every trade had a plan."}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          {/* ───────── BEFORE — muted, desaturated, red ✗ ───────── */}
          <Reveal className="h-full flex flex-col">
            {/* Tinted header pill */}
            <div className="mb-3 self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pnl-neg/10 border border-pnl-neg/25">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pnl-neg/15 text-pnl-neg">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="t-label text-pnl-neg">
                {es ? "Antes del journal" : "Before the journal"}
              </span>
            </div>
            {/* Muted, desaturated, lower-opacity liquid-glass card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 0.7, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative flex-1 rounded-card liquid-glass depth-2 overflow-hidden border border-pnl-neg/25 saturate-[0.85] transition-shadow duration-300"
            >
              {/* Soft red wash */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 80% at 50% 0%, rgb(var(--pnl-neg) / 0.10), transparent 60%)",
                }}
              />
              <ul className="relative p-6 md:p-7 space-y-4">
                {before.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASE }}
                    className="flex items-start gap-3"
                  >
                    <span className="inline-flex shrink-0 w-5 h-5 rounded-full bg-pnl-neg/15 items-center justify-center mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="rgb(var(--pnl-neg))" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-secondary">{line}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

          {/* ───────── DIVIDER — arrow → (desktop) / ↓ (mobile) ───────── */}
          <Reveal
            delay={0.1}
            className="flex lg:flex-col items-center justify-center gap-3 lg:py-6"
          >
            <span className="text-[10px] uppercase tracking-[0.18em] text-tertiary font-semibold whitespace-nowrap">
              {es ? "La transformación" : "The transformation"}
            </span>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 240, damping: 18 }}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-[rgb(var(--divider)/0.08)] text-primary ring-1 ring-[rgb(var(--divider)/0.25)]"
              aria-hidden="true"
            >
              {/* ↓ arrow — mobile */}
              <svg className="relative block lg:hidden" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v9M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* → arrow — desktop */}
              <svg className="relative hidden lg:block" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </Reveal>

          {/* ───────── AFTER — vibrant, accent glow, ✓, slightly larger ───────── */}
          <Reveal delay={0.2} className="h-full flex flex-col">
            {/* Tinted header pill */}
            <div className="mb-3 self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(var(--accent-base)/0.1)] border border-[rgb(var(--accent-base)/0.3)]">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[rgb(var(--accent-base)/0.15)] text-[rgb(var(--accent-base))]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="t-label text-[rgb(var(--accent-base))]">
                {es ? "Con Trading Journal" : "With Trading Journal"}
              </span>
            </div>
            {/* Vibrant liquid-glass card with static accent border glow + slightly
                larger padding. No breathing animation — clean and premium. */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              whileHover={reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="relative flex-1 rounded-card liquid-glass depth-3 overflow-hidden border border-white/25 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                boxShadow:
                  "0 0 0 1px rgb(var(--accent-base) / 0.20), 0 14px 44px -8px rgb(var(--accent-base) / 0.35)",
              }}
            >
              {/* Accent wash */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 80% at 50% 0%, rgb(var(--accent-base) / 0.12), transparent 60%)",
                }}
              />
              {/* Static accent top-line */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px opacity-70"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgb(var(--accent-base)), transparent)",
                }}
              />
              <ul className="relative p-7 md:p-8 space-y-4">
                {after.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease: EASE }}
                    className="flex items-start gap-3"
                  >
                    <span className="inline-flex shrink-0 w-5 h-5 rounded-full bg-pnl-pos/15 items-center justify-center mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.5l2.5 2.5L10 3.5" stroke="rgb(var(--pnl-pos))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-primary font-medium">{line}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Reveal>
        </div>

        {/* Footnote */}
        <Reveal delay={0.18} className="mt-8">
          <p className="text-xs text-tertiary text-center max-w-2xl mx-auto">
            {es
              ? "Sin promesas de rentabilidad. Solo la disciplina de mirarte — y la herramienta para hacerlo en serio."
              : "No profitability promises. Only the discipline of looking at yourself — and the tool to do it seriously."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
