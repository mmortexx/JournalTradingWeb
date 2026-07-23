"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getKpis, getPerf, getCal } from "@/lib/trading/fixtures";

/**
 * OverviewApp — sección `#overview` del HTML. Muestra la app con el
 * chrome de ventana (barra de título + tabs), los KPIs y la curva de
 * rendimiento + calendario, todo estático. Sin tabs interactivas (la
 * versión interactiva completa vive en /demo).
 *
 * Los datos vienen de `src/lib/trading/fixtures.ts`.
 */
export function OverviewApp() {
  const { lang } = useLang();
  const es = lang === "es";
  const kpis = getKpis();
  const perf = getPerf();
  const cal = getCal();

  return (
    <section
      id="overview"
      className="relative overflow-hidden"
      style={{ padding: "118px 40px 56px" }}
    >
      {/* Halo derecho superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 70% at 74% -12%, color-mix(in oklab, var(--ink) 6%, transparent), transparent 58%)",
        }}
      />
      {/* Halo accent derecho */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -160,
          right: -40,
          width: 680,
          height: 560,
          background:
            "radial-gradient(circle, color-mix(in oklab, rgb(var(--accent-base)) 13%, transparent), transparent 72%)",
          filter: "blur(64px)",
          opacity: 0.28,
          animation: "tj-glow 9s ease-in-out infinite",
        }}
      />
      {/* Viñeta inferior */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 120%, transparent, var(--bg) 78%)",
        }}
      />

      <div className="relative max-w-[1280px] mx-auto">
        {/* Cabecera de sección */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3.5 border-b" style={{ borderColor: "rgb(var(--divider) / 0.06)" }}>
          <div className="inline-flex items-center gap-3">
            <span
              className="tnum"
              style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}
            >
              § 01
            </span>
            <span aria-hidden style={{ width: 20, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}
            >
              {es ? "EL PRODUCTO EN VIVO" : "THE PRODUCT LIVE"}
            </span>
          </div>
          <div className="inline-flex items-center gap-3.5">
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-3)" }}
            >
              WINDOWS 10 · 11 — NATIVE
            </span>
            <span aria-hidden style={{ width: 1, height: 12, background: "rgb(var(--divider) / 0.13)" }} />
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block rounded-full"
                style={{ width: 5, height: 5, background: "rgb(var(--pnl-pos))", animation: "tj-glow 2.4s ease-in-out infinite" }}
              />
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-2)" }}
              >
                18:04:22
              </span>
            </span>
          </div>
        </div>

        {/* Grid 2 columnas */}
        <div className="relative mt-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-11 items-center">
          {/* Esquinas decorativas */}
          <span aria-hidden className="absolute -left-3.5 -top-4 w-3 h-3 border-l border-t" style={{ borderColor: "rgb(var(--divider) / 0.13)" }} />
          <span aria-hidden className="absolute -right-3.5 -top-4 w-3 h-3 border-r border-t" style={{ borderColor: "rgb(var(--divider) / 0.13)" }} />
          <span aria-hidden className="absolute -left-3.5 -bottom-4 w-3 h-3 border-l border-b" style={{ borderColor: "rgb(var(--divider) / 0.13)" }} />
          <span aria-hidden className="absolute -right-3.5 -bottom-4 w-3 h-3 border-r border-b" style={{ borderColor: "rgb(var(--divider) / 0.13)" }} />

          {/* Columna izquierda: copy + CTA */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-serif m-0"
              style={{
                fontSize: "clamp(2.4rem, 3.3vw, 3.9rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                textWrap: "balance",
              }}
            >
              {es ? (
                <>
                  Todo tu día de trading,
                  <br />
                  <span style={{ fontStyle: "italic", position: "relative" }}>
                    en una pantalla
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: "0.08em",
                        height: 2,
                        background: "rgb(var(--accent-base))",
                        opacity: 0.8,
                      }}
                    />
                  </span>
                  <span style={{ color: "var(--ink-3)" }}>.</span>
                </>
              ) : (
                <>
                  Your whole trading day,
                  <br />
                  <span style={{ fontStyle: "italic", position: "relative" }}>
                    on one screen
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: "0.08em",
                        height: 2,
                        background: "rgb(var(--accent-base))",
                        opacity: 0.8,
                      }}
                    />
                  </span>
                  <span style={{ color: "var(--ink-3)" }}>.</span>
                </>
              )}
            </motion.h2>
            <p
              className="mt-7 mb-0"
              style={{
                maxWidth: "33em",
                fontSize: "clamp(1.02rem, 1.35vw, 1.16rem)",
                lineHeight: 1.64,
                color: "var(--ink-2)",
              }}
            >
              {es
                ? "El diario que mide con el rigor de una mesa profesional: las métricas que de verdad importan, disciplina que te frena antes del error y tus datos —siempre— en tu máquina."
                : "The journal that measures with the rigour of a professional desk: the metrics that actually matter, discipline that brakes you before the error, and your data —always— on your machine."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/pricing"
                className="inline-flex items-center gap-2.5 rounded-[11px] relative overflow-hidden"
                style={{
                  height: 52,
                  padding: "0 26px",
                  background:
                    "linear-gradient(180deg, color-mix(in oklab, var(--ink) 88%, #fff), var(--ink))",
                  color: "var(--bg)",
                  fontSize: 15.5,
                  fontWeight: 500,
                  boxShadow:
                    "inset 0 1px 0 rgb(255 255 255 / 0.35), 0 10px 24px -10px color-mix(in oklab, rgb(var(--accent-base)) 45%, #000)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 34px -14px color-mix(in oklab, rgb(var(--accent-base)) 60%, #000)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgb(255 255 255 / 0.35), 0 10px 24px -10px color-mix(in oklab, rgb(var(--accent-base)) 45%, #000)";
                }}
              >
                {es ? "Comprar — desde 29 $" : "Buy — from $29"}
                <span aria-hidden>→</span>
              </a>
              <a
                href="/demo"
                className="inline-flex items-center gap-2.5 rounded-[11px]"
                style={{
                  height: 52,
                  padding: "0 24px",
                  border: "1px solid rgb(var(--divider) / 0.13)",
                  background: "transparent",
                  color: "var(--ink)",
                  fontSize: 15.5,
                  fontWeight: 500,
                  transition: "background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "color-mix(in oklab, var(--ink) 6%, transparent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span aria-hidden>▶</span>
                {es ? "Ver la demo" : "See the demo"}
              </a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-3.5 gap-y-2">
              {[
                "100% LOCAL",
                es ? "PAGO ÚNICO" : "ONE-TIME",
                "ES · EN",
                es ? "GARANTÍA 30 DÍAS" : "30-DAY GUARANTEE",
              ].map((label, i) => (
                <span key={label} className="flex items-center gap-3.5">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="hidden sm:inline-block"
                      style={{ width: 1, height: 11, background: "rgb(var(--divider) / 0.13)" }}
                    />
                  )}
                  <span
                    className="tnum"
                    style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)" }}
                  >
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Columna derecha: mockup de app */}
          <div className="relative">
            {/* Halo detrás del mockup */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                inset: "-30px -20px",
                background:
                  "radial-gradient(60% 60% at 62% 32%, color-mix(in oklab, rgb(var(--accent-base)) 12%, transparent), transparent 74%)",
                filter: "blur(44px)",
                opacity: 0.42,
                zIndex: 0,
              }}
            />
            {/* Float-card P&L */}
            <div
              className="absolute z-10 hidden md:block"
              style={{
                left: -64,
                top: 150,
                border: "1px solid rgb(var(--divider) / 0.13)",
                borderRadius: 12,
                background: "color-mix(in oklab, var(--surface) 94%, transparent)",
                backdropFilter: "blur(8px)",
                boxShadow: "var(--shadow, 0 1px 2px rgb(0 0 0 / 0.5), 0 44px 84px -30px rgb(0 0 0 / 0.78))",
                padding: "12px 14px",
                minWidth: 148,
                animation: "tj-float 6s ease-in-out infinite",
              }}
            >
              <div
                className="tnum"
                style={{ fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "P&L total · 6M" : "Total P&L · 6M"}
              </div>
              <div
                className="tnum"
                style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: kpis.pnl.color }}
              >
                {kpis.pnl.v}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="tnum" style={{ fontSize: 10, color: kpis.pnl.deltaColor }}>
                  {kpis.pnl.delta}
                </span>
                <svg width={46} height={14} viewBox="0 0 46 14" preserveAspectRatio="none" aria-hidden>
                  <path
                    d="M0,11 L9,9 L18,10 L27,5 L36,6 L46,2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                    style={{ color: kpis.pnl.color }}
                  />
                </svg>
              </div>
            </div>
            {/* Float-card Guardián activo */}
            <div
              className="absolute z-10 hidden md:flex items-center gap-2.5"
              style={{
                left: -56,
                bottom: 40,
                border: "1px solid rgb(var(--divider) / 0.13)",
                borderRadius: 12,
                background: "color-mix(in oklab, var(--surface) 94%, transparent)",
                backdropFilter: "blur(8px)",
                boxShadow: "var(--shadow, 0 1px 2px rgb(0 0 0 / 0.5), 0 44px 84px -30px rgb(0 0 0 / 0.78))",
                padding: "11px 13px",
                animation: "tj-float 6s ease-in-out infinite 1.4s",
              }}
            >
              <span
                className="inline-grid place-items-center"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  flex: "none",
                  background: "color-mix(in oklab, rgb(var(--accent-base)) 16%, transparent)",
                  color: "rgb(var(--accent-base))",
                }}
              >
                <ShieldCheck size={15} aria-hidden />
              </span>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.1 }}>
                  {es ? "Guardián activo" : "Guardian active"}
                </div>
                <div
                  className="tnum"
                  style={{ fontSize: 9.5, color: "var(--ink-3)", marginTop: 2 }}
                >
                  {es ? "Riesgo 1 % / operación" : "Risk 1% / trade"}
                </div>
              </div>
            </div>

            {/* Mockup de la ventana de la app */}
            <div
              className="relative z-[2] transition-transform"
              style={{ willChange: "transform" }}
            >
              <div
                className="relative rounded-[14px] overflow-hidden"
                style={{
                  background: "color-mix(in oklab, var(--surface) 78%, transparent)",
                  backdropFilter: "blur(22px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(22px) saturate(1.4)",
                  border: "1px solid rgb(var(--divider) / 0.13)",
                  boxShadow:
                    "inset 0 1px 0 rgb(255 255 255 / 0.18), 0 1px 2px rgb(0 0 0 / 0.5), 0 44px 84px -30px rgb(0 0 0 / 0.78), 0 0 90px -22px color-mix(in oklab, rgb(var(--accent-base)) 55%, transparent)",
                }}
              >
                {/* Titlebar */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    height: 40,
                    padding: "0 12px",
                    borderBottom: "1px solid rgb(var(--divider) / 0.06)",
                    background: "color-mix(in oklab, var(--surface-2) 72%, transparent)",
                    gap: 10,
                  }}
                >
                  <div className="flex items-center gap-2 flex-none">
                    <span
                      className="inline-grid place-items-center rounded-[5px]"
                      style={{
                        width: 18,
                        height: 18,
                        background: "linear-gradient(135deg, rgb(var(--accent-base)), rgb(var(--accent-hover)))",
                        boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.12)",
                      }}
                    >
                      <svg width={11} height={11} viewBox="0 0 10 10" aria-hidden>
                        <rect x={1} y={5.5} width={1.4} height={3} fill="#0d221a" opacity={0.9} />
                        <rect x={4.3} y={3} width={1.4} height={5.5} fill="#0d221a" opacity={0.9} />
                        <rect x={7.6} y={4} width={1.4} height={4.5} fill="#0d221a" opacity={0.9} />
                      </svg>
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                      Trading Journal
                    </span>
                    <span
                      className="tnum inline-flex items-center gap-1.5"
                      style={{
                        fontSize: 9.5,
                        letterSpacing: "0.04em",
                        padding: "3px 9px",
                        borderRadius: 100,
                        border: "1px solid rgb(var(--divider) / 0.13)",
                        color: "var(--ink-2)",
                        background: "color-mix(in oklab, var(--surface) 60%, transparent)",
                      }}
                    >
                      <svg width={9} height={9} viewBox="0 0 16 16" fill="none" stroke="rgb(var(--accent-base))" strokeWidth={1.6} aria-hidden>
                        <rect x={2} y={4} width={12} height={9} rx={1.5} />
                        <path d="M2 7h12" />
                      </svg>
                      DEMO · 10.000 $
                    </span>
                  </div>
                  <span className="tnum" style={{ fontSize: 10, color: "var(--ink-2)" }}>
                    UTC <span style={{ color: "var(--ink)" }}>--:--:--</span>
                  </span>
                  <div className="flex items-stretch h-full flex-none">
                    <span className="w-10 inline-grid place-items-center" style={{ color: "var(--ink-3)" }}>
                      <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
                        <line x1={0.5} y1={5} x2={9.5} y2={5} stroke="currentColor" strokeWidth={1} />
                      </svg>
                    </span>
                    <span className="w-10 inline-grid place-items-center" style={{ color: "var(--ink-3)" }}>
                      <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
                        <rect x={0.5} y={0.5} width={9} height={9} stroke="currentColor" strokeWidth={1} fill="none" />
                      </svg>
                    </span>
                    <span className="w-10 inline-grid place-items-center" style={{ color: "var(--ink-3)" }}>
                      <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
                        <line x1={0.5} y1={0.5} x2={9.5} y2={9.5} stroke="currentColor" strokeWidth={1} />
                        <line x1={9.5} y1={0.5} x2={0.5} y2={9.5} stroke="currentColor" strokeWidth={1} />
                      </svg>
                    </span>
                  </div>
                </div>
                {/* Tabs */}
                <div
                  className="flex items-stretch overflow-hidden"
                  style={{ height: 38, borderBottom: "1px solid rgb(var(--divider) / 0.06)", gap: 1, padding: "0 6px" }}
                >
                  {[
                    { l: es ? "Resumen" : "Summary", active: true },
                    { l: es ? "Operaciones" : "Trades", active: false },
                    { l: es ? "Analítica" : "Analytics", active: false },
                    { l: es ? "Diario" : "Journal", active: false },
                    { l: es ? "Playbook" : "Playbook", active: false },
                  ].map((t) => (
                    <span
                      key={t.l}
                      className="relative inline-flex items-center gap-1.5"
                      style={{
                        padding: "0 10px",
                        fontSize: 11.5,
                        fontWeight: t.active ? 600 : 400,
                        color: t.active ? "var(--ink)" : "var(--ink-3)",
                      }}
                    >
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" />
                      </svg>
                      {t.l}
                      {t.active && (
                        <span
                          style={{
                            position: "absolute",
                            left: 10,
                            right: 10,
                            bottom: 0,
                            height: 2,
                            borderRadius: 100,
                            background: "rgb(var(--accent-base))",
                          }}
                        />
                      )}
                    </span>
                  ))}
                </div>
                {/* Contenido */}
                <div style={{ padding: "14px 16px" }}>
                  <div
                    className="tnum"
                    style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
                  >
                    {es ? "Rendimiento" : "Performance"}
                  </div>
                  <div
                    className="font-serif"
                    style={{ marginTop: 3, fontSize: 19, color: "var(--ink)" }}
                  >
                    {es ? "Cómo va tu operativa" : "How your trading is going"}
                  </div>
                  {/* 4 KPIs */}
                  <div
                    className="mt-3 grid grid-cols-4 overflow-hidden"
                    style={{
                      border: "1px solid rgb(var(--divider) / 0.06)",
                      borderRadius: 11,
                      background: "color-mix(in oklab, var(--surface-2) 45%, transparent)",
                    }}
                  >
                    <Kpi label={es ? "P&L total" : "Total P&L"} value="+5.732,24 $" color="var(--pos)" />
                    <Kpi label="Win rate" value="50 %" color="var(--ink)" border />
                    <Kpi label="Expectancy" value="+28,66 $" color="var(--pos)" border />
                    <Kpi label="Profit factor" value="1,56" color="var(--ink)" border />
                  </div>
                  {/* Curva + calendario */}
                  <div className="mt-2.5 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-2.5">
                    <div
                      style={{
                        border: "1px solid rgb(var(--divider) / 0.06)",
                        borderRadius: 11,
                        padding: "12px 13px",
                        background: "color-mix(in oklab, var(--surface-2) 40%, transparent)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="tnum"
                          style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}
                        >
                          {es ? "Curva de rendimiento" : "Equity curve"}
                        </span>
                        <div className="flex gap-3">
                          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 10, color: "var(--ink-2)" }}>
                            <span style={{ width: 12, height: 2, background: "#e2b34c", borderRadius: 2 }} />
                            {es ? "Rendimiento" : "Performance"}
                          </span>
                          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 10, color: "var(--ink-2)" }}>
                            <span style={{ width: 12, height: 0, borderTop: "2px dashed rgb(var(--accent-base))" }} />
                            Balance
                          </span>
                        </div>
                      </div>
                      <svg viewBox="0 0 640 220" className="w-full h-auto block mt-2.5" aria-hidden>
                        <defs>
                          <linearGradient id="tjPerfFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#e2b34c" stopOpacity=".26" />
                            <stop offset="1" stopColor="#e2b34c" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {perf.grid.map((g, i) => (
                          <g key={i}>
                            <line x1={46} y1={g.y} x2={632} y2={g.y} stroke="rgb(var(--divider) / 0.06)" strokeWidth={1} />
                            <text x={40} y={g.y} dy={3} textAnchor="end" fill="var(--ink-3)" style={{ fontFamily: "var(--font-geist-mono)", fontSize: 8.5 }}>
                              {g.label}
                            </text>
                          </g>
                        ))}
                        <path d={perf.dd} fill="rgb(var(--pnl-neg) / 0.22)" />
                        <path d={perf.fill} fill="url(#tjPerfFill)" />
                        <path d={perf.dash} fill="none" stroke="rgb(var(--accent-base))" strokeWidth={1.4} strokeDasharray="5 4" opacity={0.85} />
                        <path d={perf.line} fill="none" stroke="#e2b34c" strokeWidth={1.8} strokeLinejoin="round" />
                        <circle cx={perf.endX} cy={perf.endY} r={7} fill="#e2b34c" opacity={0.16} />
                        <circle cx={perf.endX} cy={perf.endY} r={3.2} fill="#e2b34c" />
                      </svg>
                    </div>
                    <div
                      style={{
                        border: "1px solid rgb(var(--divider) / 0.06)",
                        borderRadius: 11,
                        padding: "12px 13px",
                        background: "color-mix(in oklab, var(--surface-2) 40%, transparent)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="tnum"
                          style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}
                        >
                          {es ? "Calendario" : "Calendar"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span style={{ color: "var(--ink-3)", cursor: "pointer" }}>‹</span>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)" }}>{cal.label}</span>
                          <span style={{ color: "var(--ink-3)", cursor: "pointer" }}>›</span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-7 gap-1">
                        {cal.cells.map((c, i) => {
                          const cellStyle = c.style
                            ? { ...parseInlineStyle(c.style), padding: "2px" }
                            : { padding: "2px" };
                          return (
                            <div key={i} style={cellStyle}>
                              <span className="tnum" style={{ fontSize: 7, opacity: 0.75 }}>{c.day}</span>
                              <span className="tnum" style={{ fontSize: 7, fontWeight: 600, lineHeight: 1 }}>{c.val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Status bar */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    height: 32,
                    padding: "0 14px",
                    borderTop: "1px solid rgb(var(--divider) / 0.06)",
                    background: "color-mix(in oklab, var(--surface-2) 66%, transparent)",
                    gap: 12,
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                      <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: "rgb(var(--accent-base))" }} />
                      {es ? "✓ Compilación de desarrollo" : "✓ Development build"}
                    </span>
                    <span className="tnum" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                      {es ? "Guardado automático en tu equipo" : "Auto-save on your machine"}
                    </span>
                  </div>
                  <span className="tnum" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                    v0.1.0
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-1.5">
                <span className="tnum" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                  {es ? "Vista Resumen · datos de muestra deterministas" : "Summary view · deterministic sample data"}
                </span>
                <a href="/demo" style={{ fontSize: 11, color: "rgb(var(--accent-base))" }}>
                  {es ? "Explorar la demo →" : "Explore the demo →"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  color,
  border,
}: {
  label: string;
  value: string;
  color: string;
  border?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderLeft: border ? "1px solid rgb(var(--divider) / 0.06)" : undefined,
      }}
    >
      <div
        className="tnum"
        style={{ fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}
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

/**
 * Parsea un string estilo CSS inline a un objeto JS compatible con el
 * `style` prop de React. Solo se usa para los strings generados por
 * `fixtures.ts` (background/borderRadius/aspectRatio/display/etc.).
 */
function parseInlineStyle(s: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of s.split(";")) {
    const [k, v] = decl.split(":");
    if (!k || !v) continue;
    const key = k.trim();
    const val = v.trim();
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = val;
  }
  return out as React.CSSProperties;
}
