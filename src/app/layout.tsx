import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CookieConsent } from "@/components/tj/CookieConsent";
import { BackToTop } from "@/components/tj/BackToTop";
import { GlobalShortcuts } from "@/components/tj/GlobalShortcuts";
import { OverlayHost } from "@/components/tj/OverlayHost";
import { ScrollToTop } from "@/components/tj/ScrollToTop";
import { SkipLink } from "@/components/tj/SkipLink";
import { BackgroundFX } from "@/components/tj/BackgroundFX";
import { IntroSequence } from "@/components/tj/IntroSequence";
import { SectionReveal } from "@/components/tj/SectionReveal";
import { DecorFX } from "@/components/tj/DecorFX";
import { OG_IMAGE } from "@/lib/og";
import { SITE_URL } from "@/lib/site";

/**
 * Viewport — `viewport-fit=cover` lets the layout extend into the notch /
 * home-indicator area on iOS so the safe-area-inset CSS env() values
 * (`.safe-top`, `.safe-bottom` in globals.css) actually take effect.
 * Without this, the env() values resolve to 0 and the safe-area padding
 * is a no-op. `themeColor` colours the Android Chrome tab bar / Safari
 * status-bar background to match the brand palette (matches the
 * `theme_color` declared in `manifest.ts`).
 *
 * El valor es `--bg` del tema oscuro (globals.css). Antes eran dos
 * colores distintos y ninguno de la marca: aquí un gris cálido claro
 * (#B9B2A6) y en manifest.ts un verde (#34B476), de modo que el navegador
 * teñía su barra de un color que no aparece en ninguna parte del sitio y
 * además cada superficie decía una cosa.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0c0d",
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

// Use ABSOLUTE URLs for OG image and logo. Next.js resolves relative OG
// image paths against `metadataBase`, but with a basePath the resolution
// is fragile (a leading-slash path like "/JournalTradingWeb/og.png" gets
// re-resolved against `metadataBase`, producing a doubled basePath:
// `.../JournalTradingWeb/JournalTradingWeb/og.png`). Absolute URLs bypass
// that resolution entirely and emit verbatim.
//
// PNG (no SVG) — Twitter/X, Facebook, LinkedIn, Slack y Discord fallan en
// silencio con imágenes OG en SVG y enseñan una tarjeta rota o genérica.
// Un PNG de 1200×630 es el único formato que renderiza en todas.
//
// La tarjeta se genera con `python scripts/generate-og.py`, que compone el
// PNG con las fuentes reales de la marca (Instrument Sans) y con el
// logotipo real de la app. NO se rasteriza desde un SVG: el SVG anterior
// pedía 'Segoe UI Variable', el rasterizador no la tenía y la miniatura
// publicada salía en Arial. Si se cambia el texto o la marca de la
// tarjeta, hay que volver a lanzar ese script y subir el `?v=` de
// `@/lib/og` — de ahí sale `OG_IMAGE`, la misma URL para todas las
// páginas.
//
// `logo.png` es el logotipo de la marca —el libro mayor— rasterizado
// desde la misma geometría del glifo vectorial. Va en el dato
// estructurado de Organization, que es de donde Google saca el logotipo
// del sitio. Se regenera con `python scripts/generate-brand.py`, que
// produce además el apple-icon y el favicon.ico; si se toca el glifo de
// `BrandGlyph.tsx` hay que volver a lanzarlo o la marca se parte entre
// la web y lo que ven el buscador y el sistema operativo.
const LOGO_URL = `${SITE_URL}/logo.png`;

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CountPips",
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
  // Sin `aggregateRating` a propósito: no hay reseñas reales todavía.
  // Aquí se emitía 4,8/47 inventado. Las directrices de datos
  // estructurados de Google exigen que la valoración proceda de usuarios
  // reales, así que publicarla era arriesgar una acción manual además de
  // engañar a quien la viera en el buscador. Se vuelve a poner cuando
  // haya reseñas verificables (G2/Capterra/Trustpilot), tomando el valor
  // de esa plataforma.
  publisher: {
    "@type": "Organization",
    name: "CountPips",
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
  name: "CountPips",
  url: SITE_URL,
  logo: LOGO_URL,
  description:
    "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único, sin suscripciones.",
  foundingDate: "2024",
  sameAs: ["https://github.com/mmortexx/CountPipsWeb"],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CountPips — Tu operativa, medida.",
    template: "%s · CountPips",
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
  authors: [{ name: "CountPips" }],
  creator: "CountPips",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: "CountPips — Tu operativa, medida.",
    description:
      "El diario de trading profesional, nativo de Windows. Métricas institucionales, disciplina y datos 100 % locales. Pago único.",
    url: SITE_URL,
    siteName: "CountPips",
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "CountPips — Tu operativa, medida.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CountPips — Tu operativa, medida.",
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
    <html lang="es" suppressHydrationWarning data-theme="light" data-palette="clasico">
      <head>
        <script
          // Prevent FOUC: apply saved theme/palette before paint
          dangerouslySetInnerHTML={{
            // El estilo es único ("clasico") y se fija aquí sin consultar
            // el localStorage: así un valor antiguo guardado en el
            // navegador de un visitante ("grafito", "verde", "oro"…) no
            // puede aplicarse al <html> y dejar el primer paint sin
            // ningún bloque de tokens que lo respalde. Lo único que se
            // recuerda del visitante es si prefiere papel o tinta.
            __html: `(function(){try{var t=localStorage.getItem('tj-theme');if(t!=='dark'&&t!=='light')t='light';document.documentElement.dataset.theme=t;document.documentElement.dataset.palette='clasico';document.documentElement.classList.toggle('dark',t==='dark');}catch(e){document.documentElement.dataset.theme='light';document.documentElement.dataset.palette='clasico';}})();`,
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
            <IntroSequence />
            <SectionReveal />
            <DecorFX />
            <SkipLink />
            <GlobalShortcuts />
            {/* La paleta ⌘K y la ayuda de atajos `?` se cargan bajo
                demanda: OverlayHost escucha las teclas y trae el código
                de cada overlay la primera vez que se abre. Ver el
                encabezado de OverlayHost.tsx para el porqué. */}
            <OverlayHost />
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
