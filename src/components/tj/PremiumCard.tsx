import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

/** The liquid-glass card — translucent material with refraction border-white/10 border. */
export function PremiumCard({
  children,
  className = "",
  as: Tag = "div",
}: PremiumCardProps) {
  return <Tag className={`liquid-glass rounded-card ${className}`}>{children}</Tag>;
}
