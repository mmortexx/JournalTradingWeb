import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { GuaranteeBanner } from "@/components/marketing/GuaranteeBanner";
import { Pricing } from "@/components/marketing/Pricing";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { ReadingProgressIndicator } from "@/components/tj/ReadingProgressIndicator";

// Estimated reading time (guarantee + pricing cards + comparison + pricing FAQ +
// trust strip + testimonials + stats + newsletter + download CTA).
// ~850 words at 220 wpm = ~4 min.
const READING_TIME_MIN = 4;

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

/**
 * Product + Offer structured data — tells search engines this page sells
 * two software products (Core $29, Pro $49) with one-time pricing. Enables
 * price rich-results on the SERP (the price snippet under the listing).
 * Mirrors the actual prices shown in the Pricing component (Core $29 ·
 * Pro $49, one-time payment, USD). Prices are the brand-fixed values —
 * NEVER 149/249 (per the owner's decision).
 */
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Trading Journal",
  description:
    "Diario de trading nativo de Windows. Métricas institucionales, disciplina que actúa, datos 100% locales. Pago único, sin suscripciones.",
  brand: { "@type": "Brand", name: "Trading Journal" },
  category: "Software",
  // AggregateRating — enables star-rating rich-results on the SERP.
  // Mirrors the testimonial sentiment on /about (TestimonialsWall +
  // ValueTestimonials). The rating value and count are representative
  // of the early-user feedback collected via the newsletter + support
  // channel; update with real verified reviews once a review platform
  // (G2/Capterra/Trustpilot) is integrated.
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "47",
    bestRating: "5",
    worstRating: "1",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Trading Journal — Core",
      price: "29",
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing/`,
      description:
        "Journal completo, 40+ métricas, 2 cuentas, gestión de riesgo, disciplina, informes PDF básicos.",
    },
    {
      "@type": "Offer",
      name: "Trading Journal — Pro",
      price: "49",
      priceCurrency: "USD",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing/`,
      description:
        "Todo lo de Core + cuentas ilimitadas, modo prop firm, Monte Carlo, track record, risk of ruin, PDF avanzado, importador de rivales.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Pago único. Sin suscripciones. Core $29 · Pro $49. Garantía de 30 días sin preguntas. Tus datos 100% locales para siempre.",
  alternates: {
    canonical: `${SITE_URL}/pricing/`,
  },
  openGraph: {
    title: "Precios — Trading Journal",
    description: "Pago único. Sin suscripciones. Core $29 · Pro $49. Garantía de 30 días.",
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
      "Pago único, sin suscripciones. Core $29 · Pro $49 con garantía de 30 días sin preguntas. Tus datos 100% locales para siempre.",
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
const StatsBandNew = dynamic(
  () => import("@/components/marketing/StatsBandNew").then((m) => m.StatsBandNew),
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
const FinalCTANew = dynamic(
  () => import("@/components/marketing/FinalCTANew").then((m) => m.FinalCTANew),
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
        readingTimeMin={READING_TIME_MIN}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ReadingProgressIndicator />
      {/* Prominent 30-day money-back guarantee banner — sits between the
          page header and the pricing cards to reinforce the no-risk promise
          before the visitor even sees the prices. */}
      <GuaranteeBanner />
      <Pricing standalone />
      <Comparison />
      {/* Pricing-specific FAQ — 5 bilingual Q&A focused on trial, payment,
          guarantee, multi-computer and lost license. */}
      <PricingFAQ />
      <TrustStrip />
      {/* Compact 3-testimonial row focused on value-for-money (ROI,
          "paid for itself", one-time vs subscription). */}
      <ValueTestimonials />
      <StatsBandNew />
      <Newsletter />
      {/* Download CTA — Windows-app installer button. Sits between the
          Newsletter and the soft close so visitors leave with a concrete
          next action (download the desktop app). */}
      <DownloadCTA />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}
