function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeEventPayload<TPayload>(type: string, payload: TPayload, occurredAt: string): TPayload | Record<string, unknown> {
  if (!payload || typeof payload !== "object") return payload;
  if (!isRecord(payload)) return payload;
  const normalized: Record<string, unknown> = { ...payload };
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
  if (isRecord(normalized.visibility)) {
    const vis = normalized.visibility;
    const kind = vis.kind || vis.mode || "dm_only";
    const { mode: _mode, ...rest } = vis;
    normalized.visibility = { ...rest, kind };
  }
  return normalized;
}
