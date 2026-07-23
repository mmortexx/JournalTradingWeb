"use client";

import { useEffect } from "react";

/**
 * DecorFX — spotlight que sigue al cursor en tarjetas `.tj-spot`
 * (puerto del `_decorate()` del HTML de referencia). Un único listener
 * delegado de pointermove actualiza las variables CSS `--spot-x/y` del
 * elemento; el gradiente vive en `.tj-spot::after` (globals.css) y al
 * salir el puntero se manda fuera de la tarjeta (-999px), con lo que
 * desaparece sin tocar la opacidad del pseudo-elemento (que comparte
 * con los bordes torneados de `.liquid-glass`).
 *
 * Solo se activa con puntero fino (hover:hover) — en táctil no hay
 * cursor que seguir.
 */
export function DecorFX() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf: number | null = null;
    let lastEvent: PointerEvent | null = null;

    const apply = () => {
      raf = null;
      const e = lastEvent;
      if (!e) return;
      const host = (e.target as Element | null)?.closest?.(
        ".tj-spot"
      ) as HTMLElement | null;
      if (!host) return;
      const r = host.getBoundingClientRect();
      host.style.setProperty("--spot-x", (e.clientX - r.left).toFixed(0) + "px");
      host.style.setProperty("--spot-y", (e.clientY - r.top).toFixed(0) + "px");
    };

    const onMove = (e: PointerEvent) => {
      lastEvent = e;
      if (raf === null) raf = requestAnimationFrame(apply);
    };
    const onOut = (e: PointerEvent) => {
      const host = (e.target as Element | null)?.closest?.(
        ".tj-spot"
      ) as HTMLElement | null;
      if (!host) return;
      // ¿El puntero sigue dentro de la tarjeta? (out entre hijos)
      if (host.contains(e.relatedTarget as Node | null)) return;
      host.style.setProperty("--spot-x", "-999px");
      host.style.setProperty("--spot-y", "-999px");
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
