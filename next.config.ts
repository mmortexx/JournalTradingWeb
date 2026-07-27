import type { NextConfig } from "next";

// GitHub Pages serves the site at /JournalTradingWeb/, so production builds
// need basePath + assetPrefix + output:export. In local dev we serve at the
// root (http://localhost:3000/) with a normal dynamic server so Turbopack
// can compile on demand — `output: "export"` + Turbopack dev can deadlock.
const IS_DEV = process.env.NODE_ENV === "development";
const BASE_PATH = "/JournalTradingWeb";

const nextConfig: NextConfig = {
  // Only static-export for production (GitHub Pages) builds.
  ...(IS_DEV ? {} : { output: "export" }),
  // Only apply basePath + assetPrefix for production (GitHub Pages) builds.
  ...(IS_DEV
    ? {}
    : {
        basePath: BASE_PATH,
        assetPrefix: `${BASE_PATH}/`,
      }),
  // Expose basePath to the client so image srcs in components can be
  // prefixed (next/image does NOT auto-prefix absolute srcs starting
  // with "/" under output:export + basePath).
  env: {
    NEXT_PUBLIC_BASE_PATH: IS_DEV ? "" : BASE_PATH,
    // Destino de los formularios (ver src/lib/forms.ts). Se declara aquí, y
    // no solo en el entorno, para que Next SIEMPRE lo sustituya por un
    // literal en el bundle del cliente. Si se deja sin declarar y la
    // variable no está definida, `process.env.X` sobrevive tal cual al
    // bundle y lanza "process is not defined" en el navegador, tumbando el
    // módulo entero. Sin valor queda "" y los formularios avisan del fallo.
    NEXT_PUBLIC_WEB3FORMS_KEY: process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "",
    // URL del script de Google que guarda las altas. Mismo motivo para
    // declararlo aquí que la clave de arriba.
    NEXT_PUBLIC_WAITLIST_URL: process.env.NEXT_PUBLIC_WAITLIST_URL ?? "",
  },
  images: {
    // No loader needed for static export; we use SVG/unoptimized images only.
    unoptimized: true,
  },
  // Sin `typescript.ignoreBuildErrors`: estaba en `true`, lo que dejaba
  // publicar el sitio con errores de tipos dentro. Se puso para tolerar
  // examples/websocket/, que no compilaba porque le faltaban sus librerías;
  // ese directorio ya no existe, así que la excusa tampoco. Ahora un error
  // de tipos rompe el build y no llega a producción.
  reactStrictMode: false,
  ...(IS_DEV ? {} : { trailingSlash: true }),
};

export default nextConfig;
