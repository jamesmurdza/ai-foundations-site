import nodemailer, { type Transporter } from "nodemailer";

let cachedTransport: Transporter | null = null;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;
  const host = requireEnv("SMTP_HOST");
  const port = Number(requireEnv("SMTP_PORT"));
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000,
  });
  return cachedTransport;
}

function firstNameOrFallback(name: string | null): string {
  if (!name) return "there";
  const first = name.trim().split(/\s+/)[0];
  return first || "there";
}

const SUBJECT = "Thanks for your Summer School application";

function bodyFor(firstName: string): string {
  return [
    `Hi ${firstName},`,
    "",
    "Thank you for applying to the AI Foundations Summer School. We'll try to get back to you soon. If you have any questions or updates please reply to this email.",
    "",
    "— The AI Foundations Team",
  ].join("\n");
}

export async function sendThankYou(
  toEmail: string,
  name: string | null,
): Promise<void> {
  const from = requireEnv("SMTP_FROM");
  const firstName = firstNameOrFallback(name);
  const transport = getTransport();
  await transport.sendMail({
    from,
    to: toEmail,
    subject: SUBJECT,
    text: bodyFor(firstName),
  });
}
