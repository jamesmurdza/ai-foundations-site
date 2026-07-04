"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@portal/db";
import { feedback, submissions, users } from "@portal/db/schema";
import { requireOnboardedUser } from "@portal/lib/auth";
import { recordEvent } from "@portal/lib/events";
import { sendEmail, templates } from "@portal/lib/email";

const schema = z.object({
  submissionId: z.string().min(1),
  body: z.string().trim().min(3, "Write a little more").max(4000),
});

// A "compliment" is just a feedback row — peers leaving a few kind words on a
// submission. No rating, no pre-assigned matching: people compliment whoever
// they choose (Discover surfaces who still needs one).
export async function submitFeedback(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const data = schema.parse({
    submissionId: formData.get("submissionId") ?? "",
    body: formData.get("body") ?? "",
  });

  await db.insert(feedback).values({
    submissionId: data.submissionId,
    reviewerId: user.id,
    body: data.body,
  });

  // Notify the submission owner.
  const [sub] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, data.submissionId))
    .limit(1);
  if (sub) {
    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, sub.userId))
      .limit(1);
    if (owner?.email && sub.userId !== user.id) {
      const ownerEmail = owner.email;
      const t = templates.feedbackReceived(sub.id);
      after(() =>
        sendEmail({
          to: ownerEmail,
          type: "feedback_received",
          subject: t.subject,
          html: t.html,
          userId: sub.userId,
        }),
      );
    }
    await recordEvent({
      type: "feedback",
      actorId: user.id,
      actorName: user.name ?? user.githubLogin ?? "Someone",
      summary: `${user.name ?? user.githubLogin} left a compliment on a submission`,
      targetType: "submission",
      targetId: sub.id,
    });
  }

  // feedbackCount is shown on each card in the showcase feed.
  revalidateTag("showcase", { expire: 0 });
  revalidatePath(`/submissions/${data.submissionId}`);
  revalidatePath("/feedback");
  revalidatePath("/lessons");
}
