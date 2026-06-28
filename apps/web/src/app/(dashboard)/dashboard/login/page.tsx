export const dynamic = "force-dynamic";

// Self-contained dashboard sign-in. Reuses the Portal's GitHub OAuth (same OAuth
// app + env + already-registered callback) via ?next=/dashboard, then the proxy
// gate authorises only the GitHub logins in DASHBOARD_ADMIN_LOGINS.
export default async function DashboardLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const unauthorized = error === "unauthorized";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">HackerHouse Dashboard</h1>
        <p className="mb-6 text-sm text-muted-foreground">Admin access only.</p>

        {unauthorized && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            You’re not authorised to access this dashboard.
          </p>
        )}

        <a
          href="/portal/api/auth/github?next=/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 font-medium text-background transition hover:opacity-90"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Sign in with GitHub
        </a>
      </div>
    </main>
  );
}
