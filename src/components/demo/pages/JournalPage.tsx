"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TRADES,
  METRICS,
  weekdayBreakdown,
  monthlyBreakdown,
  type Trade,
} from "@/lib/trading/data";
import { fmtInt, fmtDate, fmtMoney, fmtPct } from "@/lib/trading/format";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Chip } from "@/components/tj/Chip";
import { Money } from "@/components/tj/Money";
import { CountUp } from "@/components/tj/CountUp";
import { Reveal } from "@/components/tj/Reveal";
import { PremiumCard } from "@/components/tj/PremiumCard";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================
   Static bilingual content (no i18n keys for these)
   ============================================================ */

interface ChecklistItem {
  id: string;
  es: string;
  en: string;
}

const PRE_ITEMS: ChecklistItem[] = [
  { id: "plan", es: "¿Plan definido?", en: "Is the plan defined?" },
  { id: "limits", es: "¿Límites de pérdida?", en: "Loss limits set?" },
  { id: "mind", es: "¿Estado mental?", en: "Mental state ready?" },
  { id: "news", es: "¿Noticias revisadas?", en: "News checked?" },
];

const POST_ITEMS: ChecklistItem[] = [
  { id: "respect", es: "¿Respetaste el plan?", en: "Did you respect the plan?" },
  { id: "mgmt", es: "¿Gestión correcta?", en: "Was management right?" },
  { id: "emotions", es: "¿Emociones controladas?", en: "Emotions in check?" },
  { id: "learn", es: "¿Aprendizaje extraído?", en: "Lesson extracted?" },
];

const PRE_PLACEHOLDER = {
  es: "¿Qué vigilas hoy? ¿Qué evitas?",
  en: "What are you watching? What do you avoid?",
};
const POST_PLACEHOLDER = {
  es: "¿Qué aprendiste? ¿Qué cambiarás?",
  en: "What did you learn? What will you change?",
};
const COST_COPY = {
  es: { cost: "Lo que tu indisciplina te costó", saver: "Tu indisciplina te benefició esta vez" },
  en: { cost: "What your indiscipline cost you", saver: "Your indiscipline paid off this time" },
};

/* ============================================================
   Mistake-type labels for the discipline invoice breakdown.
   Each "broke-plan" trade is bucketed into exactly one category
   using deterministic rules based on its metrics — the sum of
   per-trade costs equals METRICS.costOfIndiscipline (signed).
   ============================================================ */

interface MistakeRow {
  key: string;
  es: string;
  en: string;
  count: number;
  cost: number; // expectancyInPlan - trade.netPnl (positive = real cost, negative = saver)
}

const MISTAKE_LABELS: Record<string, { es: string; en: string }> = {
  wideStop: { es: "Stop lejano", en: "Wide stop" },
  earlyExit: { es: "Salida anticipada", en: "Early exit" },
  lateEntry: { es: "Entrada tardía", en: "Late entry" },
  oversized: { es: "Tamaño excesivo", en: "Oversized position" },
  noPlan: { es: "Operado sin plan", en: "Traded without plan" },
  partialPlan: { es: "Plan parcial", en: "Partial plan" },
};

function buildMistakeBreakdown(trades: Trade[]): MistakeRow[] {
  const inPlan = trades.filter((t) => t.compliance === "yes");
  const expInPlan = inPlan.length
    ? inPlan.reduce((s, t) => s + t.netPnl, 0) / inPlan.length
    : 0;
  const broke = trades.filter((t) => t.compliance !== "yes");

  const cats: Record<string, { count: number; cost: number }> = {};
  for (const t of broke) {
    let key: string;
    // Priority: most-specific mistake → least-specific. The order
    // matters so each trade lands in exactly one bucket and the
    // buckets come out diverse (not all clumped into one category).
    if (t.compliance === "no") key = "noPlan";
    else if (t.mae < -1) key = "wideStop";
    else if (t.rMultiple > 0 && t.mfe > t.rMultiple + 0.5) key = "earlyExit";
    else if (t.rMultiple < 0 && t.rMultiple > -0.95) key = "lateEntry";
    else if (Math.abs(t.netPnl) > 100) key = "oversized";
    else key = "partialPlan";

    if (!cats[key]) cats[key] = { count: 0, cost: 0 };
    cats[key].count += 1;
    cats[key].cost += expInPlan - t.netPnl;
  }

  return Object.entries(cats)
    .map(([key, v]) => ({
      key,
      es: MISTAKE_LABELS[key].es,
      en: MISTAKE_LABELS[key].en,
      count: v.count,
      cost: v.cost,
    }))
    .sort((a, b) => b.cost - a.cost);
}

