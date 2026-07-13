import { create } from "zustand";
import { useCampaignStore } from "./campaignStore.js";
import type { CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";

export type CanvasNodeLayout = {
  nodeId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string | null;
  groupId?: string | null;
};

export type CanvasHistoryEntry =
  | {
      kind: "layout" | "move" | "resize" | "group-assignment";
      label: string;
      canvasId: string;
      before: CanvasNodeLayout[];
      after: CanvasNodeLayout[];
    }
  | {
      kind: "node-added";
      label: string;
      canvasId: string;
      node: CanvasNode;
    }
  | {
      kind: "node-removed";
      label: string;
      canvasId: string;
      node: CanvasNode;
      connectedEdges: CanvasEdge[];
    }
  | {
      kind: "edge-added";
      label: string;
      canvasId: string;
      edge: CanvasEdge;
    }
  | {
      kind: "edge-removed";
      label: string;
      canvasId: string;
      edge: CanvasEdge;
    };

export type CanvasHistory = {
  past: CanvasHistoryEntry[];
  future: CanvasHistoryEntry[];
};

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export interface CanvasHistoryState {
  histories: Record<string, CanvasHistory>;
  pushEntry: (canvasId: string, entry: DistributiveOmit<CanvasHistoryEntry, "canvasId">) => void;
  undo: (canvasId: string) => Promise<{ success: boolean; error?: string; entry?: CanvasHistoryEntry }>;
  redo: (canvasId: string) => Promise<{ success: boolean; error?: string; entry?: CanvasHistoryEntry }>;
  clearHistory: (canvasId: string) => void;
  clearAllHistories: () => void;
}

const MAX_HISTORY_LIMIT = 50;

export const useCanvasHistoryStore = create<CanvasHistoryState>((set, get) => ({
  histories: {},

  pushEntry: (canvasId, entry) => {
    const { histories } = get();
    const currentHistory = histories[canvasId] || { past: [], future: [] };

    const newEntry: CanvasHistoryEntry = {
      ...entry,
      canvasId,
    } as CanvasHistoryEntry;

    // Limit the past array size to MAX_HISTORY_LIMIT
    let newPast = [...currentHistory.past, newEntry];
    if (newPast.length > MAX_HISTORY_LIMIT) {
      newPast = newPast.slice(newPast.length - MAX_HISTORY_LIMIT);
    }

    set({
      histories: {
        ...histories,
        [canvasId]: {
          past: newPast,
          future: [], // clear future on new action
        },
      },
    });
  },

  undo: async (canvasId) => {
    const { histories } = get();
    const currentHistory = histories[canvasId];
    if (!currentHistory || currentHistory.past.length === 0) {
      return { success: false, error: "no_history" };
    }

    const entry = currentHistory.past[currentHistory.past.length - 1];
    const campaignStore = useCampaignStore.getState();
    const currentCanvas = campaignStore.canvasesById[canvasId];

    if (!currentCanvas) {
      return { success: false, error: "canvas_not_found" };
    }

    // Safety checks / Conflict resolution
    if (entry.kind === "layout" || entry.kind === "move" || entry.kind === "resize" || entry.kind === "group-assignment") {
      // Compare current layout of the affected nodes with the entry.after state
      for (const nodeAfter of entry.after) {
        const currentNode = currentCanvas.nodes.find((n) => n.id === nodeAfter.nodeId);
        if (!currentNode) {
          return { success: false, error: "conflict" };
        }

        // Compare positions (rounded to avoid floating-point/subpixel rounding mismatches)
        if (Math.round(currentNode.x ?? 0) !== Math.round(nodeAfter.x) ||
            Math.round(currentNode.y ?? 0) !== Math.round(nodeAfter.y)) {
          return { success: false, error: "conflict" };
        }

        // Compare dimensions if defined
        if (nodeAfter.width !== undefined && currentNode.width !== undefined && currentNode.width !== nodeAfter.width) {
          return { success: false, error: "conflict" };
        }
        if (nodeAfter.height !== undefined && currentNode.height !== undefined && currentNode.height !== nodeAfter.height) {
          return { success: false, error: "conflict" };
        }

        // Compare groupings
        const currentGroup = currentNode.groupId ?? currentNode.parentId ?? null;
        const afterGroup = nodeAfter.groupId ?? nodeAfter.parentId ?? null;
        if (currentGroup !== afterGroup) {
          return { success: false, error: "conflict" };
        }
      }

      // Safe to undo! Update the layout to entry.before
      const updates = entry.before.map((nodeBefore) => ({
        nodeId: nodeBefore.nodeId,
        x: nodeBefore.x,
        y: nodeBefore.y,
        ...(nodeBefore.width !== undefined && { width: nodeBefore.width }),
        ...(nodeBefore.height !== undefined && { height: nodeBefore.height }),
        groupId: nodeBefore.groupId,
        parentId: nodeBefore.parentId,
      }));

      await campaignStore.updateCanvasNodesLayout(canvasId, updates);
    } else {
      return { success: false, error: "unsupported_kind" };
    }

    // Update history state
    const newPast = currentHistory.past.slice(0, -1);
    const newFuture = [...currentHistory.future, entry];

    set({
      histories: {
        ...histories,
        [canvasId]: {
          past: newPast,
          future: newFuture,
        },
      },
    });

    return { success: true, entry };
  },

  redo: async (canvasId) => {
    const { histories } = get();
    const currentHistory = histories[canvasId];
    if (!currentHistory || currentHistory.future.length === 0) {
      return { success: false, error: "no_history" };
    }

    const entry = currentHistory.future[currentHistory.future.length - 1];
    const campaignStore = useCampaignStore.getState();
    const currentCanvas = campaignStore.canvasesById[canvasId];

    if (!currentCanvas) {
      return { success: false, error: "canvas_not_found" };
    }

    if (entry.kind === "layout" || entry.kind === "move" || entry.kind === "resize" || entry.kind === "group-assignment") {
      // Safety checks / Conflict resolution:
      // Compare current layout of the affected nodes with the entry.before state
      for (const nodeBefore of entry.before) {
        const currentNode = currentCanvas.nodes.find((n) => n.id === nodeBefore.nodeId);
        if (!currentNode) {
          return { success: false, error: "conflict" };
        }

        if (Math.round(currentNode.x ?? 0) !== Math.round(nodeBefore.x) ||
            Math.round(currentNode.y ?? 0) !== Math.round(nodeBefore.y)) {
          return { success: false, error: "conflict" };
        }

        if (nodeBefore.width !== undefined && currentNode.width !== undefined && currentNode.width !== nodeBefore.width) {
          return { success: false, error: "conflict" };
        }
        if (nodeBefore.height !== undefined && currentNode.height !== undefined && currentNode.height !== nodeBefore.height) {
          return { success: false, error: "conflict" };
        }

        const currentGroup = currentNode.groupId ?? currentNode.parentId ?? null;
        const beforeGroup = nodeBefore.groupId ?? nodeBefore.parentId ?? null;
        if (currentGroup !== beforeGroup) {
          return { success: false, error: "conflict" };
        }
      }

      // Safe to redo! Update the layout to entry.after
      const updates = entry.after.map((nodeAfter) => ({
        nodeId: nodeAfter.nodeId,
        x: nodeAfter.x,
        y: nodeAfter.y,
        ...(nodeAfter.width !== undefined && { width: nodeAfter.width }),
        ...(nodeAfter.height !== undefined && { height: nodeAfter.height }),
        groupId: nodeAfter.groupId,
        parentId: nodeAfter.parentId,
      }));

      await campaignStore.updateCanvasNodesLayout(canvasId, updates);
    } else {
      return { success: false, error: "unsupported_kind" };
    }

    // Update history state
    const newFuture = currentHistory.future.slice(0, -1);
    const newPast = [...currentHistory.past, entry];

    set({
      histories: {
        ...histories,
        [canvasId]: {
          past: newPast,
          future: newFuture,
        },
      },
    });

    return { success: true, entry };
  },

  clearHistory: (canvasId) => {
    const { histories } = get();
    const newHistories = { ...histories };
    delete newHistories[canvasId];
    set({ histories: newHistories });
  },

  clearAllHistories: () => {
    set({ histories: {} });
  },
}));
