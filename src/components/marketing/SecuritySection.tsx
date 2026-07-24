"use client";

import { useLang } from "@/lib/i18n";
import { Database, FileLock2, KeyRound, Check, X } from "lucide-react";

/**
 * SecuritySection — sección `#security` del HTML. Local-first:
 * 3 tarjetas (100 % en local, archivo .sqlite, export/import)
 * + tabla comparativa "Diario en la nube vs Trading Journal".
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
      className="section border-t border-[rgb(var(--divider)/0.06)]"
    >
      <div className="max-w-[1240px] mx-auto px-5 md:px-8">
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
                style={{
                  padding: 24,
                  borderRadius: 18,
                  border: "1px solid rgb(var(--divider) / 0.13)",
                  background: "color-mix(in oklab, var(--surface) 55%, transparent)",
                  backdropFilter: "blur(20px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                }}
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
        {/* Tabla comparativa */}
        <div
          className="overflow-hidden"
          style={{
            border: "1px solid rgb(var(--divider) / 0.13)",
            borderRadius: 16,
            background: "color-mix(in oklab, var(--surface) 60%, transparent)",
            backdropFilter: "blur(16px) saturate(1.4)",
            WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          }}
        >
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
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgb(var(--accent-base))", fontWeight: 600, boxShadow: "inset 2px 0 0 rgb(var(--accent-base) / 0.30)" }}
            >
              Trading Journal
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
                className="flex items-center gap-2"
                style={{ fontSize: 13, color: "var(--ink)", boxShadow: "inset 2px 0 0 rgb(var(--accent-base) / 0.30)" }}
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
      </div>
    </section>
  );
}