/* ============================================================
   Animated checkbox — SVG path draws in when toggled on
   ============================================================ */

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden="true"
      className="overflow-visible"
    >
      <motion.path
        d="M5 12.5 L10 17.5 L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ duration: 0.32, ease: EASE }}
      />
    </svg>
  );
}

function ChecklistRow({
  item,
  checked,
  onToggle,
  accent,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
  accent: boolean;
}) {
  const { lang } = useLang();
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className="w-full flex items-center gap-3 group text-left"
      >
        <span
          className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            checked
              ? accent
                ? "bg-white/10 border-white/20 text-primary"
                : "bg-pnl-pos/20 border-pnl-pos/60 text-pnl-pos"
              : "border-white/15 text-transparent group-hover:border-white/30"
          }`}
        >
          <CheckMark checked={checked} />
        </span>
        <span
          className={`text-sm transition-colors ${
            checked
              ? "text-tertiary"
              : "text-secondary group-hover:text-primary"
          }`}
        >
          {lang === "es" ? item.es : item.en}
        </span>
      </button>
    </li>
  );
}

/* ============================================================
   Day-score dots (0-5)
   ============================================================ */

function DayScoreDots({
  value,
  onChange,
  idPrefix,
}: {
  value: number;
  onChange: (v: number) => void;
  idPrefix: string;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="radiogroup"
      aria-label="Day score"
    >
      {[0, 1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const isSelected = n === value;
        return (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Score ${n}`}
            onClick={() => onChange(n)}
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.18 }}
            className="relative w-5 h-5"
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-white"
              animate={{
                opacity: active ? 1 : 0,
                scale: active ? 1 : 0.7,
              }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
            />
            {isSelected && (
              <motion.span
                layoutId={`${idPrefix}-day-score-ring`}
                className="absolute -inset-1 rounded-full border border-white/30"
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Ritual column (Pre-market / Post-market)
   ============================================================ */

function RitualColumn({
  title,
  items,
  state,
  onToggle,
  score,
  onScoreChange,
  note,
  onNoteChange,
  accent,
  idPrefix,
  placeholder,
}: {
  title: string;
  items: ChecklistItem[];
  state: Record<string, boolean>;
  onToggle: (id: string) => void;
  score: number;
  onScoreChange: (n: number) => void;
  note: string;
  onNoteChange: (s: string) => void;
  accent: boolean;
  idPrefix: string;
  placeholder: string;
}) {
  const { t } = useLang();
  const checkedCount = items.filter((it) => state[it.id]).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              accent ? "bg-white" : "bg-pnl-pos"
            }`}
          />
          <h3 className="font-medium text-primary">{title}</h3>
        </div>
        <span className="pill bg-white/5 text-tertiary border border-white/10 tnum">
          {checkedCount}/{items.length}
        </span>
      </div>

      <ul className="space-y-2.5">
        {items.map((it) => (
          <ChecklistRow
            key={it.id}
            item={it}
            checked={!!state[it.id]}
            onToggle={() => onToggle(it.id)}
            accent={accent}
          />
        ))}
      </ul>

      <div className="space-y-1.5">
        <div className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
          {t("dayScore")}
        </div>
        <DayScoreDots
          value={score}
          onChange={onScoreChange}
          idPrefix={idPrefix}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-note`}
          className="text-[11px] uppercase tracking-[0.15em] text-tertiary"
        >
          {t("freeNote")}
        </label>
        <textarea
          id={`${idPrefix}-note`}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm text-primary placeholder:text-tertiary focus:border-white/20 focus:bg-white/8 outline-none transition-colors resize-none custom-scroll"
        />
      </div>
    </div>
  );
}

/* ============================================================
   Compliance ring — SVG circular progress with animated stroke.
   Fills dramatically when scrolled into view: an initial fast sweep
   overshoots the target then settles back, with a brief scale-pop
   on the whole ring for emphasis. Falls back to a simple linear
   draw under reduced-motion preferences.
   ============================================================ */

