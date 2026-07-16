import { createId } from "@shared/ids.js";
import { canvasApi } from "../api.js";
import type { CampaignStateStore } from "./campaignStore.js";

type StoreSet = (
  partial: Partial<CampaignStateStore> | ((state: CampaignStateStore) => Partial<CampaignStateStore>)
) => void;

type CanvasActions = Pick<
  CampaignStateStore,
  | "createCanvas"
  | "setActiveCanvasId"
  | "placeNodeOnCanvas"
  | "updateCanvasNode"
  | "updateCanvasNodesLayout"
  | "removeNodeFromCanvas"
  | "addEdgeToCanvas"
  | "updateCanvasEdge"
  | "removeEdgeFromCanvas"
  | "convertNoteToEntity"
  | "saveViewport"
>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createCanvasActions(set: StoreSet, get: () => CampaignStateStore): CanvasActions {
  return {
createCanvas: async (title, kind, description) => {
  const { activeCampaignId } = get();
  if (!activeCampaignId) return;
  set({ loading: true, error: null });
  try {
    const canvasId = createId("cvs");
    const res = await canvasApi.createCanvas(activeCampaignId, { canvasId, title, kind, description });
    if (!res.ok) throw new Error("Failed to create canvas");
    set({
      activeCanvasId: canvasId,
      activeCanvasIdByCampaignId: {
        ...get().activeCanvasIdByCampaignId,
        [activeCampaignId]: canvasId,
      },
    });
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err), loading: false });
  }
},

setActiveCanvasId: (canvasId) => {
  const campaignId = get().activeCampaignId;
  set({
    activeCanvasId: canvasId,
    ...(campaignId
      ? {
          activeCanvasIdByCampaignId: {
            ...get().activeCanvasIdByCampaignId,
            [campaignId]: canvasId,
          },
        }
      : {}),
  });
},

placeNodeOnCanvas: async (canvasId, node) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;
  set({ error: null });

  const nodeId = createId("cvn");
  const nodeObj = {
    id: nodeId,
    campaignId: activeCampaignId,
    canvasId,
    kind: node.kind,
    entityId: node.entityId,
    factId: node.factId,
    text: node.text,
    title: node.title,
    color: node.color,
    groupId: node.groupId,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    collapsed: false,
    zIndex: node.zIndex || 1,
    status: "draft" as const,
    visibility: "dm" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const canvas = canvasesById[canvasId];
  if (canvas) {
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: {
          ...canvas,
          nodes: [...canvas.nodes, nodeObj],
        },
      },
    });
  }

  try {
    const res = await canvasApi.createNode(activeCampaignId, canvasId, nodeObj);
    if (!res.ok) throw new Error("Failed to place node");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

updateCanvasNode: async (canvasId, nodeId, updates) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;
  set({ error: null });

  const canvas = canvasesById[canvasId];
  if (canvas) {
    const nodes = canvas.nodes.map((n) =>
      n.id === nodeId ? { ...n, ...updates } : n
    );
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: { ...canvas, nodes },
      },
    });
  }

  try {
    const res = await canvasApi.updateNode(activeCampaignId, canvasId, nodeId, updates);
    if (!res.ok) throw new Error("Failed to update node");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

updateCanvasNodesLayout: async (canvasId, nodeUpdates) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;

  const canvas = canvasesById[canvasId];
  if (canvas) {
    const nodes = canvas.nodes.map((n) => {
      const update = nodeUpdates.find((up) => up.nodeId === n.id);
      if (update) {
        return {
          ...n,
          x: update.x,
          y: update.y,
          ...(update.width !== undefined && { width: update.width }),
          ...(update.height !== undefined && { height: update.height }),
          ...(update.parentId !== undefined && { parentId: update.parentId ?? undefined }),
          ...(update.groupId !== undefined && { groupId: update.groupId ?? undefined }),
        };
      }
      return n;
    });
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: { ...canvas, nodes },
      },
    });
  }

  try {
    const res = await canvasApi.moveNode(activeCampaignId, canvasId, nodeUpdates);
    if (!res.ok) throw new Error("Failed to update layout");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

removeNodeFromCanvas: async (canvasId, nodeId) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;
  set({ error: null });

  const canvas = canvasesById[canvasId];
  if (canvas) {
    const nodes = canvas.nodes.filter((n) => n.id !== nodeId);
    const edges = canvas.edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId);
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: { ...canvas, nodes, edges },
      },
    });
  }

  try {
    const res = await canvasApi.deleteNode(activeCampaignId, canvasId, nodeId);
    if (!res.ok) throw new Error("Failed to remove node");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

addEdgeToCanvas: async (canvasId, edge) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;
  set({ error: null });

  const edgeId = createId("cve");
  const edgeObj = {
    id: edgeId,
    campaignId: activeCampaignId,
    canvasId,
    sourceNodeId: edge.sourceNodeId,
    targetNodeId: edge.targetNodeId,
    relationshipId: edge.relationshipId,
    label: edge.label,
    status: edge.status ?? "draft",
    visibility: edge.visibility ?? "dm",
    style: edge.style ?? "solid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const canvas = canvasesById[canvasId];
  if (canvas) {
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: {
          ...canvas,
          edges: [...canvas.edges, edgeObj],
        },
      },
    });
  }

  try {
    const res = await canvasApi.createEdge(activeCampaignId, canvasId, edgeObj);
    if (!res.ok) throw new Error("Failed to add edge");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

updateCanvasEdge: async (canvasId, edgeId, updates) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;
  set({ error: null });

  const canvas = canvasesById[canvasId];
  if (canvas) {
    const edges = canvas.edges.map((e) =>
      e.id === edgeId ? { ...e, ...updates } : e
    );
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: { ...canvas, edges },
      },
    });
  }

  try {
    const res = await canvasApi.updateEdge(activeCampaignId, canvasId, edgeId, updates);
    if (!res.ok) throw new Error("Failed to update edge");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

removeEdgeFromCanvas: async (canvasId, edgeId) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;
  set({ error: null });

  const canvas = canvasesById[canvasId];
  if (canvas) {
    const edges = canvas.edges.filter((e) => e.id !== edgeId);
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: { ...canvas, edges },
      },
    });
  }

  try {
    const res = await canvasApi.deleteEdge(activeCampaignId, canvasId, edgeId);
    if (!res.ok) throw new Error("Failed to remove edge");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err) });
    await get().reloadCampaignIfActive(activeCampaignId);
  }
},

convertNoteToEntity: async (canvasId, nodeId, payload) => {
  const { activeCampaignId } = get();
  if (!activeCampaignId) return;
  set({ loading: true, error: null });
  try {
    const res = await canvasApi.convertNoteToEntity(activeCampaignId, canvasId, nodeId, payload);
    if (!res.ok) throw new Error("Failed to convert note to entity");
    await get().reloadCampaignIfActive(activeCampaignId);
  } catch (err) {
    set({ error: errorMessage(err), loading: false });
  }
},

saveViewport: async (canvasId, viewport) => {
  const { activeCampaignId, canvasesById } = get();
  if (!activeCampaignId) return;

  const canvas = canvasesById[canvasId];
  if (canvas) {
    set({
      canvasesById: {
        ...canvasesById,
        [canvasId]: { ...canvas, viewport },
      },
    });
  }

  try {
    await canvasApi.updateCanvas(activeCampaignId, canvasId, { viewport });
  } catch (err) {
    console.error("Failed to save viewport", err);
  }
},
  };
}
