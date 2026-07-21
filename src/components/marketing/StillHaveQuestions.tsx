"use client";

import { motion, useReducedMotion } from "framer-motion";

import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";

/**
 * StillHaveQuestions — small transitional banner placed between the FAQ
 * accordion and the ContactSupport section.
 *
 * Design:
 *  - `glass rounded-card p-6` centered banner with a single line of copy.
 *  - Subtle accent glow: a static radial gradient seated at the top edge.
 *  - Accent on the second clause to draw the eye and signal "help is here".
 *  - Accent-only palette — no indigo/blue.
 */
export function StillHaveQuestions() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={es ? "¿Aún tienes dudas?" : "Still have questions?"}
      className="relative px-5 md:px-8 py-8 md:py-10"
    >
      <div className="max-w-page mx-auto">
        <Reveal y={18}>
          <motion.div
            whileHover={reduce ? undefined : { y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            className="relative liquid-glass depth-2 rounded-card p-6 md:p-7 overflow-hidden text-center"
          >
            {/* Subtle static accent glow — radial seated at top center */}
            <span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 120% at 50% 0%, rgb(var(--accent-base) / 0.18) 0%, transparent 60%)",
              }}
            />

            <p className="relative text-lg md:text-xl font-medium text-primary text-balance">
              {es ? (
                <>
                  ¿Aún tienes dudas?{" "}
                  <span className="text-gradient">Estamos aquí para ayudarte.</span>
                </>
              ) : (
                <>
                  Still have questions?{" "}
                  <span className="text-gradient">We&apos;re here to help.</span>
                </>
              )}
            </p>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
