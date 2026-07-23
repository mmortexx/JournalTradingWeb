import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";

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
  // Lower-velocity editorial / trust pages.
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
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
