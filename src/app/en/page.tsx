import type { Metadata } from "next";
import { HomeBody } from "../page";
import { SITE_URL, hreflangDe } from "@/lib/site";

/**
 * `/en` — la portada en inglés.
 *
 * El CUERPO es literalmente el mismo que `/`: `HomeBody`, importado del
 * fichero hermano. No hay nada que traducir aquí porque cada sección ya
 * lee `useLang()` por su cuenta y elige entre sus props `...Es`/`...En` —
 * es la misma composición de componentes, montada bajo una dirección que
 * hace que `LanguageProvider` derive "en" en vez de "es". Lo único que
 * este fichero aporta es la metadata: lo que un buscador o un enlace
 * compartido ven ANTES de que se ejecute una sola línea de React.
 */
const PAGE_DESCRIPTION =
  "Windows-native trading journal. Institutional metrics, discipline that stops the mistake, and 100% local data. One-time payment from $29. No subscriptions.";

export const metadata: Metadata = {
  title: { absolute: "CountPips — Trade like an institutional desk." },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/en/`,
    languages: hreflangDe("/"),
  },
  openGraph: {
    title: "CountPips — Trade like an institutional desk.",
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/en/`,
    type: "website",
    siteName: "CountPips",
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CountPips — Trade like an institutional desk.",
    description:
      "Professional trading journal, native to Windows. Institutional metrics, discipline, and 100% local data. One-time payment from $29.",
  },
};

export default function HomeEn() {
  return <HomeBody />;
}
