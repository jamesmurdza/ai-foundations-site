import Link from "@portal/components/Link";
import { type ReactNode } from "react";
import { notFound } from "@portal/lib/nav";
import { ClipboardList, MessageSquare, HelpCircle } from "lucide-react";
import { requireOnboardedUser } from "@portal/lib/auth";
import {
  getAssignment,
  getWeek,
  getUserSubmissionForAssignment,
  listResourcesForWeek,
  listComments,
  listMentionablePeople,
  getWeekStepCompletions,
  getCachedGitwitReview,
} from "@portal/lib/queries";
import { listQuestions, listUpvotedQuestionIds } from "@portal/lib/stream";
import { GitHubProfileSteps } from "@portal/components/GitHubProfileSteps";
import { buildGitHubProfileBriefDone } from "@portal/lib/githubProfileChecklist";
import { RepoShowcaseSteps } from "@portal/components/RepoShowcaseSteps";
import { buildRepoShowcaseBriefDone } from "@portal/lib/repoShowcaseChecklist";
import { ContributionSteps } from "@portal/components/ContributionSteps";
import { buildContributionBriefDone } from "@portal/lib/contributionChecklist";
import { PortfolioSteps } from "@portal/components/PortfolioSteps";
import { buildPortfolioBriefDone } from "@portal/lib/portfolioChecklist";
import { TradeStarsCta } from "@portal/components/TradeStarsCta";
import type { Author } from "@portal/lib/queries";
import { createSubmission } from "@portal/lib/actions/submissions";
import { getAttachmentsFor } from "@portal/lib/files";
import { Countdown } from "@portal/components/Countdown";
import { SubmitButton } from "@portal/components/SubmitButton";
import { SubmissionPanel } from "@portal/components/SubmissionPanel";
import { BlobFileInput } from "@portal/components/BlobFileInput";
import { AttachmentList } from "@portal/components/AttachmentList";
import { CommentThread } from "@portal/components/CommentThread";
import { Popover } from "@portal/components/Popover";
import { QaPanel } from "@portal/components/QaPanel";
import { SubmittedCongrats } from "@portal/components/SubmittedCongrats";
import { GitWitReview } from "@portal/components/GitWitReview";
import { loadReadmeForEdit } from "@portal/lib/actions/github-readme";
import { toReviewResult, type CriterionVerdict } from "@portal/lib/gitwitTypes";
import { withBase } from "@portal/lib/paths";

const TYPE_LABEL: Record<string, string> = {
  link: "Paste a link (e.g. your GitHub profile)",
  repo: "Paste your GitHub repo URL",
  file: "Paste a link to your file (or upload below)",
  text: "Write your submission",
  any: "Link, repo URL, or written response",
};

const RESOURCE_ICON: Record<string, string> = {
  video: "🎬",
  file: "📄",
  link: "🔗",
};

/**
 * The focused submit fields the wizard weeks (2-4) hand to WeekWizard: an
 * optional name + the single URL to submit, plus an optional Trade Stars hint
 * (Week 2 only). Kept here so the three weeks share one form instead of three.
 */
function focusedUrlForm(opts: {
  assignmentId: string;
  existingTitle: string | null;
  existingUrl: string | null;
  error?: string;
  titleLabel: string;
  titlePlaceholder: string;
  urlLabel: string;
  urlPlaceholder: string;
  emptyError: string;
  /** Whether the URL field blocks submit when empty. Defaults to required. */
  requiredUrl?: boolean;
  tradeStars?: { checked: boolean };
}): ReactNode {
  const requiredUrl = opts.requiredUrl ?? true;
  return (
    <>
      <input type="hidden" name="assignmentId" value={opts.assignmentId} />
      {opts.error === "empty" && (
        <div className="rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          {opts.emptyError}
        </div>
      )}
      <div>
        <label className="label">{opts.titleLabel}</label>
        <input
          className="input"
          name="title"
          defaultValue={opts.existingTitle ?? ""}
          placeholder={opts.titlePlaceholder}
        />
      </div>
      <div>
        <label className="label">{opts.urlLabel}</label>
        <input
          className="input"
          name="payload"
          type="url"
          required={requiredUrl}
          placeholder={opts.urlPlaceholder}
          defaultValue={opts.existingUrl ?? ""}
        />
      </div>
      {opts.tradeStars && <TradeStarsCheckbox defaultChecked={opts.tradeStars.checked} />}
    </>
  );
}

