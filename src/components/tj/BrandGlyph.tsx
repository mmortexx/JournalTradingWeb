/**
 * BrandGlyph — el logotipo de Trading Journal: el libro mayor.
 *
 * Un libro abierto. En la página izquierda, los renglones del registro;
 * en la derecha, la curva que sale de haberlo llevado. Eso es el
 * producto entero en un dibujo: se anota, y de anotar sale la medida.
 *
 * ── Qué sustituye y por qué ───────────────────────────────────────────
 * Hasta ahora esto renderizaba `/logo.png`, el ojo de iris rojo y
 * amarillo de la aplicación de escritorio. Era un mapa de bits a todo
 * color en medio de una web que ahora es papel y tinta: el único
 * elemento del sitio que no estaba dibujado a línea, y se notaba. El
 * glifo nuevo es trazo, del mismo grabado que el fondo, y hereda la
 * tinta del tema con `currentColor` — oscuro sobre papel, crema sobre
 * tinta, sin dos archivos ni dos versiones.
 *
 * ── Grosor óptico constante ───────────────────────────────────────────
 * El `stroke-width` NO es fijo. En un viewBox de 48, un grosor de 1,8
 * mide 1,8 px cuando el glifo se dibuja a 48 px y solo 0,64 px cuando se
 * dibuja a 17 — a ese tamaño la línea se rompe y el logotipo se
 * desvanece. Aquí el grosor se calcula al revés, desde los píxeles
 * REALES que debe medir el trazo en pantalla, así que el glifo pesa
 * igual a cualquier tamaño. Es lo que hace un logotipo bien dibujado y
 * lo que un SVG con grosor fijo nunca consigue.
 *
 * ── Versión reducida ──────────────────────────────────────────────────
 * Por debajo de 22 px se caen los renglones y la curva. No es una
 * simplificación por comodidad: a 17 px esos detalles miden menos de un
 * píxel, y lo que producen no es detalle sino suciedad alrededor de la
 * silueta. La silueta y el lomo bastan para reconocerlo, que es lo
 * único que se le pide a un logotipo a tamaño de barra.
 */

/** Grosor que debe medir el trazo EN PANTALLA, en píxeles CSS. */
const STROKE_PX = 1.15;
const VIEW = 48;

export function BrandGlyph({
  size = 17,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const sw = (STROKE_PX * VIEW) / size;
  const detail = size >= 22;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Silueta: dos páginas abiertas, con la caída del papel hacia el
          lomo. Un solo trazado cerrado. */}
      <path
        d="M24 13C20 9.5 15.5 8 8 8v27c7.5 0 12 1.5 16 5 4-3.5 8.5-5 16-5V8c-7.5 0-12 1.5-16 5z"
        strokeWidth={sw}
      />
      {/* Lomo */}
      <path d="M24 13v27" strokeWidth={sw * 0.8} />

      {detail && (
        <>
          {/* Renglones del registro, en la página izquierda. */}
          <path
            d="M11.5 19.5h9M11.5 24.5h9M11.5 29.5h6"
            strokeWidth={sw * 0.62}
            opacity={0.42}
          />
          {/* La curva, en la página derecha: sube, devuelve un poco y
              vuelve a subir. Una diagonal limpia sería una promesa que
              el producto no hace. */}
          <path
            d="M28.5 30c1.7-.6 2.4-4 3.9-4s1.9 2.2 3 2.2 1.9-4.2 3-4.2"
            strokeWidth={sw * 0.9}
            opacity={0.72}
          />
        </>
      )}
    </svg>
  );
}

/** El mismo glifo como cadena de marcado, para los pocos sitios que
 *  construyen HTML a mano (la intro monta su nodo con innerHTML). */
export const BRAND_GLYPH_SVG = (size = 22) => {
  const sw = (STROKE_PX * VIEW) / size;
  const detail = size >= 22;
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 ${VIEW} ${VIEW}" fill="none" ` +
    `stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" ` +
    `aria-hidden="true" style="display:block">` +
    `<path d="M24 13C20 9.5 15.5 8 8 8v27c7.5 0 12 1.5 16 5 4-3.5 8.5-5 16-5V8c-7.5 0-12 1.5-16 5z" stroke-width="${sw}"/>` +
    `<path d="M24 13v27" stroke-width="${sw * 0.8}"/>` +
    (detail
      ? `<path d="M11.5 19.5h9M11.5 24.5h9M11.5 29.5h6" stroke-width="${sw * 0.62}" opacity="0.42"/>` +
        `<path d="M28.5 30c1.7-.6 2.4-4 3.9-4s1.9 2.2 3 2.2 1.9-4.2 3-4.2" stroke-width="${sw * 0.9}" opacity="0.72"/>`
      : "") +
    `</svg>`
  );
};
