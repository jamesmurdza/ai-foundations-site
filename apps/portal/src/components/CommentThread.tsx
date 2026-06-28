"use client";

import Link from "next/link";
import { useOptimistic } from "react";
import { Avatar } from "./Avatar";
import { SubmitButton } from "./SubmitButton";
import { MentionInput } from "./MentionInput";
import { MentionText } from "@/lib/mentions";
import { postComment } from "@/lib/actions/comments";
import { useDraft } from "@/lib/draft";
import { timeAgo } from "@/lib/format";
import { profileHref } from "@/lib/profileHref";
import type { Comment } from "@/db/schema";
import type { Author, MentionPerson } from "@/lib/queries";

type CommentItem = Comment & { author: Author; pending?: boolean };

export function CommentThread({
  targetType,
  targetId,
  comments,
  canComment,
  currentUser,
  people = [],
  compact = false,
  title = "Comments",
  placeholder = "Leave a comment… use @ to tag someone",
}: {
  targetType: "submission" | "profile" | "announcement";
  targetId: string;
  comments: (Comment & { author: Author })[];
  canComment: boolean;
  currentUser?: Author | null;
  people?: MentionPerson[];
  compact?: boolean;
  /** Heading + input copy — e.g. profiles reuse this thread for "Compliments". */
  title?: string;
  placeholder?: string;
}) {
  const [draft, setDraft, clearDraft] = useDraft(`comment:${targetType}:${targetId}`);
  const mentionHandles = new Set(people.map((p) => p.username));
  const [optimistic, addOptimistic] = useOptimistic<CommentItem[], CommentItem>(
    comments,
    (state, c) => [c, ...state],
  );

  async function submit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    addOptimistic({
      id: `temp-${Date.now()}`,
      targetType,
      targetId,
      userId: currentUser?.userId ?? "me",
      body,
      createdAt: new Date(),
      author:
        currentUser ?? {
          userId: "me",
          name: "You",
          login: null,
          avatarUrl: null,
          profileId: null,
          country: null,
        },
      pending: true,
    });
    clearDraft();
    await postComment(formData);
  }

  const content = (
    <div className="space-y-4">
      {!compact && (
        <h3 className="font-bold text-[18px]">
          {title} <span className="meta-light">({optimistic.length})</span>
        </h3>
      )}

      {canComment ? (
        <form action={submit} className="flex flex-col gap-3">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <MentionInput
            multiline
            rows={3}
            name="body"
            required
            placeholder={placeholder}
            className="textarea"
            value={draft}
            onChange={setDraft}
            people={people}
          />
          <div>
            <SubmitButton className="btn btn-primary btn-sm">Comment</SubmitButton>
          </div>
        </form>
      ) : (
        <p className="meta">
          <Link href="/login" className="link">Sign in</Link> to join the conversation.
        </p>
      )}

      <ul className="space-y-3">
        {optimistic.map((c) => (
          <li key={c.id} className={`flex gap-3 ${c.pending ? "opacity-60" : ""}`}>
            {c.author?.profileId ? (
              <Link href={profileHref(c.author)}>
                <Avatar src={c.author?.avatarUrl} name={c.author?.name} size={36} />
              </Link>
            ) : (
              <Avatar src={c.author?.avatarUrl} name={c.author?.name} size={36} />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[14px]">
                  {c.author?.name ?? "Participant"}
                </span>
                <span className="meta-light text-[12px]">
                  {c.pending ? "sending…" : timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="text-[15px] whitespace-pre-wrap">
                <MentionText text={c.body} valid={mentionHandles} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // `compact` (e.g. inside the comments popover) hides the heading and renders
  // the comments inline — no collapsible card wrapper.
  return content;
}
