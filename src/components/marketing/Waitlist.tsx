"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { joinWaitlist, SUPPORT_EMAIL, type SubmitFailure } from "@/lib/forms";
import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Waitlist — alta en la lista de espera de acceso anticipado.
 *
 * Sustituye a la antigua sección de boletín. El motivo no es estético: el
 * boletín prometía "1–2 emails al mes" y "cancela cuando quieras" mientras
 * dejaba las altas en un buzón, sin lista real ni forma de darse de baja —
 * un incumplimiento del RGPD además de una promesa vacía. Una lista de
 * espera es lo que de verdad encaja antes del lanzamiento, y GetWaitlist sí
 * mantiene la lista, confirma por email y permite exportarla.
 *
 * El alta viaja por `@/lib/forms` (joinWaitlist), que nunca devuelve éxito
 * si el registro no se guardó: sin ID configurado, con la red caída o si la
 * API rechaza, aquí se ve el motivo, no un ✓ falso.
 *
 * En el éxito se enseña el puesto en la cola cuando la API lo devuelve. Si
 * no viene, se confirma el alta sin número — antes que inventarse uno.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "error" | "success";

/** Copy por tipo de fallo. Distingue "reinténtalo" de "el problema es nuestro". */
function failureCopy(reason: SubmitFailure, es: boolean): string {
  switch (reason) {
    case "network":
      return es
        ? "No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo."
        : "We couldn't connect. Check your connection and try again.";
    case "unconfigured":
    case "rejected":
      return es
        ? `El alta ha fallado por un problema nuestro. Escríbenos a ${SUPPORT_EMAIL}.`
        : `Signup failed on our side. Email us at ${SUPPORT_EMAIL}.`;
  }
}

export function Waitlist() {
  const { lang } = useLang();
  const es = lang === "es";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [priority, setPriority] = useState<number | null>(null);

  const sending = status === "sending";

  /**
   * Sin `action` en el <form>, un submit nativo previo a la hidratación
   * recargaría la página y perdería el alta. El botón no se habilita hasta
   * que React puede interceptar el envío.
   */
  const ready = useHydrated();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "success" || sending) return;

    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg(
        es
          ? "Email no válido. Revísalo e inténtalo de nuevo."
          : "Invalid email. Please check and try again."
      );
      setStatus("error");
      return;
    }

    setErrorMsg(null);
    setStatus("sending");

    const result = await joinWaitlist(email.trim());

    if (result.ok) {
      setPriority(result.priority);
      setStatus("success");
      return;
    }

    setErrorMsg(failureCopy(result.reason, es));
    setStatus("error");
  }

  return (
    <section
      id="waitlist"
      aria-label={es ? "Lista de espera" : "Waitlist"}
      className="section relative overflow-hidden"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
          className="liquid-glass depth-3 rounded-card p-6 sm:p-8 max-w-2xl mx-auto relative transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex justify-center">
              <Eyebrow>{es ? "Acceso anticipado" : "Early access"}</Eyebrow>
            </div>

            <h2 className="mt-5 t-h2 text-primary">
              {es ? (
                <>
                  Entra en la <span className="text-gradient">lista</span>
                </>
              ) : (
                <>
                  Join the <span className="text-gradient">waitlist</span>
                </>
              )}
            </h2>

            <p className="mt-4 text-secondary leading-relaxed max-w-md">
              {es
                ? "Te avisamos en cuanto abramos el acceso. Un solo correo, cuando toque — ni antes ni de más."
                : "We'll let you know the moment access opens. One email, when it matters — no filler."}
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
                      className="flex flex-col items-center gap-3 py-3"
                    >
                      <motion.svg
                        width="68"
                        height="68"
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
                        className="text-lg font-medium text-primary"
                        aria-live="polite"
                        role="status"
                      >
                        {es ? "Estás dentro." : "You're in."}
                      </motion.p>
                      {/* El puesto solo se enseña si la API lo devolvió. */}
                      {priority !== null && (
                        <motion.p
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.68 }}
                          className="tnum text-sm text-secondary"
                        >
                          {es ? "Tu puesto: " : "Your spot: "}
                          <span className="font-semibold text-[rgb(var(--accent-base))]">
                            #{priority}
                          </span>
                        </motion.p>
                      )}
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
                            if (status === "error") {
                              setStatus("idle");
                              setErrorMsg(null);
                            }
                          }}
                          disabled={sending}
                          placeholder={es ? "tu@email.com" : "you@email.com"}
                          aria-label={es ? "Correo electrónico" : "Email address"}
                          aria-invalid={status === "error"}
                          aria-describedby={status === "error" ? "waitlist-error" : undefined}
                          required
                          className="h-12 rounded-[4px] bg-[rgb(var(--divider)/0.04)] border-[rgb(var(--divider)/0.10)] text-primary placeholder:text-tertiary hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:ring-[3px] focus-visible:ring-[rgb(var(--accent-base)/0.12)] disabled:opacity-60"
                        />
                        <AnimatePresence>
                          {status === "error" && errorMsg && (
                            <motion.p
                              id="waitlist-error"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="mt-2 text-xs text-pnl-neg"
                              role="alert"
                            >
                              {errorMsg}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.div
                        whileTap={
                          sending || !ready
                            ? undefined
                            : { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }
                        }
                        className="shrink-0"
                      >
                        <Button
                          type="submit"
                          disabled={sending || !ready}
                          aria-busy={sending}
                          className="h-12 px-6 w-full sm:w-auto rounded-[4px] bg-[rgb(var(--accent-base))] text-[#06130d] font-semibold hover:bg-[rgb(var(--accent-hover))] hover:-translate-y-0.5 transition-[background-color,transform,opacity] duration-200 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          {sending
                            ? es ? "Apuntando…" : "Joining…"
                            : es ? "Apuntarme" : "Join"}
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-4 text-xs text-tertiary text-center flex items-center justify-center gap-1.5">
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="rgb(var(--pnl-pos))" strokeWidth="1.5" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="rgb(var(--pnl-pos))" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {es
                  ? "Tu email nunca se comparte. Puedes salir de la lista cuando quieras."
                  : "Your email is never shared. You can leave the list anytime."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
