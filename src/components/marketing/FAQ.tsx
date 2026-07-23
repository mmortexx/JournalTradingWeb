"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { useLang } from "@/lib/i18n";
import { Eyebrow } from "@/components/tj/Eyebrow";
import { Reveal } from "@/components/tj/Reveal";
import { GlossaryModal } from "@/components/tj/GlossaryModal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

/**
 * FAQ — accordion of common questions (ES/EN) with real-time search.
 *
 * Premium motion layer:
 *  - Open accordion item gets a subtle accent border glow (via data-state).
 *  - Chevron rotation already handled by shadcn Accordion (rotate-180).
 *  - Question text shifts to accent color on hover.
 *
 * Search behaviour:
 *  - Filters question + answer text, case-insensitive, in the active language.
 *  - When the query yields no matches, shows a "no results" panel with a
 *    button that opens the GlossaryModal (controlled by FAQ's own state).
 *  - The accordion auto-collapses while a query is active so multiple matches
 *    can be scanned at a glance; the first match opens by default.
 */

type QA = { q: string; a: string };

/**
 * @param standalone En la página /faq el `PageHeader` ya titula
 * "Preguntas frecuentes." — con esta bandera la sección omite su
 * encabezado interno (que duplicaba el titular) y entra directa al
 * buscador y la lista.
 */
