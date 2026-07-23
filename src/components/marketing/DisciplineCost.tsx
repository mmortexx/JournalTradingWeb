"use client";

import { useLang } from "@/lib/i18n";

/**
 * DisciplineCost — sección § 05·b del HTML. Lo que la indisciplina
 * cuesta: tabla de expectancy (en plan / fuera de plan) + factura
 * detallada de indisciplina.
 *
 * `num` — ordinal del eyebrow. Por defecto el de la home ("05·b"); las
 * páginas internas pasan el suyo para mantener su propia secuencia.
 */
export function DisciplineCost({ num = "05·b" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      className="border-t"
      style={{ padding: "100px 24px", borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
              {es ? "COSTE REAL" : "REAL COST"}
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
                Lo que tu <span style={{ color: "rgb(var(--accent-base))" }}>indisciplina</span> te cuesta.
              </>
            ) : (
              <>
                What your <span style={{ color: "rgb(var(--accent-base))" }}>indiscipline</span> costs you.
              </>
            )}
          </h2>
          <p
            className="mt-5 mb-7"
            style={{
              fontSize: "clamp(1rem, 1.3vw, 1.1rem)",
              lineHeight: 1.62,
              color: "var(--ink-2)",
              maxWidth: "36em",
            }}
          >
            {es
              ? "Cuando operas en plan ganas. Cuando lo rompes, pierdes. El gap entre ambas cosas es lo que te está costando el dinero."
              : "When you trade the plan, you earn. When you break it, you lose. The gap between the two is what costs you money."}
          </p>
          {/* Tabla expectancy */}
          <div
            className="rounded-[14px] overflow-hidden"
            style={{
              border: "1px solid rgb(var(--divider) / 0.13)",
              background: "color-mix(in oklab, var(--surface) 50%, transparent)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <div className="grid grid-cols-3 text-sm" style={{ padding: "10px 14px", borderBottom: "1px solid rgb(var(--divider) / 0.06)", color: "var(--ink-3)" }}>
              <span className="tnum" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>{es ? "Modo" : "Mode"}</span>
              <span className="tnum text-right" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>{es ? "Operaciones" : "Trades"}</span>
              <span className="tnum text-right" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>{es ? "Expectancy" : "Expectancy"}</span>
            </div>
            {[
              { l: es ? "En plan" : "In plan", n: 36, v: "+29,73 $", c: "rgb(var(--pnl-pos))" },
              { l: es ? "Fuera de plan" : "Off plan", n: 24, v: "−38,47 $", c: "rgb(var(--pnl-neg))" },
              { l: es ? "Gap" : "Gap", n: "—", v: "−68,20 $", c: "rgb(var(--pnl-neg))", highlight: true },
            ].map((row, i) => (
              <div
                key={row.l}
                className="grid grid-cols-3"
                style={{
                  padding: "12px 14px",
                  borderBottom: i < 2 ? "1px solid rgb(var(--divider) / 0.06)" : undefined,
                  background: row.highlight ? "color-mix(in oklab, rgb(var(--pnl-neg)) 6%, transparent)" : undefined,
                }}
              >
                <span style={{ fontSize: 13.5, color: "var(--ink)" }}>{row.l}</span>
                <span className="tnum text-right" style={{ fontSize: 13.5, color: "var(--ink-2)" }}>{row.n}</span>
                <span className="tnum text-right" style={{ fontSize: 14, fontWeight: 700, color: row.c }}>{row.v}</span>
              </div>
            ))}
          </div>
          <p className="mt-3" style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
            {es
              ? "Expectancy = promedio ganado por operación. El gap es la diferencia: lo que dejas de ganar por romper tus reglas."
              : "Expectancy = average earned per trade. The gap is the difference: what you leave on the table by breaking your rules."}
          </p>
        </div>

        {/* Mockup factura */}
        <div
          className="relative"
          style={{
            padding: 22,
            borderRadius: 18,
            border: "1px solid rgb(var(--divider) / 0.13)",
            background: "color-mix(in oklab, var(--surface) 70%, transparent)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Factura de indisciplina · julio 2026" : "Indiscipline invoice · July 2026"}
            </span>
            <span
              className="tnum"
              style={{
                fontSize: 10,
                padding: "3px 9px",
                borderRadius: 100,
                background: "rgb(var(--pnl-neg) / 0.14)",
                color: "rgb(var(--pnl-neg))",
                border: "1px solid rgb(var(--pnl-neg) / 0.28)",
              }}
            >
              #IND-2026-07
            </span>
          </div>
          <ul className="m-0 p-0 list-none space-y-2.5 mb-4">
            {[
              { l: es ? "Operar fuera de horario" : "Trading off-hours", pct: 32 },
              { l: es ? "Tamaño excesivo" : "Oversize", pct: 27 },
              { l: es ? "Sin stop loss" : "No stop loss", pct: 18 },
              { l: es ? "Perseguir el precio" : "Chasing price", pct: 14 },
              { l: es ? "Mover stop a mano" : "Manually moving stop", pct: 9 },
            ].map((row) => (
              <li key={row.l}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>{row.l}</span>
                  <span className="tnum" style={{ fontSize: 12, color: "var(--ink-2)" }}>{row.pct} %</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgb(var(--divider) / 0.13)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.pct * 2.5}%`,
                      background: "rgb(var(--pnl-neg))",
                      opacity: 0.75,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgb(var(--divider) / 0.06)" }}>
            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{es ? "Total del mes" : "Month total"}</span>
            <span
              className="tnum font-serif"
              style={{ fontSize: 28, fontWeight: 400, color: "rgb(var(--pnl-neg))" }}
            >
              −577,10 $
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
