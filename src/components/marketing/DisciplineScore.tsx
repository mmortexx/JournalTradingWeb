"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";

/**
 * DisciplineScore — diagnóstico de disciplina operativa.
 *
 * ── Qué cambió, y por qué ─────────────────────────────────────────────
 * Era un test de seis preguntas con una única cifra al final. Gustaba,
 * pero medía poco: todas las respuestas valían lo mismo y el resultado no
 * distinguía a quien lleva un registro impecable y arriesga a ciegas de
 * quien gestiona el riesgo de libro y no anota nada. Dos traders con
 * problemas opuestos salían con la misma puntuación y el mismo consejo.
 *
 * Ahora mide CINCO EJES por separado, con tres preguntas cada uno:
 *
 *   RIESGO      lo que decide si la cuenta sobrevive
 *   PLAN        si hay una decisión antes de la operación
 *   REGISTRO    si existen datos propios sobre los que decidir
 *   TEMPLE      qué pasa cuando el mercado va en contra
 *   CONSTANCIA  si lo anterior se sostiene en el tiempo
 *
 * ── Las preguntas NO pesan igual ──────────────────────────────────────
 * Mover el stop en contra revela mucho más sobre un trader que revisar el
 * diario los domingos: lo primero vacía cuentas y lo segundo las mejora
 * despacio. Cada pregunta lleva su peso (1 a 3) y la puntuación de cada
 * eje es la media ponderada de las suyas. La cifra global es la media de
 * los ejes ponderada por la importancia del eje, no la suma de aciertos.
 *
 * Consecuencia buscada: un punto flaco grave en riesgo hunde el resultado
 * aunque todo lo demás esté bien. Es lo que pasa en la realidad.
 *
 * ── El resultado dice DÓNDE, no sólo CUÁNTO ───────────────────────────
 * Una cifra sola no es accionable. Se devuelve el perfil de los cinco
 * ejes en barras, el eje más débil señalado, y una recomendación escrita
 * para ESE eje — no un consejo genérico por tramo de puntuación.
 *
 * ── Material ──────────────────────────────────────────────────────────
 * .tj-paper + .tj-paper-glow. Objetivos táctiles ≥44 px. Sin desbordes en
 * móvil: las opciones se apilan y el perfil es de una columna.
 */

type DimId = "riesgo" | "plan" | "registro" | "temple" | "constancia";

type Dim = {
  id: DimId;
  es: string;
  en: string;
  /* Peso del eje en la cifra global. Riesgo pesa el doble que constancia
     porque un fallo ahí no se corrige con tiempo: se paga en el momento. */
  weight: number;
  tipEs: string;
  tipEn: string;
};

