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
 * PricingFAQ — small, pricing-specific accordion (4 items) shown on the
 * Pricing page between Comparison and TrustStrip.
 *
 * Distinct from the main marketing FAQ.tsx:
 *  - Narrower scope: only questions a buyer has at the pricing-decision moment
 *    (trial, payment methods, multi-computer, lost license).
 *  - No search bar (the set is small enough that a search would feel heavy).
 *  - Centered institutional header above the accordion (eyebrow + headline
 *    + lead + 3 reassurance pills) — mirrors the Pricing header rhythm so
 *    the two sections read as one continuous conversion story.
 *  - Single `.liquid-glass depth-2 rounded-card` container holds the
 *    accordion; each item tints with `rgb(var(--divider)/0.04)` when open
 *    and picks up a subtle accent border + glow so the active item reads as
 *    "lit".
 *
 * Institutional polish (R2-b):
 *  - `.liquid-glass rounded-card` container with `depth-2` elevation +
 *    `p-2 md:p-3` padding so each accordion item has breathing room.
 *  - Accordion headers `text-sm font-medium text-primary` + the shadcn
 *    chevron (rotates 180° on open via `[&[data-state=open]>svg]:rotate-180`).
 *  - Smooth open animation via Radix's built-in height transition.
 *  - `rgb(var(--divider)/0.04)` tint + `rgb(var(--accent-base)/0.30)` border +
 *    accent glow on the open item so the active question reads as lifted.
 *    Open state also gains a 3 px inset accent rail on the left edge so the
 *    "lit" item reads as a focused institutional FAQ row (R20-3c).
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
          a: "Sí. Tienes la demo en vivo de esta misma web — sin registro, sin descargar nada, con datos deterministas.",
        },
        {
          q: "¿Qué métodos de pago aceptáis?",
          a: "Tarjeta de crédito/débito y PayPal. Emitimos factura con IVA si procede.",
        },
        {
          q: "¿Puedo usarlo en varios ordenadores?",
          a: "Sí. Una misma licencia te permite instalar CountPips en tus ordenadores personales (tu sobremesa de trading y tu portátil, por ejemplo). Activaciones adicionales se gestionan escribiendo a soporte.",
        },
        {
          q: "¿Qué pasa si pierdo mi licencia?",
          a: "Nada. Tu licencia se asocia a tu correo electrónico: escríbenos y te la reenviamos las veces que haga falta. Y aunque pierdas el acceso al correo, tu historial sigue intacto porque vive en tu equipo, no en el nuestro.",
        },
      ]
    : [
        {
          q: "Can I try before buying?",
          a: "Yes. You have the live demo on this very site — no signup, nothing to download, with deterministic data.",
        },
        {
          q: "What payment methods do you accept?",
          a: "Credit/debit card and PayPal. We issue VAT invoices where applicable.",
        },
        {
          q: "Can I use it on multiple computers?",
          a: "Yes. A single license lets you install CountPips on your personal computers (your trading desktop and your laptop, for example). Extra activations can be arranged by emailing support.",
        },
        {
          q: "What if I lose my license?",
          a: "Nothing happens. Your license is tied to your email address: write to us and we'll resend it as many times as you need. And even if you lose access to that email, your history stays intact because it lives on your machine, not ours.",
        },
      ];

  /* La píldora de garantía se retiró (no se ofrecen reembolsos). Se
     mantiene el trío que pide la maqueta con "Sin suscripción", que es
     una promesa que el producto sí sostiene. */
  const pills = [
    es ? "Datos 100 % locales" : "100 % local data",
    es ? "Pago único" : "One-time payment",
    es ? "Sin suscripción" : "No subscription",
  ];

  return (
    <section
      id="pricing-faq"
      aria-label={es ? "Preguntas frecuentes sobre precios" : "Pricing FAQ"}
      className="section-tight bg-veil relative overflow-hidden scroll-mt-24"
    >
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
              ? "Cuatro respuestas rápidas sobre prueba, pago y licencia. Si te queda alguna duda, escríbenos: respondemos en menos de 24 h."
              : "Four quick answers about trial, payment and license. If anything is still unclear, email us: we reply within 24 h."}
          </p>

          {/* Compact reassurance row — three pills summarizing the
              local-first, one-time payment and no-subscription promises.
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
                className="pill !rounded-[4px] bg-[rgb(var(--divider)/0.05)] text-secondary border border-[rgb(var(--divider)/0.10)] tnum"
              >
                <span className="size-1.5 rounded-full bg-[rgb(var(--accent-base))]" aria-hidden="true" />
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
              className="relative"
            >
              {items.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${i}`}
                  /* Mismo motivo que en FAQ.tsx: el raíl de acento es un
                     `border-left` real y no una sombra interior, que se
                     dibujaba encima del texto de la pregunta abierta. */
                  className="border-b border-l-2 border-l-transparent border-b-[rgb(var(--divider)/0.10)] last:border-b-0 px-4 md:px-5 transition-[border-color,background-color] duration-300 data-[state=closed]:hover:bg-[rgb(var(--divider)/0.03)] data-[state=open]:border-l-[rgb(var(--accent-base))] data-[state=open]:bg-[rgb(var(--divider)/0.04)]"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-primary hover:text-primary hover:no-underline py-5 transition-colors [&>svg]:!text-tertiary [&[data-state=open]>svg]:!text-[rgb(var(--accent-base))] [&[data-state=open]>svg]:rotate-180 [&>svg]:transition-transform [&>svg]:duration-300 [&>svg]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=open]:text-[rgb(var(--accent-base))]">
                    {/* Wrap the question in a min-w-0 span so the flex
                        trigger (shadcn AccordionTrigger uses
                        flex justify-between) can wrap long questions
                        to a second line on mobile without pushing the
                        chevron off the right edge. */}
                    <span className="min-w-0 break-words">{item.q}</span>
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
              className="group/link inline-flex items-center gap-1 text-primary hover:text-[rgb(var(--accent-base))] hover:underline font-medium transition-colors duration-200"
            >
              <span>{es ? "Ver FAQ completa" : "See full FAQ"}</span>
              <span className="transition-transform duration-200 group-hover/link:translate-x-0.5" aria-hidden="true">→</span>
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
