export interface ImageFocalPoint {
  x: number;
  y: number;
}

export const DEFAULT_IMAGE_FOCAL_POINT: ImageFocalPoint = { x: 0.5, y: 0.42 };

const FOCUS_MARKER = "dmcc-focus=";

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function normalizeImageFocalPoint(point: ImageFocalPoint): ImageFocalPoint {
  return {
    x: clamp(Number.isFinite(point.x) ? point.x : DEFAULT_IMAGE_FOCAL_POINT.x),
    y: clamp(Number.isFinite(point.y) ? point.y : DEFAULT_IMAGE_FOCAL_POINT.y),
  };
}

export function parseImageFocalPoint(imageUrl: string | undefined): ImageFocalPoint | undefined {
  if (!imageUrl) return undefined;
  const markerIndex = imageUrl.indexOf(`#${FOCUS_MARKER}`);
  if (markerIndex < 0) return undefined;

  const [xValue, yValue] = imageUrl.slice(markerIndex + FOCUS_MARKER.length + 1).split(",");
  const x = Number(xValue);
  const y = Number(yValue);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;

  return normalizeImageFocalPoint({ x, y });
}

export function stripImageFocalPoint(imageUrl: string): string {
  const markerIndex = imageUrl.indexOf(`#${FOCUS_MARKER}`);
  return markerIndex < 0 ? imageUrl : imageUrl.slice(0, markerIndex);
}

export function withImageFocalPoint(imageUrl: string, point: ImageFocalPoint): string {
  const normalized = normalizeImageFocalPoint(point);
  return `${stripImageFocalPoint(imageUrl)}#${FOCUS_MARKER}${normalized.x.toFixed(4)},${normalized.y.toFixed(4)}`;
}

export function imageFocalPointToObjectPosition(
  point: ImageFocalPoint | undefined,
): string {
  const normalized = normalizeImageFocalPoint(point ?? DEFAULT_IMAGE_FOCAL_POINT);
  return `${Math.round(normalized.x * 100)}% ${Math.round(normalized.y * 100)}%`;
}

export function applyStoredImageFocalPoint(image: HTMLImageElement): void {
  const point = parseImageFocalPoint(image.getAttribute("src") ?? undefined);
  if (!point) return;

  // A stored focal point is the authoritative crop for every entity surface.
  // Use important so route-level presentation rules (for example the detail hero)
  // cannot silently reset the image to center.
  image.style.setProperty(
    "object-position",
    imageFocalPointToObjectPosition(point),
    "important",
  );
}

export function applyStoredImageFocalPoints(root: ParentNode = document): void {
  root.querySelectorAll<HTMLImageElement>("img[src*='#dmcc-focus=']").forEach(applyStoredImageFocalPoint);
}
