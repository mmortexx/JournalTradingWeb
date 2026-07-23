"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { asset } from "@/lib/asset";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

/**
 * PricingFAQ — small, pricing-specific accordion (5 items) shown on the
 * Pricing page between Comparison and TrustStrip.
 *
 * Distinct from the main marketing FAQ.tsx:
 *  - Narrower scope: only questions a buyer has at the pricing-decision moment
 *    (trial, payment methods, guarantee, multi-computer, lost license).
 *  - No search bar (the set is small enough that a search would feel heavy).
 *  - Centered institutional header above the accordion (eyebrow + headline
 *    + lead + 3 reassurance pills) — mirrors the Pricing header rhythm so
 *    the two sections read as one continuous conversion story.
 *  - Single `.liquid-glass depth-2 rounded-card` container holds the
 *    accordion; each item tints `bg-white/[0.04]` when open and picks up
 *    a subtle accent border + glow so the active item reads as "lit".
 *
 * Institutional polish (R2-b):
 *  - `.liquid-glass rounded-card` container with `depth-2` elevation +
 *    `p-2 md:p-3` padding so each accordion item has breathing room.
 *  - Accordion headers `text-sm font-medium text-primary` + the shadcn
 *    chevron (rotates 180° on open via `[&[data-state=open]>svg]:rotate-180`).
 *  - Smooth open animation via Radix's built-in height transition.
 *  - `bg-white/[0.04]` tint + `border-white/25` + accent glow on the
 *    open item so the active question reads as lifted.
 *  - Centered header above the accordion — eyebrow + headline with
 *    `.text-gradient` highlight + lead + 3 reassurance pills.
 *  - Subtle radial accent glow + `.grain` texture layer over the
 *    section so it shares the premium printed surface with Pricing /
 *    FinalCTA.
 */

type QA = { q: string; a: string };

