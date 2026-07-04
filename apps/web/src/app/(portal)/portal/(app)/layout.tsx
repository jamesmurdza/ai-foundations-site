import { Suspense } from "react";
import { listWeeks, getCurrentWeek } from "@portal/lib/queries";
import { maxUnlockedWeek } from "@portal/lib/weekRoutes";
import { PageDots } from "@portal/components/PageDots";

// Signed-in app shell. Primary navigation lives in the top bar (see NavBar /
// TopNav), so cohort pages render full-width. An iPhone-style page-dots control
// floats at the bottom center for jumping between weeks; it's a fixed overlay,
// so it never narrows the content column.
export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  // Parallel `@modal` slot: the Instagram-style intercepting route for opening a
  // submission over the current page. Empty (default.tsx → null) until a soft
  // navigation to /submissions/[id] fills it.
  modal: React.ReactNode;
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
      {modal}
    </>
  );
}
