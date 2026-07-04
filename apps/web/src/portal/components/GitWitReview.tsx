"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, X, Loader2, RefreshCw } from "lucide-react";
import { reviewMyGitHubProfile } from "@portal/lib/actions/gitwit";
import type { GitWitReviewResult, VerdictWithLabel } from "@portal/lib/gitwitTypes";
import { withBase } from "@portal/lib/paths";
import { timeAgo } from "@portal/lib/format";

// next/image src must include basePath manually (basePath does not auto-prefix it).
const GITWIT_IMG = withBase("/gitwit.jpg");

function Section({
  title,
  items,
  kind,
}: {
  title: string;
  items: VerdictWithLabel[];
  kind: "good" | "missing";
}) {
  return (
    <div className="mt-4 first:mt-3">
      <p className="text-[13px] font-semibold text-slate-channel mb-1">{title}</p>
      <ul className="divide-y divide-border">
        {items.map((it) => (
          <li key={it.id} className="flex items-start gap-2.5 py-2.5">
            <span
              className={`mt-0.5 shrink-0 ${
                kind === "good" ? "text-success" : "text-danger"
              }`}
            >
              {kind === "good" ? (
                <Check size={16} aria-hidden />
              ) : (
                <X size={16} aria-hidden />
              )}
            </span>
            <span className="text-[14px] leading-snug">
              <span className="font-medium">{it.label}</span>
              {it.note && <span className="meta"> — {it.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Automatic GitWit read of the participant's own GitHub profile, shown on the
 * final Week 1 page just before they submit. The result is cached in the DB
 * (one per user): a server-preloaded `initial` shows instantly; when there's no
 * cache yet it runs once on mount; "Refresh" re-runs Haiku and overwrites the
 * cache. When the profile already passes, it celebrates rather than inventing a
 * to-do list.
 */
export function GitWitReview({
  initial = null,
}: {
  initial?: GitWitReviewResult | null;
}) {
  const [result, setResult] = useState<GitWitReviewResult | null>(initial);
  const [pending, startTransition] = useTransition();
  // Guards the one-time auto-run so React strict-mode's double effect (and
  // re-renders) can't fire a second model call.
  const autoRan = useRef(initial != null);

  function run(refresh = false) {
    startTransition(async () => {
      setResult(await reviewMyGitHubProfile({ refresh }));
    });
  }

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First read still in flight — quiet loading state.
  if (!result && pending) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 text-slate-channel">
        <Loader2 size={16} className="animate-spin" aria-hidden />
        <span className="text-[14px]">GitWit is reading your profile…</span>
      </div>
    );
  }

  // Error (not connected, model failure, etc.) — offer a retry.
  if (!result || !result.ok) {
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => run(true)}
          disabled={pending}
          className="btn btn-outline inline-flex items-center gap-2 disabled:opacity-70"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Image
              src={GITWIT_IMG}
              alt=""
              width={18}
              height={18}
              className="rounded-[5px]"
            />
          )}
          {pending ? "GitWit is reading your profile…" : "Ask GitWit to review"}
        </button>
        {result && !result.ok && (
          <div className="mt-3 mx-auto max-w-[32rem] flex items-start gap-2 text-left">
            <Image
              src={GITWIT_IMG}
              alt=""
              width={18}
              height={18}
              className="rounded-[5px] mt-0.5 shrink-0"
            />
            <p className="meta text-[13px]">{result.error}</p>
          </div>
        )}
      </div>
    );
  }

  // Result.
  return (
    <div className="mt-4 max-w-[744px] mx-auto text-left">
      <div className="rounded-[14px] border border-sea-fog p-5">
        <div className="flex items-center gap-2">
          <Image
            src={GITWIT_IMG}
            alt="GitWit"
            width={22}
            height={22}
            className="rounded-[5px]"
          />
          <span className="font-semibold text-[15px]">
            GitWit&apos;s read on @{result.login}
          </span>
        </div>

        <p className="meta text-[14px] mt-1.5">
          {result.allGood
            ? "Nice — your profile has all seven essentials. Nothing to fix."
            : `${result.good.length} of 7 essentials are there${
                result.missing.length ? " — a few more would round it out." : "."
              }`}
        </p>

        {result.good.length > 0 && (
          <Section
            title={result.allGood ? "All set" : "Looking good"}
            items={result.good}
            kind="good"
          />
        )}

        {result.missing.length > 0 && (
          <Section title="A few things to add" items={result.missing} kind="missing" />
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="meta-light text-[12px]">
            {pending ? "Refreshing…" : `Last checked ${timeAgo(result.checkedAt)}`}
          </span>
          <button
            type="button"
            onClick={() => run(true)}
            disabled={pending}
            className="link text-[13px] inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw
              size={13}
              className={pending ? "animate-spin" : ""}
              aria-hidden
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
