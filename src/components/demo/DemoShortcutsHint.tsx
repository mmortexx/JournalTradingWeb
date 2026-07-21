"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";

/**
 * DemoShortcutsHint — compact liquid-glass card placed below the live demo that
 * reveals the keyboard shortcuts the demo actually responds to:
 *   1–6  switch tab · F fullscreen · Esc close · ⌘K command palette
 *
 * Uses <kbd> keycaps styled with the liquid-glass utility so they read as
 * real keys without pulling in a monospace family that would clash with
 * the rest of the typography.
 */

interface Shortcut {
  /** Either a single key, or multiple keys shown as a sequence. */
  keys: string[];
  labelEs: string;
  labelEn: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["1", "–", "6"], labelEs: "Cambiar pestaña", labelEn: "Switch tab" },
  { keys: ["F"], labelEs: "Pantalla completa", labelEn: "Fullscreen" },
  { keys: ["Esc"], labelEs: "Cerrar", labelEn: "Close" },
  { keys: ["⌘", "K"], labelEs: "Paleta de comandos", labelEn: "Command palette" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-md liquid-glass border border-white/10 text-[12px] font-medium text-secondary font-sans shadow-[0_1px_0_rgb(var(--tint)/0.5)]"
    >
      {children}
    </kbd>
  );
}

function KeyboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7 10h0M11 10h0M15 10h0M7 14h0M11 14h0M15 14h0M18 14h0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DemoShortcutsHint() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section
      aria-label={es ? "Atajos de teclado" : "Keyboard shortcuts"}
      className="section-tight relative"
    >
      <div className="max-w-page mx-auto px-5 md:px-8">
        <Reveal>
          <motion.div
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-4 md:p-5 max-w-3xl mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
          >
            <div className="flex items-center gap-3 md:min-w-[200px]">
              <span
                className="w-9 h-9 rounded-md flex items-center justify-center bg-white/8 text-primary shrink-0"
                aria-hidden="true"
              >
                <KeyboardIcon />
              </span>
              <div>
                <h3 className="text-sm md:text-base font-medium text-primary leading-tight">
                  {es ? "Atajos de teclado" : "Keyboard shortcuts"}
                </h3>
                <p className="text-xs text-tertiary">
                  {es ? "Funcionan sobre la demo" : "Work while on the demo"}
                </p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-3 flex-1">
              {shortcuts.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, j) =>
                      k === "–" ? (
                        <span key={j} className="text-tertiary text-xs mx-0.5">
                          –
                        </span>
                      ) : (
                        <Kbd key={j}>{k}</Kbd>
                      )
                    )}
                  </span>
                  <span className="text-xs md:text-sm text-secondary">
                    {es ? s.labelEs : s.labelEn}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
