/**
 * Marketing fixtures — datos deterministas que el HTML de referencia
 * (Trading Journal - Home.dc.html) usaba para alimentar sus secciones
 * "Resumen", "Operaciones", "Playbook", "Calendario" y "Curva de
 * rendimiento". Tras portar el diseño a React/Next.js, esos mismos
 * valores se exponen desde aquí como una API estable para que los
 * componentes de marketing (`Hero`, `OverviewApp`, `FeaturesBento`,
 * `MetricsShowcaseNew`, ...) los consuman.
 *
 * Los valores son los que el HTML renderizaba a 23 de julio de 2026 con
 * cuenta demo de 10.000 $: P&L total +5.732,24 $, win-rate 50 %,
 * expectancy +28,66 $, profit factor 1,56. La curva tiene 150 puntos
 * de balance simulados y el calendario cubre julio 2026.
 *
 * Implementación:
 * - PRNG `mulberry32` con seed fija (20260722, como en el HTML).
 * - Formatos `es-ES` vía `Intl.NumberFormat` (consistente con el resto
 *   del proyecto que ya usa `src/lib/trading/format.ts`).
 * - Todos los exports son funciones puras: la primera llamada genera,
 *   las siguientes reutilizan el resultado cacheado (idempotente).
 */

import { fmtMoney, fmtNum, fmtPct } from "./format";
import type { Lang } from "@/lib/i18n";

/* ---------- PRNG determinista ---------- */

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260722);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

function between(min: number, max: number): number {
  return min + rng() * (max - min);
}

/* ---------- Catálogos del dominio (alineados con el HTML) ---------- */

const INSTRUMENTS = ["ES35", "NQ", "SPX", "EURUSD", "BTC", "DAX", "GOLD", "CL"] as const;
const SETUPS = ["Ruptura", "Pullback", "Reversión", "Tendencia", "Rango"] as const;
const SESSIONS = ["London", "NY", "Asia"] as const;

const MONTH_DAYS = 31; // julio 2026

/* ---------- Cache ---------- */

let cache: ReturnType<typeof build> | null = null;

/* ---------- Builder principal ---------- */

function build() {
  return {
    /** Métricas "live" que el HTML mostraba flotando sobre el hero. */
    kpis: buildKpis(),
    /** Curva de rendimiento con 150 puntos de balance + área + línea + endpoint. */
    perf: buildPerf(),
    /** Calendario de julio 2026: 35 celdas (5 semanas × 7) con P&L diario. */
    cal: buildCal(),
    /** Las 7 KPIs que el HTML mostraba en la sección Resumen (dashboard). */
    kpiRow: buildKpiRow(),
    /** 10 filas de la tabla "Operaciones" (sample visible). */
    rows: buildRows(),
    /** 5 setups del Playbook. */
    playbook: buildPlaybook(),
    /** Una operación de ejemplo para la vista de detalle. */
    det: buildTradeDetail(),
  };
}

/* ---------- Builders por sección ---------- */

function buildKpis() {
  return {
    pnl: {
      v: `+${fmtNum(5732.24)} $`,
      color: "var(--pos)",
      delta: "+57,3 % ROI",
      deltaColor: "var(--pos)",
    },
  };
}

