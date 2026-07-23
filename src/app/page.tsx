import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Ticker } from "@/components/marketing/Ticker";
import { Hero } from "@/components/marketing/Hero";
import { StatsBandNew } from "@/components/marketing/StatsBandNew";

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
const FeaturesBento = dynamic(
  () => import("@/components/marketing/FeaturesBento").then((m) => m.FeaturesBento),
  { loading: () => sectionFallback }
);
const ToolsGrid = dynamic(
  () => import("@/components/marketing/ToolsGrid").then((m) => m.ToolsGrid),
  { loading: () => sectionFallback }
);
const MetricsShowcaseNew = dynamic(
  () => import("@/components/marketing/MetricsShowcaseNew").then((m) => m.MetricsShowcaseNew),
  { loading: () => sectionFallback }
);
const RiskCalculator = dynamic(
  () => import("@/components/marketing/RiskCalculator").then((m) => m.RiskCalculator),
  { loading: () => sectionFallback }
);
const GuardianNew = dynamic(
  () => import("@/components/marketing/GuardianNew").then((m) => m.GuardianNew),
  { loading: () => sectionFallback }
);
const DisciplineCost = dynamic(
  () => import("@/components/marketing/DisciplineCost").then((m) => m.DisciplineCost),
  { loading: () => sectionFallback }
);
const SecuritySection = dynamic(
  () => import("@/components/marketing/SecuritySection").then((m) => m.SecuritySection),
  { loading: () => sectionFallback }
);
const FinalCTANew = dynamic(
  () => import("@/components/marketing/FinalCTANew").then((m) => m.FinalCTANew),
  { loading: () => sectionFallback }
);

/**
 * Home (R6) — composición reescrita para alinear con el HTML de
 * referencia. 11 secciones en scroll:
 *
 *   1. Hero (#top)               — portada institucional
 *   2. OverviewApp (#overview)   — "Todo tu día en una pantalla" + mockup
 *   3. Ticker                    — banda animada con símbolos del HTML
 *   4. StatsBandNew              — 40+ / 0 bytes / 30 días / 29 $
 *   5. FeaturesBento (#features) — bento 12-col
 *   6. ToolsGrid                 — 8 herramientas Pro + brokers
 *   7. MetricsShowcaseNew (#metrics) — ratios + histograma R
 *   8. RiskCalculator            — calculadora interactiva
 *   9. GuardianNew (#guardian)   — disciplina que actúa
 *  10. DisciplineCost            — el coste real de la indisciplina
 *  11. SecuritySection (#security) — local-first + comparativa
 *  12. FinalCTANew               — CTA de cierre
 *
 * Las páginas internas (/features, /pricing, /demo) y los componentes
 * viejos de marketing se mantienen en el repo y siguen funcionando
 * desde sus consumidores. Las páginas se actualizarán en commits
 * posteriores (fuera del alcance de este commit).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <OverviewApp />
      <Ticker />
      <StatsBandNew />
      <FeaturesBento />
      <ToolsGrid />
      <MetricsShowcaseNew />
      <RiskCalculator />
      <GuardianNew />
      <DisciplineCost />
      <SecuritySection />
      <FinalCTANew />
    </>
  );
}
