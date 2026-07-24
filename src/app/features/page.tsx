import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { ReadingProgressIndicator } from "@/components/tj/ReadingProgressIndicator";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";

// Estimated reading time (features bento + gallery + how it works + more
// features). ~620 words across four sections at 220 wpm = ~3 min.
const READING_TIME_MIN = 3;

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
const OG_IMAGE = `${SITE_URL}/og.png`;

/**
 * Breadcrumb structured data — page-specific. [Home, Features] so Google
 * renders a correct breadcrumb rich result for the actual page hierarchy.
 */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Características", item: `${SITE_URL}/features/` },
  ],
};

// Article schema — overview page that aggregates the feature deep dives
// (FeaturesBento + Gallery + HowItWorks + MoreFeatures). Tells search
// engines this is an in-depth product overview article (not just a nav
// page), with a headline, description, and reading time. Mirrors the
// Article schema pattern used by /features/metricas, /features/disciplina
// and /features/seguridad. See worklog Task R26-1c (E4 + E6).
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Todo lo que necesitas para operar con disciplina",
  description:
    "Bento de características, galería de la app, cómo funciona y más. Métricas, disciplina y seguridad tienen sus propias páginas enfocadas.",
  url: `${SITE_URL}/features/`,
  mainEntityOfPage: `${SITE_URL}/features/`,
  author: { "@type": "Organization", name: "Trading Journal" },
  publisher: { "@type": "Organization", name: "Trading Journal" },
  inLanguage: "es",
  timeRequired: `PT${READING_TIME_MIN}M`,
  // datePublished/dateModified use the frozen build date — same value
  // as sitemap.ts LAST_MODIFIED. Google's Article rich-result spec
  // REQUIRES datePublished (ISO 8601) and recommends dateModified.
  datePublished: "2025-01-01",
  dateModified: "2025-01-01",
  // Reuse the OG image (1200×630 PNG, meets Google's 1.91:1 spec).
  image: `${SITE_URL}/og.png`,
  // about[] as canonical Thing objects (not plain strings) — slightly
  // improves classification signals.
  about: [
    { "@type": "Thing", name: "trading journal" },
    { "@type": "Thing", name: "trading metrics" },
    { "@type": "Thing", name: "trading discipline" },
    { "@type": "Thing", name: "local-first" },
    { "@type": "Thing", name: "Windows app" },
  ],
};

export const metadata: Metadata = {
  title: "Características",
  description:
    "Todo para operar con disciplina: bento de características, galería, cómo funciona y más. Métricas, disciplina y seguridad tienen su propia página enfocada.",
  alternates: { canonical: `${SITE_URL}/features/` },
  openGraph: {
    title: "Características — Trading Journal",
    description: "Explora cada característica de Trading Journal en profundidad.",
    url: `${SITE_URL}/features/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Características — Trading Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Características — Trading Journal",
    description: "40+ métricas institucionales, disciplina que cuesta dinero, playbook en vivo y 100% local.",
    images: [OG_IMAGE],
  },
};

// Overview page keeps the broad-stroke sections. The deep dives live in
// their own focused routes: /features/metricas, /features/disciplina,
// /features/seguridad. This page is the index that points to them.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const FeaturesBento = dynamic(
  () => import("@/components/marketing/FeaturesBento").then((m) => m.FeaturesBento),
  { loading: () => sectionFallback }
);
const Gallery = dynamic(
  () => import("@/components/marketing/Gallery").then((m) => m.Gallery),
  { loading: () => sectionFallback }
);
const HowItWorks = dynamic(
  () => import("@/components/marketing/HowItWorks").then((m) => m.HowItWorks),
  { loading: () => sectionFallback }
);
const MoreFeatures = dynamic(
  () => import("@/components/marketing/MoreFeatures").then((m) => m.MoreFeatures),
  { loading: () => sectionFallback }
);

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Producto"
        eyebrowEn="Product"
        titleEs="Todo lo que necesitas para operar con disciplina."
        titleEn="Everything you need to trade with discipline."
        titleHighlightEs="operar con disciplina."
        titleHighlightEn="trade with discipline."
        subtitleEs="Métricas institucionales, un guardián que te frena antes de la tontería, y tus datos 100% en tu máquina. No es otro journal con las mismas 30 métricas. Profundiza en cada eje en su propia página."
        subtitleEn="Institutional metrics, a guardian that stops you before the dumb trade, and your data 100% on your machine. Not another journal with the same 30 metrics. Dive into each axis on its own page."
        breadcrumbEs="Características"
        breadcrumbEn="Features"
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
      {/* Overview sections — broad strokes. Deep dives moved to
          /features/metricas, /features/disciplina, /features/seguridad. */}
      <FeaturesBento num="01" />
      <Gallery />
      <HowItWorks />
      <MoreFeatures />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}
