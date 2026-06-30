import Link from "@portal/components/Link";
import { listProfiles, listShowcase, starLeaderboard } from "@portal/lib/queries";
import { SubmissionCard } from "@portal/components/SubmissionCard";
import { StarBoard } from "@portal/components/StarBoard";
import { Avatar } from "@portal/components/Avatar";
import { profileHref } from "@portal/lib/profileHref";

export default async function DemoDayPage() {
  const [people, showcase, stars] = await Promise.all([
    listProfiles(),
    listShowcase({ limit: 60 }),
    starLeaderboard(),
  ]);
  const graduates = people.filter((p) => p.profile.graduate);

  return (
    <div>
      <section className="bg-midnight-harbor">
        <div className="container-page py-20 text-center">
          <div className="pill bg-signal-blue text-white inline-flex mb-5">Week 4 · Demo Day</div>
          <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold text-white max-w-[18ch] mx-auto">
            The whole cohort, shipped.
          </h1>
          <p className="text-sea-fog text-subheading mt-4 max-w-[52ch] mx-auto">
            Four weeks of building, in one highlight reel. Projects, traction,
            and the people who made it.
          </p>
        </div>
      </section>

      <div className="container-page py-12 space-y-14">
        <section className="card max-w-[640px] mx-auto">
          <StarBoard total={stars.total} rows={stars.rows} limit={8} />
        </section>

        {graduates.length > 0 && (
          <section>
            <h2 className="text-heading-lg mb-4">🎓 Graduates</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {graduates.map(({ profile, author }) => (
                // prefetch={false}: grid of graduate cards; skip per-card
                // viewport prefetch on this long public page.
                <Link key={profile.id} href={profileHref(author)} prefetch={false} className="card card-hover text-center">
                  <div className="flex justify-center mb-2">
                    <Avatar src={author.avatarUrl} name={author.name} size={64} />
                  </div>
                  <div className="font-bold">{author.name}</div>
                  <div className="meta-light text-[13px]">{profile.country}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-heading-lg mb-4">Every project</h2>
          {showcase.length === 0 ? (
            <div className="card meta">Projects will appear here as the cohort ships.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcase.map((s) => (
                <SubmissionCard key={s.submission.id} item={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
