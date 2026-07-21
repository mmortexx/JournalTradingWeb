"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * TrustedBy — thin centered strip of broker / platform name pills, placed
 * between ProofBar and Ticker. Reads as "trusted by traders from <names>".
 *
 * Premium motion layer:
 *  - Subtle staggered fade-up on each pill (60ms apart).
 *  - Soft accent gradient line that draws across the top on view.
 *  - Each pill has a border-white/10 border + gentle hover lift (no chrome/glass,
 *    to keep the strip lightweight between two already-chrome bands).
 */
const EASE = [0.22, 1, 0.36, 1] as const;

const BROKERS = [
  "Interactive Brokers",
  "MetaTrader",
  "Binance",
  "TradingView",
  "OANDA",
  "NinjaTrader",
] as const;

export function TrustedBy() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "Plataformas de confianza" : "Trusted platforms"}
      className="section-tight relative overflow-hidden"
    >
      <div className="relative max-w-page mx-auto px-5 md:px-8 flex flex-col items-center gap-5">
        {/* Soft accent gradient line that draws across the top */}
        <motion.div
          aria-hidden
          className="h-px w-full origin-left max-w-md"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base) / 0.45) 50%, transparent 100%)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.0, ease: EASE }}
        />

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-tertiary text-sm font-medium tracking-wide text-center"
        >
          {es ? "De confianza para traders de" : "Trusted by traders from"}
        </motion.p>

        {/* Pills */}
        <motion.ul
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
        >
          {BROKERS.map((name, i) => (
            <motion.li
              key={name}
              variants={{
                hidden: { opacity: 0, y: 10 },
                shown: { opacity: 1, y: 0 },
              }}
              transition={{
                duration: 0.45,
                delay: i * 0.06,
                ease: EASE,
              }}
              whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="inline-flex items-center rounded-full border border-solid border-white/10 bg-white/5 px-3.5 py-1.5 text-tertiary text-sm font-semibold"
            >
              {name}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
