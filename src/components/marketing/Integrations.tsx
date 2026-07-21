"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

interface Broker {
  name: string;
  /** Two-letter monogram for the logo placeholder chip. */
  mark: string;
}

const BROKERS: Broker[] = [
  { name: "Interactive Brokers", mark: "IB" },
  { name: "MetaTrader 4", mark: "M4" },
  { name: "MetaTrader 5", mark: "M5" },
  { name: "NinjaTrader", mark: "NT" },
  { name: "TradingView", mark: "TV" },
  { name: "Binance", mark: "BN" },
  { name: "Coinbase", mark: "CB" },
  { name: "OANDA", mark: "OA" },
  { name: "IG", mark: "IG" },
  { name: "TD Ameritrade", mark: "TD" },
];

/** Logo wall of broker / import integrations. Bilingual. */
export function Integrations() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section bg-black relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative max-w-page mx-auto px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Integraciones" : "Integrations"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Importa de <span className="text-gradient">cualquier broker.</span>
              </>
            ) : (
              <>
                Import from <span className="text-gradient">any broker.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "CSV universal. Mapea columnas una sola vez y olídate."
              : "Universal CSV. Map columns once and forget."}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BROKERS.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: (i % 5) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
              className="group relative liquid-glass depth-1 rounded-card p-4 h-full flex flex-col gap-3 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)]"
            >
              {/* Accent border glow on hover. */}
              <div
                className="absolute inset-0 rounded-card pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px rgb(var(--accent-base) / 0.45), 0 0 20px rgb(var(--accent-base) / 0.18)`,
                }}
              />

              {/* Row: monogram mark (left) + CSV chip (right). */}
              <div className="relative flex items-center justify-between">
                <span
                  className="w-9 h-9 rounded-md bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] flex items-center justify-center text-primary text-[11px] font-bold tracking-tight"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  aria-hidden="true"
                >
                  {b.mark}
                </span>
                <span className="pill bg-white/5 text-tertiary border border-white/10 text-[10px] uppercase tracking-[0.14em]">
                  CSV
                </span>
              </div>

              {/* Broker name. */}
              <div className="relative">
                <p className="t-h4 text-secondary">{b.name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Universal-CSV reminder line. */}
        <Reveal delay={0.15} className="mt-8">
          <p className="text-sm text-tertiary leading-relaxed">
            {es ? (
              <>
                ¿Tu broker no está en la lista?{" "}
                <span className="text-secondary font-medium">
                  Si exporta a CSV, este diario lo importa.
                </span>{" "}
                Mapea las columnas una sola vez y el perfil queda guardado para siempre.
              </>
            ) : (
              <>
                Your broker not on the list?{" "}
                <span className="text-secondary font-medium">
                  If it exports to CSV, this journal imports it.
                </span>{" "}
                Map the columns once and the profile is saved forever.
              </>
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
