import Link from "next/link";
import { listProfiles } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { profileHref } from "@/lib/profileHref";

export default async function AdminPeoplePage() {
  const people = await listProfiles();

  return (
    <div>
      <h2 className="text-heading mb-1">People</h2>
      <p className="meta mb-6">{people.length} participants — online and in the house.</p>

      {people.length === 0 ? (
        <div className="card meta">No one has signed up yet.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {people.map(({ profile, author, starsReceived }) => (
            <div
              key={profile.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-sea-fog last:border-0"
            >
              <Avatar src={author.avatarUrl} name={author.name} size={36} />
              <div className="flex-1 min-w-0">
                <Link href={profileHref(author)} prefetch={false} className="font-semibold hover:text-signal-blue">
                  {author.name}
                </Link>
                <div className="meta-light text-[13px] truncate">
                  {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
                  {profile.publicEmail ? ` · ${profile.publicEmail}` : ""}
                </div>
              </div>
              <span className="badge badge-muted">{starsReceived} ⭐</span>
              {profile.graduate && <span className="badge badge-teal">🎓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
