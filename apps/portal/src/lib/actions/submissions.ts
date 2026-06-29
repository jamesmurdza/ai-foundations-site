"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { submissions, assignments, attachments, profiles, starGrants } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/auth";
import { getUserSubmissionForAssignment, getWeek } from "@/lib/queries";
import { weekAssignmentHomePath } from "@/lib/weekRoutes";
import { recordEvent } from "@/lib/events";
import { sendEmail, templates } from "@/lib/email";
import { parseRepo, deriveRepoRef, starRepo, unstarRepo } from "@/lib/github";
import { canEnableTradeStars } from "@/lib/tradeStars";
import { saveBlobRefsFromForm } from "@/lib/files";
import { runStarTrade, autoStarActive } from "@/lib/startrade";

const schema = z.object({
  assignmentId: z.string().min(1),
  title: z.string().trim().max(140).optional().default(""),
  payload: z.string().trim().max(4000).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

function inferPayloadType(payload: string): "link" | "repo" | "file" | "text" {
  if (payload.startsWith("/api/files/")) return "file";
  if (parseRepo(payload)) return "repo";
  if (/^https?:\/\//i.test(payload.trim())) return "link";
  return "text";
}

export async function createSubmission(formData: FormData) {
  const { user, profile } = await requireOnboardedUser();
  const data = schema.parse({
    assignmentId: formData.get("assignmentId") ?? "",
    title: formData.get("title") ?? "",
    payload: formData.get("payload") ?? "",
    notes: formData.get("notes") ?? "",
  });
  const [assignment] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, data.assignmentId))
    .limit(1);
  if (!assignment) redirect("/home");
  const assignmentWeek = await getWeek(assignment.weekId);

  // The submission form carries a single "trade stars" checkbox (on by default;
  // pre-set to their last choice when editing). When it's present, submitting
  // saves the builder's global preference. The hidden companion field tells an
  // unchecked box (off) apart from a form with no control. Week 1 is usually a
  // GitHub README/profile link only, so it never trades stars.
  const tradeStarsFieldPresent = formData.get("tradeStarsPresent") === "1";
  const tradeStarsChecked =
    formData.get("tradeStars") === "on" || formData.get("tradeStars") === "true";
  let tradeStars: boolean;
  if (assignmentWeek?.number === 1) {
    tradeStars = false;
  } else if (tradeStarsFieldPresent) {
    const optIn = tradeStarsChecked && canEnableTradeStars(user);
    if (optIn !== profile.tradeStarsEnabled) {
      await db
        .update(profiles)
        .set({ tradeStarsEnabled: optIn, updatedAt: new Date() })
        .where(eq(profiles.userId, user.id));
      if (optIn && (await autoStarActive())) after(() => runStarTrade());
    }
    tradeStars = optIn;
  } else {
    tradeStars = profile.tradeStarsEnabled;
  }

  // One submission per assignment per user: a resubmit EDITS the existing one.
  const existing = await getUserSubmissionForAssignment(data.assignmentId, user.id);

  // Students can upload files (or paste a link). A file upload satisfies a
  // "file" assignment even with no link pasted. Files come from Vercel Blob.
  const stored = await saveBlobRefsFromForm(formData, "blobRefs", user.id);
  let payload = data.payload;
  let payloadType =
    assignment.submissionType === "any" ? "text" : assignment.submissionType;
  if (!payload && stored.length) {
    payload = `/api/files/${stored[0].id}`;
    payloadType = "file";
  }
  // Editing without changing the link/file keeps what's already there.
  if (!payload && existing) {
    payload = existing.payload;
    payloadType = existing.payloadType;
  }
  if (!payload) {
    const path = assignmentWeek
      ? weekAssignmentHomePath(assignmentWeek.id, { error: "empty" })
      : "/home";
    redirect(path);
  }
  if (assignment.submissionType === "any") {
    payloadType = inferPayloadType(payload);
  }

  // Any GitHub link is starrable — a repo link → that repo; a Week 1 profile
  // link (github.com/<login>) → the profile README repo <login>/<login>.
  const repo = deriveRepoRef(payload);
  const fields = {
    title: data.title || null,
    payload,
    payloadType,
    notes: data.notes || null,
    tradeStars,
    repoOwner: repo?.owner ?? null,
    repoName: repo?.repo ?? null,
  };

  const [submission] = existing
    ? await db
        .update(submissions)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(submissions.id, existing.id))
        .returning()
    : await db
        .insert(submissions)
        .values({ assignmentId: data.assignmentId, userId: user.id, ...fields })
        .returning();

  // Append any newly uploaded files to the submission.
  if (stored.length) {
    await db.insert(attachments).values(
      stored.map((f) => ({
        fileId: f.id,
        targetType: "submission" as const,
        targetId: submission.id,
      })),
    );
  }

  // Announce only on the FIRST submission, not on edits. Peer compliments are
  // pull-based — surfaced on Discover when people show up to give them — so
  // nothing is assigned here.
  if (!existing) {
    await recordEvent({
      type: "submission",
      actorId: user.id,
      actorName: user.name ?? user.githubLogin ?? "Someone",
      summary: `${user.name ?? user.githubLogin} submitted to "${assignment.title}"`,
      targetType: "submission",
      targetId: submission.id,
      weekId: assignment.weekId,
    });
    if (user.email) {
      const email = user.email;
      const t = templates.submissionReceived(assignment.title, submission.id);
      after(() =>
        sendEmail({
          to: email,
          type: "submission_received",
          subject: t.subject,
          html: t.html,
          userId: user.id,
        }),
      );
    }
  }

  // Real-time auto-stars: any repo submission (new or edited) gets starred by
  // everyone who has opted in and connected GitHub. Deduped via ss_star_grants,
  // so re-running is cheap and only genuinely new stars count.
  if (repo && (await autoStarActive())) {
    after(() => runStarTrade());
  }

  revalidateTag("showcase", { expire: 0 });
  revalidatePath("/showcase");
  revalidatePath("/submissions");
  revalidatePath("/home");
  const path = assignmentWeek
    ? weekAssignmentHomePath(assignmentWeek.id, { submitted: true })
    : "/home#assignment";
  redirect(path);
}

