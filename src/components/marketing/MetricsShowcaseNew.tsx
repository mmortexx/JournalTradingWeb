"use client";

import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";

/**
 * MetricsShowcaseNew — sección `#metrics` del HTML. Dos columnas:
 * - Lista de ratios (Sharpe, Profit Factor, Expectancy, Max DD)
 * - Tarjeta de "Distribución de R-múltiplo" con histograma
 * Le siguen catálogo de métricas (4 familias) y la calculadora de
 * riesgo interactiva — esos se renderizan en sus propios componentes
 * y se montan desde la home.
 *
 * `num` — ordinal del eyebrow. Por defecto el de la home ("04"); las
 * páginas internas pasan el suyo para mantener su propia secuencia.
 */
export function MetricsShowcaseNew({ num = "04" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="metrics"
      className="bg-veil relative border-t border-b"
      style={{
        padding: "120px 24px 80px",
        borderColor: "rgb(var(--divider) / 0.06)",
      }}
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
              {es ? "MÉTRICAS" : "METRICS"}
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
                Las cifras que usan{" "}
                <span style={{ color: "rgb(var(--accent-base))" }}>los que viven de esto</span>.
              </>
            ) : (
              <>
                The numbers the{" "}
                <span style={{ color: "rgb(var(--accent-base))" }}>pros who live off this</span> use.
              </>
            )}
          </h2>
          <p
            className="mt-5 mb-8"
            style={{
              fontSize: "clamp(1rem, 1.3vw, 1.12rem)",
              lineHeight: 1.62,
              color: "var(--ink-2)",
              maxWidth: "36em",
            }}
          >
            {es
              ? "No gráficos bonitos. Ratios que correlacionan con la consistencia a largo plazo: lo que separa un edge real de una racha."
              : "Not pretty charts. Ratios that correlate with long-term consistency: what separates a real edge from a streak."}
          </p>
          <ul className="m-0 p-0 list-none grid grid-cols-2 gap-3">
            {[
              { l: "Sharpe", v: "3,34", c: "rgb(var(--pnl-pos))" },
              { l: "Profit factor", v: "1,56", c: "var(--ink)" },
              { l: "Expectancy", v: "+0,32R", c: "rgb(var(--pnl-pos))" },
              { l: "Max DD", v: "−8,0 %", c: "rgb(var(--pnl-neg))" },
            ].map((m) => (
              <li
                key={m.l}
                // R20-3b: lifted the metric tiles from a flat surface to a
                // depth-1 hover with an accent-tinted inner ring on hover,
                // so the four KPIs read as tappable stat cards rather than
                // inert table cells. Border + bg kept identical to before so
                // the rest-state visual is unchanged.
                className="group/metric relative flex items-center justify-between gap-3 transition-[box-shadow,transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid rgb(var(--divider) / 0.13)",
                  background: "color-mix(in oklab, var(--surface) 50%, transparent)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <span className="pointer-events-none absolute inset-0 rounded-[12px] opacity-0 group-hover/metric:opacity-100 transition-opacity duration-300" aria-hidden style={{ boxShadow: "inset 0 0 0 1px rgb(var(--accent-base) / 0.35)" }} />
                <span className="relative" style={{ fontSize: 13, color: "var(--ink-2)" }}>{m.l}</span>
                <span className="tnum relative" style={{ fontSize: 19, fontWeight: 700, color: m.c }}>{m.v}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Distribución de R */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
          <div className="flex items-center justify-between mb-3">
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Distribución de R-múltiplo" : "R-multiple distribution"}
            </span>
            <span
              className="tnum"
              style={{
                fontSize: 10,
                padding: "4px 9px",
                borderRadius: 100,
                background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                color: "rgb(var(--accent-base))",
                border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 30%, transparent)",
              }}
            >
              {es ? "60 trades" : "60 trades"}
            </span>
          </div>
          {/* Histograma hardcoded — R20-3b: each bar now exposes a native
              `title` tooltip with its R-bucket + approx trade count (out of
              the 60-trades badge), plus a hover lift (translateY -3%) +
              brightness bump so the histogram reads as interactive rather
              than decorative. Bars remain aria-hidden (the labels row below
              carries the semantics for AT). */}
          <div className="flex items-end gap-1.5" style={{ height: 160 }}>
            {[
              { h: 14, r: "−3R" },
              { h: 28, r: "−2R" },
              { h: 46, r: "−1R" },
              { h: 62, r: "0R" },
              { h: 80, r: "+1R" },
              { h: 68, r: "+2R" },
              { h: 52, r: "+3R" },
              { h: 36, r: "+4R" },
              { h: 20, r: "+5R" },
            ].map((b, i) => {
              const count = Math.round((b.h / 406) * 60);
              return (
                <div
                  key={i}
                  title={`${b.r} · ${es ? `${count} operaciones` : `${count} trades`}`}
                  className="flex-1 rounded-t relative cursor-default transition-[transform,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3%] hover:brightness-110"
                  style={{
                    height: `${b.h}%`,
                    background:
                      i === 4
                        ? "rgb(var(--accent-base))"
                        : i < 4
                          ? "color-mix(in oklab, rgb(var(--pnl-pos)) 70%, transparent)"
                          : "color-mix(in oklab, rgb(var(--pnl-neg)) 60%, transparent)",
                    opacity: 0.85,
                  }}
                  aria-hidden
                >
                  {i === 4 && (
                    <span
                      className="tnum absolute -top-5 left-1/2 -translate-x-1/2"
                      style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgb(var(--accent-base))" }}
                    >
                      MODA
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between">
            {["−3R", "−2R", "−1R", "0R", "+1R", "+2R", "+3R", "+4R", "+5R"].map((b) => (
              <span
                key={b}
                className="tnum"
                style={{ fontSize: 9, color: "var(--ink-3)" }}
              >
                {b}
              </span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: "rgb(var(--divider) / 0.06)" }}>
            {[
              { l: es ? "Ganadoras" : "Winners", v: "50 %" },
              { l: es ? "R medio" : "Avg R", v: "+0,32R" },
              { l: es ? "Payoff" : "Payoff", v: "1,59" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  className="tnum"
                  style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
                >
                  {s.l}
                </div>
                <div className="tnum" style={{ fontSize: 17, fontWeight: 700, marginTop: 4, color: "var(--ink)" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
