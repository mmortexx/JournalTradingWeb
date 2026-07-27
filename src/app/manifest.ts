import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * Next NO prefija con el basePath el contenido del manifiesto (sí lo hace
 * con los iconos de archivo tipo `app/favicon.ico`, pero no con lo que
 * devuelve esta función). Así que las rutas de aquí se construyen a mano
 * con el basePath que expone next.config.ts. Sin esto, `start_url: "/"`
 * apuntaba a la raíz de github.io —otro sitio, no este— y la app instalada
 * abría una página ajena.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trading Journal",
    short_name: "Trading Journal",
    description:
      "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único, sin suscripciones.",
    start_url: `${BASE}/`,
    display: "standalone",
    // Los dos colores son `--bg` del tema oscuro (globals.css). El tema
    // era #34B476 (verde), un color que no existe en la paleta del sitio
    // —cuyo acento es champagne #C7A76B— y que globals.css prohíbe
    // explícitamente recuperar. Además contradecía al `themeColor` del
    // layout, que decía otro color distinto.
    background_color: "#0b0c0d",
    theme_color: "#0b0c0d",
    lang: "es",
    icons: [
      {
        // El logotipo REAL de la aplicación de escritorio: el mismo archivo
        // que usan su barra de título y su icono de bandeja
        // (TradingJournal.App/Assets/app-logo.png). Antes había aquí un SVG
        // en línea inventado —cuadrado verde con una línea de gráfico— que
        // no aparecía en ninguna otra parte del producto.
        src: `${BASE}/logo.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
