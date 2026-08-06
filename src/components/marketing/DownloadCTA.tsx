"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { withLocale } from "@/lib/locale";
import { Eyebrow } from "@/components/tj/Eyebrow";

/**
 * DownloadCTA — legacy-compatible beta admission block. If reintroduced on a
 * route, it explains that installers go only to invited participants.
 *
 * Premium motion layer:
 *  - Card scales in on view (0.96 → 1).
 *  - Download button: lift on hover, press-down on tap.
 *  - prefers-reduced-motion disables the hover lift.
 *
 * There is deliberately no public download link while the installer is
 * invitation-only.
 *
 * No indigo/blue: accent-only palette.
 */

export function DownloadCTA() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={es ? "Acceso anticipado" : "Early access"}
      // R27-1b — `bg-veil` added: the aurora-bg + grain overlays are
      // transparent in hue, and the tj-paper download card (while
      // opaque itself) is `max-w-3xl mx-auto` — so the area around the
      // card (where the eye WebGL background shows through in light
      // theme) was unprotected. `bg-veil` occludes the eye across the
      // whole section; the aurora-bg + accent glow orbs + grain still
      // paint on top, so the section's atmospheric depth is preserved.
      className="section relative overflow-hidden bg-veil"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 tj-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 22 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative tj-paper rounded-[2px] border border-[rgb(var(--divider)/0.13)] p-6 sm:p-8 md:p-12 max-w-3xl mx-auto overflow-hidden transition-shadow duration-300"
        >
          {/* Top accent sweep — same motif as GuaranteeBanner. R24-1d
              bumps h-px → h-[2px] so the sweep reads as a deliberate
              premium top-edge marker (matching the GuaranteeBanner +
              Pro pricing-card rails) rather than a hairline that
              vanishes on light theme. */}
          <motion.div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base)) 50%, transparent 100%)",
              transformOrigin: "left center",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.9 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
            {/* Left: copy block */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Eyebrow>{es ? "Acceso anticipado" : "Early access"}</Eyebrow>
              </div>
              <h2
                className="mt-5 t-h2 text-primary"
              >
                {es ? (
                  <>
                    Empieza por <span className="text-gradient">tu contexto.</span>
                  </>
                ) : (
                  <>
                    Start with <span className="text-gradient">your context.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-secondary leading-relaxed max-w-md mx-auto md:mx-0">
                {es ? (
                  <>
                    El piloto es privado y por invitación. El instalador se entrega
                    sólo a participantes seleccionados, sin tarjeta ni preventa.
                  </>
                ) : (
                  <>
                    The pilot is private and invite-only. The installer is delivered
                    only to selected participants, with no card or pre-order.
                  </>
                )}
              </p>

              {/* System requirements — refined spec-sheet row rendered as
                  discrete pill badges (R23-2e). Each spec gets a hairline
                  border + subtle divider backdrop so the row reads as a
                  cluster of trust badges instead of floating text+icon
                  pairs. `text-secondary` (was `text-tertiary`) lifts the
                  labels out of the dim range so Windows version / arch /
                  size are unambiguous at a glance. tnum keeps the version
                  digits + size figure on the tabular baseline. */}
              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-[rgb(var(--divider)/0.10)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-xs text-secondary">
                  <CheckSmall />
                  <span className="tnum">Windows 10/11</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-[rgb(var(--divider)/0.10)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-xs text-secondary">
                  <CheckSmall />
                  <span className="tnum">64-bit</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-[rgb(var(--divider)/0.10)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-xs text-secondary">
                  <CheckSmall />
                  <span className="tnum">50 MB</span>
                </span>
              </div>
            </div>

              {/* Right: early-access button + meta */}
            <div className="shrink-0 flex flex-col items-center md:items-end gap-3">
              {/* Mismo caso que el botón de compra de los planes: apuntaba a
                  `href="#"` porque el instalador de Windows todavía no
                  existe. Cierto, pero el visitante que pulsa «Descargar»
                  no lo sabe — la página le daba un salto al principio y
                  ningún motivo para volver.

                  Esta sección sólo sale en /pricing, que es justo donde
                  vive la lista de espera, así que el ancla lleva a quien
                  quería el programa al único sitio donde hoy puede pedir
                  que le avisen. Cuando haya instalador, esto pasa a ser la
                  URL del .exe.

                  El resto del estilo del botón se queda como estaba: usa
                  los colores primarios del tema con realce al pasar por
                  encima (R20-3c). */}
              <motion.a
                href={asset(withLocale("/beta", lang))}
                whileHover={
                  reduce
                    ? undefined
                    : { y: -2, transition: { type: "spring", stiffness: 300, damping: 20 } }
                }
                whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                // P6 — `text-sm sm:text-base` + `px-4 sm:px-5 md:px-8`: on
                // 320px viewports the previous `text-base` + `px-5` forced
                // "Descargar para Windows" to wrap to 2 lines (button grew
                // from 48 → 69px tall, looked cramped). Shorter padding +
                // text-sm keeps the label on one line at 320–390px; sm+
                // restores the canonical text-base + px-5 padding when the
                // viewport has room. Touch target stays ≥44px (py-3 = 24px
                // + line ~22px = 46px).
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-4 sm:px-5 md:px-8 py-3 text-sm sm:text-base rounded-[2px] bg-[rgb(var(--accent-base))] text-[rgb(var(--accent-ink))] font-medium transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <WindowsIcon className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
                {/* P6 — responsive label: short on mobile (one line), full
                    on sm+. Both render inside the same span so the icon↔text
                    gap stays consistent. */}
                <span className="whitespace-nowrap">
                  <span className="sm:hidden">{es ? "Solicitar" : "Request"}</span>
                  <span className="hidden sm:inline">{es ? "Solicitar acceso anticipado" : "Request early access"}</span>
                </span>
              </motion.a>
              {/* R24-1d — promotes the offline-installer subtext from bare
                  fine print to a trust badge with a small lock icon prefix
                  (matches the spec-pill row above) so the "no connection
                  after install" promise reads as a deliberate credential
                  rather than a stray caption. inline-flex + gap-1.5 keep
                  the icon + text aligned on the caption baseline. */}
              <span className="inline-flex items-center justify-center md:justify-end gap-1.5 text-xs text-tertiary tnum text-center md:text-right break-words">
                <LockIconMini />
                <span>{es ? "Instalador sólo para participantes invitados" : "Installer for invited participants only"}</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** 4-pane Windows logo SVG — uses currentColor so it inherits the button text color. */
function WindowsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="0.5" fill="currentColor" />
      <rect x="13" y="3" width="8" height="8" rx="0.5" fill="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="0.5" fill="currentColor" />
      <rect x="13" y="13" width="8" height="8" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function CheckSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 8 2.5 2.5L12 5"
        stroke="rgb(var(--pnl-pos))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* R24-1d — small 12×12 lock icon prefixing the "Instalador offline"
   subtext so it reads as a trust badge rather than fine print.
   Uses text-tertiary (inherits from the parent span) so the icon
   tracks the caption color in both themes. */
function LockIconMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-tertiary">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="10.2" r="0.9" fill="currentColor" />
    </svg>
  );
}
