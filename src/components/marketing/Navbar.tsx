"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

/**
 * Navbar — píldora flotante del HTML de referencia.
 *
 * Composición (desktop):
 *  - Píldora centrada de 60 px, max-w 1140, `rounded-full`, borde
 *    hairline y material de vidrio (blur 20 + saturate 1.5) con inset
 *    highlight. Al hacer scroll >10 px el vidrio se vuelve más opaco
 *    (70 % → 88 % de surface) y la sombra se hace más profunda.
 *  - Marca: cuadrado de vidrio con el trío de velas + wordmark serif.
 *  - "Producto" abre un MEGAMENÚ desplegable de 520 px con 4 entradas
 *    (Características / Métricas / Disciplina / Seguridad), cada una
 *    con icono, título y descripción — hover con retardo de cierre de
 *    140 ms, click alterna, Escape cierra, click en entrada cierra.
 *  - Demo y Precios como enlaces píldora.
 *  - Clúster derecho: reloj UTC en vivo con punto de sesión, toggle de
 *    tema (círculo 38 px), toggle de idioma y CTA "Comprar" en píldora
 *    accent con flecha.
 *
 * El drawer móvil (focus-trap, scroll-lock, Escape, cierre por ruta)
 * se conserva íntegro del navbar anterior — es maquinaria a11y probada.
 *
 * El reloj arranca en "--:--:--" tanto en servidor como en el primer
 * render de cliente y solo empieza a tickear dentro de un efecto — así
 * la hidratación nunca ve horas distintas (cero mismatch).
 */
