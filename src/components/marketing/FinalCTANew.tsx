"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
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
      className="relative overflow-hidden border-t"
      style={{ padding: "120px 24px 100px", borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, color-mix(in oklab, rgb(var(--accent-base)) 12%, transparent), transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.45,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 120%, transparent, var(--bg) 78%)",
        }}
      />
      <div className="relative max-w-[820px] mx-auto text-center">
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
            ? "40+ métricas, guardián de disciplina y tus datos en tu máquina. Pago único desde 29 $, garantía de devolución 30 días."
            : "40+ metrics, a discipline guardian, and your data on your machine. One-time payment from $29, 30-day money-back guarantee."}
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
            className="inline-flex items-center gap-2.5 rounded-full"
            style={{
              height: 56,
              padding: "0 30px",
              background: "rgb(var(--accent-base))",
              color: "#06130d",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: "0 14px 38px -14px color-mix(in oklab, rgb(var(--accent-base)) 75%, #000)",
              transition: "transform 0.2s, filter 0.2s",
            }}
          >
            {es ? "Empieza hoy — 29 $" : "Start today — $29"}
            <ArrowRight size={17} aria-hidden />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2.5 rounded-full"
            style={{
              height: 56,
              padding: "0 28px",
              background: "transparent",
              border: "1px solid rgb(var(--divider) / 0.13)",
              color: "var(--ink)",
              fontSize: 16,
              fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
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
            es ? "Garantía 30 días" : "30-day guarantee",
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
