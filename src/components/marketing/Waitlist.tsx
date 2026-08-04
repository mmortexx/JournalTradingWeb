"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { fmtNum } from "@/lib/trading/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/tj/Eyebrow";
import {
  fetchWaitlistCount,
  joinWaitlist,
  SUPPORT_EMAIL,
  type SubmitFailure,
} from "@/lib/forms";
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

/** Cada cuánto se vuelve a preguntar el total, con la pestaña visible. */
const REFRESH_MS = 60_000;

type Status = "idle" | "sending" | "error" | "success";

/* ============================================================
   CONTADOR EN VIVO
   ============================================================ */

/**
 * Lee el total de inscritos y lo mantiene fresco.
 *
 * Reglas:
 *  · `null` mientras no se sepa el número, y también si no se puede
 *    saber. La interfaz entonces no enseña contador — antes eso que un
 *    cero de relleno o una cifra inventada.
 *  · Sólo refresca con la pestaña visible: un contador que sigue
 *    llamando en segundo plano gasta la cuota diaria del script de
 *    Google para nadie.
 *  · `bump` permite subirlo al instante tras un alta propia, sin
 *    esperar al siguiente ciclo.
 */
function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);
  /** Evita `setState` sobre un componente ya desmontado. */
  const alive = useRef(true);

  const read = useCallback(async () => {
    const value = await fetchWaitlistCount();
    if (!alive.current || value === null) return;
    // Nunca hacemos bajar el número: si una lectura llega tarde y trae
    // un total anterior a un alta ya reflejada, el contador daría un
    // salto hacia atrás que parece un fallo.
    setCount((prev) => (prev === null || value > prev ? value : prev));
  }, []);

  useEffect(() => {
    alive.current = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer !== null) return;
      void read();
      timer = setInterval(() => void read(), REFRESH_MS);
    };
    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const onVisibility = () =>
      document.visibilityState === "visible" ? start() : stop();

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      alive.current = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [read]);

  const bump = useCallback((exact: number | null) => {
    setCount((prev) => {
      if (exact !== null) return prev === null ? exact : Math.max(prev, exact);
      return prev === null ? prev : prev + 1;
    });
  }, []);

  return { count, bump };
}

/**
 * Cifra que rueda del valor anterior al nuevo en vez de saltar.
 *
 * No se reutiliza `CountUp` porque aquél reinicia desde 0 cada vez que
 * cambia su destino: en un contador que se refresca solo, eso se vería
 * como un desplome a cero cada minuto.
 */
