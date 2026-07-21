import { PageSkeleton } from "@/components/tj/PageSkeleton";

/**
 * About route loading state — branded skeleton matching the About
 * page layout (PageHeader hero + content sections).
 */
export default function Loading() {
  return <PageSkeleton cards={3} />;
}
