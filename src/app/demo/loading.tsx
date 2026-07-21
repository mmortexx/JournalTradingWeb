import { PageSkeleton } from "@/components/tj/PageSkeleton";

/**
 * Demo route loading state — branded skeleton. The demo page itself
 * is heavy (charts, AppDemo client bundle) so this skeleton streams
 * fast while that code loads.
 */
export default function Loading() {
  return <PageSkeleton cards={2} />;
}
