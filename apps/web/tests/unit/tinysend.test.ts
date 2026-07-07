import { describe, it, expect, vi, beforeEach } from "vitest";

// Control the API key without depending on .env.local.
vi.mock("@portal/lib/env", () => ({ env: { tinysendApiKey: "test-key" } }));

import { importSubscribers } from "@portal/lib/tinysend";

describe("importSubscribers (tinysend client)", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns ok on 2xx and dedups (lowercased) within the batch", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ imported: 2 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const r = await importSubscribers([
      { email: "A@x.com", name: "A" },
      { email: "a@x.com" }, // duplicate of A@x.com
      { email: "b@x.com", name: "B" },
    ]);

    expect(r.ok).toBe(true);
    expect(r.count).toBe(2); // duplicate collapsed
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.subscribers.map((s: { email: string }) => s.email)).toEqual([
      "a@x.com",
      "b@x.com",
    ]);
    // Only the hardcoded import URL + POST are ever used.
    expect(fetchMock.mock.calls[0][0]).toContain("/subscribers/import");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  it("returns ok:false on non-2xx (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    const r = await importSubscribers([{ email: "a@x.com" }]);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(500);
  });

  it("never throws on a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));
    const r = await importSubscribers([{ email: "a@x.com" }]);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("boom");
  });

  it("no-ops (ok, count 0) on an empty batch without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await importSubscribers([]);
    expect(r).toMatchObject({ ok: true, count: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("importSubscribers without an API key", () => {
  it("returns tinysend_not_configured and makes no request", async () => {
    vi.resetModules();
    vi.doMock("@portal/lib/env", () => ({ env: { tinysendApiKey: "" } }));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { importSubscribers: imp } = await import("@portal/lib/tinysend");
    const r = await imp([{ email: "a@x.com" }]);
    expect(r.ok).toBe(false);
    expect(r.error).toBe("tinysend_not_configured");
    expect(fetchMock).not.toHaveBeenCalled();
    vi.doUnmock("@portal/lib/env");
  });
});
