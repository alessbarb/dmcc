function getCanvasId(canvas: any): string | null {
  return typeof canvas?.id === "string" ? canvas.id : typeof canvas?.canvasId === "string" ? canvas.canvasId : null;
}

export function resolveActiveCanvasId(canvasesById: Record<string, any>, preferredCanvasId?: string | null): string | null {
  const canvases = Object.values(canvasesById || {}).filter((canvas: any) => !canvas?.archived);
  if (canvases.length === 0) return null;

  if (preferredCanvasId) {
    const preferred = canvasesById[preferredCanvasId];
    if (preferred && !preferred.archived) return preferredCanvasId;
  }

  return getCanvasId(canvases[0]) ?? null;
}
