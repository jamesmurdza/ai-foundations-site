import { test, expect } from "@playwright/test";

test("landing page is the sign-in card", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /^Sign in$/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Email me a code/i })).toBeVisible();
});

test("public pages load", async ({ page }) => {
  for (const path of [
    "/discover?tab=showcase",
    "/discover?tab=activity",
    "/discover?tab=people",
  ]) {
    const res = await page.goto(path);
    expect(res?.status(), `status for ${path}`).toBeLessThan(400);
  }
  await expect(page.getByRole("heading", { name: /^Discover$/ })).toBeVisible();
});

test("login page offers email code + dev login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Email me a code/i })).toBeVisible();
  await expect(page.getByTestId("dev-email")).toBeVisible();
});

test("email code flow advances to the code step", async ({ page }) => {
  await page.goto("/login");
  await page.locator('input[name="email"]').first().fill("nobody@example.com");
  await page.getByRole("button", { name: /Email me a code/i }).click();
  await page.waitForURL(/step=code/);
  await expect(page.getByRole("heading", { name: /Check your email/i })).toBeVisible();
});

test("API: key routes respond", async ({ request }) => {
  for (const path of ["/", "/discover?tab=showcase", "/discover?tab=activity"]) {
    const res = await request.get(path);
    expect(res.ok(), `ok for ${path}`).toBeTruthy();
  }
});

test("protected route redirects to login", async ({ page }) => {
  await page.goto("/home");
  await page.waitForURL(/\/login/);
  await expect(page.getByRole("button", { name: /Email me a code/i })).toBeVisible();
});
