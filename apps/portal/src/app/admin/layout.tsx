import { requireAdmin } from "@/lib/auth";
import { AdminTabs } from "@/components/AdminTabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="container-page py-8">
      <h1 className="text-heading-lg mb-1">Organizer console</h1>
      <p className="meta mb-6">
        Run the program — post to the stream, set classwork, go live.
      </p>
      <AdminTabs />
      {children}
    </div>
  );
}
