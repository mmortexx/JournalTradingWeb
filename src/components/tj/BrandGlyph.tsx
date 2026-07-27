/**
 * BrandGlyph — el ojo de Trading Journal, el logotipo REAL del producto.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * La web dibujaba otra marca: un trío de velas en escalera. No aparece en
 * ningún sitio de la aplicación de escritorio, cuyo icono —el del
 * ejecutable, el de la bandeja y el de su barra de título— es este ojo
 * (`TradingJournal.App/Assets/app-logo.png`). Además el trío estaba
 * copiado y pegado en cuatro sitios (barra superior, pie, intro y el
 * cromo de la demo), tres de ellos con dimensiones ligeramente distintas
 * entre sí, así que ni siquiera era la misma marca consigo misma.
 *
 * GEOMETRÍA
 * No está dibujado a ojo: sale de medir el PNG de la app (lienzo de
 * 512 px) y de escalar a este lienzo de 16.
 *   · caja del ojo   425 × 255 px  → proporción 1,667
 *   · grosor de trazo        38 px → 1,2
 *   · radio del iris         58 px → 1,8
 * La lente son dos cúbicas simétricas; sus puntos de control están a
 * 3,47 porque la desviación máxima de una cúbica es 3/4 de la altura del
 * control, y esos 3/4 son los que reproducen la altura medida.
 *
 * COLOR
 * Todo en `currentColor` para que el glifo herede el acento de la paleta
 * activa (champagne en oscuro, bronce en claro) en vez de fijar un color
 * que se quedaría desincronizado al cambiar de tema, como pasaba antes.
 */
export function BrandGlyph({
  size = 17,
  className = "text-[rgb(var(--accent-base))]",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1.9 8C5.6 3.5 10.4 3.5 14.1 8C10.4 12.5 5.6 12.5 1.9 8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** El mismo glifo como cadena de marcado, para los pocos sitios que
 *  construyen HTML a mano (la intro monta su nodo con innerHTML). */
export const BRAND_GLYPH_SVG = (size = 22) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="color:rgb(var(--accent-base))">` +
  `<path d="M1.9 8C5.6 3.5 10.4 3.5 14.1 8C10.4 12.5 5.6 12.5 1.9 8Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"></path>` +
  `<circle cx="8" cy="8" r="1.8" fill="currentColor"></circle></svg>`;