const DIMS: Dim[] = [
  {
    id: "riesgo",
    es: "Riesgo",
    en: "Risk",
    weight: 3,
    tipEs:
      "Tu punto flaco es el riesgo, y es el que no admite paciencia: una racha normal basta para vaciar una cuenta mal dimensionada. Antes de tocar nada más, fija cuánto pierdes por operación —en dinero, no en sensación— y un tope diario que te saque de la pantalla al tocarlo.",
    tipEn:
      "Your weak point is risk, and it is the one that grants no patience: an ordinary losing run empties a badly sized account. Before anything else, fix how much you lose per trade — in money, not in feel — and a daily cap that pulls you off the screen when hit.",
  },
  {
    id: "plan",
    es: "Plan",
    en: "Plan",
    weight: 2.5,
    tipEs:
      "Tu punto flaco es el plan. Operas decidiendo sobre la marcha, y eso hace imposible saber si algo funciona: cada operación es distinta, así que no hay nada que medir. Escribe tus dos o tres situaciones con reglas concretas de entrada, stop y objetivo, y no abras nada que no encaje en una.",
    tipEn:
      "Your weak point is the plan. You decide as you go, which makes it impossible to know whether anything works: every trade is different, so there is nothing to measure. Write your two or three setups with concrete entry, stop and target rules, and open nothing that fits none of them.",
  },
  {
    id: "registro",
    es: "Registro",
    en: "Record",
    weight: 2,
    tipEs:
      "Tu punto flaco es el registro. Sin datos propios estás opinando sobre tu operativa, no analizándola — y la memoria guarda las ganadoras y suaviza las perdedoras. Anota cada operación con su motivo y revisa expectancy y R medio con una periodicidad fija.",
    tipEn:
      "Your weak point is the record. Without your own data you are opining about your trading, not analysing it — and memory keeps the winners and softens the losers. Log every trade with its reason and review expectancy and average R on a fixed schedule.",
  },
  {
    id: "temple",
    es: "Temple",
    en: "Composure",
    weight: 2.5,
    tipEs:
      "Tu punto flaco es el temple. Sabes qué hacer y dejas de hacerlo justo cuando importa: después de perder, con prisa o con la cuenta en rojo. No se arregla con fuerza de voluntad sino con frenos externos — un tope de pérdida que cierre la sesión y una regla de no operar en la hora siguiente a una pérdida grande.",
    tipEn:
      "Your weak point is composure. You know what to do and stop doing it exactly when it counts: after a loss, in a hurry, with the account down. Willpower does not fix this — external brakes do: a loss cap that ends the session, and a rule against trading in the hour after a big loss.",
  },
  {
    id: "constancia",
    es: "Constancia",
    en: "Consistency",
    weight: 1.5,
    tipEs:
      "Tu punto flaco es la constancia. Haces las cosas bien a ratos, y a ratos no basta: la ventaja sólo aparece sobre muchas operaciones seguidas del mismo modo. Elige un método y sostenlo tres meses sin cambiarlo, midiendo. Cambiar de sistema tras cada mala racha es la forma más cara de no aprender nada.",
    tipEn:
      "Your weak point is consistency. You do things well in patches, and patches are not enough: an edge only shows over many trades done the same way. Pick one method and hold it for three months, measuring. Switching systems after every bad run is the most expensive way to learn nothing.",
  },
];

type Q = {
  dim: DimId;
  /* 1 a 3. Cuánto revela esta pregunta sobre el eje. */
  weight: number;
  qEs: string;
  qEn: string;
  /* Siempre de peor a mejor conducta: 0 puntos la primera, 3 la última. */
  options: { es: string; en: string }[];
};

