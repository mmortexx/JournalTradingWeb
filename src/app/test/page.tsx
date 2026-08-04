import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FinalCTANew } from "@/components/marketing/FinalCTANew";
import { PlateInterlude } from "@/components/tj/PlateInterlude";
import { QUESTIONS } from "@/lib/trading/disciplineQuestions";
import { SITE_URL } from "@/lib/site";

/**
 * /test — el diagnóstico de disciplina, con página propia.
 *
 * Vivía enterrado al final de `/features/disciplina`, donde sólo lo
 * encontraba quien ya había leído la página entera. Es la pieza que más
 * engancha del sitio —el visitante sale con una cifra suya y un siguiente
 * paso concreto—, así que tiene entrada en la navegación principal y
 * dirección propia que compartir.
 *
 * La página es deliberadamente corta: el diagnóstico y poco más. Meterle
 * secciones alrededor competiría con lo único que se ha venido a hacer.
 */

// El test son quince preguntas de lectura rápida; el tiempo estimado es
// el de responderlo, que es lo que le importa a quien llega.
const READING_TIME_MIN = 4;

const DisciplineScore = dynamic(
  () => import("@/components/marketing/DisciplineScore").then((m) => m.DisciplineScore),
);

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Test de disciplina", item: `${SITE_URL}/test/` },
  ],
};

/* Datos estructurados de cuestionario. Google entiende `Quiz` y puede
   mostrarlo como resultado enriquecido; describe lo que la página HACE,
   no lo que dice, que es la diferencia entre un test y un artículo.
   `educationalLevel` con texto libre («beginner to advanced») no es un
   valor que el vocabulario reconozca — se retira en vez de dejar un
   campo que no aporta nada a cambio de parecer más completo. */
const quizSchema = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: "Test de disciplina operativa",
  about: {
    "@type": "Thing",
    name: "Disciplina en trading",
  },
  inLanguage: "es",
  url: `${SITE_URL}/test/`,
  publisher: { "@type": "Organization", name: "CountPips" },
  /* `hasPart` con las quince preguntas es lo que exige el vocabulario de
     `Quiz` para el resultado enriquecido — sin él, el bloque entero es
     válido pero no genera nada visible en el buscador. Las preguntas se
     importan de `DisciplineScore`, que es donde viven de verdad: si un
     día cambia una pregunta ahí, este bloque cambia solo. */
  hasPart: QUESTIONS.map((q) => ({
    "@type": "Question",
    text: q.qEs,
    /* Es autoevaluación, no examen: no hay una respuesta "correcta" que
       marcar. `Answer` con el texto de la opción menos disciplinada —la
       primera, ver el comentario en DisciplineScore.tsx sobre el orden—
       basta para que el marcado sea válido sin fingir un acierto que no
       existe. */
    acceptedAnswer: {
      "@type": "Answer",
      text: q.options[0].es,
    },
  })),
};

export const metadata: Metadata = {
  title: "Test de disciplina",
  description:
    "Quince preguntas sobre riesgo, plan, registro, temple y constancia. Tu perfil por ejes, una cifra global ponderada y qué arreglar primero. Sin email.",
  alternates: {
    canonical: `${SITE_URL}/test/`,
  },
  openGraph: {
    title: "Test de disciplina — CountPips",
    description:
      "Mídete en cinco ejes: riesgo, plan, registro, temple y constancia. Perfil completo y por dónde empezar.",
    url: `${SITE_URL}/test/`,
    type: "website",
    siteName: "CountPips",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Test de disciplina — CountPips",
    description:
      "Quince preguntas, cinco ejes, una cifra ponderada y qué arreglar primero. Sin email.",
  },
};

export default function TestPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Diagnóstico"
        eyebrowEn="Diagnosis"
        titleEs="¿Qué tipo de trader eres?"
        titleEn="What kind of trader are you?"
        titleHighlightEs="trader eres?"
        titleHighlightEn="trader are you?"
        subtitleEs="No es un test de personalidad: son quince preguntas sobre lo que haces de verdad cuando el mercado va en contra. Al final, tu perfil en cinco ejes y el que conviene arreglar primero."
        subtitleEn="Not a personality quiz: fifteen questions about what you actually do when the market turns. At the end, your profile across five axes and the one worth fixing first."
        breadcrumbEs="Test"
        breadcrumbEn="Quiz"
        readingTimeMin={READING_TIME_MIN}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />

      <DisciplineScore num="01" />

      <PlateInterlude index={0} />
      <FinalCTANew />
    </>
  );
}
