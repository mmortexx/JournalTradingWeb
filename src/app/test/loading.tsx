import { PageSkeleton } from "@/components/tj/PageSkeleton";

/**
 * FAQ route loading state — branded skeleton matching the FAQ
 * page layout (PageHeader hero + accordion-ish cards).
 */
export default function Loading() {
  return <PageSkeleton cards={4} />;
}
