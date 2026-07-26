"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLang, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

/**
 * Navbar — barra edge-to-edge con material acrylic premium.
 *
 * R28 — reescritura de la barra. Los tres problemas estructurales que
 * arrastraba la versión anterior y que esta corrige:
 *
 *  1. MAQUETA ARBITRARIA. Antes: cinco hijos en un `justify-between`
 *     con dos separadores hairline intercalados. El espacio sobrante se
 *     repartía entre huecos sin jerarquía, así que la navegación no
 *     quedaba centrada ni anclada a nada — solo "en algún punto" entre
 *     la marca y el clúster. Ahora: rejilla de tres zonas
 *     `[1fr_auto_1fr]`, con la navegación ópticamente centrada en la
 *     página pase lo que pase con el ancho de la marca o del clúster.
 *     Los separadores sobran (la rejilla ya estructura) y se retiran.
 *
 *  2. HOVER EN JAVASCRIPT, TECLADO SIN FEEDBACK. Antes cada enlace
 *     llevaba `onMouseEnter`/`onMouseLeave` mutando `el.style` a mano.
 *     Eso (a) salta de golpe en vez de interpolar, (b) deja el estado
 *     pegado si el puntero sale durante una navegación y (c) —el fallo
 *     serio— NO se dispara con foco de teclado, así que quien tabula no
 *     veía absolutamente nada. Ahora el realce y el foco se declaran en
 *     CSS con `hover:` / `focus-visible:`, de modo que ratón y teclado
 *     reciben exactamente el mismo trato.
 *
 *  3. INDICADOR ACTIVO REDUNDANTE. Antes la ruta activa se marcaba a la
 *     vez con fondo Y con barra inferior. Ahora el fondo es exclusivo
 *     del hover/foco (transitorio) y la regla de acento es exclusiva de
 *     "dónde estás" (persistente). Dos señales, dos significados.
 *
 *  4. R28-b — VUELTA DE TUERCA INSTITUCIONAL. Una versión intermedia
 *     usaba una píldora compartida con `layoutId` que VIAJABA entre
 *     elementos con muelle. Resolvía la accesibilidad, pero el gesto es
 *     de "SaaS premium" y la web se posiciona como mesa institucional:
 *     ahí el realce se enciende, no se desliza. Retirada. En la misma
 *     línea: radios de 4 px (el radio de control real de la app) en vez
 *     de `rounded-full`, CTA sin sheen ni sombra de color, megamenú sin
 *     muelle ni escalonado, y el cambio de tema sin voltereta.
 *
 * Además: la barra condensa 68 → 56 px al hacer scroll (el material
 * gana opacidad y sombra a la vez), y una hairline de acento en el
 * borde inferior traza el progreso de lectura de la página — coherente
 * con un producto que va de medir.
 *
 * El material se diseñó para leerse sobre el ojo WebGL del fondo en
 * AMBOS temas: en oscuro `--surface` (#141618) aporta el scrim; en
 * claro `--surface` (#fbfaf7) aporta la base translúcida que aísla el
 * cromatismo del iris sin competir con él.
 *
 * El drawer móvil (focus-trap, scroll-lock, Escape, cierre por ruta) se
 * conserva íntegro — es maquinaria a11y probada y no se toca.
 *
 * El reloj arranca en "--:--:--" en servidor y en el primer render de
 * cliente, y solo tickea dentro de un efecto: la hidratación nunca ve
 * horas distintas (cero mismatch).
 */
