import type { CanvasNode } from "@core/domain/canvas/types.js";

export interface CanvasPoint {
  x: number;
  y: number;
}

export type PlaceEntityOnCanvas = (canvasId: string, node: { kind: "entity"; entityId: string; x: number; y: number }) => Promise<void>;

export interface PlaceEntityOnCanvasOptions {
  canvasId: string;
  entityId: string;
  selectedNode?: CanvasNode | null;
  viewportCenter?: CanvasPoint | null;
  placeNodeOnCanvas: PlaceEntityOnCanvas;
}

const SELECTED_NODE_X_OFFSET = 240;
const FALLBACK_START: CanvasPoint = { x: 120, y: 120 };
const FALLBACK_STEP: CanvasPoint = { x: 40, y: 32 };
const FALLBACK_COLUMNS = 6;

let fallbackOffsetIndex = 0;

function getFallbackPosition(): CanvasPoint {
  const offset = fallbackOffsetIndex;
  fallbackOffsetIndex = (fallbackOffsetIndex + 1) % FALLBACK_COLUMNS;

  return {
    x: FALLBACK_START.x + offset * FALLBACK_STEP.x,
    y: FALLBACK_START.y + offset * FALLBACK_STEP.y,
  };
}

function hasFinitePoint(point: CanvasPoint | null | undefined): point is CanvasPoint {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function getEntityCanvasPlacement(selectedNode?: CanvasNode | null, viewportCenter?: CanvasPoint | null): CanvasPoint {
  if (selectedNode) {
    return { x: selectedNode.x + SELECTED_NODE_X_OFFSET, y: selectedNode.y };
  }

  if (hasFinitePoint(viewportCenter)) {
    return viewportCenter;
  }

  return getFallbackPosition();
}

export async function placeEntityOnCanvas({
  canvasId,
  entityId,
  selectedNode,
  viewportCenter,
  placeNodeOnCanvas,
}: PlaceEntityOnCanvasOptions): Promise<CanvasPoint> {
  const position = getEntityCanvasPlacement(selectedNode, viewportCenter);
  await placeNodeOnCanvas(canvasId, { kind: "entity", entityId, ...position });
  return position;
}
