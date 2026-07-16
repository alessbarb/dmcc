import type { Canvas, CanvasNode } from "@core/domain/canvas/types.js";
import type { Entity, Fact } from "../../../shared/stores/campaignStore.js";

export type CanvasNavigatorVisibilityFilter = "all" | "public" | "private";
export type CanvasNavigatorStatusFilter = "all" | "active" | "archived";

export interface CampaignStateLike {
  entities?: Entity[];
  facts?: Fact[] | Map<string, Fact>;
}

export interface PlacedEntityNode {
  node: CanvasNode;
  entity: Entity;
}

export interface PlacedFactNode {
  node: CanvasNode;
  fact: Fact;
}

export interface PlacedNoteNode {
  node: CanvasNode;
}

export interface PlacedCanvasNodesByType {
  entities: PlacedEntityNode[];
  facts: PlacedFactNode[];
  notes: PlacedNoteNode[];
}

export interface CanvasNavigatorFilters {
  query?: string;
  type?: string;
  visibility?: CanvasNavigatorVisibilityFilter;
  status?: CanvasNavigatorStatusFilter;
}

const normalize = (value: unknown): string => String(value ?? "").trim().toLowerCase();

const factList = (facts: CampaignStateLike["facts"]): Fact[] => {
  if (!facts) return [];
  return facts instanceof Map ? Array.from(facts.values()) : facts;
};

const isPublicVisibility = (visibility: unknown): boolean => {
  if (visibility && typeof visibility === "object" && "kind" in visibility) {
    return (visibility as { kind?: string }).kind === "public";
  }
  return visibility === "public";
};

const matchesQuery = (haystack: Array<unknown>, query: string): boolean => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  return haystack.some((value) => normalize(value).includes(normalizedQuery));
};

const matchesEntityFilters = (entity: Entity, filters: CanvasNavigatorFilters): boolean => {
  if (filters.type && filters.type !== "all" && entity.entityType !== filters.type) return false;
  if (filters.status === "active" && entity.archived) return false;
  if (filters.status === "archived" && !entity.archived) return false;
  if (filters.visibility === "public" && !isPublicVisibility(entity.visibility)) return false;
  if (filters.visibility === "private" && isPublicVisibility(entity.visibility)) return false;
  return true;
};

/** Returns placed canvas nodes grouped by their navigable content type. */
export function getPlacedNodesByType(canvas: Canvas | null | undefined, campaignState: CampaignStateLike | null | undefined): PlacedCanvasNodesByType {
  const entities = campaignState?.entities ?? [];
  const facts = factList(campaignState?.facts);
  const entityById = new Map(entities.map((entity) => [entity.entityId, entity]));
  const factById = new Map(facts.map((fact) => [fact.factId, fact]));

  return (canvas?.nodes ?? []).reduce<PlacedCanvasNodesByType>((acc, node) => {
    if (node.kind === "entity" && node.entityId) {
      const entity = entityById.get(node.entityId);
      if (entity) acc.entities.push({ node, entity });
    } else if (node.kind === "fact" && node.factId) {
      const fact = factById.get(node.factId);
      if (fact) acc.facts.push({ node, fact });
    } else if (node.kind === "note") {
      acc.notes.push({ node });
    }
    return acc;
  }, { entities: [], facts: [], notes: [] });
}

/** Calculates campaign entities that are not represented by an entity node on the current canvas. */
export function getUnplacedEntities(canvas: Canvas | null | undefined, campaignState: CampaignStateLike | null | undefined): Entity[] {
  const placedEntityIds = new Set((canvas?.nodes ?? []).filter((node) => node.kind === "entity").map((node) => node.entityId).filter(Boolean));
  return (campaignState?.entities ?? []).filter((entity) => !placedEntityIds.has(entity.entityId));
}

function searchEntities(entities: Entity[], query: string): Entity[] {
  return entities.filter((entity) => matchesQuery([entity.title, entity.subtitle, entity.summary, entity.entityType], query));
}

export function searchFacts(facts: Fact[], query: string): Fact[] {
  return facts.filter((fact) => matchesQuery([fact.statement], query));
}

export function searchNoteNodes(nodes: CanvasNode[], query: string): CanvasNode[] {
  return nodes.filter((node) => matchesQuery([node.title, node.text], query));
}

export function filterNavigatorEntities(entities: Entity[], filters: CanvasNavigatorFilters): Entity[] {
  return searchEntities(entities, filters.query ?? "").filter((entity) => matchesEntityFilters(entity, filters));
}

export function filterNavigatorFacts(facts: Fact[], filters: CanvasNavigatorFilters): Fact[] {
  if (filters.type && filters.type !== "all" && filters.type !== "fact") return [];
  return searchFacts(facts, filters.query ?? "");
}

export function filterNavigatorNotes(nodes: CanvasNode[], filters: CanvasNavigatorFilters): CanvasNode[] {
  if (filters.type && filters.type !== "all" && filters.type !== "note") return [];
  return searchNoteNodes(nodes, filters.query ?? "");
}