function buildPerf() {
  // 150 puntos, simulación de equity curve estable con ligera volatilidad.
  const points = 150;
  const start = 10000;
  const endBalance = 15732.24;
  const data: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const base = start + (endBalance - start) * t;
    const noise = (rng() - 0.5) * 80 * (1 - Math.abs(t - 0.5) * 2);
    data.push({ x: t, y: base + noise });
  }
  // Renderizamos a viewBox 640x220 con margen lateral de 46px y arriba/abajo 24px.
  const xMin = 46;
  const xMax = 632;
  const yMin = 24;
  const yMax = 196;
  const ys = data.map((d) => d.y);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const proj = (d: { x: number; y: number }) => ({
    x: xMin + (xMax - xMin) * d.x,
    y: yMin + (yMax - yMin) * (1 - (d.y - lo) / (hi - lo)),
  });
  const projected = data.map(proj);
  const line = projected
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const fill = `${line} L${projected[projected.length - 1]!.x.toFixed(1)},${yMax} L${projected[0]!.x.toFixed(1)},${yMax} Z`;
  // Línea "balance" (dashed, más suave) ligeramente por debajo.
  const dash = projected
    .map((p, i) => {
      const dy = p.y + 6 + Math.sin(p.x / 40) * 4;
      return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${dy.toFixed(1)}`;
    })
    .join(" ");
  // Drawdown: área entre la línea y un techo imaginario por encima.
  const ceiling = projected.map((p) => ({ x: p.x, y: Math.min(p.y - 14, yMin + 4) }));
  const dd = `${line} ${ceiling
    .slice()
    .reverse()
    .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ")} Z`;
  // Grid lines horizontales (5 niveles) con etiqueta.
  const grid = [0.0, 0.25, 0.5, 0.75, 1.0].map((p) => {
    const y = yMin + (yMax - yMin) * p;
    const val = hi - (hi - lo) * p;
    return { y, label: fmtNum(val, "es", 0) };
  });
  const last = projected[projected.length - 1]!;
  return { grid, line, fill, dash, dd, endX: last.x, endY: last.y };
}

function buildCal() {
  const cells = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 4; // Empezamos en martes (offset 1) para alinear con julio 2026
    if (dayNum < 1 || dayNum > MONTH_DAYS) {
      return { day: "", val: "", style: "background:transparent" };
    }
    // P&L determinista por día, +/- 50 $ con seed fija.
    const seed = mulberry32(20260722 + dayNum)();
    const pnl = (seed - 0.5) * 100;
    const isPos = pnl >= 0;
    const intensity = Math.min(1, Math.abs(pnl) / 60);
    const opacity = 0.18 + intensity * 0.42;
    const bg = isPos
      ? `rgb(var(--accent-base) / ${opacity.toFixed(2)})`
      : `rgb(var(--pnl-neg) / ${opacity.toFixed(2)})`;
    const style = `background:${bg};border-radius:5px;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:2px`;
    return {
      day: String(dayNum),
      val: pnl === 0 ? "·" : `${pnl >= 0 ? "+" : "−"}${Math.abs(pnl).toFixed(0)}`,
      style,
    };
  });
  // Total del mes (suma determinista rápida sobre los días válidos).
  let total = 0;
  for (let d = 1; d <= MONTH_DAYS; d++) {
    total += (mulberry32(20260722 + d)() - 0.5) * 100;
  }
  return {
    label: "julio 2026",
    chip: "Mes en curso",
    pnl: `${total >= 0 ? "+" : "−"}${fmtNum(Math.abs(total))} $`,
    pnlColor: total >= 0 ? "var(--pos)" : "var(--neg)",
    cells,
  };
}

function buildKpiRow() {
  return [
    { l: "P&L total", v: `+${fmtNum(5732.24)} $`, c: "var(--pos)", d: "ROI 57,3 %" },
    { l: "Win rate", v: "50 %", c: "var(--ink)", d: "30 W · 30 L" },
    { l: "Expectancy", v: `+${fmtNum(28.66)} $`, c: "var(--pos)", d: "por operación" },
    { l: "Profit factor", v: fmtNum(1.56, "es", 2), c: "var(--ink)", d: "Gross W / Gross L" },
    { l: "Sharpe", v: fmtNum(3.34, "es", 2), c: "var(--ink)", d: "anualizado" },
    { l: "Max DD", v: "−8,0 %", c: "var(--neg)", d: "peor racha" },
    { l: "Operaciones", v: "60", c: "var(--ink)", d: "cerradas" },
  ];
}

function buildRows() {
  // 10 filas de operaciones recientes, alineadas con el HTML.
  return Array.from({ length: 10 }, (_, i) => {
    const dir = rng() > 0.5 ? "Long" : "Short";
    const inst = pick(INSTRUMENTS);
    const setup = pick(SETUPS);
    const ses = pick(SESSIONS);
    const win = rng() > 0.5;
    const pnl = win ? between(80, 480) : -between(40, 260);
    const r = pnl / 100;
    const pnlStr = `${pnl >= 0 ? "+" : "−"}${fmtNum(Math.abs(pnl))} $`;
    const pct = fmtPct(pnl / 10000, "es", 2);
    const cum = 11000 + i * 200 + pnl;
    const cumStr = `${cum >= 0 ? "+" : "−"}${fmtNum(Math.abs(cum))} $`;
    return {
      dir,
      dc: dir === "Long" ? "var(--pos)" : "var(--neg)",
      inst,
      dot: inst === "BTC" || inst === "NQ" ? "var(--accent-base)" : "var(--ink-2)",
      setup,
      ses,
      es: "95,0",
      dur: `${Math.floor(between(2, 240))} min`,
      date: `2026-07-${String(MONTH_DAYS - i).padStart(2, "0")}`,
      pnl,
      pnlStr,
      pc: pnl >= 0 ? "var(--pos)" : "var(--neg)",
      r,
      rStr: `${r >= 0 ? "+" : ""}${r.toFixed(2)}R`,
      rc: pnl >= 0 ? "var(--pos)" : "var(--neg)",
      cum: cum,
      cumStr,
      cc: cum >= 10000 ? "var(--pos)" : "var(--neg)",
      open: () => {},
      det: { id: `trade-${i}` },
    };
  });
}

