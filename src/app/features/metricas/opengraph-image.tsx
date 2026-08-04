// Tarjeta Open Graph de esta ruta. El diseño se reutiliza desde la raíz.
//
// Las dos constantes de abajo se declaran LITERALES en cada fichero y no se
// re-exportan con el resto: Next.js las lee del texto antes de compilar y no
// sabe seguir una re-exportación. Estaban re-exportadas en los dieciséis
// ficheros de tarjeta y tumbaban las dos compilaciones, oculto todo detrás
// del error de tipos que paraba el flujo antes de llegar hasta aquí.
//
// `force-static` es obligatorio porque el sitio se publica como export
// estático: sin ella, Next no sabe que la imagen puede generarse una vez
// durante la compilación y aborta al recopilar las páginas.
export const runtime = "nodejs";
export const dynamic = "force-static";
export { default, alt, size, contentType } from "../opengraph-image";
