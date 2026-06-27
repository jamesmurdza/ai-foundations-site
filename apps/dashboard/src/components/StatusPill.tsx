import { ADMIN_STATUS_LABEL, type AdminStatus } from "@/lib/types";

const STYLES: Record<AdminStatus, string> = {
  pending: "bg-pearl text-ink-80 ring-1 ring-hairline",
  accepted: "bg-[#dcfce7] text-[#14532d] ring-1 ring-[#bbf7d0]",
  rejected: "bg-[#fee2e2] text-[#7f1d1d] ring-1 ring-[#fecaca]",
  waitlist: "bg-[#fef3c7] text-[#7c4a03] ring-1 ring-[#fde68a]",
};

export function StatusPill({
  status,
  size = "md",
}: {
  status: AdminStatus;
  size?: "sm" | "md";
}) {
  const cls = STYLES[status] ?? STYLES.pending;
  const sizeCls =
    size === "sm"
      ? "text-[11px] px-2 py-[3px] tracking-tight"
      : "text-[12px] px-2.5 py-[3px] tracking-tight";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full font-medium ${cls} ${sizeCls}`}
    >
      {ADMIN_STATUS_LABEL[status]}
    </span>
  );
}

export function FlowStatusPill({
  status,
}: {
  status: "in_progress" | "submitted";
}) {
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#e0f2fe] text-[#075985] ring-1 ring-[#bae6fd] text-[11px] px-2 py-[3px]">
        Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full bg-pearl text-ink-48 ring-1 ring-hairline text-[11px] px-2 py-[3px]">
      In progress
    </span>
  );
}
