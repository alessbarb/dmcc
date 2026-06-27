import { describe, expect, it } from "vitest";
import { handleCommand } from "../../src/core/application/commandBus.js";
import type { CampaignState } from "../../src/core/domain/state.js";

function emptyState(campaignId = "cmp_multi"): CampaignState {
  return {
    campaignId: campaignId as any,
    campaign: null,
    entities: new Map(),
    relations: new Map(),
    facts: new Map(),
    sessions: new Map(),
    sessionEvents: new Map(),
    players: new Map(),
    tags: new Map(),
    canvases: new Map(),
  } as CampaignState;
}

describe("multi-event command bus", () => {
  it("wraps existing single event handlers in an events array", () => {
    const result = handleCommand(emptyState(), {
      type: "CreateCampaign",
      campaignId: "cmp_multi" as any,
      actorId: "usr_dm",
      title: "Multi Event Campaign",
    });

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe("CampaignCreated");
  });
});
