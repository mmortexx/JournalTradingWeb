import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pricing } from "@/components/marketing/Pricing";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { PlateInterlude } from "@/components/tj/PlateInterlude";
import { SITE_URL, hreflangDe } from "@/lib/site";
import { PRECIO_VALIDO_HASTA } from "@/lib/fechas";

// Estimated reading time (pricing cards + comparison + pricing FAQ +
// trust strip + stats + lista de espera + download CTA).
// ~850 words at 220 wpm = ~4 min.
const READING_TIME_MIN = 4;

// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.

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
 * FAQPage structured data — mirrors the 4 visible Q&A items rendered by
 * the PricingFAQ component (ES-default since the site is ES-default).
 * Per Google's FAQ rich-result guidelines, FAQPage schema must appear on
 * the page where the Q&A is visible — that requirement is met on /pricing
 * (the PricingFAQ component renders here). Unlocks FAQ rich results on
 * the pricing SERP entry. See worklog Task R20-1d (E5) + R20-2d.
 *
 * IMPORTANT: keep this in sync with src/components/marketing/PricingFAQ.tsx
 * if the visible ES Q&A copy changes — Google penalizes schema/visible-text
 * mismatches. The 4 Q&A texts below are the ES version verbatim from
 * PricingFAQ.tsx.
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Puedo probar antes de comprar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Tienes la demo en vivo de esta misma web — sin registro, sin descargar nada, con datos deterministas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué métodos de pago aceptáis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tarjeta de crédito/débito y PayPal. Emitimos factura con IVA si procede.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo usarlo en varios ordenadores?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Una misma licencia te permite instalar CountPips en tus ordenadores personales (tu sobremesa de trading y tu portátil, por ejemplo). Activaciones adicionales se gestionan escribiendo a soporte.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué pasa si pierdo mi licencia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nada. Tu licencia se asocia a tu correo electrónico: escríbenos y te la reenviamos las veces que haga falta. Y aunque pierdas el acceso al correo, tu historial sigue intacto porque vive en tu equipo, no en el nuestro.",
      },
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
  name: "CountPips",
  description:
    "Diario de trading nativo de Windows. Métricas institucionales, disciplina que actúa, datos 100% locales. Pago único, sin suscripciones.",
  brand: { "@type": "Brand", name: "CountPips" },
  category: "Software",
  // Sin `aggregateRating` a propósito: no hay reseñas reales todavía.
  // Ver la nota equivalente en src/app/layout.tsx.
  /* Dos correcciones en las ofertas, y la segunda no es menor:

     · `priceValidUntil` estaba escrito a mano como `2026-12-31`, a menos
       de cinco meses vista. Pasada esa fecha el buscador da la oferta por
       caducada y deja de mostrar el precio, sin avisar. Ahora se calcula.

     · `availability` declaraba `InStock` — «disponible, en existencias»—
       de un producto QUE NO SE PUEDE COMPRAR. Contradice al resto del
       sitio, donde los botones de compra llevan a una lista de espera y
       los términos dicen que las condiciones se publicarán al abrir la
       venta. Declarar disponible lo que no lo está es justo lo que hace
       que un buscador deje de fiarse de tus datos estructurados.
       `PreOrder` es lo que corresponde: anunciado, todavía no a la venta.
       El día que se abra el cobro, esto pasa a `InStock`. */
  offers: [
    {
      "@type": "Offer",
      name: "CountPips — Core",
      price: "29",
      priceCurrency: "USD",
      priceValidUntil: PRECIO_VALIDO_HASTA,
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/pricing/`,
      description:
        "Journal completo, 40+ métricas, 2 cuentas, gestión de riesgo, disciplina, informes PDF básicos.",
    },
    {
      "@type": "Offer",
      name: "CountPips — Pro",
      price: "49",
      priceCurrency: "USD",
      priceValidUntil: PRECIO_VALIDO_HASTA,
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/pricing/`,
      description:
        "Todo lo de Core + cuentas ilimitadas, modo prop firm, Monte Carlo, track record, risk of ruin, PDF avanzado, importador de rivales.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Pago único. Sin suscripciones. Core $29 · Pro $49. Tus datos 100% locales para siempre.",
  alternates: {
    canonical: `${SITE_URL}/pricing/`,
    languages: hreflangDe("/pricing"),
  },
  openGraph: {
    title: "Precios — CountPips",
    description: "Pago único. Sin suscripciones. Core $29 · Pro $49.",
    url: `${SITE_URL}/pricing/`,
    type: "website",
    siteName: "CountPips",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios — CountPips",
    description:
      "Pago único, sin suscripciones. Core $29 · Pro $49. Tus datos 100% locales para siempre.",
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
const SavingsCalculator = dynamic(
  () => import("@/components/marketing/SavingsCalculator").then((m) => m.SavingsCalculator),
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
// ValueTestimonials retirado: sus tres testimonios eran personas
// inventadas. Vuelve cuando haya reseñas reales de usuarios.
const StatsBandNew = dynamic(
  () => import("@/components/marketing/StatsBandNew").then((m) => m.StatsBandNew),
  { loading: () => sectionFallback }
);
const Waitlist = dynamic(
  () => import("@/components/marketing/Waitlist").then((m) => m.Waitlist),
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

/** Exportado con nombre para que `app/en/pricing/page.tsx` lo reutilice.
 *  Sin los `<script>` de datos estructurados. */
export function PricingBody() {
  return (
    <>
      <PageHeader
        eyebrowEs="Precios"
        eyebrowEn="Pricing"
        titleEs="Lo compras una vez. Tuyo para siempre."
        titleEn="You buy it once. Yours forever."
        titleHighlightEs="Tuyo para siempre."
        titleHighlightEn="Yours forever."
        subtitleEs="Sin suscripciones. Sin nube. Sin perder acceso a tu historial si dejas de pagar."
        subtitleEn="No subscriptions. No cloud. No losing access to your history if you stop paying."
        breadcrumbEs="Precios"
        breadcrumbEn="Pricing"
        readingTimeMin={READING_TIME_MIN}
      />
      <Pricing standalone />
      <SavingsCalculator />
      <Comparison />
      {/* Pricing-specific FAQ — 4 bilingual Q&A focused on trial, payment,
          multi-computer and lost license. */}
      <PricingFAQ />

      <PlateInterlude index={0} />
      <TrustStrip />
      <StatsBandNew />

      <PlateInterlude index={1} />
      <Waitlist />
      {/* Download CTA — Windows-app installer button. Sits between the
          la lista de espera y el cierre suave, para que el visitante se vaya con una
          next action (download the desktop app). */}
      <DownloadCTA />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingBody />
    </>
  );
}
