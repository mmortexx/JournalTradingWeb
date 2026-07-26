"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Play } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * FinalCTANew — CTA de cierre, sin vídeo HLS (se omitió por la
 * complejidad y porque el sitio es dark por defecto — el vídeo
 * añadiría una dependencia externa más). El halo verde + el patrón
 * del HTML se conservan.
 */
export function FinalCTANew() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      // R27-1b — `bg-veil` added: the closing CTA's heading "Deja de
      // operar a ciegas. Empieza a medir." + body copy were floating
      // directly over the eye WebGL background. The section's only
      // backings were the two radial accent halos (12 % and 22 %
      // accent, both heavy blurred) + a bottom radial vignette fading
      // to `var(--bg)` — none of these occlude the eye's bright
      // red/green fibers in light theme, so VLM flagged the text as
      // washed out. `bg-veil` (82 % bg in light / 74 % in dark) sits
      // UNDER the decorative halos (they're absolute inset-0 divs that
      // paint on top of the section's background) — so the halos still
      // bloom visibly while the eye is occluded. The text container
      // below also carries `tj-legible-text` so the heading keeps a
      // theme-aware halo in the area where the bright inner halo
      // (22 % accent at 50 % 50 %) sits directly behind "Empieza a
      // medir.".
      className="section relative overflow-hidden bg-veil border-t border-[rgb(var(--divider)/0.06)]"
    >
      {/* Halo "núcleo + corona" retirado (rediseño institucional). Eran
          DOS discos de acento difuminados y superpuestos detrás del
          titular de cierre. Buscaban un efecto premium, pero el
          resultado era una mancha dorada difusa justo donde debe mandar
          el mensaje de compra. El titular y el CTA se sostienen solos. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 120%, transparent, var(--bg) 78%)",
        }}
      />
      <div className="tj-legible-text relative max-w-[820px] mx-auto px-5 md:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-serif m-0"
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: "var(--ink)",
            textWrap: "balance",
          }}
        >
          {es ? (
            <>
              Deja de operar a ciegas.<br />
              <span style={{ color: "rgb(var(--accent-base))" }}>Empieza a medir.</span>
            </>
          ) : (
            <>
              Stop trading blind.<br />
              <span style={{ color: "rgb(var(--accent-base))" }}>Start measuring.</span>
            </>
          )}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 mx-auto"
          style={{
            fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
            lineHeight: 1.62,
            color: "var(--ink-2)",
            maxWidth: "44em",
          }}
        >
          {es
            ? "40+ métricas, guardián de disciplina y tus datos en tu máquina. Pago único desde 29 $, sin suscripciones."
            : "40+ metrics, a discipline guardian, and your data on your machine. One-time payment from $29, no subscriptions."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/pricing"
            className="inline-flex h-[52px] items-center gap-2.5 rounded-[4px] px-8 text-base font-semibold outline-none transition-colors duration-150 hover:bg-[rgb(var(--accent-hover))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            style={{ background: "rgb(var(--accent-base))", color: "#1A1917" }}
          >
            {es ? "Empieza hoy — 29 $" : "Start today — $29"}
            <ArrowRight size={17} aria-hidden />
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-[52px] items-center gap-2.5 rounded-[4px] border px-8 text-base font-semibold text-[var(--ink)] outline-none transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            style={{ borderColor: "rgb(var(--divider) / 0.20)" }}
          >
            {/* R25-1e — Play icon prefix matches the Hero's "Ver la demo"
                button pattern so the two CTAs read as a coordinated pair
                across the site (primary = ArrowRight suffix, secondary =
                Play prefix). */}
            <Play size={15} fill="currentColor" aria-hidden />
            {es ? "Ver la demo" : "See the demo"}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {[
            es ? "Actualizaciones 1.x gratuitas" : "Free 1.x updates",
            es ? "Pago único · sin suscripción" : "One-time payment · no subscription",
            "100 % local",
            es ? "Soporte directo" : "Direct support",
          ].map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1.5"
              style={{ fontSize: 13, color: "var(--ink-2)" }}
            >
              <Check size={14} style={{ color: "rgb(var(--pnl-pos))" }} />
              {g}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
