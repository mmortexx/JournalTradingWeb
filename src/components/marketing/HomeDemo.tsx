"use client";

import { AppDemoClient } from "@/components/demo/AppDemoClient";
import { useLang } from "@/lib/i18n";

/**
 * HomeDemo — sección `#demo` de la home (en el HTML de referencia el
 * demo interactivo se muestra también en la ruta home, no solo en
 * /demo). Cabecera compacta con el eyebrow § 02 + titular serif, y
 * debajo la app recreada completa (AppDemoClient): pestañas, páginas
 * y datos de muestra clicables — el "pruébalo sin descargar nada".
 */
export function HomeDemo() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="demo"
      className="relative overflow-hidden border-b scroll-mt-16"
      style={{
        padding: "96px 24px 72px",
        borderColor: "rgb(var(--divider) / 0.06)",
      }}
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 max-w-[760px]">
          <div className="mb-5 inline-flex items-center gap-3">
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
            className="mb-0 mt-4"
            style={{ maxWidth: "38em", fontSize: 15.5, lineHeight: 1.65, color: "var(--ink-2)" }}
          >
            {es
              ? "Esto no es un vídeo: es la app, recreada. Haz clic en las pestañas, abre una operación, toca la calculadora. Los datos son de muestra, como en la app real."
              : "This isn't a video: it's the app, recreated. Click the tabs, open a trade, play with the calculator. Sample data, just like the real app."}
          </p>
        </div>
        <AppDemoClient />
      </div>
    </section>
  );
}
