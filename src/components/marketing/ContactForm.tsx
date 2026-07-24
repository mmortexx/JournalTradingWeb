"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * ContactForm — compact, non-functional contact form (ES/EN).
 *
 * Behaviour:
 *  - Three controlled fields: name, email, message (textarea).
 *  - Client-side validation: required fields + simple email regex.
 *      On error, a small helper line lists the offending fields.
 *  - On success: AnimatePresence cross-fades the form out and an animated
 *    SVG checkmark (circle + path drawn via pathLength) in, with the
 *    confirmation copy fading up underneath.
 *  - Visual only — no network request. Designed to be wired to a real
 *    endpoint later without changing the component shape.
 *
 * Style: `liquid-glass rounded-card p-6 max-w-xl mx-auto`, inputs styled like the
 * rest of the app (`rgb(var(--divider)/0.05)` fill + `rgb(var(--divider)/0.10)` border,
 * accent focus ring). Accent-only palette — no indigo/blue.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const { lang } = useLang();
  const es = lang === "es";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sent) return;

    const missing: string[] = [];
    if (!name.trim()) missing.push(es ? "nombre" : "name");
    if (!email.trim() || !EMAIL_RE.test(email.trim()))
      missing.push(es ? "email válido" : "valid email");
    if (!message.trim()) missing.push(es ? "mensaje" : "message");

    if (missing.length) {
      setError(
        es
          ? `Revisa: ${missing.join(", ")}.`
          : `Please check: ${missing.join(", ")}.`
      );
      return;
    }

    setError(null);
    setSent(true);
  }

  return (
    <section
      aria-label={es ? "Formulario de contacto" : "Contact form"}
      className="section-tight relative overflow-hidden"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />
      <div className="relative max-w-page mx-auto px-5 md:px-8">
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
            <div className="mt-8 liquid-glass depth-2 rounded-card p-6 relative overflow-hidden">
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
                          className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-md h-11 px-3 text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:bg-[rgb(var(--divider)/0.07)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.20)] focus-visible:ring-offset-0"
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
                          className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-md h-11 px-3 text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:bg-[rgb(var(--divider)/0.07)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.20)] focus-visible:ring-offset-0"
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
                          className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-md px-3 py-2.5 text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:bg-[rgb(var(--divider)/0.07)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.20)] focus-visible:ring-offset-0 resize-y min-h-[112px]"
                        />
                      </Field>

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            id="cf-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-pnl-neg"
                            role="alert"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        className="w-full sm:w-auto bg-[rgb(var(--txt-primary))] text-[rgb(var(--bg))] px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-[rgb(var(--txt-primary)/0.88)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgb(var(--accent-base)/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                      >
                        {es ? "Enviar" : "Send"}
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
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] uppercase tracking-[0.14em] text-tertiary font-semibold"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
