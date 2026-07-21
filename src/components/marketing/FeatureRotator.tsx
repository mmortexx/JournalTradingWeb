"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { SlowMoChart } from "@/components/tj/SlowMoChart";

/**
 * FeatureRotator — a thin band that cycles through 5 key feature highlights
 * with a smooth cross-fade. Auto-advances every 4s, pauses on hover/focus.
 *
 * Premium motion layer:
 *  - SlowMoChart backdrop drifting behind a liquid-glass card.
 *  - Animated accent gradient line draws across the top of the card on view.
 *  - AnimatePresence (sync mode) cross-fades each highlight (icon + title +
 *    1-line description) with a subtle y-shift; both panels briefly overlap.
 *  - Animated progress bar at the top of the card fills in lockstep with the
 *    4s interval; resets on manual navigation or pause.
 *  - Dots row below the card: clicking jumps to a highlight, hover grows the
 *    active pill; keyboard-accessible buttons with descriptive aria-labels.
 */

const ADVANCE_MS = 4000;
const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Icons ---------- */

function PrivacyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6.5" cy="7" r="0.55" fill="currentColor" />
      <circle cx="8.7" cy="7" r="0.55" fill="currentColor" />
      <path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MetricsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h16M6 20v-7M11 20V8M16 20v-11M21 20V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4.5A1.5 1.5 0 016.5 3H14l5 5v11.5A1.5 1.5 0 0117.5 21h-11A1.5 1.5 0 015 19.5v-15z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11v5M9.5 13l2.5 2 2.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DisciplineIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l8 4v5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V7l8-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2.2 2.2L15.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BilingualIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 13 0 16M12 3c-2.5 2.5-2.5 13 0 16" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/* ---------- Component ---------- */

export function FeatureRotator() {
  const { lang } = useLang();
  const es = lang === "es";

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const features = [
    {
      icon: <PrivacyIcon />,
      title: es ? "100 % local, sin nube" : "100 % local, no cloud",
      desc: es
        ? "Tus operaciones viven en tu disco. Nadie más las ve, nadie puede perderlas."
        : "Your trades live on your disk. Nobody else sees them, nobody can lose them.",
    },
    {
      icon: <MetricsIcon />,
      title: es ? "Métricas institucionales" : "Institutional metrics",
      desc: es
        ? "Sharpe, Sortino, Calmar, recovery factor. Lo que usan los fondos, no solo win rate."
        : "Sharpe, Sortino, Calmar, recovery factor. What funds use, not just win rate.",
    },
    {
      icon: <ImportIcon />,
      title: es ? "Importación CSV universal" : "Universal CSV import",
      desc: es
        ? "Importa el historial de cualquier broker en segundos. Mapea columnas una sola vez."
        : "Import history from any broker in seconds. Map columns once and forget about it.",
    },
    {
      icon: <DisciplineIcon />,
      title: es ? "Disciplina que cuesta dinero" : "Discipline that costs money",
      desc: es
        ? "Ves, en dinero, cuánto te cuesta romper tu propio plan antes de pulsar comprar."
        : "See, in money, how much breaking your own plan costs before you hit buy.",
    },
    {
      icon: <BilingualIcon />,
      title: es ? "Bilingüe ES + EN nativo" : "Native ES + EN bilingual",
      desc: es
        ? "Diseñado y escrito en ambas lenguas, no traducido por una máquina."
        : "Designed and written in both languages, not machine-translated.",
    },
  ];

  const count = features.length;

  // Auto-advance every ADVANCE_MS, paused on hover/focus.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const goTo = (i: number) => setIdx(((i % count) + count) % count);
  const f = features[idx];

  /* ----------------------------------------------------------------
     Touch swipe — horizontal swipe advances / retreats the carousel.
     Threshold: 50px horizontal, dominant axis (|dx| > |dy|) so the
     vertical page scroll never triggers a slide change. Ignored when
     the gesture starts on an interactive control (the dot buttons
     below) so taps on a dot still navigate to that exact slide.
     ---------------------------------------------------------------- */
  const SWIPE_THRESHOLD = 50;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target) {
      const tag = target.tagName;
      if (
        tag === "BUTTON" ||
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA" ||
        tag === "A" ||
        target.isContentEditable
      ) {
        touchStart.current = null;
        return;
      }
    }
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dy) > Math.abs(dx)) return; // vertical scroll, not a swipe
    if (dx < 0) {
      goTo(idx + 1);
    } else {
      goTo(idx - 1);
    }
  };

  return (
    <section
      aria-label={es ? "Características destacadas" : "Featured highlights"}
      className="section-tight relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Soft equity-curve backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <SlowMoChart className="w-full h-full" opacity={0.05} cycle={22} />
      </div>

      {/* Aurora wash */}
      <div className="absolute inset-0 aurora-bg pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <div
          className="relative liquid-glass rounded-card overflow-hidden min-h-[184px] md:min-h-[168px]"
          role="region"
          aria-roledescription="carousel"
          aria-label={es ? "Características destacadas" : "Featured highlights"}
        >
          {/* Animated accent gradient line drawing across the top on view */}
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent origin-left"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
          />

          {/* Auto-advance progress bar — resets on idx change & pauses on hover */}
          <motion.div
            key={`progress-${idx}-${paused}`}
            aria-hidden
            className="absolute left-0 bottom-0 h-0.5 bg-white/70 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: paused ? 0 : 1 }}
            transition={{
              duration: paused ? 0 : ADVANCE_MS / 1000,
              ease: "linear",
            }}
            style={{ width: "100%" }}
          />

          {/* Cross-fading panels — both overlap (sync mode) for true cross-fade */}
          <AnimatePresence initial={false}>
            <motion.div
              key={idx}
              className="absolute inset-0 p-6 md:p-7 flex flex-col md:flex-row items-center md:items-center justify-center text-center md:text-left gap-3 md:gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <motion.span
                className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-md flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] text-primary"
                aria-hidden="true"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
              >
                {f.icon}
              </motion.span>
              <div className="flex-1 min-w-0">
                <h3 className="t-h3 text-primary leading-tight">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm md:text-base text-secondary leading-relaxed max-w-2xl">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {features.map((feature, i) => {
            const active = i === idx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={es
                  ? `Ir a la característica ${i + 1} de ${count}: ${feature.title}`
                  : `Go to feature ${i + 1} of ${count}: ${feature.title}`}
                aria-current={active ? "true" : undefined}
                className="group relative p-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {/* Active/inactive dot — the fill is a static class (bg-white)
                    so Framer Motion never tries to interpolate any color; only
                    numeric `width` and `opacity` are animated, which Framer
                    Motion handles natively. The inactive opacity (0.28) gives
                    the dimmed look against the transparent button background. */}
                <motion.span
                  className="block h-1.5 rounded-full bg-white"
                  animate={{
                    width: active ? 26 : 6,
                    opacity: active ? 1 : 0.28,
                  }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ originX: 0.5 }}
                />
                {/* Hover lift for inactive dots */}
                <span
                  aria-hidden
                  className={`absolute inset-1.5 rounded-full transition-colors ${
                    active ? "" : "group-hover:bg-white/8"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
