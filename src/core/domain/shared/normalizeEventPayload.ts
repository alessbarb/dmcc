// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeEventPayload(type: string, payload: any, occurredAt: string): any {
  if (!payload || typeof payload !== "object") return payload;
  const normalized = { ...payload } as Record<string, unknown>;
  if (["EntityCreated", "EntityUpdated", "EntityArchived"].includes(type)) {
    normalized.entityId = normalized.entityId || normalized.id;
    normalized.id = normalized.entityId;
    normalized.entityType = normalized.entityType || normalized.type;
    normalized.type = normalized.entityType;
  }
  if (["RelationCreated", "RelationUpdated", "RelationArchived"].includes(type)) {
    normalized.relationId = normalized.relationId || normalized.id;
    normalized.id = normalized.relationId;
  }
  if (["FactCreated", "FactUpdated", "FactArchived"].includes(type)) {
    normalized.factId = normalized.factId || normalized.id;
    normalized.id = normalized.factId;
  }
  if (["SessionCreated", "SessionStarted", "SessionPrepUpdated", "SessionClosed"].includes(type)) {
    normalized.sessionId = normalized.sessionId || normalized.id;
    normalized.id = normalized.sessionId;
  }
  if (["EntityCreated", "RelationCreated", "FactCreated", "SessionCreated", "SessionStarted", "SessionPrepUpdated", "SessionClosed"].includes(type)) {
    normalized.createdAt = normalized.createdAt || occurredAt;
    normalized.updatedAt = normalized.updatedAt || occurredAt;
  }
  if (normalized.visibility && typeof normalized.visibility === "object") {
    const vis = normalized.visibility as Record<string, unknown>;
    const kind = vis.kind || vis.mode || "dm_only";
    const { mode: _mode, ...rest } = vis;
    normalized.visibility = { ...rest, kind };
  }
  return normalized;
}
