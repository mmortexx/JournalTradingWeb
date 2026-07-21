"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
