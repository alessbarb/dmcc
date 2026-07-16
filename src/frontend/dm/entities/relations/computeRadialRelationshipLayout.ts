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
}

const DEFAULT_FIRST_RING_CAPACITY = 8;
const DEFAULT_FIRST_RING_RADIUS = 220;
const DEFAULT_RING_SPACING = 160;

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
}: ComputeRadialRelationshipLayoutInput): Map<string, RelationshipLayoutPoint> {
  const positions = new Map<string, RelationshipLayoutPoint>();
  positions.set(centerNode.entityId, { centerX: 0, centerY: 0 });

  if (neighborNodes.length === 0) return positions;

  const ordered = [...neighborNodes].sort(compareNeighborOrder);

  let index = 0;
  let ring = 0;
  while (index < ordered.length) {
    const ringCapacity = firstRingCapacity * (ring + 1);
    const ringNodes = ordered.slice(index, index + ringCapacity);
    const radius = firstRingRadius + ring * ringSpacing;
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
