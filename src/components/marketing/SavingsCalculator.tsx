"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";

/**
 * SavingsCalculator — "pago único vs suscripción".
 *
 * Refuerza el value prop central de CountPips: pago único desde 29 $,
 * sin suscripciones. Cuantifica cuánto ahorra un trader frente a las
 * herramientas de journal SaaS típicas (que cobran 15-30 $/mes).
 *
 * El trader ajusta:
 *   · plan CountPips (Core 29 $ / Pro 49 $)
 *   · precio mensual de la alternativa por suscripción
 *   · años de uso
 *
 * Y ve: pago CountPips (una vez), pago suscripción (acumulado), ahorro
 * total $ y %, y una mini-curva que muestra cómo el ahorro crece con
 * el tiempo mientras la suscripción sigue cobrando cada mes.
 *
 * ── Material ──────────────────────────────────────────────────────────
 * .tj-paper + .tj-paper-glow (papel translúcido cálido, halo champagne).
 * Touch targets ≥44px. Sin overflow en mobile.
 */
export function SavingsCalculator() {
  const { lang } = useLang();
  const es = lang === "es";

  const countpipsPlans = [
    { id: "core", label: es ? "CountPips Core" : "CountPips Core", price: 29 },
    { id: "pro", label: es ? "CountPips Pro" : "CountPips Pro", price: 49 },
  ];

  // Alternativas SaaS típicas (rango 15-30 $/mes)
  const altPresets = [
    { label: es ? "Básico" : "Basic", v: 15 },
    { label: es ? "Estándar" : "Standard", v: 25 },
    { label: es ? "Premium" : "Premium", v: 30 },
  ];

  const [plan, setPlan] = useState<"core" | "pro">("pro");
  const [altMonthly, setAltMonthly] = useState(25);
  const [years, setYears] = useState(3);

  const c = useMemo(() => {
    const cpPrice = countpipsPlans.find((p) => p.id === plan)!.price;
    const altTotal = altMonthly * 12 * years;
    const savings = altTotal - cpPrice;
    const savingsPct = altTotal > 0 ? (savings / altTotal) * 100 : 0;
    // Break-even: cuántos meses hasta que la suscripción supere el pago único
    const breakEvenMonths = cpPrice > 0 && altMonthly > 0 ? Math.ceil(cpPrice / altMonthly) : 0;

    // Curva año a año: suscripción acumulada vs línea plana CountPips
    const curve: { year: number; sub: number; cp: number }[] = [];
    for (let y = 0; y <= years; y++) {
      curve.push({ year: y, sub: altMonthly * 12 * y, cp: cpPrice });
    }
    return { cpPrice, altTotal, savings, savingsPct, breakEvenMonths, curve };
  }, [plan, altMonthly, years, countpipsPlans]);

  const fmtUsd = (n: number) =>
    es
      ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const fmtNum = (n: number, dec = 0) =>
    es
      ? new Intl.NumberFormat("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)
      : new Intl.NumberFormat("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

  // SVG curva: suscripción (creciente) vs CountPips (plano)
  const svgW = 520;
  const svgH = 130;
  const padX = 8;
  const padY = 12;
  const maxV = Math.max(c.altTotal, c.cpPrice, 1);
  const subPts = c.curve.map((p, i) => {
    const x = padX + (i / (c.curve.length - 1)) * (svgW - padX * 2);
    const y = svgH - padY - (p.sub / maxV) * (svgH - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const subPath = "M " + subPts.join(" L ");
  const subAreaPath = `M ${padX},${svgH - padY} L ` + subPts.join(" L ") + ` L ${(svgW - padX).toFixed(1)},${svgH - padY} Z`;
  const cpY = svgH - padY - (c.cpPrice / maxV) * (svgH - padY * 2);
  const cpLineY = Math.max(padY, Math.min(svgH - padY, cpY));

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12,
    lineHeight: 1.2,
    minHeight: 44,
    padding: "12px 18px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s, border-color 0.2s",
    background: active ? "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)" : "transparent",
    color: active ? "rgb(var(--accent-base))" : "var(--ink-2)",
    border: active ? "1px solid color-mix(in oklab, rgb(var(--accent-base)) 50%, transparent)" : "1px solid rgb(var(--divider) / 0.13)",
  });

  return (
    <section className="section-tight bg-veil border-t border-[rgb(var(--divider)/0.06)]">
      <div className="tj-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: intro + inputs */}
        <div>
          <div className="inline-flex items-center gap-3 mb-5">
            <span className="tnum" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}>
              §
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span className="tnum" style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}>
              {es ? "AHORRO" : "SAVINGS"}
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
                Pago único. <span style={{ color: "rgb(var(--accent-base))" }}>Sin recurrencias.</span>
              </>
            ) : (
              <>
                Pay once. <span style={{ color: "rgb(var(--accent-base))" }}>No subscriptions.</span>
              </>
            )}
          </h2>
          <p
            className="mt-5 mb-7"
            style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", lineHeight: 1.62, color: "var(--ink-2)", maxWidth: "34em" }}
          >
            {es
              ? "Las herramientas de journal por suscripción te cobran cada mes, para siempre. CountPips se compra una vez. Calcula cuánto ahorras."
              : "Subscription journal tools charge you every month, forever. CountPips is a one-time purchase. Calculate how much you save."}
          </p>

          {/* Plan CountPips */}
          <div className="mb-5">
            <div className="tnum mb-2" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              {es ? "Tu plan CountPips" : "Your CountPips plan"}
            </div>
            <div className="flex flex-wrap gap-2">
              {countpipsPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  style={chipStyle(plan === p.id)}
                  aria-pressed={plan === p.id}
                  aria-label={`${p.label} ${fmtUsd(p.price)}`}
                >
                  {p.label} · {fmtUsd(p.price)}
                </button>
              ))}
            </div>
          </div>

          {/* Alternativa suscripción */}
          <div className="mb-5">
            <div className="tnum mb-2" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              {es ? "Alternative por suscripción ($/mes)" : "Subscription alternative ($/mo)"}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {altPresets.map((a) => (
                <button
                  key={a.label}
                  onClick={() => setAltMonthly(a.v)}
                  style={chipStyle(altMonthly === a.v)}
                  aria-pressed={altMonthly === a.v}
                  aria-label={`${a.label} ${fmtUsd(a.v)} ${es ? "al mes" : "per month"}`}
                >
                  {a.label} · {fmtUsd(a.v)}
                </button>
              ))}
            </div>
            {/* Slider fino para el precio mensual */}
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={altMonthly}
              onChange={(e) => setAltMonthly(parseInt(e.target.value))}
              className="tj-range w-full"
              style={{ accentColor: "rgb(var(--accent-base))" }}
              aria-label={es ? "Precio mensual de la alternativa por suscripción" : "Monthly price of subscription alternative"}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="tnum" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>5 $</span>
              <span className="tnum" style={{ fontSize: 14, fontWeight: 700, color: "rgb(var(--accent-base))" }}>{fmtUsd(altMonthly)}{es ? "/mes" : "/mo"}</span>
              <span className="tnum" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>50 $</span>
            </div>
          </div>

          {/* Años de uso */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                {es ? "Años de uso" : "Years of use"}
              </span>
              <span className="tnum" style={{ fontSize: 14, fontWeight: 700, color: "rgb(var(--accent-base))" }}>{years} {es ? "años" : "yrs"}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="tj-range w-full"
              style={{ accentColor: "rgb(var(--accent-base))" }}
              aria-label={es ? "Años de uso" : "Years of use"}
            />
          </div>
        </div>

        {/* Right: results card */}
        <div
          className="tj-paper tj-paper-glow relative"
          style={{ padding: 24, borderRadius: 8, border: "1px solid rgb(var(--divider) / 0.13)" }}
        >
          {/* Headline savings */}
          <div className="mb-5">
            <div className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              {es ? "Ahorras" : "You save"}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="tnum" style={{ fontSize: 34, fontWeight: 700, color: "rgb(var(--pnl-pos))" }}>
                {fmtUsd(c.savings)}
              </span>
              <span className="tnum" style={{ fontSize: 16, fontWeight: 600, color: "rgb(var(--pnl-pos))" }}>
                {fmtNum(c.savingsPct, 0)} %
              </span>
            </div>
          </div>

          {/* Comparison bar chart SVG */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                {es ? "Pago acumulado" : "Cumulative cost"} · {years} {es ? "años" : "yrs"}
              </span>
            </div>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: "auto", display: "block" }} aria-label={es ? "Comparación de pago acumulado" : "Cumulative cost comparison"} role="img">
              <defs>
                <linearGradient id="sv-sub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--pnl-neg))" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="rgb(var(--pnl-neg))" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              {/* subscription area (growing) */}
              <path d={subAreaPath} fill="url(#sv-sub)" />
              <path d={subPath} fill="none" stroke="rgb(var(--pnl-neg))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {/* CountPips flat line */}
              <line
                x1={padX}
                y1={cpLineY}
                x2={svgW - padX}
                y2={cpLineY}
                stroke="rgb(var(--accent-base))"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              {/* start baseline */}
              <line x1={padX} y1={svgH - padY} x2={svgW - padX} y2={svgH - padY} stroke="rgb(var(--divider) / 0.16)" strokeWidth="1" />
            </svg>
            <div className="flex items-center gap-4 mt-2 tnum" style={{ fontSize: 10, color: "var(--ink-3)" }}>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block w-2.5 h-[2px]" style={{ background: "rgb(var(--pnl-neg))" }} />
                {es ? "Suscripción" : "Subscription"}: {fmtUsd(c.altTotal)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block w-2.5 border-t-2 border-dashed" style={{ borderColor: "rgb(var(--accent-base))" }} />
                CountPips: {fmtUsd(c.cpPrice)}
              </span>
            </div>
          </div>

          {/* Result tiles */}
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <Result label={es ? "Pago CountPips" : "CountPips (once)"} value={fmtUsd(c.cpPrice)} color="rgb(var(--accent-base))" />
            <Result label={es ? "Suscripción" : "Subscription"} value={fmtUsd(c.altTotal)} color="rgb(var(--pnl-neg))" />
            <Result label={es ? "Ahorro total" : "Total saved"} value={fmtUsd(c.savings)} color="rgb(var(--pnl-pos))" />
            <Result label={es ? "Break-even" : "Break-even"} value={`${c.breakEvenMonths} ${es ? "meses" : "mo"}`} color="var(--ink)" />
          </div>

          {/* Break-even note */}
          <div
            className="rounded-[6px] px-3 py-2.5"
            style={{ background: "color-mix(in oklab, var(--surface-2) 40%, transparent)", border: "1px solid rgb(var(--divider) / 0.06)" }}
          >
            <p className="tnum m-0 text-[12px] leading-[1.55]" style={{ color: "var(--ink-2)" }}>
              {es
                ? `En ${c.breakEvenMonths} ${c.breakEvenMonths === 1 ? "mes" : "meses"} la suscripción ya supera lo que cuesta CountPips. A partir de ahí, cada mes que sigas usándolo es ahorro neto.`
                : `In ${c.breakEvenMonths} ${c.breakEvenMonths === 1 ? "month" : "months"} the subscription already exceeds CountPips' price. After that, every month you keep using it is net savings.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Result({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="group/result relative min-w-0 rounded-[8px] border border-[rgb(var(--divider)/0.06)] px-3 sm:px-4 py-3.5 transition-[transform,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[rgb(var(--accent-base)/0.30)]"
      style={{ background: "color-mix(in oklab, var(--surface-2) 50%, transparent)" }}
    >
      <div className="tnum relative" style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        {label}
      </div>
      <div className="tnum min-w-0 break-words relative" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color }}>
        {value}
      </div>
    </div>
  );
}
