import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const ICON_SVG =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20width%3D%2224%22%20height%3D%2224%22%20rx%3D%225%22%20fill%3D%22%23C7A76B%22%2F%3E%3Cpath%20d%3D%22M5%2016L9%2010l3%204%202-3%204%205%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Crect%20x%3D%226%22%20y%3D%2213%22%20width%3D%221.2%22%20height%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Crect%20x%3D%2216.8%22%20y%3D%228%22%20width%3D%221.2%22%20height%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trading Journal",
    short_name: "Trading Journal",
    description:
      "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único, sin suscripciones.",
    start_url: "/",
    display: "standalone",
    background_color: "#121418",
    theme_color: "#C7A76B",
    lang: "es",
    icons: [
      {
        src: ICON_SVG,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
