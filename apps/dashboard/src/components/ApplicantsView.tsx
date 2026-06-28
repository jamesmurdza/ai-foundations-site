"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ALL_REGIONS, countryOf, regionOf } from "@/lib/geo";
import type { AdminStatus, Application } from "@/lib/types";
import { withBase } from "@/lib/paths";

type UnreadByApp = Record<string, { total: number; mentioned: number }>;
type CommentCountMap = Record<string, number>;
// application_id -> [usernames]
type StarMap = Record<string, string[]>;

type ListPayload = {
  apps: Application[];
  unread: UnreadByApp;
  commentCounts: CommentCountMap;
  stars: StarMap;
  me: string;
  fetchedAt: string;
};

// A combined lifecycle state — collapses (flow status, admin status) into one.
type Lifecycle =
  | "in_progress" // applicant still filling out the form
  | "awaiting" // submitted, admin hasn't decided yet
  | "accepted"
  | "waitlist"
  | "rejected";

const LIFECYCLE_OPTIONS: { value: Lifecycle; label: string }[] = [
  { value: "in_progress", label: "In progress" },
  { value: "awaiting", label: "Awaiting review" },
  { value: "accepted", label: "Accepted" },
  { value: "waitlist", label: "Waitlist" },
  { value: "rejected", label: "Rejected" },
];

const LIFECYCLE_ORDER: Record<Lifecycle, number> = {
  in_progress: 0,
  awaiting: 1,
  accepted: 2,
  waitlist: 3,
  rejected: 4,
};

function lifecycleOf(a: Application): Lifecycle {
  if (a.status === "in_progress") return "in_progress";
  const s = (a.adminStatus ?? "pending") as AdminStatus;
  if (s === "accepted") return "accepted";
  if (s === "waitlist") return "waitlist";
  if (s === "rejected") return "rejected";
  return "awaiting";
}

type SortKey = "star" | "name" | "country" | "lifecycle" | "submitted" | "notes";
type SortDir = "asc" | "desc";

const POLL_MS = 15_000;
const SNAPSHOT_KEY = "hh:apps-snapshot:v3";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function loadSnapshot(): ListPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ListPayload;
  } catch {
    return null;
  }
}

function saveSnapshot(payload: ListPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(payload));
  } catch {
    /* quota — ignore */
  }
}

function starredBy(stars: StarMap, applicationId: string): string[] {
  return stars[applicationId] ?? [];
}

function iStarred(stars: StarMap, applicationId: string, me: string): boolean {
  if (!me) return false;
  const list = stars[applicationId];
  return !!list && list.includes(me);
}

