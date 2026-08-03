import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "CountPips — Tu operativa, medida.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * opengraph-image — tarjeta Open Graph dinámica generada por Next.js.
 *
 * Sustituye al `og.png` estático (que vivía en `public/` y se
 * referenciaba vía una URL absoluta dependiente de SITE_URL). Con
 * este archivo, Next genera la imagen en runtime/build y la sirve
 * desde `/opengraph-image` en la RAÍZ del dominio donde se publique
 * el sitio — sin importar si es countpips.com, GitHub Pages o el
 * preview del sandbox. La tarjeta siempre coincide con la web real.
 *
 * ── Diseño ────────────────────────────────────────────────────────────
 * Fondo oscuro cálido (#0b0c0d, el --bg del tema oscuro del sitio).
 * Acento champagne (#C7A76B, --accent-base). Tipografía sans
 * institucional. Marca arriba-izquierda, titular grande centrado,
 * bajada de 3 KPIs abajo. Estilo Anthropic: minimalista, espaciado
 * generoso, jerarquía tipográfica fuerte.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0c0d",
          backgroundImage:
            "radial-gradient(120% 80% at 50% -10%, rgba(199,167,107,0.10), transparent 55%), radial-gradient(80% 60% at 50% 110%, rgba(199,167,107,0.06), transparent 60%)",
          color: "#f1f2ef",
          fontFamily: "sans-serif",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Marco superior — marca + etiqueta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Glifo de marca — cuadrado gold + anillo */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(199,167,107,0.14)",
                border: "1px solid rgba(199,167,107,0.42)",
              }}
            >
              <div style={{ width: 14, height: 14, background: "#C7A76B", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em" }}>CountPips</span>
          </div>
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#818588",
              fontWeight: 600,
            }}
          >
            Diario de trading · Windows
          </span>
        </div>

        {/* Centro — titular */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 6, height: 6, background: "#C7A76B", borderRadius: 1 }} />
            <span style={{ fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C7A76B", fontWeight: 700 }}>
              Tu operativa, medida.
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.035em", maxWidth: 900 }}>
            Opera como una
            <br />
            mesa <span style={{ color: "#C7A76B" }}>institucional.</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 300, color: "#a7abac", maxWidth: 720, lineHeight: 1.35 }}>
            40+ métricas institucionales, disciplina que te frena antes del error y tus datos 100 % en tu máquina.
          </div>
        </div>

        {/* Pie — 3 KPIs + precio */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 56 }}>
            {[
              { v: "40+", l: "Métricas" },
              { v: "100%", l: "Local" },
              { v: "1×", l: "Pago único" },
            ].map((k) => (
              <div key={k.l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 38, fontWeight: 700, color: "#C7A76B", lineHeight: 1 }}>{k.v}</div>
                <div style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#818588", fontWeight: 600 }}>{k.l}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 22px",
              borderRadius: 6,
              background: "#C7A76B",
              color: "#1a1714",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Comprar — desde 29 $
          </div>
        </div>

        {/* Filete gold superior */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #C7A76B 30%, #C7A76B 70%, transparent)" }} />
      </div>
    ),
    { ...size }
  );
}
