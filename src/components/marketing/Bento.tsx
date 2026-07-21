"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { METRICS, TRADES } from "@/lib/trading/data";
import { Money } from "@/components/tj/Money";

/**
 * Bento — institutional feature deep-dive for the home page.
 *
 * Layout: 3-col bento on lg, 2-col on md, 1-col on mobile.
 *   Row 1: [ Disciplina hero (lg:col-span-2) ][ Métricas ]
 *   Row 2: [ Playbook ][ 100 % local ][ Calendario P&L ]
 *   Row 3: [ Importación CSV wide (lg:col-span-3) ]
 *
 * Every card uses the same machined-glass language (`.liquid-glass
 * rounded-card p-6` + hover lift + accent border glow). Headers follow
 * a strict vertical rhythm: `.eyebrow` kicker → `text-xl md:text-2xl
 * font-semibold text-primary` title → `text-sm text-secondary`
 * description. Icons live in a `w-10 h-10 rounded-lg bg-white/5
 * border border-white/10` container with the glyph in `text-primary`
 * or accent gold.
 *
 * The Disciplina hero card carries a mini "FACTURA" invoice preview
 * — monospace `tnum` numbers, dashed dividers, red TOTAL — to make
 * "discipline that costs money" literal. The Importación CSV card
 * carries broker chips (`.pill` style) so the integration story
 * reads as institutional, not text-y. The Calendario P&L card carries
 * a small calendar heatmap so the P&L-over-time promise is visible
 * at a glance.
 *
 * Bilingual via `useLang()`. Accent gold (`--accent-base`) used
 * sparingly for hover glows + the invoice TOTAL accent. No
 * indigo/blue. Dark theme primary; light theme works via
 * `.text-primary/.text-secondary/.text-tertiary`.
 */

/* ---------- Icons ---------- */

function DisciplineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v3M5 21h14M7 21V9M17 21V9M5 9l7-3 7 3M5 9h14M9 14h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
    </svg>
  );
}

function MetricsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h16M6 20v-7M11 20V8M16 20v-11M21 20V5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlaybookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4.5A1.5 1.5 0 016.5 3H18a1 1 0 011 1v16a1 1 0 01-1 1H6.5A1.5 1.5 0 015 20.5v-16z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 18.5h13" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 8h6M9 11h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M5 6.5L7 7v3l-2-.5V6.5z" fill="currentColor" />
    </svg>
  );
}

function LocalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6.5" cy="7" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7" r="0.5" fill="currentColor" />
      <path
        d="M8 13h8M8 16h5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v11m0 0l-4-4m4 4l4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- Icon container ---------- */

/** Standard icon well: 40×40, rounded-lg, faint inner fill + hairline ring.
 *  Matches the machined-edge language of `.liquid-glass` (1px white top
 *  highlight, 1px black bottom inset) at a smaller scale. */
