/**
 * Peer compliments reuse the existing tables — `comments` for profiles (Week 1)
 * and `feedback` for submissions (Weeks 2 & 4). There is no separate compliment
 * store. This module holds the only real piece of logic: the ordering that
 * decides whose work to surface for a compliment.
 *
 * The "matching" is deliberately stateless. Instead of pre-assigning reviewers
 * up front — which matches everyone at once and rots as the cohort drops off —
 * we float the least-complimented work to the top whenever someone opens
 * Discover to give compliments. Pull, not push: only active people do the work,
 * and attention spreads to whoever still needs it. Kept pure so it unit-tests
 * without a database.
 */
// `createdAt` may arrive as a Date, an ISO string, or epoch ms. Callers read
// from `unstable_cache`, which JSON-serializes its payload — so a Date becomes a
// string by the time it reaches us. Normalize rather than assume Date methods.
export type Need = { count: number; createdAt: Date | string | number };

/**
 * Order `items` so the ones that most need a compliment come first: fewest
 * compliments first, ties broken oldest-first (waited longest). Deterministic
 * and non-mutating.
 */
export function rankByNeed<T>(items: readonly T[], need: (item: T) => Need): T[] {
  return [...items].sort((a, b) => {
    const na = need(a);
    const nb = need(b);
    if (na.count !== nb.count) return na.count - nb.count;
    return new Date(na.createdAt).getTime() - new Date(nb.createdAt).getTime();
  });
}
