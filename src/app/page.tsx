import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Ticker } from "@/components/marketing/Ticker";
import { PageTransition } from "@/components/tj/PageTransition";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// PNG (not SVG) — see layout.tsx for the rationale (social platforms
// silently fail to render SVG OG images). Absolute URL bypasses the
// metadataBase + basePath double-resolution issue (also see layout.tsx).
const OG_IMAGE = `${SITE_URL}/og.png`;

const PAGE_DESCRIPTION =
  "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina que te frena antes de la tontería y tus datos 100 % en tu máquina. Pago único. Sin suscripciones.";

export const metadata: Metadata = {
  // `absolute` bypasses the parent template (`%s · Trading Journal`) so the
  // home page renders its title verbatim instead of "… · Trading Journal".
  title: { absolute: "Trading Journal — Tu operativa, medida." },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: "Trading Journal — Tu operativa, medida.",
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: "website",
    siteName: "Trading Journal",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Trading Journal — Tu operativa, medida.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Journal — Tu operativa, medida.",
    description:
      "Diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único.",
    images: [OG_IMAGE],
  },
};

// Heavy below-the-fold sections are split into their own JS chunks via
// `next/dynamic` so the initial bundle stays lean and each section's JS
// is fetched only when needed. Each gets a lightweight skeleton fallback
// (a tall spacer) so layout shift is avoided while the chunk loads.
const sectionFallback = (
  <div className="section" aria-hidden="true" style={{ minHeight: 360 }} />
);
const HeroVideo = dynamic(
  () => import("@/components/marketing/HeroVideo").then((m) => m.HeroVideo),
  { loading: () => <div className="min-h-screen bg-black" aria-hidden="true" /> }
);
const Bento = dynamic(
  () => import("@/components/marketing/Bento").then((m) => m.Bento),
  { loading: () => sectionFallback }
);
const FeaturePreview = dynamic(
  () => import("@/components/marketing/FeaturePreview").then((m) => m.FeaturePreview),
  { loading: () => sectionFallback }
);
const HomeCTASection = dynamic(
  () => import("@/components/marketing/HomeCTASection").then((m) => m.HomeCTASection),
  { loading: () => sectionFallback }
);
const FinalCTA = dynamic(
  () => import("@/components/marketing/FinalCTA").then((m) => m.FinalCTA),
  { loading: () => sectionFallback }
);

export default function Home() {
  // Round 1 redesign — simplified home to a tight 6-section rhythm:
  //   Hero → Ticker → Bento → FeaturePreview → CTA → FinalCTA.
  // Removed: ProofBar, TrustedBy, PositioningStrip, FeatureRotator,
  // StatsBand, BlogPreview. The remaining sections already cover social
  // proof (Ticker trades), feature depth (Bento + FeaturePreview), and
  // conversion (CTA + FinalCTA) without redundant bands stacking up.
  return (
    <PageTransition>
      {/* Hero — also keeps id="top" inside <Hero> for the command palette's "Go to top". */}
      <div id="hero" className="scroll-mt-16">
        <HeroVideo />
      </div>
      <Ticker />
      {/* Anchor target for in-page navigation to the feature preview. */}
      <div id="features-preview" className="scroll-mt-16">
        <Bento />
      </div>
      {/* Compact 3-card feature preview — bridges Bento and the CTA section. */}
      <FeaturePreview />
      {/* Anchor target for the navigation-card CTA section. */}
      <div id="cta" className="scroll-mt-16">
        <HomeCTASection />
      </div>
      {/* Anchor target for the closing CTA. */}
      <div id="final-cta" className="scroll-mt-16">
        <FinalCTA />
      </div>
    </PageTransition>
  );
}
