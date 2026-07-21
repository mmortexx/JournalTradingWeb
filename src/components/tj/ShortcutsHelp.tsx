"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * ShortcutsHelp — keyboard shortcuts overlay.
 *
 * Opens via the `tj:open-shortcuts-help` window CustomEvent (dispatched by
 * `GlobalShortcuts` when `?` is pressed, or by the Navbar `?` button). Closes
 * on Escape, backdrop click, or the X button. Framer Motion handles a soft
 * scale + fade entrance/exit. Copy is bilingual ES/EN via `useLang()`.
 *
 * While open, sets `body[data-shortcuts-help-open="true"]` so other global
 * listeners (GlobalShortcuts) can suppress their own keys.
 *
 * The `?` keyboard trigger itself lives in `GlobalShortcuts`, which performs
 * the input/textarea/select/contentEditable + CommandPalette-open guards
 * before dispatching the open event.
 */
export function ShortcutsHelp() {
  const { lang } = useLang();
  const es = lang === "es";
  const [open, setOpen] = useState(false);

  // Open whenever any code dispatches `tj:open-shortcuts-help`.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("tj:open-shortcuts-help", onOpen);
    return () => window.removeEventListener("tj:open-shortcuts-help", onOpen);
  }, []);

  // While open: mark body so GlobalShortcuts can skip T/L, and capture Escape
  // on the way down (capture phase) so cmdk's or any other Escape handlers
  // can't swallow it.
  useEffect(() => {
    if (!open) return;
    document.body.dataset.shortcutsHelpOpen = "true";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc, true);
    return () => {
      delete document.body.dataset.shortcutsHelpOpen;
      window.removeEventListener("keydown", onEsc, true);
    };
  }, [open]);

  const shortcuts: { keys: ReactNode; label: string }[] = [
    {
      keys: (
        <>
          <Kbd>⌘/Ctrl</Kbd>
          <Kbd>K</Kbd>
        </>
      ),
      label: es ? "Abrir command palette" : "Open command palette",
    },
    {
      keys: <Kbd>?</Kbd>,
      label: es ? "Mostrar esta ayuda" : "Show this help",
    },
    {
      keys: <Kbd>1–6</Kbd>,
      label: es ? "Cambiar pestaña de demo" : "Switch demo tab",
    },
    {
      keys: <Kbd>F</Kbd>,
      label: es ? "Pantalla completa (demo)" : "Toggle fullscreen (demo)",
    },
    {
      keys: <Kbd>Esc</Kbd>,
      label: es ? "Cerrar" : "Close",
    },
    {
      keys: <Kbd>T</Kbd>,
      label: es ? "Cambiar tema" : "Toggle theme",
    },
    {
      keys: <Kbd>L</Kbd>,
      label: es ? "Cambiar idioma" : "Toggle language",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]"
          role="dialog"
          aria-modal="true"
          aria-label={es ? "Atajos de teclado" : "Keyboard shortcuts"}
        >
          {/* Backdrop — subtle blur + fade-in */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel — liquid-glass card, springy fade + scale + lift entrance */}
          <motion.div
            className="relative w-full max-w-md liquid-glass rounded-card shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b ">
              <div className="min-w-0">
                <h2 className="text-sm font-medium tracking-tight text-primary">
                  {es ? "Atajos de teclado" : "Keyboard shortcuts"}
                </h2>
                <p className="text-[11px] text-tertiary mt-0.5">
                  {es
                    ? "Muévete más rápido por la app."
                    : "Move faster through the app."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={es ? "Cerrar" : "Close"}
                className="icon-btn shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-tertiary hover:text-primary hover:bg-white/8 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* List */}
            <ul className="px-2 py-2">
              {shortcuts.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 px-2 py-2 rounded-md hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-sm text-secondary">{s.label}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    {s.keys}
                  </span>
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <div
              className="flex items-center justify-between gap-2 px-3 py-2 border-t  text-[11px] text-tertiary"
              aria-hidden="true"
            >
              <span className="flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                <span>{es ? "cerrar" : "close"}</span>
              </span>
              <span>
                {es ? "Pulsa ? cuando quieras" : "Press ? anytime"}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Small inline keyboard key chip — mirrors the CommandPalette styling. */
function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded border  bg-white/[0.03] text-[11px] font-mono text-secondary tnum">
      {children}
    </kbd>
  );
}

/**
 * Convenience helper for opening the help overlay from anywhere (e.g. the
 * Navbar `?` button). Kept here so the event name has a single source of truth.
 */
export function openShortcutsHelp() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tj:open-shortcuts-help"));
}
