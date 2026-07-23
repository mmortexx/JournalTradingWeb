"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Thin trust band: a single row of trust signals with inline SVG icons,
 * separated by dots. Uses section-tight padding and centered layout.
 */
export function TrustStrip() {
  const { lang } = useLang();
  const es = lang === "es";

  const items = [
    {
      icon: <ShieldIcon />,
      label: es ? "Garantía 30 días" : "30-day guarantee",
    },
    {
      icon: <InfinityIcon />,
      label: es ? "Sin suscripción" : "No subscription",
    },
    {
      icon: <LockIcon />,
      label: es ? "Datos 100 % locales" : "100 % local data",
    },
    {
      icon: <GlobeIcon />,
      label: "ES + EN",
    },
    {
      icon: <SparkIcon />,
      label: es ? "Actualizaciones gratuitas" : "Free updates",
    },
  ];

  return (
    <section
      aria-label={es ? "Garantías" : "Guarantees"}
      className="section-tight relative overflow-hidden"
    >
      {/* Accent gradient line that sweeps across the strip on view */}
      <motion.div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base)) 50%, transparent 100%)",
          transformOrigin: "left center",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 0.9 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-secondary text-sm"
        >
          {items.map((item, i) => (
            <Fragment key={item.label}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-2"
              >
                <span
                  className="text-primary shrink-0 inline-flex"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="t-caption text-secondary whitespace-nowrap tnum">{item.label}</span>
              </motion.div>
              {i < items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden md:inline-block w-1 h-1 rounded-full bg-[rgb(var(--divider)/0.20)]"
                />
              )}
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---- Inline SVG icons (16×16) ---- */
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6 2.8 3.8v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V3.8L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="m5.8 8 1.6 1.6L10.4 6.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfinityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5 5.5c-1.7 0-3 1.1-3 2.5s1.3 2.5 3 2.5c1.8 0 2.7-1.5 3-2.5.3-1 1.2-2.5 3-2.5 1.7 0 3 1.1 3 2.5s-1.3 2.5-3 2.5c-1.8 0-2.7-1.5-3-2.5-.3-1-1.2-2.5-3-2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M5 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2 8h12M8 2c1.6 1.7 2.5 3.7 2.5 6S9.6 12.3 8 14c-1.6-1.7-2.5-3.7-2.5-6S6.4 3.7 8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.6 3.6l2 2M10.4 10.4l2 2M3.6 12.4l2-2M10.4 5.6l2-2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