export function ApplicantsView({ initial }: { initial: ListPayload }) {
  const [data, setData] = useState<ListPayload>(initial);
  const [lastSync, setLastSync] = useState<Date | null>(
    () => (initial.fetchedAt ? new Date(initial.fetchedAt) : null),
  );
  const [newCount, setNewCount] = useState(0);
  const knownIdsRef = useRef<Set<string>>(new Set(initial.apps.map((a) => a.id)));
  const hasSwappedSnapshotRef = useRef(false);

  const me = data.me;
  const starsRef = useRef<StarMap>(data.stars);
  useEffect(() => { starsRef.current = data.stars; }, [data.stars]);

  const [lifecycleFilter, setLifecycleFilter] = useState<Set<Lifecycle>>(
    () => new Set<Lifecycle>(),
  );
  const [regionFilter, setRegionFilter] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [favsOnly, setFavsOnly] = useState(false);
  const [query, setQuery] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    saveSnapshot(data);
  }, [data]);

  const legacyMigrationDoneRef = useRef(false);

  const refresh = useCallback(async (silent: boolean) => {
    try {
      const res = await fetch(withBase("/api/applications"), {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) return;
      const next = (await res.json()) as ListPayload;
      setData(next);
      setLastSync(new Date(next.fetchedAt ?? Date.now()));

      const known = knownIdsRef.current;
      let added = 0;
      for (const a of next.apps) if (!known.has(a.id)) added += 1;
      if (silent && added > 0) setNewCount((n) => n + added);
      knownIdsRef.current = new Set(next.apps.map((a) => a.id));
    } catch {
      /* network blip */
    }
  }, []);

  // One-time migration: in the old localStorage-only world, each admin stored
  // their own stars under hh:fav:<me>:v1. Now that stars live server-side,
  // upload anything that exists locally so teammates can finally see them,
  // then remove the localStorage key so we don't keep retrying.
  useEffect(() => {
    if (!me || legacyMigrationDoneRef.current) return;
    legacyMigrationDoneRef.current = true;

    const oldKey = `hh:fav:${me}:v1`;
    let oldIds: string[] = [];
    try {
      const raw = window.localStorage.getItem(oldKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      oldIds = (parsed as unknown[]).filter(
        (v): v is string => typeof v === "string" && v.length > 0,
      );
    } catch {
      return;
    }
    if (oldIds.length === 0) {
      try {
        window.localStorage.removeItem(oldKey);
      } catch {
        /* ignore */
      }
      return;
    }

    // Skip anything I've already starred server-side (e.g. partial migration).
    const alreadyMine = new Set(
      Object.entries(data.stars)
        .filter(([, users]) => users.includes(me))
        .map(([id]) => id),
    );
    const toUpload = oldIds.filter((id) => !alreadyMine.has(id));

    (async () => {
      if (toUpload.length > 0) {
        await Promise.allSettled(
          toUpload.map((id) =>
            fetch(withBase(`/api/stars/${id}`), {
              method: "POST",
              credentials: "same-origin",
            }),
          ),
        );
        void refresh(false);
      }
      try {
        window.localStorage.removeItem(oldKey);
      } catch {
        /* ignore */
      }
    })();
  }, [me, data.stars, refresh]);

  useEffect(() => {
    if (!hasSwappedSnapshotRef.current) {
      hasSwappedSnapshotRef.current = true;
      const snap = loadSnapshot();
      const initialAt = Date.parse(initial.fetchedAt || "") || 0;
      const snapAt = Date.parse(snap?.fetchedAt ?? "") || 0;
      if (snap && snapAt > initialAt) {
        setData(snap);
        setLastSync(new Date(snap.fetchedAt));
        knownIdsRef.current = new Set(snap.apps.map((a) => a.id));
      }
    }
    refresh(false);
    const id = window.setInterval(() => refresh(true), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh, initial.fetchedAt]);

  const toggleStar = useCallback(
    (id: string) => {
      if (!me) return;
      // Read current state synchronously before scheduling the update —
      // the setData updater runs during the next render, so reading
      // willBeStarred from inside it would always see the pre-update value.
      const currentList = starsRef.current[id] ?? [];
      const willBeStarred = !currentList.includes(me);
      setData((prev) => {
        const list = prev.stars[id] ?? [];
        const has = list.includes(me);
        const nextList = has ? list.filter((u) => u !== me) : [...list, me];
        return {
          ...prev,
          stars: { ...prev.stars, [id]: nextList },
        };
      });
      void fetch(withBase(`/api/stars/${id}`), {
        method: willBeStarred ? "POST" : "DELETE",
        credentials: "same-origin",
      }).catch(() => {
        /* The next poll will reconcile state with the server. */
      });
    },
    [me],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.apps.filter((a) => {
      if (lifecycleFilter.size > 0 && !lifecycleFilter.has(lifecycleOf(a))) {
        return false;
      }
      if (regionFilter.size > 0 && !regionFilter.has(regionOf(a.answers))) {
        return false;
      }
      if (favsOnly && starredBy(data.stars, a.id).length === 0) return false;
      if (q) {
        const hay =
          `${a.name ?? ""} ${a.email ?? ""} ${countryOf(a.answers) ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data.apps, data.stars, lifecycleFilter, regionFilter, favsOnly, query]);

  const ordered = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const dateOf = (a: Application) =>
      Date.parse(a.submittedAt ?? a.updatedAt ?? "") || 0;
    const cmp = (a: Application, b: Application): number => {
      switch (sortKey) {
        case "star": {
          const av = starredBy(data.stars, a.id).length;
          const bv = starredBy(data.stars, b.id).length;
          if (av !== bv) return (bv - av) * dir;
          return (dateOf(b) - dateOf(a)) * dir;
        }
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "") * dir;
        case "country":
          return (
            (countryOf(a.answers) ?? "").localeCompare(
              countryOf(b.answers) ?? "",
            ) * dir
          );
        case "lifecycle":
          return (
            (LIFECYCLE_ORDER[lifecycleOf(a)] - LIFECYCLE_ORDER[lifecycleOf(b)]) *
            dir
          );
        case "notes":
          return (
            ((data.commentCounts[a.id] ?? 0) -
              (data.commentCounts[b.id] ?? 0)) *
            dir
          );
        case "submitted":
        default:
          return (dateOf(a) - dateOf(b)) * dir;
      }
    };
    return [...filtered].sort(cmp);
  }, [filtered, sortKey, sortDir, data.stars, data.commentCounts]);

  const onSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        // Sensible default direction per column.
        setSortDir(
          key === "name" || key === "country" || key === "lifecycle"
            ? "asc"
            : "desc",
        );
        return key;
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
  }, []);

  const totalShown = ordered.length;
  const totalAll = data.apps.length;

  return (
    <>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <MultiSelect
          label="Status"
          options={LIFECYCLE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            count: data.apps.filter((a) => lifecycleOf(a) === o.value).length,
          }))}
          selected={lifecycleFilter as Set<string>}
          onChange={(next) =>
            setLifecycleFilter(new Set([...next]) as Set<Lifecycle>)
          }
        />
        <MultiSelect
          label="Region"
          options={ALL_REGIONS.map((r) => ({
            value: r,
            label: r,
            count: data.apps.filter((a) => regionOf(a.answers) === r).length,
          }))}
          selected={regionFilter}
          onChange={setRegionFilter}
        />
        <button
          type="button"
          onClick={() => setFavsOnly((v) => !v)}
          aria-pressed={favsOnly}
          className={
            "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors " +
            (favsOnly
              ? "border-ink bg-ink text-canvas"
              : "border-hairline bg-canvas text-ink-80 hover:border-ink/30 hover:text-ink")
          }
        >
          <StarIcon filled={favsOnly} />
          Starred only · {Object.keys(data.stars).filter((id) => (data.stars[id]?.length ?? 0) > 0).length}
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, country…"
          className="h-8 min-w-[220px] flex-1 rounded-full border border-hairline bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-48 hover:border-ink/30 focus:border-ink/40 focus:outline-none"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-ink-48">
        <span>
          Showing {totalShown} of {totalAll}
        </span>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <button
              type="button"
              onClick={() => setNewCount(0)}
              className="inline-flex items-center gap-1 rounded-full bg-action px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-action-focus"
            >
              {newCount} new
            </button>
          )}
          <span aria-live="polite">
            {lastSync ? `Synced ${fmtDate(lastSync.toISOString())}` : "Syncing…"}
          </span>
          <button
            type="button"
            onClick={() => {
              setNewCount(0);
              void refresh(false);
            }}
            className="rounded-full border border-hairline bg-canvas px-2.5 py-[3px] font-medium text-ink-80 hover:border-ink/30 hover:text-ink"
          >
            Refresh
          </button>
        </div>
      </div>

      {ordered.length === 0 ? (
        <section className="rounded-[18px] border border-hairline bg-canvas px-6 py-16 text-center text-[15px] text-ink-48">
          No applications match these filters.
        </section>
      ) : (
        <>
          {/* Mobile cards */}
          <section className="space-y-3 md:hidden">
            {ordered.map((a, i) => {
              const u = data.unread[a.id];
              const notes = data.commentCounts[a.id] ?? 0;
              const starrers = starredBy(data.stars, a.id);
              const isFav = iStarred(data.stars, a.id, me);
              return (
                <div
                  key={a.id}
                  className="relative rounded-[18px] border border-hairline bg-canvas px-5 py-4 active:bg-pearl/60"
                >
                  {/* Stretched link — covers the whole card so anywhere
                      that isn't an inner interactive control is a tap
                      target for opening this applicant. Interactive
                      children get relative z-20 to stay above it. */}
                  <Link
                    href={`/${a.id}`}
                    aria-label={`Open ${a.name ?? "applicant"}`}
                    className="absolute inset-0 z-10 rounded-[18px]"
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <div className="relative z-20">
                        <StarButton
                          mine={isFav}
                          starrers={starrers}
                          onClick={() => toggleStar(a.id)}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] tabular-nums text-ink-48">
                            #{i + 1}
                          </span>
                          <span className="truncate text-[15px] font-medium text-ink">
                            {a.name ?? (
                              <span className="text-ink-48">No name</span>
                            )}
                          </span>
                          {u && u.mentioned > 0 && (
                            <span className="inline-flex items-center rounded-full bg-action px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-white">
                              @ {u.mentioned}
                            </span>
                          )}
                          {u && u.mentioned === 0 && u.total > 0 && (
                            <span className="inline-flex items-center rounded-full bg-pearl px-2 py-[2px] text-[10px] font-medium text-ink-80 ring-1 ring-hairline">
                              {u.total} new
                            </span>
                          )}
                        </div>
                        {a.email && (
                          <div className="mt-0.5 truncate text-[12px] text-ink-48">
                            {a.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="shrink-0 text-[18px] leading-none text-ink-48"
                    >
                      ›
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <LifecyclePill state={lifecycleOf(a)} />
                    <div className="relative z-20">
                      <LinksCell app={a} />
                    </div>
                    {notes > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-[2px] text-[11px] text-ink-80">
                        <NoteIcon /> {notes}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-80">
                    <span>
                      <span className="text-ink-48">Country · </span>
                      {countryOf(a.answers) ?? "—"}
                    </span>
                    <span className="text-ink-48">
                      {fmtDate(a.submittedAt ?? a.updatedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Desktop table */}
          <section className="hidden overflow-hidden rounded-[18px] border border-hairline bg-canvas md:block">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-pearl text-[12px] uppercase tracking-[0.08em] text-ink-48">
                  <SortableTH
                    label=""
                    sortKey="star"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    className="w-[44px] px-3"
                    title="Sort by starred"
                  >
                    <StarIcon filled={false} className="text-ink-48" />
                  </SortableTH>
                  <SortableTH
                    label="Applicant"
                    sortKey="name"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTH
                    label="Country"
                    sortKey="country"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTH
                    label="Status"
                    sortKey="lifecycle"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <th className="px-5 py-3 text-left font-medium">Links</th>
                  <SortableTH
                    label="Submitted"
                    sortKey="submitted"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTH
                    label="Notes"
                    sortKey="notes"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    className="w-[88px]"
                  />
                  <th className="w-[80px] px-5 py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {ordered.map((a, i) => {
                  const u = data.unread[a.id];
                  const notes = data.commentCounts[a.id] ?? 0;
                  const starrers = starredBy(data.stars, a.id);
                  const isFav = iStarred(data.stars, a.id, me);
                  return (
                    <tr
                      key={a.id}
                      className="border-t border-hairline/80 transition-colors hover:bg-pearl/60"
                    >
                      <td className="px-3 py-4 align-middle">
                        <StarButton
                          mine={isFav}
                          starrers={starrers}
                          onClick={() => toggleStar(a.id)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/${a.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] tabular-nums text-ink-48">
                              #{i + 1}
                            </span>
                            <span className="font-medium text-ink">
                              {a.name ?? (
                                <span className="text-ink-48">No name</span>
                              )}
                            </span>
                            {u && u.mentioned > 0 && (
                              <span className="inline-flex items-center rounded-full bg-action px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-white">
                                @ {u.mentioned}
                              </span>
                            )}
                            {u && u.mentioned === 0 && u.total > 0 && (
                              <span className="inline-flex items-center rounded-full bg-pearl px-2 py-[2px] text-[10px] font-medium text-ink-80 ring-1 ring-hairline">
                                {u.total} new
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-ink-48">
                            {a.email ?? "—"}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-ink-80">
                        {countryOf(a.answers) ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <LifecyclePill state={lifecycleOf(a)} />
                      </td>
                      <td className="px-5 py-4">
                        <LinksCell app={a} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-80">
                        {fmtDate(a.submittedAt ?? a.updatedAt)}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-ink-80">
                        {notes > 0 ? notes : <span className="text-ink-48">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/${a.id}`}
                          className="text-[13px] font-medium text-action hover:text-action-focus"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Multiselect popover
// ---------------------------------------------------------------------------

type MultiOption = { value: string; label: string; count?: number };

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: MultiOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const summary =
    selected.size === 0
      ? "All"
      : selected.size === 1
        ? (options.find((o) => o.value === [...selected][0])?.label ?? "1")
        : `${selected.size} selected`;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={
          "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors " +
          (selected.size > 0
            ? "border-ink bg-ink text-canvas"
            : "border-hairline bg-canvas text-ink-80 hover:border-ink/30 hover:text-ink")
        }
      >
        <span className={selected.size > 0 ? "text-canvas/80" : "text-ink-48"}>
          {label}:
        </span>
        <span>{summary}</span>
        <Chevron />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1.5 max-h-[320px] w-[240px] overflow-auto rounded-[14px] border border-hairline bg-canvas p-1 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-48">
              {label}
            </span>
            {selected.size > 0 && (
              <button
                type="button"
                className="text-[11px] font-medium text-action hover:text-action-focus"
                onClick={() => onChange(new Set())}
              >
                Clear
              </button>
            )}
          </div>
          {options.map((o) => {
            const checked = selected.has(o.value);
            return (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2 rounded-[8px] px-3 py-1.5 text-[13px] text-ink hover:bg-pearl"
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[var(--color-action)]"
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(o.value);
                    else next.delete(o.value);
                    onChange(next);
                  }}
                />
                <span className="flex-1">{o.label}</span>
                {o.count !== undefined && (
                  <span className="tabular-nums text-[12px] text-ink-48">
                    {o.count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable table header
// ---------------------------------------------------------------------------

function SortableTH({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
  title,
  children,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
  title?: string;
  children?: ReactNode;
}) {
  const active = activeKey === sortKey;
  return (
    <th className={`px-5 py-3 text-left font-medium ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={title ?? `Sort by ${label.toLowerCase()}`}
        className={
          "inline-flex items-center gap-1 uppercase tracking-[0.08em] " +
          (active ? "text-ink" : "text-ink-48 hover:text-ink")
        }
      >
        {children ?? label}
        <SortArrow active={active} dir={dir} />
      </button>
    </th>
  );
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg
        width="9"
        height="9"
        viewBox="0 0 10 10"
        fill="none"
        className="opacity-40"
        aria-hidden
      >
        <path
          d="M3 4l2-2 2 2M3 6l2 2 2-2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
      {dir === "asc" ? (
        <path
          d="M3 6l2-2 2 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3 4l2 2 2-2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Lifecycle pill (combined flow + admin status)
// ---------------------------------------------------------------------------

const LIFECYCLE_STYLES: Record<Lifecycle, string> = {
  in_progress: "bg-pearl text-ink-80 ring-1 ring-hairline",
  awaiting: "bg-[#e0f2fe] text-[#075985] ring-1 ring-[#bae6fd]",
  accepted: "bg-[#dcfce7] text-[#14532d] ring-1 ring-[#bbf7d0]",
  waitlist: "bg-[#fef3c7] text-[#7c4a03] ring-1 ring-[#fde68a]",
  rejected: "bg-[#fee2e2] text-[#7f1d1d] ring-1 ring-[#fecaca]",
};

const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  in_progress: "In progress",
  awaiting: "Awaiting review",
  accepted: "Accepted",
  waitlist: "Waitlist",
  rejected: "Rejected",
};

function LifecyclePill({ state }: { state: Lifecycle }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium tracking-tight ${LIFECYCLE_STYLES[state]}`}
    >
      {LIFECYCLE_LABEL[state]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Links cell — render icons for portfolio / github / other
// ---------------------------------------------------------------------------

function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
  if (t.startsWith("//")) return "https:" + t;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "mailto:" + t;
  return "https://" + t.replace(/^\/+/, "");
}

function looksLikeLinkedIn(u: string): boolean {
  return /linkedin\.com/i.test(u);
}

function LinksCell({ app }: { app: Application }) {
  const portfolio = normalizeUrl(app.portfolioUrl);
  const github = normalizeUrl(app.githubUrl);
  const other = normalizeUrl(app.otherUrl);
  if (!portfolio && !github && !other) {
    return <span className="text-ink-48">—</span>;
  }
  return (
    <div className="inline-flex items-center gap-1">
      {github && (
        <IconLink href={github} title="GitHub">
          <GithubIcon />
        </IconLink>
      )}
      {portfolio && (
        <IconLink href={portfolio} title="Portfolio">
          <GlobeIcon />
        </IconLink>
      )}
      {other && (
        <IconLink
          href={other}
          title={looksLikeLinkedIn(other) ? "LinkedIn" : "Other"}
        >
          {looksLikeLinkedIn(other) ? <LinkedInIcon /> : <LinkIcon />}
        </IconLink>
      )}
    </div>
  );
}

function IconLink({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title={title}
      aria-label={title}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-ink-80 transition-colors hover:border-ink/30 hover:text-ink"
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Star button + icons
// ---------------------------------------------------------------------------

function StarButton({
  mine,
  starrers,
  onClick,
}: {
  /** Whether the current admin starred this applicant. */
  mine: boolean;
  /** All admins who starred this applicant (used for the team total). */
  starrers: string[];
  onClick: () => void;
}) {
  const total = starrers.length;
  const filled = mine || total > 0;
  const title = total === 0
    ? "Star this applicant"
    : starrers.join(", ") + (mine ? " (incl. you)" : "");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={mine}
      title={title}
      className={
        "relative inline-flex h-7 min-w-[28px] items-center justify-center rounded-full transition-colors " +
        (mine
          ? "text-[#f59e0b] hover:text-[#d97706]"
          : filled
            ? "text-[#f59e0b]/60 hover:text-[#d97706]"
            : "text-ink-48 hover:text-ink")
      }
    >
      <StarIcon filled={filled} />
      {total > 1 && (
        <span className="ml-0.5 text-[10px] font-semibold tabular-nums leading-none">
          {total}
        </span>
      )}
    </button>
  );
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="opacity-70"
    >
      <path
        d="M2.5 3.75L5 6.25l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-2c-3.13.68-3.79-1.34-3.79-1.34-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.45.11-3.02 0 0 .95-.3 3.11 1.16.9-.25 1.87-.38 2.83-.39.96 0 1.93.14 2.83.39 2.16-1.46 3.11-1.16 3.11-1.16.61 1.57.23 2.73.11 3.02.72.79 1.16 1.8 1.16 3.03 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.04.76 2.1v3.11c0 .3.2.66.78.55 4.46-1.49 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05 4.02 0 4.76 2.65 4.76 6.1V21h-4v-5.27c0-1.26-.02-2.88-1.76-2.88-1.76 0-2.03 1.37-2.03 2.78V21h-4V9z" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg
      width="12"
      height="12"
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
  );
}