/**
 * The single "trade stars" control in a submission form: a checkbox, on by
 * default for new submissions and pre-set to whatever the builder chose last
 * time when editing. Submitting the form saves the choice as their preference.
 * The hidden companion field lets the server tell an unchecked box (off) apart
 * from a form that has no control at all.
 */
function TradeStarsCheckbox({ defaultChecked }: { defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer text-[14px] rounded-2xl bg-ice-tint p-3">
      <input type="hidden" name="tradeStarsPresent" value="1" />
      <input
        type="checkbox"
        name="tradeStars"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary cursor-pointer"
      />
      <span className="meta">
        Trade stars with the cohort ⭐ — everyone who opts in stars each
        other&apos;s repos, including yours.
      </span>
    </label>
  );
}

/** Embeddable assignment workspace — single vertical flow for the homepage. */
export async function AssignmentWorkSection({
  assignmentId,
  error,
  submitted,
  edit,
  step,
}: {
  assignmentId: string;
  error?: string;
  submitted?: boolean;
  edit?: boolean;
  /** Which Week 1 flow page to open on — used to restore position after saving
   *  the README (a full navigation resets the wizard's client state otherwise). */
  step?: number;
}) {
  const { user, profile } = await requireOnboardedUser();
  const assignment = await getAssignment(assignmentId);
  if (!assignment) notFound();

  const [
    week,
    existing,
    assignmentFiles,
    resources,
    stepCompletions,
    questions,
    upvotedIds,
    people,
  ] = await Promise.all([
    getWeek(assignment.weekId),
    getUserSubmissionForAssignment(assignment.id, user.id),
    getAttachmentsFor("assignment", assignment.id),
    listResourcesForWeek(assignment.weekId),
    getWeekStepCompletions(user.id, assignment.weekId),
    listQuestions(assignment.weekId),
    listUpvotedQuestionIds(assignment.weekId, user.id),
    listMentionablePeople(),
  ]);
  const isGitHubProfileWeek = week?.number === 1;
  const isRepoShowcaseWeek = week?.number === 2;
  const isContributionWeek = week?.number === 3;
  const isPortfolioWeek = week?.number === 4;
  // Every program week replaces the standard submission panel with a guided
  // two-page wizard; treat them together where the surrounding chrome is shared.
  const isWizardWeek =
    isGitHubProfileWeek ||
    isRepoShowcaseWeek ||
    isContributionWeek ||
    isPortfolioWeek;
  const profileBriefDone = isGitHubProfileWeek
    ? buildGitHubProfileBriefDone(stepCompletions)
    : {};
  const repoBriefDone = isRepoShowcaseWeek
    ? buildRepoShowcaseBriefDone(stepCompletions)
    : {};
  const contributionBriefDone = isContributionWeek
    ? buildContributionBriefDone(stepCompletions)
    : {};
  const portfolioBriefDone = isPortfolioWeek
    ? buildPortfolioBriefDone(stepCompletions)
    : {};
  const comments = existing ? await listComments("submission", existing.id) : [];

  // Week 1 extras: the embedded README editor + the automatic GitWit review.
  const githubConnected = Boolean(
    user.githubId &&
      !String(user.githubId).startsWith("dev:") &&
      user.githubLogin &&
      user.accessToken,
  );
  const profileUrl = user.githubLogin
    ? `https://github.com/${user.githubLogin}`
    : "";
  const [readme, cachedReview] = isGitHubProfileWeek
    ? await Promise.all([
        githubConnected
          ? loadReadmeForEdit(user.githubLogin!, user.accessToken!)
          : Promise.resolve(null),
        getCachedGitwitReview(user.id),
      ])
    : [null, null];
  const gitwitInitial = cachedReview
    ? toReviewResult(
        cachedReview.login,
        cachedReview.verdicts as CriterionVerdict[],
        cachedReview.updatedAt.toISOString(),
      )
    : null;
  // Saving the README doubles as "continue" — it advances to the feedback page.
  // The editor itself is rendered inside the (client) flow so Back is instant
  // client nav; here we only supply its data + a connect-GitHub fallback.
  const readmeReturnTo = `/home?week=${assignment.weekId}&step=4${
    edit ? "&edit=1" : ""
  }#assignment`;
  const readmeEditorProps =
    githubConnected && readme
      ? {
          login: user.githubLogin!,
          initialMarkdown: readme.markdown,
          hasExisting: readme.hasExisting,
          returnTo: readmeReturnTo,
        }
      : null;
  const readmeFallback = (
    <div className="rounded-[12px] border border-sea-fog p-4">
      <p className="meta text-[14px]">
        Connect your GitHub account to write and sync your profile README here.
      </p>
      <a href={withBase("/api/auth/github")} className="btn btn-dark mt-3">
        Connect GitHub
      </a>
    </div>
  );

  const currentUser: Author = {
    userId: user.id,
    name: profile.displayName ?? user.name ?? "You",
    login: user.githubLogin,
    avatarUrl: user.avatarUrl,
    profileId: profile.id,
    country: profile.country,
  };

  const canTrade =
    assignment.submissionType === "repo" ||
    assignment.submissionType === "link" ||
    assignment.submissionType === "any";
  const isFile = assignment.submissionType === "file";
  const isAny = assignment.submissionType === "any";
  const isText = assignment.submissionType === "text";
  const usesTextarea = isText || isAny;
  const showAssignmentSummary = !isWizardWeek;

  // Comments (on your submission) and the week's Q&A live in header popovers.
  const actions = (
    <>
      {existing && (
        <Popover
          icon={<MessageSquare size={19} aria-hidden />}
          label="Comments"
          count={comments.length}
          width={380}
        >
          <CommentThread
            targetType="submission"
            targetId={existing.id}
            comments={comments}
            canComment
            currentUser={currentUser}
            people={people}
            compact
          />
        </Popover>
      )}
      <Popover
        icon={<HelpCircle size={19} aria-hidden />}
        label="Questions"
        count={questions.length}
        width={380}
      >
        <QaPanel
          weekId={assignment.weekId}
          initial={questions}
          isAdmin={user.isAdmin}
          people={people}
          upvotedIds={upvotedIds}
        />
      </Popover>
    </>
  );

  const formFields = (
    <>
      <input type="hidden" name="assignmentId" value={assignment.id} />
      {isGitHubProfileWeek && (
        <>
          {/* Login is already known — no URL to paste. */}
          <input type="hidden" name="title" value="GitHub profile" />
          <input type="hidden" name="payload" value={profileUrl} />
        </>
      )}
      {!isGitHubProfileWeek && (
        <h3 className="font-bold text-[15px]">
          {existing ? "Update your work" : "Submit your work"}
        </h3>
      )}

      {error === "empty" && !isGitHubProfileWeek && (
        <div className="rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          {isAny
            ? "Add a link, write something, or upload a file before submitting."
            : "Add a link or upload a file before submitting."}
        </div>
      )}

      {!isGitHubProfileWeek && (
        <div>
          <label className="label">Title (optional)</label>
          <input
            className="input"
            name="title"
            defaultValue={existing?.title ?? ""}
            placeholder="Give it a name"
          />
        </div>
      )}

      {!isGitHubProfileWeek && (
        <div>
          <label className="label">
            {TYPE_LABEL[assignment.submissionType] ?? "Your submission"}
            {isAny && (
              <span className="meta font-normal"> (optional if uploading a file)</span>
            )}
          </label>
          {usesTextarea ? (
            <textarea
              className="textarea"
              name="payload"
              rows={5}
              required={isText}
              placeholder={
                isAny
                  ? "https://github.com/you/project — or describe what you shipped"
                  : undefined
              }
              defaultValue={existing?.payload ?? ""}
            />
          ) : (
            <input
              className="input"
              name="payload"
              type="url"
              required={!isFile}
              placeholder="https://…"
              defaultValue={
                existing && !existing.payload.startsWith("/api/files/")
                  ? existing.payload
                  : ""
              }
            />
          )}
        </div>
      )}

      {!isGitHubProfileWeek && (
        <BlobFileInput
          label={
            isFile
              ? "Upload your file(s)"
              : isAny
                ? "Upload a file (optional)"
                : "Attach files (optional)"
          }
          hint={
            isFile
              ? "Upload your work directly, or paste a link above. Big files are fine."
              : isAny
                ? "Submit a link, write a response, or upload a file — any format works."
                : "Add supporting files reviewers can download — any type, big files OK."
          }
        />
      )}

      {!isGitHubProfileWeek && (
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="textarea"
            name="notes"
            rows={2}
            defaultValue={existing?.notes ?? ""}
          />
        </div>
      )}

      {!isGitHubProfileWeek && canTrade && (
        <TradeStarsCheckbox
          defaultChecked={existing ? existing.tradeStars : true}
        />
      )}

    </>
  );

  // The wizard weeks (2-4) each submit a single URL through a focused form.
  const wizardUrl =
    existing && !existing.payload.startsWith("/api/files/")
      ? existing.payload
      : null;
  const repoFormFields = focusedUrlForm({
    assignmentId: assignment.id,
    existingTitle: existing?.title ?? null,
    existingUrl: wizardUrl,
    error,
    titleLabel: "Project name (optional)",
    titlePlaceholder: "What's it called?",
    urlLabel: "Paste the GitHub repo you want to showcase",
    urlPlaceholder: "https://github.com/you/project",
    emptyError: "Paste the GitHub repo you want to showcase before submitting.",
    tradeStars: { checked: existing ? existing.tradeStars : true },
  });
  const prFormFields = focusedUrlForm({
    assignmentId: assignment.id,
    existingTitle: existing?.title ?? null,
    existingUrl: wizardUrl,
    error,
    titleLabel: "What did you contribute? (optional)",
    titlePlaceholder: "e.g. Fixed a broken link in the docs",
    urlLabel: "Paste the link to your pull request",
    urlPlaceholder: "https://github.com/owner/repo/pull/123",
    emptyError: "Paste your pull request link before submitting.",
    // The contribution flow presents the form like a required step, but the
    // second contribution is optional — so the field doesn't block submit.
    requiredUrl: false,
  });
  const portfolioFormFields = focusedUrlForm({
    assignmentId: assignment.id,
    existingTitle: existing?.title ?? null,
    existingUrl: wizardUrl,
    error,
    titleLabel: "Portfolio name (optional)",
    titlePlaceholder: "e.g. Jane Doe — Developer",
    urlLabel: "Paste your portfolio link",
    urlPlaceholder: "https://your-portfolio.com",
    emptyError: "Paste your portfolio link before submitting.",
  });

  // Non-wizard weeks submit through the standard panel below; the wizard weeks
  // hand the fields + action to the two-step wizard, which adds Back/Submit.
  const form = (
    <form action={createSubmission} className="space-y-4">
      {formFields}
      <SubmitButton className="btn btn-primary w-full">
        {existing ? "Save changes" : "Submit →"}
      </SubmitButton>
    </form>
  );

  // Once the GitHub profile is in, swap the whole flow for a congrats screen.
  // "Edit submission" (?edit=1) re-renders the full page instead.
  if (isGitHubProfileWeek && existing && !edit) {
    return (
      <section id="assignment" className="mt-2 scroll-mt-24">
        <SubmittedCongrats
          showcaseHref="/discover?tab=showcase"
          editHref={`/home?week=${assignment.weekId}&edit=1`}
        />
      </section>
    );
  }

  // Same shape for Week 2: once the repo is in, swap to a congrats screen — but
  // the post-submit action is starring the cohort (Trade Stars), not GitWit.
  if (isRepoShowcaseWeek && existing && !edit) {
    return (
      <section id="assignment" className="mt-2 scroll-mt-24">
        <SubmittedCongrats
          showcaseHref="/discover?tab=showcase"
          editHref={`/home?week=${assignment.weekId}&edit=1`}
          title="Your project's in the showcase!"
          message="Nice work — your repo's up. This week, support the cohort too:"
        />
        <div className="mx-auto mt-6 max-w-[44ch] space-y-4 text-center">
          <p className="meta">
            <span className="font-semibold text-foreground">Give feedback</span> on
            a few peers&apos; profiles —{" "}
            <Link href="/discover?tab=people" className="link">
              browse the cohort
            </Link>
          </p>
          <TradeStarsCta
            submissionId={existing.id}
            enabled={profile.tradeStarsEnabled}
          />
        </div>
      </section>
    );
  }

  // Week 3: PR shipped → close the loop by reviewing a peer's PR.
  if (isContributionWeek && existing && !edit) {
    return (
      <section id="assignment" className="mt-2 scroll-mt-24">
        <SubmittedCongrats
          showcaseHref="/discover?tab=showcase"
          editHref={`/home?week=${assignment.weekId}&edit=1`}
          title="Pull request shipped!"
          message="Nice — your PR's in. Close the loop with the cohort:"
        />
        <p className="meta mx-auto mt-6 max-w-[44ch] text-center">
          <span className="font-semibold text-foreground">
            Review a peer&apos;s PR
          </span>{" "}
          — kind, specific feedback goes a long way.{" "}
          <Link href="/discover?tab=showcase" className="link">
            browse the showcase
          </Link>
        </p>
      </section>
    );
  }

  // Week 4: portfolio in → the program's recurring action, profile feedback.
  if (isPortfolioWeek && existing && !edit) {
    return (
      <section id="assignment" className="mt-2 scroll-mt-24">
        <SubmittedCongrats
          showcaseHref="/discover?tab=showcase"
          editHref={`/home?week=${assignment.weekId}&edit=1`}
          title="Portfolio submitted — that's the program!"
          message="Beautiful work. One last thing to send the cohort off:"
        />
        <p className="meta mx-auto mt-6 max-w-[44ch] text-center">
          <span className="font-semibold text-foreground">Give feedback</span> on
          a few peers&apos; profiles —{" "}
          <Link href="/discover?tab=people" className="link">
            browse the cohort
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section id="assignment" className="mt-2 scroll-mt-24 space-y-6">
      {submitted && (
        <div className="rounded-[11px] bg-primary-soft text-primary-strong text-[14px] px-4 py-3">
          Submission saved — you&apos;re all set for this week.
        </div>
      )}

      {isGitHubProfileWeek && (
        <GitHubProfileSteps
          weekId={assignment.weekId}
          weekLabel={week ? `Week ${week.number}: ${week.theme}` : undefined}
          done={profileBriefDone}
          actions={actions}
          formFields={formFields}
          review={<GitWitReview initial={gitwitInitial} />}
          readmeEditorProps={readmeEditorProps}
          readmeFallback={readmeFallback}
          submitAction={createSubmission}
          initialStep={step ?? 1}
        />
      )}

      {isRepoShowcaseWeek && (
        <RepoShowcaseSteps
          weekId={assignment.weekId}
          done={repoBriefDone}
          actions={actions}
          formFields={repoFormFields}
          submitAction={createSubmission}
        />
      )}

      {isContributionWeek && (
        <ContributionSteps
          weekId={assignment.weekId}
          done={contributionBriefDone}
          actions={actions}
          formFields={prFormFields}
          submitAction={createSubmission}
        />
      )}

      {isPortfolioWeek && (
        <PortfolioSteps
          weekId={assignment.weekId}
          done={portfolioBriefDone}
          actions={actions}
          formFields={portfolioFormFields}
          submitAction={createSubmission}
        />
      )}

      {showAssignmentSummary && (
        <div className="card !p-7">
          <div className="flex items-start gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-full bg-primary-soft text-primary-strong shrink-0">
              <ClipboardList size={22} aria-hidden />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-heading-lg leading-tight">{assignment.title}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 meta text-[14px]">
                {week && (
                  <span>
                    Week {week.number} · {week.theme}
                  </span>
                )}
                {assignment.deadline && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      Due{" "}
                      {new Date(assignment.deadline).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
            {assignment.deadline && (
              <Countdown deadline={new Date(assignment.deadline).toISOString()} />
            )}
            <div className="flex items-center gap-1 shrink-0">{actions}</div>
          </div>

          <div className="hairline my-5" />

          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
            {assignment.prompt}
          </p>

          {assignmentFiles.length > 0 && (
            <div className="mt-5">
              <AttachmentList items={assignmentFiles} title="Attachments" />
            </div>
          )}
        </div>
      )}

      {isWizardWeek && assignmentFiles.length > 0 && (
        <div className="card">
          <AttachmentList items={assignmentFiles} title="Files for this step" />
        </div>
      )}

      {!isWizardWeek && <SubmissionPanel form={form} heading="Your work" />}

      {resources.length > 0 && (
        <div className="card">
          <h2 className="text-[20px] mb-3">📂 Resources &amp; materials</h2>
          <ul className="space-y-2">
            {resources.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target={r.kind === "file" ? undefined : "_blank"}
                  rel="noreferrer"
                  download={r.kind === "file" ? true : undefined}
                  className="link"
                >
                  {RESOURCE_ICON[r.kind] ?? "🔗"} {r.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
