"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, X, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { reviewMyGitHubProfile } from "@portal/lib/actions/gitwit";
import {
  buildProfileSuggestionsPrompt,
  type GitWitReviewResult,
  type VerdictWithLabel,
} from "@portal/lib/gitwitTypes";
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
 * Copies GitWit's "things to add" as a ready-to-paste prompt for an AI
 * assistant. A hover / focus tooltip spells out what to do with it, since the
 * copied text isn't the improvement itself — it's an instruction to hand to a
 * model. Follows the site's `group` + `group-hover:block` floating-panel style.
 */
function CopySuggestionsButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const hintId = useId();

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={copy}
        aria-describedby={hintId}
        className="link text-[13px] inline-flex items-center gap-1 cursor-pointer"
      >
        {copied ? <Check size={13} aria-hidden /> : <Sparkles size={13} aria-hidden />}
        {copied ? "Copied ✓" : "Copy suggestions"}
      </button>
      <div
        role="tooltip"
        id={hintId}
        className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 hidden w-[268px] max-w-[calc(100vw-2rem)] group-hover:block group-focus-within:block"
      >
        <div
          className="card !p-3 text-[12px] leading-snug text-slate-channel"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          Copies a ready-made prompt of exactly what to improve. Paste it into an
          AI assistant (ChatGPT, Claude, GitWit) to get specific fixes and
          Markdown for your README.
        </div>
      </div>
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
          <div className="flex items-center gap-4">
            {!result.allGood && (
              <CopySuggestionsButton prompt={buildProfileSuggestionsPrompt(result)} />
            )}
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
    </div>
  );
}
