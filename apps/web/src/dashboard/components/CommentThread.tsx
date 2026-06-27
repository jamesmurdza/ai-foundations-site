"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Comment } from "@dashboard/lib/comments";
import { withBase } from "@dashboard/lib/paths";

const POLL_MS = 5000;

function apiUrl(path: string): string {
  // basePath (/dashboard) is not auto-applied to client fetch — add it here.
  const withPrefix = withBase(path);
  if (typeof window === "undefined") return withPrefix;
  return window.location.origin + withPrefix;
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function authorColors(author: string): string {
  let hash = 0;
  for (const ch of author) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const palette = [
    "bg-[#dbeafe] text-[#1e40af]",
    "bg-[#dcfce7] text-[#166534]",
    "bg-[#fef3c7] text-[#92400e]",
    "bg-[#fce7f3] text-[#9d174d]",
    "bg-[#ede9fe] text-[#5b21b6]",
  ];
  return palette[hash % palette.length];
}

function CommentBody({
  body,
  knownUsers,
}: {
  body: string;
  knownUsers: Set<string>;
}) {
  const parts = body.split(/(@[A-Za-z0-9_]+)/g);
  return (
    <p className="text-[14px] leading-relaxed text-ink whitespace-pre-line">
      {parts.map((part, i) => {
        const m = /^@([A-Za-z0-9_]+)$/.exec(part);
        if (m && knownUsers.has(m[1].toLowerCase())) {
          return (
            <span
              key={i}
              className="inline-flex items-center rounded-md bg-action/8 px-1.5 py-0.5 font-medium text-action"
            >
              @{m[1].toLowerCase()}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function findMentionTrigger(
  text: string,
  cursor: number,
): { start: number; query: string } | null {
  if (cursor === 0) return null;
  let i = cursor;
  while (i > 0) {
    const ch = text[i - 1];
    if (ch === "@") {
      const before = i - 2 >= 0 ? text[i - 2] : null;
      if (before === null || /\s/.test(before)) {
        return { start: i - 1, query: text.slice(i, cursor) };
      }
      return null;
    }
    if (!/[A-Za-z0-9_]/.test(ch)) return null;
    i -= 1;
  }
  return null;
}

type MentionState = {
  triggerStart: number;
  query: string;
  selected: number;
} | null;

export function CommentThread({
  applicationId,
  currentUser,
  admins,
  initialComments,
}: {
  applicationId: string;
  currentUser: string;
  admins: string[];
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mention, setMention] = useState<MentionState>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastIdRef = useRef<string | null>(
    initialComments[initialComments.length - 1]?.id ?? null,
  );

  const knownUsers = useMemo(
    () => new Set(admins.map((u) => u.toLowerCase())),
    [admins],
  );
  const otherUsers = useMemo(
    () => admins.filter((u) => u !== currentUser),
    [admins, currentUser],
  );

  const candidates = useMemo(() => {
    if (!mention) return [];
    const q = mention.query.toLowerCase();
    return admins
      .filter((u) => u.toLowerCase().startsWith(q))
      .slice(0, 6);
  }, [mention, admins]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        apiUrl(`/api/applications/${applicationId}/comments`),
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { comments: Comment[] };
      setComments((prev) => {
        const next = data.comments;
        const lastIncoming = next[next.length - 1]?.id ?? null;
        const lastKnown = prev[prev.length - 1]?.id ?? null;
        if (next.length === prev.length && lastIncoming === lastKnown) {
          return prev;
        }
        lastIdRef.current = lastIncoming;
        return next;
      });
    } catch {
      /* ignore polling errors */
    }
  }, [applicationId]);

  useEffect(() => {
    const id = window.setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  function recomputeMention(text: string, cursor: number) {
    const trigger = findMentionTrigger(text, cursor);
    if (!trigger) {
      setMention(null);
      return;
    }
    setMention((prev) => ({
      triggerStart: trigger.start,
      query: trigger.query,
      selected:
        prev && prev.triggerStart === trigger.start ? prev.selected : 0,
    }));
  }

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setDraft(text);
    const cursor = e.target.selectionStart ?? text.length;
    recomputeMention(text, cursor);
  }

  function onSelect(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    if (!mention) return;
    const ta = e.currentTarget;
    const cursor = ta.selectionStart ?? ta.value.length;
    recomputeMention(ta.value, cursor);
  }

  function selectCandidate(user: string) {
    if (!mention) {
      insertMention(user);
      return;
    }
    const ta = textareaRef.current;
    if (!ta) return;
    const before = draft.slice(0, mention.triggerStart);
    const after = draft.slice(
      mention.triggerStart + 1 + mention.query.length,
    );
    const insertion = `@${user} `;
    const next = `${before}${insertion}${after}`;
    setDraft(next);
    setMention(null);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = before.length + insertion.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function insertMention(user: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setDraft((d) => `${d}${d.endsWith(" ") || d === "" ? "" : " "}@${user} `);
      return;
    }
    const start = ta.selectionStart ?? draft.length;
    const end = ta.selectionEnd ?? draft.length;
    const before = draft.slice(0, start);
    const after = draft.slice(end);
    const needSpaceBefore = before.length > 0 && !/\s$/.test(before);
    const insertion = `${needSpaceBefore ? " " : ""}@${user} `;
    const next = `${before}${insertion}${after}`;
    setDraft(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = before.length + insertion.length;
      ta.setSelectionRange(cursor, cursor);
    });
  }

  async function post() {
    const body = draft.trim();
    if (!body) return;
    setPosting(true);
    setError(null);
    setMention(null);
    try {
      const res = await fetch(
        apiUrl(`/api/applications/${applicationId}/comments`),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Post failed (${res.status})`);
      }
      const created = (await res.json()) as Comment;
      setComments((prev) => [...prev, created]);
      setDraft("");
      lastIdRef.current = created.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPosting(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mention && candidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMention((m) =>
          m
            ? {
                ...m,
                selected: (m.selected + 1) % candidates.length,
              }
            : m,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMention((m) =>
          m
            ? {
                ...m,
                selected:
                  (m.selected - 1 + candidates.length) % candidates.length,
              }
            : m,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectCandidate(candidates[mention.selected] ?? candidates[0]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMention(null);
        return;
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void post();
    }
  }

  return (
    <div className="rounded-[18px] border border-hairline bg-canvas">
      <div className="border-b border-hairline px-5 py-3">
        <div className="text-[12px] uppercase tracking-[0.12em] text-ink-48">
          Conversation
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto px-5 py-4">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-48">
            No notes yet. Tag your co-host to start a thread.
          </p>
        ) : (
          <ul className="space-y-5">
            {comments.map((c) => {
              const colors = authorColors(c.author);
              return (
                <li
                  key={c.id}
                  id={`c-${c.id}`}
                  className="flex scroll-mt-20 gap-3"
                >
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold uppercase ${colors}`}
                  >
                    {c.author.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-ink">
                        {c.author}
                      </span>
                      <span
                        title={new Date(c.createdAt).toLocaleString()}
                        className="text-[11px] text-ink-48"
                      >
                        {formatRelative(c.createdAt)}
                      </span>
                      {c.mentions.length > 0 && c.author !== currentUser && (
                        <span className="text-[11px] text-action">
                          {c.mentions.includes(currentUser) ? "↳ you" : ""}
                        </span>
                      )}
                    </div>
                    <CommentBody body={c.body} knownUsers={knownUsers} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="relative border-t border-hairline p-4">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={onChange}
          onSelect={onSelect}
          onKeyDown={onKeyDown}
          onBlur={() => {
            // small delay so click on popup item still fires
            window.setTimeout(() => setMention(null), 120);
          }}
          rows={3}
          maxLength={5000}
          placeholder={
            otherUsers.length
              ? `Add a note. Type @ to mention ${otherUsers[0]}.`
              : "Add a note…"
          }
          className="block w-full resize-none rounded-[11px] border border-hairline bg-pearl/60 px-3 py-2 text-[14px] leading-relaxed text-ink placeholder:text-ink-48 focus:border-action focus:bg-canvas focus:outline-none focus:ring-2 focus:ring-action/20"
        />

        {mention && candidates.length > 0 && (
          <MentionPopup
            candidates={candidates}
            query={mention.query}
            selected={mention.selected}
            onPick={selectCandidate}
            onHover={(idx) =>
              setMention((m) => (m ? { ...m, selected: idx } : m))
            }
          />
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-ink-48">
            Type{" "}
            <kbd className="rounded border border-hairline bg-canvas px-1 py-[1px] font-medium text-ink-80">
              @
            </kbd>{" "}
            to mention. <kbd className="rounded border border-hairline bg-canvas px-1 py-[1px] font-medium text-ink-80">⌘</kbd>+<kbd className="rounded border border-hairline bg-canvas px-1 py-[1px] font-medium text-ink-80">↵</kbd> to post.
          </div>
          <button
            type="button"
            onClick={post}
            disabled={!draft.trim() || posting}
            className="inline-flex h-9 items-center justify-center rounded-full bg-action px-5 text-[13px] font-medium text-white transition-transform active:scale-[0.97] hover:bg-action-focus disabled:opacity-40 disabled:active:scale-100"
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[12px] text-[#cf222e]">{error}</p>
        )}
      </div>
    </div>
  );
}

function MentionPopup({
  candidates,
  query,
  selected,
  onPick,
  onHover,
}: {
  candidates: string[];
  query: string;
  selected: number;
  onPick: (user: string) => void;
  onHover: (i: number) => void;
}) {
  return (
    <div
      role="listbox"
      className="absolute left-4 right-4 bottom-full mb-2 z-20 max-h-56 overflow-auto rounded-[14px] border border-hairline bg-canvas shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="px-3 py-2 text-[11px] uppercase tracking-[0.1em] text-ink-48 border-b border-hairline">
        {query ? `Mention "${query}"` : "Mention"}
      </div>
      <ul>
        {candidates.map((u, i) => {
          const active = i === selected;
          return (
            <li key={u}>
              <button
                type="button"
                onClick={() => onPick(u)}
                onMouseEnter={() => onHover(i)}
                role="option"
                aria-selected={active}
                className={
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors " +
                  (active ? "bg-action/8 text-action" : "text-ink hover:bg-pearl")
                }
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pearl text-[10px] font-semibold uppercase text-ink-80">
                  {u.slice(0, 2)}
                </span>
                <span className="font-medium">@{u}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
