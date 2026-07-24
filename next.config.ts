import type { NextConfig } from "next";

// GitHub Pages serves the site at /JournalTradingWeb/, so production builds
// need basePath + assetPrefix + output:export. In local dev we serve at the
// root (http://localhost:3000/) with a normal dynamic server so Turbopack
// can compile on demand — `output: "export"` + Turbopack dev can deadlock.
const IS_DEV = process.env.NODE_ENV === "development";
const BASE_PATH = "/JournalTradingWeb";

const nextConfig: NextConfig = {
  // Only static-export for production (GitHub Pages) builds.
  ...(IS_DEV ? {} : { output: "export" }),
  // Only apply basePath + assetPrefix for production (GitHub Pages) builds.
  ...(IS_DEV
    ? {}
    : {
        basePath: BASE_PATH,
        assetPrefix: `${BASE_PATH}/`,
      }),
  // Expose basePath to the client so image srcs in components can be
  // prefixed (next/image does NOT auto-prefix absolute srcs starting
  // with "/" under output:export + basePath).
  env: {
    NEXT_PUBLIC_BASE_PATH: IS_DEV ? "" : BASE_PATH,
  },
  images: {
    // No loader needed for static export; we use SVG/unoptimized images only.
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  ...(IS_DEV ? {} : { trailingSlash: true }),
};

export default nextConfig;
