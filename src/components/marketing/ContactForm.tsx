"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { submitForm, SUPPORT_EMAIL, type SubmitFailure } from "@/lib/forms";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * ContactForm — compact contact form (ES/EN) wired to a real endpoint.
 *
 * Behaviour:
 *  - Three controlled fields: name, email, message (textarea).
 *  - Client-side validation: required fields + simple email regex.
 *      On error, a small helper line lists the offending fields.
 *  - On submit the message is POSTed through `@/lib/forms` (Web3Forms) and
 *    lands in the support inbox. The success state is only shown once the
 *    endpoint confirms delivery — a failed send shows the reason plus a
 *    mailto fallback, never a fake checkmark.
 *  - On success: AnimatePresence cross-fades the form out and an animated
 *    SVG checkmark (circle + path drawn via pathLength) in, with the
 *    confirmation copy fading up underneath.
 *
 * Style: `liquid-glass rounded-card p-6 max-w-xl mx-auto`, inputs styled like the
 * rest of the app (`rgb(var(--divider)/0.05)` fill + `rgb(var(--divider)/0.10)` border,
 * accent focus ring). Accent-only palette — no indigo/blue.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "sent";

/** Copy por tipo de fallo. El usuario necesita saber si reintentar o escribir directo. */
function failureCopy(reason: SubmitFailure, es: boolean): string {
  switch (reason) {
    case "network":
      return es
        ? "No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo."
        : "We couldn't connect. Check your connection and try again.";
    case "unconfigured":
    case "rejected":
      return es
        ? "El envío ha fallado por un problema nuestro. Escríbenos directamente:"
        : "The send failed on our side. Email us directly:";
  }
}

