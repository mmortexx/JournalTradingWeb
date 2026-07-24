"use client";

import Link from "next/link";
import { ArrowRight, Maximize2 } from "lucide-react";
import { AppDemoClient } from "@/components/demo/AppDemoClient";
import { useLang } from "@/lib/i18n";

/**
 * HomeDemo — sección `#demo` de la home (en el HTML de referencia el
 * demo interactivo se muestra también en la ruta home, no solo en
 * /demo). Cabecera compacta con el eyebrow § 02 + titular serif, y
 * debajo la app recreada completa (AppDemoClient): pestañas, páginas
 * y datos de muestra clicables — el "pruébalo sin descargar nada".
 *
 * R23-2c (polish):
 * - Mantiene el demo interactivo real (AppDemoClient) — no se sustituye
 *   por una screenshot estática: el valor está en lo clicable.
 * - Añade una fila CTA debajo del demo con un botón claro a /demo
 *   (los usuarios que quieran la vista a página completa tienen un
 *   siguiente paso explícito; antes no había CTA a /demo en esta
 *   sección, aunque Hero/OverviewApp/FinalCTANew sí la tenían).
 * - Ajusta el ritmo vertical móvil: el eyebrow reduce su margen
 *   inferior en <380px para que la cabecera no ocupe media pantalla.
 * - La fila CTA es full-width en móvil (375px) y auto en ≥sm, igual
 *   que el patrón de OverviewApp — sin overflow horizontal.
 */
export function HomeDemo() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="demo"
      className="relative overflow-hidden border-b scroll-mt-16"
      style={{
        // Responsive vertical rhythm: top 72–116px, bottom 56–88px,
        // both scaling with viewport width so the demo breathes on
        // large desktops and tightens gracefully on mobile. Horizontal
        // padding 20–32px (was a fixed 24px) keeps the demo frame from
        // kissing the viewport edge on small screens while capping the
        // inset on ultra-wide ones. The prior fixed 96/24/72 left the
        // section feeling either cramped (mobile) or under-padded
        // (≥1600px desktops) depending on the viewport.
        padding:
          "clamp(72px, 9vw, 116px) clamp(20px, 4vw, 32px) clamp(56px, 6vw, 88px)",
        borderColor: "rgb(var(--divider) / 0.06)",
      }}
    >
      {/* Top accent hairline — a soft gradient rule that eases the eye
          into the demo section. Mirrors the closing hairline at the
          bottom of OverviewApp so the two heavy sections frame each
          other. Fades to transparent at both edges so it floats rather
          than terminating in a hard line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--accent-base) / 0.35) 30%, rgb(var(--accent-base) / 0.35) 70%, transparent)",
        }}
      />
      {/* Soft accent halo at the top of the section — pulls the eye
          downward into the demo frame. Sits behind the content (z-0)
          with the content lifted to z-10. The 0.4 opacity + 48px blur
          reads as a faint glow rather than a solid tint, so it never
          competes with the demo's own chrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "min(900px, 80%)",
          height: 240,
          background:
            "radial-gradient(50% 50% at 50% 0%, color-mix(in oklab, rgb(var(--accent-base)) 16%, transparent), transparent 70%)",
          filter: "blur(48px)",
          opacity: 0.4,
          zIndex: 0,
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="mb-10 max-w-[760px]">
          <div
            className="mb-5 inline-flex items-center gap-3"
            // On very narrow viewports (<380px) the eyebrow row can
            // feel heavy with the default 20px bottom margin — pull it
            // in to 16px so the heading lifts closer. Slight gain but
            // keeps the heading above the fold on small phones.
            style={{ marginBottom: "clamp(16px, 4vw, 20px)" }}
          >
            <span
              className="tnum"
              style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", color: "rgb(var(--accent-base))" }}
            >
              § 02
            </span>
            <span aria-hidden style={{ width: 22, height: 1, background: "rgb(var(--divider) / 0.13)" }} />
            <span
              className="tnum"
              style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-3)" }}
            >
              {es ? "DEMO EN VIVO" : "LIVE DEMO"}
            </span>
          </div>
          <h2
            className="font-serif m-0"
            style={{
              // clamp(1.95rem, 3.5vw, 3.05rem): min ~31px so the
              // heading reads as a section title even on a 320px phone
              // (the long-form Spanish "La app, en tu navegador."
              // wraps into a balanced 2 lines thanks to textWrap:
              // balance; max ~49px caps it on ≥1280px desktops).
              fontSize: "clamp(1.95rem, 3.5vw, 3.05rem)",
              fontWeight: 400,
              letterSpacing: "-0.022em",
              lineHeight: 1.08,
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            {es ? (
              <>
                La app, <span style={{ color: "rgb(var(--accent-base))" }}>en tu navegador</span>.
              </>
            ) : (
              <>
                The app, <span style={{ color: "rgb(var(--accent-base))" }}>in your browser</span>.
              </>
            )}
          </h2>
          <p
            className="mb-0 mt-4 break-words"
            style={{ maxWidth: "38em", fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-2)" }}
          >
            {es
              ? "Esto no es un vídeo: es la app, recreada. Haz clic en las pestañas, abre una operación, toca la calculadora. Los datos son de muestra, como en la app real."
              : "This isn't a video: it's the app, recreated. Click the tabs, open a trade, play with the calculator. Sample data, just like the real app."}
          </p>
        </div>
        <AppDemoClient />

        {/* CTA row — clear next step to the dedicated /demo route.
            Before R23-2c this section had no link to /demo at all,
            which was inconsistent with Hero/OverviewApp/FinalCTANew
            (all of which link to /demo). The embedded demo here is
            the same one that lives at /demo, but the dedicated route
            gives a focused, full-viewport surface with its own URL
            for sharing — worth signalling. The button mirrors the
            dark-pill "See the demo" treatment from Hero so the two
            CTAs read as a coordinated pair, and uses the
            `tj-cta-sheen` class for the same animated sheen sweep.

            Mobile (375px): button is full-width so it never overflows
            and the tap target stays comfortable (52px tall). ≥sm:
            shrinks to content, centered under the demo frame. The
            secondary "no download" hint reinforces the value prop
            without competing for the click. */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <Link
            href="/demo"
            aria-label={es ? "Abrir la demo a página completa" : "Open the full-page demo"}
            className="tj-cta-sheen inline-flex w-full sm:w-auto justify-center items-center gap-2.5 rounded-full"
            style={{
              height: 52,
              padding: "0 26px",
              background: "var(--ink)",
              color: "var(--bg)",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 12px 30px -14px rgb(0 0 0 / 0.6)",
              transition: "transform 0.2s, filter 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(0.94)";
              // Accent ring on hover — pairs with Hero's dark-CTA
              // hover ring so the two `/demo` buttons lift together
              // and read as a coordinated pair rather than two
              // unrelated hover treatments.
              e.currentTarget.style.boxShadow =
                "0 14px 34px -12px rgb(0 0 0 / 0.65), 0 0 0 1px rgb(var(--accent-base) / 0.30)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
              e.currentTarget.style.boxShadow = "0 12px 30px -14px rgb(0 0 0 / 0.6)";
            }}
          >
            <Maximize2 size={15} aria-hidden />
            <span>{es ? "Abrir demo a página completa" : "Open full-page demo"}</span>
            <ArrowRight size={16} aria-hidden />
          </Link>
          <span
            className="text-center sm:text-left"
            style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-3)" }}
          >
            {es
              ? "Sin descargar nada · 100 % en tu navegador"
              : "No download · 100 % in your browser"}
          </span>
        </div>
      </div>
    </section>
  );
}
