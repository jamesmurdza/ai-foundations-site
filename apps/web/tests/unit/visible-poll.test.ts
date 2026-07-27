import { describe, it, expect } from "vitest";
import { nextDelay, createPoller, type PollTimers } from "@dashboard/lib/visible-poll";

/** Deterministic stand-in for window.setTimeout — no real clock, no jsdom. */
function fakeTimers() {
  let seq = 0;
  const pending = new Map<number, () => void>();
  const timers: PollTimers = {
    setTimeout: (fn) => {
      const id = ++seq;
      pending.set(id, fn);
      return id;
    },
    clearTimeout: (id) => {
      pending.delete(id);
    },
  };
  return {
    timers,
    outstanding: () => pending.size,
    /** Fire every currently-scheduled callback once. */
    tick: () => {
      const due = [...pending.entries()];
      pending.clear();
      for (const [, fn] of due) fn();
    },
  };
}

describe("nextDelay", () => {
  it("uses the visible interval while the tab is visible", () => {
    expect(nextDelay(true, 10_000, 900_000)).toBe(10_000);
  });

  it("uses the slow interval while the tab is hidden", () => {
    expect(nextDelay(false, 10_000, 900_000)).toBe(900_000);
  });

  it("returns null when hidden polling is disabled", () => {
    expect(nextDelay(false, 10_000, null)).toBeNull();
  });

  it("still polls when visible even if hidden polling is disabled", () => {
    expect(nextDelay(true, 10_000, null)).toBe(10_000);
  });
});

describe("createPoller", () => {
  function setup(hiddenMs: number | null, startVisible = true) {
    const clock = fakeTimers();
    let visible = startVisible;
    let runs = 0;
    const poller = createPoller({
      visibleMs: 10_000,
      hiddenMs,
      isVisible: () => visible,
      run: () => {
        runs++;
      },
      timers: clock.timers,
    });
    return {
      clock,
      poller,
      runs: () => runs,
      setVisible: (v: boolean) => {
        visible = v;
        poller.onVisibilityChange();
      },
    };
  }

  it("runs immediately on start and schedules the next poll", () => {
    const t = setup(null);
    t.poller.start();
    expect(t.runs()).toBe(1);
    expect(t.clock.outstanding()).toBe(1);
  });

  it("keeps polling on an interval while visible", () => {
    const t = setup(null);
    t.poller.start();
    t.clock.tick();
    t.clock.tick();
    expect(t.runs()).toBe(3);
  });

  it("stops entirely when hidden and hidden polling is disabled", () => {
    const t = setup(null);
    t.poller.start();
    t.setVisible(false);
    expect(t.clock.outstanding()).toBe(0);
    const before = t.runs();
    t.clock.tick();
    expect(t.runs()).toBe(before);
  });

  it("keeps a slow poll alive when hidden polling is enabled", () => {
    const t = setup(900_000);
    t.poller.start();
    t.setVisible(false);
    expect(t.clock.outstanding()).toBe(1);
    t.clock.tick();
    expect(t.runs()).toBe(2);
  });

  it("refreshes immediately when the tab becomes visible again", () => {
    const t = setup(null);
    t.poller.start();
    t.setVisible(false);
    const before = t.runs();
    t.setVisible(true);
    expect(t.runs()).toBe(before + 1);
    expect(t.clock.outstanding()).toBe(1);
  });

  it("never leaves two timers outstanding", () => {
    const t = setup(900_000);
    t.poller.start();
    t.setVisible(false);
    t.setVisible(true);
    t.setVisible(false);
    expect(t.clock.outstanding()).toBe(1);
  });

  it("stop() cancels the pending poll and ignores later visibility changes", () => {
    const t = setup(900_000);
    t.poller.start();
    t.poller.stop();
    expect(t.clock.outstanding()).toBe(0);
    t.setVisible(true);
    expect(t.clock.outstanding()).toBe(0);
    const before = t.runs();
    t.clock.tick();
    expect(t.runs()).toBe(before);
  });

  it("does not run on start when the tab starts hidden and hidden polling is off", () => {
    const t = setup(null, false);
    t.poller.start();
    expect(t.runs()).toBe(0);
    expect(t.clock.outstanding()).toBe(0);
  });
});
