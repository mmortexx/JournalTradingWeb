"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/tj/Reveal";
import { MagneticButton } from "@/components/tj/MagneticButton";

/**
 * DemoReadyToBuy — compact CTA band sandwiched between StatsBand and the
 * cinematic FinalCTA. Its job is to catch visitors who just played with
 * the demo and convert that micro-engagement into a pricing/features
 * click before the heavier closing CTA loads.
 *
 * Visual layers: subtle aurora wash + two soft accent orbs, centered
 * headline with a gradient word, two MagneticButtons (Pricing primary,
 * Features secondary) and a single line of price/payment microcopy.
 */

export function DemoReadyToBuy() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "¿Listo para comprar?" : "Ready to buy?"}
      className="section-tight relative overflow-hidden"
    >
      {/* Subtle aurora wash + two soft accent orbs */}
      <div
        aria-hidden
        className="absolute inset-0 aurora-bg pointer-events-none opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-[0.10] bg-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 w-[460px] h-[460px] rounded-full blur-[120px] opacity-[0.08] bg-white"
      />

      <div className="relative max-w-page mx-auto px-5 md:px-8">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <span className="eyebrow inline-flex items-center gap-2 justify-center mb-4">
              <span className="w-6 h-px bg-[rgb(var(--txt-primary)/0.4)]" />
              {es ? "¿Y ahora?" : "What's next?"}
              <span className="w-6 h-px bg-[rgb(var(--txt-primary)/0.4)]" />
            </span>
            <h2
              className="font-medium tracking-[-0.02em] leading-[1.05] text-primary text-balance"
              style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}
            >
              {es ? (
                <>
                  ¿Te gusta <span className="text-gradient">lo que ves?</span>
                </>
              ) : (
                <>
                  Like <span className="text-gradient">what you see?</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-base md:text-lg text-secondary leading-relaxed max-w-xl mx-auto">
              {es
                ? "Llévatelo a tu máquina. Pago único, sin suscripción, con garantía de 30 días."
                : "Take it to your machine. One-time payment, no subscription, with a 30-day guarantee."}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="inline-block"
              >
                <MagneticButton
                  href={asset("/pricing")}
                  strength={0.25}
                  className="group inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--txt-primary))] text-[rgb(var(--bg))] px-8 py-3 font-medium hover:bg-[rgb(var(--txt-primary)/0.88)] hover:-translate-y-0.5 transition-[background-color,box-shadow,transform] duration-200 shadow-[0_2px_8px_-2px_rgb(var(--accent-base)/0.30),0_1px_2px_rgb(0_0_0/0.20)] hover:shadow-[0_10px_24px_-6px_rgb(var(--accent-base)/0.50),0_2px_8px_rgb(0_0_0/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {es ? "Ver precios" : "See pricing"}
                  <svg
                    className="transition-transform group-hover:translate-x-0.5"
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="inline-block"
              >
                <MagneticButton
                  href={asset("/features")}
                  strength={0.15}
                  className="liquid-glass group inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-primary border border-[rgb(var(--divider)/0.18)] hover:border-[rgb(var(--accent-base)/0.35)] hover:bg-[rgb(var(--accent-base)/0.06)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(0_0_0/0.40)] transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {es ? "Explora características" : "Explore features"}
                  <svg
                    className="transition-transform group-hover:translate-x-0.5 text-tertiary group-hover:text-[rgb(var(--accent-base))]"
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
            </div>
            <p className="mt-5 text-xs text-tertiary">
              {es ? "desde " : "from "}
              <span className="tnum text-secondary font-medium">$29</span>
              {" · "}
              {es ? "pago único · sin suscripción" : "one-time · no subscription"}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
