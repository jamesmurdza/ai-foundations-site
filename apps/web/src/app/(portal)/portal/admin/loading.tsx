import { LoadingScreen } from "@portal/components/LoadingScreen";

// Loading boundary for the admin console. Rendered inside the admin layout, so
// the "Organizer console" header and the AdminTabs stay put while the active
// tab's data streams in — navigation between admin tabs feels instant.
export default function AdminLoading() {
  return <LoadingScreen />;
}
