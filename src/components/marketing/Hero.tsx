"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Hero — sección `#top`.
 *
 * R28 — reescritura en clave INSTITUCIONAL. La versión anterior estaba
 * bien construida pero hablaba el idioma equivocado: era una landing de
 * SaaS de consumo (píldoras, resplandores, tarjeta flotante) delante de
 * un titular que promete "opera como una mesa institucional". Lo que se
 * ha retirado y por qué:
 *
 *  - PÍLDORAS `rounded-full` de 54 px en los CTA → rectángulos de 4 px,
 *    que es el radio de control real de la app (Styles.xaml). Una
 *    píldora lee "app store"; un rectángulo lee "terminal".
 *  - HALO de acento difuminado 64 px sobre el titular. Era una mancha de
 *    color puro cuya única función era decorar; competía con el ojo del
 *    fondo y ensuciaba el texto.
 *  - TARJETA FLOTANTE decorativa ("[ 2026 ] · Hecho para el trader
 *    serio") con esquinas de 18 px, blur y doble sombra. Un recuadro
 *    suelto flotando sin anclaje a la rejilla es justo lo contrario de
 *    lo institucional. Su información útil (plataforma y versión) baja
 *    a la barra de especificaciones, plana y alineada.
 *  - CURSIVA + SUBRAYADO en la palabra de acento. Floritura editorial.
 *    Ahora el acento es solo color, y quien marca el bloque es una
 *    hairline de ancho completo bajo el titular.
 *  - PUNTOS CON RESPLANDOR (`box-shadow` de color + keyframe de brillo)
 *    en el antetítulo y entre los distintivos → cuadrado de 1 px sin
 *    glow y reglas verticales hairline. Un panel de instrumentos no
 *    parpadea en verde.
 *  - BOLITA VIAJERA del indicador de scroll, con su glow y su bucle de
 *    2,2 s → riel estático con marca. El movimiento gratuito es lo
 *    primero que delata a una web de marketing.
 *  - SHEEN y sombras de color en los botones → sin brillo, sin sombra
 *    de acento. El realce al pasar por encima es un cambio de tono.
 *
 * Lo que se conserva porque sí es institucional: la rejilla vertical
 * 25/50/75 %, ahora ANCLA REAL de la maqueta (el contenido se alinea a
 * ella en vez de flotar por encima), el scrim lateral de legibilidad,
 * las cifras tabulares y el `data-seq` que consume IntroSequence.
 *
 * Entrada: los elementos llevan `data-seq` y los revela IntroSequence.
 * Por eso este componente NO usa framer-motion para la entrada — dos
 * sistemas animando opacity a la vez se pisan.
 */
export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";

  /* Barra de especificaciones del pie del hero. Datos, no eslóganes:
     se lee como la placa de características de un instrumento. */
  const specs: { k: string; v: string }[] = [
    { k: es ? "PLATAFORMA" : "PLATFORM", v: "Windows 10 · 11" },
    { k: es ? "DATOS" : "DATA", v: es ? "100 % locales" : "100 % local" },
    { k: es ? "LICENCIA" : "LICENSE", v: es ? "Pago único" : "One-time" },
    { k: es ? "IDIOMAS" : "LANGUAGES", v: "ES · EN" },
    { k: es ? "VERSIÓN" : "VERSION", v: "1.4.2" },
  ];

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-end overflow-hidden border-b"
      style={{ borderColor: "rgb(var(--divider) / 0.10)" }}
    >
      {/* Scrim lateral de legibilidad sobre la columna de texto. */}
      <div
        aria-hidden
        className="hero-side-scrim pointer-events-none absolute inset-0"
        style={{ zIndex: 1 }}
      />
      {/* Fundido inferior hacia el fondo, para que el hero entregue la
          página a la sección siguiente sin un corte duro. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(0deg, var(--bg), transparent 46%)",
          zIndex: 1,
        }}
      />

      {/* Aquí vivían tres reglas verticales al 25/50/75 % del ancho.
          Retiradas por decisión del dueño: cruzaban el iris y la mitad
          superior del hero, y a esa altura no hay contenido alineado a
          ellas, así que no estructuraban nada — solo ensuciaban el
          fondo. La rejilla sigue existiendo donde sí se sostiene: en las
          hairlines HORIZONTALES que separan titular, entradilla y placa
          de especificaciones, que sí marcan bloques reales. */}

      <div className="tj-legible-text relative z-10 mx-auto w-full max-w-[1240px] px-6 pt-32 pb-14 sm:px-10">
        {/* ---- Antetítulo ---- */}
        <div data-seq className="mb-6 flex items-center gap-2.5">
          {/* Cuadrado de acento de 5 px, sin resplandor ni animación:
              una marca de registro, no una luz de aviso. */}
          <span
            aria-hidden
            className="inline-block"
            style={{ width: 5, height: 5, background: "rgb(var(--accent-base))" }}
          />
          <span
            className="tnum uppercase"
            style={{ fontSize: 11.5, letterSpacing: "0.16em", color: "var(--ink-3)" }}
          >
            {es
              ? "Diario de trading · Windows nativo"
              : "Trading journal · Windows native"}
          </span>
        </div>

        {/* ---- Titular ---- */}
        <h1
          data-seq
          className="m-0 font-sans break-words uppercase"
          style={{
            fontSize: "clamp(2rem, 7.4vw, 5.4rem)",
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: "var(--ink)",
            maxWidth: "16em",
            textRendering: "optimizeLegibility",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {es ? (
            <>
              Opera como una
              <br />
              mesa <span style={{ color: "rgb(var(--accent-base))" }}>institucional.</span>
            </>
          ) : (
            <>
              Trade like an
              <br />
              institutional <span style={{ color: "rgb(var(--accent-base))" }}>desk.</span>
            </>
          )}
        </h1>

        {/* Hairline de ancho completo bajo el titular. Sustituye al
            subrayado de la palabra de acento: marca el bloque entero y
            ata el titular a la rejilla en vez de decorar una palabra. */}
        <div
          data-seq
          aria-hidden
          className="mt-8 h-px w-full"
          style={{ background: "rgb(var(--divider) / 0.14)" }}
        />

        {/* ---- Entradilla + CTA, en dos columnas sobre la rejilla ---- */}
        <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26em)]">
          <div data-seq>
            <p
              className="m-0 break-words"
              style={{
                fontSize: "clamp(1.05rem, 2vw, 1.5rem)",
                fontWeight: 300,
                lineHeight: 1.3,
                color: "color-mix(in oklab, var(--ink) 86%, transparent)",
                maxWidth: "20em",
              }}
            >
              {es
                ? "Mídela con el rigor de una mesa profesional."
                : "Measure it with institutional-grade rigour."}
            </p>
            <p
              className="m-0 mt-4 break-words"
              style={{
                fontSize: "clamp(0.95rem, 1.3vw, 1.05rem)",
                fontWeight: 300,
                lineHeight: 1.65,
                color: "var(--ink-2)",
                maxWidth: "34em",
              }}
            >
              {es
                ? "40+ métricas institucionales, un guardián que te frena antes del error y tus datos 100 % en tu máquina. Nativo de Windows, pago único desde 29 $."
                : "40+ institutional metrics, a guardian that brakes before the error, and your data 100 % on your machine. Windows-native, one-time payment from $29."}
            </p>
          </div>

          {/* CTA — rectángulos de 4 px, sin brillo ni sombra de color.
              El realce al pasar por encima y el foco son el MISMO gesto,
              declarados en CSS, para que teclado y ratón vayan igual. */}
          <div data-seq className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch lg:self-end">
            <Link
              href="/pricing"
              className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-[4px] px-7 text-[15px] font-semibold outline-none transition-colors duration-150 hover:bg-[rgb(var(--accent-hover))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              style={{ background: "rgb(var(--accent-base))", color: "#1A1917" }}
            >
              {es ? "Comprar — desde 29 $" : "Buy — from $29"}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-[4px] border px-7 text-[15px] font-semibold text-[var(--ink)] outline-none transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
              style={{ borderColor: "rgb(var(--divider) / 0.20)" }}
            >
              <Play size={14} fill="currentColor" aria-hidden />
              {es ? "Ver la demo" : "See the demo"}
            </Link>
          </div>
        </div>

        {/* ---- Placa de especificaciones ----
            Sustituye a la fila de distintivos con puntos de acento. Cada
            dato es una pareja etiqueta/valor separada por reglas
            hairline: se lee como la placa de un instrumento, no como una
            fila de sellos de confianza. */}
        <div
          data-seq
          className="mt-14 border-t pt-5"
          style={{ borderColor: "rgb(var(--divider) / 0.14)" }}
        >
          {/* Rejilla, no flex con reglas verticales. La versión anterior
              separaba cada campo con un `border-left`, y al envolver a una
              segunda línea el primer campo de la fila nueva arrastraba su
              regla y quedaba huérfana. Con una rejilla de columnas fijas
              los campos se alinean solos en cualquier ancho y la jerarquía
              la da la etiqueta encima del valor — que además es como se
              lee una placa de características de verdad. */}
          <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {specs.map((s) => (
              <div key={s.k} className="flex flex-col gap-1">
                <dt
                  className="tnum uppercase"
                  style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--ink-3)" }}
                >
                  {s.k}
                </dt>
                <dd
                  className="tnum m-0"
                  style={{ fontSize: 13, color: "var(--ink)" }}
                >
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* El indicador "Scroll" se retiró: quedaba centrado en el borde
          inferior, justo ENCIMA de la placa de especificaciones, y se
          pisaban. Entre una señal decorativa y una de datos, se queda la
          de datos — y que la página se desplaza ya lo dice la propia
          placa cortada por el borde. */}
    </section>
  );
}
