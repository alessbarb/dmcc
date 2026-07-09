export type CanvasEdgeStatus = "draft" | "domain";

export interface CanvasNodeRef {
  id: string;
  entityId?: string;
}

export interface CreateRelationPayload {
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  description?: string;
  visibility?: unknown;
  force?: boolean;
}

export interface CanvasEdgePayload {
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  status: CanvasEdgeStatus;
  relationshipId?: string;
  visibility?: "dm" | "public" | string;
  style?: "solid" | "dashed" | "dotted" | string;
  description?: string;
}

export interface ConnectCanvasNodesInput {
  canvasId: string;
  sourceNode: CanvasNodeRef;
  targetNode: CanvasNodeRef;
  edge: Omit<CanvasEdgePayload, "sourceNodeId" | "targetNodeId" | "relationshipId"> & {
    relationshipId?: string;
  };
  relation?: Omit<CreateRelationPayload, "sourceEntityId" | "targetEntityId">;
  createRelation: (payload: CreateRelationPayload) => Promise<string | undefined>;
  addEdgeToCanvas: (canvasId: string, edge: CanvasEdgePayload) => Promise<void>;
}

const requireNonEmpty = (value: string | undefined, fieldName: string): string => {
  if (!value) {
    throw new Error(`connectCanvasNodes requires ${fieldName} for domain canvas edges.`);
  }
  return value;
};

/**
 * Creates a canvas edge and, for domain edges, guarantees that a backing domain
 * relation exists and is assigned as the edge relationshipId.
 */
export const connectCanvasNodes = async ({
  canvasId,
  sourceNode,
  targetNode,
  edge,
  relation,
  createRelation,
  addEdgeToCanvas,
}: ConnectCanvasNodesInput): Promise<string | undefined> => {
  let relationshipId = edge.relationshipId;

  if (edge.status === "domain") {
    if (!relationshipId) {
      const sourceEntityId = requireNonEmpty(sourceNode.entityId, "sourceNode.entityId");
      const targetEntityId = requireNonEmpty(targetNode.entityId, "targetNode.entityId");
      const relationType = requireNonEmpty(relation?.relationType || edge.label, "relation.relationType");

      relationshipId = await createRelation({
        sourceEntityId,
        targetEntityId,
        relationType,
        description: relation?.description || edge.description,
        visibility: relation?.visibility,
        force: relation?.force,
      });
    }

    requireNonEmpty(relationshipId, "relationshipId");
  }

  await addEdgeToCanvas(canvasId, {
    ...edge,
    sourceNodeId: sourceNode.id,
    targetNodeId: targetNode.id,
    relationshipId,
  });

  return relationshipId;
};
