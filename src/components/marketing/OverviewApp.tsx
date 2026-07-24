"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Play } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getKpis, getPerf, getCal } from "@/lib/trading/fixtures";
import { WindowFrame } from "@/components/tj/WindowFrame";
import { FeatureImage } from "@/components/tj/FeatureImage";
import { asset } from "@/lib/asset";

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
      className="section relative overflow-hidden"
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

      <div className="relative max-w-[1280px] mx-auto px-5 md:px-8">
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
                // R21-3a — mobile min dropped 2.4rem -> 2rem so the
                // forced first line "Todo tu día de trading," (≈22 chars)
                // fits inside the 327px mobile content box without
                // clipping. The vw scale (3.3vw) is preserved so the
                // type still grows to 3.9rem on wide viewports.
                fontSize: "clamp(2rem, 3.3vw, 3.9rem)",
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
                        // R26-2c — `0.08em` → `-0.12em`: at the prior
                        // `0.08em` the bar sat inside the descender zone
                        // (between baseline and the "p" tip in "pantalla")
                        // and visually crossed the descender stroke —
                        // reading as a strikethrough on the "p" rather
                        // than an underline. `-0.12em` pushes the bar's
                        // top edge ~2px below the descender tips at the
                        // mobile min (32px) and ~5.5px at the desktop
                        // max (62.4px), so the accent stroke reads as a
                        // clean marker rule under the italic phrase at
                        // every breakpoint.
                        bottom: "-0.12em",
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
                        bottom: "-0.12em",
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
              className="mt-7 mb-0 break-words"
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
            {/* R26-2c — CTAs ported to match Hero EXACTLY: `<Link>`
                (was `<a>`, which forced a full page reload on a Next
                route), `rounded-full h-[54px]` (was `rounded-[11px]
                h-[52px]`), `text-[15px] font-semibold` (was 15.5px /
                font-medium), and lucide `ArrowRight` / `Play` icons (were
                unicode `→` / `▶`, which rendered soft at non-integer
                sizes). The pill + lucide + Link pattern now reads as a
                single coordinated CTA pair with the Hero. The hover
                shadow layers the same 4px accent halo as the Hero so the
                two sections' CTAs share the "lift + accent ring + shadow"
                hover state. */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/pricing"
                className="tj-cta-sheen inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2.5 rounded-full h-[54px] px-7 bg-[rgb(var(--accent-base))] text-[#06130d] text-[15px] font-semibold shadow-[0_18px_46px_-15px_rgb(var(--accent-base)/0.7)] ring-1 ring-inset ring-[rgb(var(--accent-base)/0.40)] transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-[1.08] hover:shadow-[0_0_0_4px_rgb(var(--accent-base)/0.12),0_22px_54px_-15px_rgb(var(--accent-base)/0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {es ? "Comprar — desde 29 $" : "Buy — from $29"}
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/demo"
                className="liquid-glass inline-flex w-full sm:w-auto justify-center sm:justify-start items-center gap-2.5 rounded-full h-[54px] px-[26px] border border-[rgb(var(--divider)/0.13)] text-[var(--ink)] text-[15px] font-semibold transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--accent-base)/0.35)] hover:bg-[rgb(var(--divider)/0.05)] hover:shadow-[0_0_0_4px_rgb(var(--accent-base)/0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <Play size={15} fill="currentColor" aria-hidden />
                {es ? "Ver la demo" : "See the demo"}
              </Link>
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
              // R26-2c — `hidden md:block` → `hidden lg:block`: the
              // grid is `grid-cols-1 lg:grid-cols-[1.1fr_1fr]`, so at
              // md (768–1023px) the layout is still 1-col and the
              // float-card's `left: -64` was pushing it off-screen to
              // the left of the single column. Showing the cards only
              // at lg+ (where the 2-col grid is active and the right
              // column has room for them) keeps them on-canvas.
              className="absolute z-10 hidden lg:block"
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
              className="absolute z-10 hidden lg:flex items-center gap-2.5"
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
                  // Inset accent ring + top specular highlight turn the
                  // flat tinted square into a machined shield badge —
                  // reads as "protected" rather than just "greenish
                  // square". Both layers are theme-agnostic (the ring
                  // is accent-tinted, the highlight is white-at-8%).
                  boxShadow:
                    "inset 0 0 0 1px rgb(var(--accent-base) / 0.30), inset 0 1px 0 rgb(255 255 255 / 0.08)",
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

            {/* Mockup de la ventana de la app — USA LA CAPTURA REAL
                (app-resumen.webp) dentro de un WindowFrame, en vez de
                un mockup hecho a mano que no coincidía con la app real. */}
            {/* R26-2c — `duration-300 ease-out hover:-translate-y-1` added:
                the wrapper already declared `transition-transform` +
                `willChange: transform` (a hover transform was obviously
                intended) but no transform was ever applied, so the
                declarations were inert. A 1px lift on hover gives the
                premium "the screenshot responds to my cursor" feel
                without competing with the float-cards' own `tj-float`
                animation (different transform axis + slower 300ms ease). */}
            <div className="relative z-[2] transition-transform duration-300 ease-out hover:-translate-y-1" style={{ willChange: "transform" }}>
              <WindowFrame caption="Trading Journal — Resumen">
                <FeatureImage
                  src={asset("/img/app-resumen.webp")}
                  alt={es
                    ? "Pantalla de Resumen de Trading Journal: curva de rendimiento, KPIs y calendario P&L"
                    : "Trading Journal Overview screen: performance curve, KPIs and P&L calendar"}
                  fit="contain"
                  className="absolute inset-0 h-full w-full"
                  overlay={0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </WindowFrame>
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-1.5">
                <span className="tnum" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                  {es ? "Vista Resumen · la app real" : "Summary view · the real app"}
                </span>
                <a href={asset("/demo")} style={{ fontSize: 11, color: "rgb(var(--accent-base))" }}>
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
}: {
  label: string;
  value: string;
  color: string;
  // `border` prop removed R21-3a — dividers are now handled by the
  // grid container's 1px gap + background bleed-through, which works
  // cleanly in both the 2-col mobile and 4-col desktop layouts (the
  // old per-tile borderLeft produced a phantom vertical hairline at
  // the start of row 2 when the grid dropped to 2 cols on mobile).
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "color-mix(in oklab, var(--surface-2) 45%, transparent)",
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
