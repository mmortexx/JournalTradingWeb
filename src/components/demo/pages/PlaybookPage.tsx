"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { Plus, Check, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  SETUP_NAMES,
  computeMetrics,
  rankByExpectancy,
  type SetupName,
  type Trade,
} from "@/lib/trading/data";
import { fmtInt } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

/* ============================================================
 * Setup metadata — distinct hue (NO indigo / blue), bilingual
 * description and 3–4 checklist rules per setup.
 * hue is a CSS rgb-triple string so it can be substituted into
 * `rgb(<hue>)` and `rgb(<hue> / α)`.
 * ============================================================ */
interface SetupMeta {
  hue: string;
  desc: { es: string; en: string };
  rules: { es: string; en: string }[];
}

const SETUP_META: Record<SetupName, SetupMeta> = {
  Ruptura: {
    hue: "16 185 129",
    desc: {
      es: "Rotura de nivel con volumen y re-test confirmado.",
      en: "Level breakout with volume and confirmed re-test.",
    },
    rules: [
      { es: "Nivel claro probado 2+ veces", en: "Clear level tested 2+ times" },
      { es: "Volumen creciente en la rotura", en: "Rising volume on breakout" },
      { es: "Re-test aceptado como nuevo soporte", en: "Re-test accepted as new support" },
      { es: "Stop debajo del nivel roto", en: "Stop below the broken level" },
    ],
  },
  Pullback: {
    hue: "245 158 11",
    desc: {
      es: "Compra retroceso en tendencia clara del timeframe mayor.",
      en: "Buy pullback in a clear higher-timeframe trend.",
    },
    rules: [
      { es: "Tendencia clara en TF mayor", en: "Clear trend on higher TF" },
      { es: "Retroceso a media móvil 20 / 50", en: "Pullback to 20 / 50 moving average" },
      { es: "Confirmación con barra de reversión", en: "Confirmation with reversal bar" },
      { es: "Stop más allá del retroceso", en: "Stop beyond the pullback" },
    ],
  },
  Reversión: {
    hue: "244 63 94",
    desc: {
      es: "Reversión en zona de oferta / demanda con divergencia.",
      en: "Reversal in supply / demand zone with divergence.",
    },
    rules: [
      { es: "Zona de oferta / demanda clara", en: "Clear supply / demand zone" },
      { es: "Divergencia en el oscilador", en: "Oscillator divergence" },
      { es: "Vela de agotamiento confirmada", en: "Exhaustion candle confirmed" },
      { es: "Entrada limitada, stop ajustado", en: "Limit entry, tight stop" },
    ],
  },
  Tendencia: {
    hue: "130 145 175", /* silver-blue (was var(--accent-base)) */
    desc: {
      es: "Continuación de tendencia con trailing stop bajo cada HL.",
      en: "Trend continuation with trailing stop below each HL.",
    },
    rules: [
      { es: "HH y HL confirmados (o LL / LH)", en: "Confirmed HH and HL (or LL / LH)" },
      { es: "Entrar en continuación, no en inicio", en: "Enter on continuation, not start" },
      { es: "Trailing stop bajo cada HL", en: "Trailing stop below each HL" },
      { es: "Salir cuando la estructura rompa", en: "Exit when structure breaks" },
    ],
  },
  Rango: {
    hue: "20 184 166",
    desc: {
      es: "Operar extremos de rango lateral definido.",
      en: "Trade the extremes of a defined sideways range.",
    },
    rules: [
      { es: "Soporte y resistencia definidos", en: "Defined support and resistance" },
      { es: "Operar solo en los extremos", en: "Trade only at extremes" },
      { es: "Confirmación con rechazo", en: "Confirmation with rejection" },
      { es: "Stop fuera del rango", en: "Stop outside the range" },
    ],
  },
};

/* ============================================================
 * Small per-setup SVG glyph — 16×16, stroke=currentColor so it
 * inherits the setup hue via inline `color` style.
 * ============================================================ */
