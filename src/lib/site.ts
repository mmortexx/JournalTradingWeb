/**
 * La identidad pública del sitio: una sola declaración para todo.
 *
 * ── Por qué existe ────────────────────────────────────────────────────
 * `SITE_URL` estaba escrito a mano en diez archivos (el layout, las nueve
 * páginas, el sitemap y el robots). Diez copias de una cadena que tiene
 * que ser idéntica en todas o el buscador recibe señales contradictorias:
 * el canónico diciendo una dirección, el mapa del sitio otra y la tarjeta
 * social una tercera. Al mudarnos de dominio eso deja de ser hipotético —
 * basta olvidar UN archivo para publicar media web apuntando al sitio
 * viejo, y no hay error de compilación que lo delate.
 *
 * ── Por qué el canónico NO depende de dónde se publique ───────────────
 * Durante la mudanza el mismo contenido vive en dos sitios: el dominio
 * nuevo y el GitHub Pages antiguo, que se deja encendido a propósito
 * hasta comprobar que todo funciona. Para un buscador, dos direcciones
 * con el mismo contenido son contenido duplicado, y reparte entre ambas
 * lo que debería ir a una.
 *
 * Por eso `SITE_URL` es FIJO y apunta siempre al dominio definitivo, se
 * publique donde se publique. Así la copia de GitHub Pages declara como
 * canónica la dirección buena: sigue accesible para quien tenga el
 * enlace, y a la vez le dice al buscador cuál es la que cuenta. Lo que sí
 * cambia según el destino es el PREFIJO de rutas — ver `asset()` y
 * `next.config.ts`—, porque eso es dónde están los ficheros, no cómo se
 * llama el sitio.
 */
export const SITE_URL = "https://countpips.com";

/** Nombre de la marca, tal cual debe aparecer en metadatos y esquemas. */
export const SITE_NAME = "CountPips";

/** URL absoluta de una ruta del sitio. Normaliza las barras. */
export function siteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
