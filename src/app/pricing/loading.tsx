import { PageSkeleton } from "@/components/tj/PageSkeleton";

/**
 * Pricing route loading state — branded skeleton matching the
 * Pricing page layout (PageHeader hero + plan-card grid).
 */
export default function Loading() {
  return <PageSkeleton cards={3} />;
}
