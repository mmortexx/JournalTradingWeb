import type { Lang } from "@/lib/i18n";

const LOCALE: Record<Lang, string> = { es: "es-ES", en: "en-US" };

/** Format a USD money value with sign-aware coloring support. */
export function fmtMoney(
  value: number,
  lang: Lang = "es",
  opts: { sign?: boolean; decimals?: number; compact?: boolean } = {}
): string {
  const { sign = false, decimals = 2, compact = false } = opts;
  const locale = LOCALE[lang];
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: compact && abs >= 1000 ? 0 : decimals,
    maximumFractionDigits: compact && abs >= 1000 ? 0 : decimals,
    notation: compact && abs >= 1_000_000 ? "compact" : "standard",
  }).format(abs);
  if (value < 0) return `−${formatted}`;
  if (sign && value > 0) return `+${formatted}`;
  return formatted;
}

export function fmtNum(
  value: number,
  lang: Lang = "es",
  decimals = 2
): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function fmtPct(value: number, lang: Lang = "es", decimals = 1): string {
  return `${fmtNum(value * 100, lang, decimals)}%`;
}

export function fmtInt(value: number, lang: Lang = "es"): string {
  return new Intl.NumberFormat(LOCALE[lang]).format(value);
}

export function fmtPrice(value: number, decimals = 2, lang: Lang = "es"): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function fmtDuration(minutes: number, _lang: Lang = "es"): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh ? `${d}d ${rh}h` : `${d}d`;
}

export function fmtDate(date: Date, lang: Lang = "es"): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function fmtDateTime(date: Date, lang: Lang = "es"): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function fmtTime(date: Date, lang: Lang = "es"): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** P&L sign → semantic tone. */
export function pnlTone(value: number): "pos" | "neg" | "neutral" {
  if (value > 0) return "pos";
  if (value < 0) return "neg";
  return "neutral";
}
