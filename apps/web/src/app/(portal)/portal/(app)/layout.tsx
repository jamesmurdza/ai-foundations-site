// Signed-in app shell. Primary navigation lives in the top bar (see NavBar /
// TopNav), so cohort pages render full-width. Weeks are reachable from the
// "My Work" page, which lists every week (done or not) with a start button.
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
  return (
    <>
      <div className="container-page py-8">{children}</div>
      {modal}
    </>
  );
}
