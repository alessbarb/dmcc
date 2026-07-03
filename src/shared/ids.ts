export type CampaignId = string;
export type PlayerId = string;
export type EntityId = string;
export type RelationId = string;
export type FactId = string;
export type SessionId = string;
export type SessionEventId = string;
export type EventId = string;
export type AttachmentId = string;
export type TagId = string;

function uuidV4(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for non-secure HTTP contexts (e.g. LAN access over plain HTTP)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function createId(prefix: string): string {
  return `${prefix}_${uuidV4().replace(/-/g, "")}`;
}

export function isIdWithPrefix(id: string, prefix: string): boolean {
  return id.startsWith(`${prefix}_`);
}

export function assertIdPrefix(id: string, prefix: string): void {
  if (!isIdWithPrefix(id, prefix)) {
    throw new Error(`Expected id prefix ${prefix}_`);
  }
}

export function generateCampaignId(): CampaignId {
  return createId("cmp");
}

export function generatePlayerId(): PlayerId {
  return createId("ply");
}

export function generateEntityId(): EntityId {
  return createId("ent");
}

export function generateRelationId(): RelationId {
  return createId("rel");
}

export function generateFactId(): FactId {
  return createId("fact");
}

export function generateSessionId(): SessionId {
  return createId("sess");
}

export function generateSessionEventId(): SessionEventId {
  return createId("sevt");
}

export function generateEventId(): EventId {
  return createId("evt");
}

export function generateAttachmentId(): AttachmentId {
  return createId("att");
}

export function generateTagId(): TagId {
  return createId("tag");
}