function SetupGlyph({
  name,
  className,
}: {
  name: SetupName;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "Ruptura":
      return (
        <svg {...common}>
          <path d="M2 13 L6 13 L6 3 L14 3" />
          <path d="M11 1 L14 3 L11 5" />
        </svg>
      );
    case "Pullback":
      return (
        <svg {...common}>
          <path d="M2 4 L14 12" />
          <path d="M5 5 L8 8 L5 8" opacity={0.55} />
        </svg>
      );
    case "Reversión":
      return (
        <svg {...common}>
          <path d="M2 4 Q4 12 8 8 Q12 4 14 12" />
          <path d="M11 10 L14 12 L12 14" opacity={0.6} />
        </svg>
      );
    case "Tendencia":
      return (
        <svg {...common}>
          <path d="M2 12 L6 8 L9 11 L14 4" />
          <path d="M11 4 L14 4 L14 7" />
        </svg>
      );
    case "Rango":
      return (
        <svg {...common}>
          <path d="M2 5 L14 5 M2 11 L14 11" />
          <path d="M5 5 L5 11 M11 5 L11 11" opacity={0.55} />
        </svg>
      );
  }
}

/* ============================================================
 * Sparkline — tiny equity-curve SVG with pathLength draw-in.
 * `replayKey` forces the motion.path to remount so it re-animates
 * on hover.
 * ============================================================ */
function buildSparkPath(
  balances: number[],
  w = 100,
  h = 28,
  pad = 3
): string {
  if (balances.length < 2) {
    // Flat line for empty / single-point samples.
    return `M ${pad} ${h / 2} L ${w - pad} ${h / 2}`;
  }
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const range = max - min || 1;
  const n = balances.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const x = pad + (i / (n - 1)) * (w - pad * 2);
    const y = pad + (1 - (balances[i] - min) / range) * (h - pad * 2);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return d.trim();
}

function Sparkline({
  balances,
  replayKey,
  className,
}: {
  balances: number[];
  replayKey: number | string;
  className?: string;
}) {
  const path = useMemo(() => buildSparkPath(balances), [balances]);
  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <motion.path
        key={replayKey}
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.25 },
        }}
      />
    </svg>
  );
}

/* ============================================================
 * New-setup Dialog — visually complete, non-functional save.
 * ============================================================ */