function IconWell({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] ${
        accent ? "text-[rgb(var(--accent-base))]" : "text-primary"
      }`}
    >
      {children}
    </span>
  );
}

/* ---------- Mini invoice (inside Disciplina hero card) ---------- */

/** Compact "FACTURA" preview — monospace `tnum` numbers, dashed dividers,
 *  red TOTAL line. Pulls real numbers from METRICS so the cost shown
 *  matches MistakeInvoice (used on other pages). Sums to the same
 *  METRICS.costOfIndiscipline total. */
function MiniInvoice() {
  const { lang } = useLang();
  const es = lang === "es";

  const total = METRICS.costOfIndiscipline;
  const brokeCount = TRADES.filter((t) => t.compliance !== "yes").length;
  const gap = METRICS.expectancyInPlan - METRICS.expectancyBrokePlan;

  // Illustrative line items — allocation sums to METRICS.costOfIndiscipline.
  const items = [
    {
      label: es ? "Fuera de horario" : "Off-hours",
      pct: 0.32,
    },
    {
      label: es ? "Tamaño > plan" : "Size > plan",
      pct: 0.27,
    },
    {
      label: es ? "Sin stop" : "No stop",
      pct: 0.18,
    },
    {
      label: es ? "FOMO / persecución" : "FOMO / chasing",
      pct: 0.23,
    },
  ];

  return (
    <div
      className="relative rounded-lg border border-white/10 bg-black/40 overflow-hidden"
      style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.04)" }}
    >
      {/* Header — FACTURA + ID */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-tertiary">
          {es ? "Factura" : "Invoice"}
        </span>
        <span
          className="text-[10px] tnum text-secondary"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          #IND-2026-07
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-tertiary font-semibold border-b border-dashed border-white/10">
        <span>{es ? "Concepto" : "Concept"}</span>
        <span>{es ? "Importe" : "Amount"}</span>
      </div>

      {/* Line items */}
      <div>
        {items.map((it, i) => {
          const amount = total * it.pct;
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-1.5 border-b border-dashed border-white/10 items-center"
            >
              <span className="text-[11px] text-secondary truncate">{it.label}</span>
              <span
                className="text-[11px] text-pnl-neg tnum font-medium text-right"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              >
                <Money value={-amount} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtotal row */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.015]">
        <span className="text-[10px] text-tertiary">
          {es ? "Gap por operación" : "Gap per trade"} ×{" "}
          <span className="tnum">{brokeCount}</span>
        </span>
        <span
          className="text-[10px] text-pnl-warn tnum"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          <Money value={gap} sign />
        </span>
      </div>

      {/* TOTAL — render the raw signed value (METRICS.costOfIndiscipline is
          already negative), so Money prepends the unicode minus sign and
          the TOTAL reads as "−577,10 US$" — the literal "cost" framing. */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-pnl-neg/40 bg-pnl-neg/[0.06]">
        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-secondary">
          {es ? "Total" : "Total"}
        </span>
        <span
          className="text-base tnum font-semibold text-pnl-neg"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          <Money value={total} />
        </span>
      </div>
    </div>
  );
}

/* ---------- Mini calendar heatmap (inside Calendario P&L card) ---------- */

/** Tiny 7×5 P&L calendar — small colored squares for each "day", mixing
 *  positive (emerald), negative (red) and neutral (white/5) cells so the
 *  shape of a real trading month reads at a glance. Static (no animation)
 *  so it reads as a snapshot, not a demo. A small legend row below ties
 *  the colors to meaning so it never reads as a placeholder. */
function MiniCalendarHeatmap() {
  // Deterministic pattern — same on every render so it doesn't flicker.
  // Mix of pos (1), neg (-1), neutral (0). Skews slightly positive so
  // the visual reads as a "profitable month with the usual red days".
  const pattern = [
    0, 1, 1, -1, 0, 1, 0, 1, -1, 1, 1, 0, -1, 1, 0, 1, 1, 0, -1, 0, 1, 1,
    -1, 0, 1, 1, 0, 1, -1, 0, 1, 0, 1, 1, 0,
  ];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {pattern.map((v, i) => {
          const cls =
            v === 1
              ? "bg-pnl-pos/55"
              : v === -1
              ? "bg-pnl-neg/55"
              : "bg-white/5";
          return (
            <span
              key={i}
              className={`block aspect-square rounded-[2px] ${cls}`}
            />
          );
        })}
      </div>
      {/* Legend — small color-dot key below the heatmap. Anchors the
          calendar to meaning so it reads as a real P&L view, not a
          decorative pattern. */}
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-[1px] bg-pnl-pos/55" />
          <span>Win</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-[1px] bg-pnl-neg/55" />
          <span>Loss</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-[1px] bg-white/10" />
          <span>Flat</span>
        </span>
      </div>
    </div>
  );
}

/* ---------- Broker chips (inside Importación CSV card) ---------- */

const BROKER_CHIPS = [
  { name: "Interactive Brokers", mark: "IB" },
  { name: "MetaTrader 4", mark: "M4" },
  { name: "MetaTrader 5", mark: "M5" },
  { name: "NinjaTrader", mark: "NT" },
  { name: "TradingView", mark: "TV" },
  { name: "Binance", mark: "BN" },
  { name: "Coinbase", mark: "CB" },
  { name: "OANDA", mark: "OA" },
  { name: "IG", mark: "IG" },
  { name: "TD Ameritrade", mark: "TD" },
];

/* ---------- Card primitive ---------- */

/** Standard bento card primitive — every card uses the same machined-glass
 *  language: `.liquid-glass rounded-card p-6 h-full` + a hover lift
 *  (`-translate-y-1`) + an accent-tinted border glow on hover. The
 *  `transition-all duration-300` covers transform, border-color and
 *  box-shadow so the lift + glow feel coordinated.
 *
 *  The `className` prop is split: `outer` classes (grid-column spans,
 *  `h-full`) land on the `Reveal` wrapper that IS the grid item, so
 *  `lg:col-span-2` / `lg:col-span-3` actually affect the grid track.
 *  `inner` classes (depth tokens, since they're box-shadows that apply
 *  to the visible glass surface) land on the inner `motion.div`. */
function BentoCard({
  children,
  /** Outer-grid classes — col-span, h-full, etc. */
  outer = "",
  /** Inner-surface classes — depth tokens, etc. */
  inner = "",
  delay = 0,
}: {
  children: React.ReactNode;
  outer?: string;
  inner?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={`h-full ${outer}`}>
      <motion.div
        whileHover={{
          y: -4,
          transition: { type: "spring", stiffness: 300, damping: 24 },
        }}
        className={`liquid-glass rounded-card p-6 h-full flex flex-col transition-[background-color,border-color,box-shadow,transform] duration-300 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(var(--accent-base)/0.08)] ${inner}`}
      >
        {children}
      </motion.div>
    </Reveal>
  );
}

/* ---------- Section ---------- */

export function Bento() {
  const { t, lang } = useLang();
  const es = lang === "es";

  return (
    <section className="section-tight cv-auto bg-black relative overflow-hidden">
      {/* Subtle radial accent glow at the top — anchors the section to the
          hero's dark video aesthetic; cards (H2's liquid-glass) float above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgb(var(--accent-base) / 0.08), transparent 70%)",
        }}
      />

      {/* Section grain — opt-in `.grain` utility layers a 3 % fractalNoise
          overlay via ::after for the "expensive printed" feel. */}
      <div aria-hidden="true" className="grain absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Header */}
        <Reveal className="max-w-3xl">
          <Eyebrow>{t("featuresEyebrow")}</Eyebrow>
          <h2 className="mt-5 t-h2 text-white">
            {es ? (
              <>
                No es otro journal con las mismas <span className="tnum">30</span>{" "}
                <span className="text-gradient">métricas.</span>
              </>
            ) : (
              <>
                Not another journal with the same <span className="tnum">30</span>{" "}
                <span className="text-gradient">metrics.</span>
              </>
            )}
          </h2>
          <p className="mt-4 t-body text-secondary max-w-2xl">{t("featuresLead")}</p>
        </Reveal>

        {/* Bento grid — 1 col mobile, 2 col tablet, 3 col desktop. */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Row 1 — Disciplina hero card (lg:col-span-2) + Métricas card.
              The hero card carries the mini FACTURA invoice preview on the
              right; the Métricas card is a single-column stat card. */}
          <BentoCard
            delay={0.05}
            outer="lg:col-span-2"
            inner="depth-3"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6 h-full">
              {/* Left — eyebrow / title / description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <IconWell accent>
                    <DisciplineIcon />
                  </IconWell>
                  <span className="eyebrow">
                    {es ? "Disciplina" : "Discipline"}
                  </span>
                </div>
                <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
                  {es ? "Disciplina que cuesta dinero" : "Discipline that costs money"}
                </h3>
                <p className="mt-2 text-sm text-secondary leading-relaxed">
                  {es
                    ? "Cada operación fuera de plan tiene un precio, y aquí lo ves, en dinero. La app lo calcula desde tus propias operaciones — no es una métrica de marketing, es tu cuenta de resultados."
                    : "Every off-plan trade has a price, and you see it here, in money. The app calculates it from your own trades — not a marketing metric, your P&L statement."}
                </p>
              </div>
              {/* Right — mini invoice preview */}
              <div className="md:w-[260px] shrink-0">
                <MiniInvoice />
              </div>
            </div>
          </BentoCard>

          <BentoCard delay={0.13} inner="depth-2">
            <div className="flex items-center gap-3">
              <IconWell>
                <MetricsIcon />
              </IconWell>
              <span className="eyebrow">{es ? "Métricas" : "Metrics"}</span>
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
              {es ? "Métricas institucionales" : "Institutional metrics"}
            </h3>
            <p className="mt-2 text-sm text-secondary leading-relaxed">
              {es
                ? "Sharpe, Sortino, Calmar, recovery factor. Lo que usan los fondos."
                : "Sharpe, Sortino, Calmar, recovery factor. What funds actually use."}
            </p>
            <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-tertiary">
              <span className="tnum">Sharpe</span>
              <span className="text-gray-600">·</span>
              <span className="tnum">Sortino</span>
              <span className="text-gray-600">·</span>
              <span className="tnum">Calmar</span>
              <span className="text-gray-600">·</span>
              <span>RF</span>
            </div>
          </BentoCard>

          {/* Row 2 — Playbook / 100 % local / Calendario P&L */}
          <BentoCard delay={0.05} inner="depth-2">
            <div className="flex items-center gap-3">
              <IconWell>
                <PlaybookIcon />
              </IconWell>
              <span className="eyebrow">{es ? "Playbook" : "Playbook"}</span>
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
              {es ? "Playbook con stats en vivo" : "Playbook with live stats"}
            </h3>
            <p className="mt-2 text-sm text-secondary leading-relaxed">
              {es
                ? "Cada setup muestra expectancy y win rate en tiempo real. Deja de ser un PDF muerto."
                : "Each setup shows expectancy and win rate live. It stops being a dead PDF."}
            </p>
          </BentoCard>

          <BentoCard delay={0.13} inner="depth-2">
            <div className="flex items-center gap-3">
              <IconWell>
                <LocalIcon />
              </IconWell>
              <span className="eyebrow">{es ? "Privacidad" : "Privacy"}</span>
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
              <span className="tnum">100</span> %{" "}
              {es ? "local, sin nube" : "local, no cloud"}
            </h3>
            <p className="mt-2 text-sm text-secondary leading-relaxed">
              {es
                ? "Tus operaciones viven en tu disco. Nadie más las ve, nadie puede perderlas."
                : "Your trades live on your disk. Nobody else sees them, nobody can lose them."}
            </p>
          </BentoCard>

          <BentoCard delay={0.21} inner="depth-2">
            <div className="flex items-center gap-3">
              <IconWell>
                <CalendarIcon />
              </IconWell>
              <span className="eyebrow">{es ? "Calendario" : "Calendar"}</span>
            </div>
            <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
              {es ? "Calendario P&L" : "P&L calendar"}
            </h3>
            <p className="mt-2 text-sm text-secondary leading-relaxed">
              {es
                ? "Cada día del mes, un cuadro verde o rojo. El patrón de tu mes habla solo."
                : "Each day of the month, a green or red square. The shape of your month speaks for itself."}
            </p>
            <div className="mt-auto pt-5">
              <MiniCalendarHeatmap />
            </div>
          </BentoCard>

          {/* Row 3 — Wide Importación CSV card (lg:col-span-3) with broker
              chips. Spans the full row so the integration story gets
              visual breathing room. */}
          <BentoCard delay={0.1} outer="lg:col-span-3" inner="depth-2">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10 h-full">
              {/* Left — eyebrow / title / description */}
              <div className="lg:w-[320px] shrink-0">
                <div className="flex items-center gap-3">
                  <IconWell accent>
                    <ImportIcon />
                  </IconWell>
                  <span className="eyebrow">{es ? "Importación" : "Import"}</span>
                </div>
                <h3 className="mt-4 text-xl md:text-2xl font-semibold text-primary leading-tight">
                  {es ? "Importación CSV universal" : "Universal CSV import"}
                </h3>
                <p className="mt-2 text-sm text-secondary leading-relaxed">
                  {es
                    ? "Mapea columnas una sola vez. El perfil queda guardado para siempre. Si tu broker exporta a CSV, este diario lo importa."
                    : "Map columns once. The profile is saved forever. If your broker exports to CSV, this journal imports it."}
                </p>
              </div>
              {/* Right — broker chips grid + microcopy */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2">
                  {BROKER_CHIPS.map((b) => (
                    <span
                      key={b.name}
                      className="pill bg-white/5 text-secondary border border-white/10 text-[11px] uppercase tracking-[0.08em]"
                      title={b.name}
                    >
                      <span
                        className="font-bold text-primary"
                        style={{
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                        }}
                      >
                        {b.mark}
                      </span>
                      <span className="text-tertiary font-medium normal-case tracking-normal text-[10.5px]">
                        {b.name}
                      </span>
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-tertiary leading-relaxed">
                  {es
                    ? "¿Tu broker no está en la lista? Si exporta a CSV, este diario lo importa."
                    : "Your broker not on the list? If it exports to CSV, this journal imports it."}
                </p>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
