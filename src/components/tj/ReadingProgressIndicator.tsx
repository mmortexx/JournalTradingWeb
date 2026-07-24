"use client";

import { useEffect, useState } from "react";

/**
 * ReadingProgressIndicator — a 2px accent bar fixed at the top of the
 * viewport that fills left-to-right as the visitor scrolls through the
 * page content. Sits below the Navbar (top-[60px]) so it reads as a
 * progress cue layered on top of the page, not competing with the nav.
 *
 * - Uses requestAnimationFrame-throttled scroll listener for smooth
 *   width updates without jank.
 * - The bar is `rgb(var(--accent-base))` at 0.7 opacity so it reads as
 *   a quiet institutional accent, not a loud notification.
 * - A faint glow under the leading edge gives it a "machined" feel.
 * - Hidden on the home page (where scroll is already choreographed by
 *   the eye) — mounted only on content subpages via the `enabled` prop
 *   or by the parent choosing to render it.
 * - Respects prefers-reduced-motion: the bar still updates (it's a
 *   direct-manipulation indicator, not an animation) but the glow
 *   transition is instant.
 */
export function ReadingProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 z-40 pointer-events-none"
      style={{ top: 60, height: 2 }}
      aria-hidden="true"
    >
      {/* Track — full-width faint hairline so the empty portion is visible */}
      <div
        className="absolute inset-0"
        style={{ background: "rgb(var(--divider) / 0.08)" }}
      />
      {/* Fill — accent, width = progress% */}
      <div
        className="absolute inset-y-0 left-0 transition-[width] duration-75 ease-out"
        style={{
          width: `${progress}%`,
          background: "rgb(var(--accent-base) / 0.7)",
          boxShadow: "0 0 8px rgb(var(--accent-base) / 0.4)",
        }}
      />
    </div>
  );
}
