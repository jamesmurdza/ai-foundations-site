import Link from "@portal/components/Link";
import { requireOnboardedUser } from "@portal/lib/auth";
import { listAnnouncements } from "@portal/lib/queries";
import { getAttachmentsForMany } from "@portal/lib/files";
import { AttachmentList } from "@portal/components/AttachmentList";
import { timeAgo } from "@portal/lib/format";

export default async function AnnouncementsPage() {
  await requireOnboardedUser();
  const announcements = await listAnnouncements(50);
  const files = await getAttachmentsForMany(
    "announcement",
    announcements.map((a) => a.id),
  );

  return (
    <div className="py-2">
      <h1 className="text-[34px] mb-1">Announcements 📣</h1>
      <p className="meta mb-8">News from the organizers — jump in and comment.</p>

      {announcements.length === 0 ? (
        <div className="card meta">No announcements yet.</div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="card card-hover block"
            >
              <div className="flex items-center gap-2">
                {a.pinned && <span className="badge">📌 pinned</span>}
                <span className="font-bold text-[20px]">{a.title}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px] line-clamp-3">
                {a.body}
              </p>
              <AttachmentList items={files.get(a.id) ?? []} title="Files" />
              <div className="meta-light text-[12px] mt-3">
                {a.authorName ?? "Organizer"} · {timeAgo(a.createdAt)} · Read &amp;
                comment →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
