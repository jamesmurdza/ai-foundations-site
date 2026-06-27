import { timeAgo } from "@portal/lib/format";
import type { Event } from "@portal/db/schema";

const ICON: Record<string, string> = {
  submission: "📦",
  star: "⭐",
  stream_live: "🔴",
  feedback: "💬",
  joined: "👋",
  achieved: "🏆",
  checkin: "🔥",
  assignment: "📌",
  weekly_update: "📣",
  profile: "🙋",
  graduate: "🎓",
};

export function PulseFeed({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="meta py-8 text-center">
        Nothing yet — the cohort&apos;s about to come alive.
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex items-center gap-3 py-2.5 px-3 rounded-2xl hover:bg-ice-tint transition-colors"
        >
          <span className="text-[18px] w-6 text-center shrink-0">
            {ICON[e.type] ?? "•"}
          </span>
          <span className="flex-1 text-[15px] text-midnight-harbor">
            {e.summary}
          </span>
          <span className="meta-light text-[12px] shrink-0">
            {timeAgo(e.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
