"use client";

import { useLang } from "@/lib/i18n";
import { ShieldCheck, AlertTriangle, HandMetal, Timer } from "lucide-react";

/**
 * GuardianNew — sección `#guardian` del HTML. Disciplina que actúa:
 * mockup de comprobación previa + 3 features de cómo frena antes del
 * error.
 */
export function GuardianNew() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="guardian"
      className="relative overflow-hidden border-t"
      style={{ padding: "120px 24px 80px", borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 30%, color-mix(in oklab, rgb(var(--pnl-warn)) 8%, transparent), transparent 70%)",
        }}
      />
      <div className="relative max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Mockup tarjeta "Comprobación previa" */}
        <div
          className="relative"
          style={{
            padding: 20,
            borderRadius: 18,
            border: "1px solid rgb(var(--divider) / 0.13)",
            background: "color-mix(in oklab, var(--surface) 70%, transparent)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Comprobación previa · nueva operación" : "Pre-flight check · new trade"}
            </span>
            <span
              className="tnum inline-flex items-center gap-1.5"
              style={{
                fontSize: 10,
                padding: "3px 9px",
                borderRadius: 100,
                background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                color: "rgb(var(--accent-base))",
                border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 30%, transparent)",
              }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: 5, height: 5, background: "rgb(var(--accent-base))" }}
              />
              {es ? "EN VIVO" : "LIVE"}
            </span>
          </div>
          {/* Fila del trade */}
          <div
            className="rounded-[12px] p-3 mb-4"
            style={{
              background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
              border: "1px solid rgb(var(--divider) / 0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="tnum inline-block"
                style={{
                  padding: "4px 10px",
                  borderRadius: 100,
                  background: "color-mix(in oklab, rgb(var(--pnl-pos)) 14%, transparent)",
                  color: "rgb(var(--pnl-pos))",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                NQ · LONG
              </span>
              <span className="tnum" style={{ fontSize: 12, color: "var(--ink-2)" }}>4 {es ? "contratos" : "contracts"}</span>
              <span className="tnum ml-auto" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>28 {es ? "pts" : "pts"}</span>
            </div>
          </div>
          {/* Checklist */}
          <div className="space-y-2 mb-4">
            {[
              { ok: true, l: es ? "Setup Apto: ruptura NY" : "Setup valid: NY break" },
              { ok: true, l: es ? "R:R ≥ 1,5" : "R:R ≥ 1.5" },
              { ok: false, l: es ? "Riesgo 2,4 % — supera tu límite de 1 %" : "Risk 2.4% — over your 1% limit" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="inline-grid place-items-center rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    background: c.ok
                      ? "color-mix(in oklab, rgb(var(--pnl-pos)) 18%, transparent)"
                      : "color-mix(in oklab, rgb(var(--pnl-neg)) 18%, transparent)",
                    color: c.ok ? "rgb(var(--pnl-pos))" : "rgb(var(--pnl-neg))",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{c.ok ? "✓" : "✕"}</span>
                </span>
                <span style={{ fontSize: 13, color: c.ok ? "var(--ink-2)" : "rgb(var(--pnl-neg))", fontWeight: c.ok ? 400 : 600 }}>{c.l}</span>
              </div>
            ))}
          </div>
          {/* Aviso bloqueo */}
          <div
            className="rounded-[10px] p-3 mb-3"
            style={{
              background: "color-mix(in oklab, rgb(var(--pnl-neg)) 10%, transparent)",
              border: "1px solid color-mix(in oklab, rgb(var(--pnl-neg)) 28%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} style={{ color: "rgb(var(--pnl-neg))" }} />
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgb(var(--pnl-neg))", fontWeight: 700 }}
              >
                {es ? "Operación bloqueada" : "Trade blocked"}
              </span>
            </div>
            <p className="m-0" style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-2)" }}>
              {es
                ? "Reduce el tamaño a 2 contratos para mantener el riesgo dentro de tu límite."
                : "Reduce size to 2 contracts to keep risk within your limit."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="tnum flex-1"
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 100,
                background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                color: "rgb(var(--accent-base))",
                border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 35%, transparent)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {es ? "Ajustar a 2 contratos" : "Adjust to 2 contracts"}
            </button>
            <button
              className="tnum flex-1"
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 100,
                background: "transparent",
                color: "var(--ink-2)",
                border: "1px solid rgb(var(--divider) / 0.13)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {es ? "Anular" : "Cancel"}
            </button>
          </div>
        </div>

        {/* Columna derecha: copy + 3 features */}
        <div>
          <div className="inline-flex items-center gap-3 mb-5">
            <span
              className="tnum"
              style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}
            >
              § 05
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}
            >
              {es ? "DISCIPLINA" : "DISCIPLINE"}
            </span>
          </div>
          <h2
            className="font-serif m-0"
            style={{
              fontSize: "clamp(2rem, 3.6vw, 3rem)",
              fontWeight: 400,
              letterSpacing: "-0.022em",
              lineHeight: 1.08,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            {es ? (
              <>
                Disciplina que <span style={{ color: "rgb(var(--accent-base))" }}>actúa</span>,<br />
                no que sermonea.
              </>
            ) : (
              <>
                Discipline that <span style={{ color: "rgb(var(--accent-base))" }}>acts</span>,<br />
                not lectures.
              </>
            )}
          </h2>
          <p
            className="mt-5 mb-8"
            style={{
              fontSize: "clamp(1rem, 1.3vw, 1.1rem)",
              lineHeight: 1.62,
              color: "var(--ink-2)",
              maxWidth: "36em",
            }}
          >
            {es
              ? "El Guardián no te dice qué hacer. Te bloquea cuando rompes tus propias reglas."
              : "The Guardian doesn't tell you what to do. It blocks you when you break your own rules."}
          </p>
          <ul className="m-0 p-0 list-none space-y-4">
            {[
              { i: ShieldCheck, t: es ? "Frena antes del error" : "Brakes before the error", d: es ? "Bloquea tamaños que excedan tu riesgo máximo por operación." : "Blocks sizes that exceed your max per-trade risk." },
              { i: HandMetal, t: es ? "Te obliga a respetar el plan" : "Forces you to respect the plan", d: es ? "Límites de drawdown diario y total configurables." : "Daily and total drawdown limits configurable." },
              { i: Timer, t: es ? "Audita tus excepciones" : "Audits your exceptions", d: es ? "Cada override queda registrado con motivo y resultado." : "Every override is logged with reason and outcome." },
            ].map((f) => {
              const Icon = f.i;
              return (
                <li key={f.t} className="flex items-start gap-3">
                  <span
                    className="inline-grid place-items-center rounded-lg flex-none"
                    style={{
                      width: 36,
                      height: 36,
                      background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                      color: "rgb(var(--accent-base))",
                    }}
                  >
                    <Icon size={18} aria-hidden />
                  </span>
                  <div>
                    <h3 className="m-0" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{f.t}</h3>
                    <p className="m-0 mt-1" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-2)" }}>{f.d}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
