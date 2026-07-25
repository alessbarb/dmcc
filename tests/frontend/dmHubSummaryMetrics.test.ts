import { describe, expect, it } from "vitest";
import { computeActiveVsPaused, computeAverageSessionsPerCampaign } from "../../src/frontend/dm/hub/dmHubSummaryMetrics.js";
import type { DmHubCampaign } from "../../src/frontend/dm/hub/dmHubTypes.js";

function campaign(overrides: Partial<DmHubCampaign>): DmHubCampaign {
  return { campaignId: "cmp_1", title: "T", status: "active", system: "custom", coverUrl: "", progressPercent: null, updatedAt: undefined, stats: { playersCount: 0, npcsCount: 0, locationsCount: 0, questsCount: 0, secretsCount: 0, cluesCount: 0, sessionsCount: 0, activeSession: null }, ...overrides } as DmHubCampaign;
}

describe("computeActiveVsPaused", () => {
  it("counts active status and active sessions", () => {
    expect(computeActiveVsPaused([campaign({ status: "active" }), campaign({ status: "paused", stats: { ...campaign({}).stats, activeSession: "s1" } }), campaign({ status: "paused" })])).toEqual({ active: 2, paused: 1 });
  });
  it("returns zeroes for an empty list", () => expect(computeActiveVsPaused([])).toEqual({ active: 0, paused: 0 }));
});

describe("computeAverageSessionsPerCampaign", () => {
  it("rounds to one decimal", () => expect(computeAverageSessionsPerCampaign([campaign({ stats: { ...campaign({}).stats, sessionsCount: 3 } }), campaign({ stats: { ...campaign({}).stats, sessionsCount: 4 } })])).toBe(3.5));
  it("returns zero for an empty list", () => expect(computeAverageSessionsPerCampaign([])).toBe(0));
});
