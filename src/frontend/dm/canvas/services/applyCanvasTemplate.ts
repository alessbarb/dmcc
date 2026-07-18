import type { CanvasTemplate } from "../templates/types.js";
import { connectCanvasNodes } from "./connectCanvasNodes.js";
import { canvasVisibilityToVisibilityRule } from "./canvasVisibility.js";
import type { CampaignStateStore, CanvasNodeUpdate } from "../../../shared/stores/campaignStore.js";

export interface CreatedCanvasNodeRef {
  id: string;
  entityId?: string;
  kind?: string;
  title?: string;
  x?: number;
  y?: number;
}

export type ApplyCanvasTemplateStore = Pick<
  CampaignStateStore,
  "createEntity" | "createRelation" | "addEdgeToCanvas" | "placeNodeOnCanvas" | "updateCanvasNode"
> &
  Partial<Pick<CampaignStateStore, "createFact">> & {
    getCanvasNodes: (canvasId: string) => CreatedCanvasNodeRef[];
  };

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
        // groupType is a frontend-only convention not in the canvasNodeSchema; pre-existing quirk, not fixed here.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        await store.updateCanvasNode(canvasId, groupNodeId, { groupType: group.groupType } as unknown as CanvasNodeUpdate);
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
        visibility: canvasVisibilityToVisibilityRule(relation.visibility === "public" ? "public" : "dm"),
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
        source: { kind: "manual" as const, note: `canvas_template:${template.id}` },
      });
    }
  }
};
