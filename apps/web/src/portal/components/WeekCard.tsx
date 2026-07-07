import Link from "@portal/components/Link";
import {
  Lock,
  CircleCheck,
  ArrowRight,
  SquarePen,
  Heart,
  MessageCircle,
} from "lucide-react";

/**
 * One week tile on the lessons hub. Four mutually exclusive states:
 *  - welcome: the Week 0 intro (no assignment) — always open.
 *  - todo:    unlocked but not yet submitted — the whole card starts the week.
 *  - locked:  a later week whose previous week isn't submitted — not clickable,
 *             shows a lock + a hover tooltip naming the week to finish first.
 *  - done:    submitted — a green check, plus like/comment counts and the ONLY
 *             place the edit (pencil) affordance appears (you can't edit
 *             something you haven't submitted).
 */
type Base = { number: number; title: string };
export type WeekCardProps = Base &
  (
    | { state: "welcome"; href: string }
    | { state: "todo"; startHref: string }
    | { state: "locked"; prevWeekNumber: number }
    | {
        state: "done";
        href: string;
        starCount: number;
        commentCount: number;
        editHref: string;
      }
  );

const CARD =
  "card relative flex flex-1 flex-col items-center justify-center min-h-[176px] text-center";
const TITLE = "font-semibold text-[17px] leading-snug text-balance";

function Eyebrow({ number }: { number: number }) {
  return <span className="meta-light text-[12px] mb-1">Week {number}</span>;
}

/** A plain green "done" check in the card's top-right corner. */
function DoneCheck() {
  return (
    <CircleCheck
      size={18}
      className="absolute top-3 right-3 text-success"
      aria-hidden
    />
  );
}

export function WeekCard(props: WeekCardProps) {
  const { number, title } = props;

  if (props.state === "locked") {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative group">
          <div className={`${CARD} opacity-55 cursor-not-allowed select-none`} aria-disabled>
            <Lock
              size={15}
              className="absolute top-3 right-3 text-slate-channel"
              aria-hidden
            />
            <Eyebrow number={number} />
            <span className={`${TITLE} text-slate-channel`}>{title}</span>
            <span className="sr-only">
              Locked — complete Week {props.prevWeekNumber} to unlock.
            </span>
          </div>
          <div
            role="tooltip"
            className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 hidden w-[240px] max-w-[calc(100vw-2rem)] -translate-x-1/2 group-hover:block"
          >
            <div
              className="card !p-3 text-[12px] leading-snug text-slate-channel text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              Complete{" "}
              <span className="font-semibold text-foreground">
                Week {props.prevWeekNumber}
              </span>{" "}
              to unlock this week.
            </div>
          </div>
        </div>
        {/* Spacer keeps locked tiles aligned with the footer-row height of others. */}
        <div className="h-5" aria-hidden />
      </div>
    );
  }

  if (props.state === "welcome") {
    return (
      <div className="flex flex-col gap-2">
        <Link href={props.href} className={CARD}>
          <DoneCheck />
          <Eyebrow number={number} />
          <span className={TITLE}>{title}</span>
        </Link>
        <div className="flex items-center justify-end meta-light text-[13px] px-1">
          <Link
            href={props.href}
            prefetch={false}
            className="flex items-center hover:text-signal-blue"
            aria-label={`Open ${title}`}
          >
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  if (props.state === "todo") {
    // The next actionable week — the page's focal point. Highlighted with an
    // indigo ring + soft tint + a "Start here" tab so it clearly reads as the
    // one to click, while done weeks stay calm and locked weeks stay dim.
    return (
      <div className="flex flex-col gap-2 group">
        <Link
          href={props.startHref}
          className={`${CARD} ring-2 ring-primary bg-primary-soft transition-shadow hover:shadow-[var(--shadow-card)]`}
          aria-label={`Start ${title}`}
        >
          <Eyebrow number={number} />
          <span className={TITLE}>{title}</span>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Start here
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
        {/* Spacer keeps the tile aligned with the footer-row height of others. */}
        <div className="h-5" aria-hidden />
      </div>
    );
  }

  // done
  return (
    <div className="flex flex-col gap-2">
      <Link href={props.href} className={CARD}>
        <DoneCheck />
        <Eyebrow number={number} />
        <span className={TITLE}>{title}</span>
      </Link>
      <div className="flex items-center justify-start gap-5 meta-light text-[13px] px-1">
        <Link
          href={props.href}
          prefetch={false}
          className="flex items-center gap-1.5 hover:text-signal-blue"
          aria-label="View likes and comments"
        >
          <Heart size={16} />
          {props.starCount}
        </Link>
        <Link
          href={props.href}
          prefetch={false}
          className="flex items-center gap-1.5 hover:text-signal-blue"
          aria-label="View comments"
        >
          <MessageCircle size={16} />
          {props.commentCount}
        </Link>
        <Link
          href={props.editHref}
          prefetch={false}
          className="ml-auto flex items-center hover:text-signal-blue"
          aria-label="Edit submission"
        >
          <SquarePen size={15} />
        </Link>
      </div>
    </div>
  );
}
