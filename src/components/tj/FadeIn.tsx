"use client";

import { useEffect, useState, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number; // ms
  duration?: number; // ms
  className?: string;
}

/**
 * FadeIn wrapper — starts at opacity 0, transitions to opacity 1
 * after a configurable delay. Uses inline transitionDuration + Tailwind.
 */
export function FadeIn({ children, delay = 0, duration = 1000, className = "" }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${visible ? "opacity-100" : "opacity-0"} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
