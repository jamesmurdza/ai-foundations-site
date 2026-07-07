import { LoadingScreen } from "@portal/components/LoadingScreen";

// Portal-wide loading boundary — the fallback for every /portal/* route that
// doesn't declare a closer one (profiles, users, weeks, assignments, onboarding,
// map, showcase, stars, pulse, application, the portal index…).
//
// A loading boundary is also what lets <Link> prefetch the static shell of these
// force-dynamic routes: without it, clicking a link fires a cold RSC request
// that blocks on auth + the full server render before anything paints.
export default function PortalLoading() {
  return <LoadingScreen />;
}
