export type CanvasDensity = "compact" | "normal" | "detailed";
export const isCanvasDensity = (value: string | null): value is CanvasDensity =>
  value === "compact" || value === "normal" || value === "detailed";

export type RelationsFilter = "all" | "public" | "secret" | "selection";
export const isRelationsFilter = (value: string): value is RelationsFilter =>
  value === "all" || value === "public" || value === "secret" || value === "selection";
