"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@portal/db";
import {
  weeks,
  assignments,
  submissions,
  comments,
  resources,
  qaQuestions,
  announcements,
  users,
  profiles,
} from "@portal/db/schema";
import { requireAdmin } from "@portal/lib/auth";
import { addAdmin, removeAdmin } from "@portal/lib/admins";
import { recordEvent } from "@portal/lib/events";
import { sendEmail, templates } from "@portal/lib/email";
import { assignReviews } from "@portal/lib/matching";
import { triggerStarTrade } from "@portal/lib/background";
import {
  saveBlobAttachmentsFromForm,
  saveBlobRefsFromForm,
  deleteAttachment,
} from "@portal/lib/files";
import { extractMentions } from "@portal/lib/mentions";
import { resolveMentions } from "@portal/lib/queries";

async function participantContacts() {
  return db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(sql`${users.email} is not null and ${users.email} <> ''`);
}

/* ---- Weeks --------------------------------------------------------------- */
export async function createWeek(formData: FormData) {
  await requireAdmin();
  const data = z
    .object({
      number: z.coerce.number().int().min(1).max(52),
      theme: z.string().trim().min(1).max(120),
      description: z.string().trim().max(2000).optional().default(""),
      startsAt: z.string().optional().default(""),
      streamUrl: z.string().trim().max(300).optional().default(""),
    })
    .parse({
      number: formData.get("number"),
      theme: formData.get("theme"),
      description: formData.get("description") ?? "",
      startsAt: formData.get("startsAt") ?? "",
      streamUrl: formData.get("streamUrl") ?? "",
    });

  await db
    .insert(weeks)
    .values({
      number: data.number,
      theme: data.theme,
      description: data.description || null,
      streamUrl: data.streamUrl || null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
    })
    .onConflictDoNothing();
  revalidateTag("weeks", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath("/weeks");
}

export async function updateWeek(formData: FormData) {
  const me = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const isPublished = formData.get("isPublished") === "on";
  await db
    .update(weeks)
    .set({
      theme: String(formData.get("theme") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      streamUrl: String(formData.get("streamUrl") ?? "") || null,
      recordingUrl: String(formData.get("recordingUrl") ?? "") || null,
      isPublished,
    })
    .where(eq(weeks.id, id));
  await saveBlobAttachmentsFromForm(formData, "blobRefs", "week", id, me.id);

  // Publishing weeks can surface new repo posts; backfill auto-stars idempotently.
  if (isPublished) {
    after(() => triggerStarTrade());
  }

  revalidateTag("weeks", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath("/admin/weeks");
  revalidatePath(`/weeks/${id}`);
  revalidatePath("/weeks");
}

export async function setWeekLive(formData: FormData) {
  await requireAdmin();
  const weekId = String(formData.get("weekId") ?? "");
  const live = formData.get("live") === "true";
  if (!weekId) return;

  const [week] = await db.select().from(weeks).where(eq(weeks.id, weekId)).limit(1);
  if (!week) return;

  await db.update(weeks).set({ isLive: live }).where(eq(weeks.id, weekId));

  // Going live is a useful moment to backfill auto-stars. Idempotent via ss_star_grants.
  if (live) after(() => triggerStarTrade());

  if (live) {
    await recordEvent({
      type: "stream_live",
      summary: `🔴 The Week ${week.number} stream — ${week.theme} — is live`,
      weekId,
    });
    const contacts = await participantContacts();
    const t = templates.streamLive(week.theme, weekId);
    after(() =>
      Promise.all(
        contacts
          .filter((c) => c.email)
          .map((c) =>
            sendEmail({
              to: c.email!,
              type: "stream_live",
              subject: t.subject,
              html: t.html,
              userId: c.id,
            }),
          ),
      ),
    );
  }
  revalidateTag("weeks", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath(`/weeks/${weekId}`);
  revalidatePath("/");
}

/* ---- Assignments --------------------------------------------------------- */
export async function createAssignment(formData: FormData) {
  const admin = await requireAdmin();
  const data = z
    .object({
      weekId: z.string().min(1),
      title: z.string().trim().min(1).max(140),
      prompt: z.string().trim().min(1).max(4000),
      submissionType: z.enum(["link", "repo", "file", "text", "any"]),
      deadline: z.string().optional().default(""),
      reviewCount: z.coerce.number().int().min(0).max(10).default(3),
      recurring: z.boolean().optional().default(false),
    })
    .parse({
      weekId: formData.get("weekId"),
      title: formData.get("title"),
      prompt: formData.get("prompt"),
      submissionType: formData.get("submissionType") ?? "link",
      deadline: formData.get("deadline") ?? "",
      reviewCount: formData.get("reviewCount") ?? 3,
      recurring: formData.get("recurring") === "on",
    });

  const [a] = await db
    .insert(assignments)
    .values({
      weekId: data.weekId,
      title: data.title,
      prompt: data.prompt,
      submissionType: data.submissionType,
      deadline: data.deadline ? new Date(data.deadline) : null,
      reviewCount: data.reviewCount,
      recurring: data.recurring,
      createdBy: admin.id,
    })
    .returning();

  await saveBlobAttachmentsFromForm(formData, "blobRefs", "assignment", a.id, admin.id);

  await recordEvent({
    type: "assignment",
    summary: `New assignment posted: "${data.title}"`,
    weekId: data.weekId,
    targetType: "assignment",
    targetId: a.id,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/classwork");
  revalidatePath("/home");
}

/* ---- Engine triggers ----------------------------------------------------- */
export async function runMatchingAction(formData: FormData) {
  await requireAdmin();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) return;
  const [a] = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  await assignReviews(assignmentId, a?.reviewCount);
  revalidatePath("/admin");
  revalidatePath("/feedback");
}

export async function runStarBatchAction() {
  await requireAdmin();
  // Global now — stars every opted-in member's submitted repos across the cohort.
  // Kicks the 15-min background drain (returns immediately; the admin doesn't wait).
  await triggerStarTrade();
  revalidatePath("/admin");
  revalidatePath("/discover");
}

export async function sendWeeklyUpdate(formData: FormData) {
  await requireAdmin();
  const weekId = String(formData.get("weekId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!weekId || !body) return;
  const [week] = await db.select().from(weeks).where(eq(weeks.id, weekId)).limit(1);
  if (!week) return;

  const contacts = await participantContacts();
  const t = templates.weeklyUpdate(week.theme, body.replace(/\n/g, "<br>"), weekId);
  after(() =>
    Promise.all(
      contacts
        .filter((c) => c.email)
        .map((c) =>
          sendEmail({
            to: c.email!,
            type: "weekly_update",
            subject: t.subject,
            html: t.html,
            userId: c.id,
          }),
        ),
    ),
  );
  await recordEvent({
    type: "weekly_update",
    summary: `Weekly update sent for Week ${week.number}`,
    weekId,
  });
  revalidatePath("/admin");
}

export async function sendDeadlineReminders(formData: FormData) {
  await requireAdmin();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) return;
  const [a] = await db
    .select({
      title: assignments.title,
      weekId: assignments.weekId,
      deadline: assignments.deadline,
    })
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);
  if (!a) return;

  const submitted = await db
    .select({ userId: submissions.userId })
    .from(submissions)
    .where(eq(submissions.assignmentId, assignmentId));
  const submittedIds = new Set(submitted.map((s) => s.userId));

  const contacts = await participantContacts();
  const when = a.deadline
    ? new Date(a.deadline).toLocaleDateString()
    : "soon";
  const t = templates.deadlineReminder(a.title, a.weekId, when);
  after(() =>
    Promise.all(
      contacts
        .filter((c) => c.email && !submittedIds.has(c.id))
        .map((c) =>
          sendEmail({
            to: c.email!,
            type: "deadline_reminder",
            subject: t.subject,
            html: t.html,
            userId: c.id,
          }),
        ),
    ),
  );
  revalidatePath("/admin");
}

/* ---- Resources & Q&A ----------------------------------------------------- */
export async function addResource(formData: FormData) {
  const admin = await requireAdmin();
  const weekId = String(formData.get("weekId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!weekId) return;

  // Uploaded files become downloadable resources pointing at the file route.
  const stored = await saveBlobRefsFromForm(formData, "blobRefs", admin.id);
  if (stored.length) {
    await db.insert(resources).values(
      stored.map((f) => ({
        weekId,
        title: stored.length === 1 && title ? title : f.name,
        url: `/api/files/${f.id}`,
        kind: "file",
        createdBy: admin.id,
      })),
    );
  }

  // A link resource (optional — admins can add a link, a file, or both).
  if (title && url) {
    await db.insert(resources).values({
      weekId,
      title,
      url,
      kind: String(formData.get("kind") ?? "link"),
      createdBy: admin.id,
    });
  }

  revalidatePath(`/weeks/${weekId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/weeks");
}

export async function markQuestionAnswered(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("questionId") ?? "");
  const weekId = String(formData.get("weekId") ?? "");
  if (!id) return;
  await db.update(qaQuestions).set({ answered: true }).where(eq(qaQuestions.id, id));
  if (weekId) revalidatePath(`/weeks/${weekId}`);
}

/* ---- Moderation ---------------------------------------------------------- */
export async function deleteSubmission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(comments).where(and(eq(comments.targetType, "submission"), eq(comments.targetId, id)));
  await db.delete(submissions).where(eq(submissions.id, id));
  revalidateTag("showcase", { expire: 0 });
  revalidateTag("stars", { expire: 0 });
  revalidatePath("/showcase");
  revalidatePath("/admin");
}

export async function deleteComment(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const targetType = String(formData.get("targetType") ?? "submission");
  const targetId = String(formData.get("targetId") ?? "");
  if (!id) return;
  await db.delete(comments).where(eq(comments.id, id));
  if (targetType === "submission") revalidatePath(`/submissions/${targetId}`);
  else revalidatePath(`/profiles/${targetId}`);
}

/* ---- Admin allowlist (the founders) -------------------------------------- */
export async function addAdminAction(formData: FormData) {
  const me = await requireAdmin();
  const identifier = String(formData.get("identifier") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || null;
  if (!identifier) return;
  await addAdmin(identifier, name, me.email ?? me.githubLogin ?? "admin");
  // If they already have an account, flip the cached flag now.
  if (identifier.includes("@")) {
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, identifier.toLowerCase()));
  }
  revalidatePath("/admin/team");
}

export async function removeAdminAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!id) return;
  await removeAdmin(id);
  if (email) {
    await db.update(users).set({ isAdmin: false }).where(eq(users.email, email));
  }
  revalidatePath("/admin/team");
}

/* ---- Announcements (the classroom stream) -------------------------------- */
export async function createAnnouncement(formData: FormData) {
  const me = await requireAdmin();
  const data = z
    .object({
      title: z.string().trim().min(1).max(160),
      body: z.string().trim().min(1).max(8000),
      weekId: z.string().optional().default(""),
      emailAll: z.boolean().optional().default(false),
      pinned: z.boolean().optional().default(false),
    })
    .parse({
      title: formData.get("title"),
      body: formData.get("body"),
      weekId: formData.get("weekId") ?? "",
      emailAll: formData.get("emailAll") === "on",
      pinned: formData.get("pinned") === "on",
    });

  const [post] = await db
    .insert(announcements)
    .values({
      title: data.title,
      body: data.body,
      weekId: data.weekId || null,
      pinned: data.pinned,
      authorId: me.id,
      authorName: me.name ?? me.githubLogin ?? "Organizer",
      emailSent: data.emailAll,
    })
    .returning({ id: announcements.id });

  await saveBlobAttachmentsFromForm(formData, "blobRefs", "announcement", post.id, me.id);

  await recordEvent({
    type: "announcement",
    actorId: me.id,
    actorName: me.name ?? me.githubLogin ?? "Organizer",
    summary: `📣 ${me.name ?? "An organizer"} posted: "${data.title}"`,
    weekId: data.weekId || null,
  });

  const t = templates.announcement(data.title, data.body.replace(/\n/g, "<br>"));
  if (data.emailAll) {
    const contacts = await participantContacts();
    after(() =>
      Promise.all(
        contacts
          .filter((c) => c.email)
          .map((c) =>
            sendEmail({
              to: c.email!,
              type: "announcement",
              subject: t.subject,
              html: t.html,
              userId: c.id,
            }),
          ),
      ),
    );
  } else {
    // Not emailing everyone — still ping anyone @mentioned in the post.
    const mentioned = await resolveMentions(extractMentions(data.body));
    if (mentioned.length) {
      after(() =>
        Promise.all(
          mentioned
            .filter((m) => m.email)
            .map((m) =>
              sendEmail({
                to: m.email!,
                type: "announcement",
                subject: `You were mentioned: ${data.title}`,
                html: t.html,
                userId: m.userId,
              }),
            ),
        ),
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath("/home");
  revalidatePath("/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/admin");
  revalidatePath("/home");
}

/* ---- Attachments --------------------------------------------------------- */
export async function removeAttachment(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("attachmentId") ?? "");
  const back = String(formData.get("revalidate") ?? "/admin");
  if (!id) return;
  await deleteAttachment(id);
  revalidatePath(back || "/admin");
}
