import type { RelationshipGraphEntity } from "./entityRelationshipNeighborhood.js";

export interface RelationshipLayoutPoint {
  centerX: number;
  centerY: number;
}

export interface ComputeRadialRelationshipLayoutInput {
  centerNode: RelationshipGraphEntity;
  neighborNodes: RelationshipGraphEntity[];
  firstRingRadius?: number;
  /** Rendered node footprint, used to keep same-ring neighbors from overlapping. */
  nodeWidth?: number;
  nodeHeight?: number;
  /** Minimum edge-to-edge gap enforced between same-ring node boxes. */
  minNodeGap?: number;
}

const DEFAULT_FIRST_RING_RADIUS = 220;
const DEFAULT_NODE_WIDTH = 176;
const DEFAULT_NODE_HEIGHT = 104;
const DEFAULT_MIN_NODE_GAP = 32;

/**
 * Smallest radius at which `count` boxes, evenly spaced around a circle,
 * don't overlap: the chord between two adjacent boxes must be at least one
 * box's worth of clearance plus the desired gap. A single node has no
 * neighbor to overlap, so no minimum applies.
 *
 * Uses the box's bounding-circle diameter (its diagonal), not just its
 * width: boxes are axis-aligned rectangles, not shapes rotated to face the
 * circle's center, so a box positioned where the tangent isn't horizontal
 * needs its full diagonal — not just its width — to stay clear of the
 * radial spoke running to its neighbor on either side.
 */
function minRadiusForRingSpacing(count: number, nodeWidth: number, nodeHeight: number, minGap: number): number {
  if (count <= 1) return 0;
  const boxDiameter = Math.hypot(nodeWidth, nodeHeight);
  const angleStep = (2 * Math.PI) / count;
  return (boxDiameter + minGap) / (2 * Math.sin(angleStep / 2));
}

function compareNeighborOrder(a: RelationshipGraphEntity, b: RelationshipGraphEntity): number {
  if (a.entityType !== b.entityType) return a.entityType.localeCompare(b.entityType);
  if (a.title !== b.title) return a.title.localeCompare(b.title);
  return a.entityId.localeCompare(b.entityId);
}

/**
 * Positions nodes in abstract, container-independent coordinates: the center
 * at the origin, every neighbor on a single ring around it. Callers adapt
 * these centers to a specific rendering surface (e.g. subtracting half a
 * node's width/height to get a React Flow top-left `position`).
 *
 * Every relation in this view connects the center to exactly one neighbor
 * (a star topology), so straight center-to-neighbor spokes can never cross
 * each other — they share an endpoint. A single ring, radius-adapted to fit
 * however many neighbors there are, is what makes that guarantee hold: an
 * earlier multi-ring version could place an outer-ring neighbor at the same
 * angle as an inner-ring one, and the spoke to the outer node would then
 * pass straight through the inner node's box. Observed neighbor counts in
 * shipped campaigns top out around 17-20, well within where a single ring
 * stays legible after `fitView` zooms to fit it.
 */
export function computeRadialRelationshipLayout({
  centerNode,
  neighborNodes,
  firstRingRadius = DEFAULT_FIRST_RING_RADIUS,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  minNodeGap = DEFAULT_MIN_NODE_GAP,
}: ComputeRadialRelationshipLayoutInput): Map<string, RelationshipLayoutPoint> {
  const positions = new Map<string, RelationshipLayoutPoint>();
  positions.set(centerNode.entityId, { centerX: 0, centerY: 0 });

  if (neighborNodes.length === 0) return positions;

  const ordered = [...neighborNodes].sort(compareNeighborOrder);
  const angularFloor = minRadiusForRingSpacing(ordered.length, nodeWidth, nodeHeight, minNodeGap);
  // Also large enough that even a lone neighbor doesn't overlap the center card.
  const radius = Math.max(firstRingRadius, angularFloor, nodeWidth / 2 + nodeHeight / 2 + minNodeGap);
  const angleStep = (2 * Math.PI) / ordered.length;

  ordered.forEach((node, positionInRing) => {
    const angle = angleStep * positionInRing - Math.PI / 2;
    positions.set(node.entityId, {
      centerX: Math.round(radius * Math.cos(angle) * 1000) / 1000,
      centerY: Math.round(radius * Math.sin(angle) * 1000) / 1000,
    });
  });

  return positions;
}
