export interface BoardStateLike {
  key: string;
}

/**
 * A3 (UX audit 2026-07-26): kanban columns rendered in a fixed template
 * order regardless of how many cards they held, so a column holding most
 * of the board's content (often "unknown"/unstated status) could sit past
 * the fold, reachable only by horizontal scroll. Sorts columns by card
 * count descending (stable for ties) so the densest columns are visible
 * without scrolling first.
 */
export function sortBoardStatesByVolume<T extends BoardStateLike>(
  states: T[],
  countByKey: Record<string, number | undefined>,
): T[] {
  return states
    .map((state, index) => ({ state, index, count: countByKey[state.key] ?? 0 }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map((entry) => entry.state);
}
