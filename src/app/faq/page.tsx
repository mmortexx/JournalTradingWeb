import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { FAQ } from "@/components/marketing/FAQ";
import { TableOfContents } from "@/components/tj/TableOfContents";
import { ReadingProgressIndicator } from "@/components/tj/ReadingProgressIndicator";

// Estimated reading time (16 Q&A entries + contact sections). ~650 words
// across all answers at 220 wpm = ~3 min.
const READING_TIME_MIN = 3;

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.
const OG_IMAGE = `${SITE_URL}/og.png`;

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
        text: "Trading Journal es una app nativa de Windows (WinUI 3). En Mac o Linux puedes ejecutarla a través de una máquina virtual con Windows o Parallels. Estamos evaluando una versión web local-first para el futuro.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo importar de otro journal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Aceptamos importación desde CSV (formato flexible con mapeo de columnas) y un importador dedicado para journals populares. Si tu journal actual exporta a CSV, lo tienes en tu Trading Journal en menos de 5 minutos.",
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
      name: "¿Y si la app no es para mí?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tienes 30 días desde la compra para pedir reembolso completo, sin preguntas. Escríbenos y lo gestionamos en menos de 48 h.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo probar antes de comprar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Puedes explorar la demo en vivo de esta misma web con datos deterministas (sin registro, sin descargar nada). Si después de comprar sientes que no encaja, tienes 30 días de garantía de devolución completa, sin preguntas.",
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
      name: "¿Cómo funciona la garantía de 30 días?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compras con total tranquilidad. Si en 30 días sientes que la app no es para ti, escribes a soporte y te devolvemos el 100% del dinero, sin preguntas ni condiciones. Sin formularios, sin interrogatorios.",
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
        text: "Sí. Una misma licencia te permite instalar Trading Journal en tus ordenadores personales (tu sobremesa de trading y tu portátil, por ejemplo). Tu archivo .sqlite es portable: cópialo a una carpeta compartida o llévalo en un pendrive y trabajarás desde cualquiera de los equipos como si fuera el mismo. Las activaciones adicionales se gestionan escribiendo a soporte.",
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
    {
      "@type": "Question",
      name: "¿Hay versión nativa para Mac o Linux?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Por ahora Trading Journal es nativa de Windows (WinUI 3). En Mac o Linux puedes ejecutarla a través de una máquina virtual con Windows o Parallels. Estamos explorando activamente una versión local-first para Mac y Linux: si quieres ser beta tester cuando salga, escríbenos.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Preguntas frecuentes sobre Trading Journal: precio, privacidad, compatibilidad, importación, actualizaciones y más.",
  alternates: {
    canonical: `${SITE_URL}/faq/`,
  },
  openGraph: {
    title: "FAQ — Trading Journal",
    description: "Preguntas frecuentes sobre Trading Journal: precio, privacidad, compatibilidad y más.",
    url: `${SITE_URL}/faq/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FAQ — Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Trading Journal",
    description:
      "Preguntas frecuentes sobre Trading Journal: precio, privacidad, compatibilidad, importación, actualizaciones y más.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean. Each gets a tall
// skeleton fallback to prevent layout shift while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const StillHaveQuestions = dynamic(
  () => import("@/components/marketing/StillHaveQuestions").then((m) => m.StillHaveQuestions),
  { loading: () => sectionFallback }
);
const ContactSupport = dynamic(
  () => import("@/components/marketing/ContactSupport").then((m) => m.ContactSupport),
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

export default function FaqPage() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ReadingProgressIndicator />
      <FAQ standalone />
      <StillHaveQuestions />
      <ContactSupport />
      <ContactForm />
      <FinalCTANew />
      <TableOfContents />
    </>
  );
}
