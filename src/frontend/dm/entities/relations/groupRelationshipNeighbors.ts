import type { RelationshipGraphEntity } from "./entityRelationshipNeighborhood.js";

/** Neighbor-count thresholds from the design doc's density table (not relation counts —
 *  parallel relations to the same neighbor collapse into one connection already). */
export interface RelationshipDensityPolicy {
  /** Above this, grouping-by-type becomes available (but stays opt-in). */
  groupingSuggestedAt: number;
  /** Above this, grouping starts active by default (still per-type expandable). */
  groupingDefaultAt: number;
}

export const DEFAULT_DENSITY_POLICY: RelationshipDensityPolicy = {
  groupingSuggestedAt: 24,
  groupingDefaultAt: 40,
};

export interface RelationshipGroupNode {
  groupId: string;
  entityType: string;
  entities: RelationshipGraphEntity[];
}

export type RelationshipRingItem =
  | { kind: "entity"; entity: RelationshipGraphEntity }
  | { kind: "group"; group: RelationshipGroupNode };

export function shouldOfferGrouping(
  neighborCount: number,
  policy: RelationshipDensityPolicy = DEFAULT_DENSITY_POLICY,
): boolean {
  return neighborCount > policy.groupingSuggestedAt;
}

export function defaultGroupingEnabled(
  neighborCount: number,
  policy: RelationshipDensityPolicy = DEFAULT_DENSITY_POLICY,
): boolean {
  return neighborCount > policy.groupingDefaultAt;
}

/**
 * Collapses same-type neighbors into `RelationshipGroupNode` placeholders when grouping is
 * enabled, except types the caller has explicitly expanded (or single-member types, which
 * have nothing to collapse). Pure and layout-agnostic: the caller positions the returned
 * items same as it would individual neighbors.
 */
export function groupRelationshipNeighbors(
  neighbors: RelationshipGraphEntity[],
  groupingEnabled: boolean,
  expandedGroupTypes: ReadonlySet<string> = new Set(),
): RelationshipRingItem[] {
  if (!groupingEnabled) {
    return neighbors.map((entity) => ({ kind: "entity", entity }));
  }

  const byType = new Map<string, RelationshipGraphEntity[]>();
  for (const entity of neighbors) {
    const bucket = byType.get(entity.entityType);
    if (bucket) bucket.push(entity);
    else byType.set(entity.entityType, [entity]);
  }

  const items: RelationshipRingItem[] = [];
  for (const [entityType, entities] of [...byType.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (entities.length === 1 || expandedGroupTypes.has(entityType)) {
      for (const entity of entities) items.push({ kind: "entity", entity });
    } else {
      items.push({ kind: "group", group: { groupId: `group:${entityType}`, entityType, entities } });
    }
  }
  return items;
}
