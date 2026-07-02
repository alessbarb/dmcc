import { z } from "zod";

export const revelationAnchorSchema = z.object({
  nodeId: z.string().min(1, "nodeId must not be empty"),
  entityId: z.string().min(1, "entityId must not be empty"),
  field: z.string().min(1, "field must not be empty").default("content"),
});

export type RevelationAnchor = z.infer<typeof revelationAnchorSchema>;

export function normalizeRevelationAnchors(anchors: unknown): RevelationAnchor[] {
  if (!Array.isArray(anchors)) return [];
  const result: RevelationAnchor[] = [];
  const seenKeys = new Set<string>();

  for (const item of anchors) {
    if (typeof item !== "object" || item === null) continue;
    const raw = item as Record<string, unknown>;

    const nodeId = typeof raw.nodeId === "string" ? raw.nodeId.trim() : "";
    const entityId = typeof raw.entityId === "string" ? raw.entityId.trim() : "";
    let field = typeof raw.field === "string" ? raw.field.trim() : "content";
    if (!field) {
      field = "content";
    }

    if (!nodeId || !entityId) continue;

    const key = `${nodeId}:${field}:${entityId}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    result.push({
      nodeId,
      entityId,
      field,
    });
  }

  return result;
}