function ComplianceRing({ pct, label }: { pct: number; label: string }) {
  const reduce = useReducedMotion();
  const R = 52;
  const C = 2 * Math.PI * R;
  const targetOffset = C * (1 - pct);
  // Brief overshoot (~6% of remaining stroke) for dramatic draw-in.
  const overshoot = C * 0.06 * (1 - pct);
  const overshootOffset = Math.max(0, targetOffset - overshoot);
  const tone: "pos" | "warn" | "neg" =
    pct > 0.7 ? "pos" : pct > 0.5 ? "warn" : "neg";
  const colorVar =
    tone === "pos"
      ? "--pnl-pos"
      : tone === "warn"
      ? "--pnl-warn"
      : "--pnl-neg";
  const toneClass =
    tone === "pos"
      ? "text-pnl-pos"
      : tone === "warn"
      ? "text-pnl-warn"
      : "text-pnl-neg";
  return (
    <motion.div
      className="relative w-40 h-40 md:w-44 md:h-44 mx-auto"
      initial={reduce ? undefined : { scale: 0.92, opacity: 0.5 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={8}
        />
        <motion.circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={`rgb(var(${colorVar}))`}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          whileInView={
            reduce
              ? { strokeDashoffset: targetOffset }
              : {
                  strokeDashoffset: [
                    C,
                    overshootOffset,
                    targetOffset,
                  ],
                }
          }
          viewport={{ once: true, margin: "-40px" }}
          transition={
            reduce
              ? { duration: 1.4, ease: EASE, delay: 0.15 }
              : {
                  duration: 1.9,
                  ease: EASE,
                  delay: 0.15,
                  times: [0, 0.62, 1],
                }
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-3xl md:text-4xl font-bold tnum ${toneClass} leading-none`}>
          <CountUp to={pct * 100} decimals={0} suffix="%" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary mt-1.5 text-center">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Traffic light — green / amber / red, active bulb carries a
   static LED-style halo (blur) plus a dome specular highlight.
   (No ambient infinite animations — per the "no infinite animations
   except Ticker" polish rule.)
   ============================================================ */

function TrafficLight({ level }: { level: "green" | "amber" | "red" }) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const label =
    lang === "es"
      ? level === "green"
        ? "Disciplina alta"
        : level === "amber"
        ? "Disciplina media"
        : "Disciplina baja"
      : level === "green"
      ? "High discipline"
      : level === "amber"
      ? "Medium discipline"
      : "Low discipline";
  const lights: { key: "green" | "amber" | "red"; color: string; rgb: string }[] = [
    { key: "green", color: "rgb(var(--sig-green))", rgb: "var(--sig-green)" },
    { key: "amber", color: "rgb(var(--sig-amber))", rgb: "var(--sig-amber)" },
    { key: "red", color: "rgb(var(--sig-red))", rgb: "var(--sig-red)" },
  ];
  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={label}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 border border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
        {lights.map((l) => {
          const active = l.key === level;
          return (
            <div key={l.key} className="relative w-2.5 h-2.5">
              {/* Outer halo — only on the active bulb (static glow, no
                  infinite pulse per the "no ambient infinite animations"
                  polish rule). */}
              {active && !reduce && (
                <span
                  aria-hidden
                  className="absolute -inset-1.5 rounded-full pointer-events-none"
                  style={{
                    backgroundColor: l.color,
                    filter: "blur(5px)",
                    opacity: 0.55,
                  }}
                />
              )}
              {/* Bulb body — gets a stronger glow when active. */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: l.color,
                  boxShadow: active
                    ? `0 0 6px 1px rgb(${l.rgb} / 0.8), inset 0 0 3px rgb(255 255 255 / 0.5)`
                    : "inset 0 0 2px rgb(0 0 0 / 0.4)",
                }}
                animate={{
                  opacity: active ? 1 : 0.22,
                  scale: active ? 1 : 0.7,
                }}
                transition={{ duration: 0.3 }}
              />
              {/* Inner specular highlight — gives the bulb a dome look. */}
              <span
                aria-hidden
                className="absolute top-[1px] left-[1px] w-[3px] h-[3px] rounded-full bg-white/55 pointer-events-none"
                style={{ opacity: active ? 0.85 : 0.18 }}
              />
            </div>
          );
        })}
      </div>
      <span className="text-[11px] uppercase tracking-[0.15em] text-tertiary">
        {label}
      </span>
    </div>
  );
}

/* ============================================================
   Diverging bar — in-plan vs out-of-plan expectancy
   ============================================================ */

function DivergingBar({
  inPlan,
  outPlan,
}: {
  inPlan: number;
  outPlan: number;
}) {
  const maxAbs = Math.max(Math.abs(inPlan), Math.abs(outPlan), 1);
  const inPct = (Math.abs(inPlan) / maxAbs) * 50;
  const outPct = (Math.abs(outPlan) / maxAbs) * 50;
  return (
    <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/25 z-10" />
      <motion.div
        className="absolute top-0 bottom-0 right-1/2 bg-pnl-pos/80"
        initial={{ width: 0 }}
        whileInView={{ width: `${inPct}%` }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
      />
      <motion.div
        className="absolute top-0 bottom-0 left-1/2 bg-pnl-neg/80"
        initial={{ width: 0 }}
        whileInView={{ width: `${outPct}%` }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
      />
    </div>
  );
}

/* ============================================================
   P&L bar chart (weekly / monthly)
   ============================================================ */

function PnlBarChart({ data }: { data: { label: string; pnl: number }[] }) {
  const { lang } = useLang();
  // Mobile has no hover — track which bar was last tapped so its value
  // tooltip stays visible. Tapping the same bar again dismisses it.
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.pnl)), 1);
  return (
    <div className="flex items-stretch gap-1.5 sm:gap-2 h-44">
      {data.map((d, i) => {
        const pct = (Math.abs(d.pnl) / maxAbs) * 100;
        const isPos = d.pnl >= 0;
        return (
          <div
            key={d.label + i}
            className="flex-1 flex flex-col items-center gap-2 min-w-0 group"
            onPointerDown={() =>
              setActiveIdx((cur) => (cur === i ? null : i))
            }
          >
            <div className="relative w-full flex-1">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 -translate-y-1/2" />
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${pct / 2}%`, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.04 * i, ease: EASE }}
                className={`absolute left-1/2 -translate-x-1/2 w-2/3 rounded-sm group-hover:w-4/5 transition-all ${
                  isPos
                    ? "bottom-1/2 bg-pnl-pos/80"
                    : "top-1/2 bg-pnl-neg/80"
                }`}
              />
              <div
                className={`absolute left-1/2 -translate-x-1/2 text-[9px] tnum whitespace-nowrap ${
                  isPos
                    ? "bottom-[calc(50%+6px)]"
                    : "top-[calc(50%+6px)]"
                } text-tertiary transition-opacity ${
                  activeIdx === i
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {isPos ? "+" : "−"}
                {fmtInt(Math.abs(d.pnl), lang)}
              </div>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-tertiary tnum truncate">
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   History timeline — derived from TRADES grouped by day
   ============================================================ */

interface HistoryEntry {
  key: string;
  date: Date;
  sumPnl: number;
  avgScore: number;
  compliancePct: number;
  count: number;
  note: string;
  compliance: "yes" | "partial" | "no";
}

function buildHistory(trades: Trade[]): HistoryEntry[] {
  const groups = new Map<string, Trade[]>();
  for (const t of trades) {
    const k = t.closedAt.toISOString().slice(0, 10);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(t);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([key, ts]) => {
      const sumPnl = ts.reduce((s, t) => s + t.netPnl, 0);
      const avgScore = Math.round(
        ts.reduce((s, t) => s + t.dayScore, 0) / ts.length
      );
      const complied = ts.filter((t) => t.compliance === "yes").length;
      const compliancePct = complied / ts.length;
      const overall: "yes" | "partial" | "no" =
        compliancePct >= 0.8
          ? "yes"
          : compliancePct >= 0.5
          ? "partial"
          : "no";
      return {
        key,
        date: ts[0].closedAt,
        sumPnl,
        avgScore,
        compliancePct,
        count: ts.length,
        note: ts[0].entryNote,
        compliance: overall,
      };
    });
}

/* ============================================================
   Main JournalPage
   ============================================================ */

export function JournalPage() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();

  // Ritual state
  const [preState, setPreState] = useState<Record<string, boolean>>({
    plan: true,
    limits: true,
    mind: false,
    news: false,
  });
  const [postState, setPostState] = useState<Record<string, boolean>>({
    respect: false,
    mgmt: false,
    emotions: false,
    learn: false,
  });
  const [preScore, setPreScore] = useState(3);
  const [postScore, setPostScore] = useState(4);
  const [preNote, setPreNote] = useState("");
  const [postNote, setPostNote] = useState("");

  // Review tab
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");

  const weekly = useMemo(
    () =>
      weekdayBreakdown(TRADES).map((d) => ({ label: d.day, pnl: d.pnl })),
    []
  );
  const monthly = useMemo(
    () =>
      monthlyBreakdown(TRADES).map((d) => ({ label: d.month, pnl: d.pnl })),
    []
  );
  const history = useMemo(() => buildHistory(TRADES), []);

  // Discipline invoice breakdown — derived from the full TRADES set.
  const mistakeRows = useMemo(() => buildMistakeBreakdown(TRADES), []);
  const totalMistakeCount = useMemo(
    () => mistakeRows.reduce((s, r) => s + r.count, 0),
    [mistakeRows]
  );
  const totalMistakeCost = useMemo(
    () => mistakeRows.reduce((s, r) => s + r.cost, 0),
    [mistakeRows]
  );

  const compliancePct = METRICS.compliancePct;
  const costOfIndiscipline = METRICS.costOfIndiscipline;
  const expInPlan = METRICS.expectancyInPlan;
  const expOutPlan = METRICS.expectancyBrokePlan;

  // Sign-aware headline display: when the synthetic dataset happens to
  // have broke-plan trades outperform in-plan trades, the "cost" goes
  // negative (i.e., a saver). We display the magnitude with the
  // appropriate sign + tone so the math is always honest, and adapt
  // the supporting copy so the narrative still reads cleanly.
  const isRealCost = costOfIndiscipline > 0;
  const headlineValue = Math.abs(costOfIndiscipline);
  const headlinePrefix = isRealCost ? "−$" : "+$";
  const headlineTone = isRealCost ? "text-pnl-neg" : "text-pnl-pos";
  const headlineShadow = isRealCost
    ? "0 0 18px rgb(var(--pnl-neg) / 0.45)"
    : "0 0 18px rgb(var(--pnl-pos) / 0.35)";

  const trafficLevel: "green" | "amber" | "red" =
    compliancePct > 0.7 ? "green" : compliancePct > 0.5 ? "amber" : "red";

  const togglePre = (id: string) =>
    setPreState((p) => ({ ...p, [id]: !p[id] }));
  const togglePost = (id: string) =>
    setPostState((p) => ({ ...p, [id]: !p[id] }));

  // Bilingual helper for inline labels.
  const L = (es: string, en: string) => (lang === "es" ? es : en);

  return (
    <div className="relative p-5 md:p-6 space-y-5">
      {/* Header */}
      <Reveal>
        <header className="space-y-3 relative">
          {/* Soft static accent halo behind the eyebrow — mirrors the
              AnalyticsPage header for cross-tab visual continuity. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -left-10 w-56 h-32 rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--accent-base) / 0.16), transparent 70%)",
            }}
          />
          <div className="relative">
            <Eyebrow>{t("journalEyebrow")}</Eyebrow>
            <h1 className="font-medium tracking-[-0.02em] text-primary text-2xl md:text-3xl">
              {t("journalTitle")}
            </h1>
            <p className="text-sm text-tertiary mt-1.5 max-w-2xl leading-relaxed">
              {L(
                "Ritual diario, coste real de la indisciplina y semáforo de cumplimiento.",
                "Daily ritual, real cost of indiscipline and compliance traffic light."
              )}
            </p>
          </div>
        </header>
      </Reveal>

      {/* Daily ritual card */}
      <Reveal delay={0.05}>
        <PremiumCard className="depth-2 hover:depth-3 transition-shadow duration-300 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-5 bg-white rounded-full shrink-0" />
              <h2 className="font-medium text-primary text-base md:text-lg truncate">
                {t("ritualTitle")}
              </h2>
            </div>
            <span className="pill bg-white/8 text-primary border border-white/20 shrink-0">
              {L("Hoy", "Today")}
            </span>
          </div>

          <div className="relative grid md:grid-cols-2 gap-6 md:gap-8">
            <RitualColumn
              title={t("preMarket")}
              items={PRE_ITEMS}
              state={preState}
              onToggle={togglePre}
              score={preScore}
              onScoreChange={setPreScore}
              note={preNote}
              onNoteChange={setPreNote}
              accent
              idPrefix="pre"
              placeholder={
                lang === "es" ? PRE_PLACEHOLDER.es : PRE_PLACEHOLDER.en
              }
            />

            {/* Horizontal divider — mobile only, sits BETWEEN the two
                columns (md:hidden removes it from the 2-col desktop
                grid so the absolute vertical divider below takes over). */}
            <div
              className="md:hidden col-span-full -my-1"
              aria-hidden="true"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <RitualColumn
              title={t("postMarket")}
              items={POST_ITEMS}
              state={postState}
              onToggle={togglePost}
              score={postScore}
              onScoreChange={setPostScore}
              note={postNote}
              onNoteChange={setPostNote}
              accent={false}
              idPrefix="post"
              placeholder={
                lang === "es" ? POST_PLACEHOLDER.es : POST_PLACEHOLDER.en
              }
            />

            {/* Vertical divider — desktop only. Absolute so it doesn't
                participate in grid layout; DOM position is irrelevant. */}
            <div
              className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 pointer-events-none"
              aria-hidden="true"
            >
              <div className="h-full w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
            </div>
          </div>
        </PremiumCard>
      </Reveal>

      {/* Discipline report — HERO */}
      <Reveal delay={0.1}>
        <PremiumCard className="depth-3 hover:depth-4 transition-shadow duration-300 relative overflow-hidden p-5 md:p-6">
          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1 h-5 bg-pnl-warn rounded-full shrink-0" />
                <h2 className="font-medium text-primary text-base md:text-lg truncate">
                  {t("disciplineReport")}
                </h2>
              </div>
              <TrafficLight level={trafficLevel} />
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center">
              {/* Compliance ring */}
              <div className="flex flex-col items-center">
                <ComplianceRing
                  pct={compliancePct}
                  label={t("compliancePct")}
                />
              </div>

              {/* Cost of indiscipline — big dramatic number.
                  Sign-aware: red "−$X" when indiscipline actually cost
                  money (cost > 0), green "+$X" when the dataset had
                  broke-plan trades outperform (cost < 0, a saver).
                  Copy adapts so the narrative still reads cleanly. */}
              <div className="flex flex-col items-center text-center">
                <div className={`flex items-center gap-2 mb-2 justify-center ${headlineTone}`}>
                  <svg
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3 L22 20 L2 20 Z"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="9"
                      x2="12"
                      y2="14"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="17.4" r="0.9" fill="currentColor" />
                  </svg>
                  <span className="text-[11px] uppercase tracking-[0.15em] font-semibold">
                    {t("costOfIndiscipline")}
                  </span>
                </div>
                <motion.div
                  className={`relative font-bold tracking-tight text-4xl md:text-5xl tnum ${headlineTone}`}
                  initial={reduce ? undefined : { opacity: 0.55, scale: 0.94 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                  style={{ textShadow: headlineShadow }}
                >
                  <CountUp
                    to={headlineValue}
                    decimals={0}
                    prefix={headlinePrefix}
                    duration={2.4}
                  />
                </motion.div>
                <div className="mt-2 text-[11px] text-tertiary max-w-[15rem]">
                  {isRealCost
                    ? lang === "es" ? COST_COPY.es.cost : COST_COPY.en.cost
                    : lang === "es" ? COST_COPY.es.saver : COST_COPY.en.saver}
                </div>
              </div>

              {/* Expectancy in-plan vs out-of-plan */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md p-3 bg-pnl-pos/10 border border-pnl-pos/20">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
                      {t("expInPlan")}
                    </div>
                    <div className="text-pnl-pos font-bold text-lg tnum mt-1">
                      <Money value={expInPlan} sign compact colorizeSign />
                    </div>
                  </div>
                  <div className="rounded-md p-3 bg-pnl-neg/10 border border-pnl-neg/20">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-tertiary">
                      {t("expOutPlan")}
                    </div>
                    <div className="text-pnl-neg font-bold text-lg tnum mt-1">
                      <Money value={expOutPlan} sign compact colorizeSign />
                    </div>
                  </div>
                </div>
                <DivergingBar inPlan={expInPlan} outPlan={expOutPlan} />
                <div className="flex items-center justify-between text-[10px] text-tertiary uppercase tracking-wider">
                  <span>{L("En plan", "In plan")}</span>
                  <span>{L("Fuera de plan", "Out of plan")}</span>
                </div>
              </div>
            </div>

            {/* ============ DISCIPLINE INVOICE — KEY FEATURE ============
                A real invoice-style breakdown of each indiscipline type
                with count, % of total mistakes, and dollar cost. The
                total row uses a heavier 2px top rule (Bloomberg-style
                convention) and red bold text. Per-row dividers are
                dashed — invoice convention. */}
            <div className="pt-5 border-t border-white/10">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1 h-4 bg-pnl-neg rounded-full shrink-0" />
                  <h3 className="text-[13px] font-medium text-primary tracking-[-0.01em]">
                    {L(
                      "Desglose por tipo de indisciplina",
                      "Breakdown by indiscipline type"
                    )}
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-[0.14em] text-tertiary tnum">
                  {L("Coste en $", "Cost in $")}
                </span>
              </div>

              {/* Table header row */}
              <div className="grid grid-cols-[1fr_2.5rem_3rem_5.5rem] gap-x-3 px-2 pb-2 text-[10px] uppercase tracking-[0.14em] text-tertiary border-b border-white/10 font-mono">
                <div>{L("Tipo", "Type")}</div>
                <div className="text-right">#</div>
                <div className="text-right">%</div>
                <div className="text-right">{L("Coste", "Cost")}</div>
              </div>

              {/* Body rows */}
              <div>
                {mistakeRows.map((row, i) => {
                  const pctOfTotal = totalMistakeCount
                    ? row.count / totalMistakeCount
                    : 0;
                  const isSaver = row.cost < 0;
                  return (
                    <motion.div
                      key={row.key}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.05,
                        ease: EASE,
                      }}
                      className="grid grid-cols-[1fr_2.5rem_3rem_5.5rem] gap-x-3 px-2 py-2.5 items-center text-sm border-b border-dashed border-white/10 hover:bg-white/[0.025] transition-colors font-mono"
                    >
                      <div className="text-secondary min-w-0 truncate">
                        {lang === "es" ? row.es : row.en}
                      </div>
                      <div className="text-right tnum text-secondary">
                        {fmtInt(row.count, lang)}
                      </div>
                      <div className="text-right tnum text-tertiary">
                        {fmtPct(pctOfTotal, lang, 0)}
                      </div>
                      <div
                        className={`text-right tnum font-semibold ${
                          isSaver ? "text-pnl-pos" : "text-pnl-neg"
                        }`}
                      >
                        {isSaver ? "+" : "−"}
                        {fmtMoney(Math.abs(row.cost), lang, { decimals: 0 })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total row — heavier 2px top rule (Bloomberg convention),
                  bold red label + bold total cost. Sign-aware: red for
                  a real net cost, green for a net saver. */}
              <div className="grid grid-cols-[1fr_2.5rem_3rem_5.5rem] gap-x-3 px-2 py-3 items-center mt-1 border-t-2 border-white/15 font-mono">
                <div
                  className={`text-[11px] uppercase tracking-[0.15em] font-bold ${
                    totalMistakeCost < 0 ? "text-pnl-pos" : "text-pnl-neg"
                  }`}
                >
                  {L("Total", "Total")}
                </div>
                <div className="text-right tnum font-bold text-primary">
                  {fmtInt(totalMistakeCount, lang)}
                </div>
                <div className="text-right tnum text-tertiary">100%</div>
                <div
                  className={`text-right tnum font-bold ${
                    totalMistakeCost < 0 ? "text-pnl-pos" : "text-pnl-neg"
                  }`}
                >
                  {totalMistakeCost < 0 ? "+" : "−"}
                  {fmtMoney(Math.abs(totalMistakeCost), lang, { decimals: 0 })}
                </div>
              </div>

              {/* Footnote — ties the invoice total to the headline number. */}
              <div className="mt-2 px-2 text-[10px] text-tertiary/80 italic leading-relaxed">
                {L(
                  "Σ (expectancy en plan − netPnl) sobre operaciones fuera de plan. El total coincide con el coste de indisciplina mostrado arriba.",
                  "Σ (expectancy in plan − netPnl) over out-of-plan trades. Total matches the cost of indiscipline shown above."
                )}
              </div>
            </div>
          </div>
        </PremiumCard>
      </Reveal>

      {/* Review tabs */}
      <Reveal delay={0.15}>
        <PremiumCard className="depth-2 hover:depth-3 transition-shadow duration-300 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 h-5 bg-white rounded-full shrink-0" />
              <h2 className="font-medium text-primary text-base md:text-lg truncate">
                {t("review2")}
              </h2>
            </div>
            <div
              role="tablist"
              aria-label={t("review2")}
              className="relative inline-flex bg-white/5 border border-white/10 rounded-full p-1"
            >
              {(["weekly", "monthly"] as const).map((key) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="review-tabpanel"
                    onClick={() => setTab(key)}
                    className="relative px-4 py-1.5 text-xs font-medium"
                  >
                    {active && (
                      <motion.span
                        layoutId="review-tab-pill"
                        className="absolute inset-0 rounded-full bg-white/10 border border-white/20"
                        transition={{
                          type: "spring",
                          stiffness: 360,
                          damping: 28,
                        }}
                      />
                    )}
                    <span
                      className={`relative ${
                        active ? "text-primary" : "text-tertiary"
                      }`}
                    >
                      {t(key)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              role="tabpanel"
              id="review-tabpanel"
              aria-label={tab === "weekly" ? t("weekly") : t("monthly")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {tab === "weekly" ? (
                <PnlBarChart data={weekly} />
              ) : (
                <PnlBarChart data={monthly} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-tertiary uppercase tracking-[0.14em]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-pnl-pos/70" />
              {L("Positivo", "Positive")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-pnl-neg/70" />
              {L("Negativo", "Negative")}
            </span>
          </div>
        </PremiumCard>
      </Reveal>

      {/* History timeline */}
      <Reveal delay={0.2}>
        <PremiumCard className="depth-1 hover:depth-2 transition-shadow duration-300 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-5 bg-white rounded-full shrink-0" />
            <h2 className="font-medium text-primary text-base md:text-lg">
              {t("history")}
            </h2>
          </div>

          <ul className="space-y-3">
            {history.map((entry, i) => {
              const tone =
                entry.sumPnl > 0
                  ? "pos"
                  : entry.sumPnl < 0
                  ? "neg"
                  : "warn";
              const borderColor =
                tone === "pos"
                  ? "border-l-pnl-pos"
                  : tone === "neg"
                  ? "border-l-pnl-neg"
                  : "border-l-pnl-warn";
              const complianceVariant =
                entry.compliance === "yes"
                  ? "pos"
                  : entry.compliance === "partial"
                  ? "warn"
                  : "neg";
              const complianceLabel =
                entry.compliance === "yes"
                  ? t("complied")
                  : entry.compliance === "partial"
                  ? t("partial")
                  : t("notComplied");
              return (
                <motion.li
                  key={entry.key}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.06 * i,
                    ease: EASE,
                  }}
                  whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                  className={`liquid-glass depth-1 hover:depth-2 transition-shadow duration-300 rounded-card border-l-2 ${borderColor} p-4`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex flex-col items-center justify-center w-11 h-11 rounded-md bg-white/5 border border-white/10 shrink-0">
                        <div className="text-[9px] uppercase tracking-[0.14em] text-tertiary leading-none">
                          {entry.date
                            .toLocaleDateString(
                              lang === "es" ? "es-ES" : "en-US",
                              { month: "short" }
                            )
                            .replace(".", "")}
                        </div>
                        <div className="text-lg font-bold tnum text-primary leading-none mt-0.5">
                          {entry.date.getDate()}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-tertiary tnum">
                            {fmtDate(entry.date, lang)}
                          </span>
                          <span className="text-tertiary" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-[11px] text-tertiary tnum">
                            {entry.count}{" "}
                            {L("ops.", "trades")}
                          </span>
                          <span className="text-tertiary" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-[11px] text-tertiary tnum">
                            {t("dayScore")}:{" "}
                            <span className="text-primary font-medium">
                              {entry.avgScore}/5
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-secondary mt-1 line-clamp-1">
                          {entry.note}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Chip variant={complianceVariant}>{complianceLabel}</Chip>
                      <div
                        className={`font-bold tnum text-base md:text-lg ${
                          tone === "pos"
                            ? "text-pnl-pos"
                            : tone === "neg"
                            ? "text-pnl-neg"
                            : "text-pnl-warn"
                        }`}
                      >
                        <Money value={entry.sumPnl} sign colorizeSign />
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </PremiumCard>
      </Reveal>

      {/* Footer spacer so last card breathes inside the scroll
          container. Two-pixel tail keeps the final card's depth-2
          hover shadow from being clipped by the demo window's
          bottom edge. */}
      <div className="h-2" aria-hidden="true" />
    </div>
  );
}
