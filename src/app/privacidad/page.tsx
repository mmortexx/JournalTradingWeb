import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { documentoPorSlug } from "@/lib/legal/documentos";
import { SITE_URL } from "@/lib/site";

/**
 * /privacidad — qué datos recoge la web.
 *
 * El pie del sitio llevaba meses enlazando «Privacidad» a `#`, en las diez
 * páginas, mientras dos formularios recogían correos. Esta página existe
 * para cerrar eso.
 *
 * `robots: index` a propósito, aunque una legal no atraiga visitas: que
 * exista y sea accesible es una señal de confianza que los buscadores
 * valoran, y las pasarelas de pago la piden localizable antes de aprobar
 * una cuenta.
 */

const doc = documentoPorSlug("privacidad")!;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: doc.tituloEs, item: `${SITE_URL}/privacidad/` },
  ],
};

export const metadata: Metadata = {
  title: doc.tituloEs,
  description: doc.descripcionEs,
  alternates: { canonical: `${SITE_URL}/privacidad/` },
  openGraph: {
    title: `${doc.tituloEs} — CountPips`,
    description: doc.descripcionEs,
    url: `${SITE_URL}/privacidad/`,
    type: "website",
    siteName: "CountPips",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${doc.tituloEs} — CountPips`,
    description: doc.descripcionEs,
  },
};

export default function PrivacidadPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Legal"
        eyebrowEn="Legal"
        titleEs="Política de privacidad."
        titleEn="Privacy policy."
        titleHighlightEs="privacidad."
        titleHighlightEn="policy."
        subtitleEs="Dos formularios, ninguna analítica y ningún rastreo. Aquí está exactamente qué se recoge, quién lo trata y cómo pedir que se borre."
        subtitleEn="Two forms, no analytics and no tracking. Here is exactly what is collected, who processes it and how to have it deleted."
        breadcrumbEs="Privacidad"
        breadcrumbEn="Privacy"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LegalDoc doc={doc} />
    </>
  );
}
