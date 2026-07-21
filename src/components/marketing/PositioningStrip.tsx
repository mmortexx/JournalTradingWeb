"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { SlowMoChart } from "@/components/tj/SlowMoChart";

/**
 * PositioningStrip — horizontal row of 4 differentiator badges with
 * inline SVG icons. Glass cards, accent icon chip, label.
 *
 * Premium motion layer:
 *  - SlowMoChart at opacity 0.04 drifting behind the whole strip.
 *  - Animated accent gradient line that draws across the top on view.
 *  - Each badge wrapped in a liquid-glass card with spring hover lift.
 *  - Single staggered entrance per badge (no infinite float — clean, premium).
 */

function WindowsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 5.7l8-1.1v7.1H3V5.7zM3 13h8v7l-8-1.1V13zM12 4.4L21 3v9.5h-9V4.4zM12 13h9V9.7L21 21l-9-1.3V13z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="6.8" r="0.5" fill="currentColor" />
      <circle cx="9" cy="6.8" r="0.5" fill="currentColor" />
      <circle cx="11" cy="6.8" r="0.5" fill="currentColor" />
      <path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function OnceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14.2 9.2c-.5-.6-1.3-1-2.2-1-1.5 0-2.7 1-2.7 2.3 0 1.3 1 1.8 2.7 2.3 1.7.5 2.7 1 2.7 2.3s-1.2 2.3-2.7 2.3c-1 0-1.8-.4-2.3-1.1M12 6.5v1.4M12 16v1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BilingualIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4a9 9 0 100 16 9 9 0 000-16z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 12h18M12 4c2.5 2.5 2.5 13 0 16M12 4c-2.5 2.5-2.5 13 0 16"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function PositioningStrip() {
  const { t } = useLang();
  const items = [
    { icon: <WindowsIcon />, label: t("posNative") },
    { icon: <LocalIcon />, label: t("posLocal") },
    { icon: <OnceIcon />, label: t("posOnce") },
    { icon: <BilingualIcon />, label: t("posBilingual") },
  ];

  return (
    <section className="section-tight bg-black relative overflow-hidden">
      {/* Background slow-mo equity curve */}
      <div className="absolute inset-0 pointer-events-none">
        <SlowMoChart className="w-full h-full" opacity={0.04} cycle={20} />
      </div>
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Animated accent gradient line that draws across the top of the strip */}
        <motion.div
          className="h-px w-full origin-left mb-5"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base) / 0.85) 50%, transparent 100%)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: 0.15 + i * 0.14,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full"
            >
              <motion.div
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                className="liquid-glass depth-2 rounded-card p-5 flex items-center gap-3 h-full transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)]"
              >
                  <span
                    className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] text-primary"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className="t-body-sm text-primary font-medium leading-tight">
                    {item.label}
                  </span>
                </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
