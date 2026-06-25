import type { EntityId, PlayerId } from "../../shared/ids.js";

export type VisibilityRule =
  | { kind: "dm_only" }
  | { kind: "party" }
  | { kind: "players"; playerIds: PlayerId[] }
  | { kind: "characters"; characterEntityIds: EntityId[] }
  | { kind: "public" };

export const dmOnlyVisibility: VisibilityRule = { kind: "dm_only" };
