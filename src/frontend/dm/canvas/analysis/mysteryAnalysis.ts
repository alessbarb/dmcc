import type { Canvas } from "@core/domain/canvas/types.js";
import type { Entity, Fact, Relation } from "../../../shared/stores/campaignStore.js";

export type MysteryIssueCode =
  | "clue_without_target"
  | "secret_without_anchor"
  | "dead_end_path"
  | "contradiction_unresolved"
  | "final_revelation_unreachable";

export type MysteryIssueSeverity = "error" | "warning" | "info";

export interface MysteryIssue {
  id: string;
  code: MysteryIssueCode;
  severity: MysteryIssueSeverity;
  message: string;
  entityId?: string;
  factId?: string;
  nodeId?: string;
}

export interface AnalyzeMysteryHealthInput {
  canvas: Canvas;
  entities: Entity[];
  facts: Fact[];
  relations: Relation[];
}

const MYSTERY_NODE_TYPES = new Set(["clue", "secret", "scene", "location", "npc"]);
const FINAL_REVELATION_TYPES = new Set(["final_revelation", "final-revelation", "revelation", "culprit", "truth"]);
const CONTRADICTION_TYPES = new Set(["contradiction", "conflict"]);
const RESOLVED_STATUSES = new Set(["resolved", "revealed", "complete", "completed"]);

const isActive = <T extends { archived?: boolean }>(item: T) => !item.archived;

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

const hasOutgoingRelation = (entityId: string, relations: Relation[]) => (
  relations.some((relation) => relation.sourceEntityId === entityId)
);

const hasIncomingRelationFromType = (
  entityId: string,
  relationSourceType: string,
  entitiesById: Map<string, Entity>,
  relations: Relation[],
) => relations.some((relation) => (
  relation.targetEntityId === entityId && entitiesById.get(relation.sourceEntityId)?.entityType === relationSourceType
));

const getCanvasNodeIdForEntity = (canvas: Canvas, entityId: string) => (
  canvas.nodes.find((node) => node.kind === "entity" && node.entityId === entityId)?.id
);

const hasCanvasEdgeFromClue = (canvas: Canvas, entityId: string, entitiesById: Map<string, Entity>) => {
  const targetNodeId = getCanvasNodeIdForEntity(canvas, entityId);
  if (!targetNodeId) return false;

  return canvas.edges.some((edge) => {
    if (edge.targetNodeId !== targetNodeId) return false;
    const sourceNode = canvas.nodes.find((node) => node.id === edge.sourceNodeId);
    return sourceNode?.entityId ? entitiesById.get(sourceNode.entityId)?.entityType === "clue" : false;
  });
};

const isAnchoredByMetadata = (secret: Entity) => {
  const anchors = secret.metadata?.revelationAnchors;
  return Array.isArray(anchors) && anchors.length > 0;
};

const hasPathToEntity = (sourceEntityIds: string[], targetEntityId: string, relations: Relation[]) => {
  const queue = [...sourceEntityIds];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    if (current === targetEntityId) return true;
    visited.add(current);

    for (const relation of relations) {
      if (relation.sourceEntityId === current && !visited.has(relation.targetEntityId)) {
        queue.push(relation.targetEntityId);
      }
    }
  }

  return false;
};

/**
 * Analiza la salud narrativa de un canvas de misterio sin leer ni mutar estado externo.
 */
export function analyzeMysteryHealth({ canvas, entities, facts, relations }: AnalyzeMysteryHealthInput): MysteryIssue[] {
  const activeEntities = entities.filter(isActive);
  const activeFacts = facts.filter(isActive);
  const activeRelations = relations.filter(isActive);
  const entitiesById = new Map(activeEntities.map((entity) => [entity.entityId, entity]));
  const issues: MysteryIssue[] = [];

  const placedEntityIds = new Set(
    canvas.nodes
      .map((node) => (node.kind === "entity" ? node.entityId : undefined))
      .filter((entityId): entityId is string => Boolean(entityId)),
  );
  const mysteryEntities = activeEntities.filter((entity) => (
    placedEntityIds.has(entity.entityId) || MYSTERY_NODE_TYPES.has(entity.entityType)
  ));
  const clues = mysteryEntities.filter((entity) => entity.entityType === "clue");
  const secrets = mysteryEntities.filter((entity) => entity.entityType === "secret");

  for (const clue of clues) {
    const isAnchor = secrets.some((secret) => (
      Array.isArray(secret.metadata?.revelationAnchors) && secret.metadata.revelationAnchors.includes(clue.entityId)
    ));
    if (!isAnchor && !hasOutgoingRelation(clue.entityId, activeRelations)) {
      issues.push({
        id: `clue_without_target:${clue.entityId}`,
        code: "clue_without_target",
        severity: "warning",
        message: `La pista “${clue.title}” no apunta a ningún secreto, escena o sospechoso.`,
        entityId: clue.entityId,
        nodeId: getCanvasNodeIdForEntity(canvas, clue.entityId),
      });
    }
  }

  for (const secret of secrets) {
    const hasAnchor = isAnchoredByMetadata(secret)
      || hasIncomingRelationFromType(secret.entityId, "clue", entitiesById, activeRelations)
      || hasCanvasEdgeFromClue(canvas, secret.entityId, entitiesById);

    if (!hasAnchor) {
      issues.push({
        id: `secret_without_anchor:${secret.entityId}`,
        code: "secret_without_anchor",
        severity: "error",
        message: `El secreto “${secret.title}” no tiene ninguna pista o ancla de revelación.`,
        entityId: secret.entityId,
        nodeId: getCanvasNodeIdForEntity(canvas, secret.entityId),
      });
    }
  }

  for (const entity of mysteryEntities.filter((item) => ["scene", "location", "npc"].includes(item.entityType))) {
    if (!RESOLVED_STATUSES.has(normalize(entity.status)) && !hasOutgoingRelation(entity.entityId, activeRelations)) {
      issues.push({
        id: `dead_end_path:${entity.entityId}`,
        code: "dead_end_path",
        severity: "info",
        message: `“${entity.title}” parece ser un punto muerto del recorrido del misterio.`,
        entityId: entity.entityId,
        nodeId: getCanvasNodeIdForEntity(canvas, entity.entityId),
      });
    }
  }

  for (const fact of activeFacts.filter((item) => CONTRADICTION_TYPES.has(normalize(item.kind)))) {
    if (!RESOLVED_STATUSES.has(normalize(fact.confidence))) {
      issues.push({
        id: `contradiction_unresolved:${fact.factId}`,
        code: "contradiction_unresolved",
        severity: "warning",
        message: `La contradicción “${fact.statement}” aún no está resuelta.`,
        factId: fact.factId,
        nodeId: canvas.nodes.find((node) => node.kind === "fact" && node.factId === fact.factId)?.id,
      });
    }
  }

  const clueIds = clues.map((clue) => clue.entityId);
  for (const secret of secrets.filter((item) => FINAL_REVELATION_TYPES.has(normalize(item.metadata?.mysteryRole)))) {
    if (clueIds.length === 0 || !hasPathToEntity(clueIds, secret.entityId, activeRelations)) {
      issues.push({
        id: `final_revelation_unreachable:${secret.entityId}`,
        code: "final_revelation_unreachable",
        severity: "error",
        message: `La revelación final “${secret.title}” no es alcanzable desde ninguna pista.`,
        entityId: secret.entityId,
        nodeId: getCanvasNodeIdForEntity(canvas, secret.entityId),
      });
    }
  }

  return issues;
}
