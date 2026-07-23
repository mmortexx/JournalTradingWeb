import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeaturePageNav } from "@/components/marketing/FeaturePageNav";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";

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
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SecuritySection num="01" />
      <TechSpecs />
      <Integrations />
      <FeaturePageNav current="seguridad" />
      <FinalCTANew />
    </>
  );
}
