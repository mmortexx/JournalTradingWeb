"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Share2, Check, Link2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Reveal } from "@/components/tj/Reveal";
import { asset } from "@/lib/asset";

/**
 * FeaturePageNav — cross-navigation section for feature subpages.
 * Sits between the page content and FinalCTANew. Provides:
 *  - A "Compartir" (Share) button using the Web Share API with a
 *    clipboard-copy fallback (graceful on desktop browsers without
 *    Web Share).
 *  - Prev / Next links to the other feature subpages so visitors can
 *    browse the three deep-dive axes (Métricas → Disciplina → Seguridad)
 *    without going back to the /features overview.
 *  - A "Sigue explorando" card grid linking to all three subpages,
 *    highlighting the current one.
 *
 * The component is fully theme-aware (uses --divider, --surface, text-primary/
 * secondary/tertiary tokens) and matches the site's liquid-glass material
 * language.
 */

type Axis = "metricas" | "disciplina" | "seguridad";

const AXES: Record<
  Axis,
  { href: string; labelEs: string; labelEn: string; descEs: string; descEn: string; icon: string }
> = {
  metricas: {
    href: "/features/metricas",
    labelEs: "Métricas",
    labelEn: "Metrics",
    descEs: "40+ ratios institucionales y calculadora de riesgo",
    descEn: "40+ institutional ratios and risk calculator",
    icon: "M2 13V7M6 13V3M10 13V9M14 13V5",
  },
  disciplina: {
    href: "/features/disciplina",
    labelEs: "Disciplina",
    labelEn: "Discipline",
    descEs: "El Guardián frena antes del error",
    descEn: "The Guardian brakes before the error",
    icon: "M8 1.6 2.9 3.8v3.5c0 3.1 2.2 5.5 5.1 6.5 2.9-1 5.1-3.4 5.1-6.5V3.8L8 1.6Z",
  },
  seguridad: {
    href: "/features/seguridad",
    labelEs: "Seguridad",
    labelEn: "Security",
    descEs: "Local-first, sin nube ni cuentas",
    descEn: "Local-first, no cloud, no accounts",
    icon: "M5 7V5a3 3 0 016 0v2M4 7h8v7H4V7z",
  },
};

const ORDER: Axis[] = ["metricas", "disciplina", "seguridad"];

interface FeaturePageNavProps {
  current: Axis;
}

