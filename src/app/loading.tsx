"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Root loading state — fast, lightweight (no canvas components).
 * Three staggered accent dots pulse above a "Cargando… / Loading…" label,
 * over the body's existing acrylic backdrop.
 *
 * Reduced-motion: the global `MotionConfig reducedMotion="user"` in
 * `providers.tsx` reduces transforms (scale) to instant for users with
 * `prefers-reduced-motion: reduce`, but the infinite opacity pulse would
 * still loop indefinitely. We explicitly gate the animation: reduced-motion
 * users see three static accent dots (clear "loading" affordance via
 * presence + label) rather than a pulsing animation.
 */
export default function Loading() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={es ? "Cargando" : "Loading"}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-5"
    >
      <div className="relative z-[2] flex flex-col items-center gap-5">
        <div className="flex items-center gap-2.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-2.5 h-2.5 rounded-full"
              style={{
                background: "rgb(var(--accent-base))",
                boxShadow: "0 0 8px rgb(var(--accent-base))",
              }}
              // Reduced-motion users get static dots; the loading label
              // below provides the loading affordance on its own.
              animate={
                reduce
                  ? undefined
                  : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.18,
                    }
              }
            />
          ))}
        </div>
        <span className="text-sm uppercase tracking-[0.2em] text-tertiary">
          {es ? "Cargando…" : "Loading…"}
        </span>
      </div>
    </section>
  );
}
