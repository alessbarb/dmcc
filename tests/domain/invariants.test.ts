import { describe, expect, it } from "vitest";
import { createCampaignState } from "../../src/domain/state.js";
import { createEntity } from "../../src/domain/entity/entity.js";
import { createRelation } from "../../src/domain/relation/relation.js";
import { createSession, closeSession } from "../../src/domain/session/session.js";

describe("domain invariants", () => {
  it("defaults new entities to dm_only visibility", () => {
    const entity = createEntity({
      entityId: "ent_mira",
      campaignId: "cmp_one",
      entityType: "npc",
      title: "Mira",
    });

    expect(entity.visibility.kind).toBe("dm_only");
  });

  it("rejects an entity without a title", () => {
    expect(() =>
      createEntity({ entityId: "ent_bad", campaignId: "cmp_one", entityType: "npc", title: "" }),
    ).toThrow("Entity title is required");
  });

  it("rejects relations across campaigns", () => {
    const source = createEntity({ entityId: "ent_a", campaignId: "cmp_one", entityType: "npc", title: "A" });
    const target = createEntity({ entityId: "ent_b", campaignId: "cmp_two", entityType: "npc", title: "B" });

    expect(() =>
      createRelation({ relationId: "rel_bad", campaignId: "cmp_one", source, target, relationType: "knows" }),
    ).toThrow("Relations must connect entities in the same campaign");
  });

  it("allows only one active session per campaign state", () => {
    const state = createCampaignState("cmp_one");
    state.sessions.set("sess_one", createSession({ sessionId: "sess_one", campaignId: "cmp_one", title: "One" }));
    state.sessions.set("sess_two", createSession({ sessionId: "sess_two", campaignId: "cmp_one", title: "Two" }));

    expect(() => createSession({ sessionId: "sess_three", campaignId: "cmp_one", title: "Three", existingSessions: [...state.sessions.values()] })).toThrow(
      "Only one active session per campaign is allowed",
    );
  });

  it("requires a summary to close a session", () => {
    const session = createSession({ sessionId: "sess_one", campaignId: "cmp_one", title: "One" });
    expect(() => closeSession(session, "")).toThrow("Session summary is required");
  });
});
