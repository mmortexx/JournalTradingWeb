"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "@/lib/i18n";
import { withLocale } from "@/lib/locale";

/**
 * Sustituto de `next/link` que respeta el idioma activo.
 *
 * ── El problema que resuelve ──────────────────────────────────────────
 * `LanguageProvider` deriva el idioma de la propia dirección: estar en
 * `/en/pricing` es lo que hace que la página se lea en inglés. Pero un
 * `<Link href="/features">` escrito a mano no sabe nada de eso — llevaría
 * a `/features` en español aunque el visitante estuviera leyendo
 * `/en/pricing`, sacándolo del idioma sin avisar en cuanto tocara
 * cualquier enlace de la barra, el pie o el paso siguiente de una
 * página.
 *
 * ── Por qué esto y no un enlace corregido a mano en cada sitio ────────
 * Habría que tocar unos veinte ficheros con enlaces internos, a mano,
 * sin ninguna garantía de que un enlace nuevo el día de mañana recuerde
 * hacer lo mismo. Con un componente, la regla vive en un solo sitio: se
 * usa `Link` de aquí en vez de `next/link` y el idioma se respeta solo.
 *
 * Mismo API que `next/link` —mismas props, mismo comportamiento— así que
 * cambiar el `import` es el único cambio que pide cada fichero.
 */
export function Link({ href, ...resto }: ComponentProps<typeof NextLink>) {
  const { lang } = useLang();
  const destino = typeof href === "string" ? withLocale(href, lang) : href;
  return <NextLink href={destino} {...resto} />;
}
