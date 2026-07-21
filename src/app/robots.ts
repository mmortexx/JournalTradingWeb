import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://mmortexx.github.io/JournalTradingWeb";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
