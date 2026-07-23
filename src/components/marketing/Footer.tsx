"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { GlossaryModal } from "@/components/tj/GlossaryModal";
import { MagneticButton } from "@/components/tj/MagneticButton";

/** Social link definition — icon + accessible label, placeholder href. */
type SocialLink = { label: string; href: string; Icon: () => ReactElement };

const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "#", Icon: GitHubIcon },
  { label: "X / Twitter", href: "#", Icon: XIcon },
  { label: "YouTube", href: "#", Icon: YouTubeIcon },
  { label: "Discord", href: "#", Icon: DiscordIcon },
  { label: "RSS", href: "#", Icon: RSSIcon },
];

/**
 * Institutional closing footer — the "closing statement" of the marketing
 * site, designed to read as the footer of a Stripe / Linear / Vercel /
 * Bloomberg fintech product rather than a generic link dump.
 *
 * Layout — 4-column responsive grid (`grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]`):
 *  - Brand column (1.6fr): the candlestick brand mark + wordmark lockup
 *    (mirrors `Navbar.BrandMark` exactly so the lockup reads as one
 *    product across the chrome), the tagline (`t("tagline")` —
 *    "Tu operativa, medida." / "Your trading, measured."), a "100 % local"
 *    inline pill (lock glyph + label, signalling the local-first promise
 *    inline), and the 5 social icons (28px hit-targets, `MagneticButton`
 *    wrappers with a 0.3 magnetic pull, `liquid-glass` surface).
 *  - 3 link columns (1fr each): Producto / Recursos / Empresa, each with
 *    a refined `.eyebrow` header (uppercase, wide tracking, text-tertiary)
 *    and `text-sm text-secondary hover:text-primary` links that carry the
 *    `.link-underline` left-sweep accent underline on hover (the design
 *    system's inline-text hover affordance — the same one the FAQ support
 *    link uses, and the one `globals.css` documents as the canonical
 *    "Footer columns" treatment).
 *
 * Trust strip — a row of 4 small inline pills ("Pago único · Sin
 * suscripción", "Datos 100 % locales", "ES + EN", "Garantía 30 días")
 * with a hairline `border-white/10` + faint `bg-white/[0.02]` tint.
 * Reads as a quiet institutional credentials row — the PositioningStrip
 * on the home page carries the visual version of these; the footer's is
 * the closing reminder.
 *
 * Bottom bar — copyright on the left, status indicator + legal links +
 * version + locale on the right. The status indicator is a pulsing
 * emerald dot + "All systems operational" label (Stripe / Vercel pattern).
 * The top edge is the `.liquid-glass::before` machined rim PLUS a
 * `border-t border-white/10` hairline so the footer reads as a precision
 * closing panel rather than a soft fade.
 *
 * Material — `liquid-glass` (rgba(0,0,0,0.4) + 4px blur + machined inset
 * edges + `::before` rim gradient) — the same surface language as the
 * Navbar's scrolled state, demo chrome, and floating cards. `rounded-t-xl`
 * softens the top edge so the footer meets the page with a quiet radius.
 * `safe-bottom` clears the iOS home indicator via env(safe-area-inset-bottom).
 *
 * Accessibility — `<footer>` landmark with three `<nav aria-label="...">`
 * subsections (one per link column) so screen-reader users can navigate
 * the footer by section. Links use `.link-underline` which exposes its
 * hover affordance to `:focus-visible` as well (so keyboard focus also
 * draws the accent underline). The pulsing status dot is `aria-hidden`
 * (decorative); the "All systems operational" text is the accessible
 * label. The lock glyph in the "100 % local" pill is `aria-hidden`.
 */
