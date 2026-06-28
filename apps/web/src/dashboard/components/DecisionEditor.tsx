"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_STATUS_LABEL, type AdminStatus } from "@dashboard/lib/types";
import { withBase } from "@dashboard/lib/paths";

const OPTIONS: AdminStatus[] = ["pending", "accepted", "waitlist", "rejected"];

export function DecisionEditor({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: AdminStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AdminStatus>(initialStatus);
  const [pending, setPending] = useState<AdminStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function setDecision(next: AdminStatus) {
    if (next === status) return;
    setPending(next);
    setError(null);
    const previous = status;
    setStatus(next);
    try {
      const res = await fetch(withBase(`/api/applications/${id}`), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminStatus: next }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      router.refresh();
    } catch (err) {
      setStatus(previous);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-[18px] border border-hairline bg-canvas p-5">
      <div className="text-[12px] uppercase tracking-[0.12em] text-ink-48">
        Decision
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = status === opt;
          const isPending = pending === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setDecision(opt)}
              disabled={pending !== null}
              className={
                "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-medium transition disabled:cursor-not-allowed " +
                (active
                  ? "border-ink bg-ink text-canvas"
                  : "border-hairline bg-canvas text-ink-80 hover:border-ink/30 hover:text-ink") +
                (isPending ? " opacity-60" : "")
              }
            >
              {ADMIN_STATUS_LABEL[opt]}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-3 text-[12px] text-[#cf222e]">{error}</p>
      )}
    </div>
  );
}
