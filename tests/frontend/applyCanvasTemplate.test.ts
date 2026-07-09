import { describe, expect, it } from "vitest";
import { applyCanvasTemplate, type ApplyCanvasTemplateStore, type CreatedCanvasNodeRef } from "../../src/frontend/dm/canvas/services/applyCanvasTemplate.js";
import type { CanvasTemplate } from "../../src/frontend/dm/canvas/templates/types.js";

const buildStore = () => {
  const nodesByCanvas = new Map<string, CreatedCanvasNodeRef[]>();
  const edges: Array<{ status: string; relationshipId?: string }> = [];
  const relations: Array<{ sourceEntityId: string; targetEntityId: string; relationType: string }> = [];
  let entityCount = 0;
  let nodeCount = 0;
  let relationCount = 0;

  const store: ApplyCanvasTemplateStore = {
    createEntity: async () => {
      entityCount += 1;
      return { entityId: `ent_${entityCount}` };
    },
    createRelation: async (payload) => {
      relationCount += 1;
      relations.push(payload);
      return `rel_${relationCount}`;
    },
    addEdgeToCanvas: async (_canvasId, edge) => {
      edges.push(edge);
    },
    placeNodeOnCanvas: async (canvasId, node) => {
      nodeCount += 1;
      const canvasNodes = nodesByCanvas.get(canvasId) ?? [];
      canvasNodes.push({
        id: `node_${nodeCount}`,
        entityId: typeof node.entityId === "string" ? node.entityId : undefined,
        kind: typeof node.kind === "string" ? node.kind : undefined,
        title: typeof node.title === "string" ? node.title : undefined,
        x: typeof node.x === "number" ? node.x : undefined,
        y: typeof node.y === "number" ? node.y : undefined,
      });
      nodesByCanvas.set(canvasId, canvasNodes);
    },
    updateCanvasNode: async () => undefined,
    getCanvasNodes: (canvasId) => nodesByCanvas.get(canvasId) ?? [],
  };

  return { edges, relations, store };
};

const template: CanvasTemplate = {
  id: "test-template",
  entities: [
    { entityType: "npc", title: "Source" },
    { entityType: "npc", title: "Target" },
  ],
  nodes: [
    { entityIndex: 0, x: 0, y: 0 },
    { entityIndex: 1, x: 100, y: 0 },
  ],
  relations: [{ from: 0, to: 1, label: "knows", status: "domain" }],
};

describe("applyCanvasTemplate", () => {
  it("creates a real Relation before adding a domain edge", async () => {
    const { edges, relations, store } = buildStore();

    await applyCanvasTemplate("canvas_1", template, store);

    expect(relations).toEqual([
      { sourceEntityId: "ent_1", targetEntityId: "ent_2", relationType: "knows", visibility: { kind: "dm_only" }, description: undefined },
    ]);
    expect(edges).toEqual([
      expect.objectContaining({ status: "domain", relationshipId: "rel_1" }),
    ]);
  });

  it("never emits a domain edge without relationshipId", async () => {
    const { edges, store } = buildStore();

    await applyCanvasTemplate("canvas_1", template, store);

    const invalidDomainEdges = edges.filter((edge) => edge.status === "domain" && !edge.relationshipId);
    expect(invalidDomainEdges).toEqual([]);
  });
});
