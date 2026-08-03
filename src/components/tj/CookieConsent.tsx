"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
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
 * - Dismissal is persisted in `localStorage` under `tj-cookie-consent`,
 *   with the value `"accepted"` or `"declined"` so future logic (analytics,
 *   preference cookies) can branch on the user's choice. For now both
 *   outcomes are functionally identical — the site uses only strictly-
 *   necessary technical cookies — but presenting both buttons respects the
 *   user's agency and matches the GDPR-style consent affordance the rest
 *   of the chrome (footer, navbar) implies.
 * - Reveal/dismiss: pure opacity fade in/out, no slide. Minimal, clean.
 * - `MotionConfig reducedMotion="user"` makes framer-motion respect
 *   `prefers-reduced-motion: reduce` automatically — transforms and layout
 *   animations are disabled, the opacity fade is preserved (it's not a
 *   motion-sickness trigger).
 *
 * Width: clamped to `min(22rem, 100vw - 7rem)` via inline style. The 7 rem
 * right gutter (112 px) clears the global BackToTop button (44 px wide +
 * 24 px right margin = 68 px) with a comfortable 28 px buffer on 390 px
 * viewports, so the two never overlap when both are visible. BackToTop
 * additionally lifts itself above the banner via `data-cookie-consent`
 * detection (see BackToTop.tsx) so the two never share a vertical band
 * either — belt and suspenders.
 *
 * Action row: a 2-column grid (Decline | Accept). Both buttons fill their
 * grid cell (`w-full`) so they share the banner width equally regardless
 * of label length, and both meet the WCAG 2.5.5 44 px tap target. The
 * previous "Más info" link was dropped because the FAQ it pointed at is
 * already linked from the footer's Resources column; duplicating it here
 * forced `flex-wrap` on narrow viewports and bloated the banner to 250+
 * px (3 stacked button rows). The 2-col grid keeps the action region to a
 * single 44 px row.
 *
 * POSITION OVERRIDE — `style={{ position: "fixed" }}`. The `.liquid-glass`
 * material class sets `position: relative` (so its `::before` rim and
 * `::after` inset highlights can absolute-position against the host). That
 * rule has the same specificity as Tailwind's `.fixed` utility but is
 * defined later in `globals.css`, so it wins — the banner was rendering
 * in normal document flow at the bottom of the page, not pinned to the
 * viewport. Inline `position: fixed` has higher specificity than any class
 * selector and reliably overrides the `.liquid-glass` rule. (We can't edit
 * globals.css from this subagent — see T2a ownership.)
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
      const v = window.localStorage.getItem(STORAGE_KEY);
      return v === "accepted" || v === "declined";
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

  /** Persist the user's choice and hide the banner. Both branches functionally
   *  do the same thing today (no non-essential cookies are loaded), but the
   *  stored value lets future analytics/preference scripts branch on consent
   *  without re-prompting. */
  function choose(choice: "accepted" | "declined") {
    setVisible(false);
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* localStorage unavailable — keep in-memory dismissal only. */
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            role="dialog"
            aria-live="polite"
            aria-label={es ? "Consentimiento de cookies" : "Cookie consent"}
            // `data-cookie-consent="visible"` is the hook BackToTop uses to
            // detect the banner and lift itself above it (see BackToTop.tsx
            // `cookieLift` computation). Without this attribute the floating
            // button would sit at the same vertical band as the banner and
            // visually crowd it on narrow viewports.
            data-cookie-consent="visible"
            // Inline style overrides `.liquid-glass { position: relative }`
            // (see component header). Width clamped to leave a 7 rem right
            // gutter for the BackToTop button on small viewports — the
            // banner sits bottom-left, the BackToTop sits bottom-right, and
            // they never share a column.
            style={{
              position: "fixed",
              width: "min(22rem, calc(100vw - 7rem))",
            }}
            // p-5 = 20 px padding per spec (≥20 px). safe-bottom clears the
            // iOS home indicator. z-50 sits above BackToTop's z-40 in case
            // their stacking contexts ever interact.
            className="bottom-4 left-4 z-50 liquid-glass rounded-card p-5 shadow-2xl safe-bottom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start gap-3">
              <CookieIcon />
              <p className="text-[13px] leading-relaxed text-secondary flex-1">
                {es
                  ? "Usamos cookies técnicas para recordar tus preferencias. Sin tracking ni publicidad. Puedes aceptar o rechazar libremente."
                  : "We use technical cookies to remember your preferences. No tracking, no ads. You can accept or decline freely."}
              </p>
            </div>

            {/* Action row — 2-column grid (Decline | Accept). Both buttons
                fill their grid cell (w-full) so they share the banner width
                equally regardless of label length. Each meets the WCAG
                2.5.5 44 px tap target via min-h-[44px]. The "Más info" link
                was removed because the FAQ it pointed at is already linked
                from the footer's Resources column — duplicating it here
                forced flex-wrap on narrow viewports and bloated the banner
                to 250+ px (3 stacked button rows). The 2-col grid keeps the
                banner to a single 44 px action row. */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => choose("declined")}
                className="min-h-[44px] w-full px-3 py-2 rounded-lg text-sm font-medium text-secondary border border-[rgb(var(--divider)/0.22)] hover:bg-[rgb(var(--divider)/0.06)] hover:text-primary active:scale-[0.98] transition-[background,color,transform] duration-150"
              >
                {es ? "Rechazar" : "Decline"}
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="min-h-[44px] w-full px-3 py-2 rounded-lg text-sm font-medium bg-[rgb(var(--accent-base))] text-[#06130d] hover:brightness-110 active:scale-[0.98] transition-[filter,transform] duration-150"
              >
                {es ? "Aceptar" : "Accept"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
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
