import { describe, expect, it } from "vitest";
import { domainEventTypeSchema, eventPayloadSchemas } from "../../src/core/domain/shared/events.js";

describe("domain event payload schema coverage", () => {
  it("has a runtime payload schema for every domain event type", () => {
    const eventTypes = domainEventTypeSchema.options;
    expect(Object.keys(eventPayloadSchemas).sort()).toEqual([...eventTypes].sort());
  });

  it("validates player invitation event payloads", () => {
    expect(eventPayloadSchemas.PlayerInvitationCreated.parse({
      inviteId: "inv_1",
      inviteTokenHash: "hash",
      label: "Mesa A",
      createdAt: "2026-07-16T20:00:00.000Z",
    })).toMatchObject({ inviteId: "inv_1" });
    expect(eventPayloadSchemas.PlayerInvitationConsumed.safeParse({
      inviteId: "inv_1",
      playerId: "ply_1",
      emailHash: "hash",
      consumedAt: "2026-07-16T20:01:00.000Z",
    }).success).toBe(true);
    expect(eventPayloadSchemas.PlayerInvitationRevoked.safeParse({ inviteId: "inv_1" }).success).toBe(true);
  });
});
