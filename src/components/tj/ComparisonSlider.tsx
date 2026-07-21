"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

/**
 * ComparisonSlider — a draggable before/after slider that lets the visitor
 * reveal more of one side by dragging a vertical handle across the card.
 *
 * - One liquid-glass card (`h-64`) split into two layers:
 *     · Base layer (z-0): the "After / Después" panel — vibrant, accent
 *       border glow, green ✓ icons. Always painted full-width so the
 *       card never shows a blank gap when the handle is dragged to the
 *       far left.
 *     · Clipped overlay (z-10): the "Before / Antes" panel — muted,
 *       desaturated, red ✗ icons. Its right edge follows the handle so
 *       dragging right reveals more "before", dragging left reveals
 *       more "after".
 * - The handle is a vertical accent line + circular grip with double
 *   arrows (`‹ ›`). It uses pointer events so the drag works equally
 *   well with mouse, touch and pen. We use MotionValue + useTransform
 *   to drive the clip + handle position without a React state update
 *   per pointermove (which would re-render the whole card on every
 *   frame and jank on lower-end machines).
 * - Keyboard: the handle is focusable (`role="slider"`). Arrow Left /
 *   Right move by 8 %, Home / End jump to the extremes. aria-valuenow
 *   is kept in sync.
 * - Reduced-motion users get the same drag behaviour (it's a direct
 *   manipulation, not an animation) but no spring physics on the
 *   handle's resting position.
 */

const MIN_PCT = 4; // keep a sliver visible on either side
const MAX_PCT = 96;
const KEYBOARD_STEP = 8; // %

