"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * Local-first philosophy section.
 * LEFT: editorial copy on why local matters.
 * RIGHT: SVG diagram showing "Tu PC" with data staying local + cloud comparison.
 */
export function LocalFirst() {
  const { t, lang } = useLang();
  const es = lang === "es";

  const pillars: { title: string; body: string; icon: React.ReactNode }[] = es
    ? [
        {
          title: "Privacidad real",
          body: "Tus operaciones, notas y capturas nunca salen de tu equipo. Sin servidor, sin telemetría, sin cuentas obligatorias.",
          icon: <LockIcon />,
        },
        {
          title: "Velocidad nativa",
          body: "Nada de esperar a una API. Cada métrica se calcula al instante. La app responde como un editor de texto.",
          icon: <BoltIcon />,
        },
        {
          title: "Sin caídas del servicio",
          body: "Si tu broker se cae, si tu internet falla, si la empresa cierra: tu diario sigue funcionando y tu historial sigue siendo tuyo.",
          icon: <ServerOffIcon />,
        },
        {
          title: "Tus datos, tu propiedad",
          body: "Un único archivo .sqlite en la carpeta que tú elijas. Cópielo, respáldalo, míralo. Tú mandas.",
          icon: <DatabaseIcon />,
        },
      ]
    : [
        {
          title: "Real privacy",
          body: "Your trades, notes and screenshots never leave your machine. No server, no telemetry, no mandatory account.",
          icon: <LockIcon />,
        },
        {
          title: "Native speed",
          body: "No waiting on an API. Every metric is computed instantly. The app responds like a text editor.",
          icon: <BoltIcon />,
        },
        {
          title: "No service downtime",
          body: "If your broker goes down, if your internet fails, if the company closes: your journal keeps running and your history stays yours.",
          icon: <ServerOffIcon />,
        },
        {
          title: "Your data, your property",
          body: "A single .sqlite file in the folder you choose. Copy it, back it up, inspect it. You're in charge.",
          icon: <DatabaseIcon />,
        },
      ];

  return (
    <section className="section bg-black relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      {/* subtle background glow */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 w-[420px] h-[420px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
          opacity: 0.12,
        }}
      />
      <div className="relative max-w-page mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* LEFT — copy */}
        <div className="relative">
          <div className="relative">
            <Reveal>
              <Eyebrow>{t("localFirst")}</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                className="mt-5 t-h2 text-primary"
              >
                {es ? (
                  <>
                    Tus datos no deberían
                    <br />
                    vivir en el ordenador de <span className="text-gradient">otro</span>.
                  </>
                ) : (
                  <>
                    Your data shouldn't live
                    <br />
                    on <span className="text-gradient">someone else's</span> computer.
                  </>
                )}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 text-lg text-secondary leading-relaxed max-w-xl">
                {es
                  ? "La mayoría de journals son SaaS: tus operaciones se suben a su nube, pagas cada mes para seguir accediendo, y si cierran, pierdes años de historial. Trading Journal va en contra de eso."
                  : "Most journals are SaaS: your trades get uploaded to their cloud, you pay every month to keep access, and if they shut down you lose years of history. Trading Journal goes against that."}
              </p>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {pillars.map((p, i) => (
                <Reveal key={p.title} delay={0.18 + i * 0.06} className="h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                    className="flex gap-3 h-full rounded-lg p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <span
                      className="shrink-0 w-9 h-9 rounded-md liquid-glass flex items-center justify-center text-primary"
                      aria-hidden="true"
                    >
                      {p.icon}
                    </span>
                    <div>
                      <h3 className="t-h4 text-primary">{p.title}</h3>
                      <p className="mt-1 text-sm text-secondary leading-relaxed">{p.body}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>

            {/* Inline cloud comparison */}
            <Reveal delay={0.46}>
              <div className="mt-8 liquid-glass rounded-card p-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="pill bg-white/5 text-tertiary border border-white/10">
                  {es ? "vs. la nube" : "vs. cloud"}
                </span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-secondary">
                  <Compare
                    label={es ? "SaaS" : "SaaS"}
                    value={es ? "Mensual · nube" : "Monthly · cloud"}
                    tone="neg"
                  />
                  <Compare
                    label={es ? "Trading Journal" : "Trading Journal"}
                    value={es ? "Único · local" : "One-time · local"}
                    tone="pos"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* RIGHT — diagram */}
        <Reveal delay={0.2} y={36}>
          <LocalFirstDiagram es={es} />
        </Reveal>
      </div>
    </section>
  );
}

