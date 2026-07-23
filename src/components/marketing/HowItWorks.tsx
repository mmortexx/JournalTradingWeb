"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/** 3-step "how it works" — capture, analyze, improve. */
export function HowItWorks() {
  const { lang } = useLang();
  const es = lang === "es";

  const steps = [
    {
      n: "01",
      title: es ? "Registra tu operación" : "Log your trade",
      desc: es
        ? "Entra el instrumento, dirección, entrada, stop y objetivo. Arrastra capturas del gráfico. Todo se guarda en tu equipo, al instante."
        : "Enter instrument, direction, entry, stop and target. Drop chart screenshots. Everything is saved on your machine, instantly.",
      icon: <CaptureIcon />,
      kbd: es ? "Ctrl + N" : "Ctrl + N",
    },
    {
      n: "02",
      title: es ? "Analiza tus métricas" : "Analyze your metrics",
      desc: es
        ? "Más de 40 métricas institucionales recalculadas en vivo: expectancy, profit factor, Sharpe, drawdown, win rate por setup."
        : "Over 40 institutional metrics recalculated live: expectancy, profit factor, Sharpe, drawdown, win rate by setup.",
      icon: <AnalyzeIcon />,
      kbd: es ? "Tab + A" : "Tab + A",
    },
    {
      n: "03",
      title: es ? "Mejora tu disciplina" : "Improve your discipline",
      desc: es
        ? "El ritual pre/post mercado y el coste de indisciplina te muestran lo que tu comportamiento te cuesta — en dinero real."
        : "The pre/post-market ritual and the cost-of-indiscipline metric show what your behavior costs you — in real money.",
      icon: <ImproveIcon />,
      kbd: es ? "Tab + J" : "Tab + J",
    },
  ];

  return (
    <section className="section bg-veil relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl relative">
          <Eyebrow>{es ? "Cómo funciona" : "How it works"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Tres pasos. <span className="text-gradient">Cero fricción.</span>
              </>
            ) : (
              <>
                Three steps. <span className="text-gradient">Zero friction.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Diseñado para el trader que opera todos los días: rápido de entrada, brutal de análisis, honesto de diagnóstico."
              : "Designed for the trader who trades every day: fast to enter, brutal on analysis, honest on diagnosis."}
          </p>
        </Reveal>

        {/* Steps */}
        <div className="mt-16 relative">
          <ol className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center text-center md:items-start md:text-left md:pl-6"
              >
                {/* Numbered circle + illustration */}
                <div className="relative mb-6">
                <motion.div
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                  className="relative w-[144px] h-[144px] rounded-card liquid-glass depth-1 flex items-center justify-center transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                    <div className="absolute inset-0 rounded-card aurora-bg opacity-60" />
                    {/* Step illustration */}
                    <div className="relative">
                      {s.icon}
                    </div>
                </motion.div>

                  {/* Numbered badge — subtle entrance */}
                  <motion.span
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.12 + 0.35,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-white text-black text-xs font-bold tnum flex items-center justify-center shadow-[0_4px_14px_-2px_rgb(var(--accent-base)/0.7)] z-10"
                  >
                    {s.n}
                  </motion.span>
                </div>

                {/* Title + kbd */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="t-h3 text-primary">{s.title}</h3>
                  <kbd className="hidden md:inline-flex items-center px-1.5 h-5 rounded text-[10px] font-mono text-tertiary bg-white/5 border border-white/10">
                    {s.kbd}
                  </kbd>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary leading-relaxed max-w-xs md:max-w-none">
                  {s.desc}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ----- Step illustrations (inline SVG) ----- */

function CaptureIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="8" y="14" width="48" height="34" rx="3" stroke="rgb(var(--accent-base))" strokeWidth="1.6" />
      <path d="M8 22h48" stroke="rgb(var(--accent-base))" strokeWidth="1.6" />
      <circle cx="12.5" cy="18" r="1" fill="rgb(var(--accent-base))" />
      <circle cx="16.5" cy="18" r="1" fill="rgb(var(--accent-base))" opacity="0.6" />
      <circle cx="20.5" cy="18" r="1" fill="rgb(var(--accent-base))" opacity="0.4" />
      {/* Candlesticks */}
      <g stroke="rgb(var(--pnl-pos))" strokeWidth="1.4" strokeLinecap="round">
        <path d="M22 36v-6M22 42v4" />
      </g>
      <rect x="20" y="30" width="4" height="12" fill="rgb(var(--pnl-pos))" opacity="0.25" stroke="rgb(var(--pnl-pos))" strokeWidth="1.2" />
      <g stroke="rgb(var(--pnl-neg))" strokeWidth="1.4" strokeLinecap="round">
        <path d="M32 34v-4M32 44v2" />
      </g>
      <rect x="30" y="30" width="4" height="14" fill="rgb(var(--pnl-neg))" opacity="0.25" stroke="rgb(var(--pnl-neg))" strokeWidth="1.2" />
      <g stroke="rgb(var(--pnl-pos))" strokeWidth="1.4" strokeLinecap="round">
        <path d="M42 38v-4M42 44v2" />
      </g>
      <rect x="40" y="34" width="4" height="12" fill="rgb(var(--pnl-pos))" opacity="0.25" stroke="rgb(var(--pnl-pos))" strokeWidth="1.2" />
      {/* Plus badge */}
      <circle cx="50" cy="44" r="6" fill="rgb(var(--accent-base))" />
      <path d="M50 41v6M47 44h6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AnalyzeIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Bars */}
      <g>
        <rect x="10" y="34" width="8" height="20" rx="1.5" fill="rgb(var(--accent-base))" opacity="0.35" />
        <rect x="22" y="24" width="8" height="30" rx="1.5" fill="rgb(var(--accent-base))" opacity="0.55" />
        <rect x="34" y="18" width="8" height="36" rx="1.5" fill="rgb(var(--accent-base))" opacity="0.75" />
        <rect x="46" y="28" width="8" height="26" rx="1.5" fill="rgb(var(--accent-base))" />
      </g>
      {/* Trend line */}
      <path d="M14 36 L26 26 L38 20 L50 30" stroke="rgb(var(--pnl-pos))" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot */}
      <circle cx="38" cy="20" r="2.5" fill="rgb(var(--pnl-pos))" />
      <circle cx="38" cy="20" r="5" fill="none" stroke="rgb(var(--pnl-pos))" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function ImproveIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Compass ring */}
      <circle cx="32" cy="32" r="22" stroke="rgb(var(--accent-base))" strokeWidth="1.4" opacity="0.4" />
      <circle cx="32" cy="32" r="16" stroke="rgb(var(--accent-base))" strokeWidth="1.2" opacity="0.6" />
      {/* Tick marks */}
      <g stroke="rgb(var(--accent-base))" strokeWidth="1.4" strokeLinecap="round">
        <path d="M32 10v4M32 50v4M10 32h4M50 32h4" />
      </g>
      {/* Needle */}
      <path d="M32 32 L46 22" stroke="rgb(var(--pnl-pos))" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 32 L24 44" stroke="rgb(var(--pnl-neg))" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3" fill="rgb(var(--accent-base))" />
      {/* Up arrow badge */}
      <circle cx="48" cy="48" r="7" fill="rgb(var(--pnl-pos))" opacity="0.15" stroke="rgb(var(--pnl-pos))" strokeWidth="1.2" />
      <path d="M44 50 L48 46 L52 50" stroke="rgb(var(--pnl-pos))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
