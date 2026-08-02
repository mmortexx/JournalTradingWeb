"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useLang } from "@/lib/i18n";
import { useTheme, PALETTES, type PaletteName } from "@/lib/theme";
import { asset } from "@/lib/asset";

/**
 * Cached at module load — used by `navigate()` to switch the in-page
 * smooth-scroll to an instant jump for users with `prefers-reduced-motion:
 * reduce`.
 */
const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * CommandPalette — Cmd+K / Ctrl+K quick-navigation palette.
 *
 * Multi-page aware: navigates between the 6 site routes (/, /features,
 * /demo, /pricing, /about, /faq) using full-page navigation
 * (`window.location.href = asset("/path")`) — appropriate for the static
 * GitHub Pages export. When the target is the current page, it falls back
 * to a smooth in-page scroll instead of a reload.
 *
 * Also covers theme/palette/language toggles and the "Buy Pro" CTA. All copy
 * is bilingual ES/EN derived once from `navigator.language` (defaulting to
 * ES) — separate from the app-wide `useLang()` so the palette works
 * regardless of the active site language.
 *
 * Keyboard: ↑/↓ navigate (loop), ↵ select, ⎋ close, ⌘K/⌃K toggle.
 *
 * ── Componente CONTROLADO, y por qué ──────────────────────────────────
 * La paleta ya no guarda su propio `open` ni escucha ⌘K: las dos cosas
 * viven ahora en `OverlayHost`. El motivo es de peso: este componente
 * arrastra `cmdk` y el árbol entero de `framer-motion`, y estaba montado
 * en el layout, es decir, en TODAS las páginas del sitio. Todo visitante
 * descargaba y ejecutaba la paleta aunque no llegara a pulsar ⌘K nunca.
 *
 * Con el estado fuera, `OverlayHost` puede escuchar el atajo con un
 * listener de tres líneas y traerse este módulo con `import()` solo
 * cuando de verdad se abre. El coste desaparece del arranque de todas
 * las páginas y se paga una vez, y solo quien usa el atajo lo paga.
 */

/* ------------------------------------------------------------------ */
/* Page model                                                          */
/* ------------------------------------------------------------------ */

type Page = {
  path: string;
  es: string;
  en: string;
};

/**
 * The site routes. Includes the 3 feature subpages (metricas, disciplina,
 * seguridad) so the command palette offers full keyboard navigation to
 * every content page — complements the 'g' + letter shortcuts.
 */
