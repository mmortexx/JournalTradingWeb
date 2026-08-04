// Tarjeta de Twitter/X de esta ruta. El diseño se reutiliza desde la raíz.
//
// Las dos constantes de abajo se declaran LITERALES en cada fichero y no se
// re-exportan con el resto: Next.js las lee del texto antes de compilar y no
// sabe seguir una re-exportación. `force-static` es obligatorio porque el
// sitio se publica como export estático.
export const runtime = "nodejs";
export const dynamic = "force-static";
export { default, alt, size, contentType } from "../twitter-image";
