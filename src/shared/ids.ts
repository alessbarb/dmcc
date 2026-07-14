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
export type ShortcutId = string;
export type NotebookId = string;
export type NotebookItemId = string;
export type StoryThreadId = string;
export type StoryStepId = string;

function getWebCrypto(): Crypto {
  const crypto = globalThis.crypto;
  if (!crypto || typeof crypto.getRandomValues !== "function") {
    throw new Error("Secure random ID generation requires Web Crypto getRandomValues");
  }
  return crypto;
}

function uuidV4(): string {
  const crypto = getWebCrypto();
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
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

export function generateShortcutId(): ShortcutId {
  return createId("sht");
}

export function generateNotebookId(): NotebookId {
  return createId("nbk");
}

export function generateNotebookItemId(): NotebookItemId {
  return createId("nbi");
}

export function generateStoryThreadId(): StoryThreadId {
  return createId("sth");
}

export function generateStoryStepId(): StoryStepId {
  return createId("stp");
}
