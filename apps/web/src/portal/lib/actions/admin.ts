"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@portal/db";
import {
  submissions,
  comments,
  qaQuestions,
  announcements,
  users,
  profiles,
} from "@portal/db/schema";
import { requireAdmin } from "@portal/lib/auth";
import { addAdmin, removeAdmin } from "@portal/lib/admins";
import { recordEvent } from "@portal/lib/events";
import { sendEmail, templates } from "@portal/lib/email";
import { saveBlobAttachmentsFromForm, deleteAttachment } from "@portal/lib/files";
import { extractMentions } from "@portal/lib/mentions";
import { resolveMentions } from "@portal/lib/queries";

// NOTE: weeks & assignments are hardcoded in src/portal/lib/curriculum.ts — there
// is no admin editing of the curriculum (and no live-stream toggle) anymore.

async function participantContacts() {
  return db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(sql`${users.email} is not null and ${users.email} <> ''`);
}

/* ---- Q&A ----------------------------------------------------------------- */
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
