"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { MagneticButton } from "@/components/tj/MagneticButton";
import { CountUp } from "@/components/tj/CountUp";

type Plan = {
  id: "core" | "pro";
  name: string;
  price: number;
  popular?: boolean;
  /** One-line positioning tagline shown under the plan name. */
  tagline: string;
  features: string[];
  cta: string;
};

/**
 * @param standalone Cuando la sección vive en su propia página bajo un
 * `PageHeader` que ya dice "Lo compras una vez…", oculta el encabezado
 * interno para no repetir el mismo titular dos veces en una pantalla.
 */
export function Pricing({ standalone = false }: { standalone?: boolean } = {}) {
  const { t, lang } = useLang();
  const es = lang === "es";

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

  const plans: Plan[] = [
    {
      id: "core",
      name: t("core"),
      price: 29,
      tagline: es
        ? "Todo lo esencial para medir y mejorar tu operativa."
        : "Everything you need to measure and improve your trading.",
      features: coreFeatures,
      cta: es ? "Comprar Core" : "Buy Core",
    },
    {
      id: "pro",
      name: t("pro"),
      price: 49,
      popular: true,
      tagline: es
        ? "Para el trader serio con ambición prop firm."
        : "For the serious trader with prop firm ambition.",
      features: proFeatures,
      cta: es ? "Comprar Pro" : "Buy Pro",
    },
  ];

  return (
    <section
      id="pricing"
      className="section cv-auto bg-veil relative overflow-hidden scroll-mt-24"
    >
      {/* Soft radial accent glow behind the cards. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[480px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
          opacity: 0.10,
        }}
      />
      {/* Opt-in 3% fractalNoise grain — matches HeroVideo / Bento so the
          conversion section reads as a premium printed surface. */}
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header — centered, matches Stripe / Linear / Vercel pricing
            pages. El h2 siempre se renderiza (necesario para el TOC + SEO);
            en modo standalone (/pricing) se omiten el eyebrow y el lead
            porque el PageHeader ya aporta su propio kicker + subtítulo. */}
        <Reveal className="text-center max-w-3xl mx-auto">
          {!standalone && <Eyebrow className="justify-center">{t("pricingEyebrow")}</Eyebrow>}
          <h2 className={`text-3xl md:text-4xl font-semibold tracking-tight text-primary text-balance ${standalone ? "" : "mt-5"}`}>
            {es ? (
              <>
                Lo compras una vez. Es tuyo para{" "}
                <span className="text-gradient">siempre.</span>
              </>
            ) : (
              <>
                You buy it once. It's yours{" "}
                <span className="text-gradient">forever.</span>
              </>
            )}
          </h2>
          {!standalone && (
            <p className="mt-4 text-lg text-secondary leading-relaxed">
              {t("pricingLead")}
            </p>
          )}
        </Reveal>

        {/* Visual-only pricing model toggle — reinforces the "no subscription"
            value prop. The active option is "Pago único" (one-time, since the
            app is genuinely one-time payment). The "Suscripción" pill is
            rendered disabled with a strikethrough label and a "No disponible"
            chip so the contrast is explicit rather than implied. This pattern
            is commonly used on one-time-payment product pages to pre-empt the
            "is this a subscription?" question. */}
        <Reveal delay={0.08} y={20}>
          <div
            role="radiogroup"
            aria-label={es ? "Modelo de pago" : "Payment model"}
            className="mt-10 mx-auto max-w-md liquid-glass rounded-pill p-1.5 flex items-stretch gap-1"
          >
            {/* Active: One-time */}
            <div
              role="radio"
              aria-checked="true"
              tabIndex={0}
              className="relative flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] px-3 sm:px-4 py-2.5 cursor-default outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--divider)/0.40)]"
              style={{
                background:
                  "linear-gradient(180deg, rgb(var(--accent-base) / 0.18), rgb(var(--accent-base) / 0.08))",
                boxShadow:
                  "inset 0 0 0 1px rgb(var(--accent-base) / 0.45), 0 8px 24px -10px rgb(var(--accent-base) / 0.5)",
              }}
            >
              <span
                className="size-1.5 rounded-full bg-[rgb(var(--divider))]"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-primary tnum">
                {es ? "Pago único" : "One-time"}
              </span>
              <span className="hidden sm:inline-flex pill bg-[rgb(var(--divider)/0.10)] text-primary border border-[rgb(var(--divider)/0.20)] !px-1.5 !py-0 !text-[10px] uppercase tracking-[0.1em]">
                {es ? "Activo" : "Active"}
              </span>
            </div>

            {/* Disabled: Subscription */}
            <div
              role="radio"
              aria-checked="false"
              aria-disabled="true"
              tabIndex={-1}
              className="relative flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 cursor-not-allowed select-none"
              title={
                es
                  ? "No disponible — esta app no es suscripción"
                  : "Not available — this app is not a subscription"
              }
            >
              <span className="inline-flex flex-col items-center gap-0.5">
                <span className="text-sm font-medium text-tertiary line-through decoration-1">
                  {es ? "Suscripción" : "Subscription"}
                </span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-tertiary/70 font-semibold">
                  {es ? "No disponible" : "Not available"}
                </span>
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-6 max-w-4xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={0.12 + i * 0.08} y={32} className="h-full">
              <PlanCard plan={plan} es={es} />
            </Reveal>
          ))}
        </div>

        {/* Guarantee line — centered, simple. The detailed guarantee already
            lives in GuaranteeBanner above this section, so this is just the
            closing reassurance chip. */}
        <Reveal delay={0.16}>
          <div className="mt-12 flex items-center justify-center gap-2.5 text-sm text-tertiary">
            <span
              className="text-[rgb(var(--accent-base))] inline-flex"
              aria-hidden="true"
            >
              <ShieldIcon />
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="font-medium text-secondary">
                {es ? "Garantía 30 días" : "30-day guarantee"}
              </span>
              <span className="text-tertiary/60" aria-hidden="true">
                ·
              </span>
              <span>{es ? "Devolución completa" : "Full refund"}</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PlanCard({ plan, es }: { plan: Plan; es: boolean }) {
  const isPro = plan.popular;

  return (
    <motion.div
      whileHover={
        isPro
          ? { scale: 1.005, transition: { type: "spring", stiffness: 300, damping: 24 } }
          : { y: -4, scale: 1.005, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`relative liquid-glass rounded-card p-6 sm:p-8 h-full flex flex-col border transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isPro
          ? "gradient-border depth-4 border-[rgb(var(--accent-base)/0.22)]"
          : "depth-2 border-[rgb(var(--divider)/0.10)] hover:border-[rgb(var(--divider)/0.18)] hover:depth-3"
      }`}
      style={
        isPro
          ? {
              boxShadow:
                "0 24px 70px -22px rgb(var(--accent-base) / 0.50), inset 0 1px 0 rgb(var(--accent-base) / 0.10)",
              // Establish a stacking context so the "PREMIUM" watermark
              // (z-index: -1) stays trapped inside this card — paints
              // above the liquid-glass fill but below the in-flow text content.
              isolation: "isolate",
            }
          : undefined
      }
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          {/* "Más popular" badge — accent-tinted gradient pill with a soft
              outer glow. Replaces the prior hardcoded white-on-black chip
              with a premium green-on-green treatment that ties to the
              accent ring + glow already framing the Pro card, so the whole
              Pro surface reads as a single premium object (R20-3c). */}
          <span
            className="pill border uppercase tracking-[0.1em] backdrop-blur-md"
            style={{
              background:
                "linear-gradient(180deg, rgb(var(--accent-base) / 0.95), rgb(var(--accent-hover) / 0.85))",
              color: "rgb(var(--accent-pressed))",
              borderColor: "rgb(var(--accent-base) / 0.55)",
              boxShadow:
                "0 8px 22px -6px rgb(var(--accent-base) / 0.65), inset 0 1px 0 rgb(var(--divider) / 0.35)",
            }}
          >
            {es ? "Más popular" : "Most popular"}
          </span>
        </div>
      )}

      {/* "PREMIUM" watermark — only on the Pro card. A single rotated,
          oversized, very-faint accent-colored word that bleeds across
          the card as a luxury watermark (think premium stationery /
          security paper). The wrapper clips the bleed to the card's
          rounded bounds; the inner span sits at z-index:-1 so it
          paints above the liquid-glass fill but below every text element,
          divider and CTA. Opacity 0.04 keeps it at the edge of
          perception — present without competing with the price. */}
      {isPro && (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden pointer-events-none rounded-card"
        >
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-bold tracking-tighter whitespace-nowrap text-primary -rotate-12"
            style={{
              fontSize: "8rem",
              opacity: 0.04,
              zIndex: -1,
            }}
          >
            PREMIUM
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl md:text-2xl font-semibold text-primary tracking-tight min-w-0 break-words">
          {plan.name}
        </h3>
        {/* "Para siempre" / "Forever" credential pill — Pro gets an
            accent-tinted bg + accent border so its forever tag reads as
            a premium credential distinct from Core's neutral pill
            (R24-1d). text-primary kept for full WCAG-AA contrast on the
            tinted backdrop in both themes. */}
        <span
          className={`pill border shrink-0 ${
            isPro
              ? "bg-[rgb(var(--accent-base)/0.12)] text-primary border-[rgb(var(--accent-base)/0.32)]"
              : "bg-[rgb(var(--divider)/0.05)] text-tertiary border-[rgb(var(--divider)/0.10)]"
          }`}
        >
          {es ? "Para siempre" : "Forever"}
        </span>
      </div>

      {/* Plan tagline — one line of positioning copy right under the name.
          Soft secondary color + tight leading keep it readable without
          competing with the price below. */}
      <p className="mt-2 text-sm text-secondary leading-snug min-h-[2.6em]">
        {plan.tagline}
      </p>

      {/* Price — big visual anchor. `$` is set smaller and baseline-aligned
          so it reads as a currency prefix; the bold tabular-num number is
          the visual anchor; the `/ pago único` suffix sits inline to the
          right at the baseline in a small tertiary label. Both cards share
          the exact same baseline grid so Core $29 and Pro $49 sit on
          identical vertical lines — pixel-perfect parity. The `$` uses
          text-secondary (not the dimmest text-tertiary token) so the
          currency mark reads as part of the price in both themes rather
          than a stray dim glyph (R24-1d). */}
      <div className="mt-6 flex items-baseline gap-1 min-w-0">
        <span className="text-2xl md:text-3xl font-semibold text-secondary tnum">
          $
        </span>
        <CountUp
          to={plan.price}
          duration={1.6}
          className="text-5xl md:text-6xl font-bold text-primary tnum leading-[0.95]"
        />
        <span className="ml-2 text-sm text-tertiary whitespace-nowrap">
          / {es ? "pago único" : "one-time"}
        </span>
      </div>

      <div className="divider-grad my-6" />

      {/* Premium accent rail — only on the Pro card. A 2 px tall gradient
          bar pinned to the top inside edge of the card, sitting just above
          the liquid-glass fill. Reads as a "selected / recommended" rail
          (think Stripe's highlighted pricing tier) and reinforces the
          gradient-border + glow without adding visual noise. */}
      {isPro && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-6 right-6 h-[2px] rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base) / 0.85) 30%, rgb(var(--accent-hover) / 0.95) 50%, rgb(var(--accent-base) / 0.85) 70%, transparent 100%)",
          }}
        />
      )}

      <ul className="space-y-3.5 flex-1">
        {plan.features.map((f, i) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            {/* Pro feature checks get an accent-tinted circular badge —
                a 20×20 rounded-full fill + inset accent ring around the
                16×16 CheckIcon — so the Pro feature list reads as a
                "ribbon of premium yes" distinct from Core's plain
                outline checks (R24-1d). Core keeps the bare CheckIcon in
                pnl-pos green for the standard positive treatment. */}
            <span
              className={`shrink-0 mt-0.5 ${
                isPro
                  ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-[rgb(var(--accent-base)/0.14)] ring-1 ring-inset ring-[rgb(var(--accent-base)/0.26)] text-[rgb(var(--accent-base))]"
                  : "text-pnl-pos"
              }`}
              aria-hidden="true"
            >
              <CheckIcon delay={0.3 + i * 0.06} />
            </span>
            <span className="text-secondary leading-relaxed min-w-0 break-words">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA — full-width primary high-contrast button using the theme's
          primary text/bg tokens (white-on-dark in dark theme, near-black on
          paper in light theme) so the CTA reads as the strongest action on
          both cards without violating the no-hardcoded-color rule. Both Core
          and Pro use the same primary treatment so neither reads as the
          "lesser" path; the Pro card differentiates via the gradient-border +
          glow + accent rail + "Más popular" pill rather than via its CTA.
          The accent-tinted shadow adds warmth without going garish, and
          `hover:-translate-y-0.5` gives the pressable affordance
          institutional sites use (R20-3c). */}
      <motion.div
        whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 25 } }}
        className="mt-8"
      >
        {/* Buy CTA — `href="#"` is intentional (R20-2b): no payment system
            is wired yet. Replace with the checkout URL when billing lands. */}
        <MagneticButton
          href="#"
          strength={0.18}
          className="group w-full flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-sm font-medium transition-all duration-200 bg-[rgb(var(--txt-primary))] text-[rgb(var(--bg))] shadow-[0_2px_8px_-2px_rgb(var(--accent-base)/0.40),0_1px_2px_rgb(0_0_0/0.20)] hover:bg-[rgb(var(--txt-primary)/0.88)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(var(--accent-base)/0.55),0_2px_8px_rgb(0_0_0/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          {plan.cta}
          <svg
            className="transition-transform duration-200 group-hover:translate-x-0.5"
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
        </MagneticButton>
      </motion.div>
    </motion.div>
  );
}

function CheckIcon({ delay = 0 }: { delay?: number }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-20px" }}
    >
      <motion.circle
        cx="8"
        cy="8"
        r="7"
        fill="currentColor"
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 0.12, scale: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ delay, duration: 0.4, ease: "backOut" }}
        style={{ transformOrigin: "center" }}
      />
      <motion.path
        d="m5 8 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ delay: delay + 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6 2.8 3.8v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V3.8L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="m5.8 8 1.6 1.6L10.4 6.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
