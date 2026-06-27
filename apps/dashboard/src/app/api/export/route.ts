import { NextResponse } from "next/server";
import { listApplications } from "@/lib/applications";
import { STATIC_QUESTIONS } from "@/lib/questions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const apps = await listApplications();

  let maxDyn = 0;
  for (const a of apps) {
    const n = a.dynamicQuestions?.length ?? 0;
    if (n > maxDyn) maxDyn = n;
  }

  const dynIds = Array.from({ length: maxDyn }, (_, i) => `q-dyn-${i + 1}`);

  const headers = [
    "id",
    "name",
    "email",
    "status",
    "admin_status",
    "submitted_at",
    "updated_at",
    "step",
    "portfolio_url",
    "github_url",
    "other_url",
    "why_text",
    "project_text",
    "admin_notes",
    ...STATIC_QUESTIONS.map((q) => q.id),
    ...dynIds,
  ];

  const rows = [headers.join(",")];

  for (const a of apps) {
    const cells: string[] = [
      a.id,
      a.name ?? "",
      a.email ?? "",
      a.status,
      a.adminStatus,
      a.submittedAt ?? "",
      a.updatedAt,
      a.step ?? "",
      a.portfolioUrl ?? "",
      a.githubUrl ?? "",
      a.otherUrl ?? "",
      a.whyText ?? "",
      a.projectText ?? "",
      a.adminNotes ?? "",
    ];

    for (const q of STATIC_QUESTIONS) {
      cells.push(a.answers[q.id] ?? "");
    }
    for (const id of dynIds) {
      cells.push(a.answers[id] ?? "");
    }

    rows.push(cells.map(csvEscape).join(","));
  }

  const csv = rows.join("\n");
  const filename = `hh-applications-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
