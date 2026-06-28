import "server-only";
import { env } from "./env";

// HARDCODED. This is the ONLY tinysend endpoint this codebase may ever call.
// The API key can also DELETE list data — there is deliberately NO code path here
// for any non-import request. Do not parameterize the method or the URL path.
const TINYSEND_IMPORT_URL =
  "https://api.tinysend.com/v1/lists/01kw1w0ej81xqesjta64pz28wq/subscribers/import";

export type TinysendSubscriberInput = { email: string; name?: string | null };

export type ImportResult = {
  ok: boolean;
  count: number; // subscribers attempted in this POST (after dedup)
  status?: number; // HTTP status from tinysend
  error?: string;
};

/**
 * Import (idempotent on email) a batch of subscribers into the one allowed tinysend
 * list. Never throws — returns {ok:false,error} on any failure so the reconciler can
 * leave the ledger un-marked and retry next tick. Returns ok:false with
 * "tinysend_not_configured" when no API key is set, so it's safe to deploy before the
 * secret exists.
 */
export async function importSubscribers(
  subscribers: TinysendSubscriberInput[],
): Promise<ImportResult> {
  if (!env.tinysendApiKey) {
    return { ok: false, count: subscribers.length, error: "tinysend_not_configured" };
  }

  // Defensive in-batch dedup on lowercased email so one POST never repeats one.
  const seen = new Set<string>();
  const clean: TinysendSubscriberInput[] = [];
  for (const s of subscribers) {
    const email = s.email.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    clean.push({ email, name: s.name?.trim() || undefined });
  }
  if (clean.length === 0) return { ok: true, count: 0 };

  try {
    const res = await fetch(TINYSEND_IMPORT_URL, {
      method: "POST", // hardcoded; never DELETE/PUT/PATCH
      headers: {
        Authorization: `Bearer ${env.tinysendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscribers: clean }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, count: clean.length, status: res.status, error: text.slice(0, 300) };
    }
    return { ok: true, count: clean.length, status: res.status };
  } catch (e) {
    return { ok: false, count: clean.length, error: (e as Error).message };
  }
}
