import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { GuaranteeBanner } from "@/components/marketing/GuaranteeBanner";
import { PlanSwitcher } from "@/components/marketing/PlanSwitcher";
import { Pricing } from "@/components/marketing/Pricing";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.
const OG_IMAGE = `${SITE_URL}/og.png`;

/**
 * Breadcrumb structured data — page-specific. Lists just [Home, Pricing]
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
      name: "Precios",
      item: `${SITE_URL}/pricing/`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Pago único. Sin suscripciones. Core $149 · Pro $249. Garantía de 30 días sin preguntas. Tus datos 100% locales para siempre.",
  alternates: {
    canonical: `${SITE_URL}/pricing/`,
  },
  openGraph: {
    title: "Precios — Trading Journal",
    description: "Pago único. Sin suscripciones. Core $149 · Pro $249. Garantía de 30 días.",
    url: `${SITE_URL}/pricing/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Precios — Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios — Trading Journal",
    description:
      "Pago único, sin suscripciones. Core $149 · Pro $249 con garantía de 30 días sin preguntas. Tus datos 100% locales para siempre.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean. Each gets a tall
// skeleton fallback to prevent layout shift while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const Comparison = dynamic(
  () => import("@/components/marketing/Comparison").then((m) => m.Comparison),
  { loading: () => sectionFallback }
);
const PricingFAQ = dynamic(
  () => import("@/components/marketing/PricingFAQ").then((m) => m.PricingFAQ),
  { loading: () => sectionFallback }
);
const TrustStrip = dynamic(
  () => import("@/components/marketing/TrustStrip").then((m) => m.TrustStrip),
  { loading: () => sectionFallback }
);
const ValueTestimonials = dynamic(
  () => import("@/components/marketing/ValueTestimonials").then((m) => m.ValueTestimonials),
  { loading: () => sectionFallback }
);
const StatsBand = dynamic(
  () => import("@/components/marketing/StatsBand").then((m) => m.StatsBand),
  { loading: () => sectionFallback }
);
const Newsletter = dynamic(
  () => import("@/components/marketing/Newsletter").then((m) => m.Newsletter),
  { loading: () => sectionFallback }
);
const DownloadCTA = dynamic(
  () => import("@/components/marketing/DownloadCTA").then((m) => m.DownloadCTA),
  { loading: () => sectionFallback }
);
const FinalCTA = dynamic(
  () => import("@/components/marketing/FinalCTA").then((m) => m.FinalCTA),
  { loading: () => sectionFallback }
);

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Precios"
        eyebrowEn="Pricing"
        titleEs="Lo compras una vez. Tuyo para siempre."
        titleEn="You buy it once. Yours forever."
        titleHighlightEs="Tuyo para siempre."
        titleHighlightEn="Yours forever."
        subtitleEs="Sin suscripciones. Sin nube. Sin perder acceso a tu historial si dejas de pagar. Garantía de devolución de 30 días, sin preguntas."
        subtitleEn="No subscriptions. No cloud. No losing access to your history if you stop paying. 30-day no-questions refund guarantee."
        breadcrumbEs="Precios"
        breadcrumbEn="Pricing"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Prominent 30-day money-back guarantee banner — sits between the
          page header and the pricing cards to reinforce the no-risk promise
          before the visitor even sees the prices. */}
      <GuaranteeBanner />
      {/* Alternative plan switcher — a Core/pro toggle with a single card
          that cross-fades and counts up/down between the two prices. Sits
          ABOVE the existing two-card <Pricing /> section so the visitor
          gets an interactive preview before the side-by-side detail. */}
      <PlanSwitcher />
      <Pricing />
      <Comparison />
      {/* Pricing-specific FAQ — 5 bilingual Q&A focused on trial, payment,
          guarantee, multi-computer and lost license. */}
      <PricingFAQ />
      <TrustStrip />
      {/* Compact 3-testimonial row focused on value-for-money (ROI,
          "paid for itself", one-time vs subscription). */}
      <ValueTestimonials />
      <StatsBand />
      <Newsletter />
      {/* Download CTA — Windows-app installer button. Sits between the
          Newsletter and the soft close so visitors leave with a concrete
          next action (download the desktop app). */}
      <DownloadCTA />
      <FinalCTA />
    </>
  );
}
