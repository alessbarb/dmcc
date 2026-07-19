import type { CanvasNode } from "@core/domain/canvas/types.js";

export interface Viewport { x: number; y: number; zoom: number; }

interface Pt { x: number; y: number; }

interface RfNodeLike {
  id: string;
  width?: number | null;
  height?: number | null;
  position?: { x: number; y: number };
  positionAbsolute?: { x: number; y: number };
}

// ─── Convex hull (Andrew's monotone chain) ────────────────────────────────────
function cross(O: Pt, A: Pt, B: Pt): number {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

function convexHull(pts: Pt[]): Pt[] {
  if (pts.length < 2) return [...pts];
  const sorted = [...pts].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
  const n = sorted.length;
  const h: Pt[] = [];

  for (const p of sorted) {
    while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
    h.push(p);
  }
  const lo = h.length;
  for (let i = n - 2; i >= 0; i--) {
    while (h.length > lo && cross(h[h.length - 2], h[h.length - 1], sorted[i]) <= 0) h.pop();
    h.push(sorted[i]);
  }
  h.pop();
  return h;
}

// ─── Inflate hull outward from centroid ──────────────────────────────────────
function inflateHull(hull: Pt[], padding: number): Pt[] {
  if (hull.length === 0) return hull;
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map(p => {
    const dx = p.x - cx, dy = p.y - cy;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return { x: p.x + padding, y: p.y };
    return { x: p.x + (dx / len) * padding, y: p.y + (dy / len) * padding };
  });
}

// ─── Rounded SVG path through hull vertices ───────────────────────────────────
function roundedHullPath(hull: Pt[], r: number): string {
  const n = hull.length;
  if (n === 0) return "";
  if (n === 1) {
    const { x, y } = hull[0];
    return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0 Z`;
  }
  if (n === 2) {
    // Capsule between two points
    const [A, B] = hull;
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * r, ny = (dx / len) * r;
    return `M ${A.x + nx} ${A.y + ny} L ${B.x + nx} ${B.y + ny}
            A ${r} ${r} 0 0 1 ${B.x - nx} ${B.y - ny}
            L ${A.x - nx} ${A.y - ny}
            A ${r} ${r} 0 0 1 ${A.x + nx} ${A.y + ny} Z`;
  }

  let path = "";
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];

    const d1x = prev.x - curr.x, d1y = prev.y - curr.y;
    const d2x = next.x - curr.x, d2y = next.y - curr.y;
    const len1 = Math.hypot(d1x, d1y);
    const len2 = Math.hypot(d2x, d2y);

    const r1 = Math.min(r, len1 / 2);
    const r2 = Math.min(r, len2 / 2);

    const ax = curr.x + (d1x / len1) * r1;
    const ay = curr.y + (d1y / len1) * r1;
    const bx = curr.x + (d2x / len2) * r2;
    const by = curr.y + (d2y / len2) * r2;

    if (i === 0) {
      path += `M ${ax} ${ay}`;
    } else {
      path += ` L ${ax} ${ay}`;
    }
    path += ` Q ${curr.x} ${curr.y} ${bx} ${by}`;
  }
  return path + " Z";
}

// ─── Constants ───────────────────────────────────────────────────────────────
const HULL_PADDING = 34;
const CORNER_RADIUS = 32;
const DEFAULT_W = 162;
const DEFAULT_H = 190;

const GROUP_COLORS: Record<string, string> = {
  purple: "#7c3aed",
  blue:   "#2563eb",
  green:  "#059669",
  yellow: "#d97706",
  pink:   "#db2777",
  red:    "#dc2626",
  orange: "#ea580c",
  teal:   "#0d9488",
};
const COLOR_CYCLE = Object.values(GROUP_COLORS);

// ─── Component ───────────────────────────────────────────────────────────────
export interface CanvasGroupHullsProps {
  canvasId: string;
  viewport: Viewport;
  /** Raw store nodes — used for groupId, group metadata (kind:"group") */
  canvasNodes: CanvasNode[] | undefined;
  /** RF-measured nodes — used for accurate rendered positions + dimensions */
  rfNodes: RfNodeLike[] | undefined;
}

export function CanvasGroupHulls({ canvasId: _canvasId, viewport, canvasNodes, rfNodes }: CanvasGroupHullsProps) {
  if (!canvasNodes || canvasNodes.length === 0) return null;

  // Group metadata (kind:"group" nodes from store)
  const groupMeta: Record<string, { title: string; color: string }> = {};
  const groupPos: Record<string, { x: number; y: number }> = {};

  canvasNodes.forEach((n) => {
    if (n.kind !== "group") return;
    groupMeta[n.id] = { title: n.title || "Grupo", color: n.color || "purple" };
    groupPos[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
  });

  // Build RF dimension lookup by node id — only rendered (visible) nodes appear here
  const rfDims: Record<string, { x: number; y: number; w: number; h: number }> = {};
  const rfVisibleIds = new Set<string>();
  if (rfNodes) {
    for (const rn of rfNodes) {
      rfVisibleIds.add(rn.id);
      if (rn.width && rn.height) {
        rfDims[rn.id] = {
          x: rn.position?.x ?? rn.positionAbsolute?.x ?? 0,
          y: rn.position?.y ?? rn.positionAbsolute?.y ?? 0,
          w: rn.width,
          h: rn.height,
        };
      }
    }
  }

  // Accumulate member bounds per group — skip nodes not in RF (filtered by visibility)
  const membersByGroup: Record<string, Pt[]> = {};

  canvasNodes.forEach((n) => {
    if (n.kind === "group") return;
    const gid: string | undefined = n.groupId ?? n.parentId;
    if (!gid) return;

    // If rfNodes provided, only include nodes that RF is actually rendering
    if (rfNodes && !rfVisibleIds.has(n.id)) return;

    const rf = rfDims[n.id];
    let ax: number, ay: number, w: number, h: number;

    if (rf) {
      ax = rf.x; ay = rf.y; w = rf.w; h = rf.h;
    } else {
      // Fallback: node rendered but not yet measured (no width/height yet)
      ax = n.x ?? 0; ay = n.y ?? 0;
      if (n.parentId && !n.groupId && groupPos[n.parentId]) {
        ax += groupPos[n.parentId].x;
        ay += groupPos[n.parentId].y;
      }
      w = n.width ?? DEFAULT_W;
      h = n.height ?? DEFAULT_H;
    }

    if (!membersByGroup[gid]) membersByGroup[gid] = [];
    membersByGroup[gid].push(
      { x: ax,     y: ay     },
      { x: ax + w, y: ay     },
      { x: ax + w, y: ay + h },
      { x: ax,     y: ay + h },
    );
  });

  const { x: vpX, y: vpY, zoom } = viewport;
  const groupEntries = Object.entries(membersByGroup);
  if (groupEntries.length === 0) return null;

  return (
    <div className="canvas-group-hulls">
      <svg
        className="canvas-group-hulls__svg"
        style={{ transform: `translate(${vpX}px, ${vpY}px) scale(${zoom})` }}
      >
        <defs>
          <filter id="hull-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {groupEntries.map(([gid, pts], idx) => {
          const meta = groupMeta[gid];
          const raw = meta ? GROUP_COLORS[meta.color] : undefined;
          const color = raw ?? COLOR_CYCLE[idx % COLOR_CYCLE.length];
          const title = meta?.title ?? "Grupo";

          const hull = convexHull(pts);
          const inflated = inflateHull(hull, HULL_PADDING);
          const path = roundedHullPath(inflated, CORNER_RADIUS);
          if (!path) return null;

          const topY = Math.min(...inflated.map(p => p.y));
          const centX = inflated.reduce((s, p) => s + p.x, 0) / inflated.length;

          return (
            <g key={gid}>
              {/* Glow fill — blur preserves fill color */}
              <path d={path} fill={color} fillOpacity={0.10} filter="url(#hull-glow)" />
              {/* Crisp stroke */}
              <path
                d={path}
                fill={color}
                fillOpacity={0.03}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.4}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
              />
              {/* Group label */}
              <text
                x={centX}
                y={topY - 8}
                textAnchor="middle"
                fill={color}
                fontSize={11}
                fontWeight="800"
                letterSpacing="0.12em"
                className="canvas-group-hulls__label"
              >
                {title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
