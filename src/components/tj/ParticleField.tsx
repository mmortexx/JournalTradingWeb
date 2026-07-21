"use client";

import { useEffect, useRef } from "react";
import { useInView } from "./useInView";

interface ParticleFieldProps {
  count?: number;
  className?: string;
  opacity?: number;
  /** Connection distance in px. */
  linkDistance?: number;
  colorVar?: string;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Subtle floating particle network — the "constellation" effect used on premium
 * fintech landing pages. Canvas-based, respects reduced-motion.
 */
export function ParticleField({
  count = 50,
  className = "",
  opacity = 0.5,
  linkDistance = 120,
  colorVar = "--accent-base",
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>({ rootMargin: "200px" });

  useEffect(() => {
    if (!inView) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    const canvas = canvasEl;
    const ctx = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let ps: P[] = [];
    let raf = 0;
    let mouse = { x: -9999, y: -9999 };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = [];
      const n = reduce ? Math.floor(count / 3) : count;
      for (let i = 0; i < n; i++) {
        ps.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    }

    function color() {
      return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const c = color();
      for (const p of ps) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          // mouse repel
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 10000) {
            const f = (10000 - d2) / 10000;
            p.x += (dx / Math.sqrt(d2 || 1)) * f * 0.8;
            p.y += (dy / Math.sqrt(d2 || 1)) * f * 0.8;
          }
        }
        ctx.fillStyle = `rgba(${c}, 0.7)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // links
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDistance) {
            ctx.strokeStyle = `rgba(${c}, ${(1 - d / linkDistance) * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onLeave() {
      mouse = { x: -9999, y: -9999 };
    }
    // Cache the parent so the cleanup can remove the same listener even
    // if `canvas.parentElement` would return null by teardown time.
    const parent = canvas.parentElement;

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("mousemove", onMove);
      parent?.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, [count, linkDistance, colorVar, inView]);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} style={{ width: "100%", height: "100%" }} aria-hidden="true">
      {inView && (
        <canvas
          ref={canvasRef}
          style={{ opacity, width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
