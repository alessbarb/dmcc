import type { Entity } from "../../../shared/stores/campaignStore.js";

export function resolveActiveEntity(entities: Entity[], entityId: string): Entity | null {
  return entities.find((entity) => entity.entityId === entityId && !entity.archived) ?? null;
}
