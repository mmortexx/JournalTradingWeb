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
const OG_IMAGE = `${SITE_URL}/og.png`;

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
  // datePublished/dateModified use the frozen build date — same value
  // as sitemap.ts LAST_MODIFIED. Google's Article rich-result spec
  // REQUIRES datePublished (ISO 8601) and recommends dateModified;
  // without datePublished the Article schema earns no rich result.
  // See worklog Task R20-1d (E2) + R20-2d.
  datePublished: "2025-01-01",
  dateModified: "2025-01-01",
  // Reuse the OG image (1200×630 PNG, meets Google's 1.91:1 spec).
  // See worklog Task R20-1d (E3) + R20-2d.
  image: `${SITE_URL}/og.png`,
  // about[] as canonical Thing objects (not plain strings) — slightly
  // improves classification signals. See worklog Task R20-1d (E7).
  about: [
    { "@type": "Thing", name: "trading metrics" },
    { "@type": "Thing", name: "Sharpe ratio" },
    { "@type": "Thing", name: "profit factor" },
    { "@type": "Thing", name: "expectancy" },
    { "@type": "Thing", name: "risk calculator" },
  ],
};

export const metadata: Metadata = {
  // `absolute` bypasses layout.tsx's `title.template: "%s · Trading Journal"`
  // — a plain string would render "Métricas — Trading Journal · Trading Journal"
  // (double-branded). See worklog Task R22-1d (G1) + R23-2a.
  title: { absolute: "Métricas — Trading Journal" },
  description:
    "40+ ratios institucionales: Sharpe, Sortino, Calmar, profit factor, expectancy en R. Calculadora de riesgo. Métricas que correlacionan con la consistencia.",
  alternates: { canonical: `${SITE_URL}/features/metricas/` },
  openGraph: {
    title: "Métricas — Trading Journal",
    description: "40+ ratios institucionales y calculadora de riesgo. Métricas que separan un edge real de una racha.",
    url: `${SITE_URL}/features/metricas/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    // Next.js shallow-merges child openGraph over layout's — layout's
    // default OG image is NOT inherited when the child omits `images`.
    // See worklog Task R22-1d (G2) + R23-2a.
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Métricas — Trading Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Métricas — Trading Journal",
    description: "40+ ratios institucionales y calculadora de riesgo interactiva.",
    images: [OG_IMAGE],
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
