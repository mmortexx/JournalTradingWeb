"use client";

import { useLang } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Reveal } from "@/components/tj/Reveal";

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
      className="section bg-veil relative border-t border-b border-[rgb(var(--divider)/0.06)] scroll-mt-24"
    >
      {/* T2c — `tj-container` sustituye a `max-w-[1240px] mx-auto px-5 md:px-8`
          para heredar los gutters fluidos (clamp(1.25rem, 4vw, 2.25rem))
          y el page-w de T2a. El `gap-12` desktop se mantiene; en móvil el
          gap baja a `gap-10` para evitar 48 px de aire entre titular y
          tarjeta cuando se apilan. */}
      <div className="tj-container grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div>
          <Reveal>
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
          </Reveal>
          <Reveal delay={0.06}>
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
          </Reveal>
          <Reveal delay={0.12}>
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
          </Reveal>
          {/* T2c — `gap-4` (16 px) en vez de `gap-3` (12 px): las tarjetas
              2×2 ya no se pegan en móvil y el número grande (19 px / 700)
              no roza la etiqueta.
              P1 — envoltorio Reveal stagger 0.18 para que las 4 KPIs
              entren en escena como bloque coordinado, no como lista
              asíncrona. El stagger interno entre las 4 tiles se logra con
              el `delay` único del wrapper (no por tile): en móvil las 4 se
              asientan a la vez, leyendo como placa de ratios, no como
              cascada decorativa. */}
          <Reveal delay={0.18}>
          {/* ── Cuadro de cifras, no rejilla de tarjetas ─────────────
              Esto eran cuatro cajas redondeadas con borde, fondo propio
              y un punto de color: el patrón por defecto de cualquier
              panel, y lo que hacía que la sección se leyera como un
              cuadro de mandos de plantilla en vez de como la ficha de
              datos de una institución.

              El registro correcto para una cifra financiera no es la
              caja: es la RETÍCULA. Un informe de mercado, una terminal
              o una memoria anual alinean los datos con reglas finas y
              dejan que manden las cifras — la caja compite con el dato
              que tiene dentro. Se retiran los recuadros y queda una
              cuadrícula de filetes: separador arriba de cada celda,
              vertical entre columnas, y nada más.

              `gap` pasa a 0 a propósito: con hueco, los filetes se
              rompen y dejan de leerse como una cuadrícula continua. La
              separación la da el relleno interior de cada celda. */}
          <ul className="m-0 p-0 list-none grid grid-cols-2 border-t border-[rgb(var(--divider)/0.14)]">
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
                // R24-1c: added a tiny color-coded 3×3 dot before each label
                // so the metric direction reads at a glance (pos / neg /
                // accent / ink) without needing to parse the value first.
                /* La celda: filete arriba y filete a la izquierda salvo
                   en la primera columna, que ya tiene el margen. Así los
                   trazos forman una cuadrícula y no cuatro marcos
                   sueltos. El único movimiento al pasar por encima es
                   que el filete superior se marca — en un cuadro de
                   cifras, levantar la celda sería tratar un dato como
                   un botón. */
                className="group/metric relative min-w-0 border-b border-[rgb(var(--divider)/0.14)] py-4 pr-5 [&:nth-child(even)]:pl-5 [&:nth-child(even)]:border-l [&:nth-child(even)]:border-l-[rgb(var(--divider)/0.14)] transition-colors duration-200"
              >
                {/* Etiqueta arriba, en versalita: es el encabezado de la
                    cifra, no su compañera. Apilar en vez de enfrentar
                    label y valor es lo que convierte una tarjeta en una
                    entrada de tabla. */}
                <span
                  className="block text-[10px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "var(--ink-3)" }}
                >
                  {m.l}
                </span>
                {/* La cifra manda: cuerpo grande, cifras tabulares y el
                    color semántico. `tnum` para que las cuatro alineen
                    sus dígitos en columna — sin eso, un cuadro de datos
                    baila.
                    Se mantiene en ≥19px y peso 700 porque a ese tamaño
                    el verde y el rojo de P&L cuentan como texto grande
                    para WCAG y les basta 3:1; por debajo tendrían que
                    despejar 4,5:1 y no lo hacen. */}
                <span
                  className="tnum mt-1.5 block text-[22px] sm:text-[26px]"
                  style={{ fontWeight: 600, color: m.c, letterSpacing: "-0.02em", lineHeight: 1.1 }}
                >
                  {m.v}
                </span>
              </li>
            ))}
          </ul>
          </Reveal>
        </div>

        {/* Distribución de R */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          // T3c — distribución R-múltiplo swap a `.tj-paper`: misma tarjeta
          // de histograma, ahora sobre papel translúcido cálido. El border
          // + padding originales se conservan; el `box-shadow` inset se
          // retira porque `.tj-paper` ya aporta su propio catch-light.
          className="tj-paper relative rounded-[2px]"
          style={{
            padding: 24,
            border: "1px solid rgb(var(--divider) / 0.13)",
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
                borderRadius: 4,
                background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                color: "rgb(var(--accent-base))",
                border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 30%, transparent)",
              }}
            >
              {/* El ternario estaba, pero con el mismo texto en las dos
                  ramas: una traducción que se dejó a medias. Y quedaba en
                  contradicción con su propio gráfico — el rótulo decía
                  «60 trades» mientras el globo de cada barra, treinta
                  líneas más abajo, dice «operaciones». El resto del sitio
                  usa «ops» en español sin excepción. */}
              {es ? "60 ops" : "60 trades"}
            </span>
          </div>
          {/* Histograma hardcoded — R20-3b: each bar now exposes a native
              `title` tooltip with its R-bucket + approx trade count (out of
              the 60-trades badge), plus a hover lift (translateY -3%) +
              brightness bump so the histogram reads as interactive rather
              than decorative. Bars remain aria-hidden (the labels row below
              carries the semantics for AT).
              R24-1c: wrapped the bars in a relative container + added a
              1px baseline divider beneath the bars so the chart reads as
              having an axis; the MODA label now lives in a small accent-
              tinted pill so it reads as a stamped marker rather than
              floating text that visually merges with the chart card’s top. */}
          {/* T2c — envoltorio `min-w-0` para que el histograma no fuerce
              overflow horizontal en móvil (los 9 bares + 8 gaps ya cabían,
              pero el `min-w-0` protege contra sub-pixel rounding en 320 px). */}
          <div className="relative min-w-0">
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
                  className="flex-1 rounded-t relative cursor-default transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3%]"
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
                      className="tnum absolute -top-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px]"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        color: "rgb(var(--accent-base))",
                        background: "color-mix(in oklab, rgb(var(--accent-base)) 14%, transparent)",
                        border: "1px solid color-mix(in oklab, rgb(var(--accent-base)) 32%, transparent)",
                      }}
                    >
                      {es ? "MODA" : "MODE"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Baseline axis — 1px hairline beneath the bars. */}
          <div aria-hidden className="h-px w-full" style={{ background: "rgb(var(--divider) / 0.13)" }} />
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
          {/* T2c — `gap-3` → `gap-4` para igualar el ritmo de las tarjetas
              de ratios; los valores largos (“+0,32R”, “1,59”) ya no se
              pegan a la etiqueta del vecino. */}
          <div className="mt-5 grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: "rgb(var(--divider) / 0.06)" }}>
            {[
              { l: es ? "Ganadoras" : "Winners", v: "50 %" },
              { l: es ? "R medio" : "Avg R", v: "+0,32R" },
              { l: es ? "Payoff" : "Payoff", v: "1,59" },
            ].map((s) => (
              <div key={s.l} className="relative">
                <div
                  className="tnum inline-flex items-center gap-1.5"
                  style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
                >
                  {/* R24-1c: tiny accent dot before each stat label so the
                      three stats read as a synchronized footer row rather
                      than three floating micro-headers. */}
                  <span aria-hidden className="w-1 h-1 rounded-full" style={{ background: "rgb(var(--accent-base))" }} />
                  {s.l}
                </div>
                <div className="tnum" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "var(--ink)" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
