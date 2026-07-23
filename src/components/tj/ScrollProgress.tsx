"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollProgress — barra de progreso de lectura del HTML de referencia:
 * 2 px fijos arriba del todo (z-60), degradado accent → accent-hover con
 * glow, cuyo ancho refleja el scroll de la página. Se actualiza vía rAF
 * para no forzar layout en cada evento de scroll. Se muestra también con
 * `prefers-reduced-motion` (es informativa, no decorativa) — igual que
 * en el HTML.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let raf: number | null = null;

    const update = () => {
      raf = null;
      const d = document.documentElement;
      const m = d.scrollHeight - d.clientHeight;
      bar.style.width = (m > 0 ? (d.scrollTop / m) * 100 : 0).toFixed(2) + "%";
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[2px] w-0"
      style={{
        background:
          "linear-gradient(90deg, rgb(var(--accent-base)), rgb(var(--accent-hover)))",
        boxShadow: "0 0 12px rgb(var(--accent-base) / 0.55)",
      }}
    />
  );
}
