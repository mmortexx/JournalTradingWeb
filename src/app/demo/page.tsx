import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoCapabilities } from "@/components/demo/DemoCapabilities";
import { AppDemoClient } from "@/components/demo/AppDemoClient";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.
const OG_IMAGE = `${SITE_URL}/og.png`;

/**
 * Breadcrumb structured data — page-specific. Lists just [Home, Demo]
 * so Google renders a correct breadcrumb rich result for the actual
 * page hierarchy.
 */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: `${SITE_URL}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Demo",
      item: `${SITE_URL}/demo/`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Demo en vivo",
  description:
    "La app recreada en tu navegador. 7 páginas clickeables con datos de muestra realistas. No es un vídeo: es la app.",
  alternates: {
    canonical: `${SITE_URL}/demo/`,
  },
  openGraph: {
    title: "Demo en vivo — Trading Journal",
    description: "La app recreada en tu navegador. 7 páginas clickeables con datos de muestra.",
    url: `${SITE_URL}/demo/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Demo en vivo — Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo en vivo — Trading Journal",
    description:
      "La app recreada en tu navegador. 7 páginas clickeables con datos de muestra realistas. No es un vídeo: es la app.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean. Each gets a tall
// skeleton fallback to prevent layout shift while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const DemoGallery = dynamic(
  () => import("@/components/demo/DemoGallery").then((m) => m.DemoGallery),
  { loading: () => sectionFallback }
);
const StatsBandNew = dynamic(
  () => import("@/components/marketing/StatsBandNew").then((m) => m.StatsBandNew),
  { loading: () => sectionFallback }
);
const DemoReadyToBuy = dynamic(
  () => import("@/components/demo/DemoReadyToBuy").then((m) => m.DemoReadyToBuy),
  { loading: () => sectionFallback }
);
const FinalCTANew = dynamic(
  () => import("@/components/marketing/FinalCTANew").then((m) => m.FinalCTANew),
  { loading: () => sectionFallback }
);

export default function DemoPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Demo"
        eyebrowEn="Demo"
        titleEs="La app, en tu navegador."
        titleEn="The app, in your browser."
        titleHighlightEs="en tu navegador."
        titleHighlightEn="in your browser."
        subtitleEs="Esto no es un vídeo: es la app, recreada. Haz clic en las pestañas, explora las páginas. Los datos son de muestra, como en la app real."
        subtitleEn="This isn't a video: it's the app, recreated. Click the tabs, explore the pages. Data is sample data, just like the real app."
        breadcrumbEs="Demo"
        breadcrumbEn="Demo"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* What you can do — 6 feature cards previewing the demo */}
      <DemoCapabilities />
      <section className="section bg-veil scroll-mt-16">
        <AppDemoClient />
      </section>
      {/* Screenshot gallery — all 8 optimized webp images */}
      <DemoGallery />
      <StatsBandNew />
      {/* Ready-to-buy CTA — catches visitors who just played with the demo */}
      <DemoReadyToBuy />
      <FinalCTANew />
    </>
  );
}