export function ComparisonSlider() {
  const { lang } = useLang();
  const es = lang === "es";

  const before = es
    ? [
        "Operas por instinto",
        "No recuerdas por qué entraste",
        "Repites los mismos errores",
      ]
    : [
        "You trade on instinct",
        "You don't remember why you entered",
        "You repeat the same mistakes",
      ];

  const after = es
    ? [
        "Cada operación tiene un plan",
        "Sabes qué funcionó y qué no",
        "Mejoras cada semana, medido",
      ]
    : [
        "Every trade has a plan",
        "You know what worked and what didn't",
        "You improve every week, measured",
      ];

  // The slider position as a 0–100 percentage. Initialized at 50 %
  // (handle dead center). MotionValue lets us drive both the handle's
  // `left` and the overlay's clip-path in a single source of truth
  // without React re-renders per pointermove frame.
  const pos = useMotionValue(50);

  // `left` for the handle: clamped to [MIN_PCT, MAX_PCT].
  const handleLeft = useTransform(pos, (v) => `${Math.min(MAX_PCT, Math.max(MIN_PCT, v))}%`);

  // The "before" overlay's right edge follows the handle so dragging
  // right reveals more "before" content; dragging left reveals more
  // "after". `inset(0 ${100 - v}% 0 0)` clips from the right inward.
  const beforeClip = useTransform(
    pos,
    (v) =>
      `inset(0 ${100 - Math.min(MAX_PCT, Math.max(MIN_PCT, v))}% 0 0 round 8px)`
  );

  // Track the live value for ARIA + the label chip. This DOES setState
  // but only on pointerup / keydown (not on every pointermove), so the
  // card doesn't re-render during the drag itself — the MotionValues
  // handle the per-frame visual updates out-of-band.
  const [ariaPct, setAriaPct] = useState(50);

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Pointermove handler — reads the cursor's X relative to the card's
  // bounding box and writes a 0–100 value to the `pos` MotionValue.
  // No React state, no re-render — just a motion value write, which
  // framer-motion propagates to the subscribed elements via its own
  // render loop.
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((e.clientX - r.left) / r.width) * 100;
    pos.set(Math.min(MAX_PCT, Math.max(MIN_PCT, pct)));
  }, [pos]);

  // Stop dragging on global pointerup — attaches to window so the drag
  // continues even if the cursor leaves the card while held.
  useEffect(() => {
    const stop = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // Sync the ARIA value once at rest — single re-render at end of
      // interaction instead of per-frame.
      const v = pos.get();
      setAriaPct(Math.round(v));
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [onPointerMove, pos]);

  const startDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Don't start a drag on keyboard focus — pointer events only.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    draggingRef.current = true;
    // Immediately position to the click point so the handle "jumps to"
    // the cursor on first click rather than waiting for a move event.
    const el = containerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const pct = ((e.clientX - r.left) / r.width) * 100;
      pos.set(Math.min(MAX_PCT, Math.max(MIN_PCT, pct)));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    let next = pos.get();
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = next - KEYBOARD_STEP;
        break;
      case "ArrowRight":
      case "ArrowUp":
        next = next + KEYBOARD_STEP;
        break;
      case "Home":
        next = MIN_PCT;
        break;
      case "End":
        next = MAX_PCT;
        break;
      default:
        return;
    }
    e.preventDefault();
    const clamped = Math.min(MAX_PCT, Math.max(MIN_PCT, next));
    pos.set(clamped);
    setAriaPct(Math.round(clamped));
  };

  return (
    <section className="section">
      <div className="max-w-page mx-auto px-5 md:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <Eyebrow className="justify-center">
            {es ? "Arrastra y compara" : "Drag and compare"}
          </Eyebrow>
          <h2
            className="mt-5 t-h2 text-white"
          >
            {es ? (
              <>
                Mueve la barra. <span className="text-gradient">Mira tu reflejo.</span>
              </>
            ) : (
              <>
                Move the bar. <span className="text-gradient">See your reflection.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-gray-300 leading-relaxed">
            {es
              ? "Arrastra la barra central para revelar más del antes o del después. La transformación no es magia: es disciplina medida."
              : "Drag the center bar to reveal more of the before or the after. The transformation isn't magic: it's measured discipline."}
          </p>
        </Reveal>

        <Reveal delay={0.1} y={28}>
          <div
            ref={containerRef}
            className="liquid-glass depth-2 rounded-card overflow-hidden h-64 relative select-none mt-10 max-w-3xl mx-auto transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            // Prevent the page from scrolling while the visitor drags the
            // handle on a touch device — touch-action: none on the
            // container means the pointermove events stay ours.
            style={{ touchAction: "none" }}
          >
            {/* ─────────────── AFTER (base layer, full width) ─────────────── */}
            <div className="absolute inset-0">
              {/* Accent wash — same as the After card in BeforeAfter */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 80% at 100% 0%, rgb(var(--accent-base) / 0.18), transparent 60%)",
                }}
              />
              {/* Header chip top-right */}
              <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/20">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/8 text-white">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white">
                  {es ? "Después" : "After"}
                </span>
              </div>
              <ul className="absolute inset-0 flex flex-col justify-center gap-4 px-8 md:px-12 pl-16 md:pl-20">
                {after.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-3"
                  >
                    <span className="inline-flex shrink-0 w-5 h-5 rounded-full bg-pnl-pos/15 items-center justify-center mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6.5l2.5 2.5L10 3.5" stroke="rgb(var(--pnl-pos))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-white font-medium">{line}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* ─────────────── BEFORE (clipped overlay) ─────────────── */}
            <motion.div
              className="absolute inset-0"
              style={{ clipPath: beforeClip }}
              aria-hidden="true"
            >
              {/* Muted liquid-glass surface — sits ABOVE the after layer so its
                  red wash + desaturated tone override the after card. */}
              <div
                className="absolute inset-0 saturate-[0.85] border-r border-pnl-neg/30"
                style={{
                  background:
                    "linear-gradient(180deg, rgb(var(--card) / 0.96), rgb(var(--card) / 0.92))",
                }}
              />
              {/* Soft red wash */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 80% at 0% 0%, rgb(var(--pnl-neg) / 0.14), transparent 60%)",
                }}
              />
              {/* Header chip top-left */}
              <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pnl-neg/10 border border-pnl-neg/25">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pnl-neg/15 text-pnl-neg">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-pnl-neg">
                  {es ? "Antes" : "Before"}
                </span>
              </div>
              <ul className="absolute inset-0 flex flex-col justify-center gap-4 px-8 md:px-12 pr-16 md:pr-20">
                {before.map((line, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3"
                  >
                    <span className="inline-flex shrink-0 w-5 h-5 rounded-full bg-pnl-neg/15 items-center justify-center mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="rgb(var(--pnl-neg))" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-gray-300/85">{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ─────────────── DRAG HANDLE ─────────────── */}
            <motion.button
              type="button"
              role="slider"
              aria-label={es ? "Arrastra para comparar antes y después" : "Drag to compare before and after"}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={ariaPct}
              aria-orientation="horizontal"
              onPointerDown={startDrag}
              onKeyDown={onKeyDown}
              style={{ left: handleLeft, touchAction: "none" }}
              className="absolute top-0 bottom-0 z-30 -translate-x-1/2 w-1 cursor-ew-resize bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {/* Soft glow along the line */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -left-1 -right-1 blur-[3px] bg-white/30"
              />
              {/* Circular grip with double arrows */}
              <span
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full liquid-glass text-white border border-white/30 shadow-[0_8px_24px_-6px_rgb(var(--accent-base)/0.55)]"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M5 5L2.5 8L5 11M11 5L13.5 8L11 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </motion.button>

            {/* Edge hint — top-center line showing this is interactive */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400/70 font-semibold">
                {es ? "Arrastra →" : "Drag →"}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-6 text-xs text-gray-400 text-center max-w-2xl mx-auto">
            {es
              ? "El mismo trader, dos resultados. La diferencia no es talento: es mirarte con honestidad."
              : "The same trader, two outcomes. The difference isn't talent: it's looking at yourself honestly."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
