"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

/**
 * Sticky navbar — institutional fintech floating bar.
 *
 * Visual states:
 *  - Top of page (`scrolled === false`): transparent — text floats
 *    directly on the (always-dark) hero video / PageHeader band. No
 *    chrome, no border. Lets the hero breathe.
 *  - Scrolled past 16px: `.liquid-glass` material (rgba(0,0,0,0.4) +
 *    4px blur + machined inset edges) on a `rounded-xl` floating bar,
 *    paired with a soft depth-2 shadow (`0 1px 2px` + `0 4px 16px`)
 *    and a `backdrop-saturate-150` boost so the blur reads as
 *    "engaged" rather than passive — the same material language as
 *    Apple's Pro Display chrome.
 *
 * Brand lockup — a precision candlestick trio (three ascending bodies
 * + wicks) drawn as inline SVG in `--accent-base` (gold default),
 * sitting on a dark glass square with a 1px white ring + inset top
 * highlight + a subtle accent radial-gradient backdrop. Crisp at
 * 14px / 16px / 28px. The wordmark uses `text-[15px] font-semibold
 * tracking-tight` — tighter and smaller than the prior `text-2xl`
 * lockup so it reads as a "Stripe / Linear / Vercel" product mark
 * rather than a hero headline.
 *
 * Desktop nav links — minimal color-only base state (`text-gray-300`
 * vs `text-white` for the active page), elevated by a 2px accent
 * underline that grows from center on hover (origin-center
 * scaleX(0)→(1)). The active link holds the underline open and gets
 * `aria-current="page"` for screen readers. The center-grow reads as
 * more institutional than the standard left-sweep (`.link-underline`).
 *
 * CTA cluster — theme + language toggles share a 32px icon-button hit
 * area with `bg-white/5` hover; a 1px hairline divider (`bg-white/10`)
 * separates them from the primary "Buy Pro" CTA, which carries a
 * 1px drop shadow + `-translate-y-0.5` lift on hover. Mobile menu
 * trigger mirrors the toggle pattern. The visible ⌘K pill was
 * intentionally removed — the global listener in CommandPalette
 * still handles the key without UI clutter.
 *
 * Mobile drawer — full-height slide-in from the right with
 * `liquid-glass` + `backdrop-blur-xl` for an opaque material over
 * the page. Touch-friendly links (min-h-[44px]). Active state shows
 * an accent dot indicator at the trailing edge. CTA sits in a
 * dedicated footer band with `safe-bottom` padding so it stays
 * clear of iOS home-indicator. Focus trap + Escape + body-scroll
 * lock mirror native dialog behavior; focus returns to the trigger
 * on close.
 */
