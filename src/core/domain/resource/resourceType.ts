/**
 * Types that have a canonical navigation target (addable to Atajos).
 * Grows in later PRs when a new type gets a ResourceNavigationDefinition —
 * PR 5 adds "notebook", PR 6 adds "story_thread"/"story_step".
 */
export type ShortcutTargetType = "entity" | "session" | "canvas";

/** Types referenceable as Cuaderno items (PR 5). */
export type NotebookItemTargetType =
  | "entity"
  | "fact"
  | "relation"
  | "session"
  | "session_event"
  | "canvas"
  | "attachment";

/** Types placeable on the Canvas from another surface (e.g. Cuadernos, PR 5). */
export type CanvasPlaceableResourceType = "entity" | "fact" | "attachment";

export type CampaignResourceType =
  | ShortcutTargetType
  | NotebookItemTargetType
  | CanvasPlaceableResourceType;
