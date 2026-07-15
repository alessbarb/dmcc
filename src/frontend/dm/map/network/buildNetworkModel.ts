import type { Entity, Fact, Relation } from "../../../shared/stores/campaignStore.js";

export const FULL_NETWORK_NODE_LIMIT = 250;

export const NETWORK_ENTITY_NODE_WIDTH = 176;
export const NETWORK_ENTITY_NODE_HEIGHT = 104;
export const NETWORK_FACT_NODE_WIDTH = 156;
export const NETWORK_FACT_NODE_HEIGHT = 88;

export interface NetworkEntityNodeModel {
  id: string;
  kind: "entity";
  entityId: string;
  width: number;
  height: number;
}

export interface NetworkFactNodeModel {
  id: string;
  kind: "fact";
  factId: string;
  width: number;
  height: number;
}

export type NetworkNodeModel = NetworkEntityNodeModel | NetworkFactNodeModel;

export interface NetworkEdgeModel {
  id: string;
  kind: "relation" | "fact";
  source: string;
  target: string;
  relationType?: string;
}

export interface NetworkModel {
  nodes: NetworkNodeModel[];
  edges: NetworkEdgeModel[];
}

export interface BuildNetworkModelInput {
  entities: Entity[];
  relations: Relation[];
  facts?: Fact[];
  entityTypeFilter?: string[] | null;
  includedEntityIds?: Set<string> | null;
}

/**
 * Derives Red 2D nodes/edges from live campaign state. Never persists positions:
 * layout is recomputed by computeNetworkLayout on every render.
 */
export function buildNetworkModel(input: BuildNetworkModelInput): NetworkModel {
  const { entities, relations, facts = [], entityTypeFilter, includedEntityIds } = input;

  const visibleEntities = entities.filter((entity) => {
    if (entity.archived) return false;
    if (entityTypeFilter && entityTypeFilter.length > 0 && !entityTypeFilter.includes(entity.entityType)) return false;
    if (includedEntityIds && !includedEntityIds.has(entity.entityId)) return false;
    return true;
  });

  const visibleEntityIds = new Set(visibleEntities.map((entity) => entity.entityId));

  const nodes: NetworkNodeModel[] = visibleEntities.map((entity) => ({
    id: entity.entityId,
    kind: "entity",
    entityId: entity.entityId,
    width: NETWORK_ENTITY_NODE_WIDTH,
    height: NETWORK_ENTITY_NODE_HEIGHT,
  }));

  const edges: NetworkEdgeModel[] = relations
    .filter((relation) =>
      !relation.archived &&
      visibleEntityIds.has(relation.sourceEntityId) &&
      visibleEntityIds.has(relation.targetEntityId),
    )
    .map((relation) => ({
      id: relation.relationId,
      kind: "relation",
      source: relation.sourceEntityId,
      target: relation.targetEntityId,
      relationType: relation.relationType,
    }));

  for (const fact of facts) {
    if (fact.archived) continue;
    const relatedVisibleIds = fact.relatedEntityIds.filter((entityId) => visibleEntityIds.has(entityId));
    if (relatedVisibleIds.length === 0) continue;

    nodes.push({
      id: fact.factId,
      kind: "fact",
      factId: fact.factId,
      width: NETWORK_FACT_NODE_WIDTH,
      height: NETWORK_FACT_NODE_HEIGHT,
    });

    for (const entityId of relatedVisibleIds) {
      edges.push({
        id: `${fact.factId}::${entityId}`,
        kind: "fact",
        source: fact.factId,
        target: entityId,
      });
    }
  }

  return { nodes, edges };
}

export interface ResolveNetworkFocusInput {
  entityIds: string[];
  relations: Relation[];
  selectedEntityId?: string | null;
  currentQuestId?: string | null;
  currentLocationId?: string | null;
  nextSessionCriticalEntityId?: string | null;
}

export type NetworkFocusResult =
  | { mode: "full" }
  | { mode: "neighborhood"; anchorEntityId: string; entityIds: string[] }
  | { mode: "search-required" };

function buildUndirectedAdjacency(entityIds: string[], relations: Relation[]): Map<string, string[]> {
  const idSet = new Set(entityIds);
  const adjacency = new Map<string, string[]>();
  for (const id of entityIds) adjacency.set(id, []);

  for (const relation of relations) {
    if (relation.archived) continue;
    const { sourceEntityId, targetEntityId } = relation;
    if (!idSet.has(sourceEntityId) || !idSet.has(targetEntityId)) continue;
    adjacency.get(sourceEntityId)?.push(targetEntityId);
    adjacency.get(targetEntityId)?.push(sourceEntityId);
  }

  return adjacency;
}

function neighborhoodOfDepth(anchorId: string, adjacency: Map<string, string[]>, depth: number): string[] {
  const visited = new Set<string>([anchorId]);
  let frontier = [anchorId];

  for (let step = 0; step < depth; step += 1) {
    const nextFrontier: string[] = [];
    for (const nodeId of frontier) {
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          nextFrontier.push(neighbor);
        }
      }
    }
    frontier = nextFrontier;
  }

  return Array.from(visited);
}

/**
 * Decides how to render the Red 2D when the candidate node count is large.
 * Under the threshold: render everything. Over it, with a selected entity:
 * depth-2 neighborhood of that entity. Over it, with no selection: fall back
 * through currentQuestId -> currentLocationId -> next-session critical entity;
 * if none of those anchors exist, force the search UI instead of an arbitrary dump.
 */
export function resolveNetworkFocus(input: ResolveNetworkFocusInput): NetworkFocusResult {
  const { entityIds, relations, selectedEntityId, currentQuestId, currentLocationId, nextSessionCriticalEntityId } = input;

  if (entityIds.length <= FULL_NETWORK_NODE_LIMIT) {
    return { mode: "full" };
  }

  const idSet = new Set(entityIds);

  if (selectedEntityId && idSet.has(selectedEntityId)) {
    const adjacency = buildUndirectedAdjacency(entityIds, relations);
    return {
      mode: "neighborhood",
      anchorEntityId: selectedEntityId,
      entityIds: neighborhoodOfDepth(selectedEntityId, adjacency, 2),
    };
  }

  const anchorCandidates = [currentQuestId, currentLocationId, nextSessionCriticalEntityId];
  for (const candidate of anchorCandidates) {
    if (candidate && idSet.has(candidate)) {
      const adjacency = buildUndirectedAdjacency(entityIds, relations);
      return {
        mode: "neighborhood",
        anchorEntityId: candidate,
        entityIds: neighborhoodOfDepth(candidate, adjacency, 2),
      };
    }
  }

  return { mode: "search-required" };
}
