import type { DomainEventType as SharedDomainEventType, StoredEvent as SharedStoredEvent } from "./shared/events.js";

export type DomainEventType = SharedDomainEventType;
export type StoredEvent<TPayload = any> = SharedStoredEvent<TPayload>;
