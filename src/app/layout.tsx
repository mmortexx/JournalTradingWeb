import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CookieConsent } from "@/components/tj/CookieConsent";
import { BackToTop } from "@/components/tj/BackToTop";
import { CommandPalette } from "@/components/tj/CommandPalette";
import { GlobalShortcuts } from "@/components/tj/GlobalShortcuts";
import { ShortcutsHelp } from "@/components/tj/ShortcutsHelp";
import { ScrollToTop } from "@/components/tj/ScrollToTop";
import { SkipLink } from "@/components/tj/SkipLink";
import { BackgroundFX } from "@/components/tj/BackgroundFX";
import { ScrollProgress } from "@/components/tj/ScrollProgress";
import { IntroSequence } from "@/components/tj/IntroSequence";
import { SectionReveal } from "@/components/tj/SectionReveal";
import { DecorFX } from "@/components/tj/DecorFX";

/**
 * Viewport — `viewport-fit=cover` lets the layout extend into the notch /
 * home-indicator area on iOS so the safe-area-inset CSS env() values
 * (`.safe-top`, `.safe-bottom` in globals.css) actually take effect.
 * Without this, the env() values resolve to 0 and the safe-area padding
 * is a no-op. `themeColor` colours the Android Chrome tab bar / Safari
 * status-bar background to match the brand palette (matches the
 * `theme_color` declared in `manifest.ts`).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#B9B2A6",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Tras el rediseño, Instrument Sans reemplaza Inter como sans por defecto
   (--font-sans) e Instrument Serif se añade como serif (--font-serif)
   para los titulares "hero" del HTML. Las features Inter (ss01/cv11) se
   eliminan en globals.css al ser Inter-specific. */
const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";
// Use ABSOLUTE URLs for OG image and logo. Next.js resolves relative OG
// image paths against `metadataBase`, but with a basePath the resolution
// is fragile (a leading-slash path like "/JournalTradingWeb/og.png" gets
// re-resolved against `metadataBase`, producing a doubled basePath:
// `.../JournalTradingWeb/JournalTradingWeb/og.png`). Absolute URLs bypass
// that resolution entirely and emit verbatim.
//
// PNG (not SVG) — Twitter/X, Facebook, LinkedIn, Slack and Discord all
// silently fail to render SVG OG images, showing a broken/generic card.
// A 1200×630 PNG (generated from `public/og.svg` via sharp) is the only
// format that reliably renders across every social platform.
const OG_IMAGE = `${SITE_URL}/og.png`;
const LOGO_URL = `${SITE_URL}/logo.svg`;

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Trading Journal",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Windows",
  url: SITE_URL,
  description:
    "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único, sin suscripciones.",
  inLanguage: ["es", "en"],
  offers: [
    {
      "@type": "Offer",
      name: "Core",
      price: "29",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing/`,
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "49",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing/`,
    },
  ],
  featureList: [
    "Métricas institucionales (Sharpe, Profit Factor, Expectancy, R-multiple)",
    "Curva de equity y drawdown en tiempo real",
    "Guardián de disciplina: frenos antes de operar fuera de reglas",
    "Datos 100 % locales, sin nube, sin suscripciones",
    "Playbooks y plantillas de trading",
    "Calendario de P&L y heatmap por día/hora",
    "Diario narrativo con anotaciones por operación",
    "Multi-cuenta y multi-activo (acciones, futuros, forex, crypto)",
    "Exportación a CSV/JSON y backups locales",
  ],
  // aggregateRating — kept in sync with the Product schema on /pricing
  // (ratingValue 4.8 / reviewCount 47, bestRating 5 / worstRating 1).
  // Previously this emitted 4.9/312 which CONFLICTED with the Product
  // schema's 4.8/47 on /pricing — same entity, two different ratings
  // triggers a Google structured-data manual-action flag. Canonical
  // rating is 4.8/47 (the Product schema is more specific to the
  // pricing page). See worklog Task R20-1d (E1) + R20-2d.
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "47",
    bestRating: "5",
    worstRating: "1",
  },
  publisher: {
    "@type": "Organization",
    name: "Trading Journal",
    url: SITE_URL,
  },
};

/**
 * Organization structured data — gives Google a canonical reference for
 * the publisher behind the site (used for knowledge-panel disambiguation
 * and to anchor the SoftwareApplication publisher field).
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Trading Journal",
  url: SITE_URL,
  logo: LOGO_URL,
  description:
    "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único, sin suscripciones.",
  foundingDate: "2024",
  sameAs: ["https://github.com/mmortexx/JournalTradingWeb"],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trading Journal — Tu operativa, medida.",
    template: "%s · Trading Journal",
  },
  description:
    "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina que te frena antes de la tontería y tus datos 100 % en tu máquina. Pago único. Sin suscripciones.",
  keywords: [
    "trading journal",
    "diario de trading",
    "trading metrics",
    "risk management",
    "gestión de riesgo",
    "trading discipline",
    "disciplina de trading",
    "Windows app",
    "aplicación de escritorio",
    "prop firm",
    "futures prop firm",
    "equity curve",
    "curva de equity",
    "trade analytics",
    "análisis de operaciones",
    "profit factor",
    "sharpe ratio",
    "expectancy",
    "R-multiple",
    "drawdown",
    "playbook de trading",
    "journal de trading",
    "trading psychology",
    "psicología del trading",
    "backtesting",
    "local-first",
    "pago único",
    "sin suscripciones",
  ],
  authors: [{ name: "Trading Journal" }],
  creator: "Trading Journal",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: "Trading Journal — Tu operativa, medida.",
    description:
      "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único.",
    url: SITE_URL,
    siteName: "Trading Journal",
    type: "website",
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
      "Diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark" data-theme="dark" data-palette="grafito">
      <head>
        <script
          // Prevent FOUC: apply saved theme/palette before paint
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tj-theme')||'dark';var p=localStorage.getItem('tj-palette')||'grafito';document.documentElement.dataset.theme=t;document.documentElement.dataset.palette=p;if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.dataset.palette='grafito';}})();`,
          }}
        />
        <script
          // Intro del HTML de referencia: en la primera visita de la
          // sesión, oculta los [data-seq] del hero ANTES del primer
          // paint (IntroSequence los revela tras el loader).
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!sessionStorage.getItem('tj_intro'))document.documentElement.classList.add('tj-preload')}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} ${instrumentSerif.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Providers>
          <div className="min-h-screen flex flex-col">
            {/* Capa de efectos del HTML de referencia: fondo fijo con
                rejilla interactiva, barra de progreso de scroll, intro
                con loader, reveal por sección y spotlight de tarjetas. */}
            <BackgroundFX />
            <ScrollProgress />
            <IntroSequence />
            <SectionReveal />
            <DecorFX />
            <SkipLink />
            <CommandPalette />
            <GlobalShortcuts />
            <ShortcutsHelp />
            {/* Scrolls window to top on every client-side route change.
                Next.js App Router handles scroll restoration for
                browser back/forward automatically; this guarantees a
                "start at the top" feel on forward navigations too. */}
            <ScrollToTop />
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <CookieConsent />
            <BackToTop />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