function RollingNumber({ value, lang }: { value: number; lang: "es" | "en" }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;

    // Respeta a quien ha pedido menos movimiento en su sistema: la
    // duración se reduce a cero y la cifra aparece directamente en su
    // sitio. Se resuelve dentro del propio ciclo de animación, no en el
    // cuerpo del efecto, para no encadenar renders.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const span = Math.abs(value - from);
    const duration = reduce ? 0 : Math.min(1400, 320 + span * 6);
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setShown(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{fmtNum(shown, lang, 0)}</>;
}

/**
 * Placa "N ya en la lista". Ocupa alto fijo aunque no haya número, para
 * que la tarjeta no dé un salto cuando la cifra llega de la red.
 */
function LiveCount({ count, es, lang }: { count: number | null; es: boolean; lang: "es" | "en" }) {
  return (
    <div className="mt-5 flex h-8 items-center justify-center" aria-live="polite">
      <AnimatePresence>
        {count !== null && count > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-[2px] border border-[rgb(var(--divider)/0.12)] bg-[rgb(var(--divider)/0.04)] px-3 py-1.5 text-xs text-secondary"
          >
            <span className="relative inline-flex size-1.5 shrink-0" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--pnl-pos)/0.55)]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[rgb(var(--pnl-pos))]" />
            </span>
            <span className="tnum font-semibold text-primary">
              <RollingNumber value={count} lang={lang} />
            </span>
            <span>{es ? "ya en la lista" : "already on the list"}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const [botcheck, setBotcheck] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [priority, setPriority] = useState<number | null>(null);
  /** El email ya estaba en la lista: se confirma, no se trata como error. */
  const [duplicate, setDuplicate] = useState(false);

  const { count, bump } = useWaitlistCount();

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

    const result = await joinWaitlist(email.trim(), { lang, botcheck });

    if (result.ok) {
      setPriority(result.priority);
      setDuplicate(result.duplicate);
      setStatus("success");
      // Si el script devolvió el total, se usa tal cual. Si no lo
      // devolvió y el alta era nueva, se sube uno para que quien acaba
      // de apuntarse se vea reflejado sin esperar al siguiente ciclo.
      // Un alta repetida no añade a nadie: no toca el contador.
      if (result.count !== null) bump(result.count);
      else if (!result.duplicate) bump(null);
      return;
    }

    setErrorMsg(failureCopy(result.reason, es));
    setStatus("error");
  }

  return (
    <section
      id="waitlist"
      aria-label={es ? "Lista de espera" : "Waitlist"}
      className="section relative overflow-hidden scroll-mt-24"
    >
      {/* Section grain — opt-in 3 % fractalNoise overlay. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 tj-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
          // T3c — swap `liquid-glass` por `.tj-paper-glow` (papel cálido
          // translúcido + halo champagne muy tenue): la tarjeta de waitlist
          // es el único objeto destacado de la sección, le sienta bien un
          // papel con halo. `depth-3`, rounded-card, padding y max-w-2xl
          // intactos.
          className="tj-paper tj-paper-glow depth-3 rounded-card p-6 sm:p-8 max-w-2xl mx-auto relative transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
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

            {/* Contador en vivo. Sale del script de la hoja de cálculo,
                no de una cifra escrita a mano: si no se puede leer, no
                se enseña nada. */}
            <LiveCount count={count} es={es} lang={lang} />

            <div className="w-full mt-6">
              {/* Sin alto mínimo reservado. Antes se apartaban 148 px
                  fijos —lo que mide el estado de éxito— para que la
                  tarjeta no diera un salto al confirmar; el precio era
                  que el 100 % de los visitantes, que sólo ven el
                  formulario, se encontraban 110 px de hueco muerto entre
                  el campo y la nota legal. `layout` de framer-motion
                  consigue lo mismo sin pagar ese precio: la tarjeta
                  crece animada al cambiar de estado, y en reposo ocupa
                  exactamente lo que ocupa el formulario. */}
              <motion.div layout transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col">
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
                        {duplicate
                          ? es ? "Ya estabas dentro." : "You were already in."
                          : es ? "Estás dentro." : "You're in."}
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
                            #{fmtNum(priority, lang, 0)}
                          </span>
                          {count !== null && count >= priority && (
                            <>
                              {" "}
                              <span className="text-tertiary">
                                {es ? `de ${fmtNum(count, lang, 0)}` : `of ${fmtNum(count, lang, 0)}`}
                              </span>
                            </>
                          )}
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
                          className="h-12 rounded-[2px] bg-[rgb(var(--divider)/0.04)] border-[rgb(var(--divider)/0.10)] text-primary placeholder:text-tertiary hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--accent-base)/0.50)] focus-visible:ring-[3px] focus-visible:ring-[rgb(var(--accent-base)/0.12)] aria-invalid:border-[rgb(var(--pnl-neg)/0.50)] aria-invalid:hover:border-[rgb(var(--pnl-neg)/0.65)] aria-invalid:focus-visible:border-[rgb(var(--pnl-neg)/0.70)] aria-invalid:focus-visible:ring-[rgb(var(--pnl-neg)/0.18)] disabled:opacity-60"
                        />
                        {/* Campo trampa — fuera de pantalla, ignorado por
                            personas. Si un bot lo rellena, el script de
                            Google descarta el alta sin decírselo. */}
                        <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                          <label htmlFor="waitlist-botcheck">
                            {es ? "No rellenar" : "Do not fill"}
                            <input
                              id="waitlist-botcheck"
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
                          className="h-12 px-6 w-full sm:w-auto rounded-[2px] bg-[rgb(var(--accent-base))] text-[rgb(var(--accent-ink))] font-semibold hover:bg-[rgb(var(--accent-hover))] hover:-translate-y-0.5 transition-[background-color,transform,opacity] duration-200 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                          {sending
                            ? es ? "Apuntando…" : "Joining…"
                            : es ? "Apuntarme" : "Join"}
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>

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
