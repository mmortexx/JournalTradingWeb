"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { openShortcutsHelp } from "@/components/tj/ShortcutsHelp";

/**
 * GlobalShortcuts — invisible global keyboard shortcut router.
 *
 * Listens for:
 *  - `T`  → toggle theme (dark/light)
 *  - `L`  → toggle language (ES/EN)
 *  - `?` (Shift+/) → open the ShortcutsHelp overlay
 *
 * All three listeners are skipped when:
 *  - The user is typing in an INPUT, TEXTAREA, SELECT, or contentEditable
 *    element (so we don't hijack regular typing).
 *  - The CommandPalette is open (detected via the `[cmdk-root]` selector cmdk
 *    renders while mounted — see CommandPalette.tsx).
 *  - The ShortcutsHelp overlay itself is open (`body[data-shortcuts-help-open]`
 *    is set by ShortcutsHelp while it's mounted open).
 *  - A meta/ctrl/alt modifier is held (so we never swallow Cmd+T, Ctrl+L, etc.
 *    which the browser owns). Shift is allowed so `?` and uppercase `T`/`L`
 *    work naturally.
 *
 * Renders nothing — purely a side-effect listener.
 */
export function GlobalShortcuts() {
  const { toggle: toggleLang } = useLang();
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 1) Skip when typing in a form field or editable region.
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // 2) Skip when the CommandPalette is open — cmdk renders [cmdk-root]
      //    on its root while mounted.
      if (document.querySelector("[cmdk-root]")) return;

      // 3) Skip when the ShortcutsHelp overlay is open — it manages its own
      //    keys (Escape) and we don't want T/L/? to fire behind it.
      if (document.body.dataset.shortcutsHelpOpen === "true") return;

      // 4) Never hijack browser shortcuts that involve meta/ctrl/alt (Cmd+T,
      //    Ctrl+L, etc.). Shift is OK — needed for `?` and Shift+T/L.
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // `?` opens the help overlay. Detect by `e.key === "?"` (covers US
      // layouts where Shift+/ produces `?`) and also by `e.code === "Slash"`
      // + shift (layout-independent — works for ES keyboards where `?` lives
      // elsewhere). Either way, the user's intent is "show help".
      if (
        key === "?" ||
        (e.shiftKey && (key === "/" || e.code === "Slash"))
      ) {
        e.preventDefault();
        openShortcutsHelp();
        return;
      }

      // Single-character keys only — ignore dead keys, arrows, Enter, etc.
      if (key.length !== 1) return;

      const lower = key.toLowerCase();
      if (lower === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (lower === "l") {
        e.preventDefault();
        toggleLang();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTheme, toggleLang]);

  return null;
}
