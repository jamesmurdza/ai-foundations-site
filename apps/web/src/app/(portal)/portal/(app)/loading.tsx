import { LoadingScreen } from "@portal/components/LoadingScreen";

// Loading boundary for the signed-in app pages (home, submissions, discover…).
// Beyond the instant feedback, having a loading boundary lets Next partially
// prefetch these dynamic routes (layout → here) instead of nothing.
export default function AppLoading() {
  return <LoadingScreen />;
}