function NewSetupDialog({
  trigger,
  label,
}: {
  trigger: ReactNode;
  label: string;
}) {
  const { lang } = useLang();
  const es = lang === "es";

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-md h-9 px-3 text-sm text-white placeholder:text-gray-400 focus:border-white/20 focus:bg-white/8 transition-colors";
  const labelCls =
    "block text-[11px] uppercase tracking-[0.15em] text-gray-400 mb-1.5";

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="liquid-glass border border-white/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">
            {label}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {es
              ? "Define tu setup con nombre, descripción y reglas. Se guardará localmente."
              : "Define your setup with name, description and rules. Saved locally."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
          aria-label={label}
        >
          <div>
            <label htmlFor="pb-name" className={labelCls}>
              {es ? "Nombre" : "Name"}
            </label>
            <input
              id="pb-name"
              type="text"
              className={`${inputCls} tnum`}
              placeholder={es ? "p. ej. Rotura de rango" : "e.g. Range breakout"}
            />
          </div>

          <div>
            <label htmlFor="pb-desc" className={labelCls}>
              {es ? "Descripción" : "Description"}
            </label>
            <textarea
              id="pb-desc"
              rows={2}
              className={`${inputCls} h-auto py-2 resize-none`}
              placeholder={
                es
                  ? "Una línea que describe el setup…"
                  : "One line describing the setup…"
              }
            />
          </div>

          <div>
            <span className={labelCls}>{es ? "Reglas" : "Rules"}</span>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="text"
                  className={`${inputCls} tnum`}
                  placeholder={es ? `Regla ${i + 1}` : `Rule ${i + 1}`}
                  aria-label={es ? `Regla ${i + 1}` : `Rule ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <button
                type="button"
                className="h-9 px-4 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {es ? "Cancelar" : "Cancel"}
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                type="submit"
                className="h-9 px-4 rounded-md text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" aria-hidden />
                {es ? "Guardar ficha" : "Save setup"}
              </button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
 * SetupCard — one liquid-glass card per setup with live stats.
 *
 * Polish: the sparkline re-draws on every hover via `replayKey`.
 * ============================================================ */
function SetupCard({
  name,
  index,
}: {
  name: SetupName;
  index: number;
}) {
  const { t, lang } = useLang();
  const es = lang === "es";
  const meta = SETUP_META[name];

  const trades = useMemo(
    () => TRADES.filter((tr: Trade) => tr.setup === name),
    [name]
  );
  const metrics = useMemo(() => computeMetrics(trades), [trades]);
  const balances = useMemo(
    () => metrics.equityCurve.map((p) => p.balance),
    [metrics]
  );

  const [replayKey, setReplayKey] = useState(0);

  const total = metrics.wins + metrics.losses;
  const realWinPct = total > 0 ? (metrics.wins / total) * 100 : 0;
  const realLossPct = total > 0 ? (metrics.losses / total) * 100 : 0;
  const winPct = realWinPct;
  const lossPct = realLossPct;

  const hue = meta.hue;
  const colorCss = `rgb(${hue})`;
  const tintCss = `rgb(${hue} / 0.14)`;

  function onHoverStart() {
    setReplayKey((k) => k + 1);
  }

  return (
    <Reveal delay={index * 0.07} y={28} className="h-full">
      <motion.div
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
        className="h-full"
        onHoverStart={onHoverStart}
      >
        <article
          className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full flex flex-col gap-4 relative overflow-hidden"
          aria-label={`${es ? "Setup" : "Setup"} ${name}`}
        >
            {/* Accent top-edge tint */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px opacity-70"
              style={{
                background: `linear-gradient(90deg, transparent, ${colorCss}, transparent)`,
              }}
            />

            {/* Header: glyph + name + sample */}
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md border"
                  style={{
                    color: colorCss,
                    backgroundColor: tintCss,
                    borderColor: `rgb(${hue} / 0.3)`,
                  }}
                  aria-hidden
                >
                  <SetupGlyph name={name} className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-white leading-tight truncate">
                    {name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {es ? meta.desc.es : meta.desc.en}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                {metrics.closedCount === 0 ? (
                  <span className="text-[11px] uppercase tracking-[0.08em] text-gray-400/70">
                    {t("noTradesYet")}
                  </span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
                      {t("sample")}
                    </span>
                    <span className="tnum text-sm font-medium text-gray-300">
                      {fmtInt(metrics.closedCount, lang)}
                    </span>
                  </div>
                )}
              </div>
            </header>

            {/* Sparkline — colored by the setup hue; redraws on hover */}
            <div
              className="relative h-8 w-full"
              style={{ color: colorCss }}
              aria-hidden
            >
              <Sparkline
                balances={balances}
                replayKey={replayKey}
                className="w-full h-8"
              />
            </div>

            {/* Live stats row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400">
                  {t("expectancy")}
                </span>
                <Money
                  value={metrics.expectancy}
                  sign
                  colorizeSign
                  className="text-sm font-medium"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400">
                  {t("winRate")}
                </span>
                <CountUp
                  to={metrics.winRate * 100}
                  decimals={1}
                  suffix="%"
                  tone={metrics.winRate >= 0.5 ? "pos" : "neg"}
                  className="text-sm font-medium"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400">
                  {t("pnlTotal")}
                </span>
                <Money
                  value={metrics.netPnl}
                  sign
                  colorizeSign
                  className="text-sm font-medium"
                />
              </div>
            </div>

            {/* Win / loss bar — animates to a randomized "what-if"
                split on hover, then springs back on hover-end. */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400">
                  {es ? "Ganadoras / Perdedoras" : "Winners / Losers"}
                </span>
                <span className="tnum text-[11px] text-gray-400">
                  <span className="text-pnl-pos">
                    {fmtInt(metrics.wins, lang)}
                  </span>
                  <span className="mx-1 opacity-50">/</span>
                  <span className="text-pnl-neg">
                    {fmtInt(metrics.losses, lang)}
                  </span>
                </span>
              </div>
              <div
                className="flex h-1.5 rounded-full overflow-hidden bg-white/5"
                role="img"
                aria-label={
                  es
                    ? `${metrics.wins} ganadoras, ${metrics.losses} perdedoras`
                    : `${metrics.wins} winners, ${metrics.losses} losers`
                }
              >
                {total > 0 ? (
                  <>
                    <motion.div
                      className="bg-pnl-pos"
                      initial={{ width: 0 }}
                      animate={{ width: `${winPct}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 22,
                        delay: 0.35 + index * 0.06,
                      }}
                    />
                    <motion.div
                      className="bg-pnl-neg"
                      initial={{ width: 0 }}
                      animate={{ width: `${lossPct}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 22,
                        delay: 0.5 + index * 0.06,
                      }}
                    />
                  </>
                ) : (
                  <div className="bg-white/10 w-full" />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="divider-grad" aria-hidden />

            {/* Rules checklist */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-1 h-3 rounded-sm"
                  style={{ backgroundColor: colorCss }}
                  aria-hidden
                />
                <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
                  {t("rules")}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {meta.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-300 leading-snug"
                  >
                    <span
                      className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-sm border inline-flex items-center justify-center"
                      style={{
                        borderColor: `rgb(${hue} / 0.4)`,
                        backgroundColor: `rgb(${hue} / 0.1)`,
                        color: colorCss,
                      }}
                      aria-hidden
                    >
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span>{es ? rule.es : rule.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
      </motion.div>
    </Reveal>
  );
}

/* ============================================================
 * Summary band stat card.
 * ============================================================ */
function SummaryStat({
  label,
  delay,
  children,
}: {
  label: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <Reveal delay={delay} y={18} className="h-full">
      <motion.div
        whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
        className="h-full"
      >
        <div className="liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card p-4 h-full flex flex-col gap-1.5">
          <div className="eyebrow text-[10px]">{label}</div>
          {children}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ============================================================
 * Playbook page
 * ============================================================ */
export function PlaybookPage() {
  const { t, lang } = useLang();
  const es = lang === "es";

  const ranking = useMemo(
    () => rankByExpectancy(TRADES, (tr) => tr.setup),
    []
  );
  const best = ranking[0];
  const mostTraded = useMemo(
    () => [...ranking].sort((a, b) => b.count - a.count)[0],
    [ranking]
  );
  const totalSetups = SETUP_NAMES.length;

  const bestMeta = best ? SETUP_META[best.name as SetupName] : null;

  return (
    <div className="relative p-5 md:p-6 space-y-5">
      {/* ===== Header ===== */}
      <section className="relative overflow-hidden rounded-card">
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4 py-2">
          <div className="max-w-xl">
            <Reveal delay={0}>
              <Eyebrow>{t("playbookEyebrow")}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-2 text-3xl md:text-4xl font-medium tracking-tight text-white">
                {t("playbookTitle")}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                {t("playbookDesc")}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="flex-shrink-0">
            <NewSetupDialog
              label={t("newSetup")}
              trigger={
                <motion.button
                  type="button"
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden />
                  {t("newSetup")}
                </motion.button>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* ===== Summary band ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryStat
          label={es ? "Mejor setup" : "Best setup"}
          delay={0.05}
        >
          {best && bestMeta ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: `rgb(${bestMeta.hue})`,
                  }}
                  aria-hidden
                />
                <span className="text-xl font-medium text-white">
                  {best.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>{t("expectancy")}</span>
                <Money
                  value={best.expectancy}
                  sign
                  colorizeSign
                  className="font-medium"
                />
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400">{t("noTradesYet")}</span>
          )}
        </SummaryStat>

        <SummaryStat
          label={es ? "Más operado" : "Most traded"}
          delay={0.1}
        >
          {mostTraded ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-medium text-white">
                  {mostTraded.name}
                </span>
                <CountUp
                  to={mostTraded.count}
                  className="text-sm font-medium text-white"
                />
              </div>
              <div className="text-xs text-gray-400">
                {es ? "operaciones" : "trades"}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400">{t("noTradesYet")}</span>
          )}
        </SummaryStat>

        <SummaryStat
          label={es ? "Setups totales" : "Total setups"}
          delay={0.15}
        >
          <div className="flex items-baseline gap-2">
            <CountUp
              to={totalSetups}
              className="text-xl font-medium text-white"
            />
            <span className="text-xs text-gray-400">
              {es ? "en tu playbook" : "in your playbook"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles className="w-3 h-3 text-white" aria-hidden />
            <span>{es ? "Vivos, con métricas en tiempo real" : "Live, with real-time metrics"}</span>
          </div>
        </SummaryStat>
      </section>

      {/* ===== Setup cards grid ===== */}
      <section
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        aria-label={es ? "Fichas de setups" : "Setup cards"}
      >
        {SETUP_NAMES.map((name, i) => (
          <SetupCard key={name} name={name} index={i} />
        ))}

        {/* 6th cell — CTA card to add a new setup (fills the grid). */}
        <Reveal delay={SETUP_NAMES.length * 0.07} y={28} className="h-full">
          <motion.div
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            className="h-full"
          >
            <NewSetupDialog
              label={t("newSetup")}
              trigger={
                <button
                  type="button"
                  className="w-full h-full min-h-[260px] rounded-card border-2 border-dashed border-white/20 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex flex-col items-center justify-center gap-3 text-white group"
                  aria-label={t("newSetup")}
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/20 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">
                    {t("newSetup")}
                  </span>
                  <span className="text-xs text-gray-400 px-6 text-center max-w-[220px]">
                    {es
                      ? "Define tu propio setup con reglas y métricas en vivo."
                      : "Define your own setup with rules and live metrics."}
                  </span>
                </button>
              }
            />
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
}
