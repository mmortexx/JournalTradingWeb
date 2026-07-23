"use client";

import { motion } from "framer-motion";
import { CalendarDays, BookOpen, LineChart, NotebookPen, Layers } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { getCal } from "@/lib/trading/fixtures";

/**
 * FeaturesBento — sección `#features` del HTML. Rejilla bento con 5
 * tarjetas: calendario de P&L grande (span 7), rendimiento por hora
 * (span 5), playbooks, diario narrativo, multi-cuenta multi-activo.
 *
 * `num` — ordinal del eyebrow. Por defecto el de la home ("03"); las
 * páginas internas pasan el suyo para mantener su propia secuencia.
 */
export function FeaturesBento({ num = "03" }: { num?: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const cal = getCal();

  return (
    <section
      id="features"
      className="relative overflow-hidden"
      style={{ padding: "120px 24px 80px" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 30% 0%, color-mix(in oklab, var(--ink) 5%, transparent), transparent 60%)",
        }}
      />
      <div className="relative max-w-[1280px] mx-auto">
        <div className="max-w-[760px] mb-12">
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
              {es ? "CARACTERÍSTICAS" : "FEATURES"}
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
                Todo lo que una mesa profesional
                <br />
                espera de un <span style={{ color: "rgb(var(--accent-base))" }}>diario</span>.
              </>
            ) : (
              <>
                Everything a professional desk
                <br />
                expects from a <span style={{ color: "rgb(var(--accent-base))" }}>journal</span>.
              </>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Calendario grande (span 7) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 relative overflow-hidden"
            style={{
              padding: 24,
              borderRadius: 18,
              border: "1px solid rgb(var(--divider) / 0.13)",
              background: "color-mix(in oklab, var(--surface) 55%, transparent)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              minHeight: 360,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-grid place-items-center rounded-lg"
                style={{ width: 30, height: 30, background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)", color: "rgb(var(--accent-base))" }}
              >
                <CalendarDays size={15} aria-hidden />
              </span>
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Calendario de P&L" : "P&L calendar"}
              </span>
            </div>
            <h3
              className="font-serif m-0"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)", letterSpacing: "-0.02em", color: "var(--ink)" }}
            >
              {es ? "Cada día, en un vistazo" : "Every day, at a glance"}
            </h3>
            <div
              className="mt-5 grid grid-cols-7 gap-1.5"
            >
              {cal.cells.map((c, i) => {
                const cellStyle = c.style
                  ? { ...parseInlineStyle(c.style), padding: "4px" }
                  : { padding: "4px" };
                return (
                  <div key={i} style={cellStyle}>
                    <span className="tnum" style={{ fontSize: 8, opacity: 0.75 }}>{c.day}</span>
                    <span className="tnum" style={{ fontSize: 8.5, fontWeight: 600, lineHeight: 1 }}>{c.val}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex items-center gap-3">
                <span
                  className="tnum"
                  style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
                >
                  {es ? "Total mes" : "Month total"}
                </span>
                <span
                  className="tnum"
                  style={{ fontSize: 22, fontWeight: 700, color: cal.pnlColor }}
                >
                  {cal.pnl}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                {[
                  { c: "rgb(var(--accent-base))", l: "≥ 60 $" },
                  { c: "color-mix(in oklab, rgb(var(--accent-base)) 35%, transparent)", l: "20–60 $" },
                  { c: "color-mix(in oklab, rgb(var(--accent-base)) 18%, transparent)", l: "0–20 $" },
                  { c: "rgb(var(--pnl-neg) / 0.22)", l: es ? "Negativo" : "Negative" },
                ].map((g) => (
                  <span key={g.l} className="inline-flex items-center gap-1" style={{ fontSize: 9.5, color: "var(--ink-2)" }}>
                    <span className="inline-block rounded" style={{ width: 9, height: 9, background: g.c }} />
                    {g.l}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Rendimiento por hora (span 5) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="lg:col-span-5"
            style={{
              padding: 24,
              borderRadius: 18,
              border: "1px solid rgb(var(--divider) / 0.13)",
              background: "color-mix(in oklab, var(--surface) 55%, transparent)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              minHeight: 360,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-grid place-items-center rounded-lg"
                style={{ width: 30, height: 30, background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)", color: "rgb(var(--accent-base))" }}
              >
                <LineChart size={15} aria-hidden />
              </span>
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Rendimiento por hora" : "Hourly performance"}
              </span>
            </div>
            <h3
              className="font-serif m-0"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)", letterSpacing: "-0.02em", color: "var(--ink)" }}
            >
              {es ? "Sabe cuándo rendirte y cuándo apretar" : "Knows when to push and when to back off"}
            </h3>
            {/* Bar chart hardcoded 24 barras (horas) */}
            <div className="mt-5 flex items-end gap-[3px]" style={{ height: 100 }}>
              {[
                6, 8, 12, 18, 24, 32, 38, 44, 52, 60, 58, 50, 56, 68, 72, 64, 48, 38, 30, 22, 18, 14, 10, 8,
              ].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background:
                      i === 9
                        ? "rgb(var(--accent-base))"
                        : "color-mix(in oklab, rgb(var(--accent-base)) 40%, transparent)",
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="tnum" style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                  {es ? "Mejor ventana" : "Best window"}
                </div>
                <div className="tnum" style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>
                  10:00 – 11:30
                </div>
              </div>
              <span
                className="tnum"
                style={{
                  fontSize: 10,
                  padding: "4px 10px",
                  borderRadius: 100,
                  background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                  color: "rgb(var(--accent-base))",
                  border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 30%, transparent)",
                }}
              >
                {es ? "+27 % sobre media" : "+27% over average"}
              </span>
            </div>
          </motion.div>

          {/* Playbooks (span 4) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4"
            style={{
              padding: 24,
              borderRadius: 18,
              border: "1px solid rgb(var(--divider) / 0.13)",
              background: "color-mix(in oklab, var(--surface) 55%, transparent)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-grid place-items-center rounded-lg"
                style={{ width: 30, height: 30, background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)", color: "rgb(var(--accent-base))" }}
              >
                <BookOpen size={15} aria-hidden />
              </span>
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Playbooks" : "Playbooks"}
              </span>
            </div>
            <h3
              className="font-serif m-0"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)", letterSpacing: "-0.02em", color: "var(--ink)" }}
            >
              {es ? "Sólo setups que tienen edge" : "Only setups with edge"}
            </h3>
            <div className="mt-4 space-y-2.5">
              {[
                { n: "Ruptura", w: "62 %", c: "rgb(var(--pnl-pos))" },
                { n: "Pullback", w: "58 %", c: "rgb(var(--pnl-pos))" },
                { n: "Reversión", w: "41 %", c: "var(--ink-3)" },
                { n: "Tendencia", w: "55 %", c: "rgb(var(--pnl-pos))" },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-3">
                  <span style={{ fontSize: 13, color: "var(--ink)", flex: 1 }}>{s.n}</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgb(var(--divider) / 0.13)" }}>
                    <div className="h-full rounded-full" style={{ width: s.w, background: s.c }} />
                  </div>
                  <span
                    className="tnum"
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", minWidth: 42, textAlign: "right" }}
                  >
                    {s.w}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Diario narrativo (span 4) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-4"
            style={{
              padding: 24,
              borderRadius: 18,
              border: "1px solid rgb(var(--divider) / 0.13)",
              background: "color-mix(in oklab, var(--surface) 55%, transparent)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-grid place-items-center rounded-lg"
                style={{ width: 30, height: 30, background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)", color: "rgb(var(--accent-base))" }}
              >
                <NotebookPen size={15} aria-hidden />
              </span>
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Diario narrativo" : "Narrative journal"}
              </span>
            </div>
            <h3
              className="font-serif m-0"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)", letterSpacing: "-0.02em", color: "var(--ink)" }}
            >
              {es ? "Lo que pasó, lo que sentiste" : "What happened, what you felt"}
            </h3>
            <div
              className="mt-4 rounded-[10px] p-4"
              style={{
                background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
                border: "1px solid rgb(var(--divider) / 0.06)",
              }}
            >
              <p
                className="m-0"
                style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}
              >
                {es
                  ? "“Entré en NQ por ruptura del rango NY, pero moví el stop a +1R para ‘asegurar’. Error: el plan era aguantar a 2R. Terminé saliendo en BE después de que el precio llegó al objetivo sin mí.”"
                  : "“Entered NQ on NY range break, but moved stop to +1R to ‘be safe’. Mistake: the plan was to hold to 2R. I ended up exiting at BE after price hit the target without me.”"}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--ink-3)" }}>
                <span className="tnum">2026-07-22 · 14:42</span>
                <span aria-hidden>·</span>
                <span>{es ? "Nota post-trade" : "Post-trade note"}</span>
              </div>
            </div>
          </motion.div>

          {/* Multi-cuenta multi-activo (span 4) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
            style={{
              padding: 24,
              borderRadius: 18,
              border: "1px solid rgb(var(--divider) / 0.13)",
              background: "color-mix(in oklab, var(--surface) 55%, transparent)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-grid place-items-center rounded-lg"
                style={{ width: 30, height: 30, background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)", color: "rgb(var(--accent-base))" }}
              >
                <Layers size={15} aria-hidden />
              </span>
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                {es ? "Multi-cuenta, multi-activo" : "Multi-account, multi-asset"}
              </span>
            </div>
            <h3
              className="font-serif m-0"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)", letterSpacing: "-0.02em", color: "var(--ink)" }}
            >
              {es ? "Una cuenta o diez, en la misma vista" : "One account or ten, in the same view"}
            </h3>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                es ? "Acciones" : "Stocks",
                es ? "Futuros" : "Futures",
                "Forex",
                "Crypto",
                "+ Prop firm",
              ].map((tag) => (
                <span
                  key={tag}
                  className="tnum"
                  style={{
                    fontSize: 11.5,
                    padding: "5px 11px",
                    borderRadius: 100,
                    border: "1px solid rgb(var(--divider) / 0.13)",
                    color: "var(--ink-2)",
                    background: "color-mix(in oklab, var(--surface-2) 40%, transparent)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Parsea un string estilo CSS inline (formato `"prop:val;prop:val"`) a un
 * objeto JS compatible con el `style` prop de React. Solo se usa para
 * los strings generados por `fixtures.ts` (background/borderRadius/
 * aspectRatio/display/etc.). Suficiente para los casos del calendario.
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