export async function setStarTrade(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const submissionId = String(formData.get("submissionId") ?? "");
  // Only a GitHub-connected account can opt IN (opting out always allowed).
  const optIn = formData.get("optIn") === "true" && canEnableTradeStars(user);

  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, user.id)))
    .limit(1);
  if (!submission) return;

  // Trade Stars is a global per-profile choice. Flip the flag (and sync this
  // submission's display badge); when turning it on, run the trade so it takes
  // effect immediately.
  await db
    .update(profiles)
    .set({ tradeStarsEnabled: optIn, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  await db
    .update(submissions)
    .set({ tradeStars: optIn })
    .where(eq(submissions.id, submissionId));

  // Opting in kicks off an idempotent backfill of existing repo posts.
  if (optIn && (await autoStarActive())) after(() => runStarTrade());

  // The trade-stars badge shows in the showcase feed; the flag lives on the profile.
  revalidateTag("profiles", { expire: 0 });
  revalidateTag("showcase", { expire: 0 });
  revalidatePath(`/submissions/${submissionId}`);
}

/**
 * Feed "like" = a real GitHub star on the post's repo, by the viewer. Members
 * with auto Trade Stars on arrive with filled hearts for repo posts.
 * Needs the viewer's GitHub connected; no-op on own posts or non-repo posts.
 */
export async function likeSubmission(formData: FormData) {
  const { user } = await requireOnboardedUser();
  if (!user.accessToken) return;
  const submissionId = String(formData.get("submissionId") ?? "");
  if (!submissionId) return;

  const [sub] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);
  if (!sub || !sub.repoOwner || !sub.repoName || sub.userId === user.id) return;

  const res = await starRepo(user.accessToken, sub.repoOwner, sub.repoName);

  await db
    .insert(starGrants)
    .values({
      fromUserId: user.id,
      toUserId: sub.userId,
      kind: "star",
      repoOwner: sub.repoOwner,
      repoName: sub.repoName,
      ok: res.ok,
      error: res.ok ? null : res.error ?? null,
    })
    .onConflictDoUpdate({
      target: [starGrants.fromUserId, starGrants.repoOwner, starGrants.repoName],
      set: { toUserId: sub.userId, ok: res.ok, error: res.ok ? null : res.error ?? null },
    });

  if (res.ok) {
    revalidateTag("stars", { expire: 0 });
    revalidateTag("showcase", { expire: 0 });
    revalidatePath("/discover");
  }
}

export async function unlikeSubmission(formData: FormData) {
  const { user } = await requireOnboardedUser();
  if (!user.accessToken) return;
  const submissionId = String(formData.get("submissionId") ?? "");
  if (!submissionId) return;

  const [sub] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, submissionId))
    .limit(1);
  if (!sub || !sub.repoOwner || !sub.repoName || sub.userId === user.id) return;

  const res = await unstarRepo(user.accessToken, sub.repoOwner, sub.repoName);
  if (!res.ok) return;

  await db
    .insert(starGrants)
    .values({
      fromUserId: user.id,
      toUserId: sub.userId,
      kind: "star",
      repoOwner: sub.repoOwner,
      repoName: sub.repoName,
      ok: false,
      error: "manual_unstar",
    })
    .onConflictDoUpdate({
      target: [starGrants.fromUserId, starGrants.repoOwner, starGrants.repoName],
      set: { toUserId: sub.userId, ok: false, error: "manual_unstar" },
    });

  revalidateTag("stars", { expire: 0 });
  revalidateTag("showcase", { expire: 0 });
  revalidatePath("/discover");
}
