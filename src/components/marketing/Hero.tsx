"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Hero — sección `#top` del HTML de referencia.
 * - Eyebrow con punto verde pulsante
 * - H1 mayúsculas con la palabra "institucional" en verde
 * - Párrafos lead + CTA doble (Comprar / Ver demo)
 * - Chips de confianza (100 % local, pago único, ES+EN, garantía 30 días)
 * - Indicador "Scroll" abajo
 * - Float-card decorativa superior derecha
 *
 * Reemplaza al antiguo `HeroVideo.tsx`. Sin vídeo de fondo — el hero
 * respira sobre el fondo fijo del body con un halo radial verde sutil.
 */
export function Hero() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-end overflow-hidden border-b"
      style={{ borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      {/* Halo verde superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2"
        style={{
          width: "min(1100px, 92%)",
          height: 360,
          background:
            "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, rgb(var(--accent-base)) 24%, transparent), transparent 70%)",
          filter: "blur(64px)",
          opacity: 0.5,
          zIndex: 1,
        }}
      />
      {/* Viñeta lateral + inferior */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--bg) 90%, #000), transparent 58%)",
          zIndex: 1,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, var(--bg), transparent 46%)",
          zIndex: 1,
        }}
      />
      {/* Líneas guía verticales 25/50/75 % */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, #000 16%, #000 82%, transparent)",
          maskImage:
            "linear-gradient(180deg, transparent, #000 16%, #000 82%, transparent)",
          zIndex: 1,
        }}
      >
        <span className="absolute top-0 bottom-0 left-1/4 w-px" style={{ background: "rgb(var(--divider) / 0.06)" }} />
        <span className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "rgb(var(--divider) / 0.06)" }} />
        <span className="absolute top-0 bottom-0 left-3/4 w-px" style={{ background: "rgb(var(--divider) / 0.06)" }} />
      </div>

      {/* Float-card decorativa */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute right-[6%] top-[120px] z-10 hidden lg:flex flex-col justify-between"
        style={{
          width: 220,
          height: 220,
          padding: 18,
          borderRadius: 18,
          border: "1px solid rgb(var(--divider) / 0.13)",
          background: "color-mix(in oklab, var(--surface) 22%, transparent)",
          backdropFilter: "blur(7px) saturate(1.3)",
          WebkitBackdropFilter: "blur(7px) saturate(1.3)",
          boxShadow:
            "inset 0 1px 1px rgb(255 255 255 / 0.14), 0 24px 60px -30px rgb(0 0 0 / 0.7)",
        }}
      >
        <span
          className="tnum"
          style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-2)" }}
        >
          [ 2026 ]
        </span>
        <div>
          <div
            className="font-serif"
            style={{ fontSize: 20, lineHeight: 1.22, color: "var(--ink)" }}
          >
            {es ? "Hecho para el " : "Built for the "}
            <span style={{ fontStyle: "italic" }}>{es ? "trader" : "trader"}</span>
            {es ? " serio." : " serious."}
          </div>
          <div
            className="tnum mt-2"
            style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "var(--ink-3)" }}
          >
            {es ? "Nativo de Windows · v1.4.2" : "Windows native · v1.4.2"}
          </div>
        </div>
      </motion.div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-10 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 mb-5"
        >
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "rgb(var(--accent-base))",
              boxShadow: "0 0 12px rgb(var(--accent-base))",
            }}
          />
          <span
            className="uppercase tnum"
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              color: "rgb(var(--accent-base))",
            }}
          >
            {es
              ? "Diario de trading · Windows nativo"
              : "Trading journal · Windows native"}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="m-0 mb-2 font-sans uppercase"
          style={{
            fontSize: "clamp(2.8rem, 7.6vw, 5.8rem)",
            fontWeight: 600,
            lineHeight: 1.01,
            letterSpacing: "-0.035em",
            color: "var(--ink)",
          }}
        >
          {es ? (
            <>
              Opera como una
              <br />
              mesa <span style={{ color: "rgb(var(--accent-base))" }}>institucional</span>
              <span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          ) : (
            <>
              Trade like an
              <br />
              institutional <span style={{ color: "rgb(var(--accent-base))" }}>desk</span>
              <span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="m-0 mb-3"
          style={{
            fontSize: "clamp(1.1rem, 2.2vw, 1.7rem)",
            fontWeight: 300,
            lineHeight: 1.25,
            color: "color-mix(in oklab, var(--ink) 82%, transparent)",
            maxWidth: "22em",
          }}
        >
          {es
            ? "Mídela con el rigor de una mesa profesional."
            : "Measure it with institutional-grade rigour."}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="m-0 mb-8"
          style={{
            fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
            fontWeight: 300,
            lineHeight: 1.6,
            color: "var(--ink-2)",
            maxWidth: "36em",
          }}
        >
          {es
            ? "40+ métricas institucionales, un guardián que te frena antes del error y tus datos 100 % en tu máquina. Nativo de Windows, pago único desde 29 $."
            : "40+ institutional metrics, a guardian that brakes before the error, and your data 100% on your machine. Windows-native, one-time payment from $29."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2.5 rounded-full"
            style={{
              height: 54,
              padding: "0 28px",
              background: "rgb(var(--accent-base))",
              color: "#06130d",
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 14px 38px -14px color-mix(in oklab, rgb(var(--accent-base)) 75%, #000)",
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
            }}
          >
            {es ? "Comprar — desde 29 $" : "Buy — from $29"}
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2.5 rounded-full"
            style={{
              height: 54,
              padding: "0 26px",
              background: "var(--ink)",
              color: "var(--bg)",
              fontSize: 15,
              fontWeight: 600,
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(0.94)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
            }}
          >
            <Play size={15} fill="currentColor" aria-hidden />
            {es ? "Ver la demo" : "See the demo"}
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          {[
            es ? "100 % LOCAL" : "100% LOCAL",
            es ? "PAGO ÚNICO" : "ONE-TIME",
            "ES · EN",
            es ? "GARANTÍA 30 DÍAS" : "30-DAY GUARANTEE",
          ].map((label, i) => (
            <span key={label} className="flex items-center gap-x-4">
              {i > 0 && (
                <span
                  aria-hidden
                  className="hidden sm:inline-block"
                  style={{ width: 1, height: 11, background: "rgb(var(--divider) / 0.13)" }}
                />
              )}
              <span
                className="tnum"
                style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-3)" }}
              >
                {label}
              </span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Indicador Scroll */}
      <div
        aria-hidden
        className="absolute left-1/2 bottom-5 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span
          className="uppercase tnum"
          style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--ink-3)" }}
        >
          Scroll
        </span>
        <span
          style={{
            width: 1,
            height: 30,
            background: "linear-gradient(180deg, rgb(var(--accent-base)), transparent)",
          }}
        />
      </div>
    </section>
  );
}
