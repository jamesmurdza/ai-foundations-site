import { test, expect } from "@playwright/test";
import { signUp } from "./helpers";

test("sign up → onboard → dashboard → directory", async ({ page }) => {
  const name = `Ada ${Date.now().toString().slice(-5)}`;
  await signUp(page, name);
  await expect(
    page.getByRole("heading", { name: /Week 1: Introducing You/i }),
  ).toBeVisible();

  await page.goto("/discover?tab=people");
  await expect(page.getByText(name).first()).toBeVisible();
});

test("submit a GitHub profile from home → confirmation → showcase", async ({ page }) => {
  const name = `Builder ${Date.now().toString().slice(-5)}`;
  await signUp(page, name);

  await page.goto("/home");
  await expect(page.locator("#assignment")).toBeVisible();

  // Step 1 (basics) → step 2 (README) → step 3 (GitWit review + submission).
  await page.getByRole("button", { name: /next/i }).click();
  await page.getByRole("button", { name: /next/i }).click();
  await page.fill('input[name="payload"]', "https://github.com/octocat/octocat");
  await page.getByRole("button", { name: /^submit$/i }).click();
  await page.waitForURL(/\/home\?.*submitted=1/);

  // Submitting swaps the assignment for a congrats screen.
  await expect(page.getByText(/you're all set/i)).toBeVisible();

  await page.goto("/discover?tab=showcase");
  await expect(page.getByText("GitHub profile").first()).toBeVisible();
  await expect(page.getByText("github.com").first()).toBeVisible();
});

test("check-in flips instantly (optimistic) and persists", async ({ page }) => {
  await signUp(page, `Streaker ${Date.now().toString().slice(-5)}`);
  await page.goto("/home");
  const checkIn = page.getByRole("button", { name: /^check in$/i });
  await expect(checkIn).toBeVisible();
  await checkIn.click();
  // Optimistic: the badge appears immediately, before the server confirms.
  await expect(page.getByTestId("checked-in")).toBeVisible();
  // Let the background sync land, then reload to prove it persisted.
  await page.waitForLoadState("networkidle");
  await page.goto("/home");
  await expect(page.getByText(/Checked in today/i)).toBeVisible();
});
