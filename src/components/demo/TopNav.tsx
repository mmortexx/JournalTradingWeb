"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useDemo, type DemoPage } from "./DemoContext";
import { useLang } from "@/lib/i18n";

const NAV_ITEMS: { key: DemoPage; icon: React.ReactNode; labelKey: "pageDashboard" | "pageTrades" | "pageAnalytics" | "pageJournal" | "pagePlaybook" | "pageSettings" }[] = [
  {
    key: "dashboard",
    labelKey: "pageDashboard",
    icon: <path d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z" />,
  },
  {
    key: "trades",
    labelKey: "pageTrades",
    icon: <path d="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    key: "analytics",
    labelKey: "pageAnalytics",
    icon: <path d="M4 19V5M4 19h16M8 16l3-5 3 3 4-7" />,
  },
  {
    key: "journal",
    labelKey: "pageJournal",
    icon: <path d="M5 4h14v16l-7-3-7 3V4z" />,
  },
  {
    key: "playbook",
    labelKey: "pagePlaybook",
    icon: <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM8 8h8M8 12h8M8 16h5" />,
  },
  {
    key: "settings",
    labelKey: "pageSettings",
    icon: <path d="M12 8a4 4 0 100 8 4 4 0 000-8zM19.4 13a7.5 7.5 0 000-2l2-1.5-2-3.5-2.4 1a7.5 7.5 0 00-1.7-1l-.4-2.5h-4l-.4 2.5a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.5L4.6 11a7.5 7.5 0 000 2l-2 1.5 2 3.5 2.4-1a7.5 7.5 0 001.7 1l.4 2.5h4l.4-2.5a7.5 7.5 0 001.7-1l2.4 1 2-3.5-2-1.5z" />,
  },
];

/** App-style top navigation with 6 tabs + animated active indicator.
 * Sits below the WinUI 3 title bar; mirrors the in-app tab strip of a
 * real desktop app (Linear / VS Code / WinUI 3 NavigationView).
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ ▸ Resumen   Operaciones   Detalle   Analítica   ...    │ + Nueva │
 *   └──────────────────────────────────────────────────────────────────┘
 *   • Left (flex-1, overflow-x-auto): the 6 nav tabs with animated accent
 *     underline indicator. Scrolls horizontally on narrow viewports via
 *     `.no-scrollbar` (hidden scrollbar) so the strip stays clean.
 *   • Right (shrink-0): a "+ Nueva operación" / "+ New trade" button that
 *     jumps to the Dashboard page (where the trade-logging form lives).
 *     Accent-tinted to read as the primary in-app action.
 */
export function TopNav() {
  const { page, setPage } = useDemo();
  const { t, lang } = useLang();

  /** Map current `page` back to the nav item that owns it (e.g. "detail" → "trades"). */
  const activeNavKey = page === "detail" ? "trades" : page;
  const activeIndex = NAV_ITEMS.findIndex((item) => item.key === activeNavKey);

  const focusTab = (index: number) => {
    const root = document.getElementById("demo-tablist");
    if (!root) return;
    const buttons = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const clamped = Math.max(0, Math.min(NAV_ITEMS.length - 1, index));
    buttons[clamped]?.focus();
    setPage(NAV_ITEMS[clamped].key);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(NAV_ITEMS.length - 1);
        break;
      default:
        break;
    }
  };

  // Global digit shortcuts: pressing 1–6 switches to the corresponding tab.
  // Skipped while focus is inside an input/textarea/select/contentEditable so
  // we don't hijack typing. Listener attaches on mount, reads `setPage` from
  // the demo context (stable enough thanks to the context value memo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
      const num = Number.parseInt(e.key, 10);
      if (Number.isInteger(num) && num >= 1 && num <= NAV_ITEMS.length) {
        e.preventDefault();
        setPage(NAV_ITEMS[num - 1].key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPage]);

  return (
    <div className="liquid-glass border-b border-white/10 flex items-stretch h-11 shrink-0">
      <div
        id="demo-tablist"
        role="tablist"
        aria-label={t("demoTitle")}
        onKeyDown={onKeyDown}
        className="flex items-center gap-1 px-2 flex-1 min-w-0 overflow-x-auto no-scrollbar"
      >
        {NAV_ITEMS.map((item) => {
          const active = page === item.key || (item.key === "trades" && page === "detail");
          const label = t(item.labelKey);
          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={active}
              aria-label={label}
              aria-controls="demo-tabpanel"
              tabIndex={active ? 0 : -1}
              onClick={() => setPage(item.key)}
              className={`relative h-9 px-3 rounded-md flex items-center gap-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                active
                  ? "text-primary"
                  : "text-tertiary hover:text-secondary hover:bg-white/5"
              }`}
            >
              {/* Active background pill — animated between tabs via layoutId. */}
              {active && (
                <motion.span
                  layoutId="demo-tab"
                  className="absolute inset-0 rounded-md bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {/* Active accent underline — a 2px gold bar at the bottom of
                  the tab. Animated separately via layoutId so it slides
                  between tabs in sync with the background pill. Mirrors
                  the Linear / VS Code active-tab indicator. */}
              {active && (
                <motion.span
                  layoutId="demo-tab-underline"
                  aria-hidden="true"
                  className="absolute bottom-[5px] left-3 right-3 h-0.5 rounded-full"
                  style={{ background: "rgb(var(--accent-base))" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative shrink-0"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
              <span className="relative hidden sm:inline">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Right — "+ New trade" button. Jumps to the Dashboard page where
          the trade-logging form lives. Accent-tinted at low opacity so it
          reads as the primary in-app action without competing with the
          tab strip. Hidden below md to keep the tab strip breathable on
          narrow viewports. */}
      <div className="flex items-center gap-2 px-2 shrink-0 border-l border-white/5">
        <button
          type="button"
          onClick={() => setPage("dashboard")}
          aria-label={lang === "es" ? "Nueva operación" : "New trade"}
          className="h-8 px-2.5 rounded-md flex items-center gap-1.5 text-[12px] font-medium text-secondary hover:text-primary hover:bg-white/5 transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          <span className="hidden md:inline">
            {lang === "es" ? "Nueva operación" : "New trade"}
          </span>
        </button>
      </div>
    </div>
  );
}
