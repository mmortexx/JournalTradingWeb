"use client";

import { useLang } from "@/lib/i18n";
import { FileDown, Dices, Skull, Building2, Trophy, Users, Ruler, Tags } from "lucide-react";

/**
 * ToolsGrid — rejilla de 8 funciones Pro (§ 03·b del HTML).
 * PDF, Monte Carlo, Risk of ruin, Modo Prop Firm, Track record,
 * Múltiples cuentas, MAE/MFE, Tags. Las marcadas PRO llevan un badge.
 */
export function ToolsGrid() {
  const { lang } = useLang();
  const es = lang === "es";
  const tools = [
    { i: FileDown, n: es ? "Exportación PDF" : "PDF export", d: es ? "Informes profesionales por cuenta, mes o setup" : "Pro reports per account, month or setup", pro: false },
    { i: Dices, n: es ? "Monte Carlo" : "Monte Carlo", d: es ? "Simula 10.000 trayectorias a partir de tus trades" : "Simulate 10,000 paths from your trades", pro: true },
    { i: Skull, n: es ? "Risk of ruin" : "Risk of ruin", d: es ? "Probabilidad de quebrar según tu riesgo por trade" : "Probability of ruin given your risk per trade", pro: true },
    { i: Building2, n: es ? "Modo Prop Firm" : "Prop firm mode", d: es ? "Reglas de drawdown diario y total configurables" : "Daily and total drawdown rules configurable", pro: true },
    { i: Trophy, n: es ? "Track record" : "Track record", d: es ? "Verifica tu consistencia para prop firms" : "Verify your consistency for prop firms", pro: true },
    { i: Users, n: es ? "Múltiples cuentas" : "Multi-account", d: es ? "Gestiona varias cuentas en paralelo" : "Manage multiple accounts in parallel", pro: false },
    { i: Ruler, n: "MAE / MFE", d: es ? "Mide cuánto se mueve a tu favor y en contra" : "Measure excursion in your favour and against", pro: false },
    { i: Tags, n: "Tags", d: es ? "Etiqueta y filtra tu operativa por criterios" : "Tag and filter your trading by criteria", pro: false },
  ];
  return (
    <section
      className="border-t border-b"
      style={{
        padding: "80px 24px",
        borderColor: "rgb(var(--divider) / 0.06)",
      }}
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="max-w-[680px] mb-10">
          <div className="inline-flex items-center gap-3 mb-5">
            <span
              className="tnum"
              style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}
            >
              § 03·b
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}
            >
              {es ? "HERRAMIENTAS PRO" : "PRO TOOLS"}
            </span>
          </div>
          <h2
            className="font-serif m-0"
            style={{
              fontSize: "clamp(1.95rem, 3.5vw, 3.05rem)",
              fontWeight: 400,
              letterSpacing: "-0.022em",
              lineHeight: 1.08,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            {es ? (
              <>
                Funciones que <span style={{ color: "rgb(var(--accent-base))" }}>no son decorativas</span>.
              </>
            ) : (
              <>
                Features that are <span style={{ color: "rgb(var(--accent-base))" }}>not decorative</span>.
              </>
            )}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((t) => {
            const Icon = t.i;
            return (
              <div
                key={t.n}
                className="relative"
                style={{
                  padding: 22,
                  borderRadius: 14,
                  border: "1px solid rgb(var(--divider) / 0.13)",
                  background: "color-mix(in oklab, var(--surface) 50%, transparent)",
                  backdropFilter: "blur(14px) saturate(1.3)",
                  WebkitBackdropFilter: "blur(14px) saturate(1.3)",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
              >
                {t.pro && (
                  <span
                    className="tnum"
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      padding: "3px 8px",
                      borderRadius: 100,
                      background: "color-mix(in oklab, rgb(var(--accent-base)) 18%, transparent)",
                      color: "rgb(var(--accent-base))",
                      border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 35%, transparent)",
                    }}
                  >
                    PRO
                  </span>
                )}
                <span
                  className="inline-grid place-items-center rounded-lg"
                  style={{
                    width: 36,
                    height: 36,
                    background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                    color: "rgb(var(--accent-base))",
                  }}
                >
                  <Icon size={18} aria-hidden />
                </span>
                <h3 className="mt-3 mb-1" style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
                  {t.n}
                </h3>
                <p className="m-0" style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>
                  {t.d}
                </p>
              </div>
            );
          })}
        </div>
        {/* Banda inferior: importación */}
        <div
          className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl"
          style={{
            border: "1px solid rgb(var(--divider) / 0.13)",
            background: "color-mix(in oklab, var(--surface) 40%, transparent)",
          }}
        >
          <div>
            <div
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
            >
              {es ? "Importa de cualquier bróker" : "Import from any broker"}
            </div>
            <div className="mt-1 font-serif" style={{ fontSize: 22, color: "var(--ink)" }}>
              {es ? "Tu operativa, en segundos." : "Your trading, in seconds."}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["IB", "MT4", "MT5", "NinjaTrader", "TradingView", "Binance", "Coinbase", "OANDA", "IG"].map((b) => (
              <span
                key={b}
                className="tnum"
                style={{
                  fontSize: 11,
                  padding: "5px 10px",
                  borderRadius: 100,
                  border: "1px solid rgb(var(--divider) / 0.13)",
                  color: "var(--ink-2)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
