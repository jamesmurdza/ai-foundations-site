import { z } from "zod";

export const dynamicQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  type: z.enum(["text"]).default("text"),
  probes: z.string().optional(),
});
export type DynamicQuestion = z.infer<typeof dynamicQuestionSchema>;

export const dynamicQuestionsResponseSchema = z.object({
  questions: z.array(dynamicQuestionSchema).length(2),
});

export const stepSchema = z.enum([
  "intro",
  "contact",
  "links",
  "static",
  "generating",
  "dynamic",
  "review",
  "submitted",
]);
export type Step = z.infer<typeof stepSchema>;

export const applicationStateSchema = z.object({
  sessionId: z.string().min(1),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  name: z.string().max(120).optional(),
  answers: z.record(z.string(), z.string()).default({}),
  dynamicQuestions: z.array(dynamicQuestionSchema).optional(),
  portfolioUrl: z.string().max(500).optional(),
  githubUrl: z.string().max(500).optional(),
  otherUrl: z.string().max(500).optional(),
  step: stepSchema.default("intro"),
  cardIndex: z.number().int().min(0).default(0),
  status: z.enum(["in_progress", "submitted"]).default("in_progress"),
  updatedAt: z.number().default(() => Date.now()),
});
export type ApplicationState = z.infer<typeof applicationStateSchema>;

export const patchBodySchema = applicationStateSchema.partial().extend({
  sessionId: z.string().min(1),
});
