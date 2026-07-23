import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Ticker } from "@/components/marketing/Ticker";
import { Hero } from "@/components/marketing/Hero";
import { SideRail } from "@/components/tj/SideRail";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — see layout.tsx for the rationale (social platforms
// silently fail to render SVG OG images). Absolute URL bypasses the
// metadataBase + basePath double-resolution issue (also see layout.tsx).
const OG_IMAGE = `${SITE_URL}/og.png`;

const PAGE_DESCRIPTION =
  "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina que te frena antes del error y tus datos 100 % en tu máquina. Pago único desde 29 $. Sin suscripciones.";

export const metadata: Metadata = {
  title: { absolute: "Trading Journal — Opera como una mesa institucional." },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: "Trading Journal — Opera como una mesa institucional.",
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Trading Journal — Opera como una mesa institucional.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Journal — Opera como una mesa institucional.",
    description:
      "Diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único desde 29 $.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean and each section's JS
// is fetched only when needed. Each gets a lightweight skeleton fallback
// so layout shift is avoided while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);

const OverviewApp = dynamic(
  () => import("@/components/marketing/OverviewApp").then((m) => m.OverviewApp),
  { loading: () => sectionFallback }
);
const HomeDemo = dynamic(
  () => import("@/components/marketing/HomeDemo").then((m) => m.HomeDemo),
  { loading: () => sectionFallback }
);
const FinalCTANew = dynamic(
  () => import("@/components/marketing/FinalCTANew").then((m) => m.FinalCTANew),
  { loading: () => sectionFallback }
);

/**
 * Home (R7) — composición corta, calcada de la RUTA home del HTML de
 * referencia (el resto de secciones viven en sus propias páginas, como
 * en el HTML viven tras el megamenú):
 *
 *   1. Hero (#top)             — portada institucional, entra con el intro
 *   2. OverviewApp (#overview) — "Todo tu día en una pantalla" + mockup
 *   3. Ticker                  — banda animada con símbolos
 *   4. HomeDemo (#demo)        — la app recreada, interactiva (§ 02)
 *   5. FinalCTANew             — CTA de cierre
 *
 * Características / Métricas / Disciplina / Seguridad → /features
 * Precios → /pricing · Demo a página completa → /demo
 *
 * El SideRail (01–07) mezcla anclas de esta página (Inicio, Vistazo,
 * Demo) con navegación real a /features y /pricing — la home dejó de
 * ser "toda la web en vertical".
 */
export default function Home() {
  return (
    <>
      {/* Raíl lateral 01–07 del HTML de referencia (solo home, ≥1100px) */}
      <SideRail />
      <Hero />
      <OverviewApp />
      <Ticker />
      <HomeDemo />
      <FinalCTANew />
    </>
  );
}
