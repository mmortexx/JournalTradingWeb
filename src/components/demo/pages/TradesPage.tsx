"use client";

import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  computeMetrics,
  INSTRUMENTS,
} from "@/lib/trading/data";
import {
  customTradeToTrade,
  deleteTrade,
  useCustomTrades,
} from "@/lib/trading/demoStore";
import { useToast } from "@/hooks/use-toast";
import {
  fmtNum,
  fmtPrice,
  fmtDate,
  fmtDuration,
} from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";
import { useDemo } from "@/components/demo/DemoContext";

const DECIMALS: Record<string, number> = Object.fromEntries(
  INSTRUMENTS.map((i) => [i.symbol, i.decimals])
);

const ASSET_DOT: Record<string, string> = {
  crypto: "bg-amber-400",
  forex: "bg-emerald-400",
  stock: "bg-rose-400",
  futures: "bg-teal-400",
};

const ASSET_LABEL: Record<string, { es: string; en: string }> = {
  crypto: { es: "Cripto", en: "Crypto" },
  forex: { es: "Forex", en: "Forex" },
  stock: { es: "Acciones", en: "Stock" },
  futures: { es: "Futuros", en: "Futures" },
};

const PAGE_SIZE = 20;

type FilterGroup = "instrument" | "direction" | "compliance";

/** Memoized trade row — re-renders only when its own trade or lang changes.
 *  Reads `t`/`lang` from context so React.memo can skip work when the parent
 *  re-renders for unrelated reasons (e.g. search query, visibleCount).
 *
 *  Polish: rows use a clean hover bg tint + an accent inset stripe on hover
 *  so the click affordance is unmistakable. P&L is wrapped in a `PnlCell`
 *  component keyed to the current filter signature — every filter change
 *  re-mounts it and plays a brief color flash so the user gets visual
 *  feedback that the data set changed. */
