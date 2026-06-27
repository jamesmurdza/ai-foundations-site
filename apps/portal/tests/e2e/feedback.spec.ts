import { test, expect } from "@playwright/test";
import { signUp, submitGitHubProfile } from "./helpers";

test("a peer can comment on a submission", async ({ browser }) => {
  // Author ships a project.
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await signUp(pageA, `Author ${Date.now().toString().slice(-5)}`);
  const submissionUrl = await submitGitHubProfile(
    pageA,
    `Proj ${Date.now().toString().slice(-5)}`,
  );

  // A different participant comments on it.
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await signUp(pageB, `Commenter ${Date.now().toString().slice(-5)}`);

  await pageB.goto(submissionUrl);
  await pageB.getByPlaceholder(/Leave a comment/i).fill("Clean and focused — love it.");
  await pageB.getByRole("button", { name: /^Comment$/ }).click();
  await expect(pageB.getByText("Clean and focused — love it.")).toBeVisible();

  await ctxA.close();
  await ctxB.close();
});
