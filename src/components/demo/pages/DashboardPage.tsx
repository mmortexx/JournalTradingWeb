"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  METRICS,
  INSTRUMENTS,
  SETUP_NAMES,
  INITIAL_BALANCE_CONST,
  type Direction,
  type Metrics,
} from "@/lib/trading/data";
import { addTrade, useAllTrades } from "@/lib/trading/demoStore";
import { useToast } from "@/hooks/use-toast";
import { fmtNum, fmtPct, fmtDate } from "@/lib/trading/format";
import { Reveal } from "@/components/tj/Reveal";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { Chip } from "@/components/tj/Chip";
import { EquityCurve } from "@/components/charts/EquityCurve";
import { MiniCalendar } from "@/components/charts/MiniCalendar";
import { MarketClock } from "@/components/tj/MarketClock";
import { useDemo } from "@/components/demo/DemoContext";

type CalcMethod =
  | "riskPercent"
  | "fixedUsd"
  | "forexLots"
  | "futuresContracts"
  | "entryStop";

const SIZING_MODES: CalcMethod[] = [
  "riskPercent",
  "fixedUsd",
  "forexLots",
  "futuresContracts",
  "entryStop",
];

// ES futures contract multiplier ($50 per point per contract).
const FUTURES_MULTIPLIER = 50;

// Equity-curve timeframe selector — filters the chart to the last N days
// of trades so the user can zoom into 1M / 3M / 6M windows. The sample
// data spans ~180 days, so "6M" is effectively "All".
type Timeframe = "1M" | "3M" | "6M";
const TIMEFRAMES: Timeframe[] = ["1M", "3M", "6M"];
const TF_DAYS: Record<Timeframe, number> = { "1M": 30, "3M": 90, "6M": 180 };

/** Slice a Metrics snapshot to the last N days of trades — keeps the
 *  equityCurve + drawdownCeiling arrays in sync so the chart redraws
 *  without changing the underlying sample data. Returns the original
 *  metrics object if the slice would be empty or cover everything. */
function sliceMetricsByDays(m: Metrics, days: number): Metrics {
  if (!m.equityCurve.length) return m;
  const last = m.equityCurve[m.equityCurve.length - 1].date.getTime();
  const cutoff = last - days * 86_400_000;
  let startIdx = 0;
  for (let i = 0; i < m.equityCurve.length; i++) {
    if (m.equityCurve[i].date.getTime() >= cutoff) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === 0) return m;
  const equityCurve = m.equityCurve.slice(startIdx);
  const drawdownCeiling = m.drawdownCeiling.slice(startIdx);
  return { ...m, equityCurve, drawdownCeiling };
}

// Asset-class color dots — shared with TradesPage for visual consistency.
const ASSET_DOT: Record<string, string> = {
  crypto: "bg-amber-400",
  forex: "bg-emerald-400",
  stock: "bg-rose-400",
  futures: "bg-teal-400",
};

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-md h-9 px-3 text-sm text-white tnum placeholder:text-gray-400 focus:border-white/20 focus:bg-white/8 transition-colors appearance-none";
const labelCls =
  "block text-[11px] uppercase tracking-[0.15em] text-gray-400 mb-1.5";

/**
 * Dashboard / "Resumen" page of the native Trading Journal app,
 * recreated for the browser demo. Captures the live trade-entry composer,
 * sizing rail, session KPI strip, performance block with equity curve,
 * and P&L calendar.
 */
