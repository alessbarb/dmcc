/**
 * Checks if setting parentNotebookId would create a cycle.
 */
export function hasNotebookCycle(
  notebooks: Map<string, { parentNotebookId?: string | null }>,
  notebookId: string,
  newParentId: string
): boolean {
  if (notebookId === newParentId) return true;

  let currentId: string | null | undefined = newParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === notebookId) return true;
    if (visited.has(currentId)) return true; // infinite loop protection

    visited.add(currentId);
    const parent = notebooks.get(currentId);
    currentId = parent?.parentNotebookId;
  }

  return false;
}

/**
 * Calculates the depth of a notebook in the hierarchy.
 * Returns 1 for root notebooks, 2 for direct children, etc.
 */
export function getNotebookDepth(
  notebooks: Map<string, { parentNotebookId?: string | null }>,
  notebookId: string
): number {
  let depth = 1;
  let current = notebooks.get(notebookId);

  while (current?.parentNotebookId) {
    depth++;
    current = notebooks.get(current.parentNotebookId);
    if (depth > 10) break; // safe-guard
  }

  return depth;
}

/**
 * Checks the maximum depth in the hierarchy if parent is set.
 */
export function getHierarchyDepthIfParentSet(
  notebooks: Map<string, { notebookId: string; parentNotebookId?: string | null }>,
  notebookId: string,
  newParentId: string | null
): number {
  // Create a temporary hierarchy mapping to simulate the change
  const tempMap = new Map<string, { parentNotebookId?: string | null }>();
  for (const [id, nb] of notebooks) {
    tempMap.set(id, { parentNotebookId: nb.parentNotebookId });
  }
  tempMap.set(notebookId, { parentNotebookId: newParentId });

  // Find all leaf nodes or find the max path depth starting from any root node
  let maxDepth = 0;
  for (const id of tempMap.keys()) {
    const depth = getNotebookDepth(tempMap, id);
    if (depth > maxDepth) {
      maxDepth = depth;
    }
  }
  return maxDepth;
}
