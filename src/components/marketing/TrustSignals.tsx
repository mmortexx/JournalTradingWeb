"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";

/**
 * TrustSignals — institutional trust/credibility band placed right after
 * the Hero (before the Ticker). Stripe-style: a tight row of premium
 * `.liquid-glass` mini-cards, each pairing an inline SVG icon (in an
 * IconWell) with a label + sublabel. Staggered Reveal entrance +
 * subtle hover lift.
 *
 * Layout: 2 cols on mobile, 3 on md, 5 on lg (so all 5 signals read
 * in a single horizontal row on desktop — the institutional pattern).
 *
 * Bilingual via `useLang()`. Accent gold used sparingly: only the icon
 * on the "Garantía 30 días" card uses the accent color (the rest use
 * `text-primary`), so the guarantee reads as the focal signal without
 * flooding the band with gold. No indigo/blue. Dark theme primary;
 * light theme works via `.text-primary/.text-secondary/.text-tertiary`.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

interface TrustItem {
  icon: React.ReactNode;
  /** Accent-tinted icon? Reserved for the single focal "guarantee" item. */
  accent?: boolean;
  labelEs: string;
  labelEn: string;
  subEs: string;
  subEn: string;
}

const ITEMS: TrustItem[] = [
  {
    icon: <DollarIcon />,
    labelEs: "Pago único · Sin suscripción",
    labelEn: "One-time · No subscription",
    subEs: "$29 — para siempre",
    subEn: "$29 — yours forever",
  },
  {
    icon: <LockIcon />,
    labelEs: "100 % local · Cero telemetría",
    labelEn: "100 % local · Zero telemetry",
    subEs: "Tus datos no salen de tu PC",
    subEn: "Your data never leaves your PC",
  },
  {
    icon: <ShieldIcon />,
    accent: true,
    labelEs: "Garantía 30 días",
    labelEn: "30-day guarantee",
    subEs: "Reembolso completo, sin preguntas",
    subEn: "Full refund, no questions",
  },
  {
    icon: <GlobeIcon />,
    labelEs: "ES + EN · Bilingüe de verdad",
    labelEn: "ES + EN · Truly bilingual",
    subEs: "No traducciones automáticas",
    subEn: "No auto-translations",
  },
  {
    icon: <RefreshIcon />,
    labelEs: "Actualizaciones gratuitas de por vida",
    labelEn: "Free lifetime updates",
    subEs: "Sin planes, sin tramos",
    subEn: "No tiers, no plans",
  },
];

export function TrustSignals() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      id="trust"
      aria-label={es ? "Garantías y confianza" : "Guarantees and trust"}
      className="section-tight cv-auto relative overflow-hidden"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      {/* Subtle top hairline — reads as a divider between Hero and the band. */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgb(var(--divider) / 0.12) 20%, rgb(var(--divider) / 0.12) 80%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ITEMS.map((item, i) => (
              <motion.div
                key={item.labelEs}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.07,
                  ease: EASE,
                }}
                whileHover={{
                  y: -3,
                  transition: { type: "spring", stiffness: 300, damping: 24 },
                }}
                className="liquid-glass depth-1 hover:depth-2 rounded-card p-4 flex flex-col items-start gap-3 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <IconWell accent={item.accent}>{item.icon}</IconWell>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-primary leading-tight">
                    {es ? item.labelEs : item.labelEn}
                  </div>
                  <div className="text-xs text-tertiary mt-1 leading-snug">
                    {es ? item.subEs : item.subEn}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Icon well (w-9 h-9, machined-edge) ---------- */
function IconWell({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] ${
        accent ? "text-[rgb(var(--accent-base))]" : "text-primary"
      }`}
    >
      {children}
    </span>
  );
}

/* ---------- Inline SVG icons (18×18) ---------- */
function DollarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5v13M11 4.5c0-1.4-1.5-2.2-3-2.2s-3 .8-3 2.2c0 3 6 1.6 6 4.5 0 1.4-1.5 2.2-3 2.2s-3-.8-3-2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 7V5a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6 2.8 3.8v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V3.8L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="m5.8 8 1.6 1.6L10.4 6.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 8h12M8 2c1.6 1.7 2.5 3.7 2.5 6S9.6 12.3 8 14c-1.6-1.7-2.5-3.7-2.5-6S6.4 3.7 8 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 8A5.5 5.5 0 1 1 11 3.5M13 1.5v3h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
