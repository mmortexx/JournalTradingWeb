import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  variant?: "default" | "pos" | "neg" | "warn" | "accent" | "neutral";
  className?: string;
}

/** Small pill chip for direction, status, etc. */
export function Chip({ children, variant = "default", className = "" }: ChipProps) {
  const styles: Record<string, string> = {
    default: "bg-[rgb(var(--divider)/0.08)] text-secondary border border-[rgb(var(--divider)/0.10)]",
    pos: "bg-pnl-pos/15 text-pnl-pos border border-pnl-pos/25",
    neg: "bg-pnl-neg/15 text-pnl-neg border border-pnl-neg/25",
    warn: "bg-pnl-warn/15 text-pnl-warn border border-pnl-warn/25",
    accent: "bg-[rgb(var(--divider)/0.08)] text-primary border border-[rgb(var(--divider)/0.20)]",
    neutral: "bg-[rgb(var(--divider)/0.05)] text-tertiary border border-[rgb(var(--divider)/0.08)]",
  };
  return <span className={`pill ${styles[variant]} ${className}`}>{children}</span>;
}
