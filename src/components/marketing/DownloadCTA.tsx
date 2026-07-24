"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { asset } from "@/lib/asset";

/**
 * DownloadCTA — Windows-app download call-to-action. Sits between the
 * Newsletter and the FinalCTA on the Pricing page, giving a concrete
 * "next action" before the soft close.
 *
 * Premium motion layer:
 *  - aurora-bg + two drifting accent glow orbs behind the card.
 *  - Card scales in on view (0.96 → 1).
 *  - Download button: lift + accent shadow ring on hover, press-down on tap.
 *  - Windows logo 4-pane SVG with a subtle hover shimmer.
 *  - prefers-reduced-motion disables orb drift + button shimmer.
 *
 * The download href is "#" — purely visual, the Windows build is not yet
 * shipped. System-requirements line uses `tnum` for the version numbers
 * and the size figure.
 *
 * No indigo/blue: accent-only palette.
 */

export function DownloadCTA() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  return (
    <section
      aria-label={es ? "Descarga" : "Download"}
      className="section relative overflow-hidden"
    >
      {/* Aurora backdrop */}
      <div aria-hidden="true" className="absolute inset-0 aurora-bg pointer-events-none" />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      {/* Static accent glow orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 w-[440px] h-[440px] rounded-full blur-[130px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-140px] -right-28 w-[480px] h-[480px] rounded-full blur-[130px] pointer-events-none opacity-14"
        style={{ background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)" }}
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 22 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
          className="relative liquid-glass depth-3 rounded-card p-6 sm:p-8 md:p-12 max-w-3xl mx-auto overflow-hidden transition-shadow duration-300"
        >
          {/* Top accent sweep — same motif as GuaranteeBanner. */}
          <motion.div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base)) 50%, transparent 100%)",
              transformOrigin: "left center",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.9 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
            {/* Left: copy block */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <Eyebrow>{es ? "Descarga" : "Download"}</Eyebrow>
              </div>
              <h2
                className="mt-5 t-h2 text-primary"
              >
                {es ? (
                  <>
                    Empieza en <span className="text-gradient">2 minutos.</span>
                  </>
                ) : (
                  <>
                    Start in <span className="text-gradient">2 minutes.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-secondary leading-relaxed max-w-md mx-auto md:mx-0">
                {es ? (
                  <>
                    Descarga la app para Windows. Sin registro, sin nube. Pago
                    único desde <span className="tnum text-primary font-medium">$29</span>.
                  </>
                ) : (
                  <>
                    Download the app for Windows. No registration, no cloud.
                    One-time payment from <span className="tnum text-primary font-medium">$29</span>.
                  </>
                )}
              </p>

              {/* System requirements — refined spec-sheet row rendered as
                  discrete pill badges (R23-2e). Each spec gets a hairline
                  border + subtle divider backdrop so the row reads as a
                  cluster of trust badges instead of floating text+icon
                  pairs. `text-secondary` (was `text-tertiary`) lifts the
                  labels out of the dim range so Windows version / arch /
                  size are unambiguous at a glance. tnum keeps the version
                  digits + size figure on the tabular baseline. */}
              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--divider)/0.10)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-xs text-secondary">
                  <CheckSmall />
                  <span className="tnum">Windows 10/11</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--divider)/0.10)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-xs text-secondary">
                  <CheckSmall />
                  <span className="tnum">64-bit</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--divider)/0.10)] bg-[rgb(var(--divider)/0.04)] px-2.5 py-1 text-xs text-secondary">
                  <CheckSmall />
                  <span className="tnum">50 MB</span>
                </span>
              </div>
            </div>

            {/* Right: download button + meta */}
            <div className="shrink-0 flex flex-col items-center md:items-end gap-3">
              {/* Download CTA — `href="#"` is intentional (R20-2b): the Windows
                  installer is not yet shipped. Replace with the real .exe URL
                  when the build is released. See header comment for context.
                  Button uses the theme's primary text/bg tokens (white-on-dark
                  in dark theme, near-black on paper in light theme) with an
                  accent-tinted hover shadow + lift for a premium pressable
                  affordance (R20-3c). */}
              <motion.a
                href={asset("#")}
                whileHover={
                  reduce
                    ? undefined
                    : { y: -2, transition: { type: "spring", stiffness: 300, damping: 20 } }
                }
                whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 sm:px-8 py-3 rounded-lg bg-[rgb(var(--txt-primary))] text-[rgb(var(--bg))] font-medium transition-all duration-200 hover:bg-[rgb(var(--txt-primary)/0.88)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-4px_rgb(var(--accent-base)/0.50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <WindowsIcon className="shrink-0" />
                <span className="break-words">{es ? "Descargar para Windows" : "Download for Windows"}</span>
              </motion.a>
              <span className="text-xs text-tertiary tnum text-center md:text-right break-words">
                {es ? "Instalador offline · sin conexión tras instalar" : "Offline installer · no connection after install"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** 4-pane Windows logo SVG — uses currentColor so it inherits the button text color. */
function WindowsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="0.5" fill="currentColor" />
      <rect x="13" y="3" width="8" height="8" rx="0.5" fill="currentColor" />
      <rect x="3" y="13" width="8" height="8" rx="0.5" fill="currentColor" />
      <rect x="13" y="13" width="8" height="8" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function CheckSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 8 2.5 2.5L12 5"
        stroke="rgb(var(--pnl-pos))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
