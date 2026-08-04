"use client";

import { Link } from "@/components/tj/LocaleLink";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";
import { HERRAMIENTAS } from "@/lib/herramientas";

/**
 * El índice de herramientas.
 *
 * Incluye el test de disciplina al final aunque no viva bajo
 * `/herramientas`: ya tenía dirección propia desde antes y moverla habría
 * roto los enlaces que existan por ahí. Es una herramienta más para quien
 * llega buscando, así que aparece aquí y se marca como lo que es.
 */
export function HerramientasIndice() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section-tight">
      <div className="tj-container">
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {HERRAMIENTAS.map((h, i) => (
            <Reveal key={h.slug} delay={i * 0.04} className="h-full">
              <li className="h-full">
                <Link
                  href={`/herramientas/${h.slug}`}
                  className="tj-paper group flex h-full flex-col rounded-[10px] p-5 transition-colors duration-200 hover:border-[rgb(var(--accent-base)/0.35)]"
                >
                  <span
                    className="tnum text-[11px] font-semibold"
                    style={{ color: "rgb(var(--accent-base))" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-2 text-[17px] font-semibold tracking-tight text-primary transition-colors group-hover:text-[rgb(var(--accent-base))]">
                    {es ? h.tituloEs : h.tituloEn}
                  </span>
                  <span className="mt-1.5 text-[14px] leading-[1.55] text-secondary">
                    {es ? h.resumenEs : h.resumenEn}
                  </span>
                  <span
                    aria-hidden
                    className="mt-4 text-[13px] font-medium transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: "rgb(var(--accent-base))" }}
                  >
                    {es ? "Abrir →" : "Open →"}
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}

          {/* El test, que vive en su propia dirección desde antes. */}
          <Reveal delay={HERRAMIENTAS.length * 0.04} className="h-full">
            <li className="h-full">
              <Link
                href="/test"
                className="tj-paper group flex h-full flex-col rounded-[10px] p-5 transition-colors duration-200 hover:border-[rgb(var(--accent-base)/0.35)]"
              >
                <span
                  className="tnum text-[11px] font-semibold"
                  style={{ color: "rgb(var(--accent-base))" }}
                >
                  {String(HERRAMIENTAS.length + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 text-[17px] font-semibold tracking-tight text-primary transition-colors group-hover:text-[rgb(var(--accent-base))]">
                  {es ? "Test de disciplina" : "Discipline test"}
                </span>
                <span className="mt-1.5 text-[14px] leading-[1.55] text-secondary">
                  {es
                    ? "Quince preguntas sobre lo que haces cuando el mercado va en contra."
                    : "Fifteen questions about what you do when the market turns against you."}
                </span>
                <span
                  aria-hidden
                  className="mt-4 text-[13px] font-medium transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: "rgb(var(--accent-base))" }}
                >
                  {es ? "Abrir →" : "Open →"}
                </span>
              </Link>
            </li>
          </Reveal>
        </ul>

        <Reveal delay={0.3}>
          <p className="mt-10 text-center text-[13.5px] text-tertiary">
            {es
              ? "Todas funcionan en tu navegador. No se envía nada a ningún servidor, no piden correo y no hay registro."
              : "They all run in your browser. Nothing is sent to any server, no email is asked for and there is no sign-up."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
