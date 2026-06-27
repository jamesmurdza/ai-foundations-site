import { headers } from "next/headers";
import Link from "next/link";

import { AddAdminForm } from "@/components/AddAdminForm";
import { listAdmins } from "@/lib/admins";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminsPage() {
  const [admins, h] = await Promise.all([listAdmins(), headers()]);
  const me = h.get("x-admin-user") ?? "";

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center text-[13px] text-action hover:text-action-focus"
      >
        ← All applications
      </Link>

      <header className="mt-6 mb-10 flex flex-col gap-2">
        <p className="text-[12px] uppercase tracking-[0.18em] text-ink-48">
          Settings
        </p>
        <h1 className="text-[36px] font-semibold leading-tight tracking-[-0.022em] text-ink">
          Admins
        </h1>
        <p className="text-[14px] text-ink-80">
          {admins.length} {admins.length === 1 ? "admin" : "admins"} can sign in
          and review applications.
        </p>
      </header>

      <div className="mb-10">
        <AddAdminForm />
      </div>

      <section className="overflow-hidden rounded-[18px] border border-hairline bg-canvas">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-pearl text-[12px] uppercase tracking-[0.08em] text-ink-48">
              <th className="px-5 py-3 text-left font-medium">Username</th>
              <th className="px-5 py-3 text-left font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr
                key={a.username}
                className="border-t border-hairline/80"
              >
                <td className="px-5 py-4">
                  <span className="font-medium text-ink">{a.username}</span>
                  {a.username === me && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-pearl px-2 py-[2px] text-[11px] font-medium text-ink-80 ring-1 ring-hairline">
                      you
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-ink-80">{fmtDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
