import {
  listMentionablePeople,
} from "@portal/lib/queries";
import {
  activeViewers,
  reactionCounts,
  listQuestions,
  listUpvotedQuestionIds,
} from "@portal/lib/stream";
import { ChevronRight } from "lucide-react";
import { toYouTubeEmbed } from "@portal/lib/format";
import { getAttachmentsFor } from "@portal/lib/files";
import { StreamPresence } from "@portal/components/StreamPresence";
import { StreamReactions } from "@portal/components/StreamReactions";
import { QaPanel } from "@portal/components/QaPanel";
import { AttachmentList } from "@portal/components/AttachmentList";
import type { Week } from "@portal/db/schema";

// Shared body for a single week — stream, live reactions, Q&A and materials in
// one vertical flow. Assignments live on the homepage assignment section.
export async function WeekBody({
  week,
  userId,
  isAdmin,
  includeQa = true,
}: {
  week: Week;
  userId: string;
  isAdmin: boolean;
  includeQa?: boolean;
}) {
  const [viewers, reactions, materials] = await Promise.all([
    activeViewers(week.id),
    reactionCounts(week.id),
    getAttachmentsFor("week", week.id),
  ]);
  const [questions, people, upvotedIds] = includeQa
    ? await Promise.all([
        listQuestions(week.id),
        listMentionablePeople(),
        listUpvotedQuestionIds(week.id, userId),
      ])
    : [[], [], []];

  const embed =
    toYouTubeEmbed(week.streamUrl) ?? toYouTubeEmbed(week.recordingUrl);

  return (
    <div className="space-y-6">
      {embed && (
        <div className="card !p-0 overflow-hidden">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={embed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`Week ${week.number} stream`}
            />
          </div>
          <div className="p-5 border-t border-border">
            <StreamPresence weekId={week.id} />
            <div className="flex items-center justify-between mb-3">
              <span className="badge badge-teal">👀 {viewers} watching</span>
            </div>
            <StreamReactions weekId={week.id} initial={reactions} />
          </div>
        </div>
      )}

      {materials.length > 0 && (
        <section>
          <h2 className="text-[20px] mb-3">Materials</h2>
          <AttachmentList items={materials} showTitle={false} />
        </section>
      )}

      {includeQa && (
        <details className="card group">
          <summary className="text-[20px] font-heading font-bold cursor-pointer list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <ChevronRight
              size={20}
              className="shrink-0 transition-transform group-open:rotate-90"
              aria-hidden
            />
            Q&amp;A{" "}
            <span className="meta-light text-[15px] font-normal">
              — ask about this week&apos;s session ({questions.length})
            </span>
          </summary>
          <div className="mt-4">
            <QaPanel
              weekId={week.id}
              initial={questions}
              isAdmin={isAdmin}
              people={people}
              upvotedIds={upvotedIds}
            />
          </div>
        </details>
      )}
    </div>
  );
}
