"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";

/**
 * DisciplineScore — test rápido de disciplina de trading.
 *
 * 6 preguntas de auto-evaluación (¿diarias cada operación? ¿fijas stop
 * antes de entrar? ¿revisas semanalmente?…). Cada respuesta 0-3 puntos.
 * Resultado: puntuación 0-100 + nivel (Novato / En desarrollo / sólido
 * / Élite) + un consejo personalizado según el punto más débil.
 *
 * ── Por qué aquí ──────────────────────────────────────────────────────
 * /features/disciplina habla de disciplina que ACTÚA (Guardián, costo
 * de la indisciplina, simulador de varianza). El test cierra el círculo:
 * el trader se mide a sí mismo y sale con una sola cifra concreta y un
 * siguiente paso. Es la interacción más pegadiza de la página.
 *
 * ── Escala ────────────────────────────────────────────────────────────
 * 0-39  Novato     — la indisciplina te cuesta caro; empieza por lo básico.
 * 40-64 En desarrollo — tienes base, falta consistencia.
 * 65-84 Sólido     — operativa medida; afina los bordes.
 * 85-100 Élite     — disciplina institucional; el edge se materializa.
 *
 * ── Material ──────────────────────────────────────────────────────────
 * .tj-paper + .tj-paper-glow. Touch targets ≥44px. Sin overflow mobile.
 */
type Q = { qEs: string; qEn: string; options: { es: string; en: string; pts: number }[] };

const QUESTIONS: Q[] = [
  {
    qEs: "¿Registras cada operación en un diario antes o justo después de cerrarla?",
    qEn: "Do you log every trade in a journal before or right after closing it?",
    options: [
      { es: "No, opero y ya", en: "No, I just trade", pts: 0 },
      { es: "A veces, cuando me acuerdo", en: "Sometimes, when I remember", pts: 1 },
      { es: "Sí, la mayoría", en: "Yes, most of them", pts: 2 },
      { es: "Siempre, sin excepción", en: "Always, no exceptions", pts: 3 },
    ],
  },
  {
    qEs: "¿Defines el stop-loss ANTES de entrar?",
    qEn: "Do you set your stop-loss BEFORE entering?",
    options: [
      { es: "Lo decido sobre la marcha", en: "I decide on the fly", pts: 0 },
      { es: "A veces lo pongo después", en: "Sometimes after entry", pts: 1 },
      { es: "Sí, siempre antes", en: "Yes, always before", pts: 2 },
      { es: "Antes, y no lo muevo nunca en mi contra", en: "Before, and I never move it against me", pts: 3 },
    ],
  },
  {
    qEs: "¿Repasas tu operativa cada semana con métricas?",
    qEn: "Do you review your trades weekly with metrics?",
    options: [
      { es: "No reviso nada", en: "I don't review", pts: 0 },
      { es: "Miro el P&L y poco más", en: "Just glance at P&L", pts: 1 },
      { es: "Sí, miro win rate y R:R", en: "Yes, win rate and R:R", pts: 2 },
      { es: "Sí, expectancy, drawdown y por setup", en: "Yes, expectancy, drawdown, per-setup", pts: 3 },
    ],
  },
  {
    qEs: "¿Operas fuera de tu plan cuando llevas una racha mala?",
    qEn: "Do you trade outside your plan after a losing streak?",
    options: [
      { es: "Sí, intento recuperar", en: "Yes, I try to recover", pts: 0 },
      { es: "A veces, si veo oportunidad", en: "Sometimes, if I see a chance", pts: 1 },
      { es: "Rara vez", en: "Rarely", pts: 2 },
      { es: "Nunca, bajo riesgo en su lugar", en: "Never, I cut risk instead", pts: 3 },
    ],
  },
  {
    qEs: "¿Tienes un playbook escrito de tus setups?",
    qEn: "Do you have a written playbook of your setups?",
    options: [
      { es: "No, lo llevo en la cabeza", en: "No, it's in my head", pts: 0 },
      { es: "Algunos apuntes sueltos", en: "A few loose notes", pts: 1 },
      { es: "Sí, documentado", en: "Yes, documented", pts: 2 },
      { es: "Sí, y mido su expectancy real", en: "Yes, and I track their real expectancy", pts: 3 },
    ],
  },
  {
    qEs: "¿Cuándo fue la última vez que saltaste una operación por no cumplir tus reglas?",
    qEn: "When did you last skip a trade because it broke your rules?",
    options: [
      { es: "Nunca, entro a todo lo que se mueve", en: "Never, I trade everything", pts: 0 },
      { es: "Rara vez me contengo", en: "I rarely hold back", pts: 1 },
      { es: "Esta semana", en: "This week", pts: 2 },
      { es: "Hoy / ayer", en: "Today / yesterday", pts: 3 },
    ],
  },
];

