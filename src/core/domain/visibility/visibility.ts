import type { EntityId, PlayerId } from "@shared/ids.js";

export type VisibilityRule =
  | { kind: "dm_only" }
  | { kind: "party" }
  | { kind: "players"; playerIds: PlayerId[] }
  | { kind: "characters"; characterEntityIds: EntityId[] }
  | { kind: "public" };

export const dmOnlyVisibility: VisibilityRule = { kind: "dm_only" };


export type CanvasVisibility = "dm" | "public";

/** Converts domain visibility to the canvas visual visibility model. */
export function toCanvasVisibility(visibility: VisibilityRule): CanvasVisibility {
  return visibility.kind === "dm_only" ? "dm" : "public";
}

/** Converts canvas visual visibility back to a coarse domain visibility rule. */
export function toVisibilityRule(canvasVisibility: CanvasVisibility): VisibilityRule {
  return canvasVisibility === "dm" ? { kind: "dm_only" } : { kind: "public" };
}

/** Returns true for DM-only domain visibility, including legacy { kind: "dm" } values. */
export function isDmOnlyVisibility(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const kind = (value as { kind?: unknown }).kind;
  return kind === "dm_only" || kind === "dm";
}
