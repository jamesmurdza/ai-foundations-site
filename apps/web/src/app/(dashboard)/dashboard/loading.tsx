import { LoadingScreen } from "@dashboard/components/LoadingScreen";

// Loading boundary for the admin dashboard (application list + detail views).
// Rendered inside AdminShell's <main>, so the top bar stays put. The boundary
// also gives <Link> a static shell to prefetch for these force-dynamic routes,
// so navigating into an application no longer blocks on a cold server render.
export default function DashboardLoading() {
  return <LoadingScreen />;
}
