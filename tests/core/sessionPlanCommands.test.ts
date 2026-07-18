import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import { createEmptySessionPlan } from "../../src/core/domain/session/sessionPlan.js";

function stateWithPlannedSession() {
  let state = createCampaignState("cmp_one");
  state = handleCommand(state, {
    type: "CreatePreparedSession",
    campaignId: "cmp_one",
    actorId: "usr_dm",
    sessionId: "sess_1",
    title: "La emboscada",
  }).state;
  return state;
}

describe("ReviseSessionPlan", () => {
  it("revises the plan and bumps the revision", () => {
    const state = stateWithPlannedSession();
    const plan = { ...createEmptySessionPlan(), state: "ready" as const };
    const result = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_1",
      expectedRevision: 0,
      title: "La emboscada",
      plan,
    });

    expect(result.events[0].type).toBe("SessionPlanRevised");
    const session = result.state.sessions.get("sess_1");
    expect(session?.plan?.revision).toBe(1);
    expect(session?.plan?.state).toBe("ready");
  });

  it("rejects a stale expectedRevision with a conflict", () => {
    const state = stateWithPlannedSession();
    expect(() =>
      handleCommand(state, {
        type: "ReviseSessionPlan",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        sessionId: "sess_1",
        expectedRevision: 4,
        title: "La emboscada",
        plan: createEmptySessionPlan(),
      }),
    ).toThrow(/SESSION_PLAN_REVISION_CONFLICT/);
  });

  it("attaches a 409 statusCode to the revision conflict error", () => {
    const state = stateWithPlannedSession();
    try {
      handleCommand(state, {
        type: "ReviseSessionPlan",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        sessionId: "sess_1",
        expectedRevision: 4,
        title: "La emboscada",
        plan: createEmptySessionPlan(),
      });
      expect.unreachable("expected ReviseSessionPlan to throw");
    } catch (error) {
      expect((error as Error & { statusCode?: number }).statusCode).toBe(409);
    }
  });

  it("rejects a structurally invalid plan", () => {
    const state = stateWithPlannedSession();
    const invalidPlan = {
      ...createEmptySessionPlan(),
      flowItems: [
        { id: "spi_a", kind: "scene" as const, sceneEntityId: "ent_cave", order: 0 },
      ],
      transitions: [
        {
          id: "sptr_1",
          sourceItemId: "spi_a",
          targetItemId: "spi_a",
          kind: "next" as const,
          order: 0,
        },
      ],
    };
    expect(() =>
      handleCommand(state, {
        type: "ReviseSessionPlan",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        sessionId: "sess_1",
        expectedRevision: 0,
        title: "La emboscada",
        plan: invalidPlan,
      }),
    ).toThrow(/Reflexive transition/);
  });

  it("rejects revising a plan on a non-planned session", () => {
    let state = stateWithPlannedSession();
    state = handleCommand(state, {
      type: "ActivatePlannedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_1",
    }).state;

    expect(() =>
      handleCommand(state, {
        type: "ReviseSessionPlan",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        sessionId: "sess_1",
        expectedRevision: 0,
        title: "La emboscada",
        plan: createEmptySessionPlan(),
      }),
    ).toThrow(/SESSION_NOT_PLANNED/);
  });
});

describe("ActivatePlannedSession", () => {
  it("activates a planned session and freezes the activated plan revision", () => {
    let state = stateWithPlannedSession();
    state = handleCommand(state, {
      type: "ReviseSessionPlan",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_1",
      expectedRevision: 0,
      title: "La emboscada",
      plan: { ...createEmptySessionPlan(), state: "ready" },
    }).state;

    const result = handleCommand(state, {
      type: "ActivatePlannedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_1",
    });

    const session = result.state.sessions.get("sess_1");
    expect(session?.status).toBe("active");
    expect(session?.activatedPlanRevision).toBe(1);
  });

  it("creates an empty plan when activating an ad-hoc session with no plan", () => {
    const state = stateWithPlannedSession();
    const result = handleCommand(state, {
      type: "ActivatePlannedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_1",
    });

    const session = result.state.sessions.get("sess_1");
    expect(session?.plan).toBeDefined();
    expect(session?.activatedPlanRevision).toBe(0);
  });

  it("rejects activating when another session is already active", () => {
    let state = stateWithPlannedSession();
    state = handleCommand(state, {
      type: "ActivatePlannedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_1",
    }).state;
    state = handleCommand(state, {
      type: "CreatePreparedSession",
      campaignId: "cmp_one",
      actorId: "usr_dm",
      sessionId: "sess_2",
      title: "La guarida",
    }).state;

    expect(() =>
      handleCommand(state, {
        type: "ActivatePlannedSession",
        campaignId: "cmp_one",
        actorId: "usr_dm",
        sessionId: "sess_2",
      }),
    ).toThrow(/ACTIVE_SESSION_EXISTS/);
  });
});
