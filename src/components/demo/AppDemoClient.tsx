"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/tj/Skeleton";

/**
 * Client-side entry point for the demo. We can't call
 * `next/dynamic({ ssr: false })` directly from a Server Component (Next.js
 * 15+ disallows it), so this thin client wrapper hosts the dynamic import.
 * The demo bundle never ships in the initial SSR payload — it hydrates on
 * the client when the demo section is reached. The skeleton reserves the
 * full window height (chrome + nav + 640px panel + status bar) to avoid CLS.
 *
 * As of R24-1a this loads `RealScreenshotDemo` (real app screenshots inside
 * the existing demo window chrome) instead of the hand-built interactive
 * `AppDemo` recreation. The owner's feedback: the recreation "doesn't look
 * like the real app at all" — showing the REAL screenshots makes the demo
 * "look exactly like the real app" because it IS the real app's pixels.
 * The old `AppDemo` + its `pages/*` are preserved (not deleted) for future
 * use; only the import below is swapped.
 */
const RealScreenshotDemo = dynamic(
  () =>
    import("@/components/demo/RealScreenshotDemo").then((m) => ({
      default: m.RealScreenshotDemo,
    })),
  {
    ssr: false,
    loading: () => <DemoSkeleton />,
  }
);

/**
 * Glass placeholder that mirrors the demo window's height and approximate
 * layout while the real bundle hydrates. Renders a skeleton window chrome,
 * 8-tab nav strip, and a dark screenshot-panel placeholder (a centered
 * 1500×856-aspect block with a few skeleton elements inside) — the same
 * structure the loaded RealScreenshotDemo will show, but greyed out and
 * pulse-breathing. This makes the load feel intentional rather than empty.
 *
 * Reserved height matches the live demo exactly per breakpoint:
 *   WindowChrome h-9 (36px) + tab strip h-11 (44px) + panel h-[480px]
 *   (mobile) / h-[560px] (sm+) / h-[640px] (md+) + status bar h-7 (28px)
 *   = 588px mobile, 668px sm+, 748px md+. Using responsive classes (not
 *   an inline fixed height) avoids CLS at each breakpoint when the real
 *   demo hydrates with its own `h-[480px] sm:h-[560px] md:h-[640px]` panel.
 *
 * The outer container uses the EXACT same two-layer material + shadow
 * classes as the live demo window — outer wrapper carries
 * `rounded-xl overflow-hidden border border-white/10 shadow-[...]` (a
 * 4-layer shadow stack: depth-3's key/fill/accent glow + the task's
 * heavier `0 24px 80px -12px rgb(0 0 0/0.6)` drop shadow; kept off the
 * `.liquid-glass` element so it isn't overridden by the class's own
 * `border: none` + `box-shadow`), inner carries
 * `liquid-glass rounded-xl overflow-hidden` — so hydration is visually
 * seamless. Only the inner content swaps from greyed-out skeleton blocks
 * to the real screenshot.
 */
function DemoSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_10px_rgb(0_0_0/0.26),0_18px_40px_rgb(0_0_0/0.3),0_0_28px_rgb(var(--accent-base)/0.1),0_24px_80px_-12px_rgb(0_0_0/0.6)] h-[588px] sm:h-[668px] md:h-[748px]"
      aria-hidden="true"
    >
      <div className="liquid-glass rounded-xl overflow-hidden h-full">
      {/* ---- Window chrome (h-9) — Windows 11 layout: app icon + name on
          the left, Min/Max/Close caption-button skeletons on the right. No
          centered pill (Win11 doesn't center the title). Matches the live
          WindowChrome so hydration is visually seamless. */}
      <div className="liquid-glass border-b border-white/10 flex items-center justify-between h-9 shrink-0">
        <div className="flex items-center px-3 min-w-0">
          {/* App icon placeholder — same 16×16 rounded square as the real
              AppIcon, kept grey so it doesn't read as a brand mark yet. */}
          <span className="w-4 h-4 rounded-[3px] bg-white/10 shrink-0" />
          <Skeleton className="h-3 w-28 ml-2 hidden sm:block" />
          <Skeleton className="h-5 w-16 ml-2 rounded-pill" />
        </div>
        {/* Caption-button skeletons — three 46×full-height slots mirroring
            the Minimize / Maximize / Close layout in the live title bar. */}
        <div className="flex items-stretch h-full">
          <div className="w-[46px] h-full flex items-center justify-center">
            <Skeleton className="h-2.5 w-2.5" />
          </div>
          <div className="w-[46px] h-full flex items-center justify-center">
            <Skeleton className="h-2.5 w-2.5" />
          </div>
          <div className="w-[46px] h-full flex items-center justify-center">
            <Skeleton className="h-2.5 w-2.5" />
          </div>
        </div>
      </div>

      {/* ---- Top nav (h-11) — 8 skeleton tabs (matches the 8 screenshot
          tabs in RealScreenshotDemo; the old interactive AppDemo had 6). ---- */}
      <div className="liquid-glass border-b border-white/10 flex items-center gap-1 px-2 h-11 shrink-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`h-9 px-3 rounded-md flex items-center gap-2 ${
              i === 0 ? "bg-white/5 border border-white/10" : ""
            }`}
          >
            <Skeleton className="h-3.5 w-3.5 rounded-sm" />
            <Skeleton className="h-3 w-16 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* ---- Screenshot panel — always-dark surface (#0b0c0d) matching
          RealScreenshotDemo's panel background. A single centered
          skeleton block represents the screenshot loading (the real
          demo shows one screenshot at a time, not a KPI grid + chart +
          table — so the skeleton drops the old dashboard-style content
          and just reserves the dark panel). ---- */}
      <div
        className="relative overflow-hidden h-[480px] sm:h-[560px] md:h-[640px] flex items-center justify-center"
        style={{ background: "#0b0c0d" }}
      >
        {/* Centered screenshot-aspect placeholder — a single 1500×856
            aspect-ratio block that mirrors the real screenshots'
            proportions, so when the real screenshot hydrates and fills
            the panel via object-contain, the visual swap is seamless
            (same dark surface, same centered frame, just real pixels
            replacing the skeleton). */}
        <div className="relative w-full max-w-[860px] aspect-[1500/856] rounded-card border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-48 opacity-70" />
            <div className="mt-4 grid grid-cols-3 gap-3 w-full max-w-md">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
            <Skeleton className="mt-2 h-24 w-full max-w-md" />
          </div>
        </div>
      </div>

      {/* ---- Status bar (h-7) ---- */}
      <div className="liquid-glass border-t border-white/10 flex items-center justify-between px-3 h-7 shrink-0">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-2.5 w-24 hidden sm:block" />
        <Skeleton className="h-2.5 w-20" />
      </div>

      {/* Top + bottom window reflections — mirror the live AppDemo's
          key-light hairlines (1px white-to-transparent at the top edge,
          even softer 1px at the bottom) so hydration is visually
          seamless: the machined-edge highlight is already present when
          the real demo mounts, no flash. pointer-events-none so the
          skeleton never accidentally intercepts the cursor. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-b from-white/15 to-transparent pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-t from-white/[0.06] to-transparent pointer-events-none z-10"
      />
      </div>
    </div>
  );
}

export function AppDemoClient() {
  return <RealScreenshotDemo />;
}
