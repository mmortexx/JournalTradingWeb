import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { LegalDoc } from "@/components/legal/LegalDoc";
import { documentoPorSlug } from "@/lib/legal/documentos";
import { SITE_URL } from "@/lib/site";

/**
 * /cookies — la lista de todo lo que la web deja en tu navegador.
 *
 * El aviso de cookies pedía consentimiento sin ofrecer nada que
 * consultar, que es justo lo que la norma no permite. Ahora enlaza aquí.
 *
 * La página tiene además un valor comercial que conviene no desaprovechar:
 * este producto vende que tus datos no salen de tu máquina, y ésta es la
 * única página donde eso se puede demostrar con una lista cerrada en vez
 * de con un eslogan.
 */

const doc = documentoPorSlug("cookies")!;

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: doc.tituloEs, item: `${SITE_URL}/cookies/` },
  ],
};

export const metadata: Metadata = {
  title: doc.tituloEs,
  description: doc.descripcionEs,
  alternates: { canonical: `${SITE_URL}/cookies/` },
  openGraph: {
    title: `${doc.tituloEs} — CountPips`,
    description: doc.descripcionEs,
    url: `${SITE_URL}/cookies/`,
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

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Legal"
        eyebrowEn="Legal"
        titleEs="Esta web no usa cookies."
        titleEn="This site uses no cookies."
        titleHighlightEs="no usa cookies."
        titleHighlightEn="no cookies."
        subtitleEs="Recuerda siete preferencias tuyas en el propio navegador, y ninguna sale de él. Aquí está la lista completa, sin excepciones, y cómo borrarla."
        subtitleEn="It remembers seven of your preferences in the browser itself, and none of them leaves it. Here is the full list, with no exceptions, and how to delete it."
        breadcrumbEs="Cookies"
        breadcrumbEn="Cookies"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LegalDoc doc={doc} />
    </>
  );
}
