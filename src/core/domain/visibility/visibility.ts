import type { EntityId, PlayerId } from "@shared/ids.js";

/**
 * Authoritative domain visibility rule for campaign data exposure.
 *
 * VisibilityRule belongs to entities, relations, and facts and is the source of
 * truth for who may know or access campaign data. Canvas-specific visual state
 * is represented separately by CanvasVisibility in the canvas presentation
 * layer.
 */
export type VisibilityRule =
  | { kind: "dm_only" }
  | { kind: "party" }
  | { kind: "players"; playerIds: PlayerId[] }
  | { kind: "characters"; characterEntityIds: EntityId[] }
  | { kind: "public" };

export const dmOnlyVisibility: VisibilityRule = { kind: "dm_only" };

/** Returns true for DM-only domain visibility, including previous { kind: "dm" } values. */
export function isDmOnlyVisibility(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const kind = (value as { kind?: unknown }).kind;
  return kind === "dm_only" || kind === "dm";
}