export function FAQ({ standalone = false }: { standalone?: boolean } = {}) {
  const { t, lang } = useLang();
  const es = lang === "es";

  // GlossaryModal is controlled by FAQ so the "no results" link can open it.
  const [glossaryOpen, setGlossaryOpen] = React.useState(false);

  const [query, setQuery] = React.useState("");

  // Pre-fill the search from `?q=` (e.g. the 404 page's search box) on mount.
  // SSR-safe: guarded against `window` being undefined during server render.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim() !== "") setQuery(q);
  }, []);

  const items: QA[] = es
    ? [
        {
          q: "¿Es realmente de pago único?",
          a: "Sí. Pagas una vez y la app es tuya para siempre, sin recurrencias ni cargos ocultos. Incluye todas las actualizaciones de la versión principal que compres y descuentos generosos en futuras versiones mayores.",
        },
        {
          q: "¿Mis datos están seguros?",
          a: "Tus datos viven en un único archivo .sqlite dentro de tu equipo. Nunca se suben a ningún servidor: no hay servidor. Puedes cifrar la carpeta con BitLocker/VeraCrypt para una capa extra de seguridad.",
        },
        {
          q: "¿Puedo exportar mis datos?",
          a: "Sí. Puedes exportar todo tu journal a CSV (para Excel o Google Sheets), PDF (informes listos para compartir) y JSON (backup completo y reimportable). Tus datos son tuyos: puedes llevártelos cuando quieras, sin API que cerrar ni servidor que apagar.",
        },
        {
          q: "¿Funciona en Mac o Linux?",
          a: "Trading Journal es una app nativa de Windows (WinUI 3). En Mac o Linux puedes ejecutarla a través de una máquina virtual con Windows o Parallels. Estamos evaluando una versión web local-first para el futuro.",
        },
        {
          q: "¿Puedo importar de otro journal?",
          a: "Sí. Aceptamos importación desde CSV (formato flexible con mapeo de columnas) y un importador dedicado para journals populares. Si tu journal actual exporta a CSV, lo tienes en tu Trading Journal en menos de 5 minutos.",
        },
        {
          q: "¿Qué pasa si pierdo mi licencia?",
          a: "Tu licencia se asocia a tu correo electrónico. Puedes recuperarla cuantas veces necesites escribiendo al soporte. Y aunque pierdas el acceso a tu correo, tu historial sigue intacto porque vive en tu equipo, no en el nuestro.",
        },
        {
          q: "¿Hay actualizaciones?",
          a: "Sí, y son gratuitas dentro de la misma versión mayor (1.x → 1.x). Las versiones mayores (2.0, 3.0…) serán de pago, pero con descuento preferente para quienes ya tengan una licencia.",
        },
        {
          q: "¿Qué métodos de pago aceptáis?",
          a: "Tarjeta de crédito/débito y PayPal. Emitimos factura con IVA si procede.",
        },
        {
          q: "¿Y si la app no es para mí?",
          a: "Tienes 30 días desde la compra para pedir reembolso completo, sin preguntas. Escríbenos y lo gestionamos en menos de 48 h.",
        },
        {
          q: "¿Puedo probar antes de comprar?",
          a: "Sí. Puedes explorar la demo en vivo de esta misma web con datos deterministas (sin registro, sin descargar nada). Si después de comprar sientes que no encaja, tienes 30 días de garantía de devolución completa, sin preguntas.",
        },
        {
          q: "¿Cuál es la diferencia entre Core y Pro?",
          a: "Core incluye el journal completo, 40+ métricas, 2 cuentas de trading, gestión de riesgo, disciplina e informes PDF básicos. Pro desbloquea además: cuentas ilimitadas, modo prop firm, simulador Monte Carlo, informe de track record, risk of ruin, informes PDF avanzados y el importador de rivales que migra tu journal anterior en 5 minutos.",
        },
        {
          q: "¿Cómo funciona la garantía de 30 días?",
          a: "Compras con total tranquilidad. Si en 30 días sientes que la app no es para ti, escribes a soporte y te devolvemos el 100% del dinero, sin preguntas ni condiciones. Sin formularios, sin interrogatorios.",
        },
        {
          q: "¿Funciona sin internet?",
          a: "Sí, 100 % local. Una vez descargada e instalada, la app no necesita conexión a internet para nada: ni para abrir tu journal, ni para registrar operaciones, ni para generar informes. Tus datos nunca salen de tu equipo. Solo necesitas internet para descargar la app, recibir actualizaciones (opcional) o activar tu licencia la primera vez.",
        },
        {
          q: "¿Puedo usarlo en varios ordenadores?",
          a: "Sí. Una misma licencia te permite instalar Trading Journal en tus ordenadores personales (tu sobremesa de trading y tu portátil, por ejemplo). Tu archivo .sqlite es portable: cópialo a una carpeta compartida o llévalo en un pendrive y trabajarás desde cualquiera de los equipos como si fuera el mismo. Las activaciones adicionales se gestionan escribiendo a soporte.",
        },
        {
          q: "¿Qué pasa si cambio de ordenador?",
          a: "Nada. Tu historial vive en un único archivo .sqlite portable. Cópialo al nuevo equipo (pendrive, disco externo, carpeta compartida) y seguirás trabajando como si no hubiera pasado nada. Tu licencia se asocia a tu correo, no a la máquina: reinstala la app en el equipo nuevo, activa con tu correo y listo.",
        },
        {
          q: "¿Hay versión nativa para Mac o Linux?",
          a: "Por ahora Trading Journal es nativa de Windows (WinUI 3). En Mac o Linux puedes ejecutarla a través de una máquina virtual con Windows o Parallels. Estamos explorando activamente una versión local-first para Mac y Linux: si quieres ser beta tester cuando salga, escríbenos.",
        },
      ]
    : [
        {
          q: "Is it really a one-time payment?",
          a: "Yes. You pay once and the app is yours forever, with no recurring fees or hidden charges. All updates within the major version you buy are included, and you get generous discounts on future major versions.",
        },
        {
          q: "Are my data safe?",
          a: "Your data lives in a single .sqlite file on your machine. It never gets uploaded to any server: there is no server. You can encrypt the folder with BitLocker/VeraCrypt for an extra layer of security.",
        },
        {
          q: "Can I export my data?",
          a: "Yes. You can export your entire journal to CSV (for Excel or Google Sheets), PDF (ready-to-share reports), and JSON (full, re-importable backup). Your data is yours: take it with you whenever you want — no API to shut down, no server to turn off.",
        },
        {
          q: "Does it work on Mac or Linux?",
          a: "Trading Journal is a native Windows app (WinUI 3). On Mac or Linux you can run it through a Windows virtual machine or Parallels. We're evaluating a local-first web version for the future.",
        },
        {
          q: "Can I import from another journal?",
          a: "Yes. We support CSV import (flexible format with column mapping) and a dedicated importer for popular journals. If your current journal exports to CSV, you'll have it in your Trading Journal in less than 5 minutes.",
        },
        {
          q: "What if I lose my license?",
          a: "Your license is tied to your email address. You can recover it as many times as you need by writing to support. And even if you lose access to your email, your history stays intact because it lives on your machine, not ours.",
        },
        {
          q: "Are there updates?",
          a: "Yes, and they're free within the same major version (1.x → 1.x). Major versions (2.0, 3.0…) will be paid, but with a preferential discount for existing license holders.",
        },
        {
          q: "What payment methods do you accept?",
          a: "Credit/debit card and PayPal. We issue VAT invoices where applicable.",
        },
        {
          q: "What if the app isn't for me?",
          a: "You have 30 days from purchase to request a full refund, no questions asked. Email us and we'll process it within 48 hours.",
        },
        {
          q: "Can I try before buying?",
          a: "Yes. You can explore the live demo on this very site with deterministic data (no signup, nothing to download). If after buying it doesn't fit, you're covered by the 30-day no-questions refund guarantee.",
        },
        {
          q: "What's the difference between Core and Pro?",
          a: "Core includes the full journal, 40+ metrics, 2 trading accounts, risk management, discipline, and basic PDF reports. Pro additionally unlocks unlimited accounts, prop firm mode, the Monte Carlo simulator, track record report, risk of ruin, advanced PDF reports, and the rival importer that migrates your old journal in 5 minutes.",
        },
        {
          q: "How does the 30-day guarantee work?",
          a: "Buy with total peace of mind. If within 30 days you feel the app isn't for you, email support and we'll refund 100% of your money, no questions asked. No forms, no interrogations.",
        },
        {
          q: "Does it work without internet?",
          a: "Yes, 100% local. Once downloaded and installed, the app needs no internet connection at all: not to open your journal, not to log trades, not to generate reports. Your data never leaves your machine. You only need internet to download the app, receive updates (optional), or activate your license the first time.",
        },
        {
          q: "Can I use it on multiple computers?",
          a: "Yes. A single license lets you install Trading Journal on your personal computers (your trading desktop and your laptop, for example). Your .sqlite file is portable: copy it to a shared folder or carry it on a USB stick and you'll work from any of your machines as if it were the same one. Extra activations can be arranged by emailing support.",
        },
        {
          q: "What if I change computers?",
          a: "Nothing happens. Your history lives in a single portable .sqlite file. Copy it to the new machine (USB stick, external drive, shared folder) and keep working as if nothing happened. Your license is tied to your email, not the machine: reinstall the app on the new computer, activate with your email and you're done.",
        },
        {
          q: "Is there a native Mac or Linux version?",
          a: "Right now Trading Journal is Windows-native (WinUI 3). On Mac or Linux you can run it through a Windows virtual machine or Parallels. We're actively exploring a local-first version for Mac and Linux — if you'd like to be a beta tester when it lands, drop us a line.",
        },
      ];

  // Real-time filter on question + answer text (active language).
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return items;
    return items.filter(
      (it) =>
        it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)
    );
  }, [items, query]);

  // While searching, force a fresh `key` so the first match opens by default
  // and stale accordion state from the unfiltered list doesn't persist.
  const hasQuery = query.trim() !== "";
  const noResults = filtered.length === 0;

  return (
    <section id="faq" className="section cv-auto bg-veil relative overflow-hidden scroll-mt-24">
      <div className="relative z-10 max-w-page mx-auto px-5 md:px-8">
        {/* Encabezado interno — omitido en modo standalone (/faq), donde
            el PageHeader ya titula la página. */}
        {!standalone && (
          <div className="relative max-w-3xl mx-auto text-center">
            <Reveal>
              <div className="relative flex justify-center">
                <Eyebrow>{t("faqEyebrow")}</Eyebrow>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h2
                className="relative mt-5 t-h2 text-primary"
              >
                {es ? (
                  <>
                    Preguntas <span className="text-gradient">frecuentes</span>
                  </>
                ) : (
                  <>
                    Frequently asked <span className="text-gradient">questions</span>
                  </>
                )}
              </h2>
            </Reveal>
          </div>
        )}

        {/* Search input — filters FAQ items in real time */}
        <Reveal delay={0.1} y={24}>
          <div className="relative mt-8 max-w-3xl mx-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-tertiary pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={es ? "Buscar en las preguntas…" : "Search questions…"}
              aria-label={es ? "Buscar en las preguntas frecuentes" : "Search frequently asked questions"}
              className="w-full bg-[rgb(var(--divider)/0.05)] border border-[rgb(var(--divider)/0.10)] rounded-md h-10 pl-10 pr-3 text-sm text-primary placeholder:text-tertiary outline-none transition-colors hover:border-[rgb(var(--divider)/0.25)] focus-visible:border-[rgb(var(--divider)/0.30)]"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12} y={32}>
          <div className="relative mt-6 max-w-3xl mx-auto liquid-glass depth-2 rounded-card p-2 md:p-3 transition-shadow duration-300">
            {noResults ? (
              /* ───── No-results panel — links to the GlossaryModal ───── */
              <div className="relative px-4 py-12 text-center">
                <p className="text-base font-medium text-primary">
                  {es
                    ? "No se encontraron resultados"
                    : "No results found"}
                </p>
                <p className="mt-2 text-sm text-secondary">
                  {es
                    ? "Prueba con otra palabra o consulta el glosario de trading."
                    : "Try another word or browse the trading glossary."}
                </p>
                <button
                  type="button"
                  onClick={() => setGlossaryOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-[rgb(var(--accent-hover))] hover:underline transition-colors"
                >
                  {es ? "Abrir glosario →" : "Open glossary →"}
                </button>
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                key={hasQuery ? `search-${query.trim()}` : "default"}
                defaultValue="item-0"
                className="relative px-2 md:px-3"
              >
                {filtered.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i}`}
                    className="border-[rgb(var(--divider)/0.08)] last:border-b-0 rounded-md transition-[border-color,box-shadow,background-color] duration-300 data-[state=open]:border-[rgb(var(--divider)/0.25)] data-[state=open]:bg-[rgb(var(--divider)/0.05)] data-[state=open]:shadow-[0_0_28px_-6px_rgb(var(--accent-base)/0.35)]"
                  >
                    <AccordionTrigger className="text-left text-base md:text-[1.05rem] font-medium text-primary hover:text-[rgb(var(--accent-hover))] hover:no-underline py-5 transition-colors">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-secondary leading-relaxed text-[0.95rem] pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 text-center text-sm text-tertiary">
            {es ? "¿No encuentras tu respuesta?" : "Didn't find your answer?"}{" "}
            <a
              href="mailto:soporte@tradingjournal.app"
              className="link-underline text-primary hover:text-[rgb(var(--accent-hover))] font-medium transition-colors"
            >
              {es ? "Escríbenos" : "Email us"}
            </a>
            .
          </p>
        </Reveal>

        {/* Glossary trigger — reinforces the frozen-glossary philosophy.
            Same controlled instance powers the "no results" link above. */}
        <Reveal delay={0.26}>
          <div className="mt-4 text-center">
            <GlossaryModal
              open={glossaryOpen}
              onOpenChange={setGlossaryOpen}
              trigger={
                <button
                  type="button"
                  className="text-sm text-tertiary hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  {es
                    ? "¿No encuentras tu término? Consulta el glosario →"
                    : "Can't find your term? Browse the glossary →"}
                </button>
              }
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
