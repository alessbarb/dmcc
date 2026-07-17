import type { EntityRelationshipNeighborhood } from "./entityRelationshipNeighborhood.js";

export interface EntityRelationshipFilters {
  direction: "all" | "incoming" | "outgoing";
  entityTypes: string[];
}

export function filterEntityNeighborhood(
  neighborhood: EntityRelationshipNeighborhood,
  filters: EntityRelationshipFilters,
): EntityRelationshipNeighborhood {
  const typeFilterActive = filters.entityTypes.length > 0;

  const visibleNeighborIds = new Set(
    neighborhood.neighbors
      .filter((neighbor) => !typeFilterActive || filters.entityTypes.includes(neighbor.entityType))
      .map((neighbor) => neighbor.entityId),
  );

  const connections = neighborhood.connections
    .map((connection) => {
      const otherId = connection.entityAId === neighborhood.center.entityId ? connection.entityBId : connection.entityAId;
      const isSelfConnection = otherId === neighborhood.center.entityId;

      if (!isSelfConnection && !visibleNeighborIds.has(otherId)) return null;

      const relations = connection.relations.filter((relation) => {
        if (filters.direction === "all") return true;
        return relation.orientationFromCenter === filters.direction;
      });

      if (relations.length === 0) return null;
      return { ...connection, relations };
    })
    .filter((connection): connection is NonNullable<typeof connection> => connection !== null);

  const connectedNeighborIds = new Set(
    connections.flatMap((connection) => [connection.entityAId, connection.entityBId]),
  );
  const neighbors = neighborhood.neighbors.filter((neighbor) => connectedNeighborIds.has(neighbor.entityId));

  return {
    ...neighborhood,
    neighbors,
    connections,
    totalRelations: connections.reduce((sum, connection) => sum + connection.relations.length, 0),
  };
}
