"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

/**
 * SideRail — raíl lateral fijo del HTML de referencia (solo home):
 * puntos + etiquetas mono "01 · Inicio … 07 · Precios". Igual que en
 * el HTML, el raíl es NAVEGACIÓN, no solo scroll: los tres primeros
 * puntos anclan a las secciones de la home (con scroll-spy), y los
 * cuatro siguientes navegan a las páginas reales (/features con sus
 * anclas y /pricing).
 *
 * Oculto por debajo de 1100 px (igual que `.tj-rail` en el HTML) para
 * no pisar el contenido en pantallas estrechas.
 */
const ANCHORS = [
  { id: "top", num: "01", es: "Inicio", en: "Home" },
  { id: "overview", num: "02", es: "Vistazo", en: "Overview" },
  { id: "demo", num: "03", es: "Demo", en: "Demo" },
] as const;

const PAGES = [
  { href: "/features", num: "04", es: "Características", en: "Features" },
  { href: "/features#metricas", num: "05", es: "Métricas", en: "Metrics" },
  { href: "/features#guardian", num: "06", es: "Disciplina", en: "Discipline" },
  { href: "/pricing", num: "07", es: "Precios", en: "Pricing" },
] as const;

export function SideRail() {
  const { lang } = useLang();
  const es = lang === "es";
  const [activeId, setActiveId] = useState<string>("top");

  useEffect(() => {
    const elements = ANCHORS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.15, 0.3, 0.5, 1] }
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const labelStyle = (on: boolean) =>
    ({
      fontSize: 10.5,
      letterSpacing: "0.08em",
      color: on ? "var(--ink)" : "var(--ink-3)",
      fontWeight: on ? 600 : 400,
      opacity: on ? 1 : 0.6,
    }) as const;

  return (
    <nav
      aria-label={es ? "Índice de secciones" : "Section index"}
      className="fixed left-[22px] top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-[3px] min-[1100px]:flex"
    >
      {ANCHORS.map((s) => {
        const on = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => go(s.id)}
            className="group flex cursor-pointer items-center gap-[9px] border-0 bg-transparent p-0 py-[5px] text-left"
          >
            <span
              aria-hidden
              className="h-[7px] w-[7px] flex-none rounded-full transition-[background,border-color,transform] duration-250"
              style={{
                border: `1.5px solid ${on ? "rgb(var(--accent-base))" : "var(--ink-3)"}`,
                background: on ? "rgb(var(--accent-base))" : "transparent",
                transform: on ? "scale(1.3)" : "scale(1)",
              }}
            />
            <span
              className="tnum whitespace-nowrap transition-opacity duration-200 group-hover:opacity-100"
              style={labelStyle(on)}
            >
              {s.num} · {es ? s.es : s.en}
            </span>
          </button>
        );
      })}
      {PAGES.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="group flex items-center gap-[9px] py-[5px]"
        >
          <span
            aria-hidden
            className="h-[7px] w-[7px] flex-none rounded-full transition-[border-color] duration-200 group-hover:[border-color:rgb(var(--accent-base))]"
            style={{ border: "1.5px solid var(--ink-3)" }}
          />
          <span
            className="tnum whitespace-nowrap opacity-60 transition-opacity duration-200 group-hover:opacity-100"
            style={{ fontSize: 10.5, letterSpacing: "0.08em", color: "var(--ink-3)" }}
          >
            {p.num} · {es ? p.es : p.en}
          </span>
        </Link>
      ))}
    </nav>
  );
}
