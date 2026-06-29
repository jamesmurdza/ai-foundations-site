import { Suspense } from "react";
import { listWeeks, getCurrentWeek } from "@/lib/queries";
import { maxUnlockedWeek } from "@/lib/weekRoutes";
import { PageDots } from "@/components/PageDots";

// Signed-in app shell. Primary navigation lives in the top bar (see NavBar /
// TopNav), so cohort pages render full-width. An iPhone-style page-dots control
// floats at the bottom center for jumping between weeks; it's a fixed overlay,
// so it never narrows the content column.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [weeks, current] = await Promise.all([listWeeks(), getCurrentWeek()]);
  const maxUnlocked = maxUnlockedWeek();
  const dotWeeks = weeks
    .filter((w) => w.isPublished)
    .map((w) => ({
      id: w.id,
      number: w.number,
      theme: w.theme,
      locked: w.number > maxUnlocked,
    }));

  return (
    <>
      <Suspense fallback={null}>
        <PageDots weeks={dotWeeks} currentNumber={current?.number ?? null} />
      </Suspense>
      <div className="container-page py-8">{children}</div>
    </>
  );
}
