import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Características", item: `${SITE_URL}/features/` },
    { "@type": "ListItem", position: 3, name: "Disciplina", item: `${SITE_URL}/features/disciplina/` },
  ],
};

export const metadata: Metadata = {
  title: "Disciplina — Trading Journal",
  description:
    "El Guardián frena antes del error: bloquea tamaños que exceden tu riesgo, te obliga a respetar el plan y audita cada excepción. Lo que tu indisciplina te cuesta, medido.",
  alternates: { canonical: `${SITE_URL}/features/disciplina/` },
  openGraph: {
    title: "Disciplina — Trading Journal",
    description: "El Guardián frena antes del error. Disciplina que actúa, no que sermonea.",
    url: `${SITE_URL}/features/disciplina/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disciplina — Trading Journal",
    description: "El Guardián frena antes del error. Disciplina que actúa, no que sermonea.",
  },
};

const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const GuardianNew = dynamic(
  () => import("@/components/marketing/GuardianNew").then((m) => m.GuardianNew),
  { loading: () => sectionFallback }
);
const DisciplineCost = dynamic(
  () => import("@/components/marketing/DisciplineCost").then((m) => m.DisciplineCost),
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

export default function DisciplinaPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Producto"
        eyebrowEn="Product"
        titleEs="Disciplina que actúa, no que sermonea."
        titleEn="Discipline that acts, not lectures."
        titleHighlightEs="actúa."
        titleHighlightEn="acts."
        subtitleEs="El Guardián no te dice qué hacer. Te bloquea cuando rompes tus propias reglas: tamaños que exceden tu riesgo, drawdowns diarios, operaciones fuera de plan. Cada override queda registrado con motivo y resultado."
        subtitleEn="The Guardian doesn't tell you what to do. It blocks you when you break your own rules: sizes over your risk, daily drawdowns, off-plan trades. Every override is logged with reason and outcome."
        breadcrumbEs="Características · Disciplina"
        breadcrumbEn="Features · Discipline"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <GuardianNew num="01" />
      <DisciplineCost num="02" />
      <BeforeAfter />
      <ComparisonSlider />
      <FinalCTANew />
    </>
  );
}