function Compare({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pos" | "neg";
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${tone === "pos" ? "bg-pnl-pos" : "bg-pnl-neg"}`}
      />
      <span className="text-tertiary">{label}</span>
      <span className="text-primary font-medium">{value}</span>
    </span>
  );
}

/** SVG diagram: laptop with lock + data flowing locally, NO cloud arrows going out. */
function LocalFirstDiagram({ es }: { es: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
    >
      <div
        className="relative liquid-glass depth-2 rounded-card p-6 md:p-8 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pnl-pos" />
          <span className="text-xs uppercase tracking-[0.15em] text-tertiary font-semibold">
            {es ? "Tu PC" : "Your PC"}
          </span>
        </div>
        <span className="pill bg-white/5 text-tertiary border border-white/10">
          {es ? "offline-first" : "offline-first"}
        </span>
      </div>

      <svg
        viewBox="0 0 360 240"
        className="w-full h-auto"
        role="img"
        aria-label={
          es
            ? "Diagrama: tus datos viven en tu PC, cifrados y sin conexión a la nube."
            : "Diagram: your data lives on your PC, encrypted, with no cloud connection."
        }
      >
        <defs>
          <linearGradient id="lf-screen" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent-base) / 0.18)" />
            <stop offset="100%" stopColor="rgb(var(--accent-base) / 0.04)" />
          </linearGradient>
          <linearGradient id="lf-locked" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--pnl-pos))" />
            <stop offset="100%" stopColor="rgb(var(--accent-base))" />
          </linearGradient>
        </defs>

        {/* Laptop body */}
        <rect
          x="60"
          y="40"
          width="240"
          height="140"
          rx="8"
          fill="rgb(var(--card) / 0.55)"
          stroke="rgb(var(--accent-base) / 0.35)"
          strokeWidth="1.2"
        />
        {/* Screen content */}
        <rect
          x="72"
          y="52"
          width="216"
          height="116"
          rx="4"
          fill="url(#lf-screen)"
          stroke="rgb(var(--accent-base) / 0.25)"
          strokeWidth="1"
        />
        {/* fake journal UI rows */}
        <g opacity="0.55">
          <rect x="84" y="64" width="80" height="6" rx="2" fill="rgb(var(--accent-base))" />
          <rect x="84" y="78" width="120" height="4" rx="2" fill="rgb(var(--txt-tertiary))" />
          <rect x="84" y="88" width="100" height="4" rx="2" fill="rgb(var(--txt-tertiary))" />
          {/* mini bars */}
          <g>
            <rect x="84" y="110" width="10" height="22" rx="1.5" fill="rgb(var(--pnl-pos) / 0.6)" />
            <rect x="98" y="118" width="10" height="14" rx="1.5" fill="rgb(var(--pnl-neg) / 0.6)" />
            <rect x="112" y="106" width="10" height="26" rx="1.5" fill="rgb(var(--pnl-pos) / 0.6)" />
            <rect x="126" y="120" width="10" height="12" rx="1.5" fill="rgb(var(--pnl-neg) / 0.6)" />
            <rect x="140" y="112" width="10" height="20" rx="1.5" fill="rgb(var(--pnl-pos) / 0.6)" />
            <rect x="154" y="100" width="10" height="32" rx="1.5" fill="rgb(var(--pnl-pos) / 0.6)" />
          </g>
          {/* equity line */}
          <path
            d="M180 132 L196 124 L210 128 L226 112 L242 118 L258 100 L274 96"
            fill="none"
            stroke="rgb(var(--accent-base))"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Lock badge over the laptop */}
        <g>
          <circle
            cx="180"
            cy="115"
            r="22"
            fill="rgb(var(--card))"
            stroke="url(#lf-locked)"
            strokeWidth="1.6"
          />
          <rect
            x="172"
            y="110"
            width="16"
            height="12"
            rx="2"
            fill="url(#lf-locked)"
          />
          <path
            d="M175 110v-2.5a5 5 0 0 1 10 0v2.5"
            fill="none"
            stroke="url(#lf-locked)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>

        {/* Laptop base */}
        <rect
          x="44"
          y="180"
          width="272"
          height="10"
          rx="3"
          fill="rgb(var(--accent-base) / 0.25)"
        />
        <rect x="160" y="180" width="40" height="4" rx="2" fill="rgb(var(--accent-base) / 0.55)" />

        {/* Data stays inside — circular flow arrows */}
        <g
          stroke="rgb(var(--pnl-pos))"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        >
          <path d="M180 210 a 70 18 0 1 0 0.1 0" />
          <path d="m250 210 5 -3 0 6" />
        </g>
        <text
          x="180"
          y="232"
          textAnchor="middle"
          fontSize="9"
          fill="rgb(var(--pnl-pos))"
          fontFamily="var(--font-geist-sans)"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          {es ? "DATOS LOCALES · NUNCA SALEN" : "LOCAL DATA · NEVER LEAVES"}
        </text>

        {/* Crossed-out cloud on the right — cloud shape static, cross-out draws in on view */}
        <g opacity="0.5">
          <path
            d="M300 60 a 12 12 0 0 0 -23 -4 a 9 9 0 0 0 -1 18 h 22 a 8 8 0 0 0 2 -14Z"
            fill="none"
            stroke="rgb(var(--pnl-neg))"
            strokeWidth="1.4"
          />
          <motion.path
            d="M272 44 l28 28"
            stroke="rgb(var(--pnl-neg))"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />
        </g>
      </svg>

      {/* caption */}
      <div className="mt-5 flex items-center gap-3 text-xs text-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pnl-pos" />
          {es ? "Cifrado en disco" : "Encrypted on disk"}
        </span>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {es ? "Funciona sin internet" : "Works offline"}
        </span>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pnl-neg/80" />
          {es ? "Cero telemetría" : "Zero telemetry"}
        </span>
      </div>
      </div>
    </motion.div>
  );
}

/* ---- Pillar icons ---- */
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 1.5 3 9h4l-1 5.5 6-7.5H8l1-5.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function ServerOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.2" y="3" width="11.6" height="4.4" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2.2" y="9" width="11.6" height="4.4" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="5.2" r="0.7" fill="currentColor" />
      <circle cx="5" cy="11.2" r="0.7" fill="currentColor" />
      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function DatabaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="3.6" rx="5.2" ry="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.8 3.6v8.8c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2V3.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M2.8 8c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
