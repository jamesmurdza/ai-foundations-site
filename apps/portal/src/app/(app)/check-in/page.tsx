import { redirect } from "next/navigation";

/** Legacy route — home page lives at /home. */
export default async function CheckInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.week ? `?week=${sp.week}` : "";
  redirect(`/home${q}`);
}
