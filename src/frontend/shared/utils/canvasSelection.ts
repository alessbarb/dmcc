interface SelectableCanvas {
  id?: string;
  canvasId?: string;
  archived?: boolean;
  [key: string]: unknown;
}

function getCanvasId(canvas: SelectableCanvas): string | null {
  return typeof canvas.id === "string" ? canvas.id : typeof canvas.canvasId === "string" ? canvas.canvasId : null;
}

export function resolveActiveCanvasId(canvasesById: Record<string, SelectableCanvas>, preferredCanvasId?: string | null): string | null {
  const canvases = Object.values(canvasesById || {}).filter((canvas: SelectableCanvas) => !canvas.archived);
  if (canvases.length === 0) return null;

  if (preferredCanvasId) {
    const preferred = canvasesById[preferredCanvasId];
    if (preferred && !preferred.archived) return preferredCanvasId;
  }

  return getCanvasId(canvases[0]) ?? null;
}
