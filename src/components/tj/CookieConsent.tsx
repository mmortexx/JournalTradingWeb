"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

/**
 * CookieConsent — small, bottom-left bilingual banner.
 *
 * - Reveals on FIRST scroll OR 5 s after mount — whichever comes first
 *   (only if the user hasn't previously dismissed it). The 2 s auto-reveal
 *   was replaced because it interrupted screen-reader page-load narration
 *   (a blind user landing on the page is read the hero copy first; an
 *   `aria-live="polite"` banner inserted at 2 s would cut that narration
 *   mid-sentence). The new policy waits for either an explicit scroll signal
 *   (user is actively navigating) or a 5 s fallback so screen-reader users
 *   who don't scroll still eventually get the consent prompt.
 * - Dismissal is persisted in `localStorage` under `tj-cookie-consent = "1"`.
 * - No tracking, no ads — purely technical cookies — so the copy says so.
 * - Reveal/dismiss: pure opacity fade in/out, no slide. Minimal, clean.
 *
 * Width: clamped to `max-w-sm` (384 px) but capped to `100vw - 6rem` on small
 * screens so the banner leaves a 64 px right gutter for the global BackToTop
 * button (44 px wide + 24 px right margin = 68 px) — they never overlap.
 *
 * State strategy follows the project rule: no setState inside effect bodies.
 * The "dismissed" flag uses a lazy initializer (SSR-safe — returns true so the
 * banner renders nothing on the server, then on the client it re-evaluates to
 * the real value before paint). The scroll/5 s reveal fires from a `setTimeout`
 * callback OR a `scroll` event handler (both are event-handler semantics, not
 * synchronous setState-in-effect). A `done` latch ensures whichever fires
 * first wins and the loser is a no-op.
 */
const STORAGE_KEY = "tj-cookie-consent";

export function CookieConsent() {
  const { lang } = useLang();
  const es = lang === "es";

  // Lazy initializer — reads localStorage once on client mount. On SSR returns
  // true so the banner is hidden server-side and there is no hydration mismatch
  // (the visible state is driven separately by the scroll/5 s timer below).
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(false);

  // Reveal on first scroll OR 5 s after mount — whichever fires first.
  // Rationale: the old 2 s auto-reveal interrupted screen-reader page-load
  // narration (a polite `aria-live` banner inserted at 2 s cuts the hero copy
  // narration mid-sentence). Waiting for an explicit scroll signal means the
  // user is already navigating past the hero; the 5 s fallback covers non-
  // scrolling screen-reader users. The `done` latch ensures the loser is a
  // no-op (no double `setVisible` call, no double cleanup).
  useEffect(() => {
    if (dismissed) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => reveal();
    window.addEventListener("scroll", onScroll, { passive: true });

    const timeoutId = window.setTimeout(reveal, 5000);

    return () => {
      done = true; // prevent any in-flight callback from firing post-unmount
      window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [dismissed]);

  function dismiss() {
    setVisible(false);
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* localStorage unavailable — keep in-memory dismissal only. */
    }
  }

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          role="dialog"
          aria-live="polite"
          aria-label={es ? "Consentimiento de cookies" : "Cookie consent"}
          className="fixed bottom-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-[min(24rem,calc(100vw-6rem))] liquid-glass rounded-card p-4 shadow-2xl safe-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-start gap-3">
            <CookieIcon />
            <p className="text-[13px] leading-relaxed text-secondary flex-1">
              {es
                ? "Usamos cookies técnicas para recordar tus preferencias. Sin tracking, sin publicidad."
                : "We use technical cookies to remember your preferences. No tracking, no ads."}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-end gap-3">
            <Link
              href="/faq"
              onClick={dismiss}
              className="text-[12px] font-medium text-tertiary hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {es ? "Más info" : "Learn more"}
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="bg-[rgb(var(--accent-base))] text-[#06130d] px-6 py-2 rounded-lg text-sm font-medium hover:brightness-110 active:scale-[0.97] transition-all"
            >
              {es ? "Entendido" : "Got it"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Cookie icon (currentColor, no indigo/blue) ---------- */

function CookieIcon() {
  return (
    <span
      className="shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[rgb(var(--divider)/0.05)] text-primary"
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      >
        <path d="M13.5 8.2A5.3 5.3 0 1 1 7.8 2.5a2.6 2.6 0 0 0 3.2 3.2 2.6 2.6 0 0 0 2.5 2.5z" />
        <circle cx="5.7" cy="6.2" r="0.55" fill="currentColor" stroke="none" />
        <circle cx="9.4" cy="5.4" r="0.55" fill="currentColor" stroke="none" />
        <circle cx="6.4" cy="9.8" r="0.55" fill="currentColor" stroke="none" />
        <circle cx="10.2" cy="9.6" r="0.55" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}
