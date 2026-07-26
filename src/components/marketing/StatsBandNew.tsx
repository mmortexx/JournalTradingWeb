"use client";

import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";

/**
 * StatsBandNew — la banda de 4 columnas del HTML (40+ métricas /
 * 0 bytes a la nube / 30 días garantía / 29 $ pago único). Sustituye
 * al antiguo StatsBand en la home.
 *
 * R24-1d — alineada con el vocabulario de tokens del sistema de
 * marketing (text-primary / text-tertiary en vez de los tokens
 * --ink / --ink-3 del "HTML de referencia" de Claude Design), con
 * utility classes del design system (.section-tight, .border-b,
 * .max-w-page) en vez de estilos inline hardcodeados, `tnum` en los
 * números grandes, una animación de entrada Reveal escalonada, y un
 * pequeño acento verde (accent dot) encima de cada estadística que
 * ancla visualmente la banda a la paleta de acento del resto de la
 * página (mismo patrón que los dots de reassurance pills en
 * PricingFAQ y los dots de value chip en ValueTestimonials).
 */
export function StatsBandNew() {
  const { lang } = useLang();
  const es = lang === "es";
  const stats = [
    { v: "40+", l: es ? "métricas institucionales calculadas en tiempo real" : "institutional metrics computed in real time" },
    { v: "0 bytes", l: es ? "enviados a la nube — todo vive en tu equipo" : "sent to the cloud — everything stays on your machine" },
    // La cuarta estadística era "30 días de garantía". Retirada: ya no se
    // ofrecen reembolsos. No se sustituye por otra cifra inventada — la
    // banda pasa a 3 columnas (ver grid-cols de abajo), que es lo honesto.
    { v: "29 $", l: es ? "pago único · Core 29 $ · Pro 49 $" : "one-time payment · Core $29 · Pro $49" },
  ];
  return (
    <section
      // R27-1b — `bg-veil` added: this 4-column stats band had no
      // background — the eye WebGL (bright red/green fibers in light
      // theme) was showing through between the stats, washing out
      // the `text-[13.5px] text-tertiary` descriptions under each
      // big number. `bg-veil` (82 % bg in light / 74 % in dark)
      // occludes the eye; the `border-b` bottom hairline is
      // preserved for the section's lower edge.
      className="section-tight border-b relative overflow-hidden bg-veil"
    >
      <div className="max-w-page mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7 md:gap-8">
          {stats.map((s, i) => (
            <Reveal key={s.v} delay={i * 0.08} y={14} className="flex flex-col">
              {/* Accent dot — small credential marker above the number,
                  ties the band to the accent palette used across the
                  rest of the pricing page (R24-1d). */}
              <span
                className="size-1.5 rounded-full bg-[rgb(var(--accent-base))] mb-3"
                aria-hidden="true"
              />
              <div
                className="font-serif tnum text-primary"
                style={{
                  fontSize: "clamp(2.4rem, 3.6vw, 3.4rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {s.v}
              </div>
              <div className="mt-2 text-[13.5px] text-tertiary leading-snug">
                {s.l}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
