import { test, expect, type Page } from "@playwright/test";
import { adminLogin, signUp, tinyFile } from "./helpers";

// Files now upload straight to Vercel Blob from the browser, so these tests need
// a real Blob store (BLOB_READ_WRITE_TOKEN). They skip cleanly without one.
const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Pick files into the Blob uploader and wait for the "uploaded ✓" state. */
async function uploadViaBlob(
  page: Page,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  await page
    .locator('[data-testid="blob-file-input"]')
    .first()
    .setInputFiles(file);
  await expect(page.getByText("uploaded ✓").first()).toBeVisible({
    timeout: 30_000,
  });
}

/** Read the first attachment chip's href and assert the bytes round-trip.
 * Playwright's request context follows the Blob redirect, so we check the final
 * 200 + bytes (the Content-Disposition is Blob's, not ours, once redirected). */
async function expectDownloadable(page: Page, expectedContent: string) {
  const link = page.getByTestId("attachment-download").first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href, "attachment href").toBeTruthy();

  const res = await page.request.get(href!);
  expect(res.status(), "download status").toBe(200);
  expect(await res.text()).toBe(expectedContent);
  return href!;
}

test("admin attaches a doc to an assignment; a student downloads it", async ({
  page,
}) => {
  test.skip(!hasBlob, "file uploads use Vercel Blob — set BLOB_READ_WRITE_TOKEN");
  const stamp = Date.now().toString().slice(-6);
  const file = tinyFile(`assignment-brief-${stamp}.txt`, `brief-${stamp}`);

  await adminLogin(page);
  await page.goto("/admin/classwork");

  await page.selectOption('select[name="weekId"]', { index: 0 });
  const title = `Doc assignment ${stamp}`;
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="prompt"]', "Download the brief and ship it.");
  await uploadViaBlob(page, {
    name: file.name,
    mimeType: file.mimeType,
    buffer: file.buffer,
  });
  await page.getByRole("button", { name: /post assignment/i }).click();

  // The new assignment shows in the list with its download chip.
  await expect(page.getByText(file.name).first()).toBeVisible();

  // Open the assignment; the admin-provided file is downloadable (testid chip).
  await page.getByRole("link", { name: title }).first().click();
  await page.waitForURL(/\/assignments\//);
  const assignmentUrl = page.url();
  await expect(page.getByText("Assignment files")).toBeVisible();
  const href = await expectDownloadable(page, file.content);

  // A brand-new student sees the same downloadable doc on the assignment page.
  await signUp(page, `Learner ${stamp}`);
  await page.goto(assignmentUrl);
  await expect(page.getByText("Assignment files")).toBeVisible();
  const studentRes = await page.request.get(href);
  expect(studentRes.status()).toBe(200);
  expect(await studentRes.text()).toBe(file.content);
});

test("admin attaches a doc to an announcement; it downloads from the dashboard", async ({
  page,
}) => {
  const stamp = Date.now().toString().slice(-6);
  const file = tinyFile(`handout-${stamp}.txt`, `handout-${stamp}`);

  test.skip(!hasBlob, "file uploads use Vercel Blob — set BLOB_READ_WRITE_TOKEN");
  await adminLogin(page);
  await page.goto("/admin");
  const title = `Heads up ${stamp}`;
  await page.fill('input[name="title"]', title);
  await page.fill('textarea[name="body"]', "Grab the handout below.");
  await uploadViaBlob(page, {
    name: file.name,
    mimeType: file.mimeType,
    buffer: file.buffer,
  });
  await page.getByRole("button", { name: /post to stream/i }).click();
  await expect(page.getByText(file.name).first()).toBeVisible();

  // Student sees the announcement + downloads the file from their dashboard.
  await signUp(page, `Reader ${stamp}`);
  await page.goto("/home");
  await expect(page.getByText(title).first()).toBeVisible();
  await expectDownloadable(page, file.content);
});

test("admin adds week materials; students download them on the week page", async ({
  page,
}) => {
  const stamp = Date.now().toString().slice(-6);
  const file = tinyFile(`slides-${stamp}.txt`, `slides-${stamp}`);

  test.skip(!hasBlob, "file uploads use Vercel Blob — set BLOB_READ_WRITE_TOKEN");
  await adminLogin(page);
  await page.goto("/admin/weeks");

  // Attach to the first week's update form, capture its id, then Save.
  const weekId = await page.locator('input[name="id"]').first().getAttribute("value");
  expect(weekId).toBeTruthy();
  await uploadViaBlob(page, {
    name: file.name,
    mimeType: file.mimeType,
    buffer: file.buffer,
  });
  await page.getByRole("button", { name: /^save$/i }).first().click();
  await expect(page.getByText(file.name).first()).toBeVisible();

  // A student opens the week and finds the Materials download.
  await signUp(page, `WeekViewer ${stamp}`);
  await page.goto(`/weeks/${weekId}`);
  await expect(page.getByText("Materials")).toBeVisible();
  await expectDownloadable(page, file.content);
});

test("download route 404s unknown ids", async ({ request }) => {
  const res = await request.get("/api/files/does-not-exist-123");
  expect(res.status()).toBe(404);
});

test("week 1 submission only asks for a README link", async ({ page }) => {
  const stamp = Date.now().toString().slice(-6);

  await signUp(page, `ReadmeOnly ${stamp}`);
  await page.goto("/home");
  await expect(page.locator("#assignment")).toBeVisible();

  await expect(page.getByText(/Step 2: Submit your GitHub README link/i)).toBeVisible();
  await expect(page.locator('input[name="payload"]')).toBeVisible();
  await expect(page.locator('input[name="title"][type="hidden"]')).toHaveValue(
    "GitHub README",
  );
  await expect(page.getByText(/attach files|upload a file|notes/i)).toHaveCount(0);

  await page.fill('input[name="payload"]', "https://github.com/octocat/octocat");
  await page.getByRole("button", { name: /submit readme link/i }).click();
  await page.waitForURL(/\/home\?.*submitted=1/);

  await expect(page.getByText(/submission saved/i)).toBeVisible();
});
