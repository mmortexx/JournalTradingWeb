"use client";

import { useLang } from "@/lib/i18n";
import { Database, FileLock2, KeyRound, Check, X } from "lucide-react";

/**
 * SecuritySection — sección `#security` del HTML. Local-first:
 * 3 tarjetas (100 % en local, archivo .sqlite, export/import)
 * + tabla comparativa "Diario en la nube vs CountPips".
 *
 * `num` — ordinal del eyebrow. Por defecto el de la home ("06"); las
 * páginas internas pasan el suyo para mantener su propia secuencia.
 */
export function SecuritySection({ num = "06" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const cards = [
    { i: Database, t: es ? "100 % en local" : "100% local", d: es ? "Todo vive en tu disco. Ni telemetría, ni cuentas, ni servidores." : "Everything lives on your disk. No telemetry, no accounts, no servers." },
    { i: FileLock2, t: es ? "Un solo archivo" : "One single file", d: es ? "Una base de datos SQLite que se abre, se copia y se respalda como un archivo cualquiera." : "One SQLite database you can open, copy and back up like any file." },
    { i: KeyRound, t: es ? "Export e import" : "Export & import", d: es ? "CSV, JSON y PDF. Sin perder el formato, sin bloqueos por nubes." : "CSV, JSON and PDF. Without losing format, without cloud lock-in." },
  ];
  const compare = [
    { l: es ? "Dónde viven los datos" : "Where data lives", tj: es ? "Tu disco" : "Your disk", cloud: es ? "Servidores del proveedor" : "Vendor servers" },
    { l: es ? "Modelo de pago" : "Payment model", tj: es ? "Pago único" : "One-time payment", cloud: es ? "Suscripción mensual" : "Monthly subscription" },
    { l: es ? "Funciona sin internet" : "Works offline", tj: true, cloud: false },
    { l: es ? "Cifrado en reposo" : "Encrypted at rest", tj: true, cloud: false },
    { l: es ? "Bloqueo por proveedor" : "Vendor lock-in", tj: false, cloud: true },
  ];
  return (
    <section
      id="security"
      // R27-1b — `bg-veil` added: this section had NO background
      // backing at all (just `border-t`). The eye WebGL (bright
      // red/green fibers in light theme) was showing through the
      // entire section, washing out the "Tus datos no salen de tu
      // equipo. Nunca." heading + body copy + the TJ/cloud comparison
      // rows. `bg-veil` (82 % bg in light / 74 % in dark) occludes
      // the eye; the `border-t` top hairline is preserved.
      className="section border-t border-[rgb(var(--divider)/0.06)] bg-veil scroll-mt-24"
    >
      <div className="tj-container" style={{ maxWidth: 1240 }}>
        <div className="max-w-[760px] mx-auto text-center mb-12">
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
              {es ? "SEGURIDAD" : "SECURITY"}
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
                Tus datos <span style={{ color: "rgb(var(--accent-base))" }}>no salen</span> de tu equipo. Nunca.
              </>
            ) : (
              <>
                Your data <span style={{ color: "rgb(var(--accent-base))" }}>never leaves</span> your machine.
              </>
            )}
          </h2>
          <p
            className="mt-5"
            style={{
              fontSize: "clamp(1rem, 1.3vw, 1.1rem)",
              lineHeight: 1.62,
              color: "var(--ink-2)",
              maxWidth: "38em",
              margin: "20px auto 0",
            }}
          >
            {es
              ? "Una app nativa de Windows que escribe una base de datos SQLite en tu disco. Eso es todo. Ni más ni menos."
              : "A native Windows app that writes a SQLite database to your disk. That's it. Nothing more, nothing less."}
          </p>
        </div>
        {/* 3 tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {cards.map((c) => {
            const Icon = c.i;
            return (
              <div
                key={c.t}
                // T3c — swap a `.tj-paper`: papel translúcido cálido. El icon
                // chip + título + descripción conservan su jerarquía; el
                // atlas se filtra por los bordes.
                className="tj-paper rounded-[2px] border border-[rgb(var(--divider)/0.13)] p-5 sm:p-6"
              >
                <span
                  className="w-10 h-10 rounded-lg bg-[rgb(var(--accent-base)/0.06)] border border-[rgb(var(--accent-base)/0.15)] shadow-[inset_0_1px_0_rgb(var(--divider)/0.08)] inline-grid place-items-center text-[rgb(var(--accent-base))]"
                >
                  <Icon size={18} aria-hidden />
                </span>
                <h3 className="mt-3 mb-1 font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                  {c.t}
                </h3>
                <p className="m-0" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-2)" }}>
                  {c.d}
                </p>
              </div>
            );
          })}
        </div>
        {/* Tabla comparativa — mobile: horizontal scroll inside the card.
            The 3-column grid (label · CountPips · cloud) is readable
            without scroll on md+ but on narrow phones (≤390px) the cells
            compress to the point of wrapping awkwardly. We keep the card's
            rounded clip via an outer wrapper and let an inner `overflow-x-auto`
            pane scroll horizontally with a min-width of 480px so labels +
            values keep their natural rhythm. A subtle right-edge gradient
            fade (md:hidden) signals "more content this way" on touch. */}
        <div
          // T3c — swap a `.tj-paper-dense`: la tabla comparativa tiene
          // 5 filas de texto pequeño + cabecera; el 86 % de opacidad
          // mantiene AA en los textos `--ink-2`/`--ink-3` y deja que el
          // atlas se filtre por los bordes sin competir con la tabla.
          className="tj-paper-dense relative overflow-hidden rounded-[2px] border border-[rgb(var(--divider)/0.13)]"
        >
          <div className="relative overflow-x-auto">
            <div className="min-w-[480px]">
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1.4fr 1.4fr 1.4fr",
              padding: "12px 18px",
              borderBottom: "1px solid rgb(var(--divider) / 0.06)",
              background: "color-mix(in oklab, var(--surface-2) 40%, transparent)",
            }}
          >
            <span
              className="tnum"
              style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              &nbsp;
            </span>
            <span
              className="tnum border-l-2 border-[rgb(var(--accent-base)/0.30)] pl-2"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgb(var(--accent-base))", fontWeight: 600 }}
            >
              CountPips
            </span>
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Diario en la nube" : "Cloud-based journal"}
            </span>
          </div>
          {compare.map((row, i) => (
            <div
              key={row.l}
              className="grid"
              style={{
                gridTemplateColumns: "1.4fr 1.4fr 1.4fr",
                padding: "14px 18px",
                borderBottom: i < compare.length - 1 ? "1px solid rgb(var(--divider) / 0.06)" : undefined,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{row.l}</span>
              <span
                className="flex items-center gap-2 border-l-2 border-[rgb(var(--accent-base)/0.30)] pl-2"
                style={{ fontSize: 13, color: "var(--ink)" }}
              >
                {typeof row.tj === "boolean" ? (
                  row.tj ? (
                    <span className="inline-flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: "rgb(var(--pnl-pos) / 0.15)" }}>
                      <Check size={12} style={{ color: "rgb(var(--pnl-pos))" }} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: "rgb(var(--pnl-neg) / 0.15)" }}>
                      <X size={12} style={{ color: "rgb(var(--pnl-neg))" }} />
                    </span>
                  )
                ) : (
                  row.tj
                )}
              </span>
              <span
                className="flex items-center gap-2"
                style={{ fontSize: 13, color: "var(--ink-2)" }}
              >
                {typeof row.cloud === "boolean" ? (
                  row.cloud ? (
                    <span className="inline-flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: "rgb(var(--pnl-neg) / 0.15)" }}>
                      <X size={12} style={{ color: "rgb(var(--pnl-neg))" }} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: "rgb(var(--pnl-pos) / 0.15)" }}>
                      <Check size={12} style={{ color: "rgb(var(--pnl-pos))" }} />
                    </span>
                  )
                ) : (
                  row.cloud
                )}
              </span>
            </div>
          ))}
            </div>
            {/* Mobile-only right-edge gradient fade — signals "swipe for more". */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 md:hidden"
              style={{
                background: "linear-gradient(to left, rgb(var(--bg) / 0.92), transparent)",
              }}
            />
          </div>
          {/* Mobile-only scroll hint. */}
          <div className="md:hidden py-2 px-4 text-[11px] uppercase tracking-[0.14em] text-tertiary font-semibold text-center">
            <span aria-hidden>←</span>{" "}{es ? "Desliza para comparar" : "Swipe to compare"}{" "}<span aria-hidden>→</span>
          </div>
        </div>
      </div>
    </section>
  );
}
