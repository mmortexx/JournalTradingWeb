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
 * R25-1a (revert): loads the interactive `AppDemo` recreation again. R24-1a
 * swapped this for `RealScreenshotDemo` (real app screenshots inside the
 * demo window chrome) after the owner said the recreation "didn't look
 * like the real app". The owner has now (R25-1a) rejected that change —
 * "la demo en vivo es una puta mierda solo has puesto las fotos" — because
 * the screenshot demo removed all interactivity (no clickable tabs that
 * actually swap pages, no filters, no drill-downs, no command palette).
 * We restore the interactive `AppDemo` and fix its top nav / title bar /
 * status bar to match the real app's structure (R25-1a fixes 2/3/4), so
 * the live demo both IS interactive AND reads as the real product.
 *
 * The `RealScreenshotDemo` component file is preserved (not deleted) for
 * future use; only the import below is swapped back.
 */
const AppDemo = dynamic(
  () => import("@/components/demo/AppDemo").then((m) => ({ default: m.AppDemo })),
  {
    ssr: false,
    loading: () => <DemoSkeleton />,
  }
);

/**
 * Dashboard-style skeleton that mirrors the live demo window's height and
 * approximate layout while the interactive bundle hydrates. Renders a
 * skeleton window chrome, the 9-tab nav strip (8 main tabs + Settings —
 * matches TopNav after R25-1a), and a dashboard-style panel: 4 KPI cards
 * in a row, a wide chart block, then a table block — the same shapes the
 * real DashboardPage paints on mount. This makes the load feel
 * intentional (the user sees the dashboard's silhouette form, then it
 * fills in) rather than empty.
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
 * to the real interactive dashboard.
 */
function DemoSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_10px_rgb(0_0_0/0.26),0_18px_40px_rgb(0_0_0/0.3),0_0_28px_rgb(var(--accent-base)/0.1),0_24px_80px_-12px_rgb(0_0_0/0.6)] h-[588px] sm:h-[668px] md:h-[748px]"
      aria-hidden="true"
    >
      <div className="liquid-glass rounded-xl overflow-hidden h-full flex flex-col">
        {/* ---- Window chrome (h-9) — Windows 11 layout: app icon + name on
            the left, account chip + market-clock skeleton in the center,
            Local-first LED skeleton on the right, Min/Max/Close caption
            buttons at the far right. Matches the live WindowChrome (post
            R25-1a) so hydration is visually seamless. */}
        <div className="liquid-glass border-b border-white/10 flex items-center justify-between h-9 shrink-0">
          <div className="flex items-center px-3 min-w-0">
            {/* App icon placeholder — same 16×16 rounded square as the real
                AppIcon, kept grey so it doesn't read as a brand mark yet. */}
            <span className="w-4 h-4 rounded-[3px] bg-white/10 shrink-0" />
            <Skeleton className="h-3 w-28 ml-2 hidden sm:block" />
          </div>
          {/* Center — account chip + market clock skeletons. */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-pill" />
            <Skeleton className="h-3 w-20" />
          </div>
          {/* Right — Local-first LED + caption buttons. */}
          <div className="flex items-stretch h-full">
            <div className="hidden sm:flex items-center gap-1.5 px-3">
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
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

        {/* ---- Top nav (h-11) — 9 skeleton tabs (8 main + Settings, matches
            the post-R25-1a TopNav). ---- */}
        <div className="liquid-glass border-b border-white/10 flex items-center gap-1 px-2 h-11 shrink-0">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={`h-9 px-3 rounded-md flex items-center gap-2 ${
                i === 0 ? "bg-white/5 border border-white/10" : ""
              }`}
            >
              <Skeleton className="h-3.5 w-3.5 rounded-sm" />
              <Skeleton className="h-3 w-14 hidden sm:block" />
            </div>
          ))}
        </div>

        {/* ---- Dashboard-style panel — mirrors the DashboardPage's general
            composition: 4 KPI cards in a row, a wide chart block, then a
            table block. Same dark surface tokens the live demo uses
            (panel inherits its background from the liquid-glass wrapper)
            so the swap from greyed-out skeleton to the real interactive
            dashboard is visually seamless. ---- */}
        <div className="relative overflow-hidden h-[480px] sm:h-[560px] md:h-[640px] p-5 md:p-6 space-y-4">
          {/* KPI row — 4 cards. */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-card border border-white/10 bg-white/[0.03] p-4 space-y-2"
              >
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-2 w-20 opacity-70" />
              </div>
            ))}
          </div>
          {/* Chart block — wide + tall. */}
          <div className="rounded-card border border-white/10 bg-white/[0.03] p-4 h-[180px] md:h-[220px] flex items-end gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-sm"
                // Varying heights so the bar-chart silhouette reads.
                style={{ height: `${30 + ((i * 37) % 60)}%` }}
              />
            ))}
          </div>
          {/* Table block — rows + columns. */}
          <div className="rounded-card border border-white/10 bg-white/[0.03] p-4 space-y-2">
            <div className="flex gap-4 pb-2 border-b border-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-2.5 flex-1 max-w-[80px]" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="flex gap-4">
                {Array.from({ length: 5 }).map((_, c) => (
                  <Skeleton key={c} className="h-3 flex-1 max-w-[80px]" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ---- Status bar (h-7) ---- */}
        <div className="liquid-glass border-t border-white/10 flex items-center justify-between px-3 h-7 shrink-0 mt-auto">
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-2.5 w-40 hidden sm:block" />
          <Skeleton className="h-2.5 w-16" />
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
  return <AppDemo />;
}
