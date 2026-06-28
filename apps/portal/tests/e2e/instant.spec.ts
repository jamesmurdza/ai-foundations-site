import { test, expect } from "@playwright/test";
import { signUp } from "./helpers";

test("mobile nav: hamburger opens the menu and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");

  // Desktop links are hidden; the hamburger is the way in.
  const button = page.getByTestId("mobile-menu-button");
  await expect(button).toBeVisible();
  await button.click();

  const panel = page.getByTestId("mobile-menu-panel");
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: "Discover" }).click();
  await expect(page).toHaveURL(/\/discover/);
});

test("comment draft is saved to the browser and restored after reload", async ({
  page,
}) => {
  const stamp = Date.now().toString().slice(-6);
  await signUp(page, `Drafter ${stamp}`);

  // Go to own profile, which has a comment box.
  await page.goto("/home");
  await page.getByRole("link", { name: /view profile/i }).click();
  await page.waitForURL(/\/profiles\//);

  const draft = `Draft note ${stamp}`;
  const box = page.getByPlaceholder(/Leave a comment/i);
  await box.fill(draft);

  // Reload: the unsent text must still be there (saved locally, not the server).
  await page.reload();
  await expect(page.getByPlaceholder(/Leave a comment/i)).toHaveValue(draft);
});

test("optimistic comment appears instantly on a profile", async ({ page }) => {
  const stamp = Date.now().toString().slice(-6);
  await signUp(page, `Chatter ${stamp}`);
  await page.goto("/home");
  await page.getByRole("link", { name: /view profile/i }).click();
  await page.waitForURL(/\/profiles\//);

  const text = `Instant comment ${stamp}`;
  await page.getByPlaceholder(/Leave a comment/i).fill(text);
  await page.getByRole("button", { name: /^Comment$/ }).click();
  // No reload — the optimistic update shows it right away.
  await expect(page.getByText(text)).toBeVisible();
  // The box clears after sending.
  await expect(page.getByPlaceholder(/Leave a comment/i)).toHaveValue("");
});
