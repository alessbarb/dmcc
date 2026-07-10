export interface CanvasViewportBounds {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasViewportSize {
  width: number;
  height: number;
}

export interface PositionedCanvasNode {
  position: { x: number; y: number };
  width?: number | null;
  height?: number | null;
  measured?: {
    width?: number | null;
    height?: number | null;
  };
}

const DEFAULT_NODE_WIDTH = 162;
const DEFAULT_NODE_HEIGHT = 190;

/**
 * Returns true when at least one rendered canvas node intersects the current viewport.
 * Used to recover from stale saved pan/zoom values that can make an existing canvas look empty.
 */
export function viewportContainsCanvasNode(
  nodes: PositionedCanvasNode[],
  viewport: CanvasViewportBounds,
  size: CanvasViewportSize,
): boolean {
  if (nodes.length === 0 || size.width <= 0 || size.height <= 0 || viewport.zoom <= 0) return false;

  const minX = -viewport.x / viewport.zoom;
  const minY = -viewport.y / viewport.zoom;
  const maxX = (size.width - viewport.x) / viewport.zoom;
  const maxY = (size.height - viewport.y) / viewport.zoom;

  return nodes.some((node) => {
    const nodeWidth = node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH;
    const nodeHeight = node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT;
    const nodeMinX = node.position.x;
    const nodeMinY = node.position.y;
    const nodeMaxX = nodeMinX + nodeWidth;
    const nodeMaxY = nodeMinY + nodeHeight;

    return nodeMaxX >= minX && nodeMinX <= maxX && nodeMaxY >= minY && nodeMinY <= maxY;
  });
}