const QUESTIONS: Q[] = [
  /* ── RIESGO ──────────────────────────────────────────────────────── */
  {
    dim: "riesgo",
    weight: 3,
    qEs: "Antes de abrir una operación, ¿sabes cuánto dinero pierdes si sale mal?",
    qEn: "Before opening a trade, do you know how much money you lose if it goes wrong?",
    options: [
      { es: "No lo calculo", en: "I don't work it out" },
      { es: "Una idea aproximada", en: "A rough idea" },
      { es: "Sí, en porcentaje de la cuenta", en: "Yes, as a % of the account" },
      { es: "Sí, la cifra exacta en dinero", en: "Yes, the exact figure in money" },
    ],
  },
  {
    dim: "riesgo",
    weight: 3,
    qEs: "Cuando una operación va en contra, ¿mueves el stop para darle margen?",
    qEn: "When a trade goes against you, do you move the stop to give it room?",
    options: [
      { es: "Sí, casi siempre", en: "Yes, almost always" },
      { es: "A veces, si creo en la idea", en: "Sometimes, if I believe in the idea" },
      { es: "Casi nunca", en: "Almost never" },
      { es: "Nunca. Donde lo puse, se queda", en: "Never. Where I put it, it stays" },
    ],
  },
  {
    dim: "riesgo",
    weight: 2,
    qEs: "¿Tienes un límite de pérdida diaria que te haga parar?",
    qEn: "Do you have a daily loss limit that makes you stop?",
    options: [
      { es: "No", en: "No" },
      { es: "Lo tengo, pero me lo salto", en: "I have one, but I break it" },
      { es: "Sí, y casi siempre lo respeto", en: "Yes, and I mostly respect it" },
      { es: "Sí, y cierro la plataforma al tocarlo", en: "Yes, and I close the platform when hit" },
    ],
  },

  /* ── PLAN ────────────────────────────────────────────────────────── */
  {
    dim: "plan",
    weight: 3,
    qEs: "¿Defines entrada, stop y objetivo antes de entrar?",
    qEn: "Do you define entry, stop and target before entering?",
    options: [
      { es: "Lo decido sobre la marcha", en: "I decide on the fly" },
      { es: "La entrada sí, el resto después", en: "Entry yes, the rest later" },
      { es: "Casi siempre los tres", en: "Almost always all three" },
      { es: "Siempre, y por escrito", en: "Always, and written down" },
    ],
  },
  {
    dim: "plan",
    weight: 2,
    qEs: "¿Tienes tus situaciones de entrada escritas con reglas concretas?",
    qEn: "Do you have your setups written down with concrete rules?",
    options: [
      { es: "No, las llevo en la cabeza", en: "No, they're in my head" },
      { es: "Apuntes sueltos", en: "Loose notes" },
      { es: "Sí, documentadas", en: "Yes, documented" },
      { es: "Sí, y mido cuánto rinde cada una", en: "Yes, and I measure how each performs" },
    ],
  },
  {
    dim: "plan",
    weight: 2,
    qEs: "¿Entras en operaciones que no encajan en ninguna de tus reglas?",
    qEn: "Do you take trades that fit none of your rules?",
    options: [
      { es: "A menudo, si lo veo claro", en: "Often, if it looks clear" },
      { es: "Alguna vez a la semana", en: "A few times a week" },
      { es: "Rara vez", en: "Rarely" },
      { es: "No. Si no encaja, no existe", en: "No. If it doesn't fit, it doesn't exist" },
    ],
  },

  /* ── REGISTRO ────────────────────────────────────────────────────── */
  {
    dim: "registro",
    weight: 2,
    qEs: "¿Anotas tus operaciones con el motivo de cada una?",
    qEn: "Do you log your trades with the reason for each?",
    options: [
      { es: "No anoto nada", en: "I log nothing" },
      { es: "Sólo el resultado", en: "Only the result" },
      { es: "Sí, con el motivo", en: "Yes, with the reason" },
      { es: "Sí, con motivo, estado y captura", en: "Yes, with reason, state and screenshot" },
    ],
  },
  {
    dim: "registro",
    weight: 3,
    qEs: "¿Sabes cuánto ganas de media por operación, medido?",
    qEn: "Do you know your measured average result per trade?",
    options: [
      { es: "Ni idea", en: "No idea" },
      { es: "Sé si voy ganando o perdiendo", en: "I know if I'm up or down" },
      { es: "Sé mi porcentaje de aciertos", en: "I know my win rate" },
      { es: "Sé mi expectancy y mi R medio", en: "I know my expectancy and average R" },
    ],
  },
  {
    dim: "registro",
    weight: 2,
    qEs: "¿Cada cuánto revisas tus datos?",
    qEn: "How often do you review your data?",
    options: [
      { es: "Nunca", en: "Never" },
      { es: "Cuando algo va mal", en: "When something goes wrong" },
      { es: "De vez en cuando", en: "Now and then" },
      { es: "Un día fijo, todas las semanas", en: "A fixed day, every week" },
    ],
  },

  /* ── TEMPLE ──────────────────────────────────────────────────────── */
  {
    dim: "temple",
    weight: 3,
    qEs: "Después de una pérdida grande, ¿aumentas el tamaño para recuperarla?",
    qEn: "After a big loss, do you increase size to win it back?",
    options: [
      { es: "Sí, quiero recuperar ya", en: "Yes, I want it back now" },
      { es: "A veces se me va la mano", en: "Sometimes I overdo it" },
      { es: "No, mantengo el tamaño", en: "No, I keep the size" },
      { es: "No, lo reduzco hasta recomponerme", en: "No, I cut it until I'm steady" },
    ],
  },
  {
    dim: "temple",
    weight: 2,
    qEs: "¿Cierras ganadoras antes de tiempo por miedo a que se den la vuelta?",
    qEn: "Do you close winners early for fear they'll turn?",
    options: [
      { es: "Casi siempre", en: "Almost always" },
      { es: "Bastante a menudo", en: "Fairly often" },
      { es: "Alguna vez", en: "Occasionally" },
      { es: "No, dejo correr hasta mi objetivo", en: "No, I let it run to my target" },
    ],
  },
  {
    dim: "temple",
    weight: 2,
    qEs: "¿Operas cansado, enfadado o con prisa?",
    qEn: "Do you trade tired, angry or in a hurry?",
    options: [
      { es: "Sí, opero igual", en: "Yes, I trade anyway" },
      { es: "A veces, sin pensarlo", en: "Sometimes, without thinking" },
      { es: "Rara vez", en: "Rarely" },
      { es: "No. Si no estoy bien, no abro nada", en: "No. If I'm not right, I open nothing" },
    ],
  },

  /* ── CONSTANCIA ──────────────────────────────────────────────────── */
  {
    dim: "constancia",
    weight: 2,
    qEs: "¿Cuánto llevas operando con el mismo método, sin cambiarlo?",
    qEn: "How long have you traded the same method without changing it?",
    options: [
      { es: "Cambio cada pocas semanas", en: "I change every few weeks" },
      { es: "Un mes o dos", en: "A month or two" },
      { es: "Tres a seis meses", en: "Three to six months" },
      { es: "Más de seis meses", en: "More than six months" },
    ],
  },
  {
    dim: "constancia",
    weight: 2,
    qEs: "En las últimas diez sesiones, ¿cuántas seguiste tu plan entero?",
    qEn: "Of your last ten sessions, how many did you follow your plan in full?",
    options: [
      { es: "Menos de tres", en: "Fewer than three" },
      { es: "Entre tres y cinco", en: "Three to five" },
      { es: "Entre seis y ocho", en: "Six to eight" },
      { es: "Nueve o diez", en: "Nine or ten" },
    ],
  },
  {
    dim: "constancia",
    weight: 1,
    qEs: "¿Repasas tus errores anteriores antes de empezar la sesión?",
    qEn: "Do you review your past mistakes before starting the session?",
    options: [
      { es: "Nunca", en: "Never" },
      { es: "Casi nunca", en: "Almost never" },
      { es: "A veces", en: "Sometimes" },
      { es: "Sí, forma parte de mi rutina", en: "Yes, it's part of my routine" },
    ],
  },
];

