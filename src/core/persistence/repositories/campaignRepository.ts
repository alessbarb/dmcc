import type { DomainEventType } from "../../domain/shared/events.js";
import { createHash } from "crypto";

export class CommandConflictError extends Error {
  constructor(public readonly commandId: string) {
    super(`Conflict: Command ID ${commandId} already used for a different operation`);
    Object.setPrototypeOf(this, CommandConflictError.prototype);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function calculateCommandHash(command: unknown): string {
  const canonicalStringify = (value: unknown): string => {
    if (value === null) return "null";
    if (typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(",")}]`;
    if (!isRecord(value)) return JSON.stringify(value);
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalStringify(entryValue)}`).join(",")}}`;
  };

  return createHash("sha256").update(canonicalStringify(command)).digest("hex");
}

export function rewriteCampaignEventPayload(
  _eventType: DomainEventType,
  payload: unknown,
  sourceCampaignId: string,
  newCampaignId: string
): unknown {
  if (payload === sourceCampaignId) return newCampaignId;
  if (Array.isArray(payload)) {
    return payload.map((value) => rewriteCampaignEventPayload(_eventType, value, sourceCampaignId, newCampaignId));
  }
  if (payload && typeof payload === "object") {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        key,
        rewriteCampaignEventPayload(_eventType, value, sourceCampaignId, newCampaignId),
      ])
    );
  }
  return payload;
}
