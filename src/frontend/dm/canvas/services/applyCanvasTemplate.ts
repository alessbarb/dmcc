import type { CanvasTemplate } from "../templates/types.js";
import { connectCanvasNodes, type CanvasEdgePayload, type CreateRelationPayload } from "./connectCanvasNodes.js";

export interface CreatedCanvasNodeRef {
  id: string;
  entityId?: string;
  kind?: string;
  title?: string;
  x?: number;
  y?: number;
}

export interface ApplyCanvasTemplateStore {
  createEntity: (payload: {
    entityType: string;
    title: string;
    subtitle?: string;
    summary?: string;
    status: string;
    importance: string;
    visibility: { kind: "dm_only" | "public" };
  }) => Promise<{ entityId?: string } | undefined>;
  createRelation: (payload: CreateRelationPayload) => Promise<string | undefined>;
  addEdgeToCanvas: (canvasId: string, edge: CanvasEdgePayload) => Promise<void>;
  placeNodeOnCanvas: (canvasId: string, node: Record<string, unknown>) => Promise<void>;
  updateCanvasNode: (canvasId: string, nodeId: string, updates: Record<string, unknown>) => Promise<void>;
  getCanvasNodes: (canvasId: string) => CreatedCanvasNodeRef[];
  createFact?: (payload: {
    statement: string;
    kind: string;
    confidence: string;
    visibility?: { kind: "dm_only" | "public" };
    relatedEntityIds: string[];
    source: { kind: string };
  }) => Promise<unknown>;
}

const requireEntityId = (entityId: string | undefined, templateId: string, entityIndex: number): string => {
  if (!entityId) {
    throw new Error(`Canvas template ${templateId} could not create entity at index ${entityIndex}.`);
  }
  return entityId;
};

const findEntityNodeId = (nodes: CreatedCanvasNodeRef[], entityId: string): string | undefined =>
  nodes.find((node) => node.entityId === entityId)?.id;

const findGroupId = (nodes: CreatedCanvasNodeRef[], title: string, x: number, y: number): string | undefined =>
  nodes.find((node) => node.kind === "group" && node.title === title && node.x === x && node.y === y)?.id;

/**
 * Applies a reusable canvas template by creating entities, placing nodes/groups,
 * and routing every connection through relation-aware edge creation.
 */
export const applyCanvasTemplate = async (
  canvasId: string,
  template: CanvasTemplate,
  store: ApplyCanvasTemplateStore,
): Promise<void> => {
  const entityIds: string[] = [];

  for (const [entityIndex, entity] of template.entities.entries()) {
    const result = await store.createEntity({
      ...entity,
      status: "ready",
      importance: "normal",
      visibility: entity.visibility ?? { kind: "dm_only" },
    });
    entityIds.push(requireEntityId(result?.entityId, template.id, entityIndex));
  }

  const groupIds = new Map<string, string>();
  for (const group of template.groups ?? []) {
    await store.placeNodeOnCanvas(canvasId, {
      kind: "group",
      title: group.title,
      color: group.color,
      x: group.x,
      y: group.y,
      width: group.width,
      height: group.height,
    });

    const groupNodeId = findGroupId(store.getCanvasNodes(canvasId), group.title, group.x, group.y);
    if (groupNodeId) {
      groupIds.set(group.key, groupNodeId);
      if (group.groupType) {
        await store.updateCanvasNode(canvasId, groupNodeId, { groupType: group.groupType });
      }
    }
  }

  for (const node of template.nodes) {
    await store.placeNodeOnCanvas(canvasId, {
      kind: "entity",
      entityId: entityIds[node.entityIndex],
      x: node.x,
      y: node.y,
      groupId: node.groupKey ? groupIds.get(node.groupKey) : undefined,
    });
  }

  for (const relation of template.relations) {
    const sourceEntityId = entityIds[relation.from];
    const targetEntityId = entityIds[relation.to];
    const nodes = store.getCanvasNodes(canvasId);
    const sourceNodeId = findEntityNodeId(nodes, sourceEntityId);
    const targetNodeId = findEntityNodeId(nodes, targetEntityId);

    if (!sourceNodeId || !targetNodeId) continue;

    await connectCanvasNodes({
      canvasId,
      sourceNode: { id: sourceNodeId, entityId: sourceEntityId },
      targetNode: { id: targetNodeId, entityId: targetEntityId },
      edge: {
        label: relation.label,
        status: relation.status ?? "draft",
        visibility: relation.visibility ?? "dm",
        style: relation.style ?? "solid",
        description: relation.description,
      },
      relation: relation.status === "domain" ? {
        relationType: relation.relationType ?? relation.label.replace(/\s+/g, "_"),
        description: relation.description,
        visibility: { kind: relation.visibility === "public" ? "public" : "dm_only" },
      } : undefined,
      createRelation: store.createRelation,
      addEdgeToCanvas: store.addEdgeToCanvas,
    });
  }

  if (store.createFact) {
    for (const fact of template.facts ?? []) {
      await store.createFact({
        statement: fact.statement,
        kind: fact.kind,
        confidence: fact.confidence ?? "medium",
        visibility: fact.visibility ?? { kind: "dm_only" },
        relatedEntityIds: fact.relatedEntityIndexes?.map((index) => entityIds[index]) ?? [],
        source: { kind: "canvas_template" },
      });
    }
  }
};
