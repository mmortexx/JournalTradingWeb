import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionNav } from "@/components/layout/SectionNav";
import { YouAreHere } from "@/components/layout/YouAreHere";
import { FinalCTA } from "@/components/marketing/FinalCTA";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.
const OG_IMAGE = `${SITE_URL}/og.png`;

/**
 * Breadcrumb structured data — page-specific. Lists just [Home, Features]
 * so Google renders a correct breadcrumb rich result for the actual page
 * hierarchy (a flat list of all 6 site pages on every page would be
 * misleading per Google's structured data guidelines).
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
      name: "Características",
      item: `${SITE_URL}/features/`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Características",
  description:
    "40+ métricas institucionales, disciplina que cuesta dinero, playbook en vivo, calendario P&L, 100% local. Explora cada característica de Trading Journal en profundidad.",
  alternates: {
    canonical: `${SITE_URL}/features/`,
  },
  openGraph: {
    title: "Características — Trading Journal",
    description:
      "40+ métricas institucionales, disciplina, playbook en vivo. Explora cada característica en profundidad.",
    url: `${SITE_URL}/features/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Características — Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Características — Trading Journal",
    description:
      "40+ métricas institucionales, disciplina que cuesta dinero, playbook en vivo y 100% local. Explora cada característica en profundidad.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean. Each gets a tall
// skeleton fallback to prevent layout shift while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const Bento = dynamic(
  () => import("@/components/marketing/Bento").then((m) => m.Bento),
  { loading: () => sectionFallback }
);
const Gallery = dynamic(
  () => import("@/components/marketing/Gallery").then((m) => m.Gallery),
  { loading: () => sectionFallback }
);
const Guardian = dynamic(
  () => import("@/components/marketing/Guardian").then((m) => m.Guardian),
  { loading: () => sectionFallback }
);
const MistakeInvoice = dynamic(
  () => import("@/components/marketing/MistakeInvoice").then((m) => m.MistakeInvoice),
  { loading: () => sectionFallback }
);
const BeforeAfter = dynamic(
  () => import("@/components/marketing/BeforeAfter").then((m) => m.BeforeAfter),
  { loading: () => sectionFallback }
);
const ComparisonSlider = dynamic(
  () => import("@/components/tj/ComparisonSlider").then((m) => m.ComparisonSlider),
  { loading: () => sectionFallback }
);
const HowItWorks = dynamic(
  () => import("@/components/marketing/HowItWorks").then((m) => m.HowItWorks),
  { loading: () => sectionFallback }
);
const MetricsDeepDive = dynamic(
  () => import("@/components/marketing/MetricsDeepDive").then((m) => m.MetricsDeepDive),
  { loading: () => sectionFallback }
);
const RiskTool = dynamic(
  () => import("@/components/marketing/RiskTool").then((m) => m.RiskTool),
  { loading: () => sectionFallback }
);
const MoreFeatures = dynamic(
  () => import("@/components/marketing/MoreFeatures").then((m) => m.MoreFeatures),
  { loading: () => sectionFallback }
);
const Wrapped = dynamic(
  () => import("@/components/marketing/Wrapped").then((m) => m.Wrapped),
  { loading: () => sectionFallback }
);
const LocalFirst = dynamic(
  () => import("@/components/marketing/LocalFirst").then((m) => m.LocalFirst),
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
        subtitleEs="Métricas institucionales, un guardián que te frena antes de la tontería, y tus datos 100% en tu máquina. No es otro journal con las mismas 30 métricas."
        subtitleEn="Institutional metrics, a guardian that stops you before the dumb trade, and your data 100% on your machine. Not another journal with the same 30 metrics."
        breadcrumbEs="Características"
        breadcrumbEn="Features"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SectionNav />
      {/* Each section is wrapped in an anchorable container with
          `scroll-mt-32` so smooth-scrolling from the SectionNav pills
          lands the section heading cleanly below the sticky Navbar
          (64px) + sticky SectionNav (~48px) + a 16px breathing strip. */}
      <div id="disciplina" className="scroll-mt-32">
        <Bento />
      </div>
      <div id="galeria" className="scroll-mt-32">
        <Gallery />
      </div>
      <div id="guardian" className="scroll-mt-32">
        <Guardian />
      </div>
      <div id="coste" className="scroll-mt-32">
        <MistakeInvoice />
      </div>
      <div id="transformacion" className="scroll-mt-32">
        <BeforeAfter />
      </div>
      {/* Interactive before/after slider — sits right below the static
          BeforeAfter section so visitors who scrolled through the two-card
          comparison can immediately *play* with the same transformation
          in a single draggable card. */}
      <ComparisonSlider />
      <div id="como-funciona" className="scroll-mt-32">
        <HowItWorks />
      </div>
      <div id="metricas" className="scroll-mt-32">
        <MetricsDeepDive />
      </div>
      <div id="riesgo" className="scroll-mt-32">
        <RiskTool />
      </div>
      <div id="mas-features" className="scroll-mt-32">
        <MoreFeatures />
      </div>
      <div id="playbook" className="scroll-mt-32">
        <Wrapped />
      </div>
      <div id="local" className="scroll-mt-32">
        <LocalFirst />
      </div>
      <div id="tecnico" className="scroll-mt-32">
        <TechSpecs />
      </div>
      <div id="integraciones" className="scroll-mt-32">
        <Integrations />
      </div>
      <FinalCTA />
      {/* Floating "you are here" indicator — sits above the global
          BackToTop button and reflects the active section from the
          SectionNav. Rendered last so it layers above page content. */}
      <YouAreHere />
    </>
  );
}
