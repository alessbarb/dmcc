import type { DomainEventType as SharedDomainEventType, StoredEvent as SharedStoredEvent } from "./shared/events.js";

export type DomainEventType = SharedDomainEventType;
// Defaults to `any` so untyped callers (StoredEvent[] without a generic) keep
// loose payload access; changing this default ripples into ~18 call sites.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoredEvent<TPayload = any> = SharedStoredEvent<TPayload>;
