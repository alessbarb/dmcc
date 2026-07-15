import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";

function storyState() {
  const state = createCampaignState("cmp_workspace");
  state.sessions.set("sess_planned", {
    id: "sess_planned",
    sessionId: "sess_planned",
    campaignId: "cmp_workspace",
    number: 1,
    title: "Planned session",
    status: "planned",
    presentPlayerIds: [],
    presentCharacterIds: [],
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
  });
  let next = handleCommand(state, {
    type: "CreateStoryThread",
    campaignId: "cmp_workspace",
    actorId: "usr_dm",
    threadId: "sth_main",
    title: "Main thread",
    status: "resolved",
    sortOrder: 0,
  }).state;
  next = handleCommand(next, {
    type: "CreateStoryStep",
    campaignId: "cmp_workspace",
    actorId: "usr_dm",
    stepId: "stp_main",
    threadId: "sth_main",
    title: "First step",
    sortOrder: 0,
  }).state;
  return next;
}

describe("campaign workspace stabilization", () => {
  it("always creates threads as planned and only resolves them through the semantic command", () => {
    const state = storyState();
    expect(state.storyThreads.get("sth_main")?.status).toBe("planned");
    expect(() => handleCommand(state, {
      type: "ResolveStoryThread",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      threadId: "sth_main",
    })).toThrow("Cannot resolve story thread");
  });

  it("moves scheduled steps to ready and unscheduling returns them to planned", () => {
    let state = storyState();
    state = handleCommand(state, {
      type: "ScheduleStoryStep",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      stepId: "stp_main",
      plannedSessionId: "sess_planned",
      plannedSessionOrder: 0,
    }).state;
    expect(state.storySteps.get("stp_main")?.status).toBe("ready");
    state = handleCommand(state, {
      type: "UnscheduleStoryStep",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      stepId: "stp_main",
    }).state;
    expect(state.storySteps.get("stp_main")?.status).toBe("planned");
  });

  it("rejects partial and duplicate reorder payloads", () => {
    let state = storyState();
    state = handleCommand(state, {
      type: "CreateStoryStep",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      stepId: "stp_second",
      threadId: "sth_main",
      title: "Second step",
      sortOrder: 1,
    }).state;
    expect(() => handleCommand(state, {
      type: "ReorderStorySteps",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      threadId: "sth_main",
      orderedStepIds: ["stp_main"],
    })).toThrow("must exactly match");
    expect(() => handleCommand(state, {
      type: "ReorderStorySteps",
      campaignId: "cmp_workspace",
      actorId: "usr_dm",
      threadId: "sth_main",
      orderedStepIds: ["stp_main", "stp_main"],
    })).toThrow("must exactly match");
  });
});
