/**
 * BrandGlyph — el ojo de Trading Journal, el logotipo REAL del producto.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * Antes la web dibujaba un ojo abstracto en SVG inline (un trazo
 * "champagne" sin gradiente). No coincidía con el icono de la app de
 * escritorio, cuyo `Assets/app-logo.png` es el ojo de Iris amarillo/rojo
 * con halo. Para que la marca sea la misma en web y app, este glifo
 * ahora renderiza el PNG real — el mismo archivo que el icono del
 * ejecutable, el de la bandeja y el de la barra de título en la app.
 *
 * Por qué `<img>` y no SVG inline: el Iris es raster (PNG), no un
 * trazado vectorial. Vectorizarlo requeriría redescribir manualmente
 * los cientos de mechones del halo; el `<img>` es fiel bit-a-bit y
 * ocupa menos código.
 *
 * El basePath en producción lo inyecta `next.config.ts` como
 * `NEXT_PUBLIC_BASE_PATH` para que `/logo.png` resuelva bajo
 * `/JournalTradingWeb/` (GitHub Pages).
 */
export function BrandGlyph({
  size = 17,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <img
      src={`${basePath}/logo.png`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}

/** El mismo glifo como cadena de marcado, para los pocos sitios que
 *  construyen HTML a mano (la intro monta su nodo con innerHTML). */
export const BRAND_GLYPH_SVG = (size = 22) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    `<img src="${basePath}/logo.png" width="${size}" height="${size}" ` +
    `alt="" aria-hidden="true" draggable="false" style="display:block">`
  );
};
