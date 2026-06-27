"use client";

import { useOptimistic } from "react";
import { addReaction } from "@portal/lib/actions/engagement";

const EMOJIS = ["👏", "🔥", "🤯", "❤️", "🚀", "😂"];

type Count = { emoji: string; n: number };

/** Emoji reactions that bump instantly, then persist in the background. */
export function StreamReactions({
  weekId,
  initial,
}: {
  weekId: string;
  initial: Count[];
}) {
  const [counts, bump] = useOptimistic(initial, (state, emoji: string) => {
    if (state.some((r) => r.emoji === emoji))
      return state.map((r) => (r.emoji === emoji ? { ...r, n: r.n + 1 } : r));
    return [...state, { emoji, n: 1 }];
  });

  async function react(formData: FormData) {
    bump(String(formData.get("emoji") ?? ""));
    await addReaction(formData);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 mb-3">
        {EMOJIS.map((e) => (
          <form key={e} action={react}>
            <input type="hidden" name="weekId" value={weekId} />
            <input type="hidden" name="emoji" value={e} />
            <button className="btn btn-ghost btn-sm !px-2 text-[18px]" title="React">
              {e}
            </button>
          </form>
        ))}
      </div>
      {counts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {counts.map((r) => (
            <span key={r.emoji} className="pill bg-muted text-muted-foreground">
              {r.emoji} {r.n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
