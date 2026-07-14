import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { canResolveStoryThread } from "../../src/core/domain/story/story.js";
import type { StoryStep } from "../../src/core/domain/story/types.js";

describe("Story Plan Domain & Commands", () => {
  it("determines if a story thread can be resolved", () => {
    // Empty steps -> cannot resolve
    expect(canResolveStoryThread([])).toBe(false);

    const baseStep: StoryStep = {
      campaignId: "cmp_one",
      stepId: "stp_one",
      threadId: "sth_one",
      title: "Step One",
      status: "planned",
      sortOrder: 0,
      createdAt: "",
      updatedAt: "",
      entityIds: [],
    };

    // Non-terminal step -> cannot resolve
    expect(canResolveStoryThread([baseStep])).toBe(false);

    // All discarded (terminal, but no resolved step) -> cannot resolve
    expect(canResolveStoryThread([{ ...baseStep, status: "discarded" }])).toBe(false);

    // All terminal with at least one resolved -> can resolve
    expect(canResolveStoryThread([
      { ...baseStep, status: "resolved" },
      { ...baseStep, stepId: "stp_two", status: "discarded" }
    ])).toBe(true);

    // Mixed terminal and active -> cannot resolve
    expect(canResolveStoryThread([
      { ...baseStep, status: "resolved" },
      { ...baseStep, stepId: "stp_two", status: "active" }
    ])).toBe(false);
  });

  it("handles CreateStoryThread, CreateStoryStep and ReconcileStoryStep commands", () => {
    let state = createCampaignState("cmp_one");

    // Mock a closed session in state for reconciliation validation
    state.sessions.set("sess_one", {
      id: "sess_one",
      campaignId: "cmp_one",
      sessionId: "sess_one",
      number: 1,
      title: "Session One",
      status: "closed",
      presentPlayerIds: [],
      presentCharacterIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create thread
    const result1 = handleCommand(state, {
      type: "CreateStoryThread",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      threadId: "sth_thread1",
      title: "Main Quest",
      status: "planned",
      sortOrder: 0,
    });
    state = result1.state;
    expect(state.storyThreads.get("sth_thread1")?.title).toBe("Main Quest");

    // Create step
    const result2 = handleCommand(state, {
      type: "CreateStoryStep",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      stepId: "stp_step1",
      threadId: "sth_thread1",
      title: "Find the key",
      sortOrder: 0,
    });
    state = result2.state;
    expect(state.storySteps.get("stp_step1")?.title).toBe("Find the key");
    expect(state.storySteps.get("stp_step1")?.status).toBe("planned");

    // Reconcile step as resolved (as_planned)
    const result3 = handleCommand(state, {
      type: "ReconcileStoryStep",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      stepId: "stp_step1",
      resolvedSessionId: "sess_one",
      status: "resolved",
      resolutionKind: "as_planned",
    });
    state = result3.state;
    expect(state.storySteps.get("stp_step1")?.status).toBe("resolved");
    expect(state.storySteps.get("stp_step1")?.resolutionKind).toBe("as_planned");
    expect(state.storySteps.get("stp_step1")?.resolvedSessionId).toBe("sess_one");

    // Validate resolution coherence: resolved as changed requires outcome
    expect(() => {
      handleCommand(state, {
        type: "ReconcileStoryStep",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        stepId: "stp_step1",
        resolvedSessionId: "sess_one",
        status: "resolved",
        resolutionKind: "changed",
      });
    }).toThrow("require an actual outcome");
  });
});