export function ContactForm() {
  const { lang } = useLang();
  const es = lang === "es";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [botcheck, setBotcheck] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  /** Cuando el fallo es nuestro, ofrecemos el buzón de soporte como salida. */
  const [showFallback, setShowFallback] = useState(false);

  /**
   * El envío depende por completo de JS: el <form> no tiene `action`, así que
   * un submit nativo (antes de hidratar, o con JS caído) recargaría la página
   * y perdería el mensaje sin avisar. El botón sigue deshabilitado hasta que
   * React puede interceptar el submit.
   */
  const ready = useHydrated();

  const sent = status === "sent";
  const sending = status === "sending";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sent || sending) return;

    const missing: string[] = [];
    if (!name.trim()) missing.push(es ? "nombre" : "name");
    if (!email.trim() || !EMAIL_RE.test(email.trim()))
      missing.push(es ? "email válido" : "valid email");
    if (!message.trim()) missing.push(es ? "mensaje" : "message");

    if (missing.length) {
      setShowFallback(false);
      setError(
        es
          ? `Revisa: ${missing.join(", ")}.`
          : `Please check: ${missing.join(", ")}.`
      );
      return;
    }

    setError(null);
    setShowFallback(false);
    setStatus("sending");

    const result = await submitForm({
      subject: es
        ? `Nuevo mensaje de ${name.trim()} — CountPips`
        : `New message from ${name.trim()} — CountPips`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      botcheck,
    });

    if (result.ok) {
      setStatus("sent");
      return;
    }

    // Vuelta a "idle": el formulario sigue relleno para que se pueda
    // reintentar sin volver a escribirlo todo.
    setStatus("idle");
    setError(failureCopy(result.reason, es));
    setShowFallback(result.reason !== "network");
  }

  return (
    <section
      aria-label={es ? "Formulario de contacto" : "Contact form"}
      /* `bg-veil` — esta sección se quedó fuera de la pasada de velos:
         el eyebrow, el titular y el subtítulo caían sobre el punto más
         brillante del iris y el subtítulo resultaba casi ilegible. */
      className="section-tight relative overflow-hidden bg-veil"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative tj-container">
        <div className="max-w-xl mx-auto">
          <Reveal>
            <div className="flex justify-center">
              <Eyebrow>{es ? "Escríbenos" : "Send a message"}</Eyebrow>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="mt-5 text-center t-h2 text-primary"
            >
              {es ? (
                <>
                  Envía un <span className="text-gradient">mensaje</span>
                </>
              ) : (
                <>
                  Send a <span className="text-gradient">message</span>
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-3 text-center text-secondary text-sm leading-relaxed">
              {es
                ? "Cuéntanos qué necesitas. Te respondemos en menos de 24 h."
                : "Tell us what you need. We reply in under 24 hours."}
            </p>
          </Reveal>

          <Reveal delay={0.14} y={20}>
            {/* T3c — swap `liquid-glass` por `.tj-paper`: el formulario
                se lee como una tarjeta de papel cálido translúcida.
                `depth-2`, padding, rounded-card y min-h-[360px] intactos. */}
            <div className="tj-paper depth-2 rounded-card p-6 relative overflow-hidden mt-8">
              {/* min-height keeps layout stable when the form swaps to the
                  success state, so the card doesn't collapse on submit. */}
              <div className="min-h-[360px] flex flex-col justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {sent ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center gap-4 py-8 text-center"
                    >
                      <motion.svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                      >
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="rgb(var(--pnl-pos))"
                          strokeWidth="2"
                          fill="rgb(var(--pnl-pos) / 0.10)"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <motion.path
                          d="M20 33.5l8 8 16-18"
                          stroke="rgb(var(--pnl-pos))"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </motion.svg>
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.55 }}
                        className="text-base font-medium text-primary"
                        aria-live="polite"
                        role="status"
                      >
                        {es
                          ? "✓ Mensaje enviado. Te responderemos en 24h."
                          : "✓ Message sent. We'll reply in 24h."}
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={onSubmit}
                      noValidate
                      className="flex flex-col gap-4"
                    >
                      <Field label={es ? "Nombre" : "Name"} htmlFor="cf-name">
                        <input
                          id="cf-name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={es ? "Tu nombre" : "Your name"}
                          aria-label={es ? "Nombre" : "Name"}
                          aria-invalid={!!error}
                          aria-describedby={error ? "cf-error" : undefined}
                          required
                          className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-[2px] h-11 px-3 text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:bg-[rgb(var(--divider)/0.07)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.20)] focus-visible:ring-offset-0 aria-invalid:border-[rgb(var(--pnl-neg)/0.50)] aria-invalid:hover:border-[rgb(var(--pnl-neg)/0.65)] aria-invalid:focus-visible:border-[rgb(var(--pnl-neg)/0.70)] aria-invalid:focus-visible:ring-[rgb(var(--pnl-neg)/0.18)]"
                        />
                      </Field>
                      <Field label={es ? "Email" : "Email"} htmlFor="cf-email">
                        <input
                          id="cf-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={es ? "tu@email.com" : "you@email.com"}
                          aria-label={es ? "Email" : "Email"}
                          aria-invalid={!!error}
                          aria-describedby={error ? "cf-error" : undefined}
                          required
                          className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-[2px] h-11 px-3 text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:bg-[rgb(var(--divider)/0.07)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.20)] focus-visible:ring-offset-0 aria-invalid:border-[rgb(var(--pnl-neg)/0.50)] aria-invalid:hover:border-[rgb(var(--pnl-neg)/0.65)] aria-invalid:focus-visible:border-[rgb(var(--pnl-neg)/0.70)] aria-invalid:focus-visible:ring-[rgb(var(--pnl-neg)/0.18)]"
                        />
                      </Field>
                      <Field label={es ? "Mensaje" : "Message"} htmlFor="cf-msg">
                        <textarea
                          id="cf-msg"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={es ? "¿En qué podemos ayudarte?" : "How can we help?"}
                          aria-label={es ? "Mensaje" : "Message"}
                          aria-invalid={!!error}
                          aria-describedby={error ? "cf-error" : undefined}
                          required
                          rows={4}
                          className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-[2px] px-3 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:bg-[rgb(var(--divider)/0.07)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.20)] focus-visible:ring-offset-0 resize-y min-h-[112px] aria-invalid:border-[rgb(var(--pnl-neg)/0.50)] aria-invalid:hover:border-[rgb(var(--pnl-neg)/0.65)] aria-invalid:focus-visible:border-[rgb(var(--pnl-neg)/0.70)] aria-invalid:focus-visible:ring-[rgb(var(--pnl-neg)/0.18)]"
                        />
                      </Field>

                      {/* Honeypot — invisible para personas, tentador para bots.
                          Si llega relleno, Web3Forms descarta el envío. No usa
                          `display:none` porque algunos bots ignoran esos campos. */}
                      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                        <label htmlFor="cf-botcheck">
                          {es ? "No rellenar" : "Do not fill"}
                          <input
                            id="cf-botcheck"
                            type="text"
                            name="botcheck"
                            tabIndex={-1}
                            autoComplete="off"
                            value={botcheck}
                            onChange={(e) => setBotcheck(e.target.value)}
                          />
                        </label>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            id="cf-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-pnl-neg"
                            role="alert"
                          >
                            {error}
                            {showFallback && (
                              <>
                                {" "}
                                <a
                                  href={`mailto:${SUPPORT_EMAIL}`}
                                  className="underline underline-offset-2 hover:text-[rgb(var(--accent-base))] transition-colors"
                                >
                                  {SUPPORT_EMAIL}
                                </a>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={sending || !ready}
                        aria-busy={sending}
                        whileTap={sending || !ready ? undefined : { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        /* T2g — `min-h-[44px]` guarantees the ≥44 px touch target
                           regardless of label line-height; the previous `py-2.5`
                           alone produced a 40 px button on mobile (real touch-target
                           fix, same class of bug as T2d's Guardian buttons).
                           `w-full sm:w-fit sm:min-w-[180px]` makes the button
                           auto-width on tablet/desktop (≤260 px content) instead
                           of stretching as a full-width bar; on mobile it stays
                           full-width inside the max-w-xl card so it reads as the
                           primary action. Text color kept as #1A1917 (always-dark
                           ink on the medium-lightness gold accent fill — clears
                           AA in both themes; matches the Waitlist + Download CTA
                           treatment). */
                        className="w-full sm:w-fit sm:min-w-[180px] inline-flex items-center justify-center gap-2 min-h-[44px] bg-[rgb(var(--accent-base))] text-[rgb(var(--accent-ink))] px-6 py-2.5 rounded-[2px] text-sm font-semibold transition-[background-color,transform,opacity] duration-200 hover:bg-[rgb(var(--accent-hover))] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {sending
                          ? es ? "Enviando…" : "Sending…"
                          : es ? "Enviar" : "Send"}
                      </motion.button>

                      <p className="text-[11px] text-tertiary text-center">
                        {es
                          ? "No compartimos tu email. Solo te respondemos."
                          : "We never share your email. We only reply to you."}
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] uppercase tracking-[0.14em] text-tertiary font-semibold transition-colors duration-200 group-focus-within:text-[rgb(var(--accent-base))]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
