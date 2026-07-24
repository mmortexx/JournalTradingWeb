"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
      className="section relative overflow-hidden border-b border-[rgb(var(--divider)/0.06)] scroll-mt-16"
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
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-8">
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
                La app, <span style={{ color: "rgb(var(--accent-base))", fontStyle: "italic" }}>en tu navegador</span>.
              </>
            ) : (
              <>
                The app, <span style={{ color: "rgb(var(--accent-base))", fontStyle: "italic" }}>in your browser</span>.
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
            and the tap target stays comfortable (54px tall, matching
            Hero). ≥sm: shrinks to content, centered under the demo
            frame. The secondary "no download" hint reinforces the
            value prop without competing for the click.

            R26-2c polish:
            • `Maximize2` icon dropped — the button label "Abrir demo
              a página completa" already says "full-page", so the
              expand icon was redundant with the text; the remaining
              `ArrowRight` matches Hero's primary CTA's directional
              cue, so the two CTAs across the page read as one pair.
            • `h-[52px] px-[26px]` → `h-[54px] px-7` to match Hero's
              primary CTA dimensions exactly (the 2px difference was
              an easy tell that the two CTAs weren't the same pill).
            • Wrapped in `motion.div` with a gentle opacity + 8px lift
              reveal (`whileInView`, `once: true`) so after the demo
              hydrates and the user scrolls to the bottom of the demo
              frame, the CTA fades up into view rather than popping in
              — the transition from "trying the demo" to "next step"
              now feels continuous instead of abrupt. The reveal fires
              only once and is safe to layer on top of AppDemoClient
              (the motion wraps the CTA row only, not the demo). */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5"
        >
          <Link
            href="/demo"
            aria-label={es ? "Abrir la demo a página completa" : "Open the full-page demo"}
            className="tj-cta-sheen inline-flex w-full sm:w-auto justify-center items-center gap-2.5 rounded-full h-[54px] px-7 bg-[rgb(var(--accent-base))] text-[#06130d] text-[15px] font-semibold shadow-[0_18px_46px_-15px_rgb(var(--accent-base)/0.7)] ring-1 ring-inset ring-[rgb(var(--accent-base)/0.40)] transition-[transform,filter,box-shadow] duration-200 hover:-translate-y-0.5 hover:brightness-[1.08] hover:shadow-[0_0_0_4px_rgb(var(--accent-base)/0.12),0_22px_54px_-15px_rgb(var(--accent-base)/0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
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
        </motion.div>
      </div>
    </section>
  );
}
