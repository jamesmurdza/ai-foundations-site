/**
 * Trade Stars can only be ENABLED by a GitHub-connected account — one with a
 * stored access token, which is what's actually needed to star repos. Opting
 * OUT is always allowed. Pure → the single source of truth every opt-in path
 * (profile save, onboarding, the Discover toggle, the submission CTA) gates on.
 */
export function canEnableTradeStars(user: { accessToken: string | null }): boolean {
  return Boolean(user.accessToken);
}
