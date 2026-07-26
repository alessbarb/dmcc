import { describe, expect, it } from "vitest";
import { projectDomainEventToActivity } from "../../src/core/projections/activity/projectDomainEventToActivity.js";
import type { StoredEvent } from "../../src/core/domain/shared/events.js";

// C3 (UX audit 2026-07-26): every canvas viewport autosave returned 500.
// Root cause traced live (server + real DB, this session): CanvasUpdated
// and CanvasArchived events carry their canvas id under `payload.canvasId`
// (see canvasCommandHandlers.ts), but this projector read `payload.id` for
// every canvas.* case — a field that only exists on CanvasCreated's payload
// (the full canvas object). That made targetId always resolve to null
// while targetType stayed "canvas", violating the DB's
// campaign_activity_target_coherence_check (target_type and target_id must
// be both null or both non-null) on literally every update/archive.
function baseEvent(type: string, payload: Record<string, unknown>): StoredEvent<Record<string, unknown>> {
  return {
    eventId: "evt_1",
    campaignId: "cmp_1",
    type,
    actorId: "usr_1",
    occurredAt: new Date().toISOString(),
    payload,
  } as unknown as StoredEvent<Record<string, unknown>>;
}

describe("projectDomainEventToActivity canvas target coherence", () => {
  it("resolves a non-null targetId for CanvasUpdated (payload.canvasId, not payload.id)", () => {
    const [activity] = projectDomainEventToActivity(
      baseEvent("CanvasUpdated", { canvasId: "cvs_1", title: "t", viewport: { x: 0, y: 0, zoom: 1 } }),
    );
    expect(activity.targetType).toBe("canvas");
    expect(activity.targetId).toBe("cvs_1");
  });

  it("resolves a non-null targetId for CanvasArchived (payload.canvasId, not payload.id)", () => {
    const [activity] = projectDomainEventToActivity(baseEvent("CanvasArchived", { canvasId: "cvs_1" }));
    expect(activity.targetType).toBe("canvas");
    expect(activity.targetId).toBe("cvs_1");
  });

  it("still resolves targetId for CanvasCreated (payload.id, the full canvas object)", () => {
    const [activity] = projectDomainEventToActivity(baseEvent("CanvasCreated", { id: "cvs_1", title: "t" }));
    expect(activity.targetType).toBe("canvas");
    expect(activity.targetId).toBe("cvs_1");
  });
});
