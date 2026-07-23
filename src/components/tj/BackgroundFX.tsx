"use client";

import { useEffect, useRef } from "react";

/**
 * BackgroundFX — fondo fijo global: filamentos de luz fluyendo.
 *
 * Sustituye a la rejilla de celdas v1 por el lenguaje de la referencia
 * aprobada (hero "NOVA_AI"): hebras luminosas que barren la pantalla en
 * un arco lento, cada una con una cabeza brillante tipo bokeh y una
 * estela que se desvanece. Sobre negro casi puro, en el marfil cálido
 * de la paleta grafito — luz institucional, cero estridencia.
 *
 * Simulación (canvas 2D, composite "lighter" para acumular luz):
 *  - Campo de flujo: cada partícula desciende siguiendo un ángulo que
 *    depende de su x (abanico desde el 60 % del ancho) más una
 *    ondulación temporal muy lenta — las hebras "respiran".
 *  - ~90 partículas (escala con el área), velocidades 16–42 px/s,
 *    tamaños mixtos (muchas finas, pocas gordas bokeh), parpadeo
 *    sinusoidal individual.
 *  - Estela: ring-buffer de posiciones muestreado cada ~45 ms; se
 *    dibuja como segmentos con alpha decreciente → filamento.
 *  - Cursor: dentro de 240 px las hebras se avivan (alpha y tamaño
 *    suben con falloff smoothstep) y su rumbo se desvía suavemente —
 *    la luz "responde" sin perseguir.
 *
 * Rendimiento: dt-based (independiente del frame-rate), dpr ≤ 2, rAF
 * pausado con visibilitychange. `prefers-reduced-motion`: un único
 * frame estático de filamentos tenues.
 *
 * Capas fijas por encima del canvas: halo radial superior, grain y
 * viñeta — la misma pila del HTML de referencia.
 */

type Particle = {
  x: number;
  y: number;
  speed: number;
  size: number;
  phase: number;
  twinkle: number;
  drift: number;
  trail: { x: number; y: number }[];
  lastSample: number;
};

const TRAIL_LEN = 14;
const TRAIL_EVERY = 45; // ms entre muestras de estela
const CURSOR_R = 240;