const TradeRow = memo(function TradeRow({
  trade,
  index,
  isCustom,
  goDetail,
  onDelete,
  confirmingId,
  setConfirmingId,
  filterSig,
}: {
  trade: (typeof TRADES)[number];
  index: number;
  isCustom: boolean;
  goDetail: (tradeId: number) => void;
  onDelete: (tradeId: number) => void;
  confirmingId: number | null;
  setConfirmingId: (id: number | null) => void;
  filterSig: string;
}) {
  const { t, lang } = useLang();
  const decimals = DECIMALS[trade.instrument] ?? 2;
  const inst = INSTRUMENTS.find((x) => x.symbol === trade.instrument);
  const dotClass =
    ASSET_DOT[inst?.assetClass ?? "stock"] ?? "bg-white";
  const assetLabel =
    ASSET_LABEL[inst?.assetClass ?? "stock"]?.[lang] ?? "";
  const isConfirming = confirmingId === trade.id;

  return (
    <motion.tr
      key={trade.id}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        delay: Math.min(index * 0.025, 0.4),
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => !isConfirming && goDetail(trade.id)}
      className={`group relative cursor-pointer border-b border-white/[0.06] last:border-b-0 even:bg-white/[0.02] hover:bg-white/[0.06] hover:shadow-[inset_2px_0_0_0_rgb(var(--accent-base))] transition-[background-color,box-shadow] duration-150 ${
        isConfirming ? "bg-pnl-neg/10" : ""
      }`}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass}`}
            aria-hidden="true"
            title={assetLabel}
          />
          <span className="font-medium text-primary">
            {trade.instrument}
          </span>
          {isCustom && (
            <span
              className="text-[9px] uppercase tracking-[0.15em] font-semibold text-primary border border-white/20 rounded-sm px-1 py-px"
              title={t("customTradeBadge")}
            >
              {t("customTradeBadge")}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <Chip variant={trade.direction === "long" ? "pos" : "neg"}>
          {trade.direction === "long" ? t("long") : t("short")}
        </Chip>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-secondary">
        {trade.setup}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-tertiary text-xs">
        {trade.session}
      </td>
      <td className="px-4 py-3 whitespace-nowrap tnum text-secondary">
        {fmtPrice(trade.entry, decimals, lang)}
        <span className="text-tertiary mx-1.5" aria-hidden="true">→</span>
        {fmtPrice(trade.exit, decimals, lang)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap tnum text-secondary">
        {trade.durationMin > 0
          ? fmtDuration(trade.durationMin, lang)
          : "—"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-tertiary tnum text-xs">
        {fmtDate(trade.closedAt, lang)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <PnlCell value={trade.netPnl} filterSig={filterSig} />
      </td>
      <td
        className={`px-4 py-3 whitespace-nowrap text-right tnum font-medium ${
          trade.rMultiple > 0
            ? "text-pnl-pos"
            : trade.rMultiple < 0
            ? "text-pnl-neg"
            : "text-secondary"
        }`}
      >
        {fmtNum(trade.rMultiple, lang, 2)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center justify-between gap-1.5">
          {trade.compliance === "yes" && (
            <Chip variant="pos">{t("yes")}</Chip>
          )}
          {trade.compliance === "partial" && (
            <Chip variant="warn">{t("partial")}</Chip>
          )}
          {trade.compliance === "no" && (
            <Chip variant="neg">{t("no")}</Chip>
          )}

          {/* Delete control — only on custom trades. Sample trades are
              immutable (deterministic) so no affordance is shown. */}
          {isCustom &&
            (isConfirming ? (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] text-tertiary mr-0.5 whitespace-nowrap">
                  {t("deleteConfirm")}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(trade.id);
                    setConfirmingId(null);
                  }}
                  aria-label={t("confirmDelete")}
                  className="h-6 px-2 rounded text-[11px] font-semibold bg-pnl-neg/20 text-pnl-neg border border-pnl-neg/40 hover:bg-pnl-neg/30 transition-colors"
                >
                  {t("confirmDelete")}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingId(null);
                  }}
                  aria-label={t("cancelDelete")}
                  className="h-6 px-2 rounded text-[11px] font-medium bg-white/5 text-tertiary border border-white/10 hover:bg-white/8 hover:text-secondary transition-colors"
                >
                  {t("cancelDelete")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmingId(trade.id);
                }}
                aria-label={t("deleteTrade")}
                title={t("deleteTrade")}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity duration-150 h-6 w-6 grid place-items-center rounded text-tertiary hover:text-pnl-neg hover:bg-pnl-neg/15 border border-transparent hover:border-pnl-neg/30"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
                </svg>
              </button>
            ))}
        </div>
      </td>
    </motion.tr>
  );
});

/** P&L cell — keyed to the current filter signature so it re-mounts (and
 *  plays a brief color-flash animation) every time the user applies or
 *  clears a filter. The flash is a soft bloom of the value's tone color
 *  that fades to transparent, hinting that the data set just changed. */
const PnlCell = memo(function PnlCell({
  value,
  filterSig,
}: {
  value: number;
  filterSig: string;
}) {
  const tone = value > 0 ? "pos" : value < 0 ? "neg" : "neutral";
  // Use literal rgb triple for the neutral flash (gray-400) so no
  // tertiary-token reference leaks into the inline style. pos/neg stay
  // wired to the theme's --pnl-pos / --pnl-neg tokens.
  const colorTriple =
    tone === "pos"
      ? "var(--pnl-pos)"
      : tone === "neg"
      ? "var(--pnl-neg)"
      : "156 163 175";
  return (
    <span className="relative inline-block">
      {/* Flash bloom — keyed to filterSig so it remounts on every filter
          change. Sits behind the value, fades out, never intercepts clicks. */}
      <motion.span
        key={`flash-${filterSig}-${value}`}
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 -inset-y-0.5 rounded-md"
        style={{
          backgroundColor: `rgb(${colorTriple})`,
        }}
        initial={{ opacity: 0.28 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        key={value}
        initial={{ opacity: 0.4, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative inline-block"
      >
        <Money
          value={value}
          colorizeSign
          sign
          className="text-sm font-medium"
        />
      </motion.span>
    </span>
  );
});

/** Small animated filter chip with shared-layout active background. */
function FilterChip({
  active,
  onClick,
  children,
  group,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  group: FilterGroup;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      whileTap={{ scale: 0.96 }}
      className="relative inline-flex items-center"
    >
      {active && (
        <motion.span
          layoutId={`trade-filter-${group}`}
          className="pointer-events-none absolute inset-0 rounded-full border border-white/20 bg-white/8"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Chip
        variant={active ? "accent" : "default"}
        className="relative"
      >
        {children}
      </Chip>
    </motion.button>
  );
}

/** Single KPI card in the summary strip. Re-keyed on filterSig so the
 *  CountUp re-plays from 0 every time the user applies or clears a filter.
 *  Subtle hover lift (y: -2) matches the R3-b KpiTile cadence — small
 *  enough that the row stays readable, present enough to confirm the tile
 *  is interactive. */
function KpiCard({
  label,
  filterSig,
  children,
}: {
  label: string;
  filterSig: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 24 },
      }}
      className="liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card p-4 h-full flex flex-col gap-1.5"
    >
      <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary truncate">
        {label}
      </div>
      <div className="font-bold text-2xl md:text-3xl tnum text-primary leading-none">
        {/* key on filterSig so the inner CountUp re-mounts (and replays its
            count-up animation) every time the visible data set changes */}
        <span key={filterSig}>{children}</span>
      </div>
    </motion.div>
  );
}

export function TradesPage() {
  const { t, tf, lang } = useLang();
  const { toast } = useToast();
  const { filters, setFilters, clearFilters, goDetail } = useDemo();
  const customTrades = useCustomTrades();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  // Merge sample trades with any custom trades the user has logged from the
  // Dashboard composer. Custom trades are converted to full Trade objects
  // so the existing row/metric code consumes them unchanged.
  const customIds = useMemo(
    () => new Set(customTrades.map((c) => c.id)),
    [customTrades]
  );
  const allTrades = useMemo(() => {
    const mapped = customTrades.map(customTradeToTrade);
    return [...TRADES, ...mapped].sort(
      (a, b) => b.closedAt.getTime() - a.closedAt.getTime()
    );
  }, [customTrades]);

  // Debounce the search input 150 ms; on each new query we also reset the
  // "load more" window. setState inside the timeout callback is async, so
  // it doesn't trigger the synchronous-set-state-in-effect lint rule.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(query);
      setVisibleCount(PAGE_SIZE);
    }, 150);
    return () => clearTimeout(id);
  }, [query]);

  // Wrap the context's setFilters so chip clicks also reset the window.
  const handleSetFilters = (f: Parameters<typeof setFilters>[0]) => {
    setFilters(f);
    setVisibleCount(PAGE_SIZE);
  };

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return allTrades.filter((tr) => {
      if (filters.instrument !== "all" && tr.instrument !== filters.instrument) return false;
      if (filters.direction !== "all" && tr.direction !== filters.direction) return false;
      if (filters.compliance === "yes" && tr.compliance !== "yes") return false;
      if (filters.compliance === "no" && tr.compliance === "yes") return false;
      if (q) {
        const hay =
          `${tr.instrument} ${tr.setup} ${tr.entryNote} ${tr.closeNote}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allTrades, debounced, filters.instrument, filters.direction, filters.compliance]);

  const metrics = useMemo(() => computeMetrics(filtered), [filtered]);

  const shown = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const filterActive =
    filters.instrument !== "all" ||
    filters.direction !== "all" ||
    filters.compliance !== "all" ||
    debounced.trim() !== "";

  // Signature that changes on every filter / search update. Passed down
  // to TradeRow → PnlCell so the cell's flash bloom re-fires when the
  // visible data set changes.
  const filterSig = `${filters.instrument}|${filters.direction}|${filters.compliance}|${debounced.trim()}`;

  const totalPnl = metrics.netPnl;
  const totalR =
    filtered.length > 0
      ? filtered.reduce((s, tr) => s + tr.rMultiple, 0) / filtered.length
      : 0;

  const resetAll = () => {
    clearFilters();
    setQuery("");
  };

  function handleDelete(tradeId: number) {
    const ok = deleteTrade(tradeId);
    if (ok) {
      toast({ title: t("tradeDeleted") });
      // If the row we're confirming is removed, drop the confirm state too.
      setConfirmingId((cur) => (cur === tradeId ? null : cur));
    }
  }

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* ===== Header ===== */}
      <div className="relative overflow-hidden liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card p-5">
        <Reveal className="relative">
          <Eyebrow>{t("tradesEyebrow")}</Eyebrow>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mt-2">
            <div>
              <h2 className="font-medium tracking-[-0.02em] text-primary text-2xl md:text-3xl">
                {t("tradesTitle")}
              </h2>
              <p className="text-sm text-tertiary mt-1">
                {tf("tradesCount", filtered.length)}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="bg-white/5 border border-white/10 rounded-md h-9 pl-9 pr-3 text-sm w-full text-primary placeholder:text-tertiary focus:outline-none focus:border-white/25 focus:bg-white/8 transition-colors"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {/* Instrument */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary mr-1">
                {t("colInstrument")}
              </span>
              <FilterChip
                active={filters.instrument === "all"}
                onClick={() => handleSetFilters({ instrument: "all" })}
                group="instrument"
                label={t("all")}
              >
                {t("all")}
              </FilterChip>
              {INSTRUMENTS.map((inst) => (
                <FilterChip
                  key={inst.symbol}
                  active={filters.instrument === inst.symbol}
                  onClick={() => handleSetFilters({ instrument: inst.symbol })}
                  group="instrument"
                  label={inst.symbol}
                >
                  {inst.symbol}
                </FilterChip>
              ))}
            </div>

            <span className="hidden md:inline-block w-px h-4 bg-white/10 mx-1" aria-hidden="true" />

            {/* Direction */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary mr-1">
                {t("direction")}
              </span>
              <FilterChip
                active={filters.direction === "all"}
                onClick={() => handleSetFilters({ direction: "all" })}
                group="direction"
                label={t("all")}
              >
                {t("all")}
              </FilterChip>
              <FilterChip
                active={filters.direction === "long"}
                onClick={() => handleSetFilters({ direction: "long" })}
                group="direction"
                label={t("long")}
              >
                {t("long")}
              </FilterChip>
              <FilterChip
                active={filters.direction === "short"}
                onClick={() => handleSetFilters({ direction: "short" })}
                group="direction"
                label={t("short")}
              >
                {t("short")}
              </FilterChip>
            </div>

            <span className="hidden md:inline-block w-px h-4 bg-white/10 mx-1" aria-hidden="true" />

            {/* Compliance */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary mr-1">
                {t("compliance")}
              </span>
              <FilterChip
                active={filters.compliance === "all"}
                onClick={() => handleSetFilters({ compliance: "all" })}
                group="compliance"
                label={t("all")}
              >
                {t("all")}
              </FilterChip>
              <FilterChip
                active={filters.compliance === "yes"}
                onClick={() => handleSetFilters({ compliance: "yes" })}
                group="compliance"
                label={t("complied")}
              >
                {t("complied")}
              </FilterChip>
              <FilterChip
                active={filters.compliance === "no"}
                onClick={() => handleSetFilters({ compliance: "no" })}
                group="compliance"
                label={t("notComplied")}
              >
                {t("notComplied")}
              </FilterChip>
            </div>

            {filterActive && (
              <button
                type="button"
                onClick={resetAll}
                className="ml-auto text-xs text-tertiary hover:text-secondary transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                aria-label={t("clearFilters")}
              >
                ✕ {t("clearFilters")}
              </button>
            )}
          </div>
        </Reveal>
      </div>

      {/* ===== KPI strip — re-keyed on filterSig so every CountUp replays ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={t("pnlTotal")} filterSig={filterSig}>
          <CountUp
            to={Math.abs(totalPnl)}
            decimals={2}
            prefix={totalPnl < 0 ? "−$" : "$"}
            tone={totalPnl > 0 ? "pos" : totalPnl < 0 ? "neg" : "neutral"}
          />
        </KpiCard>
        <KpiCard label={t("winRate")} filterSig={filterSig}>
          <CountUp
            to={metrics.winRate * 100}
            decimals={1}
            suffix="%"
          />
        </KpiCard>
        <KpiCard label={t("operations")} filterSig={filterSig}>
          <CountUp
            to={metrics.closedCount}
            decimals={0}
          />
        </KpiCard>
        <KpiCard label={t("expectancyR")} filterSig={filterSig}>
          <CountUp
            to={metrics.expectancyR}
            decimals={2}
            prefix="R "
            tone={metrics.expectancyR > 0 ? "pos" : "neg"}
          />
        </KpiCard>
      </div>

      {/* ===== Table ===== */}
      <div className="liquid-glass depth-2 hover:depth-3 transition-shadow duration-300 rounded-card overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 liquid-glass border-b border-white/10">
              <tr className="text-left">
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("colInstrument")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("direction")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("colSetup")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {lang === "es" ? "Sesión" : "Session"}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("entry")} → {t("exit")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("colDuration")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("colClosed")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap text-right">
                  {t("colNetPnl")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap text-right">
                  {t("colR")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-tertiary text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("compliance")}
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((trade, i) => (
                  <TradeRow
                    key={trade.id}
                    trade={trade}
                    index={i}
                    isCustom={customIds.has(trade.id)}
                    goDetail={goDetail}
                    onDelete={handleDelete}
                    confirmingId={confirmingId}
                    setConfirmingId={setConfirmingId}
                    filterSig={filterSig}
                  />
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-tertiary"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      <p className="text-secondary text-sm">
                        {lang === "es"
                          ? "Sin operaciones con esos filtros."
                          : "No trades match these filters."}
                      </p>
                      <button
                        type="button"
                        onClick={resetAll}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-white/10 hover:bg-white/5 transition-colors text-secondary"
                      >
                        {t("clearFilters")}
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Footer totals row */}
              {filtered.length > 0 && (
                <tr className="bg-white/[0.03] border-t-2 border-white/10">
                  <td colSpan={6} className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-tertiary">
                    {tf("tradesCount", filtered.length)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-tertiary block">
                      {lang === "es" ? "Suma" : "Sum"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Money
                      value={totalPnl}
                      colorizeSign
                      sign
                      className="text-sm font-bold"
                    />
                  </td>
                  <td
                    className={`px-4 py-3 text-right tnum font-bold ${
                      totalR > 0 ? "text-pnl-pos" : totalR < 0 ? "text-pnl-neg" : "text-secondary"
                    }`}
                  >
                    {fmtNum(totalR, lang, 2)}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              )}
            </tbody>
          </table>
          </div>
          {/* Right-edge gradient fade — subtle visual hint that the
              wide table scrolls horizontally. Pointer-events-none so
              it never blocks taps on the last visible column. Demo
              is intentionally always-dark, so black/20 reads well. */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-black/20" />
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t border-white/10 p-4 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))
              }
              className="px-4 py-1.5 rounded-md text-xs font-medium border border-white/10 text-secondary hover:text-primary hover:bg-white/5 transition-colors"
            >
              {lang === "es"
                ? `Cargar más (${filtered.length - visibleCount} restantes)`
                : `Load more (${filtered.length - visibleCount} left)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
