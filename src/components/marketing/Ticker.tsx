"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/**
 * Ticker — infinite horizontal marquee band showing instrument symbols
 * with their P&L %. Duplicated for a seamless loop. Colorized pos/neg.
 * Honors `prefers-reduced-motion` (static fallback — no scroll).
 *
 * Institutional polish (R2-c):
 *  - Liquid-glass chrome band with `border-y border-white/10` hairline
 *    top + bottom edges — reads as a precision-machined ticker tape
 *    floating over the dark page background.
 *  - Slow, dignified base speed: full track (two rows) in 50 s — about
 *    35 px/s on a typical viewport. Never feels frantic.
 *  - Scroll-velocity responsive multiplier (1× → 2.4×) wrapped in
 *    `useSpring` so the speed-up eases in/out smoothly instead of
 *    snapping frame-to-frame as raw scroll velocity fluctuates.
 *  - Symbol in `text-secondary` (theme-adaptive, was raw gray-400);
 *    P&L% in `text-pnl-pos`/`text-pnl-neg` with `tnum` tabular-nums +
 *    slashed zeros so the digits never jitter as the marquee scrolls.
 *  - Dot separators in `bg-[rgb(var(--txt-tertiary)/0.5)]` — uses the
 *    design-system tertiary text token (gray-400 on dark, gray-500 on
 *    light) at 50% opacity so the dots read as a soft machined-rivet
 *    rather than a raw white speck (was `bg-white/15`). The token tie
 *    means the dots shift hue correctly if the theme flips to light.
 *  - Soft black-tinted gradient fades on both left + right edges so
 *    items ease in/out without a hard clip. Floats over the liquid-glass
 *    band's translucent dark surface.
 *  - `prefers-reduced-motion`: the animation loop is skipped entirely;
 *    the track stays at x=0 so the first Row remains statically visible.
 */

interface TickerItem {
  sym: string;
  chg: number;
}

const TICKER_ITEMS: TickerItem[] = [
  { sym: "ES35", chg: 0.84 },
  { sym: "NQ", chg: 1.12 },
  { sym: "SPX", chg: -0.31 },
  { sym: "EURUSD", chg: 0.22 },
  { sym: "BTC", chg: -2.04 },
  { sym: "DAX", chg: 0.57 },
  { sym: "GOLD", chg: 0.41 },
  { sym: "CL", chg: -1.18 },
];

