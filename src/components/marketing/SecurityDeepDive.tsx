"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * SecurityDeepDive — institutional security/privacy section placed
 * after the FeaturePreview. Three-card grid (each `.liquid-glass
 * rounded-card p-6`) with custom inline SVG diagrams + bullet lists
 * of concrete claims, followed by a "Trading Journal vs SaaS en la
 * nube" comparison mini-table with check/cross icons.
 *
 * Cards:
 *   1. "Tus datos, tu disco"      — local-first explainer + laptop/lock SVG
 *   2. "Cero telemetría"          — no analytics/tracking + crossed-out antenna
 *   3. "Cifrado en reposo"        — DB on your encrypted drive + lock+key SVG
 *
 * Comparison mini-table rows: Privacidad / Pago / Telemetría / Datos.
 * Two columns: Trading Journal (check) vs SaaS en la nube (cross).
 *
 * Bilingual via `useLang()`. Accent gold used sparingly: only on the
 * headline gradient word + the diagram strokes (so the SVG diagrams
 * read as part of the brand). P&L colors: green checks, red crosses.
 * Dark theme primary; light theme works via `.text-primary` etc.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export function SecurityDeepDive() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      id="security"
      aria-label={es ? "Seguridad y privacidad" : "Security and privacy"}
      className="section cv-auto relative overflow-hidden"
    >
      {/* Subtle aurora-bg backdrop */}
      <div
        aria-hidden="true"
        className="aurora-bg absolute inset-0 pointer-events-none opacity-70"
      />
      {/* Section grain */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <Eyebrow>
            {es ? "SEGURIDAD Y PRIVACIDAD" : "SECURITY & PRIVACY"}
          </Eyebrow>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-primary leading-[1.1]">
            {es ? (
              <>
                Tu operativa no debería ser{" "}
                <span className="text-gradient">producto de nadie.</span>
              </>
            ) : (
              <>
                Your trading shouldn't be{" "}
                <span className="text-gradient">someone's product.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Sin servidor. Sin telemetría. Sin cuentas obligatorias. Tu diario vive en un único archivo .sqlite en tu disco, donde tú decides — y donde ningún analista de datos puede llegar."
              : "No server. No telemetry. No mandatory accounts. Your journal lives in a single .sqlite file on your disk, where you decide — and where no data analyst can reach."}
          </p>
        </Reveal>

        {/* 3-card grid */}
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => (
            <Reveal key={card.titleEs} delay={i * 0.08} className="h-full">
              <SecurityCard card={card} es={es} />
            </Reveal>
          ))}
        </div>

        {/* Comparison mini-table */}
        <Reveal delay={0.2} y={24}>
          <ComparisonTable es={es} />
        </Reveal>
      </div>
    </section>
  );
}

/* ============ Card data ============ */

interface CardDef {
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  icon: React.ReactNode;
  diagram: React.ReactNode;
  bulletsEs: string[];
  bulletsEn: string[];
}

const CARDS: CardDef[] = [
  {
    titleEs: "Tus datos, tu disco",
    titleEn: "Your data, your disk",
    descEs:
      "Local-first de verdad. Todo — operaciones, notas, capturas, configuración — vive en un único archivo .sqlite en tu equipo.",
    descEn:
      "Truly local-first. Everything — trades, notes, screenshots, settings — lives in a single .sqlite file on your machine.",
    icon: <DiskIcon />,
    diagram: <LaptopLockDiagram />,
    bulletsEs: [
      "Un único archivo .sqlite en la carpeta que tú elijas",
      "Sin cuenta obligatoria, sin login, sin cloud sync",
      "Funciona sin internet — avión, hotel, sótano",
      "Cópialo, respáldalo, míralo con cualquier lector SQLite",
    ],
    bulletsEn: [
      "A single .sqlite file in the folder you choose",
      "No mandatory account, no login, no cloud sync",
      "Works without internet — plane, hotel, basement",
      "Copy it, back it up, inspect it with any SQLite reader",
    ],
  },
  {
    titleEs: "Cero telemetría",
    titleEn: "Zero telemetry",
    descEs:
      "Cero analítica. Cero tracking. Cero phone-home. La app no abre ninguna conexión saliente salvo la que tú dispares (verificar actualizaciones, opcional).",
    descEn:
      "Zero analytics. Zero tracking. Zero phone-home. The app opens no outbound connections except the ones you trigger (update check, opt-in).",
    icon: <AntennaOffIcon />,
    diagram: <CrossedAntennaDiagram />,
    bulletsEs: [
      "Sin Google Analytics, Mixpanel, Sentry ni similares",
      "Sin píxeles, sin cookies, sin fingerprints",
      "Sin reports de fallos que envían tu data a terceros",
      "Verifícalo: audita el tráfico con Wireshark",
    ],
    bulletsEn: [
      "No Google Analytics, Mixpanel, Sentry or similar",
      "No pixels, no cookies, no fingerprints",
      "No crash reports that send your data to third parties",
      "Verify it: audit the traffic with Wireshark",
    ],
  },
  {
    titleEs: "Cifrado en reposo",
    titleEn: "Encrypted at rest",
    descEs:
      "Tu base de datos descansa en tu disco. Si tu disco está cifrado (BitLocker, FileVault, LUKS), tu diario lo está. Tú mandas; nosotros no tocamos.",
    descEn:
      "Your database rests on your disk. If your disk is encrypted (BitLocker, FileVault, LUKS), so is your journal. You're in control; we don't touch it.",
    icon: <KeyIcon />,
    diagram: <LockKeyDiagram />,
    bulletsEs: [
      "Compatible con BitLocker (Windows), FileVault (macOS), LUKS (Linux)",
      "El archivo .sqlite nunca se sube a ningún servidor",
      "Sin claves maestras gestionadas por terceros",
      "Tu copia de seguridad = tu responsabilidad = tu control",
    ],
    bulletsEn: [
      "Compatible with BitLocker (Windows), FileVault (macOS), LUKS (Linux)",
      "The .sqlite file never gets uploaded to any server",
      "No master keys managed by third parties",
      "Your backup = your responsibility = your control",
    ],
  },
];

