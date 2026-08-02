"use client";

import { EngravedAtlas } from "./EngravedAtlas";

/**
 * BackgroundFX — el fondo fijo del sitio.
 *
 * Monta el atlas grabado (EngravedAtlas) y las tres capas de material
 * que lo acompañan: el halo de tinta, el grano del papel y la viñeta.
 *
 * ── Qué había aquí antes ──────────────────────────────────────────────
 * Hasta el cambio de estilo, este archivo contenía "El Ojo del Mercado":
 * un iris de fibras de luz de ~900 líneas de shader WebGL, con parpadeo,
 * micro-sacadas y seguimiento del puntero. Se retiró al fijar el estilo
 * clásico como único: un iris incandescente contradice un material que
 * imita papel entintado, y dejarlo aquí sin ejecutarse solo servía para
 * confundir a quien abriera el archivo.
 *
 * NO SE HA PERDIDO: sigue completo en el historial de git. Para
 * recuperarlo basta con `git show <commit-anterior>:src/components/tj/
 * BackgroundFX.tsx`.
 */
export function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <EngravedAtlas />

      {/* Filetes de margen — la caja de la mancha, continua de arriba
          abajo del documento. Vive aquí y no en cada sección para que no
          se corte ni se desalinee al pasar de una a la siguiente. */}
      <div className="tj-margin-rules" />

      {/* Halo superior de tinta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 85% at 50% -8%, color-mix(in srgb, var(--ink) 4%, transparent), transparent 52%)",
        }}
      />

      {/* Grano — la fibra del papel */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
          opacity: 0.045,
          mixBlendMode: "overlay",
        }}
      />

      {/* Viñeta inferior */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 125% at 50% 42%, transparent 72%, color-mix(in srgb, var(--bg) 82%, #000) 100%)",
          opacity: 0.34,
        }}
      />
    </div>
  );
}
