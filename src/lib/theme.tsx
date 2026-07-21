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
export type PaletteName = "oro" | "esmeralda" | "onix" | "aurora" | "seda";

export const PALETTES: {
  name: PaletteName;
  light: string;
  dark: string;
  labelKey:
    | "palGold"
    | "palEmerald"
    | "palOnyx"
    | "palAurora"
    | "palSilk";
}[] = [
  { name: "onix", light: "#45505E", dark: "#8291AF", labelKey: "palOnyx" },
  { name: "seda", light: "#39566A", dark: "#6D94B0", labelKey: "palSilk" },
  { name: "esmeralda", light: "#2D766A", dark: "#5CC1B0", labelKey: "palEmerald" },
  { name: "aurora", light: "#5B356E", dark: "#9C68B6", labelKey: "palAurora" },
  { name: "oro", light: "#8A6C35", dark: "#C7A76B", labelKey: "palGold" },
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
  if (typeof window === "undefined") return "oro";
  return (localStorage.getItem("tj-palette") as PaletteName) || "oro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with defaults on both server and client to avoid hydration mismatch.
  // The inline script in layout.tsx already applied the DOM attributes before
  // paint, so there's no visual flash. We sync to localStorage after mount.
  const [theme, setTheme] = useState<Theme>("dark");
  const [palette, setPalette] = useState<PaletteName>("oro");
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
