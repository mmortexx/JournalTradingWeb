"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";

type Cell = "yes" | "no" | "partial" | string;
type Row = { labelEs: string; labelEn: string; cells: [Cell, Cell, Cell] };

const ROWS: Row[] = [
  {
    labelEs: "Privacidad",
    labelEn: "Privacy",
    cells: [/* TJ */ "Local · tu equipo", /* cloud */ "Servidor ajeno", /* excel */ "Local · tu equipo"],
  },
  {
    labelEs: "Pago",
    labelEn: "Payment",
    cells: ["Único · desde $29", "Suscripción mensual", "Gratis"],
  },
  {
    labelEs: "Métricas",
    labelEn: "Metrics",
    cells: ["40+ institucionales", "10–20 básicas", "Manual / fórmulas"],
  },
  {
    labelEs: "Disciplina",
    labelEn: "Discipline",
    cells: ["yes", "no", "no"],
  },
  {
    labelEs: "Playbook en vivo",
    labelEn: "Live playbook",
    cells: ["yes", "no", "no"],
  },
  {
    labelEs: "Sin servidor",
    labelEn: "No server needed",
    cells: ["yes", "no", "yes"],
  },
  {
    labelEs: "Modo prop firm",
    labelEn: "Prop firm mode",
    cells: ["yes", "partial", "no"],
  },
  {
    labelEs: "Simulador Monte Carlo",
    labelEn: "Monte Carlo simulator",
    cells: ["yes-pro", "partial", "no"],
  },
  {
    labelEs: "Informe de track record",
    labelEn: "Track record report",
    cells: ["yes-pro", "no", "no"],
  },
];

