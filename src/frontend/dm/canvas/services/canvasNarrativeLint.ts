import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";
import type { Canvas, CanvasNode, CanvasEdge } from "@core/domain/canvas/types.js";
import type { Entity, Relation } from "../../../shared/stores/campaignStore.js";

export const runNarrativeLint = (campaignState: { entities: Entity[]; relations: Relation[] }, activeCanvas: Canvas, t: (key: string, params?: Record<string, string | number>) => string) => {
  const issues: { id: string; type: "error" | "warning" | "info"; message: string; entityId?: string }[] = [];
  if (!campaignState || !activeCanvas) return issues;

  const entities = campaignState.entities.filter((e: Entity) => !e.archived);
  const relations = campaignState.relations.filter((r: Relation) => !r.archived);
  const canvasNodes = activeCanvas.nodes || [];
  const canvasEdges = activeCanvas.edges || [];

  // 1. Secrets without clues
  const secrets = entities.filter((e: Entity) => e.entityType === "secret");
  for (const secret of secrets) {
    const anchors = Array.isArray(secret.metadata?.revelationAnchors) ? secret.metadata.revelationAnchors : [];
    const hasAnchors = anchors.length > 0;
    const pointingClues = relations.filter(
      (r: Relation) => r.targetEntityId === secret.entityId &&
                  entities.find((e: Entity) => e.entityId === r.sourceEntityId)?.entityType === "clue"
    );
    const hasPointingClues = pointingClues.length > 0;
    
    if (!hasAnchors && !hasPointingClues) {
      issues.push({
        id: `secret-no-clues-${secret.entityId}`,
        type: "error",
        message: `El secreto 🔒 "${secret.title}" no tiene ninguna pista ni ancla asociada para ser revelado.`,
        entityId: secret.entityId
      });
    }
  }

  // 2. Orphan clues
  const clues = entities.filter((e: Entity) => e.entityType === "clue");
  for (const clue of clues) {
    const isAnchor = secrets.some((s: Entity) => Array.isArray(s.metadata?.revelationAnchors) && s.metadata.revelationAnchors.includes(clue.entityId));
    const hasOutgoing = relations.some((r: Relation) => r.sourceEntityId === clue.entityId);
    if (!isAnchor && !hasOutgoing) {
      issues.push({
        id: `clue-orphan-${clue.entityId}`,
        type: "warning",
        message: t("canvas.flow.warningOrphanClue", { title: clue.title }),
        entityId: clue.entityId
      });
    }
  }

  // 3. Unused key NPCs
  const importantNpcs = entities.filter(
    (e: Entity) => e.entityType === "npc" && (e.importance === "critical" || e.importance === "high")
  );
  for (const npc of importantNpcs) {
    const isConnected = relations.some(
      (r: Relation) => r.sourceEntityId === npc.entityId || r.targetEntityId === npc.entityId
    );
    if (!isConnected) {
      issues.push({
        id: `npc-unused-${npc.entityId}`,
        type: "warning",
        message: `El PNJ relevante 👤 "${npc.title}" no tiene conexiones con misiones o escenas.`,
        entityId: npc.entityId
      });
    }
  }

  // 4. Unclosed quests
  const quests = entities.filter((e: Entity) => e.entityType === "quest");
  for (const quest of quests) {
    const hasConnections = relations.some(
      (r: Relation) => r.sourceEntityId === quest.entityId || r.targetEntityId === quest.entityId
    );
    if (!hasConnections) {
      issues.push({
        id: `quest-no-end-${quest.entityId}`,
        type: "warning",
        message: t("canvas.flow.warningStuckQuest", { title: quest.title }),
        entityId: quest.entityId
      });
    }
  }

  // 5. Lugares vacíos
  const locationNodes = canvasNodes.filter((n: CanvasNode) => n.kind === "entity" && entities.find((e: Entity) => e.entityId === n.entityId)?.entityType === "location");
  for (const locNode of locationNodes) {
    const locEntity = entities.find((e: Entity) => e.entityId === locNode.entityId);
    if (!locEntity) continue;
    const hasChildren = canvasNodes.some((n: CanvasNode) => n.groupId === locNode.id);
    const hasEdges = canvasEdges.some((e: CanvasEdge) => e.sourceNodeId === locNode.id || e.targetNodeId === locNode.id);
    
    if (!hasChildren && !hasEdges) {
      issues.push({
        id: `location-empty-${locEntity.entityId}`,
        type: "info",
        message: t("canvas.flow.warningEmptyLocation", { title: locEntity.title }),
        entityId: locEntity.entityId
      });
    }
  }

  // 6. Leaked private relationships
  for (const rel of relations) {
    const source = entities.find((e: Entity) => e.entityId === rel.sourceEntityId);
    const target = entities.find((e: Entity) => e.entityId === rel.targetEntityId);
    if (source && target) {
      const relIsSecret = isDmOnlyVisibility(rel.visibility);
      const sourceIsPublic = source.visibility?.kind === "public";
      const targetIsPublic = target.visibility?.kind === "public";
      if (relIsSecret && sourceIsPublic && targetIsPublic) {
        issues.push({
          id: `relation-leak-${rel.relationId}`,
          type: "info",
          message: t("canvas.flow.warningSecretRelation", { source: source.title, target: target.title }),
        });
      }
    }
  }

  return issues;
};