/** Puntos máximos de una pregunta: cuatro opciones, de 0 a 3. */
const MAX_OPT = 3;

export function DisciplineScore({ num = "04" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  /* Puntuación por eje: media ponderada de sus preguntas, en 0-100. Las
     preguntas sin responder no cuentan ni a favor ni en contra, así que el
     perfil ya dice algo antes de terminar. */
  const perDim = useMemo(() => {
    const acc: Record<DimId, { got: number; max: number }> = {
      riesgo: { got: 0, max: 0 },
      plan: { got: 0, max: 0 },
      registro: { got: 0, max: 0 },
      temple: { got: 0, max: 0 },
      constancia: { got: 0, max: 0 },
    };
    QUESTIONS.forEach((q, i) => {
      const a = answers[i];
      if (a === null) return;
      acc[q.dim].got += a * q.weight;
      acc[q.dim].max += MAX_OPT * q.weight;
    });
    return DIMS.map((d) => ({
      dim: d,
      pct: acc[d.id].max > 0 ? Math.round((acc[d.id].got / acc[d.id].max) * 100) : 0,
      respondidas: acc[d.id].max > 0,
    }));
  }, [answers]);

  /* Cifra global: media de los ejes ponderada por la importancia del eje.
     NO es el porcentaje de aciertos — un fallo en riesgo pesa el doble
     que uno en constancia, igual que en la operativa real. */
  const score = useMemo(() => {
    let got = 0;
    let max = 0;
    QUESTIONS.forEach((q, i) => {
      const a = answers[i];
      if (a === null) return;
      const dim = DIMS.find((d) => d.id === q.dim);
      const w = q.weight * (dim ? dim.weight : 1);
      got += a * w;
      max += MAX_OPT * w;
    });
    return max > 0 ? Math.round((got / max) * 100) : 0;
  }, [answers]);

  const level = useMemo(() => {
    if (!allAnswered) return null;
    if (score < 40)
      return {
        label: es ? "Frágil" : "Fragile",
        color: "rgb(var(--pnl-neg))",
        resumenEs: "Ahora mismo el resultado depende del mercado, no de ti.",
        resumenEn: "Right now the outcome depends on the market, not on you.",
      };
    if (score < 65)
      return {
        label: es ? "En construcción" : "Building",
        color: "rgb(var(--sig-amber))",
        resumenEs: "Hay base. Lo que falta es que se sostenga cuando cuesta.",
        resumenEn: "There's a base. What's missing is holding it when it's hard.",
      };
    if (score < 85)
      return {
        label: es ? "Sólido" : "Solid",
        color: "rgb(var(--accent-base))",
        resumenEs: "Operativa medida. Queda afinar los bordes.",
        resumenEn: "Measured trading. The edges remain to be sharpened.",
      };
    return {
      label: es ? "Institucional" : "Institutional",
      color: "rgb(var(--pnl-pos))",
      resumenEs: "Sobrevives a la varianza, que es lo que deja cobrar una ventaja.",
      resumenEn: "You survive variance, which is what lets an edge pay out.",
    };
  }, [allAnswered, score, es]);

  /* El eje más flojo, que es de lo que va la recomendación. A igualdad de
     porcentaje gana el de más peso: si riesgo y constancia empatan, lo
     urgente es riesgo. */
  const weakest = useMemo(() => {
    if (!allAnswered) return null;
    return [...perDim].sort(
      (a, b) => a.pct - b.pct || b.dim.weight - a.dim.weight,
    )[0];
  }, [perDim, allAnswered]);

  const reset = () => setAnswers(QUESTIONS.map(() => null));

  const setAnswer = (qi: number, oi: number) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });

  const barColor = (pct: number) =>
    pct < 40
      ? "rgb(var(--pnl-neg))"
      : pct < 65
        ? "rgb(var(--sig-amber))"
        : pct < 85
          ? "rgb(var(--accent-base))"
          : "rgb(var(--pnl-pos))";

  return (
    <section className="section-tight bg-veil border-t border-[rgb(var(--divider)/0.06)]">
      <div className="tj-container">
        {/* ── Encabezado ─────────────────────────────────────────────── */}
        <div className="mb-8 max-w-[46em]">
          <div className="inline-flex items-center gap-3 mb-5">
            <span
              className="tnum"
              style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}
            >
              § {num}
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span className="tnum" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}>
              {es ? "DIAGNÓSTICO" : "DIAGNOSIS"}
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
                Mídete. <span style={{ color: "rgb(var(--accent-base))" }}>Por dónde flojeas.</span>
              </>
            ) : (
              <>
                Measure yourself. <span style={{ color: "rgb(var(--accent-base))" }}>Where you're weak.</span>
              </>
            )}
          </h2>
          <p
            className="mt-5"
            style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", lineHeight: 1.62, color: "var(--ink-2)" }}
          >
            {es
              ? "Quince preguntas sobre cinco ejes: riesgo, plan, registro, temple y constancia. No todas pesan igual — mover un stop en contra dice más de un trader que revisar el diario los domingos. Al final: tu perfil por ejes, la cifra global y qué arreglar primero. Sin email."
              : "Fifteen questions across five axes: risk, plan, record, composure and consistency. They don't all weigh the same — moving a stop against you says more about a trader than reviewing the journal on Sundays. At the end: your profile by axis, the overall figure and what to fix first. No email."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 items-start">
          {/* ── Cuestionario ─────────────────────────────────────────── */}
          <div>
            {/* Progreso */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="tnum"
                  style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
                >
                  {es ? "Progreso" : "Progress"}
                </span>
                <span className="tnum" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
                  {answeredCount} / {QUESTIONS.length}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgb(var(--divider) / 0.13)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(answeredCount / QUESTIONS.length) * 100}%`,
                    background: "rgb(var(--accent-base))",
                    transition: "width 0.22s cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </div>
            </div>

            <ol className="list-none p-0 m-0 flex flex-col gap-5">
              {QUESTIONS.map((q, qi) => {
                const dim = DIMS.find((d) => d.id === q.dim);
                return (
                  <li key={qi} className="tj-paper rounded-[8px] p-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className="tnum"
                        style={{ fontSize: 10, fontWeight: 700, color: "rgb(var(--accent-base))" }}
                      >
                        {String(qi + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="tnum"
                        style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
                      >
                        {dim ? (es ? dim.es : dim.en) : ""}
                      </span>
                    </div>
                    <p className="m-0 mb-3" style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--ink)" }}>
                      {es ? q.qEs : q.qEn}
                    </p>
                    {/* Una columna en móvil y dos desde `sm`: las respuestas
                        son frases, no etiquetas, y en 390 px apiladas se
                        leen sin cortes. */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((o, oi) => {
                        const activa = answers[qi] === oi;
                        return (
                          <button
                            key={oi}
                            type="button"
                            onClick={() => setAnswer(qi, oi)}
                            aria-pressed={activa}
                            className="text-left rounded-[6px] transition-[background-color,border-color,color] duration-200"
                            style={{
                              minHeight: 44,
                              padding: "10px 12px",
                              fontSize: 13,
                              lineHeight: 1.35,
                              cursor: "pointer",
                              color: activa ? "rgb(var(--accent-base))" : "var(--ink-2)",
                              background: activa
                                ? "color-mix(in oklab, rgb(var(--accent-base)) 12%, transparent)"
                                : "color-mix(in oklab, var(--surface-2) 45%, transparent)",
                              border: activa
                                ? "1px solid color-mix(in oklab, rgb(var(--accent-base)) 50%, transparent)"
                                : "1px solid rgb(var(--divider) / 0.12)",
                            }}
                          >
                            {es ? o.es : o.en}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>

            {answeredCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center gap-2 rounded-[6px]"
                style={{
                  minHeight: 44,
                  padding: "10px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                  color: "var(--ink-2)",
                  background: "transparent",
                  border: "1px solid rgb(var(--divider) / 0.16)",
                }}
              >
                {es ? "Empezar de nuevo" : "Start over"}
              </button>
            )}
          </div>

          {/* ── Resultado ────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="tj-paper tj-paper-glow rounded-[10px] p-5">
              <div
                className="tnum mb-4"
                style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Tu perfil" : "Your profile"}
              </div>

              {/* Cifra global */}
              <div className="flex items-end gap-3 mb-1">
                <span
                  className="tnum"
                  style={{
                    fontSize: 46,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: level ? level.color : "var(--ink-3)",
                    transition: "color 0.25s ease",
                  }}
                >
                  {score}
                </span>
                <span className="tnum" style={{ fontSize: 15, color: "var(--ink-3)", paddingBottom: 4 }}>
                  / 100
                </span>
                {level && (
                  <span
                    className="tnum ml-auto px-2.5 py-1 rounded-full"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: level.color,
                      background: `color-mix(in oklab, ${level.color} 14%, transparent)`,
                      border: `1px solid color-mix(in oklab, ${level.color} 40%, transparent)`,
                    }}
                  >
                    {level.label}
                  </span>
                )}
              </div>
              <p className="m-0 mb-5" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-3)" }}>
                {level
                  ? es
                    ? level.resumenEs
                    : level.resumenEn
                  : es
                    ? "Ponderado por eje: un fallo en riesgo pesa más que uno en constancia."
                    : "Weighted by axis: a gap in risk weighs more than one in consistency."}
              </p>

              {/* Perfil por ejes */}
              <div className="flex flex-col gap-3 mb-5">
                {perDim.map(({ dim, pct, respondidas }) => (
                  <div key={dim.id}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{es ? dim.es : dim.en}</span>
                      <span
                        className="tnum"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: respondidas ? barColor(pct) : "var(--ink-3)",
                        }}
                      >
                        {respondidas ? `${pct} %` : "—"}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgb(var(--divider) / 0.12)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${respondidas ? pct : 0}%`,
                          background: barColor(pct),
                          transition: "width 0.3s cubic-bezier(0.22,1,0.36,1), background-color 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Qué arreglar primero */}
              {weakest ? (
                <div
                  className="rounded-[8px] p-4"
                  style={{
                    background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
                    border: "1px solid rgb(var(--divider) / 0.1)",
                  }}
                >
                  <div
                    className="tnum mb-2"
                    style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgb(var(--accent-base))" }}
                  >
                    {es ? "Empieza por aquí" : "Start here"}
                  </div>
                  <p className="m-0" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}>
                    {es ? weakest.dim.tipEs : weakest.dim.tipEn}
                  </p>
                </div>
              ) : (
                <p className="m-0" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-3)" }}>
                  {es
                    ? `Responde las ${QUESTIONS.length} preguntas para ver tu perfil completo y por dónde empezar.`
                    : `Answer all ${QUESTIONS.length} questions to see your full profile and where to start.`}
                </p>
              )}

              <p className="m-0 mt-4" style={{ fontSize: 11, lineHeight: 1.5, color: "var(--ink-3)" }}>
                {es
                  ? "Autoevaluación orientativa: mide hábitos declarados, no resultados. Lo que de verdad te retrata son tus propios datos operación a operación."
                  : "Indicative self-assessment: it measures declared habits, not results. What really portrays you is your own trade-by-trade data."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
