"use client";

import { memo, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Metrics } from "@/lib/trading/data";
import { useLang } from "@/lib/i18n";

interface EquityCurveProps {
  metrics: Metrics;
  height?: number;
  showAxis?: boolean;
  showDrawdown?: boolean;
  className?: string;
}

/** SVG equity curve with drawdown shading, animated draw-in, hover tooltip. */
export const EquityCurve = memo(function EquityCurve({
  metrics,
  height = 220,
  showAxis = true,
  showDrawdown = true,
  className = "",
}: EquityCurveProps) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const { equityCurve, drawdownCeiling } = metrics;
  // Hover state: data index + mouse X (px) + container width (px) for clamping.
  const [hover, setHover] = useState<{ idx: number; mx: number; width: number } | null>(null);

  const W = 800;
  const H = height;
  const padL = showAxis ? 56 : 8;
  const padR = 12;
  const padT = 12;
  const padB = showAxis ? 24 : 8;

  const { linePath, areaPath, ddPath, points, minBal, maxBal } = useMemo(() => {
    if (!equityCurve.length) {
      return {
        linePath: "",
        areaPath: "",
        ddPath: "",
        points: [] as { x: number; y: number; date: Date; balance: number; perf: number; ceiling: number }[],
        minBal: 0,
        maxBal: 0,
      };
    }
    const balances = equityCurve.map((e) => e.balance);
    const minBal = Math.min(...balances);
    const maxBal = Math.max(...balances);
    const range = maxBal - minBal || 1;

    const pts = equityCurve.map((e, i) => {
      const x = padL + (i / (equityCurve.length - 1)) * (W - padL - padR);
      const y = padT + (1 - (e.balance - minBal) / range) * (H - padT - padB);
      return { x, y, ...e, ceiling: drawdownCeiling[i] };
    });

    const linePath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
    const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${H - padB} L${pts[0].x.toFixed(1)},${H - padB} Z`;

    const ddPath = pts
      .map((p, i) => {
        const ceilY = padT + (1 - (p.ceiling - minBal) / range) * (H - padT - padB);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${ceilY.toFixed(1)} L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

    return { linePath, areaPath, ddPath, points: pts, minBal, maxBal };
  }, [equityCurve, drawdownCeiling, padL, padR, padT, padB, H]);

  if (!equityCurve.length) {
    return <div className={`text-gray-400 text-sm ${className}`} style={{ height }}>Sin datos</div>;
  }

  const locale = lang === "es" ? "es-ES" : "en-US";
  const hoverPoint = hover && points[hover.idx];

  // Tooltip X follows the mouse, clamped so it never overflows left/right edges.
  // ~180px tooltip → 90px half-width kept clear of the edges.
  const TOOLTIP_HALF = 92;
  let tooltipLeft: number | null = null;
  let tooltipTop = 6;
  let tooltipTransform = "translateX(-50%)";
  if (hover && hoverPoint) {
    const w = hover.width || W;
    tooltipLeft = Math.max(TOOLTIP_HALF, Math.min(w - TOOLTIP_HALF, hover.mx));
    // Place the tooltip just above the marker dot; flip below if too close to the top.
    const markerY = hoverPoint.y; // SVG y == container px (viewBox H == element H)
    if (markerY < 92) {
      tooltipTop = markerY + 14;
      tooltipTransform = "translateX(-50%)";
    } else {
      tooltipTop = markerY - 10;
      tooltipTransform = "translate(-50%, -100%)";
    }
  }

  // Drawdown from the running peak at this point.
  const drawdown = hoverPoint ? hoverPoint.ceiling - hoverPoint.balance : 0;

  return (
    <motion.div
      className={`relative liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card ${className}`}
      whileHover={reduce ? undefined : { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      style={{ transformOrigin: "center" }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={lang === "es"
          ? `Curva de capital desde $${Math.round(minBal).toLocaleString()} hasta $${Math.round(maxBal).toLocaleString()}`
          : `Equity curve from $${Math.round(minBal).toLocaleString()} to $${Math.round(maxBal).toLocaleString()}`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round(((svgX - padL) / (W - padL - padR)) * (points.length - 1));
          if (idx >= 0 && idx < points.length) {
            const mx = e.clientX - rect.left;
            setHover({ idx, mx, width: rect.width });
          }
        }}
      >
        <defs>
          <linearGradient id="eq-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent-base))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="rgb(var(--accent-base))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eq-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--accent-base))" />
            <stop offset="100%" stopColor="rgb(var(--accent-hover))" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {showAxis &&
          [0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padT + t * (H - padT - padB);
            const val = maxBal - t * (maxBal - minBal);
            return (
              <g key={t}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgb(var(--divider) / 0.06)" strokeWidth="1" />
                <text x={padL - 8} y={y + 3} textAnchor="end" className="text-[10px] tnum" fill="rgb(var(--txt-tertiary))">
                  ${Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

        {/* Drawdown shading */}
        {showDrawdown && (
          <path d={ddPath} fill="rgb(var(--pnl-neg) / 0.10)" stroke="none" />
        )}

        {/* Area + line */}
        <motion.path
          d={areaPath}
          fill="url(#eq-area)"
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={reduce ? { duration: 0 } : { duration: 1, delay: 0.3 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#eq-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={reduce ? { duration: 0 } : { duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Hover crosshair + pulsing marker */}
        {hoverPoint && (
          <g>
            {/* Vertical crosshair */}
            <line
              x1={hoverPoint.x}
              y1={padT}
              x2={hoverPoint.x}
              y2={H - padB}
              stroke="rgb(var(--accent-base))"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.4"
            />
            {/* Horizontal crosshair at the hover point */}
            <line
              x1={padL}
              y1={hoverPoint.y}
              x2={W - padR}
              y2={hoverPoint.y}
              stroke="rgb(var(--accent-base))"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.4"
            />
            {/* Hover indicator dot — static (no infinite ping). */}
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r="6"
              fill="none"
              stroke="rgb(var(--accent-base))"
              strokeWidth="1"
              opacity="0.4"
            />
            {/* Inner solid dot */}
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r="4"
              fill="rgb(var(--accent-base))"
              stroke="rgb(var(--txt-primary))"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>

      {/* Rich hover tooltip — date, balance, P&L since start, drawdown from peak */}
      {hoverPoint && tooltipLeft !== null && (
        <div
          className="absolute pointer-events-none liquid-glass glass-thin rounded-md px-3 py-2 text-xs whitespace-nowrap z-10"
          style={{
            left: tooltipLeft,
            top: tooltipTop,
            transform: tooltipTransform,
          }}
        >
          <div className="text-gray-400 text-[10px]">
            {hoverPoint.date.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div className="font-semibold tnum text-white text-[13px] mt-0.5">
            ${hoverPoint.balance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center justify-between gap-3 mt-1 text-[11px]">
            <span className="text-gray-400">{lang === "es" ? "Desde inicio" : "Since start"}</span>
            <span className={`tnum font-medium ${hoverPoint.perf >= 0 ? "text-pnl-pos" : "text-pnl-neg"}`}>
              {hoverPoint.perf >= 0 ? "+" : "−"}${Math.abs(hoverPoint.perf).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-gray-400">{lang === "es" ? "Desde pico" : "From peak"}</span>
            <span className={`tnum font-medium ${drawdown > 0 ? "text-pnl-neg" : "text-gray-400"}`}>
              {drawdown > 0
                ? `−${drawdown.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                : "0"}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
});
