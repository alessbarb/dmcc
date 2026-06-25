import type { CampaignId, EventId } from "../shared/ids.js";

export type DomainEventType =
  | "VaultCreated"
  | "CampaignCreated"
  | "CampaignUpdated"
  | "PlayerProfileCreated"
  | "PlayerProfileUpdated"
  | "PlayerProfileArchived"
  | "EntityCreated"
  | "EntityUpdated"
  | "EntityArchived"
  | "RelationCreated"
  | "RelationUpdated"
  | "RelationArchived"
  | "FactCreated"
  | "FactUpdated"
  | "FactArchived"
  | "VisibilityChanged"
  | "SessionCreated"
  | "SessionStarted"
  | "SessionClosed"
  | "SessionEventRecorded"
  | "AttachmentAdded"
  | "AttachmentRemoved"
  | "TagCreated"
  | "TagUpdated"
  | "ImportCompleted"
  | "ExportCompleted"
  | "SnapshotCreated"
  | "SettingsUpdated";

export interface StoredEvent<TPayload = unknown> {
  sequence: number;
  eventId: EventId;
  campaignId?: CampaignId;
  type: DomainEventType;
  occurredAt: string;
  actorId: string;
  payload: TPayload;
  previousHash?: string;
  hash?: string;
  schemaVersion: number;
}
