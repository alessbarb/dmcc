/**
 * M2 (UX audit 2026-07-26): a small graph (well under the 80-node density
 * threshold already used elsewhere for layout presets) was still capped to
 * the same low maxZoom as a dense one, so `fitView` zoomed out far more
 * than needed and rendered illegibly small node cards even with only ~18
 * nodes on screen. Caps scale down as node count grows instead of being a
 * single fixed ceiling for every graph size.
 */
export function computeNetworkFitZoomCap(nodeCount: number, mode: "standard" | "focus"): number {
  const base = nodeCount <= 24 ? 1.4 : nodeCount <= 80 ? 0.9 : 0.55;
  if (mode === "focus") return Math.min(base + 0.35, 1.75);
  return base;
}
