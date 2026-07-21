import { PageSkeleton } from "@/components/tj/PageSkeleton";

/**
 * Features route loading state — branded skeleton matching the
 * Features page layout (PageHeader hero + card grid).
 */
export default function Loading() {
  return <PageSkeleton cards={3} />;
}
