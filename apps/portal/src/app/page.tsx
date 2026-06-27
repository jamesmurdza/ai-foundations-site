import Link from "next/link";
import { Sparkles, Brain, Code2, Rocket } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  countParticipants,
  countSubmissions,
  listShowcase,
  starLeaderboard,
  participantLocations,
  getCurrentWeek,
} from "@/lib/queries";
import { countApplications } from "@/lib/applications";
import { listEvents } from "@/lib/events";
import { requestLoginCode } from "@/lib/actions/auth-code";
import { PulseFeed } from "@/components/PulseFeed";
import { StarBoard } from "@/components/StarBoard";
import { WorldMap } from "@/components/WorldMap";
import { SubmissionCard } from "@/components/SubmissionCard";
import { SubmitButton } from "@/components/SubmitButton";

export default async function LandingPage() {
  const [user, participants, applications, submissions, showcase, events, stars, locations, week] =
    await Promise.all([
      getCurrentUser(),
      countParticipants(),
      countApplications(),
      countSubmissions(),
      listShowcase({ limit: 6 }),
      listEvents(10),
      starLeaderboard(),
      participantLocations(),
      getCurrentWeek(),
    ]);

  return (
    <div>
      {/* Hero — bordered frame */}
      <section className="container-page pb-8">
        <div className="frame border-t-0 px-4 py-3 flex justify-center mx-1 md:mx-8">
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="live-dot" />
            <span className="meta">
              <span className="font-semibold text-foreground">4-week Summer School</span>{" "}
              — one cohort, online &amp; in the house
            </span>
          </span>
        </div>

        <div className="frame border-t-0 mx-1 md:mx-8 relative px-6 pt-16 pb-10 flex flex-col items-center text-center">
          <Sparkles className="absolute left-0 -translate-x-1/2 -top-2.5 fill-foreground text-foreground" size={20} />
          <Sparkles className="absolute right-0 translate-x-1/2 -top-2.5 fill-foreground text-foreground" size={20} />
          <h1 className="font-heading font-semibold tracking-tight max-w-3xl text-5xl sm:text-6xl md:text-7xl leading-[1.03]">
            Build in public.<br />Graduate with{" "}
            <span className="text-primary">traction</span>.
          </h1>
          <p className="text-subheading meta mt-6 max-w-[56ch]">
            Ship a portfolio and real projects, trade GitHub stars with the whole
            cohort, and leave with a profile people actually star and follow.
          </p>

          <div className="w-full max-w-lg mt-8">
            {user ? (
              <Link href="/home" className="btn btn-primary">Go to your check-in →</Link>
            ) : (
              <form action={requestLoginCode} className="flex flex-col sm:flex-row gap-3">
                <input
                  className="input flex-1"
                  type="email"
                  name="email"
                  placeholder="the email you applied with"
                  required
                />
                <SubmitButton className="btn btn-primary" pendingText="Sending…">
                  Email me a sign-in code
                </SubmitButton>
              </form>
            )}
            <p className="meta-light text-[13px] mt-3">
              Accepted builders sign in with their application email ·{" "}
              <Link href="/discover?tab=showcase" className="link">browse the showcase</Link>
            </p>
          </div>
        </div>

        <div className="frame border-t-0 mx-1 md:mx-8 grid grid-cols-2 md:grid-cols-3 divide-x divide-border">
          <Feature icon={<Brain className="w-5 h-5 text-purple-glow" />} label="Machine Learning" />
          <Feature icon={<Code2 className="w-5 h-5 text-purple-glow" />} label="Building with AI" />
          <Feature icon={<Rocket className="w-5 h-5 text-purple-glow" />} label="Ship real projects" />
        </div>
      </section>

      {/* Stats */}
      <section className="container-page py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat n={participants} label="participants" />
          <Stat n={applications} label="applications" />
          <Stat n={submissions} label="projects shipped" />
          <Stat n={stars.total} label="stars traded" />
        </div>
      </section>

      {/* Map + pulse */}
      <section className="container-page py-6 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card">
          <WorldMap locations={locations} />
        </div>
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[22px]">The pulse</h2>
            <span className="badge badge-teal"><span className="live-dot" /> live</span>
          </div>
          <PulseFeed events={events} />
          <Link href="/discover?tab=activity" className="link block mt-4">See everything →</Link>
        </div>
      </section>

      {/* Star board */}
      <section className="container-page py-10">
        <div className="card max-w-[640px] mx-auto">
          <StarBoard total={stars.total} rows={stars.rows} limit={5} />
          <Link href="/discover?tab=activity" className="link block text-center mt-4">Full star board →</Link>
        </div>
      </section>

      {/* Showcase */}
      {showcase.length > 0 && (
        <section className="container-page py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-lg">Fresh from the showcase</h2>
            <Link href="/discover?tab=showcase" className="link">All projects →</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcase.map((s) => (
              <SubmissionCard key={s.submission.id} item={s} />
            ))}
          </div>
        </section>
      )}

      {/* Dark CTA */}
      <section className="bg-foreground mt-16">
        <div className="container-page py-20 text-center">
          <h2 className="text-[clamp(30px,5vw,50px)] font-semibold text-white max-w-[20ch] mx-auto">
            The in-person people are hosting. You&apos;re inside the room.
          </h2>
          <p className="text-white/70 text-subheading mt-4 max-w-[52ch] mx-auto">
            {week ? `This week: ${week.theme}. ` : ""}Watch the stream, ship the
            assignment, get peer feedback, and trade stars — all in one place.
          </p>
          <div className="mt-8">
            <Link href={user ? "/home" : "/login"} className="btn btn-primary">
              {user ? "Go to your home" : "Get started"} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-5">
      {icon}
      <span className="meta">{label}</span>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="card-flat text-center">
      <div className="text-[34px] font-semibold font-heading">{n.toLocaleString()}</div>
      <div className="meta">{label}</div>
    </div>
  );
}
