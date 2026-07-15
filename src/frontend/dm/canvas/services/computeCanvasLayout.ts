import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

export type CanvasLayoutPreset =
  | "compact"
  | "horizontal"
  | "vertical"
  | "organic"
  | "radial"
  | "remove-overlaps";

export interface CanvasLayoutNode {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  groupId?: string | null;
  kind?: string;
}

export interface CanvasLayoutEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface CanvasLayoutGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface CanvasLayoutInput {
  nodes: CanvasLayoutNode[];
  edges: CanvasLayoutEdge[];
  groups: CanvasLayoutGroup[];
  preset: CanvasLayoutPreset;
  rootNodeId?: string | null;
  viewportWidth: number;
  viewportHeight: number;
}

export interface CanvasLayoutResult {
  nodeUpdates: Array<{
    nodeId: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>;
}

export async function computeCanvasLayout(input: CanvasLayoutInput): Promise<CanvasLayoutResult> {
  const { nodes, edges, groups, preset, rootNodeId, viewportWidth, viewportHeight } = input;

  const groupIds = new Set(groups.map((g) => g.id));
  const cardNodes = nodes.filter((n) => n.kind !== "group");

  // Determine edges to include
  let layoutEdges = [...edges];

  // If radial layout with a root node, build a BFS spanning tree to avoid cycles determining radial layers
  if (preset === "radial" && rootNodeId) {
    const adj: Record<string, string[]> = {};
    for (const edge of edges) {
      if (!adj[edge.sourceNodeId]) adj[edge.sourceNodeId] = [];
      if (!adj[edge.targetNodeId]) adj[edge.targetNodeId] = [];
      adj[edge.sourceNodeId].push(edge.targetNodeId);
      adj[edge.targetNodeId].push(edge.sourceNodeId);
    }

    const visited = new Set<string>();
    const treeEdges: CanvasLayoutEdge[] = [];
    const queue: string[] = [rootNodeId];
    visited.add(rootNodeId);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors = adj[curr] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          const originalEdge = edges.find(
            (e) =>
              (e.sourceNodeId === curr && e.targetNodeId === neighbor) ||
              (e.sourceNodeId === neighbor && e.targetNodeId === curr)
          );
          if (originalEdge) {
            treeEdges.push(originalEdge);
          }
        }
      }
    }
    layoutEdges = treeEdges;
  }

  // Root ELK layout options
  let rootLayoutOptions: Record<string, string> = {};
  switch (preset) {
    case "compact": {
      const direction = viewportWidth >= viewportHeight ? "RIGHT" : "DOWN";
      rootLayoutOptions = {
        "elk.algorithm": "org.eclipse.elk.layered",
        "elk.direction": direction,
        "elk.edgeRouting": "ORTHOGONAL",
        "elk.spacing.nodeNode": "40",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.separateConnectedComponents": "true",
        "elk.padding": "[top=40,left=40,bottom=40,right=40]",
      };
      break;
    }
    case "horizontal":
      rootLayoutOptions = {
        "elk.algorithm": "org.eclipse.elk.layered",
        "elk.direction": "RIGHT",
        "elk.edgeRouting": "ORTHOGONAL",
        "elk.spacing.nodeNode": "40",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.separateConnectedComponents": "true",
        "elk.padding": "[top=40,left=40,bottom=40,right=40]",
      };
      break;
    case "vertical":
      rootLayoutOptions = {
        "elk.algorithm": "org.eclipse.elk.layered",
        "elk.direction": "DOWN",
        "elk.edgeRouting": "ORTHOGONAL",
        "elk.spacing.nodeNode": "40",
        "elk.layered.spacing.nodeNodeBetweenLayers": "80",
        "elk.separateConnectedComponents": "true",
        "elk.padding": "[top=40,left=40,bottom=40,right=40]",
      };
      break;
    case "organic":
      rootLayoutOptions = {
        "elk.algorithm": "org.eclipse.elk.stress",
        "elk.separateConnectedComponents": "true",
        "elk.spacing.nodeNode": "60",
        "elk.padding": "[top=40,left=40,bottom=40,right=40]",
      };
      break;
    case "radial":
      rootLayoutOptions = {
        "elk.algorithm": "org.eclipse.elk.radial",
        "elk.separateConnectedComponents": "true",
        "elk.spacing.nodeNode": "60",
        "elk.padding": "[top=40,left=40,bottom=40,right=40]",
      };
      break;
    case "remove-overlaps":
      rootLayoutOptions = {
        "elk.algorithm": "org.eclipse.elk.sporeOverlap",
        "elk.spacing.nodeNode": "30",
        "elk.padding": "[top=20,left=20,bottom=20,right=20]",
      };
      break;
  }

  // Build the ELK hierarchical nodes list
  const elkGroupsMap = new Map<string, any>();
  for (const group of groups) {
    elkGroupsMap.set(group.id, {
      id: group.id,
      width: group.width || 340,
      height: group.height || 220,
      x: group.x || 0,
      y: group.y || 0,
      children: [],
      layoutOptions: {
        "elk.algorithm": "org.eclipse.elk.layered",
        "elk.direction": preset === "vertical" ? "DOWN" : "RIGHT",
        "elk.padding": "[top=40,left=24,bottom=24,right=24]",
        "elk.spacing.nodeNode": "24",
      },
    });
  }

  const topLevelChildren: any[] = [];
  const rootNodeFirstList: any[] = [];

  for (const card of cardNodes) {
    const elkCard = {
      id: card.id,
      width: card.width || 220,
      height: card.height || 140,
      x: card.x,
      y: card.y,
    };

    const gId = card.groupId;
    if (gId && elkGroupsMap.has(gId)) {
      elkGroupsMap.get(gId).children.push(elkCard);
    } else {
      if (preset === "radial" && rootNodeId && card.id === rootNodeId) {
        rootNodeFirstList.push(elkCard);
      } else {
        topLevelChildren.push(elkCard);
      }
    }
  }

  // Add the root node at the beginning of the topLevelChildren list if radial layout
  const allTopChildren = [...rootNodeFirstList, ...topLevelChildren];

  // Add groups to the top level children list
  for (const elkGroup of elkGroupsMap.values()) {
    if (elkGroup.children.length === 0) {
      delete elkGroup.children;
      delete elkGroup.layoutOptions;
    }
    allTopChildren.push(elkGroup);
  }

  // Build ELK edges
  const elkEdges = elkEdgesFromList(layoutEdges, nodes, groupIds);

  const elkGraph = {
    id: "root",
    layoutOptions: rootLayoutOptions,
    children: allTopChildren,
    edges: elkEdges,
  };

  const layoutResult = await elk.layout(elkGraph);

  const nodeUpdates: Array<{
    nodeId: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }> = [];

  function collectPositions(elkNode: any, parentAbsoluteX: number, parentAbsoluteY: number) {
    if (elkNode.id !== "root") {
      const absoluteX = Math.round(parentAbsoluteX + (elkNode.x ?? 0));
      const absoluteY = Math.round(parentAbsoluteY + (elkNode.y ?? 0));

      const isGroup = groupIds.has(elkNode.id);

      nodeUpdates.push({
        nodeId: elkNode.id,
        x: absoluteX,
        y: absoluteY,
        ...(isGroup && {
          width: Math.round(elkNode.width || 340),
          height: Math.round(elkNode.height || 220),
        }),
      });

      if (elkNode.children) {
        for (const child of elkNode.children) {
          collectPositions(child, absoluteX, absoluteY);
        }
      }
    } else {
      if (elkNode.children) {
        for (const child of elkNode.children) {
          collectPositions(child, 0, 0);
        }
      }
    }
  }

  collectPositions(layoutResult, 0, 0);

  return {
    nodeUpdates,
  };
}

function elkEdgesFromList(
  edges: CanvasLayoutEdge[],
  nodes: CanvasLayoutNode[],
  groupIds: Set<string>
) {
  return edges
    .filter((e) => {
      const sourceExists = nodes.some((n) => n.id === e.sourceNodeId) || groupIds.has(e.sourceNodeId);
      const targetExists = nodes.some((n) => n.id === e.targetNodeId) || groupIds.has(e.targetNodeId);
      return sourceExists && targetExists;
    })
    .map((e) => ({
      id: e.id,
      sources: [e.sourceNodeId],
      targets: [e.targetNodeId],
    }));
}
