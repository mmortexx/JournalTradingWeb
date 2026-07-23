"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { CountUp } from "@/components/tj/CountUp";
import { Money } from "@/components/tj/Money";
import { METRICS, TRADES, rankByExpectancy, weekdayBreakdown } from "@/lib/trading/data";

/** Spotify Wrapped-style annual stats recap. Playful but professional. */
export function Wrapped() {
  const { lang } = useLang();
  const es = lang === "es";

  // Pull "annual" highlights from the deterministic sample.
  const topSetup = rankByExpectancy(TRADES, (t) => t.setup)[0];
  const topInstrument = rankByExpectancy(TRADES, (t) => t.instrument)[0];
  const byDay = weekdayBreakdown(TRADES);
  const bestDay = [...byDay].sort((a, b) => b.pnl - a.pnl)[0];

  const dayLabel: Record<string, { es: string; en: string }> = {
    Lun: { es: "Lunes", en: "Monday" },
    Mar: { es: "Martes", en: "Tuesday" },
    Mié: { es: "Miércoles", en: "Wednesday" },
    Jue: { es: "Jueves", en: "Thursday" },
    Vie: { es: "Viernes", en: "Friday" },
    Sáb: { es: "Sábados", en: "Saturdays" },
    Dom: { es: "Domingos", en: "Sundays" },
  };
  const bestDayName = dayLabel[bestDay.day]?.[lang] ?? bestDay.day;

  const totalOperado = TRADES.reduce((s, t) => s + Math.abs(t.grossPnl), 0);

  const cards = [
    {
      key: "streak",
      tone: "accent" as const,
      label: es ? "Tu mejor racha" : "Your best streak",
      value: (
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
          <CountUp to={METRICS.maxWinStreak} className="t-display text-[clamp(1.75rem,9cqi,2.75rem)] tnum text-primary whitespace-nowrap" />
          <span className="text-base text-tertiary font-medium">{es ? "ganadoras seguidas" : "winners in a row"}</span>
        </span>
      ),
      sub: es
        ? "Confianza que no se confunde con suerte."
        : "Confidence that doesn't get confused with luck.",
    },
    {
      key: "setup",
      tone: "pos" as const,
      label: es ? "Tu setup más rentable" : "Your most profitable setup",
      value: (
        <span className="flex flex-col gap-1 min-w-0">
          <span className="t-display text-[clamp(1.5rem,7cqi,2.25rem)] text-pnl-pos break-words leading-tight">{topSetup.name}</span>
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 tnum min-w-0">
            <Money value={topSetup.totalPnl} sign colorizeSign className="text-xl md:text-2xl font-medium whitespace-nowrap" />
            <span className="text-sm text-tertiary whitespace-nowrap">
              {es ? `${topSetup.count} ops · ${(topSetup.winRate * 100).toFixed(0)}% win` : `${topSetup.count} trades · ${(topSetup.winRate * 100).toFixed(0)}% win`}
            </span>
          </span>
        </span>
      ),
      sub: es
        ? "El filón del año. Crécelo — o destrózalo con más datos."
        : "The goldmine of the year. Scale it — or break it with more data.",
    },
    {
      key: "day",
      tone: "accent" as const,
      label: es ? "Tu día más productivo" : "Your most productive day",
      value: (
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
          <span className="t-display text-[clamp(1.5rem,7cqi,2.25rem)] text-primary whitespace-nowrap leading-tight">{bestDayName}</span>
          <Money value={bestDay.pnl} sign colorizeSign className="text-xl md:text-2xl font-medium whitespace-nowrap" />
        </span>
      ),
      sub: es
        ? "Donde el mercado más te ha dado. ¿Repetible, o azar?"
        : "Where the market gave you most. Repeatable, or luck?",
    },
    {
      key: "total",
      tone: "accent" as const,
      label: es ? "Total operado" : "Total traded",
      value: (
        <span className="flex flex-col items-start gap-1 min-w-0">
          <Money value={totalOperado} compact colorizeSign={false} className="t-display text-[clamp(1.75rem,9cqi,2.75rem)] tnum text-primary whitespace-nowrap" />
          <span className="text-base text-tertiary">{es ? "de volumen bruto" : "gross volume"}</span>
        </span>
      ),
      sub: es
        ? "No es el P&L — es cuánto capital pusiste en juego."
        : "Not the P&L — how much capital you put at risk.",
    },
    {
      key: "discipline",
      tone: "warn" as const,
      label: es ? "Coste de indisciplina" : "Cost of indiscipline",
      value: (
        <span className="flex items-baseline gap-2 min-w-0">
          <Money value={METRICS.costOfIndiscipline} colorizeSign className="t-display text-[clamp(1.75rem,9cqi,2.75rem)] tnum text-pnl-warn whitespace-nowrap" />
        </span>
      ),
      sub: es
        ? "Lo que dejaste en la mesa por no seguir tu propio plan."
        : "What you left on the table by not following your own plan.",
    },
    {
      key: "instrument",
      tone: "pos" as const,
      label: es ? "Instrumento top" : "Top instrument",
      value: (
        <span className="flex flex-col gap-1 min-w-0">
          <span className="t-display text-[clamp(1.5rem,7cqi,2.25rem)] text-primary break-words leading-tight">{topInstrument.name}</span>
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1 tnum min-w-0">
            <Money value={topInstrument.totalPnl} sign colorizeSign className="text-xl md:text-2xl font-medium whitespace-nowrap" />
            <span className="text-sm text-tertiary whitespace-nowrap">
              {es ? `${topInstrument.count} ops` : `${topInstrument.count} trades`}
            </span>
          </span>
        </span>
      ),
      sub: es
        ? "El activo que mejor te leyó este año."
        : "The asset that read you best this year.",
    },
  ];

  return (
    <section className="section cv-auto relative overflow-hidden">
      {/* Aurora wash background */}
      <div className="absolute inset-0 aurora-bg opacity-50 pointer-events-none" />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative max-w-page mx-auto px-5 md:px-8">
        {/* Section header */}
        <div className="relative">
          <Reveal className="relative max-w-3xl">
            <Eyebrow>{es ? "Tu año, resumido" : "Your year, wrapped"}</Eyebrow>
            <h2 className="mt-5 t-h2 text-primary">
              {es ? (
                <>
                  Tu <span className="text-gradient">Wrapped</span> de trading.
                </>
              ) : (
                <>
                  Your trading <span className="text-gradient">Wrapped.</span>
                </>
              )}
            </h2>
            <p className="mt-4 text-lg text-secondary leading-relaxed">
              {es
                ? "El diario no solo cuenta operaciones: cuenta hábitos. Estos son los tuyos, en grande."
                : "The journal doesn't just count trades: it counts habits. Here are yours, in big numbers."}
            </p>
          </Reveal>
        </div>

        {/* Cards grid — bento layout: hero streak (col-span-3 row-span-2) on the
            left, two col-span-3 cards stacked on the right, then a clean row of
            three col-span-2 cards. Total cells = 6+3+3+2+2+2 = 18 = 3×6 → no gaps. */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(180px,auto)]">
          {cards.map((c, i) => {
            const span =
              i === 0
                ? "md:col-span-3 md:row-span-2"
                : i === 1
                ? "md:col-span-3"
                : i === 2
                ? "md:col-span-3"
                : "md:col-span-2";
            const glowColor =
              c.tone === "pos"
                ? "rgb(var(--pnl-pos))"
                : c.tone === "warn"
                ? "rgb(var(--pnl-warn))"
                : "rgb(var(--accent-base))";
            return (
              <motion.article
                key={c.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                className={`group relative liquid-glass depth-2 rounded-card overflow-hidden transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${span}`}
              >
                {/* Accent border glow on hover. */}
                <div
                  className="absolute inset-0 rounded-card pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px rgb(var(--accent-base) / 0.35), 0 0 28px rgb(var(--accent-base) / 0.15)`,
                  }}
                />

                {/* Decorative corner glow */}
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none transition-opacity group-hover:opacity-50"
                  style={{
                    background:
                      c.tone === "pos"
                        ? "radial-gradient(circle, rgb(var(--pnl-pos)), transparent 70%)"
                        : c.tone === "warn"
                        ? "radial-gradient(circle, rgb(var(--pnl-warn)), transparent 70%)"
                        : "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
                  }}
                />

                <div className="relative p-6 md:p-7 flex flex-col h-full justify-between gap-4 cq-wrap min-w-0">
                  <span className="eyebrow inline-flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: glowColor,
                      }}
                    />
                    {c.label}
                  </span>

                  <div className="flex-1 flex items-center">{c.value}</div>

                  <p className="text-[13px] text-tertiary leading-relaxed">{c.sub}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-8">
          <p className="text-xs text-tertiary text-center">
            {es
              ? "Datos de muestra deterministas — en tu journal saldrían los tuyos."
              : "Deterministic sample data — your journal would show your own."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
