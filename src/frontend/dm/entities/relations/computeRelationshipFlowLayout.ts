export type RelationshipPortSide =
  | "top"
  | "right"
  | "bottom"
  | "left";

export interface RelationshipFlowLayoutNode {
  id: string;
  width: number;
  height: number;
  role: "center" | "neighbor";
}

export interface RelationshipFlowLayoutEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface RelationshipFlowPoint {
  x: number;
  y: number;
}

export interface RelationshipFlowEdgeRoute {
  sourceNodeId: string;
  targetNodeId: string;
  points: RelationshipFlowPoint[];
  sourceSide: RelationshipPortSide;
  targetSide: RelationshipPortSide;
  labelPoint: RelationshipFlowPoint;
}

export interface RelationshipFlowLayoutResult {
  positions: Map<string, RelationshipFlowPoint>;
  edgeRoutes: Map<string, RelationshipFlowEdgeRoute>;
}

interface PositionedRelationshipNode {
  node: RelationshipFlowLayoutNode;
  position: RelationshipFlowPoint;
  side: "left" | "right";
  column: "inner" | "outer";
  order: number;
}

const SAME_COLUMN_ROW_GAP = 54;

/**
 * Las dos columnas se separan horizontalmente, pero se intercalan
 * verticalmente. Los nodos exteriores quedan entre los interiores.
 */
const COLUMN_GAP = 76;

/**
 * Espacio entre la entidad actual y la columna interior.
 */
const CENTER_LAYER_GAP = 230;

/**
 * Distancia mínima entre la tarjeta central y los carriles verticales.
 */
const FIRST_CENTER_LANE_GAP = 32;

/**
 * Separación de los carriles paralelos cercanos al centro.
 */
const CENTER_LANE_STEP = 11;

/**
 * Margen superior e inferior al repartir conexiones por la cara central.
 */
const CENTER_PORT_MARGIN = 6;

function uniqueNodeIds(values: string[]): string[] {
  return [...new Set(values)];
}

function removeConsecutiveDuplicates(
  points: RelationshipFlowPoint[],
): RelationshipFlowPoint[] {
  return points.filter((point, index) => {
    if (index === 0) return true;

    const previous = points[index - 1];

    return (
      point.x !== previous.x ||
      point.y !== previous.y
    );
  });
}

function pointAtPathFraction(
  points: RelationshipFlowPoint[],
  fraction: number,
): RelationshipFlowPoint {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  if (points.length === 1) {
    return points[0];
  }

  const segments = points.slice(1).map(
    (end, index) => {
      const start = points[index];

      return {
        start,
        end,
        length: Math.hypot(
          end.x - start.x,
          end.y - start.y,
        ),
      };
    },
  );

  const totalLength = segments.reduce(
    (total, segment) => total + segment.length,
    0,
  );

  if (totalLength === 0) {
    return points[0];
  }

  const targetLength = totalLength * fraction;
  let traversedLength = 0;

  for (const segment of segments) {
    const segmentEnd =
      traversedLength + segment.length;

    if (segmentEnd >= targetLength) {
      const localLength =
        targetLength - traversedLength;

      const ratio =
        segment.length === 0
          ? 0
          : localLength / segment.length;

      return {
        x:
          segment.start.x +
          (segment.end.x - segment.start.x) *
            ratio,

        y:
          segment.start.y +
          (segment.end.y - segment.start.y) *
            ratio,
      };
    }

    traversedLength = segmentEnd;
  }

  return points[points.length - 1];
}

/**
 * La separación entre posiciones consecutivas es media fila.
 *
 * Como los índices pares pertenecen a la columna interior y los impares a
 * la exterior, dos nodos de la misma columna están separados por una fila
 * completa y no se solapan.
 */
function staggerStep(nodeHeight: number): number {
  return (nodeHeight + SAME_COLUMN_ROW_GAP) / 2;
}

function staggeredBlockHeight(
  count: number,
  nodeHeight: number,
): number {
  if (count === 0) return 0;

  return (
    nodeHeight +
    Math.max(0, count - 1) * staggerStep(nodeHeight)
  );
}

function distributeCenterPortY(
  centerTop: number,
  centerHeight: number,
  index: number,
  count: number,
): number {
  if (count <= 1) {
    return centerTop + centerHeight / 2;
  }

  const usableHeight = Math.max(
    1,
    centerHeight - CENTER_PORT_MARGIN * 2,
  );

  /*
   * Reparte los puntos por toda la altura útil:
   *
   * primero  -> margen superior
   * último   -> margen inferior
   *
   * Antes se usaba (index + 1) / (count + 1), lo que concentraba
   * todas las conexiones en la zona central de la tarjeta.
   */
  return (
    centerTop +
    CENTER_PORT_MARGIN +
    usableHeight * (index / (count - 1))
  );
}

