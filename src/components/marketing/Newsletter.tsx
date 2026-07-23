"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/tj/Eyebrow";

/**
 * Newsletter signup — bilingual liquid-glass card with email capture, regex validation,
 * and a non-functional success animation (checkmark draw-in + cross-fade copy).
 *
 * Premium motion layer:
 *  - aurora-bg backdrop with two accent glow orbs.
 *  - Card scales in on scroll-into-view (0.94 → 1 with eased spring).
 *  - On submit success, AnimatePresence cross-fades the form out and an animated
 *    SVG checkmark (circle + path drawn via pathLength) in, with the thank-you
 *    message fading up underneath.
 *  - Error state: invalid email slides a small red helper in below the input;
 *    typing again clears it.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "error" | "success";

export function Newsletter() {
  const { lang } = useLang();
  const es = lang === "es";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "success") return;
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  return (
    <section
      id="newsletter"
      aria-label={es ? "Boletín" : "Newsletter"}
      className="section relative overflow-hidden"
    >
      {/* Aurora backdrop */}
      <div aria-hidden="true" className="absolute inset-0 aurora-bg pointer-events-none" />
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      {/* Static accent glow orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full blur-[130px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-140px] -right-28 w-[460px] h-[460px] rounded-full blur-[130px] pointer-events-none opacity-14"
        style={{ background: "radial-gradient(circle, rgb(var(--accent-base)), transparent 70%)" }}
      />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
          className="liquid-glass depth-3 rounded-card p-8 max-w-2xl mx-auto relative transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center">
              <Eyebrow>{es ? "Boletín" : "Newsletter"}</Eyebrow>
            </div>

            <h2
              className="mt-5 t-h2 text-primary"
            >
              {es ? (
                <>
                  Mantente al <span className="text-gradient">día</span>
                </>
              ) : (
                <>
                  Stay in the <span className="text-gradient">loop</span>
                </>
              )}
            </h2>

            <p className="mt-4 text-secondary leading-relaxed max-w-md">
              {es
                ? "Recibe consejos de trading, actualizaciones del producto y noticias exclusivas. Sin spam, 1–2 emails al mes."
                : "Get trading tips, product updates and exclusive news. No spam, 1–2 emails per month."}
            </p>

            <div className="w-full mt-7">
              <div className="min-h-[148px] flex flex-col justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col items-center gap-4 py-3"
                    >
                      <motion.svg
                        width="68"
                        height="68"
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                        initial="hidden"
                        animate="shown"
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
                        className="text-lg font-medium text-primary"
                      >
                        {es ? "¡Gracias! Revisa tu email." : "Thank you! Check your email."}
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
                      className="flex flex-col sm:flex-row gap-3 sm:items-center"
                    >
                      <div className="flex-1 text-left">
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          placeholder={es ? "tu@email.com" : "you@email.com"}
                          aria-label={es ? "Correo electrónico" : "Email address"}
                          aria-invalid={status === "error"}
                          className="h-12 bg-[rgb(var(--divider)/0.04)] border-[rgb(var(--divider)/0.10)] text-primary placeholder:text-tertiary focus-visible:border-[rgb(var(--divider)/0.30)]"
                        />
                        <AnimatePresence>
                          {status === "error" && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 text-xs text-pnl-neg"
                              role="alert"
                            >
                              {es ? "Email no válido. Revísalo e inténtalo de nuevo." : "Invalid email. Please check and try again."}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.div
                        whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                        className="shrink-0"
                      >
                        <Button
                          type="submit"
                          className="h-12 px-6 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors shrink-0"
                        >
                          {es ? "Suscribirme" : "Subscribe"}
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-4 text-xs text-tertiary text-center">
                {es
                  ? "Tu email nunca se comparte. Cancela cuando quieras."
                  : "Your email is never shared. Unsubscribe anytime."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

