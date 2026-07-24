import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeaturePageNav } from "@/components/marketing/FeaturePageNav";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { ReadingProgressIndicator } from "@/components/tj/ReadingProgressIndicator";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";

// Estimated reading time (security + tech specs + integrations).
// ~520 words across three sections at 220 wpm = ~3 min.
const READING_TIME_MIN = 3;

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Características", item: `${SITE_URL}/features/` },
    { "@type": "ListItem", position: 3, name: "Seguridad", item: `${SITE_URL}/features/seguridad/` },
  ],
};

// Article schema — in-depth feature article on local-first security.
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Tus datos, 100% en tu máquina",
  description:
    "Local-first, sin nube ni cuentas. Trading Journal es local-first: tus operaciones viven en tu Windows, cifradas en reposo.",
  url: `${SITE_URL}/features/seguridad/`,
  mainEntityOfPage: `${SITE_URL}/features/seguridad/`,
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
    { "@type": "Thing", name: "local-first" },
    { "@type": "Thing", name: "data privacy" },
    { "@type": "Thing", name: "encryption" },
    { "@type": "Thing", name: "no cloud" },
    { "@type": "Thing", name: "trading journal security" },
  ],
};

export const metadata: Metadata = {
  title: "Seguridad — Trading Journal",
  description:
    "Local-first: tus datos 100% en tu máquina, sin nube ni cuentas. Especificaciones técnicas, integraciones con tu flujo y privacidad por diseño.",
  alternates: { canonical: `${SITE_URL}/features/seguridad/` },
  openGraph: {
    title: "Seguridad — Trading Journal",
    description: "Local-first, sin nube ni cuentas. Tus datos 100% en tu máquina.",
    url: `${SITE_URL}/features/seguridad/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seguridad — Trading Journal",
    description: "Local-first, sin nube ni cuentas. Tus datos 100% en tu máquina.",
  },
};

const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const SecuritySection = dynamic(
  () => import("@/components/marketing/SecuritySection").then((m) => m.SecuritySection),
  { loading: () => sectionFallback }
);
const TechSpecs = dynamic(
  () => import("@/components/marketing/TechSpecs").then((m) => m.TechSpecs),
  { loading: () => sectionFallback }
);
const Integrations = dynamic(
  () => import("@/components/marketing/Integrations").then((m) => m.Integrations),
  { loading: () => sectionFallback }
);

export default function SeguridadPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Producto"
        eyebrowEn="Product"
        titleEs="Tus datos, 100% en tu máquina."
        titleEn="Your data, 100% on your machine."
        titleHighlightEs="100% en tu máquina."
        titleHighlightEn="100% on your machine."
        subtitleEs="Sin nube, sin cuentas, sin servidores. Trading Journal es local-first: tus operaciones viven en tu Windows, cifradas en reposo, sin tocar nunca un servidor ajeno. Privacidad por diseño, no por configuración."
        subtitleEn="No cloud, no accounts, no servers. Trading Journal is local-first: your trades live on your Windows, encrypted at rest, never touching anyone else's server. Privacy by design, not by configuration."
        breadcrumbEs="Características · Seguridad"
        breadcrumbEn="Features · Security"
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
      <SecuritySection num="01" />
      <TechSpecs />
      <Integrations />
      <FeaturePageNav current="seguridad" />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}
