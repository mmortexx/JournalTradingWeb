"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface KpiStripProps {
  items: { label: string; value: ReactNode; tone?: "pos" | "neg" | "neutral" }[];
  className?: string;
}

/** Horizontal strip of KPI metrics with dividers. */
export function KpiStrip({ items, className = "" }: KpiStripProps) {
  return (
    <div className={`flex flex-wrap items-stretch gap-x-6 gap-y-4 ${className}`}>
      {items.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.5 }}
          className="flex flex-col min-w-[110px]"
        >
          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
            {kpi.label}
          </span>
          <span
            className={`font-semibold tnum text-white mt-1 ${
              kpi.tone === "pos"
                ? "text-pnl-pos"
                : kpi.tone === "neg"
                ? "text-pnl-neg"
                : ""
            }`}
          >
            {kpi.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
