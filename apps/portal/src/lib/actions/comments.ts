"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { requireOnboardedUser } from "@/lib/auth";

const schema = z.object({
  targetType: z.enum(["submission", "profile", "announcement"]),
  targetId: z.string().min(1),
  body: z.string().trim().min(1, "Say something").max(2000),
});

const PATH: Record<z.infer<typeof schema>["targetType"], (id: string) => string> = {
  submission: (id) => `/submissions/${id}`,
  profile: (id) => `/profiles/${id}`,
  announcement: (id) => `/announcements/${id}`,
};

export async function postComment(formData: FormData) {
  const { user } = await requireOnboardedUser();
  const data = schema.parse({
    targetType: formData.get("targetType") ?? "submission",
    targetId: formData.get("targetId") ?? "",
    body: formData.get("body") ?? "",
  });

  await db.insert(comments).values({
    targetType: data.targetType,
    targetId: data.targetId,
    userId: user.id,
    body: data.body,
  });

  // Compliment counts feed cached Discover surfaces — bust their tags so the
  // count and the "needs a compliment" sort refresh right away.
  if (data.targetType === "profile") revalidateTag("profiles", { expire: 0 });
  if (data.targetType === "submission") revalidateTag("showcase", { expire: 0 });
  revalidatePath(PATH[data.targetType](data.targetId));
}
