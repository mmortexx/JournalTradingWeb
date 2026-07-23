"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

/**
 * VideoCTA — sección de vídeo a pantalla del HTML de referencia:
 * 76vh con vídeo HLS de fondo (opacity 0.55) bajo dos scrims + un
 * glow accent central, y encima eyebrow + titular serif "Lo que no
 * se mide, no se mejora." + copy + CTA doble en píldora.
 *
 * El vídeo es el stream de Mux del HTML. Reproducción:
 *  - Safari: HLS nativo (canPlayType).
 *  - Resto: hls.js (import dinámico — solo se descarga si hace falta).
 *  - Autoplay silencioso con reintentos + arranque en primer gesto
 *    (pointerdown/scroll/keydown) para navegadores estrictos.
 *  - `prefers-reduced-motion`: no se carga ningún vídeo — la sección
 *    respira sobre el fondo oscuro con el glow, sin movimiento.
 */
const HLS_SRC =
  "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

export function VideoCTA() {
  const { lang } = useLang();
  const es = lang === "es";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    let tries = 0;
    let disposed = false;
    let hls: { destroy: () => void } | null = null;

    const play = () => {
      if (disposed) return;
      try {
        const p = v.play();
        if (p && p.catch) {
          p.catch(() => {
            if (tries++ < 2) window.setTimeout(play, 500);
          });
        }
      } catch {
        /* autoplay bloqueado — lo reintenta el primer gesto */
      }
    };

    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = HLS_SRC;
      v.addEventListener("loadedmetadata", play);
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (disposed || !Hls.isSupported()) return;
        const h = new Hls({ enableWorker: false });
        hls = h;
        h.loadSource(HLS_SRC);
        h.attachMedia(v);
        h.on(Hls.Events.MANIFEST_PARSED, play);
      });
    }
    const gestures: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "scroll",
      "keydown",
    ];
    gestures.forEach((ev) =>
      window.addEventListener(ev, play, { once: true, passive: true })
    );
    return () => {
      disposed = true;
      gestures.forEach((ev) => window.removeEventListener(ev, play));
      hls?.destroy();
    };
  }, []);

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden border-y"
      style={{ minHeight: "76vh", borderColor: "rgb(var(--divider) / 0.06)" }}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        style={{ opacity: 0.55 }}
      />
      {/* Viñeta SIMÉTRICA — centra la composición sobre el vídeo (el
          scrim lateral del HTML descompensaba la masa visual hacia la
          derecha; aquí el foco queda en el centro, tras el panel). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 50%, transparent 34%, var(--bg) 96%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(0deg, var(--bg), transparent 38%, transparent 62%, var(--bg))",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(1000px, 90%)",
          height: 300,
          background:
            "radial-gradient(50% 50% at 50% 50%, rgb(var(--accent-base) / 0.2), transparent 70%)",
          filter: "blur(70px)",
          opacity: 0.5,
        }}
      />
      <div
        className="tj-spot relative z-[2] mx-4 w-full max-w-[860px] rounded-[22px] border px-6 py-12 text-center sm:px-12 md:px-16"
        style={{
          borderColor: "rgb(var(--divider) / 0.13)",
          background: "color-mix(in srgb, var(--surface) 52%, transparent)",
          backdropFilter: "blur(18px) saturate(1.35)",
          WebkitBackdropFilter: "blur(18px) saturate(1.35)",
          boxShadow:
            "inset 0 1px 0 rgb(255 255 255 / 0.09), 0 44px 84px -30px rgb(0 0 0 / 0.78)",
        }}
      >
        <div className="mb-5 inline-flex items-center gap-2.5">
          <span
            className="inline-block rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "rgb(var(--accent-base))",
              boxShadow: "0 0 12px rgb(var(--accent-base))",
              animation: "tj-glow 2.6s ease-in-out infinite",
            }}
          />
          <span
            className="uppercase tnum"
            style={{ fontSize: 12, letterSpacing: "0.18em", color: "rgb(var(--accent-base))" }}
          >
            {es ? "Tu operativa, medida" : "Your trading, measured"}
          </span>
        </div>
        <h2
          className="font-serif m-0"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: "var(--ink)",
            textWrap: "balance",
          }}
        >
          {es ? (
            <>
              Lo que no se mide,
              <br />
              no se mejora<span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          ) : (
            <>
              What you don&apos;t measure,
              <br />
              you don&apos;t improve<span style={{ color: "rgb(var(--accent-base))" }}>.</span>
            </>
          )}
        </h2>
        <p
          className="mx-auto mb-0 mt-5"
          style={{
            maxWidth: "32em",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            lineHeight: 1.6,
            color: "var(--ink-2)",
          }}
        >
          {es
            ? "Cada operación, cada regla, cada euro que te cuesta la indisciplina — a la vista y en tu equipo, nunca en la nube de nadie."
            : "Every trade, every rule, every euro your indiscipline costs you — visible, on your machine, never in anyone's cloud."}
        </p>
        <div className="mt-[30px] flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2.5 rounded-full"
            style={{
              height: 52,
              padding: "0 26px",
              background: "rgb(var(--accent-base))",
              color: "#06130d",
              fontSize: 15,
              fontWeight: 600,
              boxShadow:
                "0 14px 38px -14px color-mix(in srgb, rgb(var(--accent-base)) 75%, #000)",
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.filter = "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.filter = "";
            }}
          >
            {es ? "Empieza hoy — 29 $" : "Start today — $29"}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center gap-2.5 rounded-full border"
            style={{
              height: 52,
              padding: "0 24px",
              borderColor: "rgb(var(--divider) / 0.13)",
              background: "color-mix(in srgb, var(--bg) 40%, transparent)",
              color: "var(--ink)",
              fontSize: 15,
              fontWeight: 500,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--ink) 8%, transparent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--bg) 40%, transparent)";
            }}
          >
            {es ? "Ver la demo" : "See the demo"}
          </a>
        </div>
        {/* Fila de stats institucional — el "por qué" en tres números,
            separados por hairlines, cerrando el panel. */}
        <div
          className="mt-11 grid grid-cols-1 gap-6 border-t pt-8 sm:grid-cols-3 sm:gap-0"
          style={{ borderColor: "rgb(var(--divider) / 0.1)" }}
        >
          {[
            {
              n: "40+",
              es: "métricas institucionales",
              en: "institutional metrics",
            },
            {
              n: "0 bytes",
              es: "enviados a la nube",
              en: "sent to the cloud",
            },
            {
              n: es ? "30 días" : "30 days",
              es: "de garantía, sin preguntas",
              en: "guarantee, no questions",
            },
          ].map((s, i) => (
            <div
              key={s.es}
              className={
                i > 0
                  ? "sm:border-l sm:pl-6"
                  : ""
              }
              style={i > 0 ? { borderColor: "rgb(var(--divider) / 0.1)" } : undefined}
            >
              <div
                className="tnum"
                style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}
              >
                {s.n}
              </div>
              <div
                className="tnum mt-1 uppercase"
                style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--ink-3)" }}
              >
                {es ? s.es : s.en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
