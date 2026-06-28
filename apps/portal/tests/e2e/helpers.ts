import { type Page, expect } from "@playwright/test";

/** First entry of ADMIN_EMAILS in .env.local — the founder allowlist. */
export const ADMIN_EMAIL = "burhanuddinkhatri@gmail.com";

export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}+${Date.now()}-${Math.floor(Math.random() * 1e5)}@example.com`;
}

/** An in-memory file for setInputFiles — no temp file on disk needed. */
export function tinyFile(
  name = "syllabus.txt",
  content = `AI Foundations material ${Date.now()}`,
  mimeType = "text/plain",
) {
  return { name, mimeType, buffer: Buffer.from(content), content };
}

/** Dev login bypass (email-only). The real flow uses an emailed code. */
export async function devLogin(page: Page, email: string) {
  // Start from a clean session so switching users mid-test isn't blocked by
  // /login redirecting an already-authenticated visitor to the dashboard.
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByTestId("dev-email").fill(email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/);
}

/** Dev login as a founder (admin allowlist). Admins skip onboarding for /admin. */
export async function adminLogin(page: Page) {
  await devLogin(page, ADMIN_EMAIL);
}

/** Walk the 3-step onboarding flow if we landed in it. */
export async function completeOnboarding(page: Page, name: string) {
  if (page.url().includes("/onboarding")) {
    // Step 1 — details
    await page.fill('input[name="displayName"]', name);
    await page.fill('input[name="country"]', "Pakistan");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForURL(/\/onboarding\/goals/);
  }
  if (page.url().includes("/onboarding/goals")) {
    // Step 2 — goals
    await page.fill('textarea[name="wantToAchieve"]', "Reach 50 GitHub stars");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForURL(/\/onboarding\/connect/);
  }
  if (page.url().includes("/onboarding/connect")) {
    // Step 3 — finish (GitHub connect is optional)
    await page.getByRole("button", { name: /finish/i }).click();
    await page.waitForURL(/\/home/);
  }
}

/** Sign up a brand-new participant and finish onboarding. */
export async function signUp(page: Page, name: string): Promise<string> {
  const email = uniqueEmail();
  await devLogin(page, email);
  await completeOnboarding(page, name);
  return email;
}

/** From the dashboard, submit to the current week's first assignment. */
export async function submitGitHubProfile(
  page: Page,
  title: string,
  url = "https://github.com/octocat",
): Promise<string> {
  await page.goto("/home");
  await page.getByRole("link", { name: /open assignment|resubmit/i }).first().click();
  await page.waitForURL(/\/submissions\/(week-\d+|[0-9a-f-]{36})/);
  await page.fill('input[name="title"]', title);
  await page.fill('input[name="payload"]', url);
  await page.getByRole("button", { name: /submit|resubmit/i }).click();
  await page.waitForURL(/\/submissions\//);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  return page.url();
}