function positionSideNodes({
  nodeIds,
  nodeById,
  side,
  centerPosition,
  centerNode,
}: {
  nodeIds: string[];
  nodeById: Map<string, RelationshipFlowLayoutNode>;
  side: "left" | "right";
  centerPosition: RelationshipFlowPoint;
  centerNode: RelationshipFlowLayoutNode;
}): PositionedRelationshipNode[] {
  const firstNode = nodeIds
    .map((nodeId) => nodeById.get(nodeId))
    .find(
      (
        node,
      ): node is RelationshipFlowLayoutNode =>
        node !== undefined,
    );

  if (!firstNode) {
    return [];
  }

  const blockHeight = staggeredBlockHeight(
    nodeIds.length,
    firstNode.height,
  );

  const blockTop =
    centerPosition.y +
    centerNode.height / 2 -
    blockHeight / 2;

  return nodeIds.flatMap((nodeId, index) => {
    const node = nodeById.get(nodeId);

    if (!node) {
      return [];
    }

    /*
     * 0, 2, 4...  -> columna interior
     * 1, 3, 5...  -> columna exterior
     *
     * La coordenada Y avanza en medias filas:
     *
     * interior 0
     * exterior 1/2
     * interior 1
     * exterior 1 1/2
     * interior 2
     */
    const column =
      index % 2 === 0
        ? "inner"
        : "outer";

    const innerX =
      side === "left"
        ? centerPosition.x -
          CENTER_LAYER_GAP -
          node.width
        : centerPosition.x +
          centerNode.width +
          CENTER_LAYER_GAP;

    const outerX =
      side === "left"
        ? innerX - COLUMN_GAP - node.width
        : innerX + node.width + COLUMN_GAP;

    return [
      {
        node,
        side,
        column,
        order: index,
        position: {
          x:
            column === "inner"
              ? innerX
              : outerX,

          y:
            blockTop +
            index * staggerStep(node.height),
        },
      },
    ];
  });
}

function buildIncomingRoute({
  edge,
  neighbor,
  centerPosition,
  centerPortY,
  laneIndex,
}: {
  edge: RelationshipFlowLayoutEdge;
  neighbor: PositionedRelationshipNode;
  centerPosition: RelationshipFlowPoint;
  centerPortY: number;
  laneIndex: number;
}): RelationshipFlowEdgeRoute {
  const neighborRight =
    neighbor.position.x + neighbor.node.width;

  const neighborCenterY =
    neighbor.position.y + neighbor.node.height / 2;

  const centerLeft = centerPosition.x;

  const laneX =
    centerLeft -
    FIRST_CENTER_LANE_GAP -
    laneIndex * CENTER_LANE_STEP;

  /*
   * No hay pasillo inferior ni rodeo adicional.
   *
   * Los nodos exteriores están colocados entre los interiores, por lo que
   * esta línea horizontal atraviesa el hueco disponible entre tarjetas.
   */
  const points = removeConsecutiveDuplicates([
    {
      x: neighborRight,
      y: neighborCenterY,
    },
    {
      x: laneX,
      y: neighborCenterY,
    },
    {
      x: laneX,
      y: centerPortY,
    },
    {
      x: centerLeft,
      y: centerPortY,
    },
  ]);

  return {
    sourceNodeId: edge.sourceId,
    targetNodeId: edge.targetId,
    points,
    sourceSide: "right",
    targetSide: "left",

    // Próxima al vecino, no al nudo central.
    labelPoint: pointAtPathFraction(
      points,
      0.2,
    ),
  };
}

function buildOutgoingRoute({
  edge,
  neighbor,
  center,
  centerPosition,
  centerPortY,
  laneIndex,
}: {
  edge: RelationshipFlowLayoutEdge;
  neighbor: PositionedRelationshipNode;
  center: RelationshipFlowLayoutNode;
  centerPosition: RelationshipFlowPoint;
  centerPortY: number;
  laneIndex: number;
}): RelationshipFlowEdgeRoute {
  const centerRight =
    centerPosition.x + center.width;

  const neighborLeft = neighbor.position.x;

  const neighborCenterY =
    neighbor.position.y + neighbor.node.height / 2;

  const laneX =
    centerRight +
    FIRST_CENTER_LANE_GAP +
    laneIndex * CENTER_LANE_STEP;

  const points = removeConsecutiveDuplicates([
    {
      x: centerRight,
      y: centerPortY,
    },
    {
      x: laneX,
      y: centerPortY,
    },
    {
      x: laneX,
      y: neighborCenterY,
    },
    {
      x: neighborLeft,
      y: neighborCenterY,
    },
  ]);

  return {
    sourceNodeId: edge.sourceId,
    targetNodeId: edge.targetId,
    points,
    sourceSide: "right",
    targetSide: "left",

    // Próxima al vecino exterior.
    labelPoint: pointAtPathFraction(
      points,
      0.8,
    ),
  };
}

/**
 * Layout determinista para relaciones inmediatas:
 *
 *   entrantes -> entidad actual -> salientes
 *
 * Cada lado se divide en dos columnas verticalmente escalonadas. La columna
 * exterior ocupa los huecos existentes entre las filas de la columna
 * interior, permitiendo conexiones horizontales sin rodear otros nodos.
 */
