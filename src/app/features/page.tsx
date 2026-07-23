import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { ReadingProgressIndicator } from "@/components/tj/ReadingProgressIndicator";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";

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

export const metadata: Metadata = {
  title: "Características",
  description:
    "Todo lo que necesitas para operar con disciplina: bento de características, galería de la app, cómo funciona y más. Métricas, disciplina y seguridad tienen sus propias páginas enfocadas.",
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
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
