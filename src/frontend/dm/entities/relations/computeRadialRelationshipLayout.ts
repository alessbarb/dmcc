import type { RelationshipGraphEntity } from "./entityRelationshipNeighborhood.js";

export interface RelationshipLayoutPoint {
  centerX: number;
  centerY: number;
}

export interface ComputeRadialRelationshipLayoutInput {
  centerNode: RelationshipGraphEntity;
  neighborNodes: RelationshipGraphEntity[];
  firstRingCapacity?: number;
  firstRingRadius?: number;
  ringSpacing?: number;
  /** Rendered node footprint, used to keep same-ring neighbors from overlapping. */
  nodeWidth?: number;
  nodeHeight?: number;
  /** Minimum edge-to-edge gap enforced between same-ring node boxes. */
  minNodeGap?: number;
}

const DEFAULT_FIRST_RING_CAPACITY = 8;
const DEFAULT_FIRST_RING_RADIUS = 220;
const DEFAULT_RING_SPACING = 160;
const DEFAULT_NODE_WIDTH = 176;
const DEFAULT_NODE_HEIGHT = 104;
const DEFAULT_MIN_NODE_GAP = 32;

/**
 * Smallest radius at which `count` boxes of `nodeSize`, evenly spaced around
 * a circle, don't overlap: the chord between two adjacent boxes must be at
 * least one box width plus the desired gap. A single node has no neighbor to
 * overlap, so no minimum applies.
 */
function minRadiusForRingSpacing(count: number, nodeSize: number, minGap: number): number {
  if (count <= 1) return 0;
  const angleStep = (2 * Math.PI) / count;
  return (nodeSize + minGap) / (2 * Math.sin(angleStep / 2));
}

function compareNeighborOrder(a: RelationshipGraphEntity, b: RelationshipGraphEntity): number {
  if (a.entityType !== b.entityType) return a.entityType.localeCompare(b.entityType);
  if (a.title !== b.title) return a.title.localeCompare(b.title);
  return a.entityId.localeCompare(b.entityId);
}

/**
 * Positions nodes in abstract, container-independent coordinates: the center
 * at the origin, neighbors distributed across rings around it. Callers adapt
 * these centers to a specific rendering surface (e.g. subtracting half a
 * node's width/height to get a React Flow top-left `position`).
 */
export function computeRadialRelationshipLayout({
  centerNode,
  neighborNodes,
  firstRingCapacity = DEFAULT_FIRST_RING_CAPACITY,
  firstRingRadius = DEFAULT_FIRST_RING_RADIUS,
  ringSpacing = DEFAULT_RING_SPACING,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  minNodeGap = DEFAULT_MIN_NODE_GAP,
}: ComputeRadialRelationshipLayoutInput): Map<string, RelationshipLayoutPoint> {
  const positions = new Map<string, RelationshipLayoutPoint>();
  positions.set(centerNode.entityId, { centerX: 0, centerY: 0 });

  if (neighborNodes.length === 0) return positions;

  const ordered = [...neighborNodes].sort(compareNeighborOrder);

  let index = 0;
  let ring = 0;
  let previousRingRadius = 0;
  while (index < ordered.length) {
    const ringCapacity = firstRingCapacity * (ring + 1);
    const ringNodes = ordered.slice(index, index + ringCapacity);
    const baseRadius = firstRingRadius + ring * ringSpacing;
    // Two floors: same-ring boxes must clear each other around the arc, and
    // this ring must clear the previous ring's outer edge radially.
    const angularFloor = minRadiusForRingSpacing(ringNodes.length, nodeWidth, minNodeGap);
    const radialFloor = ring === 0 ? 0 : previousRingRadius + nodeHeight + minNodeGap;
    const radius = Math.max(baseRadius, angularFloor, radialFloor);
    previousRingRadius = radius;
    const angleStep = (2 * Math.PI) / ringNodes.length;

    ringNodes.forEach((node, positionInRing) => {
      const angle = angleStep * positionInRing - Math.PI / 2;
      positions.set(node.entityId, {
        centerX: Math.round(radius * Math.cos(angle) * 1000) / 1000,
        centerY: Math.round(radius * Math.sin(angle) * 1000) / 1000,
      });
    });

    index += ringCapacity;
    ring += 1;
  }

  return positions;
}
