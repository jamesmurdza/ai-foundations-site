import { redirect } from "@portal/lib/nav";

/** Legacy route — the lessons hub lives at /lessons. */
export default async function CheckInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const sp = await searchParams;
  redirect(sp.week ? `/lessons/${sp.week}` : "/lessons");
}
