import { z } from "zod";
import {
  canvasEdgeSchema,
  canvasNodeSchema,
  canvasSchema,
  canvasViewportSchema,
} from "../shared/events.js";

export type CanvasViewport = z.infer<typeof canvasViewportSchema>;
/**
 * Canvas node visibility is visual canvas visibility ("dm" or "public"), not the
 * authoritative domain visibility rule. Domain visibility lives on the linked
 * entity or fact and must still be checked for player/public views.
 */
export type CanvasNode = z.infer<typeof canvasNodeSchema>;

/**
 * Canvas edge visibility is visual canvas visibility ("dm" or "public"), not the
 * authoritative domain visibility rule. Domain visibility lives on the linked
 * relation and must still be checked for player/public views.
 */
export type CanvasEdge = z.infer<typeof canvasEdgeSchema>;
export type Canvas = z.infer<typeof canvasSchema>;

export type CanvasNodeMetadata = NonNullable<CanvasNode["metadata"]>;
export type CanvasEdgeMetadata = NonNullable<CanvasEdge["metadata"]>;
