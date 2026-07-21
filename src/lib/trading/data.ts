/*
 * Deterministic demo-data generator + metrics calculator.
 * Mirrors TradingJournal.Data/DemoData/DemoDataGenerator.cs:
 *   5 instruments, 5 setups, 3 sessions, ~72 trades, ~48% win rate.
 * Account: "Cuenta demo", $10,000 initial.
 * Every metric is COMPUTED from the trades so table = curve = KPIs.
 */

export interface Instrument {
  symbol: string;
  basePrice: number;
  tickSize: number;
  decimals: number;
  assetClass: "crypto" | "forex" | "stock" | "futures";
}

export const INSTRUMENTS: Instrument[] = [
  { symbol: "BTC/USDT", basePrice: 65000, tickSize: 0.1, decimals: 1, assetClass: "crypto" },
  { symbol: "ETH/USDT", basePrice: 3200, tickSize: 0.01, decimals: 2, assetClass: "crypto" },
  { symbol: "EURUSD", basePrice: 1.08, tickSize: 0.0001, decimals: 4, assetClass: "forex" },
  { symbol: "AAPL", basePrice: 190, tickSize: 0.01, decimals: 2, assetClass: "stock" },
  { symbol: "ES", basePrice: 5400, tickSize: 0.25, decimals: 2, assetClass: "futures" },
];

export const SETUP_NAMES = [
  "Ruptura",
  "Pullback",
  "Reversión",
  "Tendencia",
  "Rango",
] as const;
export type SetupName = (typeof SETUP_NAMES)[number];

export const SESSIONS = ["London", "NY", "Asia"] as const;
export type Session = (typeof SESSIONS)[number];

export type Direction = "long" | "short";
export type Compliance = "yes" | "partial" | "no";