const PAGES: Page[] = [
  { path: "/", es: "Inicio", en: "Home" },
  { path: "/features", es: "Características", en: "Features" },
  { path: "/features/metricas", es: "Métricas", en: "Metrics" },
  { path: "/features/disciplina", es: "Disciplina", en: "Discipline" },
  { path: "/features/seguridad", es: "Seguridad", en: "Security" },
  { path: "/demo", es: "Demo", en: "Demo" },
  { path: "/pricing", es: "Precios", en: "Pricing" },
  { path: "/about", es: "Acerca de", en: "About" },
  { path: "/faq", es: "FAQ", en: "FAQ" },
];

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setOpen = onOpenChange;
  // Bilingual ES/EN based on browser language; default ES.
  /* El idioma de la paleta es el del SITIO, no el del navegador.
     ────────────────────────────────────────────────────────────────
     Antes se derivaba una sola vez de `navigator.language`, con el
     argumento de que así "funciona independientemente del idioma activo
     del sitio". El argumento está del revés: si el visitante ha elegido
     español en el selector, el panel de comandos tiene que hablarle en
     español. Con un navegador en inglés, la web entera salía en español
     y el panel en inglés — dos idiomas en la misma pantalla, y el que
     mandaba era el que el visitante NO había elegido.

     Ahora sale de `useLang()`, la misma fuente que el resto del sitio,
     así que cambiar el idioma en la barra también cambia el de la
     paleta y el atajo `⌘K` deja de ser una isla. */
  const { toggle: toggleLang, lang } = useLang();
  const es = lang === "es";
  const { theme, toggleTheme, setPalette, palette: currentPalette } = useTheme();
  const pathname = usePathname();

  const panelRef = useRef<HTMLDivElement>(null);

  /* ---------------- Keyboard listeners ---------------- */

  // El atajo ⌘K/⌃K vive en `OverlayHost`: es quien puede escucharlo sin
  // haber descargado antes este módulo. Aquí solo queda el comportamiento
  // de la paleta ya abierta.

  // Escape-to-close while open. Capture phase so we beat cmdk's internal
  // Escape handler (which only clears the search query).
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc, true);
    return () => window.removeEventListener("keydown", onEsc, true);
  }, [open]);

  // Focus trap + focus restore. Mirrors the Navbar mobile-drawer pattern
  // (Navbar.tsx ~L82-128): while the palette is open, Tab / Shift+Tab
  // cycle within the panel (cmdk handles its own ↑/↓ arrow nav, but Tab
  // could otherwise escape to the underlying page). On close, focus is
  // returned to whatever element was focused before the palette opened —
  // typically the Cmd+K trigger — so keyboard users keep their place.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusables(panel);
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = panel.contains(active);
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!inside || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  /* ---------------- Navigation helpers ---------------- */

  /**
   * Navigate to a page. Same-page target → smooth scroll to top instead
   * of a full reload. Cross-page target → `window.location.href =
   * asset(path)` which is the correct primitive for Next.js `output:
   * "export"` on GitHub Pages (full page load).
   */
  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      // Same page? Smooth scroll to top — no reload.
      if (pathname === path) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            behavior: PREFERS_REDUCED_MOTION ? "auto" : "smooth",
          });
        });
        return;
      }
      // Cross-page — full navigation.
      window.location.href = asset(path);
    },
    /* `setOpen` es ahora una PROP (`onOpenChange`), no el setter estable
       de un `useState`, así que tiene que ir en las dependencias. Sin
       ella estas dos funciones se quedarían con la versión del primer
       render y cerrarían un panel que ya no es el que está en pantalla:
       hoy funcionaría de milagro —porque el anfitrión pasa siempre la
       misma referencia— y dejaría de hacerlo en cuanto alguien montara
       la paleta desde otro sitio. */
    [pathname, setOpen]
  );

  // Run a side-effecting action then close the palette.
  const run = useCallback(
    (fn: () => void) => {
      fn();
      setOpen(false);
    },
    [setOpen]
  );

  // Override cmdk's default selected-state styling with our accent.
  const itemClass =
    "data-[selected=true]:bg-[rgb(var(--divider)/0.05)] data-[selected=true]:text-primary";

  return (
    <AnimatePresence>
      {open && (
        /* La `key` NO es opcional: `AnimatePresence` identifica por clave
           qué hijo entra y cuál sale. Sin ella no llega a registrar que
           este bloque existía, así que al pasar `open` a false nunca
           ejecuta la salida y el panel se queda clavado en pantalla —
           con ⌘K, con Escape y con el clic en el velo. Además, mientras
           el panel siga en el DOM, `GlobalShortcuts` cree que hay un
           overlay abierto y desactiva `?`, `t`, `l` y la navegación con
           `g`: un fallo se llevaba por delante todos los atajos. */
        <motion.div
          key="command-palette"
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-palette-title"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Visible (sr-only) heading — anchors the dialog's accessible name
              to a real DOM node so screen readers can navigate to it as a
              heading landmark. The visible UI label is the input placeholder;
              this heading is the accessible name. */}
          <h2 id="command-palette-title" className="sr-only">
            {es ? "Paleta de comandos" : "Command palette"}
          </h2>

          {/* Backdrop — subtle blur + fade-in */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm backdrop-saturate-150"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel — liquid-glass card, springy fade+scale+lift entrance */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="relative w-full max-w-xl liquid-glass rounded-card shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Command className="bg-transparent" loop>
              <CommandInput
                placeholder={
                  es
                    ? "Escribe un comando o búsqueda…"
                    : "Type a command or search…"
                }
                aria-label={es ? "Buscar comandos" : "Search commands"}
                autoComplete="off"
                spellCheck={false}
              />
              <CommandList className="max-h-[min(60vh,360px)] custom-scroll">
                <CommandEmpty>
                  {es ? "Sin resultados." : "No results found."}
                </CommandEmpty>

                {/* Navigation — all 6 site routes */}
                <CommandGroup heading={es ? "Navegación" : "Navigation"}>
                  {PAGES.map((p) => {
                    const label = es
                      ? `Ir a ${p.es}`
                      : `Go to ${p.en}`;
                    return (
                      <CommandItem
                        key={p.path}
                        className={itemClass}
                        value={`${label} ${p.es} ${p.en} ${p.path} ${
                          es ? "ir a página" : "go to page"
                        }`}
                        onSelect={() => navigate(p.path)}
                      >
                        <NavIcon />
                        <span className="text-primary">{label}</span>
                        <CommandShortcut className="tnum text-tertiary">
                          {p.path}
                        </CommandShortcut>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                {/* Preferences */}
                <CommandGroup heading={es ? "Preferencias" : "Preferences"}>
                  <CommandItem
                    className={itemClass}
                    value={
                      es
                        ? "cambiar tema oscuro claro apariencia"
                        : "toggle theme dark light appearance"
                    }
                    onSelect={() => run(toggleTheme)}
                  >
                    <ThemeIcon />
                    <span className="text-primary">
                      {es ? "Cambiar tema" : "Toggle theme"}
                    </span>
                    <CommandShortcut className="text-tertiary">
                      {theme === "dark"
                        ? es
                          ? "Oscuro"
                          : "Dark"
                        : es
                          ? "Claro"
                          : "Light"}
                    </CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    className={itemClass}
                    value={
                      es
                        ? "cambiar idioma español inglés"
                        : "toggle language spanish english"
                    }
                    onSelect={() => run(toggleLang)}
                  >
                    <LangIcon />
                    <span className="text-primary">
                      {es ? "Cambiar idioma" : "Toggle language"}
                    </span>
                    <CommandShortcut className="tnum text-tertiary">
                      ES / EN
                    </CommandShortcut>
                  </CommandItem>
                </CommandGroup>

                {/* Aquí vivía un grupo "Estilo" para elegir entre dos
                    estilos visuales. Retirado al quedar uno solo: un
                    grupo con una única opción que ya está activa no es
                    una elección, es ruido en el buscador. */}

                <CommandSeparator />

                {/* Action */}
                <CommandGroup heading={es ? "Acción" : "Action"}>
                  <CommandItem
                    className={itemClass}
                    value={es ? "comprar pro plan precios" : "buy pro plan pricing"}
                    onSelect={() => navigate("/pricing")}
                  >
                    <CartIcon />
                    <span className="text-primary">
                      {es ? "Comprar Pro" : "Buy Pro"}
                    </span>
                    <CommandShortcut className="tnum text-tertiary">
                      /pricing
                    </CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>

            {/* Footer keyboard hint */}
            <div
              className="flex items-center justify-between gap-2 px-3 py-2 border-t  text-[11px] text-tertiary"
              aria-hidden="true"
            >
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>{es ? "navegar" : "navigate"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                <span>{es ? "seleccionar" : "select"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                <span>{es ? "cerrar" : "close"}</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Small inline icons (currentColor, no indigo/blue) ---------- */

function NavIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-tertiary shrink-0"
      aria-hidden="true"
    >
      <path
        d="M3 8h9M8.5 4.5l3.5 3.5-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-tertiary shrink-0"
      aria-hidden="true"
    >
      <path
        d="M13 9.5A5 5 0 0 1 6.5 3 5 5 0 1 0 13 9.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LangIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-tertiary shrink-0"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.5 8h11M8 2.2c1.8 2 1.8 9.6 0 11.6M8 2.2c-1.8 2-1.8 9.6 0 11.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-tertiary shrink-0"
      aria-hidden="true"
    >
      <path
        d="M2 3h1.4l1.2 7.6a1 1 0 0 0 1 .85h6.1a1 1 0 0 0 1-.78L13.6 5H4.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="13" r="1" fill="currentColor" />
      <circle cx="11" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function PaletteSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-3 h-3 rounded-full border  shrink-0"
      style={{ background: color }}
    />
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded border  bg-[rgb(var(--divider)/0.03)] text-[10px] font-mono text-secondary tnum">
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------------ */
/* Focus-trap helper (mirrors Navbar.tsx getFocusables)               */
/* ------------------------------------------------------------------ */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  "details > summary:first-of-type",
].join(",");

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    const rects = el.getClientRects();
    if (rects.length === 0) return false;
    const { width, height } = rects[0];
    return width > 0 && height > 0;
  });
}