/* ============ Card component ============ */

function SecurityCard({ card, es }: { card: CardDef; es: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      className="liquid-glass depth-2 hover:depth-3 rounded-card p-6 h-full flex flex-col transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      {/* Icon well */}
      <div className="flex items-center gap-3 mb-4">
        <span
          aria-hidden="true"
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] text-[rgb(var(--accent-base))]"
        >
          {card.icon}
        </span>
        <h3 className="text-base font-semibold text-primary leading-tight">
          {es ? card.titleEs : card.titleEn}
        </h3>
      </div>

      {/* Diagram */}
      <div className="rounded-lg bg-black/30 border border-white/[0.06] p-4 mb-4">
        {card.diagram}
      </div>

      {/* Description */}
      <p className="text-sm text-secondary leading-relaxed">
        {es ? card.descEs : card.descEn}
      </p>

      {/* Bullets */}
      <ul className="mt-4 space-y-2 flex-1">
        {(es ? card.bulletsEs : card.bulletsEn).map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-secondary">
            <CheckIcon className="mt-0.5 shrink-0 text-pnl-pos" />
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ============ Comparison mini-table ============ */

function ComparisonTable({ es }: { es: boolean }) {
  const rows: {
    labelEs: string;
    labelEn: string;
    tjEs: string;
    tjEn: string;
    saasEs: string;
    saasEn: string;
  }[] = [
    {
      labelEs: "Privacidad",
      labelEn: "Privacy",
      tjEs: "Tus operaciones en tu disco",
      tjEn: "Your trades on your disk",
      saasEs: "Subidas a su nube",
      saasEn: "Uploaded to their cloud",
    },
    {
      labelEs: "Pago",
      labelEn: "Payment",
      tjEs: "Pago único — $29 / $49",
      tjEn: "One-time — $29 / $49",
      saasEs: "Suscripción mensual",
      saasEn: "Monthly subscription",
    },
    {
      labelEs: "Telemetría",
      labelEn: "Telemetry",
      tjEs: "Cero analítica",
      tjEn: "Zero analytics",
      saasEs: "Tracking de comportamiento",
      saasEn: "Behavior tracking",
    },
    {
      labelEs: "Datos",
      labelEn: "Data",
      tjEs: "Tuyos — archivo .sqlite",
      tjEn: "Yours — .sqlite file",
      saasEs: "Suyos — acceso revocable",
      saasEn: "Theirs — revocable access",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      className="mt-10 liquid-glass depth-2 rounded-card overflow-hidden"
    >
      {/* Header row */}
      <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr] bg-white/[0.03] border-b border-white/10">
        <div className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-tertiary font-semibold">
          {es ? "Comparativa" : "Comparison"}
        </div>
        <div className="px-4 py-3 text-sm font-semibold text-primary border-l border-white/10">
          Trading Journal
        </div>
        <div className="px-4 py-3 text-sm font-semibold text-tertiary border-l border-white/10">
          {es ? "SaaS en la nube" : "Cloud SaaS"}
        </div>
      </div>

      {/* Body rows */}
      {rows.map((r, i) => (
        <div
          key={r.labelEn}
          className={`grid grid-cols-[1.2fr_1.4fr_1.4fr] ${
            i < rows.length - 1 ? "border-b border-white/[0.06]" : ""
          }`}
        >
          <div className="px-4 py-3 text-xs uppercase tracking-[0.1em] text-tertiary font-medium">
            {es ? r.labelEs : r.labelEn}
          </div>
          <div className="px-4 py-3 flex items-center gap-2 border-l border-white/10">
            <CheckIcon className="shrink-0 text-pnl-pos" />
            <span className="text-sm text-primary">{es ? r.tjEs : r.tjEn}</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-2 border-l border-white/10">
            <CrossIcon className="shrink-0 text-pnl-neg" />
            <span className="text-sm text-tertiary">{es ? r.saasEs : r.saasEn}</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ============ Icons (16-20px) ============ */

function DiskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 6v12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function AntennaOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8 6a6 6 0 0 0 8 8M16 6a6 6 0 0 1-4.5 5.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path
        d="M4 4l16 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M11 11l8 8M16 16l2-2M14 14l2-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m3 8 3.2 3.2L13 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============ SVG diagrams (larger, in-card) ============ */

/** Laptop with a lock badge — local-first. */
function LaptopLockDiagram() {
  return (
    <svg
      viewBox="0 0 200 110"
      className="w-full h-auto"
      role="img"
      aria-label="Laptop with a lock — your data stays on your machine"
    >
      <defs>
        <linearGradient id="sd-screen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent-base) / 0.18)" />
          <stop offset="100%" stopColor="rgb(var(--accent-base) / 0.04)" />
        </linearGradient>
        <linearGradient id="sd-locked" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--pnl-pos))" />
          <stop offset="100%" stopColor="rgb(var(--accent-base))" />
        </linearGradient>
      </defs>

      {/* Laptop body */}
      <rect
        x="40"
        y="20"
        width="120"
        height="64"
        rx="6"
        fill="rgb(var(--card) / 0.55)"
        stroke="rgb(var(--accent-base) / 0.35)"
        strokeWidth="1.2"
      />
      {/* Screen */}
      <rect
        x="48"
        y="28"
        width="104"
        height="48"
        rx="3"
        fill="url(#sd-screen)"
        stroke="rgb(var(--accent-base) / 0.25)"
        strokeWidth="1"
      />
      {/* Fake UI rows */}
      <rect x="56" y="36" width="40" height="3" rx="1.5" fill="rgb(var(--accent-base) / 0.7)" />
      <rect x="56" y="44" width="64" height="2.5" rx="1" fill="rgb(var(--txt-tertiary) / 0.6)" />
      <rect x="56" y="50" width="50" height="2.5" rx="1" fill="rgb(var(--txt-tertiary) / 0.6)" />
      {/* Mini bars */}
      <g>
        <rect x="56" y="62" width="5" height="10" rx="1" fill="rgb(var(--pnl-pos) / 0.7)" />
        <rect x="63" y="66" width="5" height="6" rx="1" fill="rgb(var(--pnl-neg) / 0.7)" />
        <rect x="70" y="58" width="5" height="14" rx="1" fill="rgb(var(--pnl-pos) / 0.7)" />
        <rect x="77" y="68" width="5" height="4" rx="1" fill="rgb(var(--pnl-neg) / 0.7)" />
        <rect x="84" y="60" width="5" height="12" rx="1" fill="rgb(var(--pnl-pos) / 0.7)" />
      </g>
      {/* Equity mini-line */}
      <path
        d="M96 70 L106 64 L116 67 L126 56 L136 60 L146 50"
        fill="none"
        stroke="rgb(var(--accent-base))"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lock badge */}
      <g>
        <circle cx="100" cy="52" r="14" fill="rgb(var(--card))" stroke="url(#sd-locked)" strokeWidth="1.6" />
        <rect x="94" y="49" width="12" height="9" rx="1.5" fill="url(#sd-locked)" />
        <path
          d="M96 49v-2a4 4 0 0 1 8 0v2"
          fill="none"
          stroke="url(#sd-locked)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* Laptop base */}
      <rect x="28" y="84" width="144" height="6" rx="2" fill="rgb(var(--accent-base) / 0.25)" />
      <rect x="92" y="84" width="16" height="3" rx="1" fill="rgb(var(--accent-base) / 0.55)" />

      {/* "LOCAL" label */}
      <text
        x="100"
        y="102"
        textAnchor="middle"
        fontSize="7"
        fill="rgb(var(--pnl-pos))"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="600"
        letterSpacing="0.1em"
      >
        LOCAL · OFFLINE
      </text>
    </svg>
  );
}

/** Crossed-out antenna — no telemetry. */
function CrossedAntennaDiagram() {
  return (
    <svg
      viewBox="0 0 200 110"
      className="w-full h-auto"
      role="img"
      aria-label="Crossed-out antenna — no phone-home, no telemetry"
    >
      <defs>
        <linearGradient id="sd-waves" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(var(--pnl-neg))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(var(--pnl-neg))" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Antenna mast */}
      <line x1="100" y1="40" x2="100" y2="80" stroke="rgb(var(--txt-tertiary))" strokeWidth="1.6" />
      {/* Antenna base */}
      <path
        d="M86 80h28l-2 6h-24z"
        fill="rgb(var(--card) / 0.55)"
        stroke="rgb(var(--txt-tertiary))"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Antenna top ball */}
      <circle cx="100" cy="38" r="3" fill="rgb(var(--txt-tertiary))" />

      {/* Outgoing signal waves (fading — being silenced) */}
      <g fill="none" stroke="url(#sd-waves)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M88 30a14 14 0 0 1 24 0" opacity="0.4" />
        <path d="M82 24a22 22 0 0 1 36 0" opacity="0.25" />
        <path d="M76 18a30 30 0 0 1 48 0" opacity="0.12" />
      </g>

      {/* Big cross-out — animated draw-in */}
      <motion.path
        d="M70 12 L130 88"
        stroke="rgb(var(--pnl-neg))"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
      />

      {/* Label */}
      <text
        x="100"
        y="102"
        textAnchor="middle"
        fontSize="7"
        fill="rgb(var(--pnl-neg))"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="600"
        letterSpacing="0.1em"
      >
        NO SIGNAL · NO PHONE-HOME
      </text>
    </svg>
  );
}

/** Lock + key — encrypted at rest. */
function LockKeyDiagram() {
  return (
    <svg
      viewBox="0 0 200 110"
      className="w-full h-auto"
      role="img"
      aria-label="Lock with key — your database is on your encrypted drive"
    >
      <defs>
        <linearGradient id="sd-lock-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent-base))" />
          <stop offset="100%" stopColor="rgb(var(--accent-hover))" />
        </linearGradient>
        <linearGradient id="sd-key" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--pnl-pos))" />
          <stop offset="100%" stopColor="rgb(var(--accent-base))" />
        </linearGradient>
      </defs>

      {/* Database cylinder behind the lock */}
      <g opacity="0.55">
        <ellipse cx="60" cy="32" rx="22" ry="6" fill="none" stroke="rgb(var(--txt-tertiary))" strokeWidth="1.4" />
        <path
          d="M38 32v34c0 3.3 9.8 6 22 6s22-2.7 22-6V32"
          fill="rgb(var(--card) / 0.4)"
          stroke="rgb(var(--txt-tertiary))"
          strokeWidth="1.4"
        />
        <path
          d="M38 49c0 3.3 9.8 6 22 6s22-2.7 22-6"
          fill="none"
          stroke="rgb(var(--txt-tertiary))"
          strokeWidth="1.4"
        />
        <text
          x="60"
          y="36"
          textAnchor="middle"
          fontSize="6"
          fill="rgb(var(--accent-base))"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          .sqlite
        </text>
      </g>

      {/* Lock shackle */}
      <path
        d="M120 50v-6a12 12 0 0 1 24 0v6"
        fill="none"
        stroke="url(#sd-lock-body)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Lock body */}
      <rect
        x="114"
        y="50"
        width="36"
        height="30"
        rx="4"
        fill="url(#sd-lock-body)"
        stroke="rgb(var(--accent-hover))"
        strokeWidth="1"
      />
      {/* Keyhole */}
      <circle cx="132" cy="62" r="3" fill="rgb(var(--card))" />
      <rect x="130.5" y="63" width="3" height="8" rx="1" fill="rgb(var(--card))" />

      {/* Key — to the right of the lock */}
      <g>
        <circle
          cx="170"
          cy="38"
          r="6"
          fill="none"
          stroke="url(#sd-key)"
          strokeWidth="2.2"
        />
        <line
          x1="174"
          y1="42"
          x2="186"
          y2="54"
          stroke="url(#sd-key)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M183 51l3-3M180 48l3-3"
          stroke="url(#sd-key)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Label */}
      <text
        x="100"
        y="102"
        textAnchor="middle"
        fontSize="7"
        fill="rgb(var(--pnl-pos))"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="600"
        letterSpacing="0.1em"
      >
        ENCRYPTED · AT REST
      </text>
    </svg>
  );
}