export interface Trade {
  id: number;
  instrument: string;
  setup: SetupName;
  direction: Direction;
  session: Session;
  entry: number;
  exit: number;
  qty: number;
  grossPnl: number;
  fees: number;
  netPnl: number;
  rMultiple: number;
  riskUsd: number;
  plannedRr: number;
  mae: number;
  mfe: number;
  initialStop: number;
  target: number;
  compliance: Compliance;
  openedAt: Date;
  closedAt: Date;
  durationMin: number;
  dayScore: number;
  entryNote: string;
  closeNote: string;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ES_NOTES = [
  "Entrada limpia en rotura del nivel, volumen confirmando.",
  "Pullback a la media de 50, esperé el cierre.",
  "Reversión en zona de oferta, P&L ajustado.",
  "Seguí la tendencia, añadí en el retroceso.",
  "Rango lateral, falsa rotura — salí rápido.",
  "Buena gestión, moví el stop a punto muerto.",
  "Entré tarde, el movimiento ya estaba hecho.",
  "Plan cumplido, objetivo alcanzado.",
];
const ES_CLOSE = [
  "Salí en objetivo por scalping.",
  "Stop cazado antes de reaccionar.",
  "Cerré parcial en +1R, resto al objetivo.",
  "Reversión no funcionó, corté pérdidas.",
  "Dejé correr hasta resistencia.",
];

const INITIAL_BALANCE = 10000;

function buildTrades(): Trade[] {
  const rnd = mulberry32(20260716);
  const trades: Trade[] = [];
  const now = new Date("2026-07-16T18:00:00Z");
  const dayMs = 86400000;
  let id = 1;

  for (let i = 0; i < 72; i++) {
    const inst = INSTRUMENTS[Math.floor(rnd() * INSTRUMENTS.length)];
    const setup = SETUP_NAMES[Math.floor(rnd() * SETUP_NAMES.length)];
    const direction: Direction = rnd() > 0.42 ? "long" : "short";
    const session = SESSIONS[Math.floor(rnd() * SESSIONS.length)];

    const balance = INITIAL_BALANCE + trades.reduce((s, t) => s + t.netPnl, 0);
    const riskPct = 0.5 + rnd() * 1.0;
    const riskUsd = +(balance * (riskPct / 100)).toFixed(2);

    const isWin = rnd() < 0.53;
    const r = isWin ? +(0.5 + rnd() * 2.5).toFixed(2) : +(-(0.8 + rnd() * 0.4)).toFixed(2);
    const plannedRr = +(1.5 + rnd() * 2.0).toFixed(2);

    const netPnl = +(riskUsd * r).toFixed(2);
    const fees = +(Math.abs(netPnl) * (0.03 + rnd() * 0.04)).toFixed(2);
    const grossPnl = +(netPnl - (netPnl >= 0 ? -fees : fees)).toFixed(2);

    const entry = +inst.basePrice.toFixed(inst.decimals);
    const stopDist = (0.004 + rnd() * 0.012) * entry;
    const exitRaw =
      direction === "long" ? entry + stopDist * r : entry - stopDist * r;
    const exit = +exitRaw.toFixed(inst.decimals);
    const initialStop =
      direction === "long"
        ? +(entry - stopDist).toFixed(inst.decimals)
        : +(entry + stopDist).toFixed(inst.decimals);
    const target =
      direction === "long"
        ? +(entry + stopDist * plannedRr).toFixed(inst.decimals)
        : +(entry - stopDist * plannedRr).toFixed(inst.decimals);
    const qty = +Math.max(
      0.0001,
      riskUsd / stopDist / (inst.assetClass === "forex" ? 100000 : 1)
    ).toFixed(inst.assetClass === "forex" ? 2 : 3);

    const mfe = isWin ? +(r + rnd() * 0.8).toFixed(2) : +(rnd() * 1.2).toFixed(2);
    const mae = isWin ? +(-(rnd() * 0.5)).toFixed(2) : +(-(0.9 + rnd() * 0.6)).toFixed(2);

    const cr = rnd();
    const compliance: Compliance = cr < 0.7 ? "yes" : cr < 0.85 ? "partial" : "no";

    const closedAt = new Date(now.getTime() - rnd() * 180 * dayMs);
    closedAt.setHours(
      session === "London" ? 8 + Math.floor(rnd() * 3) : session === "NY" ? 14 + Math.floor(rnd() * 3) : 2 + Math.floor(rnd() * 4),
      Math.floor(rnd() * 60),
      0,
      0
    );
    const durationMin =
      session === "Asia"
        ? 60 + Math.floor(rnd() * 240)
        : 5 + Math.floor(rnd() * 180);
    const openedAt = new Date(closedAt.getTime() - durationMin * 60000);

    trades.push({
      id: id++,
      instrument: inst.symbol,
      setup,
      direction,
      session,
      entry,
      exit,
      qty,
      grossPnl,
      fees,
      netPnl,
      rMultiple: r,
      riskUsd,
      plannedRr,
      mae,
      mfe,
      initialStop,
      target,
      compliance,
      openedAt,
      closedAt,
      durationMin,
      dayScore: Math.floor(rnd() * 6),
      entryNote: ES_NOTES[Math.floor(rnd() * ES_NOTES.length)],
      closeNote: ES_CLOSE[Math.floor(rnd() * ES_CLOSE.length)],
    });
  }

  return trades.sort((a, b) => b.closedAt.getTime() - a.closedAt.getTime());
}

export const TRADES: Trade[] = buildTrades();

/* ===== Metrics calculator ===== */
export interface Metrics {
  closedCount: number;
  netPnl: number;
  winRate: number;
  wins: number;
  losses: number;
  expectancy: number;
  expectancyR: number;
  profitFactor: number;
  payoff: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  currentDrawdown: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  recoveryFactor: number;
  maxWinStreak: number;
  maxLossStreak: number;
  currentStreak: { kind: "win" | "loss" | "none"; count: number };
  compliancePct: number;
  costOfIndiscipline: number;
  expectancyInPlan: number;
  expectancyBrokePlan: number;
  equityCurve: { date: Date; balance: number; perf: number }[];
  drawdownCeiling: number[];
  finalBalance: number;
  roiPct: number;
}

export function computeMetrics(trades: Trade[]): Metrics {
  const sorted = [...trades].sort(
    (a, b) => a.closedAt.getTime() - b.closedAt.getTime()
  );
  const n = sorted.length;
  const wins = sorted.filter((t) => t.netPnl > 0);
  const losses = sorted.filter((t) => t.netPnl < 0);
  const netPnl = sorted.reduce((s, t) => s + t.netPnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;

  let bal = INITIAL_BALANCE;
  let peak = INITIAL_BALANCE;
  let maxDd = 0;
  let maxDdPct = 0;
  const equityCurve = sorted.map((t) => {
    bal += t.netPnl;
    peak = Math.max(peak, bal);
    const dd = peak - bal;
    if (dd > maxDd) {
      maxDd = dd;
      maxDdPct = peak > 0 ? dd / peak : 0;
    }
    return { date: t.closedAt, balance: bal, perf: bal - INITIAL_BALANCE };
  });
  const drawdownCeiling = equityCurve.map((e) =>
    Math.max(...equityCurve.filter((x) => x.date <= e.date).map((x) => x.balance))
  );
  const currentDd = peak - bal;

  const rVals = sorted
    .map((t) => t.rMultiple)
    .filter((r) => Number.isFinite(r));
  const expectancyR = rVals.length
    ? rVals.reduce((s, r) => s + r, 0) / rVals.length
    : 0;

  const rets = sorted.map((t) => t.netPnl);
  const mean = rets.reduce((s, r) => s + r, 0) / (rets.length || 1);
  const sd = Math.sqrt(
    rets.reduce((s, r) => s + (r - mean) ** 2, 0) / (rets.length || 1)
  );
  const downside = Math.sqrt(
    rets
      .filter((r) => r < 0)
      .reduce((s, r) => s + (r - mean) ** 2, 0) /
      (rets.length || 1)
  );
  const sharpe = sd ? mean / sd : 0;
  const sortino = downside ? mean / downside : 0;
  const calmar = maxDd ? (bal - INITIAL_BALANCE) / maxDd : 0;
  const recoveryFactor = maxDd ? netPnl / maxDd : 0;

  let curWin = 0, curLoss = 0, maxWin = 0, maxLoss = 0;
  for (const t of sorted) {
    if (t.netPnl > 0) { curWin++; curLoss = 0; maxWin = Math.max(maxWin, curWin); }
    else if (t.netPnl < 0) { curLoss++; curWin = 0; maxLoss = Math.max(maxLoss, curLoss); }
  }
  let streak: Metrics["currentStreak"] = { kind: "none", count: 0 };
  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    if (t.netPnl > 0) {
      if (streak.kind === "loss") break;
      streak = { kind: "win", count: streak.count + 1 };
    } else if (t.netPnl < 0) {
      if (streak.kind === "win") break;
      streak = { kind: "loss", count: streak.count + 1 };
    }
  }

  const complied = sorted.filter((t) => t.compliance === "yes").length;
  const compliancePct = n ? complied / n : 0;
  const inPlan = sorted.filter((t) => t.compliance === "yes");
  const broke = sorted.filter((t) => t.compliance !== "yes");
  const expectancyInPlan = inPlan.length
    ? inPlan.reduce((s, t) => s + t.netPnl, 0) / inPlan.length
    : 0;
  const expectancyBrokePlan = broke.length
    ? broke.reduce((s, t) => s + t.netPnl, 0) / broke.length
    : 0;
  const costOfIndiscipline = broke.reduce(
    (s, t) => s + (expectancyInPlan - t.netPnl),
    0
  );

  return {
    closedCount: n,
    netPnl,
    winRate: n ? wins.length / n : 0,
    wins: wins.length,
    losses: losses.length,
    expectancy: n ? netPnl / n : 0,
    expectancyR,
    profitFactor: grossLoss ? grossWin / grossLoss : grossWin,
    payoff: avgLoss ? avgWin / avgLoss : 0,
    avgWin,
    avgLoss,
    largestWin: wins.length ? Math.max(...wins.map((t) => t.netPnl)) : 0,
    largestLoss: losses.length ? Math.min(...losses.map((t) => t.netPnl)) : 0,
    maxDrawdown: maxDd,
    maxDrawdownPct: maxDdPct,
    currentDrawdown: currentDd,
    sharpe,
    sortino,
    calmar,
    recoveryFactor,
    maxWinStreak: maxWin,
    maxLossStreak: maxLoss,
    currentStreak: streak,
    compliancePct,
    costOfIndiscipline,
    expectancyInPlan,
    expectancyBrokePlan,
    equityCurve,
    drawdownCeiling,
    finalBalance: bal,
    roiPct: (bal - INITIAL_BALANCE) / INITIAL_BALANCE,
  };
}

export const METRICS = computeMetrics(TRADES);
export const INITIAL_BALANCE_CONST = INITIAL_BALANCE;

/* ===== Analytics distributions ===== */
export function rHistogram(trades: Trade[], bins = 9): { x: number; count: number }[] {
  const vals = trades.map((t) => t.rMultiple).filter(Number.isFinite);
  const min = -1.5, max = 3.5;
  const step = (max - min) / bins;
  const out = Array.from({ length: bins }, (_, i) => ({ x: +(min + i * step).toFixed(1), count: 0 }));
  for (const v of vals) {
    let idx = Math.floor((v - min) / step);
    idx = Math.max(0, Math.min(bins - 1, idx));
    out[idx].count++;
  }
  return out;
}

export function pnlHistogram(trades: Trade[], bins = 9): { x: number; count: number }[] {
  const vals = trades.map((t) => t.netPnl);
  if (!vals.length) return [];
  const min = Math.min(...vals), max = Math.max(...vals);
  const step = (max - min) / bins || 1;
  const out = Array.from({ length: bins }, (_, i) => ({ x: +(min + i * step).toFixed(0), count: 0 }));
  for (const v of vals) {
    let idx = Math.floor((v - min) / step);
    idx = Math.max(0, Math.min(bins - 1, idx));
    out[idx].count++;
  }
  return out;
}

export function durationHistogram(trades: Trade[]): { label: string; count: number }[] {
  const buckets = [
    { label: "<15m", max: 15 },
    { label: "15–60m", max: 60 },
    { label: "1–3h", max: 180 },
    { label: "3–6h", max: 360 },
    { label: "6–24h", max: 1440 },
    { label: ">24h", max: Infinity },
  ];
  return buckets.map((b, i) => ({
    label: b.label,
    count: trades.filter(
      (t) =>
        t.durationMin <= b.max &&
        (i === 0 || buckets[i - 1].max < t.durationMin)
    ).length,
  }));
}

export function heatmap(trades: Trade[]): number[][] {
  const hourBuckets = [0, 4, 8, 12, 16, 20];
  const grid = Array.from({ length: 5 }, () => Array(hourBuckets.length).fill(0));
  for (const t of trades) {
    const d = t.closedAt.getDay();
    if (d === 0 || d === 6) continue;
    const row = d - 1;
    const h = t.closedAt.getHours();
    const col = Math.min(5, Math.floor(h / 4));
    grid[row][col] += t.netPnl;
  }
  return grid;
}

export function weekdayBreakdown(trades: Trade[]): { day: string; pnl: number }[] {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return days.map((day, i) => ({
    day,
    pnl: trades
      .filter((t) => (t.closedAt.getDay() === 0 ? 6 : t.closedAt.getDay() - 1) === i)
      .reduce((s, t) => s + t.netPnl, 0),
  }));
}

export function monthlyBreakdown(trades: Trade[]): { month: string; pnl: number }[] {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const byMonth = new Map<number, number>();
  for (const t of trades) {
    const m = t.closedAt.getMonth();
    byMonth.set(m, (byMonth.get(m) || 0) + t.netPnl);
  }
  const present = [...byMonth.keys()].sort((a, b) => a - b);
  return present.map((m) => ({ month: months[m], pnl: byMonth.get(m)! }));
}

export interface RankingRow {
  name: string;
  count: number;
  expectancy: number;
  totalPnl: number;
  winRate: number;
}

export function rankByExpectancy(
  trades: Trade[],
  key: (t: Trade) => string
): RankingRow[] {
  const map = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = key(t);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(t);
  }
  const rows: RankingRow[] = [];
  for (const [name, ts] of map) {
    const m = computeMetrics(ts);
    rows.push({
      name,
      count: ts.length,
      expectancy: m.expectancy,
      totalPnl: m.netPnl,
      winRate: m.winRate,
    });
  }
  return rows.sort((a, b) => b.expectancy - a.expectancy);
}

export function dailyPnlForMonth(
  trades: Trade[],
  year: number,
  month: number
): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of trades) {
    if (
      t.closedAt.getFullYear() === year &&
      t.closedAt.getMonth() === month
    ) {
      const key = `${t.closedAt.getDate()}`;
      m.set(key, (m.get(key) || 0) + t.netPnl);
    }
  }
  return m;
}

export const WEEKDAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie"];
export const WEEKDAYS_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
