"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { RiskCalculator } from "@/components/tj/RiskCalculator";

/** Marketing section presenting the interactive risk calculator as a "try it now" tool. */
export function RiskTool() {
  const { lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section relative overflow-hidden">
      {/* Soft accent glow behind */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[420px] opacity-60"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgb(var(--accent-base) / 0.10), transparent 70%)",
        }}
      />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative max-w-page mx-auto px-5 md:px-8">
        {/* Header — centered */}
        <Reveal className="max-w-2xl mx-auto text-center flex flex-col items-center">
          <Eyebrow>{es ? "Herramienta interactiva" : "Interactive tool"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                Calcula tu riesgo <span className="text-gradient">antes de operar.</span>
              </>
            ) : (
              <>
                Calculate your risk <span className="text-gradient">before you trade.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "El sizing de posición es lo que separa al trader profesional del aficionado. Una mala racha con riesgo 3 % te arruina; con riesgo 1 % es solo un mes malo. Prueba la calculadora: cambia el riesgo, mira cómo cambia todo lo demás."
              : "Position sizing is what separates the professional trader from the amateur. A bad streak at 3 % risk ends your account; at 1 % it's just a bad month. Try the calculator: change the risk, watch everything else change."}
          </p>
        </Reveal>

        {/* Calculator — centered, max-w-2xl */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <RiskCalculator />
        </motion.div>

        {/* Footnote */}
        <Reveal className="mt-6 max-w-2xl mx-auto text-center" delay={0.15}>
          <p className="text-xs text-tertiary leading-relaxed">
            {es
              ? "Cálculo simplificado. La app real contempla comisiones, slippage, divisas y métodos alternativos (lotes forex, contratos de futuros, USD fijo)."
              : "Simplified calculation. The real app accounts for fees, slippage, currencies and alternative methods (forex lots, futures contracts, fixed USD)."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
