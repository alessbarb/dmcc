export interface NetworkPathEdge {
  source: string;
  target: string;
}

/**
 * Shortest path between two entities in an undirected graph, via BFS.
 * Returns the ordered node IDs including start and target, or null if unreachable.
 */
export function findNetworkPath(
  nodeIds: string[],
  edges: NetworkPathEdge[],
  startId: string,
  targetId: string,
): string[] | null {
  if (startId === targetId) {
    return [startId];
  }

  const adjacency = new Map<string, string[]>();
  for (const id of nodeIds) adjacency.set(id, []);

  for (const edge of edges) {
    if (adjacency.has(edge.source) && adjacency.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target);
      adjacency.get(edge.target)!.push(edge.source);
    }
  }

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
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  if (!found) return null;

  const path: string[] = [];
  let current = targetId;
  while (current !== startId) {
    path.push(current);
    const previous = parent.get(current);
    if (!previous) return null;
    current = previous;
  }
  path.push(startId);
  return path.reverse();
}