export function PricingFAQ() {
  const { lang } = useLang();
  const es = lang === "es";
  const reduce = useReducedMotion();

  const items: QA[] = es
    ? [
        {
          q: "¿Puedo probar antes de comprar?",
          a: "Sí. Tienes la demo en vivo de esta misma web — sin registro, sin descargar nada, con datos deterministas. Y si después de comprar sientes que no encaja, tienes 30 días de garantía de devolución completa, sin preguntas.",
        },
        {
          q: "¿Qué métodos de pago aceptáis?",
          a: "Tarjeta de crédito/débito y PayPal. Emitimos factura con IVA si procede.",
        },
        {
          q: "¿Cómo funciona la garantía de 30 días?",
          a: "Si en 30 días sientes que la app no es para ti, escribes a soporte y te devolvemos el 100 % del dinero, sin preguntas.",
        },
        {
          q: "¿Puedo usarlo en varios ordenadores?",
          a: "Sí. Una misma licencia te permite instalar Trading Journal en tus ordenadores personales (tu sobremesa de trading y tu portátil, por ejemplo). Activaciones adicionales se gestionan escribiendo a soporte.",
        },
        {
          q: "¿Qué pasa si pierdo mi licencia?",
          a: "Nada. Tu licencia se asocia a tu correo electrónico: escríbenos y te la reenviamos las veces que haga falta. Y aunque pierdas el acceso al correo, tu historial sigue intacto porque vive en tu equipo, no en el nuestro.",
        },
      ]
    : [
        {
          q: "Can I try before buying?",
          a: "Yes. You have the live demo on this very site — no signup, nothing to download, with deterministic data. And if after buying it doesn't fit, you're covered by the 30-day no-questions refund guarantee.",
        },
        {
          q: "What payment methods do you accept?",
          a: "Credit/debit card and PayPal. We issue VAT invoices where applicable.",
        },
        {
          q: "How does the 30-day guarantee work?",
          a: "If within 30 days you feel the app isn't for you, email support and we'll refund 100% of your money, no questions asked.",
        },
        {
          q: "Can I use it on multiple computers?",
          a: "Yes. A single license lets you install Trading Journal on your personal computers (your trading desktop and your laptop, for example). Extra activations can be arranged by emailing support.",
        },
        {
          q: "What if I lose my license?",
          a: "Nothing happens. Your license is tied to your email address: write to us and we'll resend it as many times as you need. And even if you lose access to that email, your history stays intact because it lives on your machine, not ours.",
        },
      ];

  const pills = [
    es ? "30 días de garantía" : "30-day guarantee",
    es ? "Datos 100 % locales" : "100 % local data",
    es ? "Pago único" : "One-time payment",
  ];

  return (
    <section
      id="pricing-faq"
      aria-label={es ? "Preguntas frecuentes sobre precios" : "Pricing FAQ"}
      className="section-tight bg-veil relative overflow-hidden scroll-mt-24"
    >
      {/* Soft radial accent glow behind the accordion — anchors the
          section to the same dark-premium aesthetic as the Pricing
          cards above. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[420px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)",
          opacity: 0.08,
        }}
      />
      {/* Opt-in 3% fractalNoise grain — matches HeroVideo / Bento /
          Pricing so the FAQ reads as a continuation of the same premium
          printed surface. */}
      <div className="grain absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Centered header — eyebrow + headline + lead + reassurance
            pills. Mirrors the Pricing section's header rhythm so the
            two sections read as one continuous conversion story. */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "Antes de comprar" : "Before you buy"}
          </Eyebrow>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight text-primary text-balance">
            {es ? (
              <>
                Lo que casi todos <span className="text-gradient">preguntan.</span>
              </>
            ) : (
              <>
                What almost everyone <span className="text-gradient">asks.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-base md:text-lg text-secondary leading-relaxed">
            {es
              ? "Cinco respuestas rápidas sobre prueba, pago, garantía y licencia. Si te queda alguna duda, escríbenos: respondemos en menos de 24 h."
              : "Five quick answers about trial, payment, guarantee and license. If anything is still unclear, email us: we reply within 24 h."}
          </p>

          {/* Compact reassurance row — three pills summarizing the
              guarantee, local-first and one-time payment promises.
              Centered so they read as a single horizontal credential
              strip directly under the lead. */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {pills.map((label, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.18 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pill bg-[rgb(var(--divider)/0.05)] text-secondary border border-[rgb(var(--divider)/0.10)] tnum"
              >
                <span className="size-1.5 rounded-full bg-[rgb(var(--divider))]" aria-hidden="true" />
                {label}
              </motion.span>
            ))}
          </div>
        </Reveal>

        {/* Accordion — single liquid-glass container holds all 5 items.
            `max-w-3xl` keeps the line-length comfortable for reading
            the answers; `mx-auto` centers it under the header. */}
        <Reveal delay={0.1} y={28}>
          <div className="mt-10 max-w-3xl mx-auto liquid-glass depth-2 rounded-card p-2 md:p-3">
            <Accordion
              type="single"
              collapsible
              defaultValue="item-0"
              className="relative px-2 md:px-3"
            >
              {items.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  className="border-[rgb(var(--divider)/0.10)] last:border-b-0 rounded-md transition-[border-color,box-shadow,background-color] duration-300 data-[state=open]:border-[rgb(var(--divider)/0.25)] data-[state=open]:bg-[rgb(var(--divider)/0.04)] data-[state=open]:shadow-[0_0_28px_-6px_rgb(var(--accent-base)_/_0.18)]"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-primary hover:text-primary hover:no-underline py-5 transition-colors [&[data-state=open]>svg]:rotate-180">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-secondary leading-relaxed text-[0.95rem] pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Inline CTA to the full FAQ page. */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-center text-sm text-tertiary"
          >
            {es ? "¿Más dudas?" : "More questions?"}{" "}
            <a
              href={asset("/faq")}
              className="text-primary hover:text-[rgb(var(--accent-base))] hover:underline font-medium transition-colors duration-200"
            >
              {es ? "Ver FAQ completa →" : "See full FAQ →"}
            </a>
          </motion.p>
        </Reveal>

        {/* Subtle accent line under the section — respects reduced motion. */}
        <motion.div
          aria-hidden="true"
          className="mt-12 h-px max-w-md mx-auto"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base) / 0.4) 50%, transparent 100%)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: reduce ? 0.6 : 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </section>
  );
}
