import { Skeleton } from "@/components/tj/Skeleton";

/**
 * Demo route loading state — branded skeleton that mirrors the demo page's
 * actual layout: PageHeader hero → DemoCapabilities 6-card grid → demo
 * window (chrome + nav + dashboard panel + status bar). Server-safe (no
 * hooks) so it streams instantly while the route's JS chunks load.
 *
 * The demo window skeleton mirrors the live AppDemoClient's DemoSkeleton
 * (WindowChrome h-9/10 + TopNav h-11/12 + panel h-[480/560/640] + StatusBar
 * h-7) so the transition from route-loading → demo-bundle-loading → live
 * demo is visually continuous (no layout shift, no flash of empty space).
 *
 * Owned by P2 (demo polish). Uses `.tj-container` for the hero/capabilities
 * gutters (matches the live demo page's `#demo` wider mancha).
 */
export default function Loading() {
  return (
    <>
      {/* ===== PageHeader-sized hero skeleton ===== */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="tj-container">
          <Skeleton className="h-3.5 w-40 mb-6" />
          <Skeleton shimmer className="h-5 w-28 mb-5" />
          <Skeleton shimmer className="h-12 w-[80%] mb-3" />
          <Skeleton shimmer className="h-12 w-[55%] mb-5" />
          <Skeleton className="h-4 w-[90%] mb-2" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </section>

      {/* ===== DemoCapabilities — 6-card grid (2-col mobile, 3-col md) ===== */}
      <section className="pb-12">
        <div className="tj-container">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <Skeleton shimmer className="h-4 w-32 mx-auto mb-4" />
            <Skeleton shimmer className="h-9 w-[75%] mx-auto mb-2" />
            <Skeleton className="h-4 w-[60%] mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-card border border-[rgb(var(--divider)/0.10)] p-5 flex flex-col gap-3"
              >
                <Skeleton className="w-9 h-9 rounded-md" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[90%]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Demo window skeleton — mirrors live AppDemoClient's DemoSkeleton.
          Same two-layer material + shadow classes + responsive heights so the
          swap to the interactive demo is visually seamless. ===== */}
      <section id="demo" className="section bg-veil scroll-mt-16">
        <div className="tj-container">
          <div
            className="rounded-lg overflow-hidden border border-[rgb(var(--divider)/0.1)] shadow-[0_2px_8px_rgb(0_0_0/0.28),0_18px_50px_-12px_rgb(0_0_0/0.55)] h-[598px] sm:h-[674px] md:h-[754px]"
            aria-hidden="true"
          >
            <div className="rounded-lg overflow-hidden h-full flex flex-col">
              {/* Window chrome (h-11 mobile / h-10 sm+) */}
              <div className="border-b border-[rgb(var(--divider)/0.1)] flex items-center justify-between h-11 sm:h-10 shrink-0 px-2.5 sm:px-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Skeleton className="w-[18px] h-[18px] rounded-[2px]" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-stretch h-full">
                  <div className="w-11 sm:w-[46px] h-full flex items-center justify-center">
                    <Skeleton className="h-2.5 w-2.5" />
                  </div>
                  <div className="w-11 sm:w-[46px] h-full flex items-center justify-center">
                    <Skeleton className="h-2.5 w-2.5" />
                  </div>
                  <div className="w-11 sm:w-[46px] h-full flex items-center justify-center">
                    <Skeleton className="h-2.5 w-2.5" />
                  </div>
                </div>
              </div>

              {/* Top nav (h-[46px]) — 4 skeleton tabs + right-side buttons */}
              <div className="border-b border-[rgb(var(--divider)/0.1)] grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch h-[46px] shrink-0">
                <div aria-hidden="true" />
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-9 min-w-[44px] sm:min-w-0 px-3 sm:px-4 rounded-md sm:rounded-none flex items-center gap-2 ${
                        i === 0
                          ? "bg-[rgb(var(--accent-base)/0.10)] sm:bg-transparent"
                          : ""
                      }`}
                    >
                      <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                      <Skeleton className="h-3 w-14 hidden sm:block" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-0.5 pr-2">
                  <Skeleton className="h-8 w-8 rounded-[2px] hidden sm:block" />
                  <Skeleton className="h-8 w-8 rounded-[2px]" />
                </div>
              </div>

              {/* Dashboard-style panel — 4 KPI cards + chart block + table block */}
              <div className="relative overflow-hidden h-[480px] sm:h-[560px] md:h-[640px] p-5 md:p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-card border border-[rgb(var(--divider)/0.1)] p-4 space-y-2"
                    >
                      <Skeleton className="h-2.5 w-16" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-2 w-20 opacity-70" />
                    </div>
                  ))}
                </div>
                <div className="rounded-card border border-[rgb(var(--divider)/0.1)] p-4 h-[180px] md:h-[220px] flex items-end gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ height: `${30 + ((i * 37) % 60)}%` }}
                    />
                  ))}
                </div>
                <div className="rounded-card border border-[rgb(var(--divider)/0.1)] p-4 space-y-2">
                  <div className="flex gap-4 pb-2 border-b border-[rgb(var(--divider)/0.05)]">
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

              {/* Status bar (h-7) */}
              <div className="border-t border-[rgb(var(--divider)/0.1)] flex items-center justify-between px-3 h-7 shrink-0 mt-auto">
                <Skeleton className="h-2.5 w-32" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
