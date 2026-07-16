import type { Entity, Relation } from "../../../shared/stores/campaignStore.js";

export interface RelationshipGraphEntity {
  entityId: string;
  title: string;
  subtitle?: string;
  entityType: string;
  importance?: string;
  imageUrl?: string;
  isCenter: boolean;
}

export interface RelationshipGraphRelation {
  relationId: string;
  relationType: string;
  description?: string;
  sourceEntityId: string;
  targetEntityId: string;
  orientationFromCenter: "outgoing" | "incoming" | "self";
}

export interface RelationshipGraphConnection {
  connectionId: string;
  entityAId: string;
  entityBId: string;
  relations: RelationshipGraphRelation[];
}

export interface EntityRelationshipNeighborhood {
  center: RelationshipGraphEntity;
  neighbors: RelationshipGraphEntity[];
  connections: RelationshipGraphConnection[];
  missingEntityRelations: Relation[];
  totalRelations: number;
}

function toGraphEntity(entity: Entity, isCenter: boolean): RelationshipGraphEntity {
  const imageUrl = typeof entity.metadata?.imageUrl === "string" ? entity.metadata.imageUrl : undefined;
  return {
    entityId: entity.entityId,
    title: entity.title,
    subtitle: entity.subtitle,
    entityType: entity.entityType,
    importance: entity.importance,
    imageUrl,
    isCenter,
  };
}

function connectionId(entityAId: string, entityBId: string): string {
  return [entityAId, entityBId].sort().join("::");
}

function compareNeighbors(a: RelationshipGraphEntity, b: RelationshipGraphEntity): number {
  if (a.entityType !== b.entityType) return a.entityType.localeCompare(b.entityType);
  if (a.title !== b.title) return a.title.localeCompare(b.title);
  return a.entityId.localeCompare(b.entityId);
}

function compareRelations(a: RelationshipGraphRelation, b: RelationshipGraphRelation): number {
  if (a.orientationFromCenter !== b.orientationFromCenter) {
    const order = { outgoing: 0, incoming: 1, self: 2 };
    return order[a.orientationFromCenter] - order[b.orientationFromCenter];
  }
  if (a.relationType !== b.relationType) return a.relationType.localeCompare(b.relationType);
  return a.relationId.localeCompare(b.relationId);
}

export function buildEntityNeighborhood(
  entity: Entity,
  entities: Entity[],
  relations: Relation[],
): EntityRelationshipNeighborhood {
  const entityById = new Map(entities.map((candidate) => [candidate.entityId, candidate]));
  const center = toGraphEntity(entity, true);

  const directRelations = relations.filter(
    (relation) =>
      !relation.archived &&
      (relation.sourceEntityId === entity.entityId || relation.targetEntityId === entity.entityId),
  );

  const neighborsById = new Map<string, RelationshipGraphEntity>();
  const connectionsById = new Map<string, RelationshipGraphConnection>();
  const missingEntityRelations: Relation[] = [];
  let totalRelations = 0;

  for (const relation of directRelations) {
    const isSelf = relation.sourceEntityId === relation.targetEntityId;
    const otherId = relation.sourceEntityId === entity.entityId ? relation.targetEntityId : relation.sourceEntityId;
    const other = isSelf ? entity : entityById.get(otherId);

    if (!other || other.archived) {
      missingEntityRelations.push(relation);
      continue;
    }

    if (!isSelf && !neighborsById.has(other.entityId)) {
      neighborsById.set(other.entityId, toGraphEntity(other, false));
    }

    const orientationFromCenter: RelationshipGraphRelation["orientationFromCenter"] = isSelf
      ? "self"
      : relation.sourceEntityId === entity.entityId
        ? "outgoing"
        : "incoming";

    const graphRelation: RelationshipGraphRelation = {
      relationId: relation.relationId,
      relationType: relation.relationType,
      description: relation.description,
      sourceEntityId: relation.sourceEntityId,
      targetEntityId: relation.targetEntityId,
      orientationFromCenter,
    };

    const id = connectionId(entity.entityId, otherId);
    const existing = connectionsById.get(id);
    if (existing) {
      existing.relations.push(graphRelation);
    } else {
      connectionsById.set(id, {
        connectionId: id,
        entityAId: entity.entityId,
        entityBId: otherId,
        relations: [graphRelation],
      });
    }
    totalRelations += 1;
  }

  const neighbors = Array.from(neighborsById.values()).sort(compareNeighbors);
  const connections = Array.from(connectionsById.values())
    .map((connection) => ({ ...connection, relations: [...connection.relations].sort(compareRelations) }))
    .sort((a, b) => a.connectionId.localeCompare(b.connectionId));

  return { center, neighbors, connections, missingEntityRelations, totalRelations };
}
