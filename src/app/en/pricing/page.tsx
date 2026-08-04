import type { Metadata } from "next";
import { PricingBody } from "../../pricing/page";
import { SITE_URL, hreflangDe } from "@/lib/site";
import { PRECIO_VALIDO_HASTA } from "@/lib/fechas";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en/` },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/en/pricing/` },
  ],
};

/* Debe coincidir palabra por palabra con las 4 preguntas EN visibles en
   `PricingFAQ.tsx` — están copiadas de ahí, no traducidas de nuevo, por
   el mismo motivo que avisa el fichero español: Google penaliza cuando
   el dato estructurado no coincide con lo que se ve en pantalla. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I try before buying?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You have the live demo on this very site — no signup, nothing to download, with deterministic data.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Credit/debit card and PayPal. We issue VAT invoices where applicable.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use it on multiple computers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A single license lets you install CountPips on your personal computers (your trading desktop and your laptop, for example). Extra activations can be arranged by emailing support.",
      },
    },
    {
      "@type": "Question",
      name: "What if I lose my license?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nothing happens. Your license is tied to your email address: write to us and we'll resend it as many times as you need. And even if you lose access to that email, your history stays intact because it lives on your machine, not ours.",
      },
    },
  ],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "CountPips",
  description:
    "Windows-native trading journal. Institutional metrics, discipline that acts, 100% local data. One-time payment, no subscriptions.",
  brand: { "@type": "Brand", name: "CountPips" },
  category: "Software",
  offers: [
    {
      "@type": "Offer",
      name: "CountPips — Core",
      price: "29",
      priceCurrency: "USD",
      priceValidUntil: PRECIO_VALIDO_HASTA,
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/en/pricing/`,
      description:
        "Full journal, 40+ metrics, 2 accounts, risk management, discipline, basic PDF reports.",
    },
    {
      "@type": "Offer",
      name: "CountPips — Pro",
      price: "49",
      priceCurrency: "USD",
      priceValidUntil: PRECIO_VALIDO_HASTA,
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/en/pricing/`,
      description:
        "Everything in Core plus unlimited accounts, prop firm mode, Monte Carlo, track record, risk of ruin, advanced PDF, rival importer.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One-time payment. No subscriptions. Core $29 · Pro $49. Your data 100% local, forever.",
  alternates: {
    canonical: `${SITE_URL}/en/pricing/`,
    languages: hreflangDe("/pricing"),
  },
  openGraph: {
    title: "Pricing — CountPips",
    description: "One-time payment. No subscriptions. Core $29 · Pro $49.",
    url: `${SITE_URL}/en/pricing/`,
    type: "website",
    siteName: "CountPips",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — CountPips",
    description: "One-time payment, no subscriptions. Core $29 · Pro $49. Your data 100% local, forever.",
  },
};

export default function PricingEnPage() {
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
