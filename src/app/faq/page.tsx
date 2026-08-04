import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FAQ } from "@/components/marketing/FAQ";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { PlateInterlude } from "@/components/tj/PlateInterlude";
import { SITE_URL, hreflangDe } from "@/lib/site";

// Estimated reading time (16 Q&A entries + contact sections). ~650 words
// across all answers at 220 wpm = ~3 min.
const READING_TIME_MIN = 3;

// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.

/**
 * Breadcrumb structured data — page-specific. Lists just [Home, FAQ]
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
      name: "FAQ",
      item: `${SITE_URL}/faq/`,
    },
  ],
};

/**
 * FAQ structured data — mirrors the ES questions/answers shown in the
 * FAQ component below so Google can render FAQ rich snippets on the SERP.
 * Lives on this page ONLY (not in `layout.tsx`): Google's structured data
 * guidelines require FAQ schema to appear on pages where the Q&A is
 * actually visible to the user, and emitting it on every page can trigger
 * a manual-action penalty.
 */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Es realmente de pago único?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Pagas una vez y la app es tuya para siempre, sin recurrencias ni cargos ocultos. Incluye todas las actualizaciones de la versión principal que compres y descuentos generosos en futuras versiones mayores.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mis datos están seguros?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tus datos viven en un único archivo .sqlite dentro de tu equipo. Nunca se suben a ningún servidor: no hay servidor. Puedes cifrar la carpeta con BitLocker/VeraCrypt para una capa extra de seguridad.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo exportar mis datos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Puedes exportar todo tu journal a CSV (para Excel o Google Sheets), PDF (informes listos para compartir) y JSON (backup completo y reimportable). Tus datos son tuyos: puedes llevártelos cuando quieras, sin API que cerrar ni servidor que apagar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona en Mac o Linux?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CountPips es una app nativa de Windows (WinUI 3). En Mac o Linux puedes ejecutarla a través de una máquina virtual con Windows o Parallels. Estamos explorando activamente una versión local-first para Mac y Linux: si quieres ser beta tester cuando salga, escríbenos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo importar de otro journal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Aceptamos importación desde CSV (formato flexible con mapeo de columnas) y un importador dedicado para journals populares. Si tu journal actual exporta a CSV, lo tienes en tu CountPips en menos de 5 minutos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué pasa si pierdo mi licencia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tu licencia se asocia a tu correo electrónico. Puedes recuperarla cuantas veces necesites escribiendo al soporte. Y aunque pierdas el acceso a tu correo, tu historial sigue intacto porque vive en tu equipo, no en el nuestro.",
      },
    },
    {
      "@type": "Question",
      name: "¿Hay actualizaciones?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, y son gratuitas dentro de la misma versión mayor (1.x → 1.x). Las versiones mayores (2.0, 3.0…) serán de pago, pero con descuento preferente para quienes ya tengan una licencia.",
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
      name: "¿Puedo probar antes de comprar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Puedes explorar la demo en vivo de esta misma web con datos deterministas, sin registro y sin descargar nada. Es la app recreada al completo: puedes recorrer las pantallas y ver exactamente qué te llevas antes de pagar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es la diferencia entre Core y Pro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Core incluye el journal completo, 40+ métricas, 2 cuentas de trading, gestión de riesgo, disciplina e informes PDF básicos. Pro desbloquea además: cuentas ilimitadas, modo prop firm, simulador Monte Carlo, informe de track record, risk of ruin, informes PDF avanzados y el importador de rivales que migra tu journal anterior en 5 minutos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona sin internet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, 100 % local. Una vez descargada e instalada, la app no necesita conexión a internet para nada: ni para abrir tu journal, ni para registrar operaciones, ni para generar informes. Tus datos nunca salen de tu equipo. Solo necesitas internet para descargar la app, recibir actualizaciones (opcional) o activar tu licencia la primera vez.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo usarlo en varios ordenadores?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Una misma licencia te permite instalar CountPips en tus ordenadores personales (tu sobremesa de trading y tu portátil, por ejemplo). Tu archivo .sqlite es portable: cópialo a una carpeta compartida o llévalo en un pendrive y trabajarás desde cualquiera de los equipos como si fuera el mismo. Las activaciones adicionales se gestionan escribiendo a soporte.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué pasa si cambio de ordenador?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nada. Tu historial vive en un único archivo .sqlite portable. Cópialo al nuevo equipo (pendrive, disco externo, carpeta compartida) y seguirás trabajando como si no hubiera pasado nada. Tu licencia se asocia a tu correo, no a la máquina: reinstala la app en el equipo nuevo, activa con tu correo y listo.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Preguntas frecuentes sobre CountPips: precio, privacidad, compatibilidad, importación, actualizaciones y más.",
  alternates: {
    canonical: `${SITE_URL}/faq/`,
    languages: hreflangDe("/faq"),
  },
  openGraph: {
    title: "FAQ — CountPips",
    description: "Preguntas frecuentes sobre CountPips: precio, privacidad, compatibilidad y más.",
    url: `${SITE_URL}/faq/`,
    type: "website",
    siteName: "CountPips",
    locale: "es_ES",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — CountPips",
    description:
      "Preguntas frecuentes sobre CountPips: precio, privacidad, compatibilidad, importación, actualizaciones y más.",
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean. Each gets a tall
// skeleton fallback to prevent layout shift while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
// `StillHaveQuestions` retirado de esta página (ver el comentario junto
// a <ContactSupport /> más abajo).
const ContactSupport = dynamic(
  () => import("@/components/marketing/ContactSupport").then((m) => m.ContactSupport),
  { loading: () => sectionFallback }
);
const EdgeSignificanceChecker = dynamic(
  () => import("@/components/marketing/EdgeSignificanceChecker").then((m) => m.EdgeSignificanceChecker),
  { loading: () => sectionFallback }
);
const ContactForm = dynamic(
  () => import("@/components/marketing/ContactForm").then((m) => m.ContactForm),
  { loading: () => sectionFallback }
);
const FinalCTANew = dynamic(
  () => import("@/components/marketing/FinalCTANew").then((m) => m.FinalCTANew),
  { loading: () => sectionFallback }
);

/** Exportado con nombre para que `app/en/faq/page.tsx` lo reutilice. Sin
 *  los `<script>` de datos estructurados. */
export function FaqBody() {
  return (
    <>
      <PageHeader
        eyebrowEs="Dudas"
        eyebrowEn="Questions"
        titleEs="Preguntas frecuentes."
        titleEn="Frequently asked questions."
        titleHighlightEs="frecuentes."
        titleHighlightEn="questions."
        subtitleEs="Todo lo que necesitas saber antes de comprar. ¿No encuentras tu respuesta? Consulta el glosario o escríbenos."
        subtitleEn="Everything you need to know before buying. Can't find your answer? Browse the glossary or write to us."
        breadcrumbEs="FAQ"
        breadcrumbEn="FAQ"
        readingTimeMin={READING_TIME_MIN}
      />
      <FAQ standalone />
      <EdgeSignificanceChecker num="01" />
      {/* `StillHaveQuestions` retirado: la página encadenaba CUATRO
          bloques seguidos diciendo lo mismo ("¿aún tienes dudas?",
          "¿no encuentras tu respuesta?", el formulario y el cierre).
          Aquel banner era además una caja de cristal a todo ancho con
          una sola frase centrada, sin icono ni acción. El componente
          sigue en el repositorio por si hace falta en otra página. */}
      <ContactSupport />

      <PlateInterlude index={0} />
      <ContactForm />

      <PlateInterlude index={1} />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqBody />
    </>
  );
}