function buildPlaybook() {
  const names = ["Ruptura", "Pullback", "Reversión", "Tendencia", "Rango"];
  const colors = ["var(--accent-base)", "var(--pos)", "var(--neg)", "var(--ink-2)", "var(--warn)"];
  return names.map((name, i) => {
    const n = 12 + i * 3;
    const win = 0.42 + (i * 0.05);
    const exp = win > 0.5 ? 38.4 : -12.6;
    const expC = exp >= 0 ? "var(--pos)" : "var(--neg)";
    const wrStr = `${Math.round(win * 100)} %`;
    const pnl = exp * n;
    const pnlStr = `${pnl >= 0 ? "+" : "−"}${fmtNum(Math.abs(pnl))} $`;
    const pnlC = pnl >= 0 ? "var(--pos)" : "var(--neg)";
    const ses = SESSIONS[i % SESSIONS.length] ?? "London";
    const sesPnl = `${pnl >= 0 ? "+" : "−"}${fmtNum(Math.abs(pnl) / 2)} $`;
    // sparkline SVG path determinista
    const sparkPoints = Array.from({ length: 12 }, (_, k) => {
      const x = (k / 11) * 100;
      const y = 30 - rng() * 25 + (k / 11) * 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    const spark = `M${sparkPoints.split(" ").join(" L")}`;
    const verdict = win > 0.5 ? "Edge confirmado" : "A revisar";
    const vc = win > 0.5 ? "var(--pos)" : "var(--warn)";
    return {
      name,
      color: colors[i] ?? "var(--accent-base)",
      spark,
      n,
      exp,
      expStr: `${exp >= 0 ? "+" : "−"}${fmtNum(Math.abs(exp))} $`,
      expC,
      win: wrStr,
      pnl: pnlStr,
      pnlC,
      verdict,
      vc,
      ses,
      sesPnl,
      cum: `+${fmtNum(pnl * 1.5)} $`,
      rbar: Math.round(win * 100),
      rtxt: `${Math.round(win * 100)} % a favor`,
      g: 7 + i,
      l: 5 - i % 2,
      gw: `${win.toFixed(2)} : 1`,
    };
  });
}

function buildTradeDetail() {
  return {
    inst: "NQ",
    dir: "Long",
    dc: "var(--pos)",
    date: "2026-07-22",
    idx: "trade-42",
    pnl: `+${fmtNum(312.4)} $`,
    pc: "var(--pos)",
    r: "+1.56R",
    rc: "var(--pos)",
    risk: `${fmtNum(200)} $`,
    riskPct: "2.00 %",
    rr: "1,60 : 1",
    entry: "18.450,25",
    exit: "18.462,00",
    qty: "4 contratos",
    gross: `+${fmtNum(350)} $`,
    gc: "var(--pos)",
    fees: `−${fmtNum(37.6)} $`,
    setup: "Ruptura · NY",
    maeR: "−0,40R",
    mfeR: "+1,80R",
    maeWidth: 40,
    mfeWidth: 95,
    stop: "18.420,00",
    obj: "18.500,00",
    maeAbs: `−${fmtNum(80)} $`,
    mfeAbs: `+${fmtNum(360)} $`,
    since: "desde la apertura NY",
  };
}

/* ---------- API pública ---------- */

/**
 * Devuelve el bundle de fixtures de marketing. Idempotente: la primera
 * llamada genera, las siguientes devuelven la misma referencia.
 */
export function buildMarketingFixture() {
  if (!cache) cache = build();
  return cache;
}

/** Acceso tipado por sección (azúcar sobre `buildMarketingFixture`). */
export function getKpis() {
  return buildMarketingFixture().kpis;
}
export function getPerf() {
  return buildMarketingFixture().perf;
}
export function getCal() {
  return buildMarketingFixture().cal;
}
export function getKpiRow() {
  return buildMarketingFixture().kpiRow;
}
export function getRows() {
  return buildMarketingFixture().rows;
}
export function getPlaybook() {
  return buildMarketingFixture().playbook;
}
export function getTradeDetail() {
  return buildMarketingFixture().det;
}
