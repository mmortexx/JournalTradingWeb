"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLang, type Lang } from "@/lib/i18n";
import {
  TRADES,
  INSTRUMENTS,
  type Trade,
  type Compliance,
} from "@/lib/trading/data";
import { useCustomTrades, customTradeToTrade } from "@/lib/trading/demoStore";
import {
  fmtNum,
  fmtDuration,
  fmtDateTime,
  fmtPrice,
  pnlTone,
} from "@/lib/trading/format";
import { useDemo } from "@/components/demo/DemoContext";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { MagneticButton } from "@/components/tj/MagneticButton";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- helpers ---------- */

function seededRnd(seed: number) {
  let s = Math.abs(Math.floor(seed)) || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Tiny deterministic candlestick mini-chart for screenshot thumbnails. */
function MiniCandles({ seed, win }: { seed: number; win: boolean }) {
  const rnd = seededRnd(seed);
  const n = 9;
  const candles: { o: number; c: number; h: number; l: number }[] = [];
  let last = 30 + rnd() * 25;
  const drift = win ? 0.6 : -0.6;
  for (let i = 0; i < n; i++) {
    const o = last;
    const c = o + (rnd() - 0.5 + drift * 0.18) * 14;
    const h = Math.max(o, c) + rnd() * 4;
    const l = Math.min(o, c) - rnd() * 4;
    candles.push({ o, c, h, l });
    last = c;
  }
  const allV = candles.flatMap((c) => [c.h, c.l]);
  const min = Math.min(...allV);
  const max = Math.max(...allV);
  const range = max - min || 1;
  const W = 100;
  const H = 60;
  const pad = 4;
  const yFor = (v: number) =>
    pad + (1 - (v - min) / range) * (H - pad * 2);
  const cw = (W - pad * 2) / n;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      {candles.map((c, i) => {
        const x = pad + i * cw + cw / 2;
        const up = c.c >= c.o;
        const stroke = up
          ? "rgb(var(--pnl-pos))"
          : "rgb(var(--pnl-neg))";
        const bodyTop = yFor(Math.max(c.o, c.c));
        const bodyBot = yFor(Math.min(c.o, c.c));
        return (
          <g key={i}>
            <line
              x1={x}
              y1={yFor(c.h)}
              x2={x}
              y2={yFor(c.l)}
              stroke={stroke}
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={x - cw * 0.3}
              y={bodyTop}
              width={cw * 0.6}
              height={Math.max(0.6, bodyBot - bodyTop)}
              fill={stroke}
              opacity={0.92}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** The "trade journey" SVG: entry → MFE peak → MAE trough → exit, drawn in. */
function TradeJourney({ trade, lang }: { trade: Trade; lang: Lang }) {
  const isLong = trade.direction === "long";
  const isWin = trade.netPnl >= 0;
  const stopDist = Math.abs(trade.entry - trade.initialStop) || 1;

  // R-multiples → actual price excursions (direction-aware).
  const mfePrice = isLong
    ? trade.entry + trade.mfe * stopDist
    : trade.entry - trade.mfe * stopDist;
  const maePrice = isLong
    ? trade.entry + trade.mae * stopDist
    : trade.entry - trade.mae * stopDist;

  const prices = [
    trade.entry,
    trade.exit,
    mfePrice,
    maePrice,
    trade.initialStop,
    trade.target,
  ];
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const W = 100;
  const H = 30;
  const pad = 3;
  const yFor = (p: number) =>
    pad + (1 - (p - minP) / range) * (H - pad * 2);

  const xEntry = 6;
  const xMfe = 33;
  const xMae = 66;
  const xExit = 94;

  const yEntry = yFor(trade.entry);
  const yMfe = yFor(mfePrice);
  const yMae = yFor(maePrice);
  const yExit = yFor(trade.exit);
  const yStop = yFor(trade.initialStop);
  const yTarget = yFor(trade.target);

  const path = [
    `M ${xEntry} ${yEntry}`,
    `C ${xEntry + 10} ${yEntry}, ${xMfe - 10} ${yMfe}, ${xMfe} ${yMfe}`,
    `C ${xMfe + 8} ${yMfe}, ${xMae - 8} ${yMae}, ${xMae} ${yMae}`,
    `C ${xMae + 8} ${yMae}, ${xExit - 10} ${yExit}, ${xExit} ${yExit}`,
  ].join(" ");

  const lineColor = isWin
    ? "rgb(var(--pnl-pos))"
    : "rgb(var(--pnl-neg))";

  const markers = [
    { x: xEntry, y: yEntry, color: "rgb(255 255 255)", delay: 1.4 },
    { x: xMfe, y: yMfe, color: "rgb(var(--pnl-pos))", delay: 1.65 },
    { x: xMae, y: yMae, color: "rgb(var(--pnl-neg))", delay: 1.85 },
    { x: xExit, y: yExit, color: lineColor, delay: 2.05 },
  ];

  return (
    <div
      className="relative w-full h-24 md:h-28"
      role="img"
      aria-label={
        lang === "es"
          ? "Recorrido de la operación: entrada, MFE, MAE y salida"
          : "Trade journey: entry, MFE, MAE and exit"
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Reference horizontal levels */}
        <line
          x1="0"
          y1={yEntry}
          x2={W}
          y2={yEntry}
          stroke="rgb(156 163 175)"
          strokeWidth={0.5}
          strokeDasharray="1.5 2"
          vectorEffect="non-scaling-stroke"
          opacity={0.5}
        />
        <line
          x1="0"
          y1={yStop}
          x2={W}
          y2={yStop}
          stroke="rgb(var(--pnl-neg))"
          strokeWidth={0.5}
          strokeDasharray="1 2"
          vectorEffect="non-scaling-stroke"
          opacity={0.32}
        />
        <line
          x1="0"
          y1={yTarget}
          x2={W}
          y2={yTarget}
          stroke="rgb(var(--pnl-pos))"
          strokeWidth={0.5}
          strokeDasharray="1 2"
          vectorEffect="non-scaling-stroke"
          opacity={0.32}
        />

        {/* The drawn-in path */}
        <motion.path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
      </svg>

      {/* Markers as HTML for crisp, non-distorted dots */}
      {markers.map((m, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: m.delay,
            type: "spring",
            stiffness: 360,
            damping: 18,
          }}
          className="absolute rounded-full"
          style={{
            left: `${(m.x / W) * 100}%`,
            top: `${(m.y / H) * 100}%`,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            background: m.color,
            boxShadow: `0 0 0 3px rgb(var(--card) / 0.7), 0 0 14px ${m.color}`,
          }}
        />
      ))}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "pos" | "neg";
}) {
  const cls =
    tone === "pos"
      ? "text-pnl-pos"
      : tone === "neg"
      ? "text-pnl-neg"
      : "text-primary";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-tertiary text-sm">{label}</span>
      <span className={`tnum text-sm font-medium ${cls}`}>{value}</span>
    </div>
  );
}

/* ---------- main component ---------- */

export function TradeDetailPage() {
  const { t, lang } = useLang();
  const { selectedTradeId, goBack } = useDemo();
  // Merge custom trades (added via the Dashboard composer) into the sample
  // so a detail page can be opened for them too. Without this, clicking a
  // custom-trade row in TradesPage would route here with a `selectedTradeId`
  // that doesn't exist in the deterministic `TRADES` array (custom trade ids
  // are Date.now() timestamps, not 1..72) and the page would render its
  // empty state instead of the trade's details.
  const customTrades = useCustomTrades();
  const trade = useMemo(() => {
    const sample = TRADES.find((x) => x.id === selectedTradeId);
    if (sample) return sample;
    const custom = customTrades.find((c) => c.id === selectedTradeId);
    return custom ? customTradeToTrade(custom) : undefined;
  }, [selectedTradeId, customTrades]);
  const [review, setReview] = useState<Compliance>(
    trade?.compliance ?? "yes"
  );

  if (!trade) {
    return (
      <div className="p-5 md:p-6">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-secondary hover:text-primary liquid-glass border border-white/10 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t("back")}
        </button>
        <p className="text-secondary text-sm mt-6">
          {lang === "es"
            ? "Ninguna operación seleccionada."
            : "No trade selected."}
        </p>
      </div>
    );
  }

  const isWin = trade.netPnl >= 0;
  const isLong = trade.direction === "long";
  const instrument = INSTRUMENTS.find((i) => i.symbol === trade.instrument);
  const decimals = instrument?.decimals ?? 2;
  const tone = pnlTone(trade.netPnl);

  // Generate a management note from trade data (bilingual).
  const manageNote =
    lang === "es"
      ? trade.compliance === "yes"
        ? `MFE alcanzó ${trade.mfe.toFixed(2)}R; gestioné hasta cerrar en ${trade.rMultiple.toFixed(2)}R.`
        : trade.compliance === "partial"
        ? `MFE fue ${trade.mfe.toFixed(2)}R; salí antes de objetivo, resultado final ${trade.rMultiple.toFixed(2)}R.`
        : `Perseguí la entrada, MAE llegó a ${trade.mae.toFixed(2)}R; cerré en ${trade.rMultiple.toFixed(2)}R.`
      : trade.compliance === "yes"
      ? `MFE reached ${trade.mfe.toFixed(2)}R; managed to exit at ${trade.rMultiple.toFixed(2)}R.`
      : trade.compliance === "partial"
      ? `MFE was ${trade.mfe.toFixed(2)}R; exited before target, final ${trade.rMultiple.toFixed(2)}R.`
      : `Chased entry, MAE hit ${trade.mae.toFixed(2)}R; closed at ${trade.rMultiple.toFixed(2)}R.`;

  // Risk:reward bar fractions (1 : plannedRr).
  const riskFraction = 1 / (1 + trade.plannedRr);
  const rewardFraction = trade.plannedRr / (1 + trade.plannedRr);

  const complianceVariant =
    trade.compliance === "yes"
      ? "pos"
      : trade.compliance === "no"
      ? "neg"
      : "warn";

  return (
    <div className="relative p-5 md:p-6 space-y-5">
      {/* ===== HERO BAND ===== */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden liquid-glass depth-3 hover:depth-4 transition-shadow duration-300 rounded-card p-6"
      >
        <div className="relative">
          {/* Top row: back + meta */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-secondary hover:text-primary liquid-glass border border-white/10 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t("back")}
            </button>
            <div className="flex items-center gap-2 text-xs text-tertiary">
              <span className="tnum">#{trade.id.toString().padStart(3, "0")}</span>
              <span aria-hidden="true">·</span>
              <span>{trade.session}</span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span className="tnum hidden sm:inline">
                {fmtDateTime(trade.closedAt, lang)}
              </span>
            </div>
          </div>

          {/* Chips row */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="flex flex-wrap items-center gap-2 mb-3"
          >
            <Chip variant="accent">{trade.instrument}</Chip>
            <Chip variant={isLong ? "pos" : "neg"}>
              {t(isLong ? "long" : "short")}
            </Chip>
            <Chip variant="neutral">{trade.setup}</Chip>
            <Chip variant={complianceVariant}>
              {trade.compliance === "yes"
                ? t("yes")
                : trade.compliance === "no"
                ? t("no")
                : t("partial")}
            </Chip>
          </motion.div>

          {/* Big P&L + R-multiple */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
          >
            <CountUp
              key={trade.id}
              to={Math.abs(trade.netPnl)}
              from={0}
              decimals={2}
              prefix={trade.netPnl >= 0 ? "+$" : "−$"}
              tone={tone}
              duration={1.6}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            />
            <span
              className={`tnum text-xl md:text-2xl font-bold ${
                trade.rMultiple >= 0 ? "text-pnl-pos" : "text-pnl-neg"
              }`}
            >
              {trade.rMultiple > 0 ? "+" : ""}
              {trade.rMultiple.toFixed(2)}R
            </span>
          </motion.div>

          {/* Trade journey SVG */}
          <div className="mt-5">
            <TradeJourney trade={trade} lang={lang} />
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mt-3 text-xs text-tertiary">
              <LegendItem
                color="rgb(255 255 255)"
                label={t("entry")}
              />
              <LegendItem color="rgb(var(--pnl-pos))" label="MFE" />
              <LegendItem color="rgb(var(--pnl-neg))" label="MAE" />
              <LegendItem
                color={
                  isWin
                    ? "rgb(var(--pnl-pos))"
                    : "rgb(var(--pnl-neg))"
                }
                label={t("exit")}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===== EXECUTION + PLAN GRID ===== */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Execution card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
          whileHover={{
            y: -2,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          }}
          className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full flex flex-col"
        >
          <Eyebrow className="mb-4">{t("execution")}</Eyebrow>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4">
            <Detail label={t("entry")}>
              <span className="tnum text-primary">
                {fmtPrice(trade.entry, decimals, lang)}
              </span>
            </Detail>
            <Detail label={t("exit")}>
              <span className="tnum text-primary">
                {fmtPrice(trade.exit, decimals, lang)}
              </span>
            </Detail>
            <Detail label={t("quantity")}>
              <span className="tnum text-primary">
                {fmtNum(trade.qty, lang, 3)}
              </span>
            </Detail>
            <Detail label={t("grossPnl")}>
              <Money value={trade.grossPnl} sign colorizeSign />
            </Detail>
            <Detail label={t("fees")}>
              <Money value={-trade.fees} />
            </Detail>
            <Detail label={t("colDuration")}>
              <span className="tnum text-primary">
                {fmtDuration(trade.durationMin, lang)}
              </span>
            </Detail>
            <Detail label={lang === "es" ? "Apertura" : "Opened"}>
              <span className="tnum text-primary text-xs">
                {fmtDateTime(trade.openedAt, lang)}
              </span>
            </Detail>
            <Detail label={t("colClosed")}>
              <span className="tnum text-primary text-xs">
                {fmtDateTime(trade.closedAt, lang)}
              </span>
            </Detail>
            <Detail label={lang === "es" ? "Sesión" : "Session"}>
              <span className="text-primary">{trade.session}</span>
            </Detail>
          </dl>
        </motion.div>

        {/* Plan card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
          whileHover={{
            y: -2,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          }}
          className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full flex flex-col"
        >
          <Eyebrow className="mb-4">{t("plan")}</Eyebrow>
          <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4">
            <Detail label={t("initialStop")}>
              <span className="tnum text-pnl-neg">
                {fmtPrice(trade.initialStop, decimals, lang)}
              </span>
            </Detail>
            <Detail label={t("target")}>
              <span className="tnum text-pnl-pos">
                {fmtPrice(trade.target, decimals, lang)}
              </span>
            </Detail>
            <Detail label={t("plannedRr")}>
              <span className="tnum text-primary">
                {trade.plannedRr.toFixed(2)}R
              </span>
            </Detail>
            <Detail label={t("rr")}>
              <span
                className={`tnum font-medium ${
                  trade.rMultiple >= 0
                    ? "text-pnl-pos"
                    : "text-pnl-neg"
                }`}
              >
                {trade.rMultiple > 0 ? "+" : ""}
                {trade.rMultiple.toFixed(2)}R
              </span>
            </Detail>
          </dl>

          {/* Risk:Reward bar */}
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.15em] text-tertiary tnum">
              <span>
                {lang === "es" ? "Riesgo" : "Risk"} · 1R
              </span>
              <span>
                {lang === "es" ? "Recompensa" : "Reward"} ·{" "}
                {trade.plannedRr.toFixed(1)}R
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${riskFraction * 100}%` }}
                transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
                className="h-full bg-pnl-neg/80 shrink-0"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rewardFraction * 100}%` }}
                transition={{ duration: 0.9, delay: 1.0, ease: EASE }}
                className="h-full bg-pnl-pos/80 shrink-0"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== CONTEXT + REVIEW GRID ===== */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Context card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          whileHover={{
            y: -2,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          }}
          className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full flex flex-col"
        >
          <Eyebrow className="mb-4">{t("context")}</Eyebrow>
          <div className="space-y-3.5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1">
                {t("entryNote")}
              </div>
              <blockquote className="border-l-2 border-solid border-white/25 pl-3 py-1 text-sm text-secondary italic leading-relaxed">
                {trade.entryNote}
              </blockquote>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1">
                {t("manageNote")}
              </div>
              <blockquote className="border-l-2 border-solid border-white/25 pl-3 py-1 text-sm text-secondary italic leading-relaxed">
                {manageNote}
              </blockquote>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1">
                {t("closeNote")}
              </div>
              <blockquote className="border-l-2 border-solid border-white/25 pl-3 py-1 text-sm text-secondary italic leading-relaxed">
                {trade.closeNote}
              </blockquote>
            </div>
          </div>

          {/* Screenshots */}
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mb-2">
              {t("screenshots")}
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-md p-4 text-center text-xs text-tertiary mb-3 transition-colors hover:border-white/20 hover:bg-white/[0.02]">
              <svg
                className="mx-auto mb-2 opacity-60"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              {t("dropScreens")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-[4/3] rounded-md overflow-hidden liquid-glass border border-white/10 p-1.5">
                <MiniCandles seed={trade.id * 7 + 1} win={isWin} />
              </div>
              <div className="aspect-[4/3] rounded-md overflow-hidden liquid-glass border border-white/10 p-1.5">
                <MiniCandles seed={trade.id * 13 + 5} win={isWin} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
          whileHover={{
            y: -2,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          }}
          className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 h-full flex flex-col"
        >
          <Eyebrow className="mb-4">{t("review")}</Eyebrow>
          <p className="text-sm text-secondary mb-4">{t("followedPlan")}</p>

          {/* Toggle buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {(["yes", "partial", "no"] as Compliance[]).map((opt) => {
              const active = review === opt;
              const optTone =
                opt === "yes"
                  ? "text-pnl-pos"
                  : opt === "no"
                  ? "text-pnl-neg"
                  : "text-pnl-warn";
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReview(opt)}
                  aria-pressed={active}
                  className={`relative h-10 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "text-primary"
                      : "text-tertiary hover:text-secondary hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="review-pill"
                      className="absolute inset-0 rounded-md bg-white/5 border border-white/20"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className={`relative ${active ? optTone : ""}`}>
                    {t(opt)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-2.5 border-t border-white/10 pt-4">
            <SummaryRow
              label={t("rr")}
              tone={trade.rMultiple >= 0 ? "pos" : "neg"}
              value={`${trade.rMultiple > 0 ? "+" : ""}${trade.rMultiple.toFixed(2)}R`}
            />
            <SummaryRow
              label={t("grossPnl")}
              value={<Money value={trade.grossPnl} sign colorizeSign />}
            />
            <SummaryRow
              label={t("fees")}
              value={<Money value={-trade.fees} />}
            />
            <SummaryRow
              label={lang === "es" ? "P&L neto" : "Net P&L"}
              tone={trade.netPnl >= 0 ? "pos" : "neg"}
              value={<Money value={trade.netPnl} sign colorizeSign />}
            />
          </div>

          {/* Save button — MagneticButton for premium micro-interaction */}
          <div className="mt-auto pt-5">
            <MagneticButton
              type="button"
              strength={0.25}
              className="w-full h-11 rounded-md bg-white text-black font-medium text-sm transition-colors hover:bg-gray-100 inline-flex items-center justify-center"
            >
              {t("saveChanges")}
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
