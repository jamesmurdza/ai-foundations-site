import Link from "@portal/components/Link";
import { notFound } from "@portal/lib/nav";
import { getSessionContext } from "@portal/lib/auth";
import {
  getAnnouncement,
  listComments,
  resolveMentions,
  listMentionablePeople,
} from "@portal/lib/queries";
import { getAttachmentsFor } from "@portal/lib/files";
import { extractMentions, MentionText } from "@portal/lib/mentions";
import { AttachmentList } from "@portal/components/AttachmentList";
import { CommentThread } from "@portal/components/CommentThread";
import { timeAgo } from "@portal/lib/format";
import type { Author } from "@portal/lib/queries";

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) notFound();

  const [{ user, profile }, files, comments, mentioned, people] =
    await Promise.all([
      getSessionContext(),
      getAttachmentsFor("announcement", id),
      listComments("announcement", id),
      resolveMentions(extractMentions(announcement.body)),
      listMentionablePeople(),
    ]);
  const valid = new Set(mentioned.map((m) => m.username));

  const canComment = Boolean(user && profile);
  const currentUser: Author | null =
    user && profile
      ? {
          userId: user.id,
          name: profile.displayName ?? user.name ?? "You",
          login: user.githubLogin,
          avatarUrl: user.avatarUrl,
          profileId: profile.id,
          country: profile.country,
        }
      : null;

  return (
    <div className="py-2 max-w-[760px]">
      <Link href="/announcements" className="link text-[14px]">
        ← All announcements
      </Link>

      <div className="card !p-7 mt-4">
        <div className="flex items-center gap-2">
          {announcement.pinned && <span className="badge">📌 pinned</span>}
          <h1 className="text-heading-lg">{announcement.title}</h1>
        </div>
        <div className="meta-light text-[13px] mt-1">
          {announcement.authorName ?? "Organizer"} · {timeAgo(announcement.createdAt)}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[16px]">
          <MentionText text={announcement.body} valid={valid} />
        </p>
        <AttachmentList items={files} title="Files" />
      </div>

      <div className="card !p-7 mt-6">
        <CommentThread
          targetType="announcement"
          targetId={id}
          comments={comments}
          canComment={canComment}
          currentUser={currentUser}
          people={people}
        />
      </div>
    </div>
  );
}
