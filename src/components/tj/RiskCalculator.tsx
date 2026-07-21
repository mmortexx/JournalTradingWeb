"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import { fmtMoney, fmtNum } from "@/lib/trading/format";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/tj/Chip";

interface Preset {
  key: string;
  pct: number;
  labelEs: string;
  labelEn: string;
  tone: "neutral" | "accent" | "warn";
}

const PRESETS: Preset[] = [
  { key: "conservative", pct: 0.5, labelEs: "Conservador 0.5 %", labelEn: "Conservative 0.5%", tone: "neutral" },
  { key: "standard", pct: 1, labelEs: "Estándar 1 %", labelEn: "Standard 1%", tone: "accent" },
  { key: "aggressive", pct: 2, labelEs: "Agresivo 2 %", labelEn: "Aggressive 2%", tone: "warn" },
];

/** Animated number that springs from previous to next value (no React setState-in-effect). */
function AnimatedMoney({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const target = useMotionValue(value);
  const spring = useSpring(target, { stiffness: 140, damping: 22, mass: 0.6 });
  const text = useTransform(spring, (v) => format(v));
  // Drive the spring toward the latest value (MotionValue mutator — not React state).
  useEffect(() => {
    target.set(value);
  }, [value, target]);
  return <motion.span className={className}>{text}</motion.span>;
}

interface CalcResult {
  riskUsd: number;
  perUnit: number;
  positionSize: number;
  rr: number;
  potentialProfit: number;
  hasTarget: boolean;
  valid: boolean;
}

export function RiskCalculator() {
  const { lang } = useLang();
  const es = lang === "es";

  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(100);
  const [stop, setStop] = useState(95);
  const [target, setTarget] = useState<number | "">(115);

  const calc = useMemo<CalcResult>(() => {
    const riskUsd = (Math.max(0, balance) * riskPct) / 100;
    const perUnit = Math.abs(entry - stop);
    const valid = perUnit > 0 && entry > 0 && stop > 0;
    const positionSize = valid ? riskUsd / perUnit : 0;
    const hasTarget = target !== "" && !Number.isNaN(Number(target)) && Number(target) > 0;
    const targetNum = hasTarget ? Number(target) : 0;
    const rewardPerUnit = hasTarget ? Math.abs(targetNum - entry) : 0;
    const rr = valid && rewardPerUnit > 0 ? rewardPerUnit / perUnit : 0;
    const potentialProfit = hasTarget ? positionSize * rewardPerUnit : 0;
    return { riskUsd, perUnit, positionSize, rr, potentialProfit, hasTarget, valid };
  }, [balance, riskPct, entry, stop, target]);

  const isHighRisk = riskPct > 2;

  // Risk ladder widths (proportional to R:R). risk=1R, reward=rr×R.
  const totalR = calc.rr > 0 ? 1 + calc.rr : 1;
  const riskPctWidth = calc.rr > 0 ? (1 / totalR) * 100 : 100;
  const rewardPctWidth = calc.rr > 0 ? (calc.rr / totalR) * 100 : 0;

  // Labels
  const L = {
    title: es ? "Calculadora de riesgo" : "Risk calculator",
    subtitle: es
      ? "Dimensiona cada operación antes de pulsar el botón."
      : "Size every trade before you click the button.",
    balance: es ? "Balance de cuenta" : "Account balance",
    riskPer: es ? "Riesgo por operación" : "Risk per trade",
    entry: es ? "Precio de entrada" : "Entry price",
    stop: "Stop loss",
    target: es ? "Precio objetivo" : "Target price",
    targetHint: es ? "Opcional" : "Optional",
    riskUsd: es ? "Riesgo en $" : "Risk in $",
    posSize: es ? "Tamaño de posición" : "Position size",
    rr: es ? "Ratio R:R" : "R:R ratio",
    profit: es ? "Beneficio potencial" : "Potential profit",
    highRisk: es ? "Riesgo alto" : "High risk",
    riskLabel: es ? "Riesgo" : "Risk",
    rewardLabel: es ? "Beneficio" : "Reward",
    units: es ? "unidades" : "units",
    perUnit: es ? "por unidad" : "per unit",
    noTarget: es ? "Sin objetivo" : "No target",
    invalid: es ? "Entrada y stop deben diferir" : "Entry and stop must differ",
  } as const;

  return (
    <div className="relative rounded-card overflow-hidden">
      <div className="relative liquid-glass depth-3 rounded-card p-6 md:p-8 transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-medium tracking-[-0.01em] text-primary text-xl md:text-2xl">
              {L.title}
            </h3>
            <p className="mt-1 text-sm text-secondary">{L.subtitle}</p>
          </div>
          {isHighRisk && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Chip variant="warn">
                <WarnDot />
                {L.highRisk}
              </Chip>
            </motion.div>
          )}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-tertiary mr-1">
            {es ? "Plantillas" : "Presets"}
          </span>
          {PRESETS.map((p) => {
            const active = Math.abs(riskPct - p.pct) < 0.001;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setRiskPct(p.pct)}
                aria-pressed={active}
                className={`pill transition-all duration-200 cursor-pointer ${
                  active
                    ? p.tone === "warn"
                      ? "bg-pnl-warn/20 text-pnl-warn border border-pnl-warn/40"
                      : p.tone === "accent"
                      ? "bg-white/10 text-primary border border-white/25"
                      : "bg-white/15 text-primary border border-white/20"
                    : "bg-white/5 text-secondary border border-white/8 hover:border-white/20 hover:text-primary"
                }`}
              >
                {es ? p.labelEs : p.labelEn}
              </button>
            );
          })}
        </div>

        {/* Inputs grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Account balance */}
          <Field label={L.balance} htmlFor="rc-balance">
            <Input
              id="rc-balance"
              type="number"
              min={0}
              step={100}
              value={Number.isFinite(balance) ? balance : ""}
              onChange={(e) => setBalance(Number(e.target.value))}
              inputMode="decimal"
              className="bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm tnum text-primary"
            />
          </Field>

          {/* Risk per trade (slider) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label id="rc-risk-label" htmlFor="rc-risk" className="text-[11px] uppercase tracking-[0.12em] font-semibold text-tertiary">
                {L.riskPer}
              </label>
              <span
                aria-hidden="true"
                className={`tnum text-sm font-semibold px-2 py-0.5 rounded-md border ${
                  isHighRisk
                    ? "text-pnl-warn border-pnl-warn/30 bg-pnl-warn/10"
                    : "text-primary border-white/20 bg-white/5"
                }`}
              >
                {fmtNum(riskPct, lang, 2)} %
              </span>
            </div>
            <div className="h-10 flex items-center">
              <Slider
                id="rc-risk"
                value={[riskPct]}
                min={0.25}
                max={3}
                step={0.05}
                onValueChange={(v) => setRiskPct(v[0])}
                aria-label={L.riskPer}
                className="[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white/20 [&_[data-slot=slider-thumb]]:shadow-[0_0_0_4px_rgb(255_255_255/0.18)]"
              />
            </div>
            <div className="flex justify-between text-[10px] text-tertiary tnum">
              <span>0.25 %</span>
              <span>1 %</span>
              <span>3 %</span>
            </div>
          </div>

          {/* Entry */}
          <Field label={L.entry} htmlFor="rc-entry">
            <Input
              id="rc-entry"
              type="number"
              min={0}
              step={0.01}
              value={Number.isFinite(entry) ? entry : ""}
              onChange={(e) => setEntry(Number(e.target.value))}
              inputMode="decimal"
              className="bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm tnum text-primary"
            />
          </Field>

          {/* Stop */}
          <Field label={L.stop} htmlFor="rc-stop">
            <Input
              id="rc-stop"
              type="number"
              min={0}
              step={0.01}
              value={Number.isFinite(stop) ? stop : ""}
              onChange={(e) => setStop(Number(e.target.value))}
              inputMode="decimal"
              className="bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm tnum text-primary"
            />
          </Field>

          {/* Target (optional) */}
          <Field label={`${L.target} · ${L.targetHint}`} htmlFor="rc-target">
            <Input
              id="rc-target"
              type="number"
              min={0}
              step={0.01}
              value={target === "" ? "" : target}
              onChange={(e) => setTarget(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={es ? "Ej. 115.00" : "e.g. 115.00"}
              inputMode="decimal"
              className="bg-white/5 border border-white/10 rounded-md h-10 px-3 text-sm tnum text-primary placeholder:text-tertiary/60"
            />
          </Field>

          {/* Spacer / per-unit reference */}
          <div className="hidden sm:flex flex-col justify-end gap-2 pb-1">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-tertiary">
              {L.perUnit}
            </span>
            <div className="h-10 flex items-center px-3 rounded-md bg-white/[0.03] border border-white/8">
              <span className="text-sm tnum text-secondary">
                {calc.valid ? fmtMoney(calc.perUnit, lang, { decimals: 4 }) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <OutputCard
            label={L.riskUsd}
            tone="neg"
            prominent
          >
            <AnimatedMoney
              value={calc.riskUsd}
              format={(v) => fmtMoney(v, lang, { decimals: 2 })}
              className="tnum text-2xl font-semibold text-pnl-neg"
            />
          </OutputCard>

          <OutputCard label={L.posSize} tone="accent">
            {calc.valid ? (
              <AnimatedMoney
                value={calc.positionSize}
                format={(v) => fmtNum(v, lang, v >= 100 ? 0 : 2)}
                className="tnum text-2xl font-semibold text-primary"
              />
            ) : (
              <span className="tnum text-2xl font-semibold text-tertiary">—</span>
            )}
            <span className="ml-1 text-xs text-tertiary">{L.units}</span>
          </OutputCard>

          <OutputCard label={L.rr} tone={calc.rr >= 2 ? "pos" : "neutral"}>
            {calc.hasTarget && calc.rr > 0 ? (
              <AnimatedMoney
                value={calc.rr}
                format={(v) => `${fmtNum(v, lang, 2)} : 1`}
                className={`tnum text-2xl font-semibold ${
                  calc.rr >= 2 ? "text-pnl-pos" : calc.rr >= 1 ? "text-primary" : "text-pnl-warn"
                }`}
              />
            ) : (
              <span className="text-sm text-tertiary italic">{L.noTarget}</span>
            )}
          </OutputCard>

          <OutputCard label={L.profit} tone="pos">
            {calc.hasTarget ? (
              <AnimatedMoney
                value={calc.potentialProfit}
                format={(v) => fmtMoney(v, lang, { decimals: 2, sign: true })}
                className="tnum text-2xl font-semibold text-pnl-pos"
              />
            ) : (
              <span className="text-sm text-tertiary italic">{L.noTarget}</span>
            )}
          </OutputCard>
        </div>

        {/* Risk ladder */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-tertiary">
              {es ? "Escalera riesgo / beneficio" : "Risk / reward ladder"}
            </span>
            {!calc.valid && (
              <span className="text-[11px] text-pnl-warn tnum">{L.invalid}</span>
            )}
          </div>
          <div className="relative h-12 rounded-md overflow-hidden border border-white/8 bg-white/[0.03]">
            <div className="absolute inset-0 flex">
              <motion.div
                className="h-full bg-pnl-neg/30 border-r border-pnl-neg/40 flex items-center justify-center"
                initial={false}
                animate={{ width: `${riskPctWidth}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 28 }}
              >
                <span className="text-[10px] font-semibold text-pnl-neg uppercase tracking-wider px-2 truncate tnum">
                  {L.riskLabel} · {fmtMoney(calc.riskUsd, lang, { decimals: 0 })}
                </span>
              </motion.div>
              {rewardPctWidth > 0 && (
                <motion.div
                  className="h-full bg-pnl-pos/30 flex items-center justify-center"
                  initial={false}
                  animate={{ width: `${rewardPctWidth}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 28 }}
                >
                  <span className="text-[10px] font-semibold text-pnl-pos uppercase tracking-wider px-2 truncate tnum">
                    {L.rewardLabel} · {fmtMoney(calc.potentialProfit, lang, { decimals: 0 })}
                  </span>
                </motion.div>
              )}
            </div>
            {/* Tick markers */}
            <div className="absolute inset-0 pointer-events-none flex">
              <div className="w-1/4 border-r border-white/5" />
              <div className="w-1/4 border-r border-white/5" />
              <div className="w-1/4 border-r border-white/5" />
              <div className="w-1/4" />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-tertiary tnum">
            <span>0</span>
            <span>1R</span>
            <span>{calc.rr > 0 ? `${fmtNum(calc.rr, lang, 1)}R` : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- sub components ---- */

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-[11px] uppercase tracking-[0.12em] font-semibold text-tertiary">
        {label}
      </label>
      {children}
    </div>
  );
}

function OutputCard({
  label,
  tone,
  prominent,
  children,
}: {
  label: string;
  tone: "pos" | "neg" | "accent" | "neutral";
  prominent?: boolean;
  children: React.ReactNode;
}) {
  const toneBorder =
    tone === "neg"
      ? "border-pnl-neg/25"
      : tone === "pos"
      ? "border-pnl-pos/25"
      : tone === "accent"
      ? "border-white/20"
      : "border-white/10";
  return (
    <div
      className={`relative rounded-md p-3 bg-white/[0.03] border ${toneBorder} ${
        prominent ? "shadow-[0_0_0_1px_rgb(var(--accent-base)/0.05),0_8px_24px_-12px_rgb(0_0_0/0.5)]" : ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-tertiary mb-1.5 truncate">
        {label}
      </div>
      <div className="flex items-baseline gap-1">{children}</div>
    </div>
  );
}

function WarnDot() {
  return (
    <span
      aria-hidden
      className="w-1.5 h-1.5 rounded-full bg-pnl-warn"
    />
  );
}
