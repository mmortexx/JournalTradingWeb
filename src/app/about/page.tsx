import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { Story } from "@/components/marketing/Story";
import { Values } from "@/components/marketing/Values";
import { FinalCTA } from "@/components/marketing/FinalCTA";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images. See layout.tsx for the full note.
const OG_IMAGE = `${SITE_URL}/og.png`;

/**
 * Breadcrumb structured data — page-specific. Lists just [Home, About]
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
      name: "Acerca de",
      item: `${SITE_URL}/about/`,
    },
  ],
};

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "La historia de Trading Journal: por qué existe, para quién es, y cómo evoluciona. Hecho para el trader manual serio.",
  alternates: {
    canonical: `${SITE_URL}/about/`,
  },
  openGraph: {
    title: "Acerca de — Trading Journal",
    description: "La historia de Trading Journal: por qué existe, para quién es, y cómo evoluciona.",
    url: `${SITE_URL}/about/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Acerca de — Trading Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acerca de — Trading Journal",
    description:
      "La historia de Trading Journal: por qué existe, para quién es, y cómo evoluciona. Hecho para el trader manual serio.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean. Each gets a tall
// skeleton fallback to prevent layout shift while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const SocialProof = dynamic(
  () => import("@/components/marketing/SocialProof").then((m) => m.SocialProof),
  { loading: () => sectionFallback }
);
const TestimonialsWall = dynamic(
  () => import("@/components/marketing/TestimonialsWall").then((m) => m.TestimonialsWall),
  { loading: () => sectionFallback }
);
const Changelog = dynamic(
  () => import("@/components/marketing/Changelog").then((m) => m.Changelog),
  { loading: () => sectionFallback }
);
const Milestones = dynamic(
  () => import("@/components/marketing/Milestones").then((m) => m.Milestones),
  { loading: () => sectionFallback }
);
const Newsletter = dynamic(
  () => import("@/components/marketing/Newsletter").then((m) => m.Newsletter),
  { loading: () => sectionFallback }
);

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrowEs="Acerca de"
        eyebrowEn="About"
        titleEs="Hecho para el trader manual serio."
        titleEn="Made for the serious manual trader."
        titleHighlightEs="manual serio."
        titleHighlightEn="manual trader."
        subtitleEs="No es un SaaS más. Es una app nativa de Windows que vive en tu máquina, con métricas institucionales y disciplina que se mide en dinero."
        subtitleEn="Not another SaaS. It's a native Windows app that lives on your machine, with institutional metrics and discipline measured in money."
        breadcrumbEs="Acerca de"
        breadcrumbEn="About"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Story />
      <Values />
      <SocialProof />
      <TestimonialsWall />
      <Changelog />
      <Milestones />
      <Newsletter />
      <FinalCTA />
    </>
  );
}
