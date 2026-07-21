"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { MagneticButton } from "@/components/tj/MagneticButton";

/**
 * PlanSwitcher — an alternative pricing layout that sits ABOVE the existing
 * two-card <Pricing /> section on /pricing.
 *
 * - A large Core/Pro toggle at the top with an animated sliding background
 *   (framer-motion `layoutId` shared between the two options so the active
 *   pill morphs smoothly between them — the same pattern used in macOS
 *   segmented controls).
 * - Below the toggle: a SINGLE card showing the selected plan's details.
 *   When the visitor toggles, the card content cross-fades and the price
 *   counts up or down to the new value (149 → 249 or 249 → 149) using a
 *   requestAnimationFrame tween — the same easing (easeOutExpo) as the
 *   existing <CountUp /> primitive, but untriggered by scroll so it can
 *   be re-run on every toggle.
 * - The Pro variant of the card carries the accent glow shadow + "Most
 *   popular" badge — visually identical to the Pro card in <Pricing /> so
 *   the two layouts feel like the same component, not two different cards.
 *
 * Bilingual. Reduced-motion users get instant content swaps (no cross-fade,
 * no count tween — the price just snaps).
 */

type PlanId = "core" | "pro";

interface PlanDef {
  id: PlanId;
  name: string;
  price: number;
  popular?: boolean;
  tagline: string;
  features: string[];
  cta: string;
}

