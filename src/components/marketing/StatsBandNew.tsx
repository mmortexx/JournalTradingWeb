"use client";

import { useLang } from "@/lib/i18n";

/**
 * StatsBandNew — la banda de 4 columnas del HTML (40+ métricas /
 * 0 bytes a la nube / 30 días garantía / 29 $ pago único). Sustituye
 * al antiguo StatsBand en la home.
 */
export function StatsBandNew() {
  const { lang } = useLang();
  const es = lang === "es";
  const stats = [
    { v: "40+", l: es ? "métricas institucionales calculadas en tiempo real" : "institutional metrics computed in real time" },
    { v: "0 bytes", l: es ? "enviados a la nube — todo vive en tu equipo" : "sent to the cloud — everything stays on your machine" },
    { v: "30 días", l: es ? "de garantía de devolución, sin preguntas" : "money-back guarantee, no questions asked" },
    { v: "29 $", l: es ? "pago único · Core 29 $ · Pro 49 $" : "one-time payment · Core $29 · Pro $49" },
  ];
  return (
    <section
      className="border-b"
      style={{ padding: "76px 24px", borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {stats.map((s) => (
          <div key={s.v}>
            <div
              className="font-serif"
              style={{
                fontSize: "clamp(2.4rem, 3.6vw, 3.4rem)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              {s.v}
            </div>
            <div
              className="mt-1.5"
              style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.4 }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
