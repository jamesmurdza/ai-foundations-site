export type AdminStatus = "pending" | "accepted" | "rejected" | "waitlist";

export type DynamicQuestion = {
  id: string;
  question: string;
  options: string[];
  probes?: string;
};

export type Application = {
  id: string;
  email: string | null;
  name: string | null;
  answers: Record<string, string>;
  dynamicQuestions: DynamicQuestion[] | null;
  status: "in_progress" | "submitted";
  whyText: string | null;
  projectText: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  otherUrl: string | null;
  step: string | null;
  adminStatus: AdminStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  notificationSentAt: string | null;
};

export const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  pending: "In progress",
  accepted: "Accepted",
  rejected: "Rejected",
  waitlist: "Waitlist",
};
