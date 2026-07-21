"use client";

import dynamic from "next/dynamic";
import { Skeleton, SkeletonText } from "@/components/tj/Skeleton";

/**
 * Client-side entry point for the AppDemo. We can't call
 * `next/dynamic({ ssr: false })` directly from a Server Component (Next.js
 * 15+ disallows it), so this thin client wrapper hosts the dynamic import.
 * The demo bundle (7 pages + many Framer Motion + canvas charts) never
 * ships in the initial SSR payload — it hydrates on the client when the
 * demo section is reached. The skeleton reserves the full window height
 * (chrome + nav + 640px panel + status bar) to avoid CLS.
 */
const AppDemo = dynamic(
  () => import("@/components/demo/AppDemo").then((m) => ({ default: m.AppDemo })),
  {
    ssr: false,
    loading: () => <DemoSkeleton />,
  }
);

/**
 * Glass placeholder that mirrors the demo window's height and approximate
 * layout while the real bundle hydrates. Renders a skeleton window chrome,
 * nav tab strip, KPI grid, chart block and table rows — the same structure
 * the loaded demo will show, but greyed out and pulse-breathing. This makes
 * the load feel intentional rather than empty.
 *
 * Reserved height matches the live demo exactly per breakpoint:
 *   WindowChrome h-9 (36px) + TopNav h-11 (44px) + panel h-[480px] (mobile)
 *   / h-[560px] (sm+) / h-[640px] (md+) + status bar h-7 (28px)
 *   = 588px mobile, 668px sm+, 748px md+. Using responsive classes (not
 *   an inline fixed height) avoids CLS at each breakpoint when the real
 *   demo hydrates with its own `h-[480px] sm:h-[560px] md:h-[640px]` panel.
 *
 * The outer container uses the EXACT same two-layer material + shadow
 * classes as the live `AppDemo` window — outer wrapper carries
 * `rounded-xl overflow-hidden border border-white/10 shadow-[...]` (a
 * 4-layer shadow stack: depth-3's key/fill/accent glow + the task's
 * heavier `0 24px 80px -12px rgb(0 0 0/0.6)` drop shadow; kept off the
 * `.liquid-glass` element so it isn't overridden by the class's own
 * `border: none` + `box-shadow`), inner carries
 * `liquid-glass rounded-xl overflow-hidden` — so hydration is visually
 * seamless. Only the inner content swaps from greyed-out skeleton blocks
 * to the real interactive UI.
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

      {/* ---- Top nav (h-11) — 6 skeleton tabs ---- */}
      <div className="liquid-glass border-b border-white/10 flex items-center gap-1 px-2 h-11 shrink-0">
        {Array.from({ length: 6 }).map((_, i) => (
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

      {/* ---- Page content (scrollable region) ---- */}
      <div className="relative overflow-hidden h-[480px] sm:h-[560px] md:h-[640px]">
        {/* Section header inside the page */}
        <div className="p-6 pb-4 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-2/3" />
          <SkeletonText lines={2} lineHeight="h-3.5" className="pt-1" />
        </div>

        {/* KPI grid — 4 skeleton cards */}
        <div className="px-6 grid grid-cols-2 md:grid-cols-4 gap-3 pb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-card border border-white/10 bg-white/[0.03] p-4 space-y-2"
            >
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          ))}
        </div>

        {/* Chart area — equity-curve-shaped skeleton block. */}
        <div className="px-6 pb-5">
          <div className="rounded-card border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-5 w-24 rounded-pill" />
            </div>
            <Skeleton className="h-44 w-full" />
          </div>
        </div>

        {/* Table rows — trades list skeleton */}
        <div className="px-6 pb-6">
          <Skeleton className="h-3.5 w-24 mb-3" />
          <div className="rounded-card border border-white/10 bg-white/[0.03] overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-4 px-4 h-9 border-b border-white/10">
              <Skeleton className="h-2.5 w-10" />
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2.5 w-12 hidden sm:block" />
              <Skeleton className="h-2.5 w-16 ml-auto" />
              <Skeleton className="h-2.5 w-12 hidden md:block" />
            </div>
            {/* Rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-4 h-11 ${
                  i < 3 ? "border-b border-white/10" : ""
                }`}
              >
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-14 hidden sm:block" />
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-3 w-12 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Status bar (h-7) ---- */}
      <div className="liquid-glass border-t border-white/10 flex items-center justify-between px-3 h-7 shrink-0">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-2.5 w-24 hidden sm:block" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      </div>
    </div>
  );
}

export function AppDemoClient() {
  return <AppDemo />;
}
