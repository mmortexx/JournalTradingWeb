"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Root error boundary — must be a client component.
 * Receives `{ error, reset }` from Next.js. `reset()` re-renders the error
 * segment; the home link offers a hard exit back to the root route.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLang();
  const es = lang === "es";

  // Surface unexpected runtime errors to the console in dev/production for observability.
  useEffect(() => {
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <section
      aria-labelledby="error-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 py-20"
    >
      {/* Soft acrylic depth orb */}
      <div
        className="absolute top-1/4 -left-32 w-[440px] h-[440px] rounded-full blur-[130px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
          opacity: 0.16,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-32 w-[420px] h-[420px] rounded-full blur-[130px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--pnl-neg) / 0.6), transparent 70%)",
          opacity: 0.12,
        }}
        aria-hidden="true"
      />

      <div className="relative z-[2] text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-pill liquid-glass text-[12px] text-gray-300 mb-7"
        >
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-pnl-neg opacity-60 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-pnl-neg" />
          </span>
          {es ? "Error en tiempo de ejecución" : "Runtime error"}
        </motion.div>

        <motion.h1
          id="error-heading"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-semibold tracking-tight text-white text-balance"
        >
          {es ? "Algo salió mal" : "Something went wrong"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base md:text-lg text-gray-300 leading-relaxed"
        >
          {es
            ? "Se produjo un error inesperado. Puedes intentar de nuevo o volver al inicio."
            : "An unexpected error occurred. You can try again or head back home."}
        </motion.p>

        {/* Discrete digest for support / debugging */}
        {error?.digest ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-3 text-[11px] uppercase tracking-[0.15em] text-gray-400 tnum"
          >
            {es ? "Referencia" : "Reference"}: {error.digest}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.div
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="inline-flex"
          >
            <button
              type="button"
              onClick={reset}
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-[background-color,box-shadow] hover:shadow-[0_12px_32px_-8px_rgb(var(--accent-base)/0.7)]"
            >
              <svg
                className="mr-2 transition-transform group-hover:-rotate-45"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8a6 6 0 1 0 1.76-4.24M2 3v3h3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {es ? "Reintentar" : "Try again"}
            </button>
          </motion.div>
          <motion.div
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="inline-flex"
          >
            <Link
              href="/"
              className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-[background-color,color,transform] hover:-translate-y-0.5"
            >
              {es ? "Volver al inicio" : "Back to home"}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