/** Comparison table — Trading Journal vs cloud journals vs Excel. */
export function Comparison() {
  const { lang } = useLang();
  const es = lang === "es";

  const cols = [
    { key: "tj", label: es ? "Trading Journal" : "Trading Journal", sub: es ? "Esta app" : "This app", highlight: true },
    { key: "cloud", label: es ? "Journals en la nube" : "Cloud journals", sub: es ? "Suscripción" : "Subscription", highlight: false },
    { key: "excel", label: es ? "Excel / Sheets" : "Excel / Sheets", sub: es ? "Gratis" : "Free", highlight: false },
  ];

  return (
    <section className="section cv-auto relative overflow-hidden">
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>{es ? "Comparativa" : "Comparison"}</Eyebrow>
          <h2 className="mt-5 t-h2 text-primary">
            {es ? (
              <>
                No es lo mismo <span className="text-gradient">medir que apuntar.</span>
              </>
            ) : (
              <>
                Measuring is not <span className="text-gradient">the same as noting.</span>
              </>
            )}
          </h2>
          <p className="mt-4 text-lg text-secondary leading-relaxed">
            {es
              ? "Excel es libre pero mudo. La nube es cómoda pero cara y ajena. Esta app es local, honesta y tuya."
              : "Excel is free but silent. The cloud is convenient but costly and foreign. This app is local, honest and yours."}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10">
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="liquid-glass depth-3 rounded-card overflow-hidden relative transition-shadow duration-300"
          >
            {/* Horizontal scroll wrapper for mobile. */}
            <div className="overflow-x-auto">
              <div className="relative min-w-[680px]">
                <table className="w-full text-sm table-fixed tnum">
                  <colgroup>
                    <col className="w-[33%]" />
                    <col className="w-[33%]" />
                    <col className="w-[17%]" />
                    <col className="w-[17%]" />
                  </colgroup>
                {/* Header */}
                <thead>
                  <tr className="border-b">
                    <th scope="col" className="text-left p-5 md:p-6 text-xs uppercase tracking-[0.12em] font-semibold text-tertiary h-14 md:h-16 align-bottom">
                      {es ? "Característica" : "Feature"}
                    </th>
                    {cols.map((c) => (
                      <th
                        key={c.key}
                        scope="col"
                        className={`p-5 md:p-6 text-left align-top relative h-14 md:h-16 ${
                          c.highlight
                            ? "bg-[rgb(var(--divider)/0.08)] shadow-[inset_3px_0_0_0_rgb(var(--accent-base)),inset_0_-1px_0_0_rgb(var(--accent-base)/0.18)]"
                            : ""
                        }`}
                      >
                        {/* Premium top accent rail on the highlighted column —
                            a 2px gradient bar pinned to the top inside edge,
                            visible only when the column is highlighted. Reads
                            as a "recommended tier" marker (mirrors the Pro
                            pricing-card rail) and reinforces the inset accent
                            stroke on the left edge (R20-3c). */}
                        {c.highlight && (
                          <span
                            aria-hidden="true"
                            className="absolute top-0 left-3 right-3 h-[2px] rounded-full pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(90deg, transparent 0%, rgb(var(--accent-base) / 0.85) 30%, rgb(var(--accent-hover) / 0.95) 50%, rgb(var(--accent-base) / 0.85) 70%, transparent 100%)",
                            }}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`font-medium tracking-tight ${c.highlight ? "text-primary" : "text-primary"}`}>
                            {c.label}
                          </span>
                          {c.highlight && (
                            <span
                              className="pill border !text-[10px] uppercase tracking-[0.1em]"
                              style={{
                                background: "rgb(var(--accent-base) / 0.14)",
                                color: "rgb(var(--accent-base))",
                                borderColor: "rgb(var(--accent-base) / 0.35)",
                              }}
                            >
                              {es ? "Recomendado" : "Recommended"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-tertiary mt-1">{c.sub}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {ROWS.map((row, i) => (
                    <motion.tr
                      key={row.labelEs}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className={`border-b last:border-b-0 transition-colors hover:bg-[rgb(var(--divider)/0.05)] ${
                        i % 2 === 1 ? "bg-[rgb(var(--divider)/0.015)]" : ""
                      }`}
                    >
                      <th scope="row" className="text-left p-5 md:p-6 font-medium text-secondary text-[14px] h-16 md:h-[72px] align-middle">
                        {es ? row.labelEs : row.labelEn}
                      </th>
                      {row.cells.map((cell, j) => (
                        <td
                          key={j}
                          className={`p-5 md:p-6 align-middle relative h-16 md:h-[72px] ${
                            j === 0 ? "bg-[rgb(var(--divider)/0.06)] shadow-[inset_3px_0_0_0_rgb(var(--accent-base))]" : ""
                          }`}
                        >
                          <CellRenderer cell={cell} highlight={j === 0} es={es} delay={i * 0.05} />
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </motion.div>
        </Reveal>

        {/* Footnote */}
        <Reveal delay={0.12} className="mt-6">
          <p className="text-xs text-tertiary text-center max-w-2xl mx-auto">
            {es
              ? "Comparamos con la media de journals web populares y con Excel/Sheets sin plantillas avanzadas. Cada caso es distinto; este es el nuestro."
              : "We compare against the average of popular web journals and against Excel/Sheets without advanced templates. Each case is different; this is ours."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CellRenderer({
  cell,
  highlight,
  es,
  delay = 0,
}: {
  cell: Cell;
  highlight: boolean;
  es: boolean;
  delay?: number;
}) {
  if (cell === "yes") {
    return (
      <span className="inline-flex items-center gap-2">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ delay, type: "spring", stiffness: 320, damping: 16 }}
          className="inline-flex"
        >
          <CheckIcon />
        </motion.span>
        <span className="text-[13px] font-medium text-pnl-pos">{es ? "Sí" : "Yes"}</span>
      </span>
    );
  }
  if (cell === "yes-pro") {
    // "Yes" + a Pro pill — used for Pro-only features (Monte Carlo, track record report).
    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ delay, type: "spring", stiffness: 320, damping: 16 }}
          className="inline-flex"
        >
          <CheckIcon />
        </motion.span>
        <span className="text-[13px] font-medium text-pnl-pos">{es ? "Sí" : "Yes"}</span>
        <span className="pill bg-[rgb(var(--divider)/0.05)] text-primary border border-[rgb(var(--divider)/0.20)] !px-1.5 !py-0 !text-[10px] uppercase tracking-[0.1em]">
          Pro
        </span>
      </span>
    );
  }
  if (cell === "no") {
    return (
      <span className="inline-flex items-center gap-2">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ delay, type: "spring", stiffness: 320, damping: 16 }}
          className="inline-flex"
        >
          <CrossIcon />
        </motion.span>
        <span className="text-[13px] text-tertiary">{es ? "No" : "No"}</span>
      </span>
    );
  }
  if (cell === "partial") {
    return (
      <span className="inline-flex items-center gap-2">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ delay, type: "spring", stiffness: 320, damping: 16 }}
          className="inline-flex"
        >
          <PartialIcon />
        </motion.span>
        <span className="text-[13px] text-pnl-warn">{es ? "Parcial" : "Partial"}</span>
      </span>
    );
  }
  // Free-form string
  return (
    <span className={`text-[13px] tnum ${highlight ? "text-primary font-medium" : "text-secondary"}`}>{cell}</span>
  );
}

function CheckIcon() {
  return (
    <span className="inline-flex w-5 h-5 rounded-full bg-pnl-pos/15 items-center justify-center">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6.5l2.5 2.5L10 3.5" stroke="rgb(var(--pnl-pos))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function CrossIcon() {
  return (
    <span className="inline-flex w-5 h-5 rounded-full bg-pnl-neg/15 items-center justify-center">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 3l6 6M9 3l-6 6" stroke="rgb(var(--pnl-neg))" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function PartialIcon() {
  return (
    <span className="inline-flex w-5 h-5 rounded-full bg-pnl-warn/15 items-center justify-center">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6h8" stroke="rgb(var(--pnl-warn))" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