const MAX_PTS = QUESTIONS.length * 3; // 18

export function DisciplineScore({ num = "04" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));

  const totalPts = useMemo(
    () => answers.reduce((s, a, i) => s + (a !== null ? QUESTIONS[i].options[a].pts : 0), 0),
    [answers],
  );
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const score = Math.round((totalPts / MAX_PTS) * 100);

  const level = useMemo(() => {
    if (!allAnswered) return null;
    if (score < 40)
      return {
        label: es ? "Novato" : "Novice",
        color: "rgb(var(--pnl-neg))",
        tip: es
          ? "La indisciplina te cuesta caro. Empieza por lo básico: registrar cada operación y fijar el stop antes de entrar. El diario es el primer paso."
          : "Indiscipline is costing you. Start with the basics: log every trade and set your stop before entry. The journal is step one.",
      };
    if (score < 65)
      return {
        label: es ? "En desarrollo" : "Developing",
        color: "rgb(var(--sig-amber))",
        tip: es
          ? "Tienes base, te falta consistencia. Convierte el repaso semanal en un hábito fijo y mide la expectancy por setup — ahí está tu siguiente edge."
          : "You have a base, you lack consistency. Make weekly review a fixed habit and measure expectancy per setup — that's your next edge.",
      };
    if (score < 85)
      return {
        label: es ? "Sólido" : "Solid",
        color: "rgb(var(--accent-base))",
        tip: es
          ? "Operativa medida. Afina los bordes: un playbook escrito por setup y saltar las operaciones que no cumplen tus reglas te llevan al siguiente nivel."
          : "Measured trading. Sharpen the edges: a written per-setup playbook and skipping trades that break your rules take you to the next level.",
      };
    return {
      label: es ? "Élite" : "Elite",
      color: "rgb(var(--pnl-pos))",
      tip: es
        ? "Disciplina institucional. Tu edge se materializa porque sobrevives a la varianza. El siguiente paso es estratificar por sesión y día de la semana."
        : "Institutional discipline. Your edge materializes because you survive variance. Next step: stratify by session and weekday.",
    };
  }, [allAnswered, score, es]);

  // Weakest dimension (lowest-scoring question) for personalized tip
  const weakestIdx = useMemo(() => {
    if (!allAnswered) return -1;
    let min = 4;
    let idx = -1;
    answers.forEach((a, i) => {
      const pts = a !== null ? QUESTIONS[i].options[a].pts : 0;
      if (pts < min) {
        min = pts;
        idx = i;
      }
    });
    return idx;
  }, [answers, allAnswered]);

  const reset = () => setAnswers(QUESTIONS.map(() => null));

  const fmtNum = (n: number) =>
    es ? new Intl.NumberFormat("es-ES").format(n) : new Intl.NumberFormat("en-US").format(n);

  return (
    <section className="section-tight bg-veil border-t border-[rgb(var(--divider)/0.06)]">
      <div className="tj-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: intro */}
        <div>
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="tnum" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}>
              § {num}
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span className="tnum" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}>
              {es ? "TEST" : "QUIZ"}
            </span>
          </div>
          <h2
            className="font-serif m-0"
            style={{
              fontSize: "clamp(1.95rem, 3.5vw, 3rem)",
              fontWeight: 400,
              letterSpacing: "-0.022em",
              lineHeight: 1.08,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            {es ? (
              <>
                Mídete. <span style={{ color: "rgb(var(--accent-base))" }}>Una cifra.</span>
              </>
            ) : (
              <>
                Measure yourself. <span style={{ color: "rgb(var(--accent-base))" }}>One number.</span>
              </>
            )}
          </h2>
          <p
            className="mt-5 mb-6"
            style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", lineHeight: 1.62, color: "var(--ink-2)", maxWidth: "34em" }}
          >
            {es
              ? "6 preguntas, 30 segundos. Tu puntuación de disciplina y un consejo personalizado según tu punto más débil. Sin email, sin trampa."
              : "6 questions, 30 seconds. Your discipline score and a personalized tip based on your weakest point. No email, no gimmicks."}
          </p>

          {/* Progress */}
          <div className="mb-2 flex items-center justify-between">
            <span className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              {es ? "Progreso" : "Progress"}
            </span>
            <span className="tnum" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
              {answeredCount} / {QUESTIONS.length}
            </span>
          </div>
          <div className="relative h-1.5 rounded-[3px] overflow-hidden mb-6" style={{ background: "rgb(var(--divider) / 0.13)" }}>
            <div
              className="absolute left-0 top-0 h-full rounded-[3px]"
              style={{
                width: `${(answeredCount / QUESTIONS.length) * 100}%`,
                background: "linear-gradient(90deg, color-mix(in oklab, rgb(var(--accent-base)) 45%, transparent), rgb(var(--accent-base)))",
                transition: "width 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {QUESTIONS.map((q, qi) => {
              const sel = answers[qi];
              return (
                <div key={qi}>
                  <div className="mb-2 text-[14px] font-medium" style={{ color: "var(--ink)", lineHeight: 1.45 }}>
                    <span className="tnum" style={{ color: "rgb(var(--accent-base))", fontWeight: 700, marginRight: 8 }}>
                      {String(qi + 1).padStart(2, "0")}
                    </span>
                    {es ? q.qEs : q.qEn}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const active = sel === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                          className="text-left min-h-[44px] px-3.5 py-2.5 rounded-[6px] text-[13px] leading-[1.35] transition-[background,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
                          style={{
                            background: active
                              ? "color-mix(in oklab, rgb(var(--accent-base)) 12%, transparent)"
                              : "color-mix(in oklab, var(--surface-2) 40%, transparent)",
                            border: active
                              ? "1px solid color-mix(in oklab, rgb(var(--accent-base)) 45%, transparent)"
                              : "1px solid rgb(var(--divider) / 0.10)",
                            color: active ? "rgb(var(--accent-base))" : "var(--ink-2)",
                            fontWeight: active ? 600 : 400,
                          }}
                          aria-pressed={active}
                        >
                          {es ? opt.es : opt.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[6px] text-[12px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
              style={{
                background: "transparent",
                color: "var(--ink-2)",
                border: "1px solid rgb(var(--divider) / 0.13)",
              }}
              aria-label={es ? "Reiniciar test" : "Reset quiz"}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2.5 8a5.5 5.5 0 019.4-3.9M13.5 8a5.5 5.5 0 01-9.4 3.9M13 2.5v3h-3M3 13.5v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {es ? "Reiniciar" : "Reset"}
            </button>
          )}
        </div>

        {/* Right: score card */}
        <div
          className="tj-paper tj-paper-glow relative lg:sticky lg:top-24"
          style={{ padding: 28, borderRadius: 8, border: "1px solid rgb(var(--divider) / 0.13)" }}
        >
          {!allAnswered ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 320 }}>
              {/* Circular progress ring */}
              <svg width="140" height="140" viewBox="0 0 140 140" aria-label={es ? `Puntuación parcial ${score}` : `Partial score ${score}`} role="img">
                <circle cx="70" cy="70" r="62" fill="none" stroke="rgb(var(--divider) / 0.13)" strokeWidth="8" />
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="rgb(var(--accent-base))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - score / 100)}`}
                  transform="rotate(-90 70 70)"
                  style={{ transition: "stroke-dashoffset 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
                />
                <text x="70" y="70" textAnchor="middle" dominantBaseline="central" className="tnum" style={{ fontSize: 34, fontWeight: 700, fill: "var(--ink)" }}>
                  {fmtNum(score)}
                </text>
              </svg>
              <p className="mt-5 text-[13px]" style={{ color: "var(--ink-3)" }}>
                {es
                  ? `Responde ${QUESTIONS.length - answeredCount} más para ver tu nivel y consejo.`
                  : `Answer ${QUESTIONS.length - answeredCount} more to see your level and tip.`}
              </p>
            </div>
          ) : (
            <div>
              {/* Final score ring */}
              <div className="flex flex-col items-center text-center mb-6">
                <svg width="160" height="160" viewBox="0 0 160 160" aria-label={es ? `Puntuación de disciplina ${score} de 100` : `Discipline score ${score} of 100`} role="img">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgb(var(--divider) / 0.13)" strokeWidth="10" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={level!.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                    transform="rotate(-90 80 80)"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.4s ease" }}
                  />
                  <text x="80" y="74" textAnchor="middle" dominantBaseline="central" className="tnum" style={{ fontSize: 42, fontWeight: 700, fill: level!.color }}>
                    {fmtNum(score)}
                  </text>
                  <text x="80" y="104" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", fill: "var(--ink-3)", fontWeight: 600 }}>
                    / 100
                  </text>
                </svg>
                <div
                  className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                  style={{
                    background: `color-mix(in oklab, ${level!.color} 12%, transparent)`,
                    border: `1px solid color-mix(in oklab, ${level!.color} 35%, transparent)`,
                  }}
                >
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full" style={{ background: level!.color }} />
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: level!.color }}>
                    {level!.label}
                  </span>
                </div>
              </div>

              {/* Personalized tip */}
              <div
                className="rounded-[8px] p-4 mb-4"
                style={{
                  background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
                  border: "1px solid rgb(var(--divider) / 0.08)",
                }}
              >
                <div className="tnum mb-2" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  {es ? "Tu siguiente paso" : "Your next step"}
                </div>
                <p className="m-0 text-[13.5px] leading-[1.6]" style={{ color: "var(--ink)" }}>
                  {level!.tip}
                </p>
              </div>

              {/* Weakest dimension */}
              {weakestIdx >= 0 && (
                <div
                  className="rounded-[8px] p-4"
                  style={{
                    background: "color-mix(in oklab, rgb(var(--pnl-neg)) 6%, transparent)",
                    border: "1px solid color-mix(in oklab, rgb(var(--pnl-neg)) 22%, transparent)",
                  }}
                >
                  <div className="tnum mb-1.5" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgb(var(--pnl-neg))" }}>
                    {es ? "Punto más débil" : "Weakest point"}
                  </div>
                  <p className="m-0 text-[12.5px] leading-[1.55]" style={{ color: "var(--ink-2)" }}>
                    {es ? QUESTIONS[weakestIdx].qEs : QUESTIONS[weakestIdx].qEn}
                  </p>
                </div>
              )}

              {/* Scale reference */}
              <div className="mt-5 flex items-center justify-between tnum" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>
                <span>0 {es ? "Novato" : "Novice"}</span>
                <span>40</span>
                <span>65</span>
                <span>85</span>
                <span style={{ color: "rgb(var(--pnl-pos))" }}>100 {es ? "Élite" : "Elite"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
