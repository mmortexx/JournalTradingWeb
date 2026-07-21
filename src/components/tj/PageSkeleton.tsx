import { Skeleton, SkeletonCard } from "@/components/tj/Skeleton";

/**
 * PageSkeleton — branded, lightweight per-route loading state.
 *
 * Mirrors the visual rhythm of the marketing sub-pages: a
 * PageHeader-sized hero skeleton (h-64) followed by a few skeleton
 * cards. Server-safe (no hooks) so loading.tsx files can stay as
 * tiny one-liners and stream instantly.
 *
 * `cards` lets a route tweak how many skeleton cards to show; the
 * default (3) matches most marketing pages.
 */
interface PageSkeletonProps {
  /** Number of skeleton cards under the header. Defaults to 3. */
  cards?: number;
  /** Optional className for the wrapping container. */
  className?: string;
}

export function PageSkeleton({ cards = 3, className = "" }: PageSkeletonProps) {
  return (
    <div className={className}>
      {/* PageHeader-sized hero skeleton */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-page mx-auto px-5 md:px-8">
          {/* breadcrumb */}
          <Skeleton className="h-3.5 w-40 mb-6" />
          {/* eyebrow */}
          <Skeleton shimmer className="h-5 w-28 mb-5" />
          {/* title — two lines, large */}
          <Skeleton shimmer className="h-12 w-[80%] mb-3" />
          <Skeleton shimmer className="h-12 w-[55%] mb-5" />
          {/* subtitle — two lines */}
          <Skeleton className="h-4 w-[90%] mb-2" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </section>

      {/* Body — grid of skeleton cards */}
      <section className="max-w-page mx-auto px-5 md:px-8 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
