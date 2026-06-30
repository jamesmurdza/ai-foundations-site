"use client";

import { useOptimistic, useState } from "react";
import { askQuestion, upvoteQuestion } from "@portal/lib/actions/engagement";
import { markQuestionAnswered } from "@portal/lib/actions/admin";
import { useDraft } from "@portal/lib/draft";
import { SubmitButton } from "./SubmitButton";
import { MentionInput } from "./MentionInput";
import { MentionText } from "@portal/lib/mentions";
import type { MentionPerson } from "@portal/lib/queries";

export type QaItem = {
  id: string;
  body: string;
  userName: string | null;
  upvotes: number;
  answered: boolean;
};

type Action =
  | { type: "add"; q: QaItem }
  | { type: "upvote"; id: string }
  | { type: "answer"; id: string };

/** Live Q&A: ask, upvote and mark-answered all apply instantly, sync after. */
export function QaPanel({
  weekId,
  initial,
  isAdmin,
  people = [],
  upvotedIds = [],
}: {
  weekId: string;
  initial: QaItem[];
  isAdmin: boolean;
  people?: MentionPerson[];
  upvotedIds?: string[];
}) {
  const [draft, setDraft, clearDraft] = useDraft(`qa:${weekId}`);
  const mentionHandles = new Set(people.map((p) => p.username));
  // Questions this user already upvoted (server) plus any voted this session.
  const [locallyVoted, setLocallyVoted] = useState<Set<string>>(new Set());
  const serverVoted = new Set(upvotedIds);
  const hasVoted = (id: string) => serverVoted.has(id) || locallyVoted.has(id);
  const [questions, dispatch] = useOptimistic(initial, (state, a: Action) => {
    if (a.type === "add") return [...state, a.q];
    if (a.type === "upvote")
      return state.map((q) => (q.id === a.id ? { ...q, upvotes: q.upvotes + 1 } : q));
    return state.map((q) => (q.id === a.id ? { ...q, answered: true } : q));
  });

  async function ask(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    const tempId = `temp-${Date.now()}`;
    // You auto-upvote your own question, so it starts at 1 and is "voted".
    dispatch({
      type: "add",
      q: { id: tempId, body, userName: "You", upvotes: 1, answered: false },
    });
    setLocallyVoted((prev) => new Set(prev).add(tempId));
    clearDraft();
    await askQuestion(formData);
  }
  async function upvote(formData: FormData) {
    const id = String(formData.get("questionId") ?? "");
    if (hasVoted(id)) return; // one upvote per person
    setLocallyVoted((prev) => new Set(prev).add(id));
    dispatch({ type: "upvote", id });
    await upvoteQuestion(formData);
  }
  async function answer(formData: FormData) {
    dispatch({ type: "answer", id: String(formData.get("questionId") ?? "") });
    await markQuestionAnswered(formData);
  }

  return (
    <>
      <form action={ask} className="flex gap-2 mb-4">
        <input type="hidden" name="weekId" value={weekId} />
        <MentionInput
          name="body"
          placeholder="Ask a question… use @ to tag someone"
          required
          value={draft}
          onChange={setDraft}
          people={people}
        />
        <SubmitButton className="btn btn-primary">Ask</SubmitButton>
      </form>
      {questions.length === 0 ? (
        <p className="meta">No questions yet — be the first.</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className={`flex items-center gap-3 p-3 rounded-2xl ${q.answered ? "bg-muted opacity-70" : "border border-border"}`}
            >
              <form action={upvote}>
                <input type="hidden" name="questionId" value={q.id} />
                <input type="hidden" name="weekId" value={weekId} />
                <button
                  className={`btn btn-sm !px-2 ${hasVoted(q.id) ? "btn-primary !cursor-default" : "btn-outline"}`}
                  disabled={hasVoted(q.id)}
                  title={hasVoted(q.id) ? "You upvoted this" : "Upvote"}
                >
                  ▲ {q.upvotes}
                </button>
              </form>
              <div className="flex-1">
                <div className="text-[15px]">
                  <MentionText text={q.body} valid={mentionHandles} />
                </div>
                <div className="meta-light text-[12px]">{q.userName ?? "Someone"}</div>
              </div>
              {q.answered ? (
                <span className="badge badge-teal">answered</span>
              ) : isAdmin ? (
                <form action={answer}>
                  <input type="hidden" name="questionId" value={q.id} />
                  <input type="hidden" name="weekId" value={weekId} />
                  <button className="btn btn-ghost btn-sm">Mark answered</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
