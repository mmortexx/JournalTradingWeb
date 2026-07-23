import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeaturePageNav } from "@/components/marketing/FeaturePageNav";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { ReadingProgressIndicator } from "@/components/tj/ReadingProgressIndicator";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";

// Estimated reading time for this page's body content (metrics showcase
// + risk calculator + wrapped). Computed from the section copy density —
// ~480 words across the three sections at 220 wpm = ~3 min (rounded up).
const READING_TIME_MIN = 3;

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Características", item: `${SITE_URL}/features/` },
    { "@type": "ListItem", position: 3, name: "Métricas", item: `${SITE_URL}/features/metricas/` },
  ],
};

// Article schema — tells search engines this is an in-depth feature
// article (not just a landing page), with a headline, description, and
// reading time. Improves rich-result eligibility for content deep-dives.
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Métricas que separan un edge real de una racha",
  description:
    "40+ ratios institucionales calculados de tus operaciones. Sharpe, Sortino, Calmar, profit factor, expectancy en R.",
  url: `${SITE_URL}/features/metricas/`,
  mainEntityOfPage: `${SITE_URL}/features/metricas/`,
  author: { "@type": "Organization", name: "Trading Journal" },
  publisher: { "@type": "Organization", name: "Trading Journal" },
  inLanguage: "es",
  timeRequired: `PT${READING_TIME_MIN}M`,
  about: ["trading metrics", "Sharpe ratio", "profit factor", "expectancy", "risk calculator"],
};

export const metadata: Metadata = {
  title: "Métricas — Trading Journal",
  description:
    "40+ ratios institucionales: Sharpe, Sortino, Calmar, profit factor, expectancy en R. Calculadora de riesgo interactiva. Métricas que correlacionan con la consistencia, no gráficos bonitos.",
  alternates: { canonical: `${SITE_URL}/features/metricas/` },
  openGraph: {
    title: "Métricas — Trading Journal",
    description: "40+ ratios institucionales y calculadora de riesgo. Métricas que separan un edge real de una racha.",
    url: `${SITE_URL}/features/metricas/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Métricas — Trading Journal",
    description: "40+ ratios institucionales y calculadora de riesgo interactiva.",
  },
};

const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const MetricsShowcaseNew = dynamic(
  () => import("@/components/marketing/MetricsShowcaseNew").then((m) => m.MetricsShowcaseNew),
  { loading: () => sectionFallback }
);
const RiskCalculator = dynamic(
  () => import("@/components/marketing/RiskCalculator").then((m) => m.RiskCalculator),
  { loading: () => sectionFallback }
);
const Wrapped = dynamic(
  () => import("@/components/marketing/Wrapped").then((m) => m.Wrapped),
  { loading: () => sectionFallback }
);

export default function MetricasPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Producto"
        eyebrowEn="Product"
        titleEs="Métricas que separan un edge real de una racha."
        titleEn="Metrics that separate a real edge from a streak."
        titleHighlightEs="edge real."
        titleHighlightEn="real edge."
        subtitleEs="40+ ratios institucionales calculados de tus operaciones. Sharpe, Sortino, Calmar, profit factor, expectancy en R. No gráficos bonitos: números que correlacionan con la consistencia a largo plazo."
        subtitleEn="40+ institutional ratios computed from your trades. Sharpe, Sortino, Calmar, profit factor, expectancy in R. Not pretty charts: numbers that correlate with long-term consistency."
        breadcrumbEs="Características · Métricas"
        breadcrumbEn="Features · Metrics"
        readingTimeMin={READING_TIME_MIN}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <ReadingProgressIndicator />
      <MetricsShowcaseNew num="01" />
      <RiskCalculator num="02" />
      <Wrapped />
      <FeaturePageNav current="metricas" />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}
