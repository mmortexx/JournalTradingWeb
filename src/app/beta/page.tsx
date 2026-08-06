import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BetaApplication } from "@/components/beta/BetaApplication";
import { BetaStatus } from "@/components/beta/BetaStatus";
import { BetaApplicationNote, BetaDetails } from "@/components/beta/BetaDetails";
import { SITE_URL, hreflangDe } from "@/lib/site";

export const metadata: Metadata = {
  title: "Acceso anticipado",
  description: "Solicita acceso anticipado privado a CountPips para probar la aplicación con tus propios datos.",
  alternates: { canonical: `${SITE_URL}/beta/`, languages: hreflangDe("/beta") },
  openGraph: { title: "Acceso anticipado — CountPips", description: "Solicita acceso anticipado privado a CountPips.", url: `${SITE_URL}/beta/`, type: "website", siteName: "CountPips", locale: "es_ES", alternateLocale: ["en_US"] },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Acceso anticipado de CountPips",
  description: "Solicitud de acceso anticipado privado a CountPips.",
  url: `${SITE_URL}/beta/`,
};

export function BetaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        eyebrowEs="Acceso anticipado"
        eyebrowEn="Early access"
        titleEs="Prueba CountPips antes de la apertura comercial."
        titleEn="Try CountPips before commercial launch."
        titleHighlightEs="apertura comercial."
        titleHighlightEn="commercial launch."
        subtitleEs="La demo pública te enseña el flujo. Este acceso anticipado es para quienes quieren llevar sus propios datos a un piloto privado, con invitación y sin pedir credenciales financieras."
        subtitleEn="The public demo shows the workflow. This early access is for people who want to bring their own data into a private pilot, by invitation and without sharing financial credentials."
        breadcrumbEs="Acceso anticipado"
        breadcrumbEn="Early access"
        readingTimeMin={2}
      />
      <section className="section bg-veil">
        <div className="tj-container">
          <BetaApplication />
          <BetaApplicationNote />
        </div>
      </section>
      <BetaStatus />
      <BetaDetails />
    </>
  );
}

export default BetaPage;
