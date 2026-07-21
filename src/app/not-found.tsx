"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { MarketBackground } from "@/components/tj/MarketBackground";
import { ParticleField } from "@/components/tj/ParticleField";

/**
 * Custom 404 — full-screen premium error page.
 *
 * Premium motion layer:
 *  - Subtle scrolling candlestick backdrop (MarketBackground @ 0.06).
 *  - Particle constellation overlay (@ 0.2).
 *  - Ambient accent orb for depth.
 *
 * Copy:
 *  - Trading-themed headline: "stopped out like a bad stop loss".
 *  - Bilingual subhead explaining the page is missing.
 *  - Quick-link tiles to the three primary destinations (Features, Demo,
 *    Pricing) plus the home CTA.
 *  - Inline search box that routes to the FAQ page with the query as the
 *    `q` search param (the FAQ's real-time search picks it up on load) so
 *    users can find what they were looking for in one keystroke.
 */
export default function NotFound() {
  const { lang } = useLang();
  const es = lang === "es";
  const router = useRouter();
  const [q, setQ] = useState("");

  const tiles = [
    {
      href: asset("/features"),
      label: es ? "Características" : "Features",
      desc: es
        ? "Métricas, disciplina y local-first."
        : "Metrics, discipline and local-first.",
    },
    {
      href: asset("/demo"),
      label: es ? "Demo" : "Demo",
      desc: es
        ? "La app, en tu navegador."
        : "The app, in your browser.",
    },
    {
      href: asset("/pricing"),
      label: es ? "Precios" : "Pricing",
      desc: es
        ? "Pago único. Sin suscripción."
        : "One-time. No subscription.",
    },
  ];

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    // No query → just land on FAQ; otherwise pre-fill the search box.
    router.push(asset(term ? `/faq?q=${encodeURIComponent(term)}` : "/faq"));
  }

  return (
    <section
      aria-labelledby="not-found-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 py-20"
    >
      {/* Subtle scrolling candlestick backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <MarketBackground density={60} speed={1.2} opacity={0.06} showEquityLine={false} />
      </div>
      {/* Constellation overlay */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <ParticleField count={36} opacity={0.2} linkDistance={130} />
      </div>
      {/* Ambient accent orb for depth */}
      <div
        className="absolute top-1/4 -left-32 w-[440px] h-[440px] rounded-full blur-[130px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
          opacity: 0.18,
        }}
        aria-hidden="true"
      />

      <div className="relative z-[2] text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-semibold tracking-[-0.04em] leading-[0.9] text-gradient tnum"
          style={{ fontSize: "clamp(6rem, 18vw, 12rem)" }}
        >
          404
        </motion.div>

        <motion.h1
          id="not-found-heading"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance"
        >
          {es
            ? "Esta página se detuvo como un mal stop loss."
            : "This page stopped out like a bad stop loss."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-4 text-base md:text-lg text-gray-300 leading-relaxed"
        >
          {es
            ? "La URL que buscas no existe, se ha movido o nunca estuvo en tu watchlist."
            : "The URL you're after doesn't exist, has moved, or was never on your watchlist."}
        </motion.p>

        {/* Inline search suggestion — pre-fills the FAQ search on submit.
            The border-white/10 border brightens to the accent on hover/focus,
            matching the keyboard-first pattern the rest of the site uses
            (the command palette opens on `/`). */}
        <motion.form
          onSubmit={onSubmitSearch}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-7 mx-auto max-w-md"
          role="search"
          aria-label={es ? "Buscar en la web" : "Search the site"}
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                es
                  ? "Busca una característica, métrica o pregunta…"
                  : "Search a feature, metric or question…"
              }
              aria-label={es ? "Buscar" : "Search"}
              className="w-full bg-white/5 border border-white/10 rounded-md h-11 pl-10 pr-24 text-sm text-white placeholder:text-gray-400 outline-none transition-colors hover:border-white/25 focus-visible:border-white/30"
            />
            <motion.div
              whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <button
                type="submit"
                className="h-8 px-3 rounded-[5px] bg-white text-black text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                {es ? "Buscar" : "Search"}
              </button>
            </motion.div>
          </div>
        </motion.form>

        {/* Quick-link tiles — Features, Demo, Pricing.
            Each tile uses the liquid-glass utility so it sits cohesively with
            the rest of the site's surfaces. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {tiles.map((tile) => (
            <motion.div
              key={tile.href}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className="h-full"
            >
              <Link
                href={tile.href}
                className="group liquid-glass rounded-card p-4 text-left transition-colors hover:border-white/25 block h-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {tile.label}
                  </span>
                  <svg
                    className="size-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h9M8 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="mt-1 text-xs text-gray-300 leading-snug">
                  {tile.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.48 }}
          className="mt-9"
        >
          <motion.div
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="inline-flex"
          >
            <Link
              href="/"
              className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-sm font-semibold hover:bg-gray-100 transition-all hover:shadow-[0_12px_32px_-8px_rgb(var(--accent-base)/0.7)]"
            >
              {es ? "Volver al inicio" : "Back to home"}
              <svg
                className="ml-2 transition-transform group-hover:translate-x-0.5"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h9M8 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
