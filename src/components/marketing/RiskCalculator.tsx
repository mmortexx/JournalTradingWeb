"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/lib/i18n";

/**
 * RiskCalculator — sección § 04·c del HTML. Calculadora interactiva:
 * slider de riesgo %, chips de plantilla, chips de balance, muestra
 * resultados: riesgo $, tamaño, R:R, beneficio y barra riesgo/beneficio.
 *
 * Estado local con useState + useMemo para los cálculos.
 *
 * `num` — ordinal del eyebrow. Por defecto el de la home ("04·c"); las
 * páginas internas pasan el suyo para mantener su propia secuencia.
 */
export function RiskCalculator({ num = "04·c" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";

  const presets = [
    { label: es ? "Conservador" : "Conservative", pct: 0.5 },
    { label: es ? "Estándar" : "Standard", pct: 1.0 },
    { label: es ? "Agresivo" : "Aggressive", pct: 2.0 },
  ];
  const balances = [
    { label: "5k $", v: 5000 },
    { label: "10k $", v: 10000 },
    { label: "25k $", v: 25000 },
  ];

  const [riskPct, setRiskPct] = useState(1.0);
  const [balance, setBalance] = useState(10000);

  // Entrada / Stop / Target fijos como en el HTML.
  const entry = 100;
  const stop = 95;
  const target = 115;
  const riskPerShare = entry - stop; // 5
  const rewardPerShare = target - entry; // 15
  const rr = rewardPerShare / riskPerShare; // 3
  const riskUsd = (balance * riskPct) / 100;
  const size = riskUsd / riskPerShare;
  const profit = size * rewardPerShare;
  const profitPct = (profit / balance) * 100;

  const fmtUsd = (n: number) =>
    es
      ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
      : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  // Anchos de las barras Riesgo / Beneficio normalizados.
  const max = Math.max(riskUsd, profit, 1);
  const riskW = (riskUsd / max) * 100;
  const profitW = (profit / max) * 100;

  const fmtNum = (n: number, dec = 2) =>
    es
      ? new Intl.NumberFormat("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)
      : new Intl.NumberFormat("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);

  const chipStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12,
    padding: "8px 14px",
    borderRadius: 100,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s, border-color 0.2s",
    background: active
      ? "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)"
      : "transparent",
    color: active ? "rgb(var(--accent-base))" : "var(--ink-2)",
    border: active
      ? "1px solid color-mix(in oklab, rgb(var(--accent-base)) 50%, transparent)"
      : "1px solid rgb(var(--divider) / 0.13)",
  });

  return (
    <section
      className="border-t"
      style={{
        padding: "100px 24px 80px",
        borderColor: "rgb(var(--divider) / 0.06)",
      }}
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-3 mb-5">
            <span
              className="tnum"
              style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}
            >
              § {num}
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}
            >
              {es ? "CALCULADORA" : "CALCULATOR"}
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
                Calcula tu riesgo <span style={{ color: "rgb(var(--accent-base))" }}>antes</span> de operar.
              </>
            ) : (
              <>
                Calculate your risk <span style={{ color: "rgb(var(--accent-base))" }}>before</span> you trade.
              </>
            )}
          </h2>
          <p
            className="mt-5 mb-7"
            style={{
              fontSize: "clamp(1rem, 1.3vw, 1.1rem)",
              lineHeight: 1.62,
              color: "var(--ink-2)",
              maxWidth: "34em",
            }}
          >
            {es
              ? "Configura tu balance y tu plan. Te decimos cuánto arriesgar, cuántas unidades y dónde poner el stop."
              : "Set your balance and your plan. We tell you how much to risk, how many units, and where to place your stop."}
          </p>
          {/* Chips de plantilla */}
          <div className="mb-4">
            <div
              className="tnum mb-2"
              style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Plantilla de riesgo" : "Risk preset"}
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p.label} onClick={() => setRiskPct(p.pct)} style={chipStyle(riskPct === p.pct)}>
                  {p.label} · {fmtNum(p.pct)} %
                </button>
              ))}
            </div>
          </div>
          {/* Chips de balance */}
          <div>
            <div
              className="tnum mb-2"
              style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Balance" : "Balance"}
            </div>
            <div className="flex flex-wrap gap-2">
              {balances.map((b) => (
                <button key={b.label} onClick={() => setBalance(b.v)} style={chipStyle(balance === b.v)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjeta calculadora */}
        <div
          className="relative"
          style={{
            padding: 24,
            borderRadius: 18,
            border: "1px solid rgb(var(--divider) / 0.13)",
            background: "color-mix(in oklab, var(--surface) 60%, transparent)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.08)",
          }}
        >
          {/* Slider de riesgo */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span
                className="tnum"
                style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Riesgo por operación" : "Risk per trade"}
              </span>
              <span
                className="tnum"
                style={{ fontSize: 22, fontWeight: 700, color: "rgb(var(--accent-base))" }}
              >
                {fmtNum(riskPct)} %
              </span>
            </div>
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.05}
              value={riskPct}
              onChange={(e) => setRiskPct(parseFloat(e.target.value))}
              className="w-full"
              style={{ accentColor: "rgb(var(--accent-base))" }}
            />
            <div className="flex items-center justify-between mt-1">
              {["0,25 %", "1,00 %", "2,00 %", "3,00 %"].map((t) => (
                <span key={t} className="tnum" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Entrada / Stop / Target */}
          <div
            className="grid grid-cols-3 gap-2 p-3 rounded-[12px] mb-5"
            style={{
              background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
              border: "1px solid rgb(var(--divider) / 0.06)",
            }}
          >
            {[
              { l: es ? "Entrada" : "Entry", v: entry.toString() },
              { l: es ? "Stop" : "Stop", v: stop.toString() },
              { l: es ? "Objetivo" : "Target", v: target.toString() },
            ].map((f) => (
              <div key={f.l}>
                <div
                  className="tnum"
                  style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
                >
                  {f.l}
                </div>
                <div className="tnum" style={{ fontSize: 16, fontWeight: 600, marginTop: 2, color: "var(--ink)" }}>{f.v}</div>
              </div>
            ))}
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Result label={es ? "Riesgo $" : "Risk $"} value={fmtUsd(riskUsd)} color="rgb(var(--pnl-neg))" />
            <Result label={es ? "Beneficio" : "Profit"} value={fmtUsd(profit)} color="rgb(var(--pnl-pos))" />
            <Result label={es ? "Tamaño" : "Size"} value={`${fmtNum(size, 2)} ${es ? "u" : "u"}`} color="var(--ink)" />
            <Result label="R:R" value={`${fmtNum(rr, 2)} : 1`} color="rgb(var(--accent-base))" />
          </div>

          {/* Barra Riesgo ↔ Beneficio */}
          <div>
            <div
              className="tnum mb-2"
              style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Distribución por trade" : "Per-trade distribution"}
            </div>
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{ background: "rgb(var(--divider) / 0.13)" }}
            >
              <div
                className="absolute left-0 top-0 h-full"
                style={{ width: `${riskW}%`, background: "rgb(var(--pnl-neg))" }}
              />
              <div
                className="absolute right-0 top-0 h-full"
                style={{ width: `${profitW}%`, background: "rgb(var(--pnl-pos))" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between tnum" style={{ fontSize: 11, color: "var(--ink-2)" }}>
              <span>{fmtUsd(riskUsd)}</span>
              <span style={{ color: "var(--ink-3)" }}>{fmtNum(profitPct, 1)} % {es ? "del balance" : "of balance"}</span>
              <span>{fmtUsd(profit)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Result({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-[12px] p-3"
      style={{
        background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
        border: "1px solid rgb(var(--divider) / 0.06)",
      }}
    >
      <div
        className="tnum"
        style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
      >
        {label}
      </div>
      <div
        className="tnum"
        style={{ fontSize: 17, fontWeight: 700, marginTop: 4, color }}
      >
        {value}
      </div>
    </div>
  );
}
