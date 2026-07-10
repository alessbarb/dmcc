import type { CanvasEdge, CanvasNode } from "@core/domain/canvas/types.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";

/**
 * Visual/presentational visibility for canvas items.
 *
 * CanvasVisibility only controls whether the canvas node or edge itself is
 * displayed in public/player canvas views. It is intentionally coarse and is
 * not the campaign data exposure source of truth; use VisibilityRule on domain
 * entities, relations, and facts for authoritative access semantics.
 */
export type CanvasVisibility = "dm" | "public";

export interface DomainVisibilityCarrier {
  visibility?: unknown;
}

/** Converts authoritative domain visibility to coarse visual canvas visibility. */
export function visibilityRuleToCanvasVisibility(visibility: VisibilityRule): CanvasVisibility {
  return visibility.kind === "dm_only" ? "dm" : "public";
}

/** Converts visual canvas visibility to the closest authoritative domain rule. */
export function canvasVisibilityToVisibilityRule(canvasVisibility: CanvasVisibility): VisibilityRule {
  return canvasVisibility === "dm" ? { kind: "dm_only" } : { kind: "public" };
}

/**
 * CanvasNode.visibility and CanvasEdge.visibility are visual canvas visibility flags.
 * They only decide whether a canvas item itself is shown in public/player canvas views.
 * Domain visibility stays on entities, relations, and facts and remains authoritative
 * for campaign data exposure. While previous data is migrated, helpers also accept
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
