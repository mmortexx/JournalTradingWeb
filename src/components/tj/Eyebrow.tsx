import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Small uppercase label used as section headers. */
export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <div className={`eyebrow inline-flex items-center gap-2 ${className}`}>
      <span className="w-6 h-px bg-[rgb(var(--divider))] opacity-60" />
      {children}
    </div>
  );
}