export async function computeRelationshipFlowLayout(
  nodes: RelationshipFlowLayoutNode[],
  edges: RelationshipFlowLayoutEdge[],
): Promise<RelationshipFlowLayoutResult> {
  const center = nodes.find(
    (node) => node.role === "center",
  );

  if (!center) {
    return {
      positions: new Map(),
      edgeRoutes: new Map(),
    };
  }

  const nodeById = new Map(
    nodes.map((node) => [node.id, node]),
  );

  const incomingEdges = edges.filter(
    (edge) =>
      edge.targetId === center.id &&
      edge.sourceId !== center.id,
  );

  const outgoingEdges = edges.filter(
    (edge) =>
      edge.sourceId === center.id &&
      edge.targetId !== center.id,
  );

  const incomingNodeIds = uniqueNodeIds(
    incomingEdges.map((edge) => edge.sourceId),
  );

  const outgoingNodeIds = uniqueNodeIds(
    outgoingEdges.map((edge) => edge.targetId),
  );

  const sampleNeighbor = nodes.find(
    (node) => node.role === "neighbor",
  );

  const neighborWidth =
    sampleNeighbor?.width ?? center.width;

  const neighborHeight =
    sampleNeighbor?.height ?? center.height;

  const incomingHeight = staggeredBlockHeight(
    incomingNodeIds.length,
    neighborHeight,
  );

  const outgoingHeight = staggeredBlockHeight(
    outgoingNodeIds.length,
    neighborHeight,
  );

  const graphHeight = Math.max(
    center.height,
    incomingHeight,
    outgoingHeight,
  );

  /*
   * Se deja espacio para dos columnas completas a la izquierda.
   * React Flow recolocará el conjunto mediante fitView.
   */
  const centerPosition: RelationshipFlowPoint = {
    x:
      neighborWidth * 2 +
      COLUMN_GAP +
      CENTER_LAYER_GAP,

    y:
      graphHeight / 2 -
      center.height / 2,
  };

  const incomingNodes = positionSideNodes({
    nodeIds: incomingNodeIds,
    nodeById,
    side: "left",
    centerPosition,
    centerNode: center,
  });

  const outgoingNodes = positionSideNodes({
    nodeIds: outgoingNodeIds,
    nodeById,
    side: "right",
    centerPosition,
    centerNode: center,
  });

  const positionedById = new Map(
    [...incomingNodes, ...outgoingNodes].map(
      (positioned) => [
        positioned.node.id,
        positioned,
      ],
    ),
  );

  const positions =
    new Map<string, RelationshipFlowPoint>();

  positions.set(center.id, centerPosition);

  for (
    const positioned of [
      ...incomingNodes,
      ...outgoingNodes,
    ]
  ) {
    positions.set(
      positioned.node.id,
      positioned.position,
    );
  }

  const edgeRoutes =
    new Map<string, RelationshipFlowEdgeRoute>();

  /*
   * El orden de los puertos debe seguir el orden vertical real de las
   * entidades. Así cada línea conserva su carril y no cruza otra al
   * aproximarse a la tarjeta central.
   */
  const orderedIncomingEdges = [...incomingEdges].sort(
    (a, b) => {
      const nodeA = positionedById.get(a.sourceId);
      const nodeB = positionedById.get(b.sourceId);

      const centerYA =
        (nodeA?.position.y ?? 0) +
        (nodeA?.node.height ?? 0) / 2;

      const centerYB =
        (nodeB?.position.y ?? 0) +
        (nodeB?.node.height ?? 0) / 2;

      if (centerYA !== centerYB) {
        return centerYA - centerYB;
      }

      return a.id.localeCompare(b.id);
    },
  );

  const orderedOutgoingEdges = [...outgoingEdges].sort(
    (a, b) => {
      const nodeA = positionedById.get(a.targetId);
      const nodeB = positionedById.get(b.targetId);

      const centerYA =
        (nodeA?.position.y ?? 0) +
        (nodeA?.node.height ?? 0) / 2;

      const centerYB =
        (nodeB?.position.y ?? 0) +
        (nodeB?.node.height ?? 0) / 2;

      if (centerYA !== centerYB) {
        return centerYA - centerYB;
      }

      return a.id.localeCompare(b.id);
    },
  );

  orderedIncomingEdges.forEach((edge, index) => {
    const neighbor =
      positionedById.get(edge.sourceId);

    if (!neighbor) return;

    const centerPortY = distributeCenterPortY(
      centerPosition.y,
      center.height,
      index,
      orderedIncomingEdges.length,
    );

    edgeRoutes.set(
      edge.id,
      buildIncomingRoute({
        edge,
        neighbor,
        centerPosition,
        centerPortY,
        laneIndex: index,
      }),
    );
  });

  orderedOutgoingEdges.forEach((edge, index) => {
    const neighbor =
      positionedById.get(edge.targetId);

    if (!neighbor) return;

    const centerPortY = distributeCenterPortY(
      centerPosition.y,
      center.height,
      index,
      orderedOutgoingEdges.length,
    );

    edgeRoutes.set(
      edge.id,
      buildOutgoingRoute({
        edge,
        neighbor,
        center,
        centerPosition,
        centerPortY,
        laneIndex: index,
      }),
    );
  });

  return {
    positions,
    edgeRoutes,
  };
}
