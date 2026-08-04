import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TERMINOS } from "@/lib/glosario";
import { HERRAMIENTAS } from "@/lib/herramientas";

export const dynamic = "force-static";


// Per-page SEO metadata. Priority is a hint to crawlers about relative
// importance within the site (0.0–1.0); changeFrequency is a hint about
// how often the page tends to be updated. Both are advisory — Google
// may ignore them — but they're useful for non-Google crawlers and for
// communicating intent.
type PageMeta = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const PAGES: PageMeta[] = [
  // The marketing landing — changes whenever a section is added/updated.
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  // Top-of-funnel discovery pages — updated when features/pricing shift.
  { path: "/features", priority: 0.9, changeFrequency: "weekly" },
  // Feature deep-dive sub-routes (Opción A architecture).
  { path: "/features/metricas", priority: 0.85, changeFrequency: "weekly" },
  { path: "/features/disciplina", priority: 0.85, changeFrequency: "weekly" },
  { path: "/features/seguridad", priority: 0.85, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.8, changeFrequency: "monthly" },
  /* El diagnóstico. Prioridad alta pese a no vender nada directamente:
     es la página que más gente comparte y por la que más se entra, porque
     se sale de ella con una cifra propia. */
  { path: "/test", priority: 0.8, changeFrequency: "monthly" },
  // Lower-velocity editorial / trust pages.
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  /* Páginas legales. Prioridad baja porque nadie las busca, pero van en el
     mapa igualmente: que existan y sean localizables es una señal de
     confianza, y las pasarelas de pago las exigen accesibles antes de
     aprobar una cuenta. Cambian una vez al año como mucho. */
  { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  { path: "/aviso-legal", priority: 0.3, changeFrequency: "yearly" },

  /* ── Secciones generadas ──────────────────────────────────────────
     El glosario y las herramientas se derivan de sus propios datos en
     lugar de escribirse aquí a mano. El motivo es simple: son 51 + 6
     direcciones, y una lista copiada se desincroniza el primer día que
     alguien añada un término. Si mañana el glosario crece, el mapa del
     sitio crece con él sin que nadie se acuerde de tocarlo. */
  { path: "/glosario", priority: 0.7, changeFrequency: "monthly" },
  ...TERMINOS.map((t) => ({
    path: `/glosario/${t.slug}`,
    /* Baja por página, y es lo correcto: ninguna definición suelta
       compite con la portada. El valor está en el conjunto. */
    priority: 0.5,
    changeFrequency: "yearly" as const,
  })),
  { path: "/herramientas", priority: 0.8, changeFrequency: "monthly" },
  ...HERRAMIENTAS.map((h) => ({
    path: `/herramientas/${h.slug}`,
    /* Más alta que las del glosario: una calculadora resuelve algo, y es
       la clase de página que la gente enlaza y comparte. */
    priority: 0.7,
    changeFrequency: "monthly" as const,
  })),
];

// Use a frozen build-time date so the static export is deterministic
// (otherwise `new Date()` would emit a different sitemap.xml on every
// rebuild, even when content is unchanged).
const LAST_MODIFIED = new Date("2025-01-01T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === "/" ? "/" : `${path}/`}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  }));
}
