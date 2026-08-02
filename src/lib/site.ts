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
/* ── El valor por defecto es DONDE ESTÁ PUBLICADO HOY, no dónde queremos
      estar mañana ────────────────────────────────────────────────────
   Esto apuntó un rato a `countpips.com` con el dominio todavía sin
   comprar, y era un error con consecuencias: la copia de GitHub Pages
   —que sigue online— declaraba como canónica una dirección que no
   resuelve. Un buscador que sigue ese canónico no encuentra nada, y la
   respuesta razonable por su parte es dejar de indexar unas páginas que
   dicen "la buena es esta otra" señalando al vacío. Sin canónico habría
   estado mejor que con uno roto.

   Así que el valor por defecto es la dirección real y viva. El dominio
   propio se activa por entorno, y sólo cuando exista de verdad:

     NEXT_PUBLIC_SITE_URL=https://countpips.com

   Se define en Cloudflare Pages (Settings → Environment variables) el día
   que el dominio esté comprado y apuntando. Hasta entonces todo sigue
   coherente solo, sin fecha límite ni nada que recordar.

   `||` y no `??`, y la diferencia importa: `next.config.ts` declara esta
   variable como cadena VACÍA cuando nadie la define, y `??` solo cae al
   valor por defecto con `null`/`undefined`. Con `??`, el caso normal
   —nadie ha configurado nada— habría dejado `SITE_URL` en blanco y
   publicado canónicos como `href="/pricing/"`, sin dominio delante. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mmortexx.github.io/JournalTradingWeb";

/** Nombre de la marca, tal cual debe aparecer en metadatos y esquemas. */
export const SITE_NAME = "CountPips";

/** URL absoluta de una ruta del sitio. Normaliza las barras. */
export function siteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
