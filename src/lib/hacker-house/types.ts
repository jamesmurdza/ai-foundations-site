import { z } from "zod";

export const dynamicQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  probes: z.string().optional(),
});
export type DynamicQuestion = z.infer<typeof dynamicQuestionSchema>;

export const dynamicQuestionsResponseSchema = z.object({
  questions: z.array(dynamicQuestionSchema).length(5),
});

export const stepSchema = z.enum([
  "intro",
  "contact",
  "static",
  "generating",
  "dynamic",
  "why",
  "project",
  "links",
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
  whyText: z.string().max(2000).optional(),
  projectText: z.string().max(2000).optional(),
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
