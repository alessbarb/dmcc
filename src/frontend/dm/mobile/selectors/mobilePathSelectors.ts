import type { Relation } from "../../../shared/stores/campaignStore.js";
import type { MobileCampaignStateLike, MobileNarrativePath } from "../types.js";
import { activeItems, toEntitySummary } from "./mobileSharedSelectors.js";

const DEFAULT_LOGIC_RELATIONS = ["points_to", "reveals", "unlocks", "confirms", "contradicts", "causes", "depends_on", "blocks", "foreshadows"];

export function buildNarrativePaths(state: MobileCampaignStateLike, startEntityId: string, options: { maxDepth?: number; relationTypes?: string[]; includeSecrets?: boolean; includeDraftEdges?: boolean } = {}): MobileNarrativePath[] {
  const maxDepth = options.maxDepth ?? 4;
  const relationTypes = new Set(options.relationTypes ?? DEFAULT_LOGIC_RELATIONS);
  const entityById = new Map(activeItems(state.entities).map((entity) => [entity.entityId, entity]));
  const relations = activeItems(state.relations).filter((relation: Relation) => relationTypes.has(relation.relationType));
  const paths: MobileNarrativePath[] = [];
  const visit = (entityId: string, path: MobileNarrativePath["steps"], seen: Set<string>) => {
    const entity = entityById.get(entityId);
    if (!entity || seen.has(entityId)) return;
    const currentPath = [...path, { entity: toEntitySummary(entity) }];
    const outgoing = relations.filter((relation) => relation.sourceEntityId === entityId && !seen.has(relation.targetEntityId));
    if (currentPath.length > 1 || outgoing.length === 0 || currentPath.length > maxDepth) {
      paths.push({ id: currentPath.map((step) => step.entity.id).join("->"), steps: currentPath, hasSecretContent: currentPath.some((step) => step.entity.visibility && (step.entity.visibility as { kind?: string }).kind === "dm_only") });
    }
    if (currentPath.length >= maxDepth) return;
    for (const relation of outgoing) {
      const target = entityById.get(relation.targetEntityId);
      if (!target) continue;
      const relationSummary = { id: relation.relationId, sourceEntityId: relation.sourceEntityId, targetEntityId: relation.targetEntityId, targetTitle: target.title, relationType: relation.relationType, direction: "outgoing" as const, visibility: relation.visibility, status: relation.status };
      visit(relation.targetEntityId, [...currentPath.slice(0, -1), { entity: toEntitySummary(entity), relation: relationSummary }], new Set([...seen, entityId]));
    }
  };
  visit(startEntityId, [], new Set());
  return paths.slice(0, 12);
}
