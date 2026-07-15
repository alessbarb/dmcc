import { createId } from "@shared/ids.js";
import type { ChecklistItem, MaybeCampaignState } from "../sessionTypes.js";

export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function joinLines(value: string[] | undefined): string {
  return Array.isArray(value) ? value.filter(Boolean).join("\n") : "";
}

export function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function isPrepState(value: string): value is "draft" | "ready" {
  return value === "draft" || value === "ready";
}

export function findEntityTitle(campaignState: MaybeCampaignState | undefined, entityId: string): string {
  return campaignState?.entities?.find((entity) => entity.entityId === entityId)?.title ?? entityId;
}

export function mergeChecklist(existing: ChecklistItem[] | undefined, labels: string[]): ChecklistItem[] {
  return labels.map((label) => {
    const current = existing?.find((item) => item.label === label);
    return {
      id: current?.id ?? createId("chk"),
      label,
      done: current?.done ?? false,
      priority: current?.priority ?? "medium",
    };
  });
}
