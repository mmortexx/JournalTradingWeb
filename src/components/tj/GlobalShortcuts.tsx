"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { asset } from "@/lib/asset";
import { openShortcutsHelp } from "@/components/tj/ShortcutsHelp";

/**
 * GlobalShortcuts — invisible global keyboard shortcut router.
 *
 * Listens for:
 *  - `T`  → toggle theme (dark/light)
 *  - `L`  → toggle language (ES/EN)
 *  - `?` (Shift+/) → open the ShortcutsHelp overlay
 *  - `g` + letter → navigate to a page (GitHub-style two-key sequence):
 *      `g h` → /            (home)
 *      `g f` → /features    (features overview)
 *      `g m` → /features/metricas
 *      `g d` → /features/disciplina
 *      `g s` → /features/seguridad
 *      `g p` → /pricing
 *      `g e` → /demo        (e for "experiencia"/demo)
 *      `g a` → /about
 *      `g q` → /faq         (q for "questions")
 *
 * The `g` prefix sets a 1-second window; if no valid second key arrives
 * in time, the prefix expires silently. A subtle on-screen hint chip
 * appears while the prefix is active so the user knows the next key is
 * being captured.
 *
 * All listeners are skipped when:
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

const G_PREFIX_TIMEOUT = 1000; // ms — how long the `g` prefix stays active

const G_NAV_MAP: Record<string, string> = {
  h: "/",
  f: "/features",
  m: "/features/metricas",
  d: "/features/disciplina",
  s: "/features/seguridad",
  p: "/pricing",
  e: "/demo",
  a: "/about",
  q: "/faq",
};

export function GlobalShortcuts() {
  const { toggle: toggleLang } = useLang();
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const gPrefixActive = useRef(false);
  const gPrefixTimer = useRef<number | null>(null);

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

      // `g` prefix handling — GitHub-style two-key navigation. When `g` is
      // pressed, we arm a 1-second window during which the next letter
      // navigates to the corresponding page. If the second key isn't a
      // valid nav target, the prefix simply expires.
      if (gPrefixActive.current) {
        // Cancel the pending expiry timer — we're consuming the prefix now.
        if (gPrefixTimer.current) {
          window.clearTimeout(gPrefixTimer.current);
          gPrefixTimer.current = null;
        }
        gPrefixActive.current = false;
        const dest = G_NAV_MAP[lower];
        if (dest) {
          e.preventDefault();
          router.push(asset(dest));
        }
        // If dest is undefined, the prefix is consumed but no navigation
        // happens (the key was an invalid second key — silent no-op).
        return;
      }

      if (lower === "g") {
        e.preventDefault();
        gPrefixActive.current = true;
        // Expire the prefix after G_PREFIX_TIMEOUT ms so a stale `g`
        // doesn't capture a much-later keystroke.
        gPrefixTimer.current = window.setTimeout(() => {
          gPrefixActive.current = false;
          gPrefixTimer.current = null;
        }, G_PREFIX_TIMEOUT);
        return;
      }

      if (lower === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (lower === "l") {
        e.preventDefault();
        toggleLang();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gPrefixTimer.current) window.clearTimeout(gPrefixTimer.current);
    };
  }, [toggleTheme, toggleLang, router]);

  return null;
}
