"use client";

import { memo, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Trade } from "@/lib/trading/data";
import { dailyPnlForMonth } from "@/lib/trading/data";
import { useLang } from "@/lib/i18n";
import { fmtMoney } from "@/lib/trading/format";

interface MiniCalendarProps {
  trades: Trade[];
  className?: string;
}

const WEEKDAY_HEADERS_ES = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** P&L calendar for the most recent active month. */
export const MiniCalendar = memo(function MiniCalendar({ trades, className = "" }: MiniCalendarProps) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Hovered day: day-of-month + anchor point (px, relative to container).
  const [hovered, setHovered] = useState<{ day: number; x: number; y: number } | null>(null);

  const { year, month, days, dailyPnl, maxAbs } = useMemo(() => {
    // Find the most recent month with trades
    if (!trades.length) return { year: 2026, month: 6, days: 30, dailyPnl: new Map(), maxAbs: 1 };
    const sorted = [...trades].sort((a, b) => b.closedAt.getTime() - a.closedAt.getTime());
    const latest = sorted[0].closedAt;
    const targetMonth = new Date(latest.getFullYear(), latest.getMonth() + offset, 1);
    const y = targetMonth.getFullYear();
    const mo = targetMonth.getMonth();
    const d = new Date(y, mo + 1, 0).getDate();
    const dp = dailyPnlForMonth(trades, y, mo);
    let ma = 0;
    dp.forEach((v) => { ma = Math.max(ma, Math.abs(v)); });
    return { year: y, month: mo, days: d, dailyPnl: dp, maxAbs: ma || 1 };
  }, [trades, offset]);

  const firstWeekday = new Date(year, month, 1).getDay(); // 0 Sun .. 6 Sat
  // Convert Sunday=0 to Monday=0 based
  const leadingBlanks = (firstWeekday + 6) % 7;
  const monthName = lang === "es" ? MONTHS_ES[month] : MONTHS_EN[month];

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthPnl = Array.from(dailyPnl.values()).reduce((s, v) => s + v, 0);

  return (
    <motion.div
      className={`relative liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card ${className}`}
      ref={containerRef}
      whileHover={reduce ? undefined : { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      style={{ transformOrigin: "center" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="t-h4 text-white">{monthName} {year}</div>
          <div className={`text-xs tnum mt-0.5 ${monthPnl >= 0 ? "text-pnl-pos" : "text-pnl-neg"}`}>
            {fmtMoney(monthPnl, lang, { sign: true, decimals: 0 })}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
            aria-label={lang === "es" ? "Mes anterior" : "Previous month"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
            aria-label={lang === "es" ? "Mes siguiente" : "Next month"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_HEADERS_ES.map((d) => (
          <div key={d} className="text-[9px] text-gray-400 text-center font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const pnl = dailyPnl.get(String(day));
          const intensity = pnl !== undefined ? Math.abs(pnl) / maxAbs : 0;
          const pos = (pnl ?? 0) >= 0;
          const bg =
            pnl === undefined
              ? "transparent"
              : pos
              ? `rgb(var(--pnl-pos) / ${0.08 + intensity * 0.5})`
              : `rgb(var(--pnl-neg) / ${0.08 + intensity * 0.5})`;
          return (
            <motion.div
              key={i}
              initial={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.006, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduce ? undefined : { scale: 1.06 }}
              className="aspect-square rounded-sm flex flex-col items-center justify-center text-[10px] tnum cursor-default relative group"
              style={{ backgroundColor: bg, border: pnl !== undefined ? "1px solid rgb(var(--divider) / 0.06)" : "1px solid transparent" }}
              onMouseEnter={(e) => {
                const cell = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const cont = containerRef.current?.getBoundingClientRect();
                if (!cont) return;
                setHovered({
                  day: day as number,
                  x: cell.left - cont.left + cell.width / 2,
                  y: cell.top - cont.top,
                });
              }}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={pnl !== undefined ? "text-gray-300" : "text-gray-400"}>{day}</span>
              {pnl !== undefined && intensity > 0.25 && (
                <span className={`text-[8px] leading-none ${pos ? "text-pnl-pos" : "text-pnl-neg"}`} style={{ filter: "brightness(1.5)" }}>
                  {pos ? "+" : "−"}{Math.abs(pnl) >= 1000 ? `${(Math.abs(pnl) / 1000).toFixed(1)}k` : Math.round(Math.abs(pnl))}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Floating liquid-glass tooltip above the day cell */}
      {hovered && (
        <div
          className="absolute pointer-events-none liquid-glass glass-thin rounded-md px-3 py-2 text-xs whitespace-nowrap z-10"
          style={{
            left: `clamp(80px, ${hovered.x}px, calc(100% - 80px))`,
            top: hovered.y - 6,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-gray-400 text-[10px]">
            {hovered.day} {monthName} {year}
          </div>
          {dailyPnl.get(String(hovered.day)) !== undefined ? (
            <div
              className={`font-semibold tnum mt-0.5 ${
                (dailyPnl.get(String(hovered.day)) ?? 0) >= 0 ? "text-pnl-pos" : "text-pnl-neg"
              }`}
            >
              {fmtMoney(dailyPnl.get(String(hovered.day)) ?? 0, lang, { sign: true })}
            </div>
          ) : (
            <div className="text-gray-400 mt-0.5">
              {lang === "es" ? "Sin operaciones" : "No trades"}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});