export function DashboardPage() {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const { goDetail, setPage } = useDemo();
  const es = lang === "es";

  // ----- equity-curve timeframe -----
  const [tfSel, setTfSel] = useState<Timeframe>("6M");
  const slicedMetrics = useMemo(
    () => sliceMetricsByDays(METRICS, TF_DAYS[tfSel]),
    [tfSel]
  );

  // ----- recent trades (sample + custom, newest first) -----
  // useAllTrades subscribes to localStorage so trades logged via the
  // composer above appear here instantly without a manual refresh.
  const allTrades = useAllTrades(TRADES);
  const recentTrades = useMemo(() => allTrades.slice(0, 6), [allTrades]);

  // ----- composer form state -----
  const [direction, setDirection] = useState<Direction>("long");
  const [instrumentSymbol, setInstrumentSymbol] = useState(INSTRUMENTS[0].symbol);
  const [setupName, setSetupName] = useState<string>(SETUP_NAMES[1]);
  const [entry, setEntry] = useState<string>(
    INSTRUMENTS[0].basePrice.toFixed(INSTRUMENTS[0].decimals)
  );
  const [stop, setStop] = useState<string>(
    (INSTRUMENTS[0].basePrice * 0.992).toFixed(INSTRUMENTS[0].decimals)
  );
  const [exitPrice, setExitPrice] = useState<string>(
    (INSTRUMENTS[0].basePrice * 1.018).toFixed(INSTRUMENTS[0].decimals)
  );
  const [quantity, setQuantity] = useState<string>("1");
  const [calcMethod, setCalcMethod] = useState<CalcMethod>("riskPercent");
  const [riskValue, setRiskValue] = useState<string>("1");
  const [note, setNote] = useState<string>("");

  const inst =
    INSTRUMENTS.find((i) => i.symbol === instrumentSymbol) ?? INSTRUMENTS[0];

  const entryNum = parseFloat(entry) || 0;
  const stopNum = parseFloat(stop) || 0;
  const exitNum = parseFloat(exitPrice) || 0;
  const qtyNum = parseFloat(quantity) || 0;
  const riskValNum = parseFloat(riskValue) || 0;

  const stopDist = Math.abs(entryNum - stopNum);
  // realized R multiple = |exit - entry| / |entry - stop|
  const realizedR = stopDist > 0 ? Math.abs(exitNum - entryNum) / stopDist : 0;

  // ----- risk-$ calculation per selected sizing mode -----
  const riskUsd = useMemo(() => {
    switch (calcMethod) {
      case "riskPercent":
        return INITIAL_BALANCE_CONST * (riskValNum / 100);
      case "fixedUsd":
        return riskValNum;
      case "forexLots":
        // 1 standard lot = 100,000 units; risk = lots * notional * stopDist.
        return riskValNum * 100000 * stopDist;
      case "futuresContracts":
        // ES = $50/point per contract.
        return riskValNum * FUTURES_MULTIPLIER * stopDist;
      case "entryStop":
        // Direct: risk = stopDist * qty (forex qty is in units, multiply by 100k if lots).
        return stopDist * qtyNum * (inst.assetClass === "forex" ? 100000 : 1);
      default:
        return 0;
    }
  }, [calcMethod, riskValNum, stopDist, qtyNum, inst.assetClass]);

  // ----- handlers -----
  function handleRegister() {
    // Validate required fields: instrument, setup, direction, entry, stop.
    // (instrument/setup/direction are always set via dropdowns/toggles, so
    // the real validation is on entry & stop being positive, distinct numbers.)
    const entryN = parseFloat(entry);
    const stopN = parseFloat(stop);
    const exitParsed = parseFloat(exitPrice);
    // Exit isn't strictly required — fall back to entry so a missing exit
    // records a scratch trade (P&L = 0, R = 0) instead of NaN poisoning.
    const exitN = Number.isFinite(exitParsed) ? exitParsed : entryN;
    const qtyN = parseFloat(quantity);

    if (
      !Number.isFinite(entryN) ||
      entryN <= 0 ||
      !Number.isFinite(stopN) ||
      stopN <= 0 ||
      entryN === stopN
    ) {
      toast({
        title: t("tradeRegisterError"),
        description: t("tradeRegisterErrorDesc"),
        variant: "destructive",
      });
      return;
    }

    // Calculate realized P&L and R-multiple.
    // priceDiff is signed: positive for a winning move, negative for a loser.
    const stopDist = Math.abs(entryN - stopN);
    const priceDiff =
      direction === "long" ? exitN - entryN : entryN - exitN;
    const rMultiple = stopDist > 0 ? +(priceDiff / stopDist).toFixed(2) : 0;

    // Position-value multiplier per asset class — matches demoStore.ts.
    const multiplier =
      inst.assetClass === "forex"
        ? 100_000
        : inst.assetClass === "futures"
        ? FUTURES_MULTIPLIER
        : 1;
    const safeQty = Number.isFinite(qtyN) && qtyN > 0 ? qtyN : 1;
    const netPnl = +(priceDiff * safeQty * multiplier).toFixed(2);

    addTrade({
      instrument: instrumentSymbol,
      setup: setupName as (typeof SETUP_NAMES)[number],
      direction,
      entry: +entryN.toFixed(inst.decimals),
      exit: +exitN.toFixed(inst.decimals),
      qty: +safeQty.toFixed(inst.assetClass === "forex" ? 2 : 3),
      netPnl,
      rMultiple,
      // A trade logged with a defined stop = followed plan, by convention.
      compliance: "yes",
      closedAt: new Date().toISOString(),
      note: note.trim(),
    });

    setNote("");

    toast({
      title: t("tradeRegistered"),
      description: t("tradeRegisteredDesc"),
    });
  }

  function selectInstrument(sym: string) {
    const next = INSTRUMENTS.find((i) => i.symbol === sym);
    if (!next) return;
    setInstrumentSymbol(sym);
    setEntry(next.basePrice.toFixed(next.decimals));
    setStop((next.basePrice * 0.992).toFixed(next.decimals));
    setExitPrice((next.basePrice * 1.018).toFixed(next.decimals));
  }

  // risk-value field label per calc method
  const riskValueLabel =
    calcMethod === "entryStop"
      ? es
        ? "Calculado"
        : "Computed"
      : t(calcMethod);

  return (
    <div className="p-5 md:p-6 space-y-5 relative">
      {/* ============ 1. CAPTURE COMPOSER ============ */}
      <section className="relative">
        <Reveal delay={0}>
          <Eyebrow>{t("captureEyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={0.04}>
          <h1 className="mt-2 font-medium tracking-[-0.02em] text-white text-2xl md:text-[28px] leading-tight">
            {t("captureHeadline")}
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <motion.div
            className="liquid-glass depth-3 hover:shadow-[0_6px_14px_rgb(0_0_0_/_0.32),0_24px_56px_rgb(0_0_0_/_0.36),0_0_44px_rgb(255_255_255_/_0.08)] transition-shadow duration-300 rounded-card p-5 md:p-6 mt-4 relative overflow-hidden"
          >
            <div className="relative z-10">
              {/* Top row: direction toggle + live risk readout */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                {/* Direction toggle with sliding pill */}
                <div>
                  <span className={labelCls}>
                    {es ? "Dirección" : "Direction"}
                  </span>
                  <div
                    className="relative inline-flex bg-white/5 border border-white/10 rounded-md p-0.5"
                    role="radiogroup"
                    aria-label={es ? "Dirección" : "Direction"}
                  >
                    {(["long", "short"] as Direction[]).map((d) => {
                      const active = direction === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setDirection(d)}
                          className={`relative px-4 h-8 rounded text-sm font-medium transition-colors ${
                            active
                              ? "text-white"
                              : "text-gray-400 hover:text-gray-300"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="dir-pill"
                              className={`absolute inset-0 rounded ${
                                d === "long"
                                  ? "bg-pnl-pos/15 border border-pnl-pos/30"
                                  : "bg-pnl-neg/15 border border-pnl-neg/30"
                              }`}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 32,
                              }}
                            />
                          )}
                          <span className="relative flex items-center gap-1.5">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden="true"
                            >
                              {d === "long" ? (
                                <path
                                  d="M3 12L8 4l5 8"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              ) : (
                                <path
                                  d="M3 4l5 8 5-8"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}
                            </svg>
                            {t(d)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live risk-$ readout */}
                <div className="md:text-right min-w-0 md:min-w-[160px]">
                  <span className={labelCls}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-flex w-1.5 h-1.5 rounded-full bg-white" />
                      {t("riskUsd")}
                    </span>
                  </span>
                  <motion.div
                    key={`risk-${riskUsd.toFixed(2)}`}
                    initial={{ opacity: 0.55, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="text-3xl md:text-4xl font-bold tnum text-white leading-none"
                  >
                    <Money value={riskUsd} />
                  </motion.div>
                  <div className="mt-1.5 md:flex md:justify-end">
                    <span className="pill bg-white/5 text-gray-400 border border-white/10">
                      {t(calcMethod)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Instrument */}
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="d-inst" className={labelCls}>
                    {t("instrument")}
                  </label>
                  <div className="relative">
                    <select
                      id="d-inst"
                      value={instrumentSymbol}
                      onChange={(e) => selectInstrument(e.target.value)}
                      className={`${inputCls} pr-8 cursor-pointer`}
                    >
                      {INSTRUMENTS.map((i) => (
                        <option key={i.symbol} value={i.symbol}>
                          {i.symbol}
                        </option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                {/* Setup */}
                <div className="col-span-2 md:col-span-2">
                  <label htmlFor="d-setup" className={labelCls}>
                    {t("setup")}
                  </label>
                  <div className="relative">
                    <select
                      id="d-setup"
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      className={`${inputCls} pr-8 cursor-pointer`}
                    >
                      {SETUP_NAMES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </div>

                {/* Entry */}
                <div>
                  <label htmlFor="d-entry" className={labelCls}>
                    {es ? "Entrada" : "Entry"}
                  </label>
                  <input
                    id="d-entry"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Stop */}
                <div>
                  <label htmlFor="d-stop" className={labelCls}>
                    {es ? "Stop" : "Stop"}
                  </label>
                  <input
                    id="d-stop"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={stop}
                    onChange={(e) => setStop(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Exit */}
                <div>
                  <label htmlFor="d-exit" className={labelCls}>
                    {t("exit")}
                  </label>
                  <input
                    id="d-exit"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="d-qty" className={labelCls}>
                    {t("quantity")}
                  </label>
                  <input
                    id="d-qty"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Risk value (per calc method) */}
                <div>
                  <label htmlFor="d-risk" className={labelCls}>
                    {riskValueLabel}
                  </label>
                  <input
                    id="d-risk"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={calcMethod === "entryStop" ? "—" : riskValue}
                    disabled={calcMethod === "entryStop"}
                    onChange={(e) => setRiskValue(e.target.value)}
                    className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>

                {/* RR (computed) */}
                <div>
                  <span className={labelCls}>{t("rr")}</span>
                  <div className="h-9 px-3 flex items-center justify-between rounded-md bg-white/5 border border-white/10">
                    <span
                      className={`text-sm font-medium tnum ${
                        realizedR >= 2
                          ? "text-pnl-pos"
                          : realizedR >= 1
                          ? "text-pnl-warn"
                          : "text-pnl-neg"
                      }`}
                    >
                      {fmtNum(realizedR, lang, 2)}R
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {es ? "realizado" : "realized"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calc method segmented control */}
              <div className="mt-4">
                <span className={labelCls}>{t("calcMethod")}</span>
                <div className="flex flex-wrap gap-1 bg-white/5 border border-white/10 rounded-md p-1">
                  {SIZING_MODES.map((m) => {
                    const active = calcMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCalcMethod(m)}
                        aria-pressed={active}
                        className={`relative px-3 h-7 rounded text-xs font-medium transition-colors ${
                          active
                            ? "text-white"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="calc-pill"
                            className="absolute inset-0 rounded bg-white/10 border border-white/20"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative">{t(m)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drop screenshots + note */}
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <div className="min-w-0 flex flex-col">
                  <span className={labelCls}>
                    {es ? "Capturas" : "Screenshots"}
                  </span>
                  <button
                    type="button"
                    aria-label={t("dropScreens")}
                    className="w-full border border-dashed border-white/10 rounded-md p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-300 hover:border-white/25 hover:bg-white/5 transition-colors min-h-[96px] cursor-pointer group"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="group-hover:scale-110 transition-transform"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-xs text-center leading-snug">
                      {t("dropScreens")}
                    </span>
                  </button>
                </div>

                <div className="min-w-0 flex flex-col">
                  <label htmlFor="d-note" className={labelCls}>
                    {es ? "Nota" : "Note"}
                  </label>
                  <textarea
                    id="d-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("notePlaceholder")}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-white/20 focus:bg-white/8 transition-colors resize-none min-h-[96px] flex-1"
                    aria-label={t("notePlaceholder")}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  onClick={handleRegister}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="h-9 px-4 rounded-md bg-white text-black font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 8h10M8 3v10" />
                  </svg>
                  {t("registerTrade")}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="h-9 px-4 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium text-sm flex items-center gap-2 hover:bg-white/8 hover:text-white transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3h8l3 3v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z" />
                    <path d="M5 3v3h5V3M5 11h6V8H5z" />
                  </svg>
                  {t("saveDraft")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* ============ 2. LIVE MARKET CLOCK ============ */}
      <Reveal delay={0.05}>
        <MarketClock compact />
      </Reveal>

      {/* ============ 3. KPI STRIP ============ */}
      <section>
        <Reveal delay={0.05}>
          <Eyebrow>{t("performance")}</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-2 mb-4 font-medium tracking-[-0.02em] text-primary text-xl md:text-2xl leading-tight">
            {t("performanceTitle")}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Net P&L */}
            <KpiTile
              label={t("pnlTotal")}
              delta={
                <DeltaTone
                  value={METRICS.roiPct}
                  fmt={(v) => fmtPct(v, lang, 1)}
                />
              }
            >
              <Money
                value={METRICS.netPnl}
                sign
                colorizeSign
                className="text-2xl md:text-3xl font-bold"
              />
            </KpiTile>
            {/* Win Rate */}
            <KpiTile
              label={t("winRate")}
              delta={
                <DeltaTone
                  value={METRICS.winRate - 0.5}
                  fmt={(v) =>
                    `${v >= 0 ? "+" : "−"}${fmtPct(Math.abs(v), lang, 1)} ${es ? "vs 50%" : "vs 50%"}`
                  }
                />
              }
            >
              <CountUp
                to={METRICS.winRate * 100}
                decimals={1}
                suffix="%"
                tone={METRICS.winRate >= 0.5 ? "pos" : "neg"}
                className="text-2xl md:text-3xl font-bold"
              />
            </KpiTile>
            {/* Expectancy */}
            <KpiTile
              label={t("expectancy")}
              delta={
                <DeltaTone
                  value={METRICS.expectancyR}
                  fmt={(v) =>
                    `${v >= 0 ? "+" : "−"}${fmtNum(Math.abs(v), lang, 2)}R / ${es ? "trade" : "trade"}`
                  }
                />
              }
            >
              <Money
                value={METRICS.expectancy}
                sign
                colorizeSign
                className="text-2xl md:text-3xl font-bold"
              />
            </KpiTile>
            {/* Profit Factor */}
            <KpiTile
              label={t("profitFactor")}
              delta={
                <DeltaTone
                  value={METRICS.profitFactor - 1}
                  fmt={(v) =>
                    `${v >= 0 ? "+" : "−"}${fmtNum(Math.abs(v), lang, 2)} ${es ? "vs 1.0" : "vs 1.0"}`
                  }
                />
              }
            >
              <CountUp
                to={METRICS.profitFactor}
                decimals={2}
                tone={METRICS.profitFactor >= 1 ? "pos" : "neg"}
                className="text-2xl md:text-3xl font-bold"
              />
            </KpiTile>
            {/* Total Trades */}
            <KpiTile
              label={es ? "Operaciones" : "Trades"}
              delta={
                <span className="text-[10px] tnum text-tertiary">
                  {METRICS.wins}{es ? "G" : "W"} · {METRICS.losses}{es ? "P" : "L"}
                </span>
              }
            >
              <CountUp
                to={METRICS.closedCount}
                decimals={0}
                className="text-2xl md:text-3xl font-bold text-primary"
              />
            </KpiTile>
            {/* Avg R */}
            <KpiTile
              label={es ? "R medio" : "Avg R"}
              delta={
                <DeltaTone
                  value={METRICS.expectancyR}
                  fmt={() =>
                    METRICS.expectancyR > 0
                      ? es ? "Positivo" : "Positive"
                      : METRICS.expectancyR < 0
                      ? es ? "Negativo" : "Negative"
                      : "—"
                  }
                />
              }
            >
              <CountUp
                to={METRICS.expectancyR}
                decimals={2}
                suffix="R"
                tone={METRICS.expectancyR >= 0 ? "pos" : "neg"}
                className="text-2xl md:text-3xl font-bold"
              />
            </KpiTile>
          </div>
        </Reveal>
      </section>

      {/* ============ 4. EQUITY CURVE + P&L CALENDAR ============ */}
      <section className="grid lg:grid-cols-3 gap-4 md:gap-5">
        {/* Equity curve card (2/3) */}
        <Reveal delay={0.1} className="lg:col-span-2">
          <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 relative overflow-hidden h-full">
            {/* Soft accent wash — a single blurred radial behind the chart
                so the card has depth without a second <canvas> (the
                composer already runs MarketBackground; the "max 1 canvas
                per demo page" polish rule is preserved). */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 w-[320px] h-[320px] rounded-full blur-[120px] opacity-[0.12] bg-white"
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
                    {es ? "Curva de capital" : "Equity curve"}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    <Money
                      value={METRICS.finalBalance}
                      compact
                      className="text-2xl font-bold text-primary"
                    />
                    <span
                      className={`text-xs tnum ${
                        METRICS.roiPct >= 0 ? "text-pnl-pos" : "text-pnl-neg"
                      }`}
                    >
                      {fmtPct(METRICS.roiPct, lang, 1)}
                    </span>
                  </div>
                </div>
                {/* Timeframe selector pills — 1M / 3M / 6M. Slices the
                    equityCurve + drawdownCeiling arrays via
                    sliceMetricsByDays so the chart redraws to the
                    selected window. Shared-layout active pill animates
                    between selections. */}
                <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-md p-0.5">
                  {TIMEFRAMES.map((mode) => {
                    const active = tfSel === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTfSel(mode)}
                        aria-pressed={active}
                        className={`relative px-2.5 h-6 rounded text-[11px] font-medium tnum transition-colors ${
                          active
                            ? "text-primary"
                            : "text-tertiary hover:text-secondary"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="tf-pill"
                            className="absolute inset-0 rounded bg-white/10 border border-white/15"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative">{mode}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <EquityCurve metrics={slicedMetrics} height={240} />
            </div>
          </div>
        </Reveal>

        {/* P&L calendar (1/3) — MiniCalendar renders its own
            liquid-glass card with month header + nav arrows + daily
            P&L heat-map cells. */}
        <Reveal delay={0.14} className="lg:col-span-1">
          <MiniCalendar trades={TRADES} className="h-full" />
        </Reveal>
      </section>

      {/* ============ 5. RECENT TRADES ============ */}
      <Reveal delay={0.1}>
        <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-baseline justify-between mb-4 gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
                  {es ? "Operaciones recientes" : "Recent trades"}
                </div>
                <div className="mt-1 text-primary font-medium text-base">
                  {es ? "Últimas 6 operaciones" : "Last 6 trades"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPage("trades")}
                className="text-xs text-tertiary hover:text-primary transition-colors flex items-center gap-1"
              >
                {es ? "Ver todas" : "See all"}
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {recentTrades.map((tr, i) => {
                const inst = INSTRUMENTS.find((x) => x.symbol === tr.instrument);
                const dotClass = ASSET_DOT[inst?.assetClass ?? "stock"] ?? "bg-white";
                return (
                  <motion.button
                    key={tr.id}
                    type="button"
                    onClick={() => goDetail(tr.id)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(i * 0.04, 0.24),
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group w-full flex items-center gap-3 py-2.5 hover:bg-white/5 -mx-2 px-2 rounded-md transition-colors text-left"
                  >
                    {/* Instrument + asset-class dot */}
                    <div className="flex items-center gap-2 min-w-0 w-[110px] shrink-0">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass}`}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-primary truncate">
                        {tr.instrument}
                      </span>
                    </div>
                    {/* Direction chip */}
                    <div className="shrink-0">
                      <Chip variant={tr.direction === "long" ? "pos" : "neg"}>
                        {tr.direction === "long" ? t("long") : t("short")}
                      </Chip>
                    </div>
                    {/* Setup — hidden on mobile */}
                    <div className="hidden md:block text-xs text-tertiary truncate flex-1 min-w-0">
                      {tr.setup}
                    </div>
                    {/* Closed date — hidden on mobile */}
                    <div className="hidden sm:block text-xs tnum text-tertiary shrink-0">
                      {fmtDate(tr.closedAt, lang)}
                    </div>
                    {/* R multiple */}
                    <div
                      className={`text-xs tnum font-medium shrink-0 w-12 text-right ${
                        tr.rMultiple > 0
                          ? "text-pnl-pos"
                          : tr.rMultiple < 0
                          ? "text-pnl-neg"
                          : "text-tertiary"
                      }`}
                    >
                      {fmtNum(tr.rMultiple, lang, 2)}R
                    </div>
                    {/* Net P&L */}
                    <div className="shrink-0 w-24 text-right">
                      <Money
                        value={tr.netPnl}
                        sign
                        colorizeSign
                        className="text-sm font-medium"
                      />
                    </div>
                    {/* Chevron — desktop only */}
                    <svg
                      className="hidden md:block text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/** Compact KPI tile with label, big value, and delta indicator.
 *  Liquid-glass surface with depth-1 → depth-2 hover lift. The delta
 *  row (optional) sits at the bottom via mt-auto so all tiles in a row
 *  align their deltas on the same baseline regardless of value height. */
function KpiTile({
  label,
  children,
  delta,
}: {
  label: string;
  children: ReactNode;
  delta?: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      className="liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card p-4 flex flex-col gap-1.5 h-full"
    >
      <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary truncate">
        {label}
      </div>
      <div className="min-w-0 tnum">{children}</div>
      {delta && <div className="mt-auto pt-1 text-[10px] tnum">{delta}</div>}
    </motion.div>
  );
}

/** Delta indicator — colors green/red based on the sign of `value` and
 *  renders a small up/down triangle arrow alongside the formatted text.
 *  Used in the KPI strip to show ROI %, vs-50% delta, vs-1.0 delta, etc. */
function DeltaTone({
  value,
  fmt,
}: {
  value: number;
  fmt: (v: number) => string;
}) {
  const tone = value > 0 ? "pos" : value < 0 ? "neg" : "neutral";
  const cls =
    tone === "pos"
      ? "text-pnl-pos"
      : tone === "neg"
      ? "text-pnl-neg"
      : "text-tertiary";
  return (
    <span className={`inline-flex items-center gap-1 ${cls}`}>
      {tone === "pos" && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M5 2l3 4H2l3-4z" fill="currentColor" />
        </svg>
      )}
      {tone === "neg" && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M5 8l3-4H2l3 4z" fill="currentColor" />
        </svg>
      )}
      <span>{fmt(value)}</span>
    </span>
  );
}

/** Native-select chevron overlay (since appearance-none strips it). */
function ChevronDown() {
  return (
    <span
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
