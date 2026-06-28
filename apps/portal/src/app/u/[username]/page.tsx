import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";

// Pretty, shareable handle URL — resolves @username to the canonical profile,
// preferring the GitHub-mirror /users/[login] when the owner has GitHub linked.
export default async function UsernameProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const handle = decodeURIComponent(username).replace(/^@/, "").toLowerCase();
  const [row] = await db
    .select({ id: profiles.id, login: users.githubLogin })
    .from(profiles)
    .leftJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.username, handle))
    .limit(1);
  if (!row) notFound();
  redirect(row.login ? `/users/${row.login}` : `/profiles/${row.id}`);
}
