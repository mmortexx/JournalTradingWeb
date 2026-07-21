"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop — scrolls the window to the top on every client-side
 * route change.
 *
 * Next.js App Router restores scroll automatically for browser
 * back/forward navigation, but new (forward) navigations keep the
 * current scroll position when the previous page was already at the
 * top. This tiny client component guarantees a consistent "start at
 * the top" feel on every navigation, which is what users expect on a
 * multi-page marketing site.
 *
 * Renders nothing — pure side-effect component.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    // `instant` avoids fighting the browser's native scroll-restoration
    // tween (which would otherwise animate from the old position).
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}
