export type CanvasDensity = "compact" | "normal" | "detailed";

/** Returns the mobile semantic-zoom density used by focus graph views. */
export function getMobileDensity(zoom: number): CanvasDensity {
  if (zoom < 0.65) return "compact";
  if (zoom < 1.05) return "normal";
  return "detailed";
}
