"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "light";
/* Tras el rediseño solo hay una paleta (verde institucional #34B476).
   El tipo se mantiene como union literal para que el anti-FOUC script y
   data-palette sigan funcionando sin rupturas. */
export type PaletteName = "verde";

export const PALETTES: {
  name: PaletteName;
  light: string;
  dark: string;
}[] = [
  { name: "verde", light: "#0F8A56", dark: "#34B476" },
];

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  palette: PaletteName;
  setPalette: (p: PaletteName) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

function readSavedTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("tj-theme") as Theme) || "dark";
}
function readSavedPalette(): PaletteName {
  if (typeof window === "undefined") return "verde";
  // Acepta el valor legacy (oro/esmeralda/...) leyendo del localStorage,
  // pero siempre resuelve a "verde" tras el rediseño. Si en el futuro
  // vuelve a haber varias paletas, restaurar la lógica del switch aquí.
  localStorage.getItem("tj-palette");
  return "verde";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with defaults on both server and client to avoid hydration mismatch.
  // The inline script in layout.tsx already applied the DOM attributes before
  // paint, so there's no visual flash. We sync to localStorage after mount.
  const [theme, setTheme] = useState<Theme>("dark");
  const [palette, setPalette] = useState<PaletteName>("verde");
  const [mounted, setMounted] = useState(false);

  // Read saved preferences once after mount (standard theme hydration pattern).
  // This is the canonical SSR-safe theme initialization: render default on
  // server + first client paint, then sync to stored value after hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTheme(readSavedTheme());
    setPalette(readSavedPalette());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("tj-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.palette = palette;
    localStorage.setItem("tj-palette", palette);
  }, [palette, mounted]);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((p) => (p === "dark" ? "light" : "dark")),
      palette,
      setPalette,
    }),
    [theme, palette]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}