export function Navbar() {
  const { t, lang } = useLang();
  const es = lang === "es";
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  /** Elemento de navegación bajo el puntero/foco — mueve la píldora. */
  const [hovered, setHovered] = useState<string | null>(null);
  const megaCloseTimer = useRef<number | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const megaButtonRef = useRef<HTMLButtonElement>(null);
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
      if (e.key === "Escape") {
        setMegaOpen(false);
        // Devuelve el foco al disparador "Producto" para que quien usa
        // teclado conserve su sitio en el orden de tabulación.
        megaButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  // Focus trap del drawer móvil (maquinaria a11y intacta).
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

  // Cerrar drawer y megamenú al cambiar de ruta. `hovered` también se
  // limpia: si no, la píldora se quedaba encallada bajo el elemento que
  // acabas de pulsar cuando el puntero ya no está encima.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setHovered(null);
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
      descEs: "Vista general del producto",
      descEn: "Product overview",
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
      href: "/features/metricas",
      labelEs: "Métricas",
      labelEn: "Metrics",
      descEs: "Sharpe, profit factor, expectancy",
      descEn: "Sharpe, profit factor, expectancy",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 13V7M6 13V3M10 13V9M14 13V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/features/disciplina",
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
      href: "/features/seguridad",
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
  // viven en el footer; la barra sigue al HTML: Producto/Demo/Precios).
  const drawerLinks: { href: string; labelEs: string; labelEn: string }[] = [
    { href: "/features", labelEs: "Características", labelEn: "Features" },
    { href: "/demo", labelEs: "Demo", labelEn: "Demo" },
    { href: "/pricing", labelEs: "Precios", labelEn: "Pricing" },
    { href: "/about", labelEs: "Acerca de", labelEn: "About" },
    { href: "/faq", labelEs: "FAQ", labelEn: "FAQ" },
  ];

  /** ¿Esta ruta (o una subruta suya) es la página actual? */
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  /**
   * Realce compartido. Un único nodo con `layoutId` que Framer mueve
   * entre elementos: en vez de que cada píldora se encienda y se apague
   * por su cuenta, el fondo VIAJA de una a otra. Es la diferencia entre
   * una barra que responde y una que se siente construida.
   */
  const hoverPill = (key: string) =>
    hovered === key ? (
      <span
        aria-hidden
        className="absolute inset-0 rounded-[4px]"
        style={{ background: "color-mix(in srgb, var(--ink) 6%, transparent)" }}
      />
    ) : null;

  /** Regla de acento persistente que marca la ruta actual. */
  const activeBar = (
    <span
      aria-hidden
      className="absolute -bottom-[6px] left-2 right-2 h-[2px]"
      style={{ background: "rgb(var(--accent-base))" }}
    />
  );

  const navLink = (href: string, label: string) => {
    const active = isActive(href);
    return (
      <div
        key={href}
        className="relative"
        onMouseEnter={() => setHovered(href)}
      >
        {hoverPill(href)}
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          onFocus={() => setHovered(href)}
          className="relative z-10 block rounded-[4px] px-[15px] py-[9px] text-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
          style={{ color: active || hovered === href ? "var(--ink)" : "var(--ink-2)" }}
        >
          {label}
        </Link>
        {active && activeBar}
      </div>
    );
  };

  const productActive = pathname.startsWith("/features");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        className="relative flex w-full items-center border-b px-5 md:px-8"
        style={{
          // Condensación al hacer scroll: la barra se estrecha mientras
          // el material gana cuerpo. Un solo gesto, dos señales.
          height: scrolled ? 56 : 68,
          borderColor: "rgb(var(--divider) / 0.1)",
          background: scrolled
            ? "color-mix(in srgb, var(--surface) 92%, transparent)"
            : "color-mix(in srgb, var(--surface) 78%, transparent)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          boxShadow: scrolled
            ? "inset 0 1px 0 rgb(var(--divider) / 0.16), 0 14px 40px -16px rgb(0 0 0 / 0.55)"
            : "inset 0 1px 0 rgb(var(--divider) / 0.14), 0 6px 20px -12px rgb(0 0 0 / 0.4)",
          transition:
            "height 0.34s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Rejilla de tres zonas: la navegación queda ópticamente
            centrada en la página con independencia de lo que midan la
            marca (izquierda) y el clúster de utilidades (derecha). */}
        <div className="mx-auto grid w-full max-w-page grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* ZONA 1 — Marca */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-[11px] justify-self-start rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
            style={{ color: "var(--ink)" }}
            aria-label={t("appName")}
          >
            <BrandMark />
            <span
              className="truncate font-serif"
              style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}
            >
              {t("appName")}
            </span>
          </Link>

          {/* ZONA 2 — Navegación centrada: Producto (megamenú) · Demo · Precios */}
          <div
            className="hidden items-center gap-0.5 justify-self-center md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="relative"
              onMouseEnter={() => {
                setHovered("product");
                megaEnter();
              }}
              onMouseLeave={megaLeave}
            >
              {hoverPill("product")}
              <button
                type="button"
                id="navbar-producto-trigger"
                ref={megaButtonRef}
                onClick={() => setMegaOpen((o) => !o)}
                onFocus={() => setHovered("product")}
                aria-expanded={megaOpen}
                aria-haspopup="menu"
                className="relative z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] border-0 bg-transparent px-[15px] py-[9px] text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
                style={{
                  color:
                    megaOpen || productActive || hovered === "product"
                      ? "var(--ink)"
                      : "var(--ink-2)",
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
                    transition: "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: megaOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {productActive && activeBar}

              {/* Panel del megamenú. AnimatePresence en lugar de
                  conmutar `visibility`: así el panel se desmonta de
                  verdad y no queda en el árbol de accesibilidad estando
                  cerrado. */}
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    role="menu"
                    aria-labelledby="navbar-producto-trigger"
                    /* Apertura corta y plana: sin muelle ni escala. Un
                       menú de herramientas aparece, no rebota. */
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-1/2 w-[520px] max-w-[calc(100vw-3rem)] origin-top rounded-[8px] border p-2"
                    style={{
                      top: "calc(100% + 14px)",
                      x: "-50%",
                      borderColor: "rgb(var(--divider) / 0.13)",
                      background: "color-mix(in srgb, var(--surface) 96%, transparent)",
                      backdropFilter: "blur(24px) saturate(1.4)",
                      WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                      boxShadow:
                        "0 1px 2px rgb(0 0 0 / 0.5), 0 44px 84px -30px rgb(0 0 0 / 0.78)",
                    }}
                  >
                    {/* Punta que ancla el panel a su disparador — sin
                        ella el menú parecía flotar suelto bajo la barra. */}
                    <span
                      aria-hidden
                      className="absolute left-1/2 -top-[6px] h-[11px] w-[11px] -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t"
                      style={{
                        borderColor: "rgb(var(--divider) / 0.13)",
                        background: "color-mix(in srgb, var(--surface) 96%, transparent)",
                      }}
                    />
                    <div className="relative grid grid-cols-2 gap-1">
                      {/* Sin escalonado de entrada: las cuatro entradas
                          aparecen a la vez. El escalonado hacía esperar
                          al usuario a que el menú "terminara". */}
                      {productItems.map((item) => (
                        <div key={item.href}>
                          <Link
                            href={item.href}
                            role="menuitem"
                            onClick={() => setMegaOpen(false)}
                            className="group flex gap-[11px] rounded-[4px] px-3 py-[11px] outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
                            style={{ color: "var(--ink)" }}
                            onMouseEnter={() => {
                              // Prefetch optimista: inyecta un
                              // <link rel="prefetch"> para que la ruta ya
                              // esté en caché cuando se pulse. Idempotente.
                              const id = "prefetch-" + item.href.replace(/[^a-z0-9]/gi, "-");
                              if (!document.getElementById(id)) {
                                const link = document.createElement("link");
                                link.id = id;
                                link.rel = "prefetch";
                                link.href = item.href;
                                link.as = "document";
                                document.head.appendChild(link);
                              }
                            }}
                          >
                            <span
                              className="grid flex-none place-items-center rounded-[4px]"
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
                                // R27-1c — --ink-3 → --ink-2. A 11.5 px el
                                // token terciario (~5.5:1) se acerca al
                                // suelo WCAG una vez se apilan el 96 % de
                                // surface y el blur de 24 px del panel. El
                                // secundario (~9:1) lo deja seguro en
                                // ambos temas.
                                style={{ color: "var(--ink-2)" }}
                              >
                                {es ? item.descEs : item.descEn}
                              </span>
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLink("/demo", "Demo")}
            {navLink("/pricing", es ? "Precios" : "Pricing")}
          </div>

          {/* ZONA 3 — Utilidades: reloj UTC · tema · idioma · CTA · hamburguesa */}
          <div className="flex flex-none items-center gap-2 justify-self-end">
            <UtcClock />
            <IconButton
              onClick={toggleTheme}
              label={es ? "Cambiar tema" : "Toggle theme"}
              extraProps={{ "data-theme-toggle": true }}
            >
              {/* Cruce corto entre sol y luna, solo opacidad: la voltereta
                  con rotación y escala era un gesto de juguete en una
                  barra que debe leerse como instrumental. `mode="wait"`
                  evita que se solapen; `initial={false}` evita el
                  destello al montar. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="grid place-items-center"
                  style={{ width: 15, height: 15 }}
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </motion.span>
              </AnimatePresence>
            </IconButton>

            <LanguagePicker />

            {/* CTA — rectángulo de 4 px, sin sheen ni sombra de color.
                El único realce es un cambio de tono, declarado igual
                para ratón y teclado. */}
            <Link
              href="/pricing"
              className="hidden flex-none items-center gap-[7px] whitespace-nowrap rounded-[4px] text-sm font-semibold outline-none transition-colors duration-150 hover:bg-[rgb(var(--accent-hover))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] sm:inline-flex"
              style={{
                height: 38,
                padding: "0 18px",
                background: "rgb(var(--accent-base))",
                color: "#1A1917",
              }}
            >
              {es ? "Comprar" : "Buy"}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <button
              ref={menuButtonRef}
              onClick={() => setMobileOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink-2)] outline-none transition-colors duration-200 hover:bg-[rgb(var(--divider)/0.05)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] md:hidden"
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
        </div>

        {/* Aquí había una hairline de acento que se iba rellenando con el
            progreso de lectura. Retirada por decisión del dueño: no
            quiere ninguna barra que se rellene en la cabecera. La barra
            es una barra de navegación, no un indicador. */}
      </nav>

      {/* Drawer móvil — maquinaria a11y intacta. */}
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
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm md:hidden"
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
              className="liquid-glass safe-top fixed top-0 right-0 bottom-0 z-[60] flex w-[300px] max-w-[84vw] flex-col border-l border-[rgb(var(--divider)/0.1)] outline-none backdrop-blur-xl md:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-[rgb(var(--divider)/0.05)] px-5">
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
                  className="icon-btn grid h-8 w-8 place-items-center rounded-md text-[var(--ink-2)] transition-colors hover:bg-[rgb(var(--divider)/0.05)] hover:text-[var(--ink)]"
                  aria-label={es ? "Cerrar menú" : "Close menu"}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3" aria-label={es ? "Secciones" : "Sections"}>
                {drawerLinks.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-[44px] items-center rounded-lg py-2.5 pr-3 pl-4 text-sm transition-colors ${
                        active
                          ? "bg-[rgb(var(--divider)/0.06)] font-medium text-[var(--ink)]"
                          : "text-[var(--ink-2)] hover:bg-[rgb(var(--divider)/0.05)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {/* Barra de acento a la izquierda: patrón estándar
                          de fila activa, mucho más legible de un vistazo
                          que un punto decorativo a la derecha. */}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-full"
                          style={{ background: "rgb(var(--accent-base))" }}
                        />
                      )}
                      <span className="flex-1">{es ? l.labelEs : l.labelEn}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="safe-bottom shrink-0 border-t border-[rgb(var(--divider)/0.05)] p-4">
                {/* Mismo tratamiento que el CTA de escritorio: rectángulo
                    de 4 px, sin sheen ni sombra de acento. Se me pasó en
                    la primera pasada porque vive dentro del drawer. */}
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[4px] text-sm font-semibold outline-none transition-colors duration-150 hover:bg-[rgb(var(--accent-hover))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                  style={{
                    background: "rgb(var(--accent-base))",
                    color: "#1A1917",
                  }}
                >
                  {t("buyNow")}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

/**
 * IconButton — botón circular de 38 px del clúster derecho.
 *
 * Existe para que el hover y el FOCO compartan exactamente la misma
 * declaración. En la versión anterior cada botón repetía a mano un par
 * `onMouseEnter`/`onMouseLeave` de ocho líneas que solo respondía al
 * ratón: con teclado no pasaba nada. Al declararlo en CSS, `hover:` y
 * `focus-visible:` reciben idéntico tratamiento sin duplicar nada.
 */
function IconButton({
  onClick,
  label,
  children,
  className = "",
  extraProps = {},
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  extraProps?: Record<string, unknown>;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid flex-none cursor-pointer place-items-center rounded-[4px] border bg-transparent text-[var(--ink-2)] outline-none transition-colors duration-150 border-[rgb(var(--divider)/0.14)] hover:border-[rgb(var(--divider)/0.24)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[var(--ink)] focus-visible:border-[rgb(var(--divider)/0.24)] focus-visible:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)] ${className}`}
      style={{ width: 36, height: 36 }}
      {...extraProps}
    >
      {children}
    </button>
  );
}

/**
 * LanguagePicker — selector de idioma.
 *
 * Sustituye al interruptor "ES · EN" que vivía en un botón de 36 px. Ese
 * patrón tenía dos problemas: apretaba dos códigos y un separador en un
 * cuadrado diminuto (ilegible y pobre), y sobre todo NO ESCALA — un
 * interruptor solo sirve para dos opciones, así que en cuanto se añada
 * un tercer idioma hay que tirarlo y rehacerlo.
 *
 * Esto es un desplegable de verdad: la lista sale de LANGUAGES, y añadir
 * un idioma es AÑADIR UNA LÍNEA a ese array. Cada entrada muestra el
 * código y el nombre en su propia lengua (Español, no "Spanish"), que es
 * como se hace bien: quien busca su idioma lo reconoce aunque no
 * entienda el idioma actual de la página.
 *
 * Accesibilidad: `aria-haspopup="listbox"` + `aria-expanded`, cada
 * opción con `role="option"` y `aria-selected`, Escape cierra y devuelve
 * el foco al disparador, y el clic fuera cierra.
 */
const LANGUAGES: { code: Lang; code2: string; native: string }[] = [
  { code: "es", code2: "ES", native: "Español" },
  { code: "en", code2: "EN", native: "English" },
];

function LanguagePicker() {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const actual = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative flex-none">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={es ? "Cambiar idioma" : "Change language"}
        title={es ? "Cambiar idioma" : "Change language"}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[4px] border bg-transparent px-2.5 text-[11px] font-semibold tracking-wide text-[var(--ink-2)] outline-none transition-colors duration-150 border-[rgb(var(--divider)/0.14)] hover:border-[rgb(var(--divider)/0.24)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[var(--ink)] focus-visible:border-[rgb(var(--divider)/0.24)] focus-visible:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
      >
        <GlobeIcon />
        <span className="tnum">{actual.code2}</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          style={{
            transition: "transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popRef}
            role="listbox"
            aria-label={es ? "Idiomas" : "Languages"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 min-w-[168px] rounded-[8px] border p-1"
            style={{
              top: "calc(100% + 8px)",
              borderColor: "rgb(var(--divider) / 0.14)",
              background: "color-mix(in srgb, var(--surface) 97%, transparent)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              boxShadow: "0 1px 2px rgb(0 0 0 / 0.5), 0 30px 60px -24px rgb(0 0 0 / 0.7)",
            }}
          >
            {LANGUAGES.map((l) => {
              const activo = l.code === lang;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={activo}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-[4px] border-0 bg-transparent px-2.5 py-2 text-left outline-none transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-base)/0.55)]"
                  style={{ fontFamily: "inherit" }}
                >
                  <span
                    className="tnum w-6 shrink-0 text-[11px] font-semibold tracking-wide"
                    style={{ color: activo ? "rgb(var(--accent-base))" : "var(--ink-3)" }}
                  >
                    {l.code2}
                  </span>
                  <span
                    className="flex-1 text-[13px]"
                    style={{ color: activo ? "var(--ink)" : "var(--ink-2)" }}
                  >
                    {l.native}
                  </span>
                  {/* Marca del idioma activo. Un check, no un color de
                      fondo: el fondo ya lo usa el estado de hover y dos
                      señales distintas no deben compartir soporte. */}
                  {activo && (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M3.5 8.5l3 3 6-7"
                        stroke="rgb(var(--accent-base))"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 8h12M8 2c1.7 1.8 2.6 3.9 2.6 6S9.7 12.2 8 14C6.3 12.2 5.4 10.1 5.4 8S6.3 3.8 8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * UtcClock — "UTC HH:MM:SS" en vivo con punto de sesión verde. Renderiza
 * "--:--:--" en servidor y primer paint; el intervalo arranca en un
 * efecto (cero mismatch de hidratación). Oculto por debajo de `lg`
 * (1024 px): entre 768 y 1023 px el clúster derecho + navegación +
 * marca supera el ancho interno y el botón Comprar quedaba recortado en
 * silencio por el `overflow-x: hidden` del body (ver R21-1e issue #1).
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
      {/* Punto de sesión — sólido, sin el latido `tj-pulse-dot`. Era el
          último bucle infinito decorativo que quedaba en la barra: una
          luz parpadeando permanentemente junto al reloj compite con la
          lectura y no aporta información (el estado no cambia). El
          color en verde P&L ya comunica "sesión abierta". */}
      <span
        aria-hidden
        className="rounded-full"
        style={{
          width: 5,
          height: 5,
          background: "rgb(var(--pnl-pos, 62 207 142))",
        }}
      />
      <span
        className="tnum whitespace-nowrap"
        // R27-1c — etiqueta y valor comparten --ink-2. Antes la etiqueta
        // era terciaria y solo la hora secundaria, y el reloj entero se
        // leía verdoso y desigual en tema claro. Ahora es un token
        // monoespaciado uniforme; el punto pulsante es el único
        // elemento en verde de acento.
        style={{ fontSize: 11, letterSpacing: "0.04em", color: "var(--ink-2)" }}
      >
        UTC <span>{time}</span>
      </span>
    </span>
  );
}

/**
 * BrandMark — trío de velas sobre un cuadrado de vidrio (32 px, blur +
 * hairline + inset highlight). Los cuerpos ascienden y las mechas
 * quedan al 45 % para que el trío lea como marca y no como gráfico
 * genérico.
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
