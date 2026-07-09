import { z } from "zod";
import {
  canvasEdgeSchema,
  canvasNodeSchema,
  canvasSchema,
  canvasViewportSchema,
} from "../shared/events.js";

export type CanvasViewport = z.infer<typeof canvasViewportSchema>;
export type CanvasNode = z.infer<typeof canvasNodeSchema>;
export type CanvasEdge = z.infer<typeof canvasEdgeSchema>;
export type Canvas = z.infer<typeof canvasSchema>;

export type CanvasNodeMetadata = NonNullable<CanvasNode["metadata"]>;
export type CanvasEdgeMetadata = NonNullable<CanvasEdge["metadata"]>;