export function Navbar() {
  const { t, lang, toggle } = useLang();
  const es = lang === "es";
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaCloseTimer = useRef<number | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Megamenú: hover con retardo de cierre + Escape. El retardo evita
  // que el panel se cierre al cruzar el hueco entre botón y panel.
  const megaEnter = () => {
    if (megaCloseTimer.current) window.clearTimeout(megaCloseTimer.current);
    setMegaOpen(true);
  };
  const megaLeave = () => {
    if (megaCloseTimer.current) window.clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  // Focus trap del drawer móvil (sin cambios respecto al navbar previo).
  useEffect(() => {
    if (!mobileOpen) return;
    const raf = requestAnimationFrame(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = getFocusables(drawer);
      const target = focusables[0] ?? drawer;
      target.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = getFocusables(drawer);
      if (focusables.length === 0) {
        e.preventDefault();
        drawer.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const inside = drawer.contains(active);
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!inside || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  // Scroll-lock del body con el drawer abierto.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Cerrar drawer y megamenú al cambiar de ruta.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const productItems: {
    href: string;
    labelEs: string;
    labelEn: string;
    descEs: string;
    descEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      href: "/features",
      labelEs: "Características",
      labelEn: "Features",
      descEs: "Calendario, playbooks, diario",
      descEn: "Calendar, playbooks, journal",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ),
    },
    {
      href: "/features#metricas",
      labelEs: "Métricas",
      labelEn: "Metrics",
      descEs: "Sharpe, profit factor, expectancy",
      descEn: "Sharpe, profit factor, expectancy",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 13V7M6 13V3M10 13V9M14 13V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/features#guardian",
      labelEs: "Disciplina",
      labelEn: "Discipline",
      descEs: "El Guardián frena antes del error",
      descEn: "The Guardian brakes before the error",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 1.6 2.9 3.8v3.5c0 3.1 2.2 5.5 5.1 6.5 2.9-1 5.1-3.4 5.1-6.5V3.8L8 1.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/features#local",
      labelEs: "Seguridad",
      labelEn: "Security",
      descEs: "Local-first, sin nube ni cuentas",
      descEn: "Local-first, no cloud, no accounts",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2.5" y="6.5" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 6.5V4.5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  // Enlaces del drawer móvil — mantiene Acerca de y FAQ (en desktop
  // viven en el footer; la píldora sigue al HTML: Producto/Demo/Precios).
  const drawerLinks: { href: string; labelEs: string; labelEn: string }[] = [
    { href: "/features", labelEs: "Características", labelEn: "Features" },
    { href: "/demo", labelEs: "Demo", labelEn: "Demo" },
    { href: "/pricing", labelEs: "Precios", labelEn: "Pricing" },
    { href: "/about", labelEs: "Acerca de", labelEn: "About" },
    { href: "/faq", labelEs: "FAQ", labelEn: "FAQ" },
  ];

  const pillLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className="rounded-full px-[15px] py-[9px] text-sm transition-colors duration-200"
        style={{
          color: active ? "var(--ink)" : "var(--ink-2)",
          background: active
            ? "color-mix(in srgb, var(--ink) 6%, transparent)"
            : "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--ink)";
          e.currentTarget.style.background =
            "color-mix(in srgb, var(--ink) 6%, transparent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = active ? "var(--ink)" : "var(--ink-2)";
          e.currentTarget.style.background = active
            ? "color-mix(in srgb, var(--ink) 6%, transparent)"
            : "transparent";
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-5 pt-3.5">
      <nav
        className="flex w-full max-w-[1140px] items-center justify-between gap-4 rounded-full border pl-[18px] pr-[10px]"
        style={{
          height: 60,
          borderColor: "rgb(var(--divider) / 0.13)",
          background: scrolled
            ? "color-mix(in srgb, var(--surface) 97%, transparent)"
            : "color-mix(in srgb, var(--surface) 92%, transparent)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          boxShadow: scrolled
            ? "inset 0 1px 0 color-mix(in srgb, #fff 10%, transparent), 0 14px 40px -16px rgb(0 0 0 / 0.62)"
            : "inset 0 1px 0 color-mix(in srgb, #fff 10%, transparent), 0 10px 30px -14px rgb(0 0 0 / 0.5)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Marca */}
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-[11px]"
          style={{ color: "var(--ink)" }}
          aria-label={t("appName")}
        >
          <BrandMark />
          <span
            className="font-serif truncate"
            style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            {t("appName")}
          </span>
        </Link>

        {/* Enlaces desktop: Producto (megamenú) · Demo · Precios */}
        <div className="hidden items-center gap-0.5 md:flex">
          <div
            className="relative"
            onMouseEnter={megaEnter}
            onMouseLeave={megaLeave}
          >
            <button
              type="button"
              onClick={() => setMegaOpen((o) => !o)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-[15px] py-[9px] text-sm transition-colors duration-200"
              style={{
                color: megaOpen ? "var(--ink)" : "var(--ink-2)",
                background: megaOpen
                  ? "color-mix(in srgb, var(--ink) 6%, transparent)"
                  : "transparent",
                fontFamily: "inherit",
              }}
            >
              {es ? "Producto" : "Product"}
              <svg
                width="9"
                height="9"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                style={{
                  transition: "transform 0.2s",
                  transform: megaOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Panel del megamenú */}
            <div
              role="menu"
              className="absolute left-1/2 w-[520px] rounded-[14px] border p-2.5"
              style={{
                top: "calc(100% + 12px)",
                transform: megaOpen
                  ? "translateX(-50%) translateY(0)"
                  : "translateX(-50%) translateY(-6px)",
                opacity: megaOpen ? 1 : 0,
                visibility: megaOpen ? "visible" : "hidden",
                pointerEvents: megaOpen ? "auto" : "none",
                transition: "opacity 0.18s ease, transform 0.18s ease, visibility 0.18s",
                borderColor: "rgb(var(--divider) / 0.13)",
                background: "color-mix(in srgb, var(--surface) 96%, transparent)",
                backdropFilter: "blur(24px) saturate(1.4)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                boxShadow:
                  "0 1px 2px rgb(0 0 0 / 0.5), 0 44px 84px -30px rgb(0 0 0 / 0.78)",
              }}
            >
              <div className="grid grid-cols-2 gap-1">
                {productItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setMegaOpen(false)}
                    className="flex gap-[11px] rounded-[10px] px-3 py-[11px] transition-colors"
                    style={{ color: "var(--ink)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "color-mix(in srgb, var(--ink) 5%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      className="grid flex-none place-items-center rounded-lg"
                      style={{
                        width: 30,
                        height: 30,
                        background: "rgb(var(--accent-base) / 0.14)",
                        color: "rgb(var(--accent-base))",
                      }}
                    >
                      {item.icon}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold">
                        {es ? item.labelEs : item.labelEn}
                      </span>
                      <span
                        className="mt-0.5 block text-[11.5px] leading-[1.4]"
                        style={{ color: "var(--ink-3)" }}
                      >
                        {es ? item.descEs : item.descEn}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {pillLink("/demo", "Demo")}
          {pillLink("/pricing", es ? "Precios" : "Pricing")}
        </div>

        {/* Clúster derecho: reloj UTC · tema · idioma · CTA · hamburguesa */}
        <div className="flex flex-none items-center gap-2">
          <UtcClock />
          <button
            onClick={toggleTheme}
            data-theme-toggle
            className="grid flex-none cursor-pointer place-items-center rounded-full border bg-transparent transition-colors duration-200"
            style={{
              width: 38,
              height: 38,
              borderColor: "rgb(var(--divider) / 0.06)",
              color: "var(--ink-2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ink)";
              e.currentTarget.style.borderColor = "rgb(var(--divider) / 0.13)";
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--ink) 5%, transparent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--ink-2)";
              e.currentTarget.style.borderColor = "rgb(var(--divider) / 0.06)";
              e.currentTarget.style.background = "transparent";
            }}
            aria-label={es ? "Cambiar tema" : "Toggle theme"}
            title={es ? "Cambiar tema" : "Toggle theme"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={toggle}
            className="grid flex-none cursor-pointer place-items-center rounded-full border bg-transparent text-[11px] font-semibold tracking-wide transition-colors duration-200"
            style={{
              width: 38,
              height: 38,
              borderColor: "rgb(var(--divider) / 0.06)",
              color: "var(--ink-2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ink)";
              e.currentTarget.style.borderColor = "rgb(var(--divider) / 0.13)";
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--ink) 5%, transparent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--ink-2)";
              e.currentTarget.style.borderColor = "rgb(var(--divider) / 0.06)";
              e.currentTarget.style.background = "transparent";
            }}
            aria-label={es ? "Cambiar idioma" : "Toggle language"}
            title={es ? "Cambiar idioma" : "Toggle language"}
          >
            {lang.toUpperCase()}
          </button>
          <motion.div
            whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            className="hidden sm:inline-flex"
          >
            <Link
              href="/pricing"
              className="inline-flex flex-none items-center gap-[7px] whitespace-nowrap rounded-full text-sm font-semibold transition-[transform,filter] duration-200"
              style={{
                height: 40,
                padding: "0 20px",
                background: "rgb(var(--accent-base))",
                color: "#06130d",
                boxShadow:
                  "0 10px 26px -12px color-mix(in srgb, rgb(var(--accent-base)) 70%, #000)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.filter = "brightness(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.filter = "";
              }}
            >
              {es ? "Comprar" : "Buy"}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileOpen((o) => !o)}
            className="icon-btn md:hidden grid h-9 w-9 place-items-center rounded-full text-[var(--ink-2)] transition-colors duration-200 hover:bg-[rgb(var(--divider)/0.05)] hover:text-[var(--ink)]"
            aria-label={mobileOpen ? (es ? "Cerrar menú" : "Close menu") : (es ? "Abrir menú" : "Open menu")}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-controls="mobile-nav-drawer"
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Drawer móvil — maquinaria a11y intacta del navbar anterior. */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              key="mobile-drawer"
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={es ? "Menú de navegación" : "Navigation menu"}
              tabIndex={-1}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-[60] w-[300px] max-w-[84vw] liquid-glass backdrop-blur-xl border-l border-[rgb(var(--divider)/0.1)] flex flex-col safe-top outline-none"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-[rgb(var(--divider)/0.05)] shrink-0">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-md"
                  aria-label={t("appName")}
                >
                  <BrandMark />
                  <span className="font-serif text-[17px] font-medium tracking-tight text-[var(--ink)]">
                    {t("appName")}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="icon-btn w-8 h-8 rounded-md grid place-items-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgb(var(--divider)/0.05)] transition-colors"
                  aria-label={es ? "Cerrar menú" : "Close menu"}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1" aria-label={es ? "Secciones" : "Sections"}>
                {drawerLinks.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`relative min-h-[44px] flex items-center pl-4 pr-3 py-2.5 text-sm rounded-lg transition-colors ${
                        active
                          ? "text-[var(--ink)] bg-[rgb(var(--divider)/0.06)] font-medium"
                          : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[rgb(var(--divider)/0.05)]"
                      }`}
                    >
                      <span className="flex-1">{es ? l.labelEs : l.labelEn}</span>
                      {active && (
                        <span
                          aria-hidden
                          className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent-base))]"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[rgb(var(--divider)/0.05)] safe-bottom shrink-0">
                <motion.div
                  whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                >
                  <Link
                    href="/pricing"
                    onClick={() => setMobileOpen(false)}
                    className="group flex items-center justify-center gap-1.5 h-11 w-full rounded-full text-sm font-semibold transition-all duration-200"
                    style={{
                      background: "rgb(var(--accent-base))",
                      color: "#06130d",
                      boxShadow:
                        "0 10px 26px -12px color-mix(in srgb, rgb(var(--accent-base)) 70%, #000)",
                    }}
                  >
                    {t("buyNow")}
                    <svg className="transition-transform duration-200 group-hover:translate-x-0.5" width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/**
 * UtcClock — "UTC HH:MM:SS" en vivo con punto de mercado verde con
 * glow, como en la píldora del HTML. Renderiza "--:--:--" en servidor
 * y primer paint; el intervalo arranca en un efecto (cero mismatch de
 * hidratación). Oculto por debajo de `lg` para no saturar la píldora.
 */
function UtcClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span
      className="mr-0.5 hidden items-center gap-1.5 border-r pr-2 lg:inline-flex"
      style={{ borderColor: "rgb(var(--divider) / 0.13)" }}
    >
      <span
        aria-hidden
        className="rounded-full"
        style={{
          width: 5,
          height: 5,
          background: "rgb(var(--pnl-pos, 62 207 142))",
          boxShadow: "0 0 8px rgb(var(--pnl-pos, 62 207 142))",
        }}
      />
      <span
        className="tnum whitespace-nowrap"
        style={{ fontSize: 10.5, letterSpacing: "0.04em", color: "var(--ink-3)" }}
      >
        UTC <span style={{ color: "var(--ink-2)" }}>{time}</span>
      </span>
    </span>
  );
}

/**
 * BrandMark — trío de velas del HTML de referencia sobre un cuadrado
 * de vidrio (32 px, blur + hairline + inset highlight). Los cuerpos
 * ascienden y las mechas quedan al 45 % para que el trío lea como
 * marca y no como gráfico genérico.
 */
function BrandMark() {
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-lg border"
      style={{
        width: 32,
        height: 32,
        borderColor: "rgb(var(--divider) / 0.13)",
        background: "color-mix(in srgb, var(--surface) 66%, transparent)",
        backdropFilter: "blur(18px) saturate(1.4)",
        WebkitBackdropFilter: "blur(18px) saturate(1.4)",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 1.8v12.4M8 1.8v12.4M13 1.8v12.4"
          stroke="rgb(var(--accent-base))"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.45"
        />
        <rect x="2" y="7" width="2" height="5" rx="0.4" fill="rgb(var(--accent-base))" />
        <rect x="7" y="4.5" width="2" height="5" rx="0.4" fill="rgb(var(--accent-base))" />
        <rect x="12" y="2.6" width="2" height="5" rx="0.4" fill="rgb(var(--accent-base))" />
      </svg>
    </span>
  );
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=\"hidden\"])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  "details > summary:first-of-type",
].join(",");

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => {
    const rects = el.getClientRects();
    if (rects.length === 0) return false;
    const { width, height } = rects[0];
    return width > 0 && height > 0;
  });
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 9.2A5 5 0 0 1 6.8 3 5 5 0 1 0 13 9.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
