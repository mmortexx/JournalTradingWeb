"use client";

import { type ReactNode } from "react";
import { asset } from "@/lib/asset";

/**
 * WindowFrame — mockup de ventana WinUI que envuelve una captura de la
 * app nativa para que se lea ENTERA y nítida (object-contain) dentro de
 * un marco elegante, sin recortes.
 *
 * Composición:
 *  - Barra de título (32 px) con tres semáforos macOS-style sutiles a la
 *    izquierda + caption centrada en mono. La barra usa `--surface-2`
 *    (theme-aware) para leerse bien en oscuro Y claro.
 *  - Cuerpo: fondo `--surface` (theme-aware) sobre el que la captura se
 *    muestra con `object-contain` (letterbox), de modo que la pantalla
 *    completa de la app es visible sin recorte.
 *  - Marco hairline `rgb(var(--divider)/0.13)`, inset highlight superior,
 *    sombra suave. `rounded-xl` + `overflow-hidden`.
 *
 * El componente NO impone aspect ratio fijo: el cuerpo se adapta al
 * aspect natural de la captura. El default `aspect-[1500/856]` coincide
 * EXACTAMENTE con la resolution real de las capturas (1500×856, ratio
 * 1.7523) para que la imagen llene el cuerpo del frame edge-to-edge
 * SIN barras de letterbox. Sobreescribible con `bodyClassName` para
 * otros usos (p.ej. un frame con contenido non-screenshot).
 *
 * Props:
 *  - `caption`: texto mono centrado en la barra de título (p.ej. "Resumen
 *    — Trading Journal"). Si se omite, se usa el nombre de la app.
 *  - `children`: el contenido del cuerpo (normalmente un <Image> o
 *    <FeatureImage fit="contain">).
 *  - `bodyClassName`: clases extra para el cuerpo (p.ej. aspect ratio).
 *  - `className`: clases extra para el contenedor exterior.
 *  - `live`: muestra un punto verde "EN VIVO" a la derecha de la barra.
 */
interface WindowFrameProps {
  caption?: string;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  live?: boolean;
}

export function WindowFrame({
  caption = "Trading Journal",
  children,
  bodyClassName = "",
  className = "",
  live = false,
}: WindowFrameProps) {
  return (
    <div
      data-tj-window-frame=""
      className={`relative rounded-xl overflow-hidden border ${className}`}
      style={{
        borderColor: "rgb(var(--divider) / 0.13)",
        background: "color-mix(in srgb, var(--surface) 70%, transparent)",
        // Two-layer frame shadow: a tight 1px top inset highlight (the
        // machined key-light edge that catches where light hits a real
        // window frame) + a soft ambient drop shadow underneath. The drop
        // shadow stays subtle in dark theme (where the canvas is already
        // near-black) and is overridden stronger in light theme via the
        // [data-tj-window-frame] rule in globals.css so a near-black
        // 0.35-alpha shadow doesn't vanish against the bright canvas.
        boxShadow:
          "inset 0 1px 0 rgb(var(--divider) / 0.14), 0 8px 28px -12px rgb(0 0 0 / 0.35)",
      }}
    >
      {/* Title bar — surface-2 fill at 80% with a 1px bottom hairline +
          a subtle 1px top inset highlight that reads as the machined top
          edge of a real WinUI/Acrylic title bar (matches the .liquid-glass
          ::after inset highlight convention used across the site). */}
      <div
        className="flex items-center gap-2 px-3 h-8 select-none border-b relative"
        style={{
          background: "color-mix(in srgb, var(--surface-2) 80%, transparent)",
          // 0.12 (up from 0.08) — a clearer hairline between the title
          // bar and the screenshot body in both themes. At 0.08 the rule
          // was nearly invisible in light theme (where --divider is
          // black at low alpha on a near-white surface-2), so the title
          // bar read as floating rather than framing the body.
          borderColor: "rgb(var(--divider) / 0.12)",
          boxShadow: "inset 0 1px 0 rgb(var(--divider) / 0.10)",
        }}
      >
        {/* Traffic lights — three subtle P&L-tinted dots, each with a
            1px inset highlight + faint ring so they read as glassy beads
            instead of flat color swatches. */}
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{
              background: "rgb(var(--pnl-neg) / 0.7)",
              // 0.14 ring (up from 0.08) — a slightly firmer bead edge
              // so the dots read as discrete glassy beads against the
              // title bar fill in both themes (at 0.08 the ring was
              // imperceptible and the dots looked pasted on).
              boxShadow:
                "inset 0 1px 0 rgb(255 255 255 / 0.30), 0 0 0 1px rgb(var(--divider) / 0.14)",
            }}
          />
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{
              background: "rgb(var(--pnl-warn) / 0.7)",
              boxShadow:
                "inset 0 1px 0 rgb(255 255 255 / 0.30), 0 0 0 1px rgb(var(--divider) / 0.14)",
            }}
          />
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{
              background: "rgb(var(--pnl-pos) / 0.7)",
              boxShadow:
                "inset 0 1px 0 rgb(255 255 255 / 0.30), 0 0 0 1px rgb(var(--divider) / 0.14)",
            }}
          />
        </span>
        {/* Centered caption */}
        <span
          className="tnum flex-1 text-center text-[11px] truncate"
          style={{
            color: "var(--ink-3)",
            letterSpacing: "0.02em",
          }}
        >
          {caption}
        </span>
        {/* Live indicator (optional) */}
        {live ? (
          <span
            className="inline-flex items-center gap-1 tnum text-[10px] font-semibold"
            style={{ color: "rgb(var(--pnl-pos))", letterSpacing: "0.1em" }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "rgb(var(--pnl-pos))" }}
            />
            LIVE
          </span>
        ) : (
          // Spacer to balance the traffic lights on the left.
          <span className="block w-[42px]" aria-hidden="true" />
        )}
      </div>
      {/* Body — the screenshot lives here, whole and crisp. Default
          aspect-[1500/856] matches the screenshots' actual resolution
          (1500×856) so object-contain fills edge-to-edge with zero
          letterbox bars. */}
      <div className={`relative w-full ${bodyClassName || "aspect-[1500/856]"}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Helper: build a captioned window frame around an image src, ready to
 * drop into a gallery cell. Returns the full WindowFrame + FeatureImage
 * composition so galleries stay declarative.
 */
export function windowShot({
  src,
  alt,
  caption,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  caption?: string;
  sizes?: string;
  priority?: boolean;
}) {
  // Re-exported as a function rather than a component so galleries can
  // wrap it in their own <Reveal>/<motion.figure> without an extra DOM
  // layer. Imported lazily inside the function to avoid a circular dep
  // (FeatureImage imports nothing from here).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { FeatureImage } = require("@/components/tj/FeatureImage");
  return (
    <WindowFrame caption={caption}>
      <FeatureImage
        src={asset(src)}
        alt={alt}
        fit="contain"
        className="absolute inset-0 h-full w-full"
        overlay={0}
        priority={priority}
        sizes={sizes}
      />
    </WindowFrame>
  );
}