export function Navbar() {
  const { t, lang, toggle } = useLang();
  const es = lang === "es";
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Refs for focus management:
  //  - `menuButtonRef` — the hamburger button. Focus returns here when the
  //    drawer closes (mirrors native dialog behavior, gives keyboard users a
  //    predictable landing point).
  //  - `drawerRef` — the mobile `<aside>` itself. Used to query its focusable
  //    descendants for the Tab cycle, and as a fallback focus target if the
  //    drawer ever renders without focusable children (it never does today,
  //    but `tabIndex={-1}` keeps it programmatically focusable just in case).
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus trap for the mobile drawer. While the drawer is open:
  //  - On mount, focus the first focusable element inside it (the close
  //    button — which sits at the top of the drawer, mirroring the
  //    hamburger's position visually so the focus ring lands naturally).
  //  - Tab cycles within the drawer: Shift+Tab on the first focusable wraps
  //    to the last; Tab on the last wraps to the first.
  //  - Escape closes the drawer (same behavior as a native dialog).
  //  - On cleanup (any close path: Escape, backdrop click, link tap, route
  //    change, or the explicit close button), focus returns to the menu
  //    trigger so keyboard users can resume navigating from where they left
  //    off.
  //
  // The `setMobileOpen(false)` call lives inside the keydown handler, not
  // the effect body, so it doesn't trip the set-state-in-effect rule. The
  // `.focus()` calls in the cleanup are pure DOM side effects (not React
  // setState) and are safe to run there.
  useEffect(() => {
    if (!mobileOpen) return;

    // Move focus to the first focusable element on open. `requestAnimationFrame`
    // lets Framer Motion mount the drawer node before we query it — querying
    // synchronously here would return an empty list because the conditional
    // render hasn't been committed to the DOM yet on the very first open.
    const raf = requestAnimationFrame(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = getFocusables(drawer);
      const target = focusables[0] ?? drawer;
      target.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = getFocusables(drawer);
      if (focusables.length === 0) {
        // No focusable children: keep Tab inside the drawer by focusing
        // the container itself.
        e.preventDefault();
        drawer.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      // If focus has somehow escaped the drawer (it shouldn't while we're
      // open, but be defensive), pull it back to the appropriate end.
      const inside = drawer.contains(active);
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
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      // Restore focus to the menu trigger button on close.
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  // Lock body scroll while the mobile drawer is open so the page behind
  // doesn't scroll under the backdrop. Restored on close.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Close the drawer whenever the route changes — covers browser back/forward
  // and Next.js client-side navigations triggered by anything other than a
  // tap on a drawer link (which already calls setMobileOpen(false)).
  // The setState-in-effect lint rule is intentionally suppressed here (same
  // pattern as ThemeProvider in lib/theme.tsx): the only thing the effect
  // does is reset transient drawer state on navigation, which is exactly
  // the canonical use case for an effect that calls setState.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const links: { href: string; labelEs: string; labelEn: string }[] = [
    { href: "/features", labelEs: "Características", labelEn: "Features" },
    { href: "/demo", labelEs: "Demo", labelEn: "Demo" },
    { href: "/pricing", labelEs: "Precios", labelEn: "Pricing" },
    { href: "/about", labelEs: "Acerca de", labelEn: "About" },
    { href: "/faq", labelEs: "FAQ", labelEn: "FAQ" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 pt-3 md:pt-4 px-4 sm:px-5 md:px-8">
      <nav
        className={`max-w-page mx-auto flex items-center justify-between gap-2 h-12 px-3 md:px-4 rounded-xl transition-all duration-300 ${
          scrolled
            ? "liquid-glass backdrop-saturate-150 shadow-[0_1px_2px_rgb(0_0_0/0.20),0_4px_16px_rgb(0_0_0/0.18)]"
            : "bg-transparent"
        }`}
      >
        {/* Brand lockup — precision candlestick mark + tight wordmark.
            The mark sits on a dark glass square with an accent radial
            backdrop so the gold pops; the wordmark is sized to match
            the Footer's `text-base` family for lockup consistency. */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group min-w-0 shrink-0 rounded-md"
          aria-label={t("appName")}
        >
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight text-white truncate">
            {t("appName")}
          </span>
        </Link>

        {/* Desktop links — color-only base state with a 2px accent
            underline that grows from center on hover and stays grown
            on the active page. The `after:` pseudo-element is a single
            2px pill at `bottom-1`, scaled 0→1 with origin-center so
            the underline "irises" open from the middle. Linear/Vercel
            pattern. `aria-current="page"` keeps screen readers informed
            of the active route. */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative h-9 inline-flex items-center justify-center px-3.5 text-sm rounded-md transition-colors duration-200
                  after:absolute after:content-[''] after:left-0 after:right-0 after:bottom-1 after:h-[2px] after:rounded-full
                  after:bg-[rgb(var(--accent-base))]
                  after:origin-center after:scale-x-0
                  after:transition-transform after:duration-200 after:ease-[cubic-bezier(0.22,1,0.36,1)]
                  hover:after:scale-x-100
                  focus-visible:after:scale-x-100
                  ${active ? "text-white after:scale-x-100" : "text-gray-300 hover:text-white"}`}
              >
                {es ? l.labelEs : l.labelEn}
              </Link>
            );
          })}
        </div>

        {/* Control cluster — theme + language toggles (32px icon
            buttons), a 1px hairline divider, the primary "Buy Pro"
            CTA (h-9 with shadow + lift), and the mobile menu trigger.
            `shrink-0` keeps the cluster from collapsing when the
            wordmark truncates. */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            data-theme-toggle
            className="icon-btn w-8 h-8 rounded-md grid place-items-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
            aria-label={es ? "Cambiar tema" : "Toggle theme"}
            title={es ? "Cambiar tema" : "Toggle theme"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-md grid place-items-center text-[11px] font-semibold tracking-wide text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
            aria-label={es ? "Cambiar idioma" : "Toggle language"}
            title={es ? "Cambiar idioma" : "Toggle language"}
          >
            {lang.toUpperCase()}
          </button>

          {/* Hairline divider — visually groups the toggles apart
              from the primary CTA. Hidden below the `sm` breakpoint
              where the CTA itself hides. */}
          <span aria-hidden className="hidden sm:block w-px h-5 bg-white/10 mx-1.5" />

          {/* Primary CTA — Buy Pro. `h-9 px-4` gives a consistent
              36px hit height that matches the nav-link height; the
              drop shadow + `-translate-y-0.5` lift reads as a
              premium button affordance (Stripe / Vercel pattern)
              without breaking the dark-first palette. */}
          <motion.div
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="hidden sm:inline-flex items-center"
          >
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white text-black text-sm font-medium shadow-[0_1px_2px_rgb(0_0_0/0.20)] hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgb(0_0_0/0.25)] transition-all duration-200"
            >
              {t("buyNow")}
              <svg className="transition-transform duration-200 group-hover:translate-x-0.5" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>

          {/* Mobile menu toggle — `aria-haspopup="dialog"` because the
              drawer is role="dialog"; `aria-controls` links to its id so
              screen readers can announce the relationship. */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileOpen((o) => !o)}
            className="icon-btn md:hidden w-8 h-8 rounded-md grid place-items-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
            aria-label={mobileOpen ? (es ? "Cerrar menú" : "Close menu") : (es ? "Abrir menú" : "Open menu")}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-controls="mobile-nav-drawer"
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu — full-height slide-in drawer from the right with a
          click-to-close backdrop. AnimatePresence gives us the exit
          animation (slide-out + fade) that a bare conditional render can't.
          role="dialog" + aria-modal makes it announced as a modal to screen
          readers; the Escape listener above mirrors native dialog behavior.
          Closes on route change (see the pathname effect above). */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop — click anywhere to close. z-[55] sits above the
                CookieConsent banner (z-50) so the modal correctly masks the
                whole viewport when the drawer is open, even if the cookie
                banner is currently visible. */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Drawer — slides in from the right edge, full viewport height.
                w-[300px] keeps the drawer proportionate to phone widths.
                liquid-glass + a heavier backdrop-blur-xl for a more opaque
                material over the page — matches the navbar's scrolled state
                (liquid-glass is the unified surface treatment for floating
                UI per the design system). z-[60] puts the modal above the
                CookieConsent banner (z-50) and the navbar header (z-50) so
                the drawer's close button stays clickable while open; still
                well below the command palette (z-100) and shortcuts help
                (z-100). */}
            <motion.aside
              key="mobile-drawer"
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={es ? "Menú de navegación" : "Navigation menu"}
              tabIndex={-1}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-[60] w-[300px] max-w-[84vw] liquid-glass backdrop-blur-xl border-l border-white/10 flex flex-col safe-top outline-none"
            >
              {/* Drawer header — refined brand lockup (matches the
                  topbar lockup exactly so the drawer feels like a
                  continuation, not a separate surface). */}
              <div className="flex items-center justify-between h-16 px-5 border-b border-white/5 shrink-0">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-md"
                  aria-label={t("appName")}
                >
                  <BrandMark />
                  <span className="text-[15px] font-semibold tracking-tight text-white">
                    {t("appName")}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="icon-btn w-8 h-8 rounded-md grid place-items-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label={es ? "Cerrar menú" : "Close menu"}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Nav links — scrollable if the viewport is short. Each link
                  closes the drawer on click (via onClick) so a tap
                  immediately dismisses the modal and routes. `min-h-[44px]`
                  guarantees the iOS/Material touch-target floor. Active
                  state is a faint `bg-white/[0.06]` + `font-medium` + an
                  accent dot at the trailing edge (the same accent used by
                  the desktop underline so the active language is consistent
                  across breakpoints). */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1" aria-label={es ? "Secciones" : "Sections"}>
                {links.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`relative min-h-[44px] flex items-center pl-4 pr-3 py-2.5 text-sm rounded-lg transition-colors ${
                        active
                          ? "text-white bg-white/[0.06] font-medium"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="flex-1">{es ? l.labelEs : l.labelEn}</span>
                      {active && (
                        <span
                          aria-hidden
                          className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-base))]"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* CTA footer band — keeps the primary action visible at
                  the bottom of the drawer (thumb-zone on mobile) and
                  clears the iOS home indicator via `safe-bottom`. h-11
                  matches the 44px touch-target floor. */}
              <div className="p-4 border-t border-white/5 safe-bottom shrink-0">
                <motion.div
                  whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                >
                  <Link
                    href="/pricing"
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-center justify-center gap-1.5 h-11 w-full rounded-lg bg-white text-black text-sm font-medium shadow-[0_1px_2px_rgb(0_0_0/0.20)] hover:bg-gray-100 active:scale-[0.99] transition-all duration-200"
                  >
                    {t("buyNow")}
                    <svg className="transition-transform duration-200 group-hover:translate-x-0.5" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/**
 * BrandMark — three ascending candlesticks drawn as inline SVG in
 * `--accent-base` (gold default), sitting on a precision-machined
 * glass square. Designed to read as a "trader's brand mark" rather
 * than a generic line chart: the three bodies ascend (bullish
 * trend) while sharing a uniform 5-unit height so the silhouette
 * stays geometric. Crisp at 14px (drawer close-button area) and
 * 28px (navbar lockup).
 *
 * The container pairs:
 *  - `bg-black/40` dark glass base so the gold pops,
 *  - `ring-1 ring-white/10` hairline border (matches the rest of
 *    the design system's `border-white/10` hairline language),
 *  - `shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]` 1px white top
 *    highlight (the same machined edge `.liquid-glass` uses),
 *  - a radial accent-gradient backdrop (`--accent-base` at 35% →
 *    transparent) so the mark glows faintly from the top edge.
 *
 * `overflow-hidden` clips the radial gradient to the rounded
 * square. The SVG itself uses `currentColor` so a parent
 * `text-[rgb(var(--accent-base))]` (or any future palette swap)
 * drives both the bodies and the wicks in one place.
 */
function BrandMark() {
  return (
    <span className="relative shrink-0 w-7 h-7 rounded-md grid place-items-center bg-black/40 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgb(var(--accent-base) / 0.35) 0%, rgb(var(--accent-base) / 0) 60%)",
        }}
      />
      <svg
        className="relative w-4 h-4 text-[rgb(var(--accent-base))]"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {/* Wicks — full-height verticals at 0.5 opacity so the bodies
            read as the focal element. */}
        <path
          d="M3 1.5v13M8 1.5v13M13 1.5v13"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Bodies — three ascending candlesticks, all bullish
            (uniform 5-unit height, ascending tops: y=6 → y=4 → y=3). */}
        <rect x="2" y="6" width="2" height="5" rx="0.4" fill="currentColor" />
        <rect x="7" y="4" width="2" height="5" rx="0.4" fill="currentColor" />
        <rect x="12" y="3" width="2" height="5" rx="0.4" fill="currentColor" />
      </svg>
    </span>
  );
}

// CSS selector for all natively focusable elements. We exclude anything
// explicitly removed from the tab order via `tabindex="-1"` (which includes
// the drawer container itself — it has `tabIndex={-1}` so it can be a
// programmatic fallback focus target only).
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=\"hidden\"])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  "details > summary:first-of-type",
].join(",");

/**
 * Returns the focusable descendants of `container` in DOM order, filtered to
 * elements that are actually visible (have a non-zero bounding rectangle).
 * Visibility check guards against querying inside an animating drawer whose
 * children might be momentarily zero-sized during the slide-in tween.
 */
function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    // `getClientRects()` is the most reliable zero-size check — works for
    // `display:none`, `visibility:hidden` (which still has rects but zero
    // size in the right cases), and elements collapsed by their parent.
    const rects = el.getClientRects();
    if (rects.length === 0) return false;
    const { width, height } = rects[0];
    return width > 0 && height > 0;
  });
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 9.2A5 5 0 0 1 6.8 3 5 5 0 1 0 13 9.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
