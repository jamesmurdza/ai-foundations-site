"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ERROR_COPY: Record<string, string> = {
  invalid_username:
    "Use 2–30 chars: letters, numbers, dash, underscore (must start with a letter or number).",
  invalid_password: "Password must be 6–128 characters.",
  username_taken: "That username already exists.",
  missing_fields: "Both fields are required.",
  invalid_json: "Something went wrong. Try again.",
};

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return window.location.origin + path;
}

export function AddAdminForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedName(null);
    if (!username.trim() || !password) return;
    setPosting(true);
    try {
      const res = await fetch(apiUrl("/api/admins"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(ERROR_COPY[data.error ?? ""] ?? `Failed (${res.status})`);
        return;
      }
      const created = (await res.json()) as { username: string };
      setCreatedName(created.username);
      setUsername("");
      setPassword("");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[18px] border border-hairline bg-canvas p-6"
    >
      <div className="mb-1 text-[12px] uppercase tracking-[0.12em] text-ink-48">
        Add admin
      </div>
      <p className="mb-5 text-[13px] text-ink-48">
        New admins can sign in immediately with their username + password
        (basic auth).
      </p>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-80">Username</span>
          <input
            type="text"
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. naveed"
            className="mt-1 block h-11 w-full rounded-[11px] border border-hairline bg-canvas px-3 text-[14px] text-ink placeholder:text-ink-48 focus:border-action focus:outline-none focus:ring-2 focus:ring-action/20"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-80">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="mt-1 block h-11 w-full rounded-[11px] border border-hairline bg-canvas px-3 text-[14px] text-ink placeholder:text-ink-48 focus:border-action focus:outline-none focus:ring-2 focus:ring-action/20"
          />
        </label>
        <button
          type="submit"
          disabled={posting || !username.trim() || password.length < 6}
          className="inline-flex h-11 items-center justify-center rounded-full bg-action px-6 text-[14px] font-medium text-white transition-transform active:scale-[0.97] hover:bg-action-focus disabled:opacity-40 disabled:active:scale-100"
        >
          {posting ? "Adding…" : "Add admin"}
        </button>
      </div>
      {error && (
        <p className="mt-4 text-[13px] text-[#cf222e]">{error}</p>
      )}
      {createdName && !error && (
        <p className="mt-4 text-[13px] text-[#16a34a]">
          Added <span className="font-medium">{createdName}</span>. Share their
          credentials securely.
        </p>
      )}
    </form>
  );
}
