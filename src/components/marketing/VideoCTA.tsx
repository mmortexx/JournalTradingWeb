"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

/**
 * VideoCTA — cierre de la home, justo antes del CTA final.
 *
 * Ya NO monta ningún vídeo ni tarjeta de cristal encima. El "vídeo de
 * fondo" de la maqueta original queda sustituido de raíz por el Ojo
 * del Mercado global (`BackgroundFX`, fixed detrás de toda la web):
 * en este tramo de scroll — cerca del final de página — el ojo
 * recupera su exposición máxima por diseño ("vuelve a encenderse
 * hacia el cierre"). Poner aquí un panel opaco lo tapaba entero justo
 * en su momento de mayor protagonismo.
 *
 * Legibilidad sin caja: el texto flota directo sobre el ojo con
 * `.tj-legible-text` (un text-shadow theme-aware definido en
 * globals.css) como única red — nada de fondo, blur ni borde que le
 * robe presencia al ojo.
 */
export function VideoCTA() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden border-y"
      style={{ minHeight: "76vh", borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      <div className="relative z-[1] mx-4 w-full max-w-[860px] px-6 py-12 text-center sm:px-12 md:px-16">
        <div className="tj-legible-text mb-5 inline-flex items-center gap-2.5">
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "rgb(var(--accent-base))",
              boxShadow: "0 0 12px rgb(var(--accent-base))",
              animation: "tj-glow 2.6s ease-in-out infinite",
            }}
          />
          <span
            className="uppercase tnum"
            style={{ fontSize: 12, letterSpacing: "0.18em", color: "rgb(var(--accent-base))" }}
          >
            {es ? "Tu operativa, medida" : "Your trading, measured"}
          </span>
        </div>
        <h2
          className="tj-legible-text font-serif m-0"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: "var(--ink)",
            textWrap: "balance",
          }}
        >
          {es ? (
            <>
              Lo que no se mide,
              <br />
              no se mejora<span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          ) : (
            <>
              What you don&apos;t measure,
              <br />
              you don&apos;t improve<span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          )}
        </h2>
        <p
          className="tj-legible-text mx-auto mb-0 mt-5"
          style={{
            maxWidth: "32em",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            lineHeight: 1.6,
            color: "var(--ink-2)",
          }}
        >
          {es
            ? "Cada operación, cada regla, cada euro que te cuesta la indisciplina — a la vista y en tu equipo, nunca en la nube de nadie."
            : "Every trade, every rule, every euro your indiscipline costs you — visible, on your machine, never in anyone's cloud."}
        </p>
        <div className="mt-[30px] flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2.5 rounded-full"
            style={{
              height: 52,
              padding: "0 26px",
              background: "rgb(var(--accent-base))",
              color: "#06130d",
              fontSize: 15,
              fontWeight: 600,
              boxShadow:
                "0 14px 38px -14px color-mix(in srgb, rgb(var(--accent-base)) 75%, #000)",
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
            }}
          >
            {es ? "Empieza hoy — 29 $" : "Start today — $29"}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="#demo"
            className="tj-legible-text inline-flex items-center gap-2.5 rounded-full border"
            style={{
              height: 52,
              padding: "0 24px",
              borderColor: "rgb(var(--divider) / 0.28)",
              background: "color-mix(in srgb, var(--bg) 22%, transparent)",
              color: "var(--ink)",
              fontSize: 15,
              fontWeight: 500,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--ink) 12%, transparent)";
              e.currentTarget.style.borderColor = "rgb(var(--divider) / 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--bg) 22%, transparent)";
              e.currentTarget.style.borderColor = "rgb(var(--divider) / 0.28)";
            }}
          >
            {es ? "Ver la demo" : "See the demo"}
          </a>
        </div>
        {/* Fila de stats — el "por qué" en tres números. Sin caja: cada
            número lleva su propio text-shadow (misma clase que el
            resto), y las separaciones son hairlines finas, no bordes
            de tarjeta. */}
        <div
          className="mt-11 grid grid-cols-1 gap-6 border-t pt-8 sm:grid-cols-3 sm:gap-0"
          style={{ borderColor: "rgb(var(--divider) / 0.16)" }}
        >
          {[
            {
              n: "40+",
              es: "métricas institucionales",
              en: "institutional metrics",
            },
            {
              n: "0 bytes",
              es: "enviados a la nube",
              en: "sent to the cloud",
            },
            {
              n: es ? "30 días" : "30 days",
              es: "de garantía, sin preguntas",
              en: "guarantee, no questions",
            },
          ].map((s, i) => (
            <div
              key={s.es}
              className={`tj-legible-text${i > 0 ? " sm:border-l sm:pl-6" : ""}`}
              style={i > 0 ? { borderColor: "rgb(var(--divider) / 0.16)" } : undefined}
            >
              <div
                className="tnum"
                style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}
              >
                {s.n}
              </div>
              <div
                className="tnum mt-1 uppercase"
                style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--ink-3)" }}
              >
                {es ? s.es : s.en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
