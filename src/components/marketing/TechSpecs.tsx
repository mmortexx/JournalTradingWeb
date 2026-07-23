"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

interface SpecRow {
  /** Bilingual label and value. */
  labelEs: string;
  labelEn: string;
  valueEs: string;
  valueEn: string;
}

/**
 * Tech specs — platform, storage, RAM, import/export, languages,
 * updates and privacy. Renders as a single `liquid-glass rounded-card p-6`
 * surface with a 2-column grid of `<dl>` rows; each row exposes a
 * `<dt>` (label, tertiary) and `<dd>` (value, primary) so the markup
 * stays semantics-first.
 *
 * Bottom-border handling: every row gets a border-white/10 `border-b` for
 * visual rhythm; the truly-last row drops the border via
 * `border-b-0`, and on `sm+` (2 columns) the second-to-last row also
 * drops its border via `sm:border-b-0` so the final two cells — which
 * sit side-by-side in the last row — both end cleanly without a
 * dangling divider.
 */
export function TechSpecs() {
  const { lang } = useLang();
  const es = lang === "es";

  const rows: SpecRow[] = [
    {
      labelEs: "Plataforma",
      labelEn: "Platform",
      valueEs: "Windows 10/11 (64-bit)",
      valueEn: "Windows 10/11 (64-bit)",
    },
    {
      labelEs: "Almacenamiento",
      labelEn: "Storage",
      valueEs: "SQLite local (~5MB por 1000 operaciones)",
      valueEn: "Local SQLite (~5MB per 1000 trades)",
    },
    {
      labelEs: "RAM",
      labelEn: "RAM",
      valueEs: "< 200MB en uso",
      valueEn: "< 200MB in use",
    },
    {
      labelEs: "Importación",
      labelEn: "Import",
      valueEs: "CSV universal, mapeo de columnas",
      valueEn: "Universal CSV, column mapping",
    },
    {
      labelEs: "Exportación",
      labelEn: "Export",
      valueEs: "PDF, CSV, JSON",
      valueEn: "PDF, CSV, JSON",
    },
    {
      labelEs: "Idiomas",
      labelEn: "Languages",
      valueEs: "Español + Inglés",
      valueEn: "Spanish + English",
    },
    {
      labelEs: "Actualizaciones",
      labelEn: "Updates",
      // Major versions (v2.0, v3.0…) are paid with a discount — see FAQ.
      // "Free within your major version" mirrors the FAQ answer:
      // "son gratuitas dentro de la misma versión mayor (1.x → 1.x)".
      valueEs: "Gratis en tu versión mayor",
      valueEn: "Free within your major version",
    },
    {
      labelEs: "Privacidad",
      labelEn: "Privacy",
      valueEs: "100% local, sin telemetría",
      valueEn: "100% local, no telemetry",
    },
  ];

  return (
    <section className="section bg-veil relative overflow-hidden">
      <div className="relative max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Técnico" : "Technical"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Construido <span className="text-gradient">para durar.</span>
              </>
            ) : (
              <>
                Built <span className="text-gradient">to last.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Sin dependencias externas, sin procesos en segundo plano, sin telemetría. Una vez instalado, es tuyo."
              : "No external dependencies, no background processes, no telemetry. Once installed, it's yours."}
          </p>
        </Reveal>

        {/* Spec card */}
        <Reveal delay={0.1} y={28} className="mt-10">
          <div className="liquid-glass depth-2 rounded-card p-6 md:p-8 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {rows.map((r, i) => {
                const isLast = i === rows.length - 1;
                const isSecondToLast = i === rows.length - 2;
                const cellClasses = [
                  "flex flex-col gap-1 py-3.5 border-b ",
                  isLast ? "border-b-0" : "",
                  isSecondToLast ? "sm:border-b-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <motion.dl
                    key={r.labelEn}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.5,
                      delay: (i % 2) * 0.06 + Math.floor(i / 2) * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cellClasses}
                  >
                    <dt className="text-tertiary text-[11px] uppercase tracking-[0.14em] font-semibold">
                      {es ? r.labelEs : r.labelEn}
                    </dt>
                    <dd className="text-primary text-sm font-medium leading-snug tnum">
                      {es ? r.valueEs : r.valueEn}
                    </dd>
                  </motion.dl>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Footnote */}
        <Reveal delay={0.2} className="mt-6">
          <p className="text-xs text-tertiary leading-relaxed">
            {es
              ? "Sin requisitos de conexión. Funciona en tu equipo aunque mañana cierren internet."
              : "No connection requirements. Runs on your machine even if the internet shuts down tomorrow."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
