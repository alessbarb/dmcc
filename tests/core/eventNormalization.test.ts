import { describe, expect, it } from "vitest";
import { normalizeEventPayload } from "../../src/core/domain/shared/normalizeEventPayload.js";
import { applyEvent, createEmptyCampaignProjection } from "../../src/core/projections/campaignProjection.js";
import { eventPayloadSchemas } from "../../src/core/domain/shared/events.js";

describe("event payload normalization", () => {
  it("uses the same canonical previous shape during persistence and projection", () => {
    const occurredAt = "2025-01-02T03:04:05.000Z";
    const payload = {
      id: "ent_previous",
      type: "npc",
      title: "Legacy NPC",
      visibility: { mode: "players_all" },
    };
    const normalized = normalizeEventPayload("EntityCreated", payload, occurredAt);
    expect(normalized).toMatchObject({
      id: "ent_previous",
      entityId: "ent_previous",
      type: "npc",
      entityType: "npc",
      visibility: { kind: "players_all" },
      createdAt: occurredAt,
      updatedAt: occurredAt,
    });

    const projection = applyEvent(createEmptyCampaignProjection(), {
      sequence: 1,
      eventId: "evt_previous",
      campaignId: "cmp_previous",
      type: "EntityCreated",
      occurredAt,
      actorId: "usr_previous",
      payload,
      hash: "previous",
      schemaVersion: 1,
    } as any);
    expect(projection.entities.get("ent_previous")).toMatchObject(normalized);
  });

  it("rejects canvas updates that mutate identity or use invalid dimensions", () => {
    expect(eventPayloadSchemas.CanvasNodeUpdated.safeParse({
      canvasId: "cnv_one",
      nodeId: "node_one",
      updates: { id: "node_attack" },
    }).success).toBe(false);
    expect(eventPayloadSchemas.CanvasNodeUpdated.safeParse({
      canvasId: "cnv_one",
      nodeId: "node_one",
      updates: { width: -1 },
    }).success).toBe(false);
    expect(eventPayloadSchemas.CanvasNodesLayoutUpdated.safeParse({
      canvasId: "cnv_one",
      nodeUpdates: [{ nodeId: "node_one", x: Number.NaN, y: 0 }],
    }).success).toBe(false);
  });
});