export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf: number | null = null;
    let running = true;
    let last = performance.now();
    let elapsed = 0;
    let cf = 0;
    let rgb = "208 202 189"; // --accent-hover (grafito) fallback

    const readAccent = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-hover")
        .trim();
      if (v) rgb = v;
    };

    // Cursor con easing propio para que el brillo siga con inercia.
    let mx = -9999;
    let my = -9999;
    let cx = -9999;
    let cy = -9999;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cx < -9000) {
        cx = mx;
        cy = my;
      }
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };

    // ---- Partículas ----
    let parts: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const spawn = (p: Particle, fresh: boolean) => {
      // Nacen repartidas en un abanico centrado en el 60 % del ancho,
      // por encima del viewport; en el seed inicial, por toda la altura.
      p.x = w * 0.6 + (Math.random() - 0.5) * w * 1.1;
      p.y = fresh ? rand(-h * 0.15, h * 1.05) : rand(-140, -20);
      p.speed = rand(16, 42);
      // Mayoría finas (2–5 px), ~15 % gordas bokeh (7–13 px).
      p.size = Math.random() < 0.15 ? rand(7, 13) : rand(2, 5);
      p.phase = Math.random() * Math.PI * 2;
      p.twinkle = rand(0.5, 1.4);
      p.drift = rand(-0.12, 0.12);
      p.trail = [];
      p.lastSample = 0;
    };

    const buildParts = () => {
      const target = Math.round(Math.min(120, Math.max(55, (w * h) / 16000)));
      parts = Array.from({ length: target }, () => {
        const p = {} as Particle;
        spawn(p, true);
        return p;
      });
    };

    // Ángulo del campo de flujo en (x, y, t): descenso en abanico con
    // una ondulación temporal lenta — la firma visual de la referencia.
    const flowAngle = (x: number, y: number, t: number, drift: number) =>
      Math.PI / 2 +
      (x / w - 0.6) * 0.95 +
      drift +
      0.22 * Math.sin(y * 0.0016 + t * 0.00035 + x * 0.0007);

    const smoothstep = (e0: number, e1: number, v: number) => {
      const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    };

    const render = (dt: number, t: number) => {
      if (cf++ % 120 === 0) readAccent();
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (mx > -9000) {
        cx += (mx - cx) * Math.min(1, dt * 0.0065);
        cy += (my - cy) * Math.min(1, dt * 0.0065);
      }

      for (const p of parts) {
        // Avance por el campo de flujo.
        const ang = flowAngle(p.x, p.y, t, p.drift);
        let vx = Math.cos(ang);
        let vy = Math.sin(ang);

        // Influencia del cursor: brillo + desvío suave.
        let boost = 0;
        if (cx > -9000) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const d = Math.hypot(dx, dy);
          if (d < CURSOR_R) {
            boost = smoothstep(CURSOR_R, 0, d);
            const side = dx * vy - dy * vx > 0 ? 1 : -1;
            const bend = boost * 0.5 * side;
            const ca = Math.cos(bend);
            const sa = Math.sin(bend);
            const nvx = vx * ca - vy * sa;
            vy = vx * sa + vy * ca;
            vx = nvx;
          }
        }

        const step = (p.speed * dt) / 1000;
        p.x += vx * step;
        p.y += vy * step;

        // Muestreo de estela espaciado en el tiempo (no por frame) para
        // que el filamento tenga longitud física estable.
        if (t - p.lastSample > TRAIL_EVERY) {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > TRAIL_LEN) p.trail.shift();
          p.lastSample = t;
        }

        // Reciclaje al salir por abajo o por los lados.
        if (p.y > h + 40 || p.x < -160 || p.x > w + 160) {
          spawn(p, false);
          continue;
        }

        const tw = 0.72 + 0.28 * Math.sin(t * 0.001 * p.twinkle + p.phase);
        const alpha = (0.14 + 0.1 * (p.size > 6 ? 1 : 0)) * tw * (1 + boost * 1.5);
        const size = p.size * (1 + boost * 0.45);

        // Filamento: segmentos de la estela con alpha creciente hacia
        // la cabeza. Línea fina — la acumulación "lighter" hace el glow.
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const a = p.trail[i - 1];
            const b = p.trail[i];
            const k = i / p.trail.length;
            ctx.strokeStyle = `rgb(${rgb} / ${(alpha * 0.34 * k).toFixed(3)})`;
            ctx.lineWidth = 1 + (size * 0.16) * k;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Cabeza bokeh: doble gradiente radial (núcleo + halo).
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3.2);
        halo.addColorStop(0, `rgb(${rgb} / ${(alpha * 0.5).toFixed(3)})`);
        halo.addColorStop(1, `rgb(${rgb} / 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 3.2, 0, Math.PI * 2);
        ctx.fill();

        const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        core.addColorStop(0, `rgb(${rgb} / ${Math.min(0.85, alpha * 2.4).toFixed(3)})`);
        core.addColorStop(1, `rgb(${rgb} / 0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(64, now - last);
      last = now;
      elapsed += dt;
      render(dt, elapsed);
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParts();
      if (reduce) {
        // Frame estático: avanza la simulación "en seco" para que las
        // estelas existan, y pinta una sola vez.
        for (let i = 0; i < 40; i++) render(80, i * 80);
      }
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running && raf === null && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!running && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    readAccent();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    if (!reduce) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Halo superior de tinta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 85% at 50% -8%, color-mix(in srgb, var(--ink) 4%, transparent), transparent 52%)",
        }}
      />
      {/* Filamentos de luz */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Grano — mismo fractalNoise que el resto del sitio */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
          opacity: 0.045,
          mixBlendMode: "overlay",
        }}
      />
      {/* Viñeta inferior */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 125% at 50% 42%, transparent 72%, color-mix(in srgb, var(--bg) 82%, #000) 100%)",
          opacity: 0.34,
        }}
      />
    </div>
  );
}
