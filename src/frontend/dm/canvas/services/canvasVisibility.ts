import type { CanvasEdge, CanvasNode } from "@core/domain/canvas/types.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";

export type CanvasVisibility = "dm" | "public";

export interface DomainVisibilityCarrier {
  visibility?: unknown;
}

/**
 * CanvasNode.visibility and CanvasEdge.visibility are visual canvas visibility flags.
 * They only decide whether a canvas item itself is shown in public/player canvas views.
 * Domain visibility stays on entities, relations, and facts and remains authoritative
 * for campaign data exposure. While legacy data is migrated, helpers also accept
 * old domain-style values such as { kind: "dm" } and { kind: "dm_only" }.
 */
export function isDmOnlyCanvasVisibility(value: unknown): boolean {
  return value === "dm" || value === "dm_only" || isDmOnlyVisibility(value);
}

export function isPublicCanvasNode(
  node: CanvasNode,
  linkedDomainItem?: DomainVisibilityCarrier | null,
): boolean {
  if (isDmOnlyCanvasVisibility(node.visibility)) return false;
  if (!linkedDomainItem) return true;
  return !isDmOnlyVisibility(linkedDomainItem.visibility);
}

export function isPublicCanvasEdge(
  edge: CanvasEdge,
  linkedRelation?: DomainVisibilityCarrier | null,
): boolean {
  if (edge.style === "secret" || isDmOnlyCanvasVisibility(edge.visibility)) return false;
  if (!linkedRelation) return true;
  return !isDmOnlyVisibility(linkedRelation.visibility);
}
