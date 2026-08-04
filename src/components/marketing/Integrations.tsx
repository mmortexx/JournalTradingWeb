"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface Broker {
  name: string;
  /** Two-letter monogram for the logo placeholder chip. */
  mark: string;
}

/**
 * Estos NO son integraciones directas: son plataformas cuyo fichero CSV se
 * ha comprobado que entra. El subtítulo de la sección ya lo dice, y es
 * importante que lo siga diciendo — un muro de logotipos se lee como
 * «conecta tu cuenta» aunque el texto de al lado diga otra cosa.
 *
 * Fuera TD Ameritrade: la marca dejó de existir al integrarse en Schwab, y
 * un logotipo de una casa que ya no opera envejece la lista entera. Entra
 * Charles Schwab, que es donde fueron a parar esas cuentas.
 */
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
  { name: "Charles Schwab", mark: "CS" },
];

/** Logo wall of broker / import integrations. Bilingual. */
export function Integrations() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section bg-veil relative overflow-hidden">
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative tj-container">
        <SectionHeader
          composicion="apilada"
          etiqueta={es ? "Integraciones" : "Integrations"}
          titulo={es ? (
              <>
                Importa de <span className="text-gradient">cualquier broker.</span>
              </>
            ) : (
              <>
                Import from <span className="text-gradient">any broker.</span>
              </>
            )}
          entradilla={es
              ? "CSV universal. Mapea columnas una sola vez y olídate."
              : "Universal CSV. Map columns once and forget."}
        />

        {/* T2h: 2-col mobile gap-3 → gap-3.5 (14px) for slight breathing
            between broker cards on 320–390px viewports without losing the
            dense logo-wall feel. */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-3">
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
              className="group relative liquid-glass depth-1 rounded-card border border-transparent p-4 h-full min-w-0 flex flex-col gap-3 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgb(var(--accent-base)/0.35)]"
            >
              {/* Row: monogram mark (left) + CSV chip (right). */}
              <div className="relative flex items-center justify-between">
                <span
                  className="w-10 h-10 rounded-md bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] shadow-[inset_0_1px_0_rgb(var(--divider)/0.08)] flex items-center justify-center text-primary text-[12px] font-bold tracking-tight"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                  aria-hidden="true"
                >
                  {b.mark}
                </span>
                <span className="inline-flex items-center rounded-[4px] px-[0.55rem] py-[0.15rem] bg-[rgb(var(--accent-base)/0.08)] text-[rgb(var(--accent-base))] border border-[rgb(var(--accent-base)/0.20)] text-[10px] font-semibold uppercase tracking-[0.14em]">
                  CSV
                </span>
              </div>

              {/* Broker name. */}
              <div className="relative">
                {/* R25-1e — broker name brightens on hover, coordinating
                    with the card's accent border glow so the name reads
                    as the card's "active" element on hover. */}
                <p className="t-h4 text-secondary transition-colors duration-300 group-hover:text-primary">{b.name}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Universal-CSV reminder line. */}
        <Reveal delay={0.15} className="mt-8">
          <p className="text-sm text-tertiary leading-[1.6]">
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
