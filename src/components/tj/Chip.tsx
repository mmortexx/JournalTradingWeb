import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  variant?: "default" | "pos" | "neg" | "warn" | "accent" | "neutral";
  className?: string;
}

/** Small pill chip for direction, status, etc. */
export function Chip({ children, variant = "default", className = "" }: ChipProps) {
  const styles: Record<string, string> = {
    default: "bg-white/8 text-gray-300 border border-white/10",
    pos: "bg-pnl-pos/15 text-pnl-pos border border-pnl-pos/25",
    neg: "bg-pnl-neg/15 text-pnl-neg border border-pnl-neg/25",
    warn: "bg-pnl-warn/15 text-pnl-warn border border-pnl-warn/25",
    accent: "bg-white/8 text-white border border-white/20",
    neutral: "bg-white/5 text-gray-400 border border-white/8",
  };
  return <span className={`pill ${styles[variant]} ${className}`}>{children}</span>;
}
