/**
 * URL única de la tarjeta que se ve al compartir cualquier enlace del
 * sitio (Open Graph / Twitter Card).
 *
 * POR QUÉ VIVE AQUÍ Y NO EN CADA PÁGINA
 * Antes cada una de las nueve páginas construía esta URL por su cuenta.
 * Con la ruta repetida nueve veces, cambiar la tarjeta significaba tocar
 * nueve archivos y acordarse de los nueve — que es exactamente cómo la
 * imagen publicada acabó desincronizada de su fuente. Un solo sitio.
 *
 * EL `?v=` NO ES DECORATIVO
 * Facebook, WhatsApp, LinkedIn y X guardan en caché la miniatura de cada
 * enlace durante días o semanas. Si el archivo cambia pero la URL no,
 * siguen enseñando la imagen vieja y parece que el arreglo no ha surtido
 * efecto. Subir el número obliga a que la vuelvan a descargar.
 *
 * Al cambiar `public/og.png` (con `python scripts/generate-og.py`), hay
 * que subir este número.
 */
const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";

export const OG_IMAGE = `${SITE_URL}/og.png?v=2`;