function Row() {
  return (
    <div className="flex items-center shrink-0 gap-8 sm:gap-12" aria-hidden="true">
      {/* T2c — `fontSize` 12.5 → 13.5 px (≥13 legible a escala móvil);
          `gap` entre símbolos 7/11 → 8/12 para que cada ticker respire. */}
      {TICKER_ITEMS.map((it) => {
        const pos = it.chg >= 0;
        return (
          <span key={it.sym} className="tnum flex items-center" style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
            {it.sym}{" "}
            <span
              className="tnum"
              style={{ color: pos ? "rgb(var(--pnl-pos))" : "rgb(var(--pnl-neg))", marginLeft: 6 }}
            >
              {pos ? "+" : "−"}
              {Math.abs(it.chg).toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function Ticker() {
  const reduce = useReducedMotion();
  // T2c — pausa al hover. El usuario puede detener la cinta para leer un
  // símbolo concreto sin que el scroll se lo lleve. Estado local simple:
  // cuando `hovered` es true el callback de `useAnimationFrame` no avanza
  // `x`, pero la pista sigue montada (no se desmonta/repinta) así que al
  // salir el cursor la animación retoma en el mismo punto sin salto.
  const [hovered, setHovered] = useState(false);

  // Scroll-velocity responsive speed: |velocity| 0..4000 → multiplier 1..2.4.
  // Wrapped in useSpring so the speed multiplier eases in/out smoothly
  // instead of snapping frame-to-frame as the raw scroll velocity
  // fluctuates — eliminates the micro-stutter the ticker used to show
  // when the user scrolled aggressively and then stopped.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const rawSpeedFactor = useTransform(scrollVelocity, (v) => {
    const abs = Math.min(Math.abs(v), 4000);
    return 1 + (abs / 4000) * 1.4;
  });
  const speedFactor = useSpring(rawSpeedFactor, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  /* El ancho de media pista se MIDE APARTE, no dentro del bucle.
     Leer `scrollWidth` obliga al navegador a recalcular el diseño de la
     página en ese mismo instante, y estaba dentro del callback de cada
     fotograma: a 165 Hz son 165 recálculos de diseño por segundo para
     obtener un número que sólo cambia cuando cambia el contenido o el
     ancho de la ventana. Era el freno más caro de la cinta, y no se veía
     porque el síntoma no aparece aquí sino en la fluidez de TODO lo demás
     —el diseño es global—, que es justo lo que se estaba notando.

     Ahora se mide una vez y cuando el observador avisa de que la pista ha
     cambiado de tamaño: al cargar las fuentes, al cambiar de idioma o al
     redimensionar. Dentro del bucle sólo se lee una variable. */
  const halfRef = useRef(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const medir = () => {
      halfRef.current = el.scrollWidth / 2;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || hovered) return;
    const half = halfRef.current;
    if (!half) return;
    // Clamp delta to a single frame's worth (16-32ms) so the first
    // animation frame — which can report a delta of 100ms+ if the tab
    // was backgrounded or the RAF callback was deferred — doesn't
    // catapult the track forward and break the seamless loop.
    const dt = Math.min(delta, 32);
    // Base loop: full track (two rows) in 50s → half in 50s.
    // 50s for the half-loop reads as slow + dignified (was 38s — a touch
    // too brisk for an institutional ticker tape).
    const basePxPerMs = half / 50 / 1000;
    const speed = basePxPerMs * speedFactor.get();
    let next = x.get() - speed * dt;
    if (next <= -half) next += half;
    x.set(next);
  });

  return (
    <div
      role="marquee"
      aria-label="Market ticker"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      /* T2c — `py-3` (12 px) → `py-4` (16 px): la cinta tenía solo 12 px
         de respiro vertical y el VLM la leía como banda pegada al borde.
         16 px la separa visualmente de las secciones vecinas sin
         engordarla. Resto sin cambios: `border-y`, `liquid-glass`,
         `glass-band` (solo la luz superior), `overflow-hidden`,
         `select-none`. */
      className="relative border-y border-[rgb(var(--divider)/0.14)] py-4 liquid-glass glass-band overflow-hidden select-none"
    >
      {/* Left edge gradient fade — R27-1b: switched from hardcoded
          `rgba(0, 0, 0, ...)` to `color-mix(in srgb, var(--bg) ...,
          transparent)` so the fade matches the band's surface tone in
          BOTH themes. The band's `liquid-glass` material is
          `rgba(0,0,0,0.92)` in dark / `rgba(255,255,255,0.94)` in
          light — so a black fade was correct in dark but read as dark
          smudges at the edges of a white band in light theme. `var(--bg)`
          tracks `#0B0C0E` (dark) / `#f3f2ec` (light), close enough to
          the band's near-opaque surface that the fade reads as "items
          dissolving into the band" instead of "dark patches at the
          edges". The 92 % → 50 % → transparent ramp is preserved.
          R21-3a — narrowed on mobile (w-14 ≈ 56px) so less of the visible
          375px viewport is faded out; widens back to w-20 on sm and w-32
          on md+ where there's plenty of width to spare for the fade. */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 w-14 sm:w-20 md:w-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 50%, transparent) 55%, transparent 100%)",
        }}
      />
      {/* Right edge gradient fade — mirror of the left. */}
      <div
        className="absolute right-0 top-0 bottom-0 z-10 w-14 sm:w-20 md:w-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 50%, transparent) 55%, transparent 100%)",
        }}
      />

      {/* Scrolling track — duplicated <Row /> gives the seamless loop point
          (the animation resets every `half = scrollWidth / 2` pixels).
          `willChange: transform` is a GPU-compositing hint that keeps the
          marquee on its own compositor layer — without it some browsers
          (notably Safari on macOS) re-rasterize the track each frame as
          the x value changes, which shows up as a faint sub-pixel jitter
          on the tabular figures. No behavior change, pure perf hint. */}
      {/* T2c — `gap-8 sm:gap-12` (igual al `gap` interno de `<Row />`) para
          que la costura entre Row 1 y Row 2 sea idéntica a la separación
          entre símbolos: el loop se lee continuo, sin escalón visual. */}
      <motion.div ref={trackRef} className="flex w-max gap-8 sm:gap-12" style={{ x, willChange: "transform" }}>
        <Row />
        <Row />
      </motion.div>
    </div>
  );
}
