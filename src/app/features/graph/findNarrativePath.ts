export interface Node {
  id: string;
  entityType: string;
  entityData?: any;
}

export interface Edge {
  source: string | any;
  target: string | any;
}

/**
 * Finds the anchor node in the graph, usually the main secret.
 * Target metadata.graphAnchor === "main_secret" or fallback to the first critical + dm_only + active secret.
 */
export function findNarrativeAnchor(nodes: Node[]): string | null {
  // First, find node with graphAnchor === "main_secret"
  for (const node of nodes) {
    const meta = node.entityData?.metadata;
    if (meta && meta.graphAnchor === "main_secret") {
      return node.id;
    }
  }

  // Fallback to first critical + dm_only + active secret
  for (const node of nodes) {
    if (node.entityType === "secret") {
      const entity = node.entityData;
      if (
        entity &&
        entity.importance === "critical" &&
        entity.visibility?.kind === "dm_only" &&
        entity.status === "active"
      ) {
        return node.id;
      }
    }
  }

  return null;
}

/**
 * Finds the shortest path in an undirected graph from startId to targetId using BFS.
 * Returns an array of node IDs representing the path, including startId and targetId.
 * If no path exists, returns null.
 */
export function findUndirectedShortestPath(
  nodes: Node[],
  edges: Edge[],
  startId: string,
  targetId: string
): string[] | null {
  if (startId === targetId) {
    return [startId];
  }

  // Build adjacency list
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  const getStrId = (val: any): string => {
    if (typeof val === "object" && val !== null) {
      return val.id || val.entityId || "";
    }
    return String(val);
  };

  for (const edge of edges) {
    const u = getStrId(edge.source);
    const v = getStrId(edge.target);

    // Some edges might refer to nodes not in the current visible nodes set
    if (adj.has(u) && adj.has(v)) {
      adj.get(u)!.push(v);
      adj.get(v)!.push(u);
    }
  }

  // BFS
  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parent = new Map<string, string>();

  let found = false;
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  if (!found) {
    return null;
  }

  // Reconstruct path
  const path: string[] = [];
  let curr = targetId;
  while (curr !== startId) {
    const p = parent.get(curr);
    if (!p) break;
    path.push(curr);
    curr = p;
  }
  path.push(startId);
  return path.reverse();
}
