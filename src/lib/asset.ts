/**
 * Prefix an absolute asset path with the app's basePath.
 *
 * Next.js does NOT automatically prepend `basePath` to absolute `src`
 * strings that start with "/" (e.g. `src="/img/foo.webp"` on a plain
 * `<Image>` / `<img>`), so under `output: "export"` + `basePath` those
 * resolve to the host root and 404 on GitHub Pages.
 *
 * Use this for any asset path you hand-build as a string:
 *
 *   <Image src={asset("/img/foo.webp")} ... />
 *
 * For paths that are already relative ("foo.webp", "./foo.webp") or that
 * come from next/image's own loader, this is a no-op.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path) return path;
  // Already prefixed, or an external/data URL — leave alone.
  if (path.startsWith(BASE) || /^https?:\/\//.test(path) || path.startsWith("data:")) {
    return path;
  }
  // Relative path (no leading slash) — prefix with "base/".
  if (!path.startsWith("/")) {
    return `${BASE}/${path}`;
  }
  // Absolute path starting with "/" — splice base in front.
  return `${BASE}${path}`;
}
