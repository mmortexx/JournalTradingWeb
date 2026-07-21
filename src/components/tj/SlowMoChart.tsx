"use client";

import { useEffect, useRef } from "react";
import { useInView } from "./useInView";

interface SlowMoChartProps {
  className?: string;
  opacity?: number;
  /** Duration of one full redraw cycle in seconds. */
  cycle?: number;
  /** Line color CSS var; defaults to accent. */
  colorVar?: string;
  /** Stroke width. */
  strokeWidth?: number;
  /** Number of points in the curve. */
  points?: number;
}

/**
 * A slow-drawing equity curve for section backgrounds — redraws on a long loop
 * so the page feels alive without being distracting. Pure SVG + requestAnimationFrame.
 */
export function SlowMoChart({
  className = "",
  opacity = 0.18,
  cycle = 14,
  colorVar = "--accent-base",
  strokeWidth = 1.5,
  points = 90,
}: SlowMoChartProps) {
  const ref = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>({ rootMargin: "200px" });

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pathEl = ref.current;
    const areaEl = areaRef.current;
    if (!pathEl) return;
    const path = pathEl;
    const area = areaEl;

    const W = 1000;
    const H = 240;
    const pad = 20;

    // Build a smooth deterministic-ish curve via layered sines + noise
    const seedPts: number[] = [];
    let v = 0.5;
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      v += Math.sin(t * Math.PI * 4) * 0.06 + (Math.random() - 0.5) * 0.04;
      v = Math.max(0.15, Math.min(0.85, v));
      seedPts.push(v);
    }

    function buildPath(progress: number): string {
      const n = Math.max(2, Math.floor(seedPts.length * progress));
      let d = "";
      for (let i = 0; i < n; i++) {
        const x = pad + (i / (seedPts.length - 1)) * (W - pad * 2);
        const y = pad + (1 - seedPts[i]) * (H - pad * 2);
        d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
      }
      return d.trim();
    }
    function buildArea(progress: number): string {
      const line = buildPath(progress);
      const n = Math.max(2, Math.floor(seedPts.length * progress));
      const x = pad + ((n - 1) / (seedPts.length - 1)) * (W - pad * 2);
      return `${line} L${x.toFixed(1)},${H - pad} L${pad},${H - pad} Z`;
    }

    let raf = 0;
    let start = performance.now();
    function tick(now: number) {
      const elapsed = ((now - start) / 1000) % cycle;
      const p = elapsed / cycle;
      // ease in-out
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      path.setAttribute("d", buildPath(eased));
      if (area) area.setAttribute("d", buildArea(eased));
      raf = requestAnimationFrame(tick);
    }

    if (!reduce) {
      raf = requestAnimationFrame(tick);
    } else {
      path.setAttribute("d", buildPath(1));
      if (area) area.setAttribute("d", buildArea(1));
    }
    return () => cancelAnimationFrame(raf);
  }, [cycle, points, inView]);

  const color = `rgb(var(${colorVar}))`;

  if (!inView) {
    return <div ref={wrapRef} className={`pointer-events-none ${className}`} style={{ opacity, width: "100%", height: "100%" }} aria-hidden="true" />;
  }

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} style={{ width: "100%", height: "100%" }} aria-hidden="true">
    <svg
      viewBox="0 0 1000 240"
      preserveAspectRatio="none"
      style={{ opacity, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="slowmo-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path ref={areaRef} fill="url(#slowmo-area)" d="" />
      <path
        ref={ref}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        d=""
      />
    </svg>
    </div>
  );
}
