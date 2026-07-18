import type { EntityId } from "@shared/ids.js";
import { generateSessionPlanItemId, generateSessionPlanContentLinkId } from "@shared/ids.js";
import type { SessionPlan, SessionPlanContentRole } from "./sessionPlan.js";

// Canvas node type -> plan classification, per docs/engineering/session-evolution.md §36.1.
const ROLE_BY_ENTITY_TYPE: Partial<Record<string, SessionPlanContentRole>> = {
  clue: "available_clue",
  secret: "secret_at_risk",
  consequence: "expected_consequence",
  front: "front_in_play",
  clock: "clock_in_play",
};

export type CanvasClassifiableEntity = {
  entityId: EntityId;
  entityType: string;
};

// Adds a Canvas selection to a plan: scenes become flow items, everything else
// becomes a content link with a role derived from entity type (unknown types
// fall back to involved_entity). Skips entities already present so repeated
// drops from Canvas don't pile up duplicates.
export function addEntitiesToSessionPlan(params: {
  plan: Omit<SessionPlan, "revision">;
  entities: CanvasClassifiableEntity[];
  anchorFlowItemId?: string;
}): Omit<SessionPlan, "revision"> {
  const { plan, entities, anchorFlowItemId } = params;

  const existingSceneEntityIds = new Set(
    plan.flowItems.filter((item) => item.kind === "scene").map((item) => item.sceneEntityId),
  );
  const existingLinkKeys = new Set(plan.contentLinks.map((link) => `${link.role}:${link.entityId}`));

  const newFlowItems: SessionPlan["flowItems"] = [];
  const newContentLinks: SessionPlan["contentLinks"] = [];
  let order = plan.flowItems.length;
  let linkOrder = plan.contentLinks.length;

  for (const entity of entities) {
    if (entity.entityType === "scene") {
      if (existingSceneEntityIds.has(entity.entityId)) continue;
      existingSceneEntityIds.add(entity.entityId);
      newFlowItems.push({
        id: generateSessionPlanItemId(),
        kind: "scene",
        sceneEntityId: entity.entityId,
        order: order++,
      });
      continue;
    }

    const role = ROLE_BY_ENTITY_TYPE[entity.entityType] ?? "involved_entity";
    const key = `${role}:${entity.entityId}`;
    if (existingLinkKeys.has(key)) continue;
    existingLinkKeys.add(key);
    newContentLinks.push({
      id: generateSessionPlanContentLinkId(),
      entityId: entity.entityId,
      role,
      ...(anchorFlowItemId !== undefined && { anchorFlowItemId }),
      order: linkOrder++,
    });
  }

  return {
    ...plan,
    flowItems: [...plan.flowItems, ...newFlowItems],
    contentLinks: [...plan.contentLinks, ...newContentLinks],
  };
}
