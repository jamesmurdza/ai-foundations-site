import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { db } from "@portal/db";
import { emailLogs } from "@portal/db/schema";
import { env, smtpConfigured } from "./env";
import { weekAssignmentHomePath } from "@portal/lib/weekRoutes";

export type EmailType =
  | "submission_received"
  | "deadline_reminder"
  | "feedback_received"
  | "starred"
  | "stream_live"
  | "weekly_update"
  | "announcement"
  | "login_code"
  | "welcome";

type SendArgs = {
  to: string;
  type: EmailType;
  subject: string;
  html: string;
  userId?: string | null;
};

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!smtpConfigured) return null;
  if (cachedTransport) return cachedTransport;
  cachedTransport = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    requireTLS: env.smtpPort === 587,
    auth: { user: env.smtpUser, pass: env.smtpPass },
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000,
  });
  return cachedTransport;
}

export type SendResult = {
  status: "sent" | "logged" | "failed";
  id?: string;
  error?: string;
};

/**
 * Reliability is the core requirement (spec §8). Email goes out over SMTP
 * (ImprovMX, via nodemailer) and every send is recorded to ss_email_logs with
 * its outcome so deliverability can be verified. If SMTP isn't configured we
 * still log + record, so the pipeline is testable without sending real mail.
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  let result: SendResult;
  const transport = getTransport();

  if (!args.to) {
    result = { status: "failed", error: "missing recipient" };
  } else if (!transport) {
    console.log(
      `\n[email:logged] to=${args.to} type=${args.type}\n  subject: ${args.subject}`,
    );
    result = { status: "logged" };
  } else {
    try {
      const info = await transport.sendMail({
        from: env.emailFrom,
        to: args.to,
        subject: args.subject,
        html: args.html,
      });
      result = { status: "sent", id: info.messageId };
    } catch (e) {
      result = { status: "failed", error: (e as Error).message };
    }
  }

  try {
    await db.insert(emailLogs).values({
      userId: args.userId ?? null,
      toEmail: args.to || "",
      type: args.type,
      subject: args.subject,
      status: result.status,
      providerId: result.id ?? null,
      error: result.error ?? null,
    });
  } catch (e) {
    console.error("[email] failed to write email log", e);
  }

  if (result.status === "failed") {
    console.error(`[email:failed] ${args.type} -> ${args.to}: ${result.error}`);
  }
  return result;
}

/* ---- Templates ----------------------------------------------------------- */

const BRAND = "#292929";
const ACCENT = "#5b2bee";

function shell(title: string, body: string, cta?: { href: string; label: string }) {
  return `
  <div style="background:#f6f3f0;padding:32px 0;font-family:Inter,Helvetica,Arial,sans-serif;color:${BRAND}">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:32px;border:1px solid #ebe6e1">
      <div style="font-weight:700;font-size:18px;color:${ACCENT};margin-bottom:20px">AI Foundations Summer School</div>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 12px">${title}</h1>
      <div style="font-size:16px;line-height:1.6;color:#486984">${body}</div>
      ${
        cta
          ? `<a href="${cta.href}" style="display:inline-block;margin-top:24px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:24px">${cta.label}</a>`
          : ""
      }
      <div style="margin-top:28px;border-top:1px solid #dde7ee;padding-top:16px;font-size:13px;color:#688dac">
        One cohort — online and in the house.
      </div>
    </div>
  </div>`;
}

export const templates = {
  welcome(name: string) {
    return {
      subject: "Welcome to the cohort 🌊",
      html: shell(
        `Welcome${name ? `, ${name}` : ""}!`,
        `You're in. Set up your profile, share what you're proud of and what you want to achieve, then jump into this week's build.`,
        { href: `${env.baseUrl}/onboarding`, label: "Build your profile" },
      ),
    };
  },
  submissionReceived(assignmentTitle: string, submissionId: string) {
    return {
      subject: `We received your submission: ${assignmentTitle}`,
      html: shell(
        "Submission received ✅",
        `Your work for <b>${assignmentTitle}</b> is in. It's now in the showcase, and peers will be matched to give you feedback.`,
        { href: `${env.baseUrl}/submissions/${submissionId}`, label: "View your submission" },
      ),
    };
  },
  deadlineReminder(assignmentTitle: string, weekId: string, when: string) {
    return {
      subject: `Reminder: ${assignmentTitle} is due ${when}`,
      html: shell(
        "A deadline is coming up ⏰",
        `Heads up — <b>${assignmentTitle}</b> is due ${when}. Submit what you've got; done beats perfect.`,
        {
          href: `${env.baseUrl}${weekAssignmentHomePath(weekId)}`,
          label: "Open the assignment",
        },
      ),
    };
  },
  feedbackReceived(submissionId: string) {
    return {
      subject: "You got a compliment 💛",
      html: shell(
        "A peer complimented your work",
        `Someone in the cohort left a few kind words on your submission. Go see what they said.`,
        { href: `${env.baseUrl}/submissions/${submissionId}`, label: "Read it" },
      ),
    };
  },
  starred(count: number) {
    return {
      subject: `You just earned ${count} star${count === 1 ? "" : "s"} ⭐`,
      html: shell(
        "New stars ⭐",
        `The cohort traded stars and your project picked up <b>${count}</b> new star${count === 1 ? "" : "s"} (and some new followers).`,
        { href: `${env.baseUrl}/stars`, label: "See the star board" },
      ),
    };
  },
  streamLive(weekTheme: string, weekId: string) {
    return {
      subject: `🔴 Live now: ${weekTheme}`,
      html: shell(
        "The stream is live 🔴",
        `We've just gone live with <b>${weekTheme}</b>. Join the room — react, drop questions in the queue, and build along with the house.`,
        { href: `${env.baseUrl}/weeks/${weekId}`, label: "Join the stream" },
      ),
    };
  },
  weeklyUpdate(weekTheme: string, body: string, weekId: string) {
    return {
      subject: `This week: ${weekTheme}`,
      html: shell(`This week — ${weekTheme}`, body, {
        href: `${env.baseUrl}/weeks/${weekId}`,
        label: "Open this week",
      }),
    };
  },
  announcement(title: string, body: string) {
    return {
      subject: title,
      html: shell(title, body, {
        href: `${env.baseUrl}/lessons`,
        label: "Open the portal",
      }),
    };
  },
  loginCode(code: string) {
    return {
      subject: `Your sign-in code: ${code}`,
      html: shell(
        "Your sign-in code",
        `Enter this code to sign in to the portal:
         <div style="font-size:34px;font-weight:800;letter-spacing:8px;margin:18px 0;color:#292929">${code}</div>
         It expires in 10 minutes. If you didn't request this, you can ignore it.`,
      ),
    };
  },
};
