"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, X, Loader2 } from "lucide-react";
import { reviewMyGitHubProfile } from "@/lib/actions/gitwit";
import type { GitWitReviewResult, VerdictWithLabel } from "@/lib/gitwitTypes";
import { withBase } from "@/lib/paths";

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
 * "Ask GitWit to review" — an opt-in AI read of the participant's GitHub profile
 * on the Week 1 congrats screen. Stays hidden behind a trigger (design.md:
 * secondary content is progressive). When the profile already passes, it
 * celebrates rather than inventing a to-do list.
 */
export function GitWitReview({ assignmentId }: { assignmentId: string }) {
  const [result, setResult] = useState<GitWitReviewResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      setResult(await reviewMyGitHubProfile(assignmentId));
    });
  }

  // Trigger — shown until the first successful review.
  if (!result || !result.ok) {
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={run}
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
        {result && !result.ok ? (
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
        ) : (
          !pending && (
            <p className="meta-light text-[13px] mt-2">
              A quick AI check of your profile&apos;s essentials.
            </p>
          )
        )}
      </div>
    );
  }

  // Result.
  return (
    <div className="mt-4 max-w-[34rem] mx-auto text-left">
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

        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="link text-[13px] mt-4 inline-flex items-center gap-1 disabled:opacity-70"
        >
          {pending && <Loader2 size={13} className="animate-spin" aria-hidden />}
          Review again
        </button>
      </div>
    </div>
  );
}
