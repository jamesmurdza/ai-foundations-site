"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Mention = {
  commentId: string;
  applicationId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  author: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

type Payload = {
  notifications: Mention[];
  me: string;
  fetchedAt: string;
};

type ActivityEvent =
  | {
      kind: "comment";
      id: string;
      at: string;
      actor: string;
      applicationId: string;
      applicantName: string | null;
      applicantEmail: string | null;
      body: string;
      mentions: string[];
    }
  | {
      kind: "star";
      id: string;
      at: string;
      actor: string;
      applicationId: string;
      applicantName: string | null;
      applicantEmail: string | null;
    };

type ActivityPayload = {
  events: ActivityEvent[];
  me: string;
  fetchedAt: string;
};

type ToastEntry = Mention & { shownAt: number };
type Tab = "mentions" | "activity";

const POLL_MS = 10_000;
const TOAST_TTL_MS = 8_000;
const MAX_TOASTS = 4;

function dismissedKey(me: string): string {
  return `hh:notifs-dismissed:${me || "_anon"}:v1`;
}

function loadDismissed(me: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(dismissedKey(me));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? (arr as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(me: string, set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(dismissedKey(me), JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function relTime(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function snippet(body: string, max = 140): string {
  const s = body.replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

type NotificationPermission = "default" | "granted" | "denied";

function readPermission(): NotificationPermission {
  if (typeof window === "undefined") return "default";
  if (typeof Notification === "undefined") return "denied";
  return Notification.permission as NotificationPermission;
}

export function NotificationsBell() {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [activity, setActivity] = useState<ActivityPayload | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("mentions");
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [dismissed, setDismissed] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const dismissedRef = useRef<Set<string>>(new Set());

  const dismissToast = useCallback((commentId: string) => {
    setToasts((prev) => prev.filter((t) => t.commentId !== commentId));
  }, []);

  const me = data?.me ?? activity?.me ?? "";

  useEffect(() => {
    if (!me) return;
    setDismissed(loadDismissed(me));
  }, [me]);

  useEffect(() => {
    dismissedRef.current = dismissed;
    if (!me) return;
    saveDismissed(me, dismissed);
  }, [me, dismissed]);

  // Prune dismissed entries that have rolled out of the visible mentions
  // window so localStorage doesn't grow unbounded.
  useEffect(() => {
    if (!data) return;
    const visible = new Set(data.notifications.map((n) => n.commentId));
    setDismissed((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (visible.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [data]);

  const markDismissed = useCallback((commentId: string) => {
    setDismissed((prev) => {
      if (prev.has(commentId)) return prev;
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    if (!data) return;
    setDismissed((prev) => {
      const next = new Set(prev);
      for (const n of data.notifications) if (n.unread) next.add(n.commentId);
      return next;
    });
  }, [data]);

  const refresh = useCallback(async () => {
    try {
      const [mRes, aRes] = await Promise.all([
        fetch("/api/notifications", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/activity", { cache: "no-store", credentials: "same-origin" }),
      ]);
      let nextPayload: Payload | null = null;
      if (mRes.ok) {
        nextPayload = (await mRes.json()) as Payload;
        setData(nextPayload);
      }
      if (aRes.ok) {
        setActivity((await aRes.json()) as ActivityPayload);
      }

      if (nextPayload) {
        const incomingIds = new Set(
          nextPayload.notifications.map((n) => n.commentId),
        );
        if (knownIdsRef.current === null) {
          knownIdsRef.current = incomingIds;
        } else {
          const known = knownIdsRef.current;
          const localDismissed = dismissedRef.current;
          const fresh = nextPayload.notifications.filter(
            (n) =>
              n.unread &&
              !known.has(n.commentId) &&
              !localDismissed.has(n.commentId),
          );
          if (fresh.length > 0) {
            const now = Date.now();
            setToasts((prev) => {
              const incoming = fresh.map((n) => ({ ...n, shownAt: now }));
              return [...incoming, ...prev].slice(0, MAX_TOASTS);
            });
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted" &&
              document.visibilityState !== "visible"
            ) {
              for (const n of fresh) {
                try {
                  const note = new Notification(`@${n.author} tagged you`, {
                    body: `${n.applicantName ?? "An applicant"} — ${snippet(n.body, 100)}`,
                    tag: n.commentId,
                  });
                  note.onclick = () => {
                    window.focus();
                    router.push(`/${n.applicationId}#c-${n.commentId}`);
                    note.close();
                  };
                } catch {
                  /* requires user gesture in some browsers */
                }
              }
            }
          }
          knownIdsRef.current = incomingIds;
        }
      }
    } catch {
      /* blip — try again next tick */
    }
  }, [router]);

  useEffect(() => {
    setPermission(readPermission());
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const now = Date.now();
    const oldest = toasts.reduce(
      (acc, t) => Math.min(acc, t.shownAt),
      Number.POSITIVE_INFINITY,
    );
    const remaining = Math.max(0, oldest + TOAST_TTL_MS - now);
    const id = window.setTimeout(() => {
      setToasts((prev) =>
        prev.filter((t) => Date.now() - t.shownAt < TOAST_TTL_MS),
      );
    }, remaining + 50);
    return () => window.clearTimeout(id);
  }, [toasts]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    try {
      const next = await Notification.requestPermission();
      setPermission(next as NotificationPermission);
    } catch {
      /* ignore */
    }
  }, []);

  const mentions = data?.notifications ?? [];
  const events = activity?.events ?? [];
  const isUnread = (n: Mention) => n.unread && !dismissed.has(n.commentId);
  const count = mentions.reduce((n, m) => n + (isUnread(m) ? 1 : 0), 0);

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={
            count > 0
              ? `${count} unread mention${count === 1 ? "" : "s"}`
              : "Notifications"
          }
          title={count > 0 ? `${count} unread` : "Notifications"}
          className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-canvas text-ink-80 transition-colors hover:border-ink/30 hover:text-ink"
        >
          <BellIcon />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-action px-1 text-[10px] font-semibold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
        {open && (
          <div
            // Mobile: fixed sheet anchored near the top, edge-to-edge with margins.
            // Tablet+: anchored dropdown to the right of the bell.
            className="fixed inset-x-2 top-12 z-30 max-h-[80vh] overflow-hidden rounded-[14px] border border-hairline bg-canvas shadow-[0_12px_28px_-12px_rgba(0,0,0,0.25)] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[520px] sm:w-[380px]"
            role="dialog"
            aria-label="Notifications"
          >
            <header className="flex items-center justify-between border-b border-hairline/80 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.1em] text-ink-48">
                  Notifications
                </div>
                <div className="truncate text-[13px] font-medium text-ink">
                  {tab === "mentions"
                    ? count > 0
                      ? `${count} unread ${count === 1 ? "mention" : "mentions"}`
                      : mentions.length > 0
                        ? "You're all caught up"
                        : "No mentions yet"
                    : `${events.length} recent events`}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {tab === "mentions" && count > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="rounded-full border border-hairline px-2.5 py-[3px] text-[11px] font-medium text-ink-80 hover:border-ink/30 hover:text-ink"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="rounded-full border border-hairline px-2.5 py-[3px] text-[11px] font-medium text-ink-80 hover:border-ink/30 hover:text-ink"
                >
                  Refresh
                </button>
              </div>
            </header>

            {/* Tabs */}
            <div role="tablist" className="flex border-b border-hairline/80">
              <TabButton
                active={tab === "mentions"}
                onClick={() => setTab("mentions")}
                badge={count > 0 ? (count > 9 ? "9+" : String(count)) : null}
              >
                For you
              </TabButton>
              <TabButton
                active={tab === "activity"}
                onClick={() => setTab("activity")}
              >
                Activity
              </TabButton>
            </div>

            {permission === "default" && tab === "mentions" && (
              <button
                type="button"
                onClick={() => void requestPermission()}
                className="block w-full border-b border-hairline/80 bg-action/8 px-4 py-2 text-left text-[12px] text-action hover:bg-action/12"
              >
                Enable browser notifications →
                <span className="block text-[11px] text-ink-48">
                  Get a desktop ping when this tab isn&apos;t in front.
                </span>
              </button>
            )}

            <div className="max-h-[calc(80vh-130px)] overflow-auto sm:max-h-[400px]">
              {tab === "mentions" ? (
                <MentionsList
                  list={mentions}
                  isUnread={isUnread}
                  onOpen={(n) => {
                    if (isUnread(n)) markDismissed(n.commentId);
                    setOpen(false);
                  }}
                  onMarkRead={markDismissed}
                />
              ) : (
                <ActivityList
                  events={events}
                  me={me}
                  onOpen={() => setOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live toast stack */}
      {toasts.length > 0 && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((t) => (
            <Toast
              key={t.commentId}
              item={t}
              onDismiss={dismissToast}
              onOpen={() => {
                markDismissed(t.commentId);
                dismissToast(t.commentId);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge?: string | null;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "relative flex-1 px-4 py-2 text-[13px] font-medium transition-colors " +
        (active
          ? "text-ink before:absolute before:inset-x-3 before:bottom-0 before:h-[2px] before:rounded-full before:bg-ink before:content-['']"
          : "text-ink-48 hover:text-ink")
      }
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        {badge && (
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-action px-1 text-[10px] font-semibold text-white">
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Mentions list
// ---------------------------------------------------------------------------

function MentionsList({
  list,
  isUnread,
  onOpen,
  onMarkRead,
}: {
  list: Mention[];
  isUnread: (n: Mention) => boolean;
  onOpen: (n: Mention) => void;
  onMarkRead: (commentId: string) => void;
}) {
  if (list.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[13px] text-ink-48">
        No one has tagged you. New @mentions will show up here.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-hairline/80">
      {list.map((n) => {
        const unread = isUnread(n);
        return (
          <li key={n.commentId} className={"relative " + (unread ? "bg-action/4" : "")}>
            <Link
              href={`/${n.applicationId}#c-${n.commentId}`}
              onClick={() => onOpen(n)}
              className="block px-4 py-3 pr-9 hover:bg-pearl/60"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 truncate text-[13px]">
                  {unread ? (
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-action"
                    />
                  ) : null}
                  <span
                    className={
                      unread
                        ? "truncate font-medium text-ink"
                        : "truncate font-medium text-ink-80"
                    }
                  >
                    @{n.author}
                    <span className="ml-1 font-normal text-ink-48">
                      tagged you
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-ink-48">
                  {relTime(n.createdAt)}
                </span>
              </div>
              <div className="mt-0.5 truncate pl-3 text-[12px] text-ink-48">
                on{" "}
                <span className={unread ? "text-ink-80" : "text-ink-48"}>
                  {n.applicantName ?? n.applicantEmail ?? "an applicant"}
                </span>
              </div>
              <div
                className={
                  "mt-1.5 pl-3 text-[13px] " +
                  (unread ? "text-ink-80" : "text-ink-48")
                }
              >
                {snippet(n.body)}
              </div>
            </Link>
            {unread && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkRead(n.commentId);
                }}
                title="Mark as read"
                aria-label="Mark as read"
                className="absolute right-2 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-48 hover:bg-pearl hover:text-ink"
              >
                <CloseIcon />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Activity list (shared feed for the whole team)
// ---------------------------------------------------------------------------

function ActivityList({
  events,
  me,
  onOpen,
}: {
  events: ActivityEvent[];
  me: string;
  onOpen: () => void;
}) {
  if (events.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[13px] text-ink-48">
        No team activity yet.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-hairline/80">
      {events.map((e) => (
        <li key={e.id}>
          <Link
            href={`/${e.applicationId}${e.kind === "comment" ? `#c-${e.id.slice(2)}` : ""}`}
            onClick={onOpen}
            className="block px-4 py-3 hover:bg-pearl/60"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 truncate text-[13px]">
                <EventIcon kind={e.kind} />
                <span className="truncate text-ink">
                  <ActivityHeadline event={e} me={me} />
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-ink-48">
                {relTime(e.at)}
              </span>
            </div>
            <div className="mt-0.5 truncate pl-6 text-[12px] text-ink-48">
              on{" "}
              <span className="text-ink-80">
                {e.applicantName ?? e.applicantEmail ?? "an applicant"}
              </span>
            </div>
            {e.kind === "comment" && (
              <div className="mt-1.5 pl-6 text-[13px] text-ink-80">
                {snippet(e.body)}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ActivityHeadline({
  event,
  me,
}: {
  event: ActivityEvent;
  me: string;
}) {
  const isMe = event.actor === me;
  const actor = isMe ? "You" : `@${event.actor}`;
  if (event.kind === "star") {
    return (
      <>
        <span className="font-medium">{actor}</span>{" "}
        <span className="text-ink-48">starred</span>
      </>
    );
  }
  // comment
  const mentionedMe = me && event.mentions.includes(me);
  return (
    <>
      <span className="font-medium">{actor}</span>{" "}
      <span className="text-ink-48">
        {mentionedMe ? "tagged you in a comment" : "commented"}
      </span>
    </>
  );
}

function EventIcon({ kind }: { kind: ActivityEvent["kind"] }) {
  if (kind === "star") {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#f59e0b]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    );
  }
  // comment
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-action">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({
  item,
  onDismiss,
  onOpen,
}: {
  item: ToastEntry;
  onDismiss: (commentId: string) => void;
  onOpen: () => void;
}) {
  return (
    <div className="pointer-events-auto w-full max-w-[360px] rounded-[14px] border border-hairline bg-canvas px-4 py-3 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.28)] animate-[hh-toast-in_180ms_ease-out]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action text-[11px] font-semibold uppercase text-white">
          {item.author.slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[13px] font-medium text-ink">
              @{item.author}
              <span className="ml-1 font-normal text-ink-48">tagged you</span>
            </span>
            <button
              type="button"
              onClick={() => onDismiss(item.commentId)}
              aria-label="Dismiss"
              className="-mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-48 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="mt-0.5 truncate text-[12px] text-ink-48">
            on{" "}
            <span className="text-ink-80">
              {item.applicantName ?? item.applicantEmail ?? "an applicant"}
            </span>
          </div>
          <div className="mt-1.5 line-clamp-3 text-[13px] text-ink-80">
            {snippet(item.body)}
          </div>
          <div className="mt-2">
            <Link
              href={`/${item.applicationId}#c-${item.commentId}`}
              onClick={onOpen}
              className="text-[12px] font-medium text-action hover:text-action-focus"
            >
              Open →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