const PRICE_TWEEN_MS = 700;
// easeOutExpo — same as CountUp, gives a confident settle without
// overshooting the destination price.
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function PlanSwitcher() {
  const { t, lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  const coreFeatures = es
    ? [
        "Journal completo + 40+ métricas",
        "Calendario y curva de equity",
        "Gestión de riesgo",
        "Psicología y disciplina",
        "Importación CSV",
        "2 cuentas de trading",
        "Playbook con stats en vivo",
        "Informes PDF básicos",
      ]
    : [
        "Full journal + 40+ metrics",
        "Calendar and equity curve",
        "Risk management",
        "Psychology and discipline",
        "CSV import",
        "2 trading accounts",
        "Playbook with live stats",
        "Basic PDF reports",
      ];

  const proFeatures = es
    ? [
        "Todo lo de Core",
        "Cuentas ilimitadas",
        "Prop Firm Mode",
        "Informes PDF avanzados",
        "Simulador Monte Carlo",
        "Risk of ruin",
        "Informe de track record",
        "Importador de rivales (5 min)",
      ]
    : [
        "Everything in Core",
        "Unlimited accounts",
        "Prop Firm Mode",
        "Advanced PDF reports",
        "Monte Carlo simulator",
        "Risk of ruin",
        "Track record report",
        "Rival importer (5 min)",
      ];

  const plans: Record<PlanId, PlanDef> = {
    core: {
      id: "core",
      name: t("core"),
      price: 149,
      tagline: es
        ? "Todo lo esencial para medir y mejorar tu operativa."
        : "Everything you need to measure and improve your trading.",
      features: coreFeatures,
      cta: es ? "Comprar Core" : "Buy Core",
    },
    pro: {
      id: "pro",
      name: t("pro"),
      price: 249,
      popular: true,
      tagline: es
        ? "Para el trader serio con ambición prop firm."
        : "For the serious trader with prop firm ambition.",
      features: proFeatures,
      cta: es ? "Comprar Pro" : "Buy Pro",
    },
  };

  const [active, setActive] = useState<PlanId>("pro");
  const plan = plans[active];
  const isPro = active === "pro";

  // Price tween — re-run whenever `active` (and thus plan.price) changes.
  // Display value is rounded so we never render "$ 149.4321".
  //
  // Two values are kept in sync:
  //   • `animatedPrice` — the per-frame tween value, driven by rAF.
  //     setState happens inside the rAF callback (asynchronous), never
  //     synchronously in the effect body — the project's
  //     `react-hooks/set-state-in-effect` rule forbids that pattern.
  //   • `priceDisplay` (computed in render) — when `reduce` is true we
  //     bypass the tween entirely and read `plan.price` directly so the
  //     number snaps instantly with no animation; no setState needed.
  const [animatedPrice, setAnimatedPrice] = useState(plan.price);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      // Reduced motion: cancel any in-flight tween and skip the rAF
      // chain. We deliberately don't call setState here — the render
      // below reads `plan.price` directly when `reduce` is true, so the
      // displayed value is always correct without a synchronous state
      // update in the effect body.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    const from = animatedPrice;
    const to = plan.price;
    if (from === to) return;
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / PRICE_TWEEN_MS);
      const eased = easeOutExpo(p);
      setAnimatedPrice(Math.round(from + (to - from) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setAnimatedPrice(to);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // `animatedPrice` is intentionally omitted from deps: we read it as
    // the tween's starting point, but we don't want the effect to
    // re-run on every animation frame (which would re-launch a new
    // tween from the latest intermediate value and produce a feedback
    // loop). Re-running on `active` / `reduce` / `plan.price` covers
    // every case where a new tween should start.
  }, [active, reduce, plan.price]);

  // The displayed price: snap to plan.price when reduced motion is on,
  // otherwise use the tweened value.
  const priceDisplay = reduce ? plan.price : animatedPrice;

  return (
    <section className="section bg-black">
      <div className="max-w-page mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "Elige tu plan" : "Pick your plan"}
          </Eyebrow>
          <h2
            className="mt-5 t-h2 text-primary"
          >
            {es ? (
              <>
                Dos planes. <span className="text-gradient">Cero suscripciones.</span>
              </>
            ) : (
              <>
                Two plans. <span className="text-gradient">Zero subscriptions.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-secondary leading-relaxed">
            {es
              ? "Cambia entre Core y Pro para ver qué incluye cada uno. Pago único, para siempre."
              : "Switch between Core and Pro to see what each includes. One-time payment, forever."}
          </p>
        </Reveal>

        {/* ─────────────── CORE / PRO TOGGLE ─────────────── */}
        <Reveal delay={0.08} y={20}>
          <div
            role="tablist"
            aria-label={es ? "Selector de plan" : "Plan selector"}
            className="mt-10 mx-auto max-w-sm liquid-glass rounded-pill p-1.5 flex items-stretch gap-1"
          >
            {(Object.keys(plans) as PlanId[]).map((id) => {
              const p = plans[id];
              const isActive = id === active;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="plan-switcher-panel"
                  onClick={() => setActive(id)}
                  className="relative flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {/* Sliding active background — shared layoutId makes
                      framer-motion morph the pill from one option to the
                      other on toggle (spring cross-fade + slide). */}
                  {isActive && (
                    <motion.span
                      layoutId="plan-switcher-active"
                      className="absolute inset-0 rounded-[10px] pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgb(var(--accent-base) / 0.18), rgb(var(--accent-base) / 0.08))",
                        boxShadow:
                          "inset 0 0 0 1px rgb(var(--accent-base) / 0.45), 0 8px 24px -10px rgb(var(--accent-base) / 0.5)",
                      }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 32 }
                      }
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center gap-2 ${
                      isActive ? "text-primary" : "text-tertiary"
                    }`}
                  >
                    {p.name}
                    {p.popular && (
                      <span className="pill bg-white/5 text-primary border border-white/20 !px-1.5 !py-0 !text-[10px] uppercase tracking-[0.1em]">
                        {es ? "Top" : "Top"}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ─────────────── SINGLE CARD PANEL ─────────────── */}
        <Reveal delay={0.16} y={28} className="mt-10 max-w-md mx-auto">
          <div id="plan-switcher-panel" role="tabpanel" aria-label={plan.name}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <PlanSwitcherCard
                  plan={plan}
                  isPro={isPro}
                  es={es}
                  priceDisplay={priceDisplay}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

interface PlanSwitcherCardProps {
  plan: PlanDef;
  isPro: boolean;
  es: boolean;
  priceDisplay: number;
}

function PlanSwitcherCard({
  plan,
  isPro,
  es,
  priceDisplay,
}: PlanSwitcherCardProps) {
  const card = (
    <motion.div
      whileHover={isPro ? { scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 24 } } : { y: -4, scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`relative liquid-glass rounded-card p-8 flex flex-col transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isPro ? "gradient-border depth-4" : "depth-2"
      }`}
      style={
        isPro
          ? {
              boxShadow: "0 20px 60px -20px rgb(var(--accent-base) / 0.55)",
              isolation: "isolate",
            }
          : undefined
      }
    >
      {/* Static "Most popular" badge — Pro only. */}
      {isPro && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20"
        >
          <span className="pill bg-white text-black border border-white/30 shadow-[0_8px_20px_-6px_rgb(var(--accent-base)/0.7)] uppercase tracking-[0.1em]">
            {es ? "Más popular" : "Most popular"}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="t-h3 text-primary">{plan.name}</h3>
        <span
          className={`pill border ${
            isPro
              ? "bg-white/5 text-primary border-white/20"
              : "bg-white/5 text-tertiary border-white/10"
          }`}
        >
          {es ? "Para siempre" : "Forever"}
        </span>
      </div>

      <p className="mt-2 text-[13px] text-secondary leading-snug min-h-[2.4em]">
        {plan.tagline}
      </p>

      {/* Price — uses the tweened priceDisplay so it animates on toggle */}
      <div className="mt-5 flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="t-display text-[clamp(2.5rem,5vw,3.75rem)] text-primary min-w-[3ch] inline-block tnum">
          ${priceDisplay}
        </span>
        <span className="text-sm text-tertiary">
          USD · {es ? "pago único" : "one-time"}
        </span>
      </div>
      <p className="mt-1 text-xs text-tertiary uppercase tracking-[0.1em]">
        {es ? "Sin recurrencia" : "No recurrence"}
      </p>

      <div className="divider-grad my-6" />

      <ul className="space-y-3 flex-1">
        {plan.features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-2.5 text-sm"
          >
            <span
              className={`shrink-0 mt-0.5 ${isPro ? "text-primary" : "text-pnl-pos"}`}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="m5 8 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-secondary leading-relaxed">{f}</span>
          </motion.li>
        ))}
      </ul>

      <motion.div whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }} className="mt-7">
        <MagneticButton
          href="#"
          strength={0.2}
          className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
            isPro
              ? "bg-white text-black hover:bg-gray-100"
              : "liquid-glass border border-white/20 text-primary hover:bg-white hover:text-black"
          }`}
        >
          {plan.cta}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h9M8 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </MagneticButton>
      </motion.div>
    </motion.div>
  );

  // Pro plan uses the same card markup; the spring hover lift already
  // differentiates it from the Basic tier via the gradient-border +
  // depth-4 treatment + accent glow shadow.
  return card;
}
