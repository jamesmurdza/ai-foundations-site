import { describe, it, expect } from "vitest";
import { buildWeekSteps, actionsForWeek, resolveStepDone } from "@portal/lib/weekActions";

const noSignals = {
  followedPeers: false,
  reviewedProfiles: false,
  tradeStarsOn: false,
};

const week1Id = "week-1-id";

describe("buildWeekSteps", () => {
  it("appends assignments after the soft actions (assignment is the last step)", () => {
    const steps = buildWeekSteps({
      weekNumber: 1,
      weekId: week1Id,
      assignments: [
        { id: "a1", title: "Refresh your GitHub profile", prompt: "Polish it", submitted: false },
      ],
      signals: noSignals,
    });
    const soft = actionsForWeek(1);
    expect(steps).toHaveLength(soft.length + 1);
    const last = steps[steps.length - 1];
    expect(last.key).toBe("assignment-a1");
    expect(last.href).toBe(`/home?week=${week1Id}#assignment`);
    expect(last.title).toBe("Refresh your GitHub profile");
  });

  it("week 1 has no circular /home soft action anymore", () => {
    expect(actionsForWeek(1).some((a) => a.cta.href === "/home")).toBe(false);
  });

  it("marks an assignment step done + relabels its CTA once submitted", () => {
    const [step] = buildWeekSteps({
      weekNumber: 99,
      weekId: "week-99-id",
      assignments: [
        { id: "x", title: "T", prompt: "P", submitted: true },
      ],
      signals: noSignals,
    }).slice(-1);
    expect(step.done).toBe(true);
    expect(step.ctaLabel).toBe("View / resubmit");
  });

  it("no program week shows soft actions — the wizard carries each week", () => {
    for (const n of [1, 2, 3, 4]) {
      expect(actionsForWeek(n)).toHaveLength(0);
      expect(
        buildWeekSteps({
          weekNumber: n,
          weekId: `week-${n}-id`,
          assignments: [],
          signals: noSignals,
        }),
      ).toHaveLength(0);
    }
  });
});

describe("resolveStepDone", () => {
  it("uses the saved override when the user has toggled a step", () => {
    const overrides = new Map([["follow-peers", false]]);
    expect(resolveStepDone("follow-peers", true, overrides)).toBe(false);
    expect(resolveStepDone("review-profiles", false, overrides)).toBe(false);
  });

  it("falls back to auto-detected completion when there is no override", () => {
    const overrides = new Map<string, boolean>();
    expect(resolveStepDone("follow-peers", true, overrides)).toBe(true);
    expect(resolveStepDone("follow-peers", false, overrides)).toBe(false);
  });
});