export function FeaturePageNav({ current }: FeaturePageNavProps) {
  const { lang } = useLang();
  const es = lang === "es";
  const [copied, setCopied] = useState(false);

  const currentIdx = ORDER.indexOf(current);
  const prev = currentIdx > 0 ? ORDER[currentIdx - 1] : null;
  const next = currentIdx < ORDER.length - 1 ? ORDER[currentIdx + 1] : null;
  const router = useRouter();

  // Keyboard navigation: Alt + ArrowLeft/ArrowRight to browse between
  // feature subpages without scrolling to the bottom nav. Respects
  // reduced-motion users (no smooth scroll, just route change). Skips
  // when the user is typing in an input/textarea/contenteditable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const dest = e.key === "ArrowLeft" ? prev : next;
      if (!dest) return;
      e.preventDefault();
      router.push(asset(AXES[dest].href));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — no-op.
      }
    } else {
      // Fallback: copy to clipboard.
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API unavailable — no-op.
      }
    }
  };

  return (
    <section className="bg-veil relative border-t" style={{ borderColor: "rgb(var(--divider) / 0.06)" }}>
      <div className="relative max-w-page mx-auto px-5 md:px-8 py-14 md:py-16">
        {/* Share button — top-right */}
        <Reveal className="flex justify-center mb-10">
          <button
            onClick={handleShare}
            className="liquid-glass inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium text-primary border border-[rgb(var(--divider)/0.15)] hover:bg-[rgb(var(--divider)/0.06)] hover:-translate-y-0.5 transition-all duration-200"
            aria-label={es ? "Compartir esta página" : "Share this page"}
          >
            {copied ? (
              <>
                <Check size={15} className="text-pnl-pos" />
                {es ? "¡Enlace copiado!" : "Link copied!"}
              </>
            ) : (
              <>
                <Share2 size={15} className="text-tertiary" />
                {es ? "Compartir" : "Share"}
                <Link2 size={13} className="text-tertiary opacity-60" />
              </>
            )}
          </button>
        </Reveal>

        {/* Prev / Next navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {prev ? (
            <Reveal>
              <Link
                href={asset(AXES[prev].href)}
                className="group liquid-glass depth-1 rounded-card p-5 flex items-center gap-4 hover:depth-2 transition-all duration-300 hover:-translate-y-0.5 border border-[rgb(var(--divider)/0.1)]"
              >
                <span className="grid place-items-center w-10 h-10 rounded-full bg-[rgb(var(--divider)/0.06)] text-tertiary group-hover:text-primary group-hover:bg-[rgb(var(--divider)/0.1)] transition-colors flex-none">
                  <ArrowLeft size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.15em] text-tertiary font-semibold mb-1">
                    {es ? "Anterior" : "Previous"}
                    <kbd className="kbd ml-1.5">Alt ←</kbd>
                  </span>
                  <span className="block text-sm font-medium text-primary truncate">
                    {es ? AXES[prev].labelEs : AXES[prev].labelEn}
                  </span>
                </span>
              </Link>
            </Reveal>
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}
          {next ? (
            <Reveal delay={0.06}>
              <Link
                href={asset(AXES[next].href)}
                className="group liquid-glass depth-1 rounded-card p-5 flex items-center gap-4 hover:depth-2 transition-all duration-300 hover:-translate-y-0.5 border border-[rgb(var(--divider)/0.1)] md:flex-row-reverse md:text-right"
              >
                <span className="grid place-items-center w-10 h-10 rounded-full bg-[rgb(var(--divider)/0.06)] text-tertiary group-hover:text-primary group-hover:bg-[rgb(var(--divider)/0.1)] transition-colors flex-none">
                  <ArrowRight size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-[0.15em] text-tertiary font-semibold mb-1">
                    {es ? "Siguiente" : "Next"}
                    <kbd className="kbd ml-1.5">Alt →</kbd>
                  </span>
                  <span className="block text-sm font-medium text-primary truncate">
                    {es ? AXES[next].labelEs : AXES[next].labelEn}
                  </span>
                </span>
              </Link>
            </Reveal>
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}
        </div>

        {/* "Sigue explorando" — all three axes */}
        <Reveal delay={0.1}>
          <div className="text-center mb-6">
            <span className="eyebrow inline-flex items-center gap-2 justify-center text-tertiary">
              <span className="w-6 h-px bg-[rgb(var(--divider))] opacity-60" />
              {es ? "Sigue explorando" : "Keep exploring"}
              <span className="w-6 h-px bg-[rgb(var(--divider))] opacity-60" />
            </span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ORDER.map((axis, i) => {
            const isActive = axis === current;
            const a = AXES[axis];
            return (
              <Reveal key={axis} delay={i * 0.06}>
                <Link
                  href={asset(a.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative liquid-glass rounded-card p-5 block transition-all duration-300 hover:-translate-y-0.5 border ${
                    isActive
                      ? "border-[rgb(var(--accent-base)/0.4)] depth-2"
                      : "border-[rgb(var(--divider)/0.1)] depth-1 hover:depth-2"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-[rgb(var(--accent-base))]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-base))]" />
                      {es ? "Aquí" : "Here"}
                    </span>
                  )}
                  <span
                    className="grid place-items-center w-9 h-9 rounded-lg mb-3 transition-colors"
                    style={{
                      background: isActive
                        ? "rgb(var(--accent-base) / 0.14)"
                        : "rgb(var(--divider) / 0.06)",
                      color: isActive ? "rgb(var(--accent-base))" : "var(--ink-2)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d={a.icon} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="block text-sm font-semibold text-primary mb-1">
                    {es ? a.labelEs : a.labelEn}
                  </span>
                  <span className="block text-xs text-tertiary leading-relaxed">
                    {es ? a.descEs : a.descEn}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
