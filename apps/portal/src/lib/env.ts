/** Centralised, typed access to environment configuration. */

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  authSecret:
    process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me-please-0000",
  githubId: process.env.AUTH_GITHUB_ID ?? "",
  githubSecret: process.env.AUTH_GITHUB_SECRET ?? "",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  emailFrom:
    process.env.SMTP_FROM ??
    "AI Foundations <summerschool@aifoundations.school>",
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  devLoginEnabled:
    (process.env.DEV_LOGIN_ENABLED ?? "true").toLowerCase() !== "false",
  // Anthropic key powers the GitWit profile review (Haiku). Server-only.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  // Optional GitHub token for higher API rate limits on profile reads.
  githubToken: process.env.GITHUB_TOKEN ?? "",
  // tinysend.com mailing-list API key. Powers ONLY the subscriber import in
  // lib/tinysend.ts. Server-only; holds destructive scope — never log it.
  tinysendApiKey: process.env.TINYSEND_API_KEY ?? "",
};

export const githubConfigured = Boolean(env.githubId && env.githubSecret);
export const anthropicConfigured = Boolean(env.anthropicApiKey);
export const smtpConfigured = Boolean(
  env.smtpHost && env.smtpUser && env.smtpPass,
);
export const tinysendConfigured = Boolean(env.tinysendApiKey);
// Mark cookies Secure only when the site is actually served over https, so
// auth works on local http (dev + http deploys) and stays secure on https.
export const cookieSecure = env.baseUrl.startsWith("https://");

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return env.adminEmails.includes(email.toLowerCase());
}
