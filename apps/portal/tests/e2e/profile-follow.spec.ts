import { test, expect } from "@playwright/test";
import { devLogin, uniqueEmail, completeOnboarding } from "./helpers";

// A real participant who has connected GitHub and has a profile README on
// github.com/<login>/<login>. The portal profile mirrors that README.
const MIRROR_LOGIN = "jamesmurdza";

test.describe("GitHub-mirror profiles + manual follow", () => {
  // The shared Neon instance occasionally times out a cold connection
  // (ETIMEDOUT) — affects any page equally. Retry to absorb that flake.
  test.describe.configure({ retries: 2 });

  test("/users/[login] mirrors the GitHub README and shows a follow control", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto(`/users/${MIRROR_LOGIN}`);

    // Hero identifies the participant. (The rendered README also contains an
    // <h1>, so scope to the first heading — the hero.)
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(
      new RegExp(MIRROR_LOGIN, "i"),
    );
    // The GitHub README renders as the centerpiece (GitHub-styled markdown-body).
    await expect(page.locator(".markdown-body")).toBeVisible({ timeout: 20_000 });
    // Logged-out viewers get a sign-in prompt — never auto-follow, never a live button.
    await expect(
      page.getByRole("link", { name: /sign in to follow/i }),
    ).toBeVisible();
  });

  test("a signed-in viewer without GitHub is prompted to connect before following", async ({
    page,
  }) => {
    await devLogin(page, uniqueEmail("follower"));
    await completeOnboarding(page, `Follower ${Date.now().toString().slice(-5)}`);

    await page.goto(`/users/${MIRROR_LOGIN}`);
    await expect(
      page.getByRole("link", { name: /connect github to follow/i }),
    ).toBeVisible();
  });

  test("/u/[handle] redirects to the canonical /users/[login]", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`/u/${MIRROR_LOGIN}`);
    await expect(page).toHaveURL(new RegExp(`/users/${MIRROR_LOGIN}$`));
  });
});
