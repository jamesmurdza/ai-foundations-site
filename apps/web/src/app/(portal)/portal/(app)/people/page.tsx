import { redirect } from "@portal/lib/nav";

/** Legacy route — discover page lives at /discover. */
export default async function PeopleRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; week?: string }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.tab) {
    const legacy: Record<string, string> = {
      directory: "people",
      map: "activity",
      stars: "activity",
      pulse: "activity",
    };
    params.set("tab", legacy[sp.tab] ?? sp.tab);
  }
  if (sp.week) params.set("week", sp.week);
  const q = params.toString();
  redirect(`/discover${q ? `?${q}` : ""}`);
}