export function Footer() {
  const { t, lang } = useLang();
  const es = lang === "es";
  const year = new Date().getFullYear();

  type FooterLink = {
    label: string;
    href: string;
    /** When true, render as a GlossaryModal trigger instead of an <a>. */
    glossary?: boolean;
  };

  const cols: { title: string; links: FooterLink[] }[] = [
    {
      title: es ? "Producto" : "Product",
      links: [
        { label: es ? "Características" : "Features", href: "/features" },
        { label: es ? "Demo" : "Demo", href: "/demo" },
        { label: es ? "Precios" : "Pricing", href: "/pricing" },
        { label: "Changelog", href: "/about" },
      ],
    },
    {
      title: es ? "Recursos" : "Resources",
      links: [
        { label: "FAQ", href: "/faq" },
        {
          label: es ? "Glosario" : "Glossary",
          href: "#",
          glossary: true,
        },
        { label: es ? "Blog" : "Blog", href: "/about" },
        { label: es ? "Documentación" : "Docs", href: "/faq" },
      ],
    },
    {
      title: es ? "Empresa" : "Company",
      links: [
        { label: es ? "Acerca de" : "About", href: "/about" },
        { label: es ? "Contacto" : "Contact", href: "/about" },
        { label: es ? "Privacidad" : "Privacy", href: "#" },
        { label: es ? "Términos" : "Terms", href: "#" },
      ],
    },
  ];

  // Trust-signal pills — single-row strip above the bottom bar. Compact
  // pills with a hairline border + faint tint so the strip reads as a
  // quiet institutional credentials row, not a feature gallery. The
  // PositioningStrip on the home page carries the visual version of these;
  // the footer's is the closing reminder.
  const trust: string[] = [
    es ? "Pago único · Sin suscripción" : "One-time payment · No subscription",
    es ? "Datos 100 % locales" : "100 % local data",
    "ES + EN",
    es ? "Garantía 30 días" : "30-day guarantee",
  ];

  return (
    <footer className="relative mt-auto liquid-glass rounded-t-xl border-t border-[rgb(var(--divider)/0.1)] safe-bottom">
      <div className="relative max-w-page mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-10">
          {/* Brand column — candlestick mark + wordmark lockup (mirrors
              Navbar.BrandMark exactly), tagline, "100 % local" inline
              pill, and the 5 social icons. The lockup matches the
              navbar's so the brand reads as one product across the
              chrome — same `text-[15px] font-semibold tracking-tight`
              wordmark ratio (Stripe / Linear / Vercel product-mark). */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 group rounded-md"
              aria-label={t("appName")}
            >
              <BrandMark />
              <span className="text-[15px] font-semibold tracking-tight text-primary">
                {t("appName")}
              </span>
            </Link>
            <p className="mt-4 text-sm text-secondary max-w-xs leading-relaxed">
              {t("tagline")}
            </p>

            {/* Local-first badge — small inline pill (lock glyph + label).
                Signals the "your data never leaves your machine" promise
                inline in the brand column. Same hairline language as the
                rest of the design system (`border-white/10`). */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--divider)/0.1)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-[11px] font-medium text-secondary">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M5 7V5a3 3 0 016 0v2M4 7h8v7H4V7z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{es ? "100 % local" : "100 % local"}</span>
            </div>

            {/* Social links — 5 icons, 28px hit-targets, liquid-glass
                surface with a magnetic cursor-follow (strength 0.3). SVGs
                trimmed to 14×14 (RSS 13×13, X 12×12) so the glyph sits
                comfortably inside the smaller 28px target. */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <MagneticButton
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  ariaLabel={label}
                  strength={0.3}
                  className="icon-btn w-7 h-7 grid place-items-center rounded-full liquid-glass text-secondary hover:bg-[rgb(var(--divider)/0.08)] hover:text-primary transition-colors duration-200"
                >
                  <Icon />
                </MagneticButton>
              ))}
            </div>
          </div>

          {/* Link columns — refined `.eyebrow` header (uppercase, wide
              tracking, text-tertiary) + links in `text-sm text-secondary`
              that lift to `text-primary` on hover with a `.link-underline`
              left-sweep accent underline on hover/focus-visible (the design
              system's documented "Footer columns" affordance). Each column
              wrapped in its own `<nav aria-label>` so screen-reader users
              can jump between sections. */}
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="eyebrow mb-3.5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.glossary ? (
                      <GlossaryModal
                        trigger={
                          <button
                            type="button"
                            className="link-underline text-sm text-secondary hover:text-primary transition-colors duration-200 text-left"
                          >
                            {l.label}
                          </button>
                        }
                      />
                    ) : (
                      <Link
                        href={l.href}
                        className="link-underline text-sm text-secondary hover:text-primary transition-colors duration-200"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Trust signals — compact inline pill strip. Hairline border +
            faint tint so the pills read as quiet credentials, not as
            feature cards (PositioningStrip on the home page already
            carries the visual version). `flex-wrap` lets the row reflow
            on narrow viewports; `gap-2` keeps a tight institutional
            rhythm. */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          {trust.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-[rgb(var(--divider)/0.1)] bg-[rgb(var(--divider)/0.02)] px-2.5 py-1 text-xs text-tertiary"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Structural separator — 1px neutral border-white/10 gradient at
            12% opacity. Floats rather than terminating in a hard edge. */}
        <div className="divider-grad my-8" />

        {/* Bottom bar — left: © year appName. rights; right: status
            indicator (pulsing emerald dot + label) + Privacy/Terms legal
            links + version + locale. Hairline top via the divider-grad
            above. Status dot is decorative (aria-hidden); the label text
            carries the accessible meaning. */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-tertiary">
            © <span className="tnum">{year}</span> {t("appName")}. {t("rights")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-tertiary">
            {/* Status indicator — pulsing emerald dot + label. The
                `animate-ping` ring is the radar sweep; the solid inner
                dot is the steady state. Mirrors Stripe / Vercel status
                badges. */}
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span>{es ? "Sistemas operativos" : "All systems operational"}</span>
            </span>
            <span aria-hidden className="opacity-30">·</span>
            <Link
              href="#"
              className="hover:text-primary transition-colors duration-200"
            >
              {es ? "Privacidad" : "Privacy"}
            </Link>
            <Link
              href="#"
              className="hover:text-primary transition-colors duration-200"
            >
              {es ? "Términos" : "Terms"}
            </Link>
            <span aria-hidden className="opacity-30">·</span>
            <span className="tnum">v1.4.2</span>
            <span aria-hidden className="opacity-30">·</span>
            <span>ES + EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * BrandMark — three ascending candlesticks drawn as inline SVG in
 * `--accent-base` (gold default), sitting on a precision-machined glass
 * square. Mirrors `Navbar.BrandMark` verbatim so the lockup reads as one
 * product across the navbar + footer chrome.
 *
 * The container pairs:
 *  - `bg-black/40` dark glass base so the gold pops,
 *  - `ring-1 ring-white/10` hairline border (matches the rest of the
 *    design system's `border-white/10` hairline language),
 *  - `shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]` 1px white top
 *    highlight (the same machined edge `.liquid-glass` uses),
 *  - a radial accent-gradient backdrop (`--accent-base` at 35% →
 *    transparent) so the mark glows faintly from the top edge.
 *
 * `overflow-hidden` clips the radial gradient to the rounded square. The
 * SVG itself uses `currentColor` so a parent `text-[rgb(var(--accent-base))]`
 * (or any future palette swap) drives both the bodies and the wicks in
 * one place.
 */
function BrandMark() {
  return (
    <span
      className="relative shrink-0 w-7 h-7 rounded-md grid place-items-center border overflow-hidden"
      style={{
        borderColor: "rgb(var(--divider) / 0.13)",
        background: "color-mix(in srgb, var(--surface) 66%, transparent)",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.08)",
      }}
    >
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

/* ---------------- Inline brand SVG icons (currentColor, 14px box) ---------------- */

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.71c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 015 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.26 10.26 0 0022 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 00-5.487 0 12.6 12.6 0 00-.617-1.25.077.077 0 00-.079-.036A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.371-.291a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.12.099.245.198.372.292a.077.077 0 01-.006.127c-.598.349-1.22.645-1.873.892a.076.076 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.056c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 00-.031-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

function RSSIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20A2.18 2.18 0 014 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
    </svg>
  );
}
