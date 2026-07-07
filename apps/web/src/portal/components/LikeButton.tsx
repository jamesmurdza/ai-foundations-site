"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { likeSubmission, unlikeSubmission } from "@portal/lib/actions/submissions";

/**
 * The feed "like" — a real GitHub star on the post's repo. The heart is filled
 * only when there's a real recorded star (`liked`), and tapping it stars/unstars
 * for real. Optimistic on click; reverts if the action fails.
 */
export function LikeButton({
  submissionId,
  count,
  liked,
  canLike,
}: {
  submissionId: string;
  count: number;
  liked: boolean;
  canLike: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({ liked, count });

  function toggleLike() {
    if (!canLike || pending) return;
    const nextLiked = !state.liked;
    const previous = state;
    setState({
      liked: nextLiked,
      count: Math.max(0, state.count + (nextLiked ? 1 : -1)),
    });
    startTransition(async () => {
      const fd = new FormData();
      fd.set("submissionId", submissionId);
      try {
        if (nextLiked) await likeSubmission(fd);
        else await unlikeSubmission(fd);
      } catch {
        setState(previous);
      }
    });
  }

  const heart = (
    <Heart size={18} className={state.liked ? "fill-[#f43f5e] text-[#f43f5e]" : ""} />
  );

  // Static when you can't star (signed out / no GitHub / your own post).
  if (!canLike) {
    return (
      <span
        className="flex items-center gap-1.5 text-[15px]"
        title={state.liked ? "Starred on GitHub" : undefined}
      >
        {heart}
        <span className="font-semibold">{state.count}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={
        state.liked
          ? "Unlike — removes your GitHub star"
          : "Like — stars this repo on GitHub"
      }
      title={state.liked ? "Starred on GitHub" : "Star this repo on GitHub"}
      onClick={toggleLike}
      className="flex items-center gap-1.5 text-[15px] text-slate-channel transition-colors hover:text-[#f43f5e] disabled:opacity-60"
    >
      {heart}
      <span className="font-semibold">{state.count}</span>
    </button>
  );
}
