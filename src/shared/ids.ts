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

export function createId(prefix: string): string {
  return `${prefix}_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
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
