import * as fs from "fs/promises";
import { join } from "path";
import type { CampaignProjection } from "@core/projections/campaignProjection.js";
import type { StoredEvent } from "@core/domain/shared/events.js";

export type IntegritySeverity = "error" | "warning" | "info";

export interface CampaignIntegrityIssue {
  severity: IntegritySeverity;
  code: string;
  targetType: string;
  targetId?: string;
  message: string;
  repair?: "rebuild_snapshot" | "remove_or_relink_reference" | "review_visibility" | "restore_missing_file";
}

export interface CampaignIntegrityReport {
  ok: boolean;
  checkedAt: string;
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    events: number;
    entities: number;
    relations: number;
    facts: number;
    sessions: number;
    players: number;
    canvases: number;
  };
  readiness: Array<{
    key: string;
    status: "ok" | "warning" | "missing";
    label: string;
    details?: string;
  }>;
  issues: CampaignIntegrityIssue[];
}

function values<T = any>(mapLike: Map<string, T> | Record<string, T> | undefined | null): T[] {
  if (!mapLike) return [];
  if (mapLike instanceof Map) return Array.from(mapLike.values());
  return Object.values(mapLike);
}

function hasVisibility(target: any): boolean {
  return Boolean(target?.visibility?.kind || target?.visibility?.mode);
}

function isPublicVisibility(target: any): boolean {
  const kind = target?.visibility?.kind || target?.visibility?.mode || "dm_only";
  return kind === "party" || kind === "public";
}

export function buildCampaignIntegrityReport(args: {
  state: CampaignProjection;
  events: StoredEvent[];
}): CampaignIntegrityReport {
  const { state, events } = args;
  const issues: CampaignIntegrityIssue[] = [];
  const entities = values(state.entities);
  const relations = values(state.relations);
  const facts = values(state.facts);
  const sessions = values(state.sessions);
  const players = values(state.players);
  const canvases = values(state.canvases);

  const entityIds = new Set(entities.map((entity: any) => entity.entityId || entity.id).filter(Boolean));
  const relationIds = new Set(relations.map((relation: any) => relation.relationId || relation.id).filter(Boolean));
  const factIds = new Set(facts.map((fact: any) => fact.factId || fact.id).filter(Boolean));
  const sessionIds = new Set(sessions.map((session: any) => session.sessionId || session.id).filter(Boolean));
  const playerIds = new Set(players.map((player: any) => player.playerId || player.id).filter(Boolean));

  const push = (issue: CampaignIntegrityIssue) => issues.push(issue);

  if (!state.campaign) {
    push({
      severity: "error",
      code: "campaign.missing_projection",
      targetType: "campaign",
      message: "La proyección no contiene campaña. Reconstruye snapshots desde el log de eventos.",
      repair: "rebuild_snapshot",
    });
  }

  for (const event of events) {
    if (event.sequence !== events.indexOf(event) + 1) {
      push({
        severity: "error",
        code: "events.sequence_gap",
        targetType: "event",
        targetId: event.eventId,
        message: `Secuencia de eventos inconsistente en ${event.eventId}.`,
      });
      break;
    }
  }

  const seenEntityIds = new Set<string>();
  for (const entity of entities as any[]) {
    const entityId = entity.entityId || entity.id;
    if (!entityId) {
      push({ severity: "error", code: "entity.missing_id", targetType: "entity", message: "Hay una entidad sin identificador." });
      continue;
    }
    if (seenEntityIds.has(entityId)) {
      push({ severity: "error", code: "entity.duplicate_id", targetType: "entity", targetId: entityId, message: `Entidad duplicada: ${entityId}.` });
    }
    seenEntityIds.add(entityId);
    if (!entity.title || String(entity.title).trim() === "") {
      push({ severity: "error", code: "entity.missing_title", targetType: "entity", targetId: entityId, message: "La entidad no tiene título." });
    }
    if (!entity.entityType && !entity.type) {
      push({ severity: "error", code: "entity.missing_type", targetType: "entity", targetId: entityId, message: "La entidad no tiene tipo." });
    }
    if (!hasVisibility(entity)) {
      push({ severity: "warning", code: "entity.missing_visibility", targetType: "entity", targetId: entityId, message: "La entidad no tiene visibilidad explícita.", repair: "review_visibility" });
    }
    if ((entity.entityType || entity.type) === "player_character") {
      const ownerPlayerId = entity.metadata?.playerId;
      if (ownerPlayerId && !playerIds.has(ownerPlayerId)) {
        push({
          severity: "warning",
          code: "entity.player_character_missing_player",
          targetType: "entity",
          targetId: entityId,
          message: `El personaje apunta al jugador inexistente ${ownerPlayerId}.`,
          repair: "remove_or_relink_reference",
        });
      }
    }
  }

  for (const relation of relations as any[]) {
    const relationId = relation.relationId || relation.id;
    if (!relationId) {
      push({ severity: "error", code: "relation.missing_id", targetType: "relation", message: "Hay una relación sin identificador." });
      continue;
    }
    if (!entityIds.has(relation.sourceEntityId)) {
      push({ severity: "error", code: "relation.missing_source", targetType: "relation", targetId: relationId, message: `La relación apunta a origen inexistente: ${relation.sourceEntityId}.`, repair: "remove_or_relink_reference" });
    }
    if (!entityIds.has(relation.targetEntityId)) {
      push({ severity: "error", code: "relation.missing_target", targetType: "relation", targetId: relationId, message: `La relación apunta a destino inexistente: ${relation.targetEntityId}.`, repair: "remove_or_relink_reference" });
    }
    if (!hasVisibility(relation)) {
      push({ severity: "warning", code: "relation.missing_visibility", targetType: "relation", targetId: relationId, message: "La relación no tiene visibilidad explícita.", repair: "review_visibility" });
    }
  }

  for (const fact of facts as any[]) {
    const factId = fact.factId || fact.id;
    if (!factId) {
      push({ severity: "error", code: "fact.missing_id", targetType: "fact", message: "Hay un hecho sin identificador." });
      continue;
    }
    for (const entityId of fact.relatedEntityIds || []) {
      if (!entityIds.has(entityId)) {
        push({ severity: "error", code: "fact.missing_entity", targetType: "fact", targetId: factId, message: `El hecho referencia una entidad inexistente: ${entityId}.`, repair: "remove_or_relink_reference" });
      }
    }
    for (const relationId of fact.relatedRelationIds || []) {
      if (!relationIds.has(relationId)) {
        push({ severity: "error", code: "fact.missing_relation", targetType: "fact", targetId: factId, message: `El hecho referencia una relación inexistente: ${relationId}.`, repair: "remove_or_relink_reference" });
      }
    }
    if (!hasVisibility(fact)) {
      push({ severity: "warning", code: "fact.missing_visibility", targetType: "fact", targetId: factId, message: "El hecho no tiene visibilidad explícita.", repair: "review_visibility" });
    }
  }

  for (const session of sessions as any[]) {
    const sessionId = session.sessionId || session.id;
    if (!sessionId) {
      push({ severity: "error", code: "session.missing_id", targetType: "session", message: "Hay una sesión sin identificador." });
    }
    if (!session.title || String(session.title).trim() === "") {
      push({ severity: "warning", code: "session.missing_title", targetType: "session", targetId: sessionId, message: "La sesión no tiene título." });
    }
  }

  for (const sessionEvent of values(state.sessionEvents) as any[]) {
    const id = sessionEvent.sessionEventId || sessionEvent.id;
    if (sessionEvent.sessionId && !sessionIds.has(sessionEvent.sessionId)) {
      push({ severity: "error", code: "session_event.missing_session", targetType: "session_event", targetId: id, message: `El evento de sesión apunta a una sesión inexistente: ${sessionEvent.sessionId}.`, repair: "remove_or_relink_reference" });
    }
    for (const entityId of sessionEvent.relatedEntityIds || []) {
      if (!entityIds.has(entityId)) {
        push({ severity: "error", code: "session_event.missing_entity", targetType: "session_event", targetId: id, message: `El evento de sesión referencia una entidad inexistente: ${entityId}.`, repair: "remove_or_relink_reference" });
      }
    }
    for (const factId of sessionEvent.relatedFactIds || []) {
      if (!factIds.has(factId)) {
        push({ severity: "error", code: "session_event.missing_fact", targetType: "session_event", targetId: id, message: `El evento de sesión referencia un hecho inexistente: ${factId}.`, repair: "remove_or_relink_reference" });
      }
    }
  }

  for (const canvas of canvases as any[]) {
    const canvasId = canvas.id || canvas.canvasId;
    const nodeIds = new Set<string>();
    for (const node of canvas.nodes || []) {
      nodeIds.add(node.id);
      if (node.kind === "entity" && node.entityId && !entityIds.has(node.entityId)) {
        push({ severity: "error", code: "canvas_node.missing_entity", targetType: "canvas_node", targetId: node.id, message: `El nodo del canvas ${canvasId} apunta a una entidad inexistente: ${node.entityId}.`, repair: "remove_or_relink_reference" });
      }
      if (node.kind === "fact" && node.factId && !factIds.has(node.factId)) {
        push({ severity: "error", code: "canvas_node.missing_fact", targetType: "canvas_node", targetId: node.id, message: `El nodo del canvas ${canvasId} apunta a un hecho inexistente: ${node.factId}.`, repair: "remove_or_relink_reference" });
      }
    }
    for (const edge of canvas.edges || []) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        push({ severity: "error", code: "canvas_edge.missing_source_node", targetType: "canvas_edge", targetId: edge.id, message: `La arista del canvas ${canvasId} apunta a un nodo origen inexistente: ${edge.sourceNodeId}.`, repair: "remove_or_relink_reference" });
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        push({ severity: "error", code: "canvas_edge.missing_target_node", targetType: "canvas_edge", targetId: edge.id, message: `La arista del canvas ${canvasId} apunta a un nodo destino inexistente: ${edge.targetNodeId}.`, repair: "remove_or_relink_reference" });
      }
      if (edge.relationshipId && !relationIds.has(edge.relationshipId)) {
        push({ severity: "error", code: "canvas_edge.missing_relation", targetType: "canvas_edge", targetId: edge.id, message: `La arista del canvas ${canvasId} apunta a una relación inexistente: ${edge.relationshipId}.`, repair: "remove_or_relink_reference" });
      }
    }
  }

  const publicEntities = entities.filter(isPublicVisibility).length;
  const activeSessions = sessions.filter((session: any) => session.status === "active").length;
  const hasRecentBackupInfo = false;
  const readiness = [
    {
      key: "entities",
      status: entities.length > 0 ? "ok" as const : "missing" as const,
      label: "Entidades principales",
      details: `${entities.length} entidades`,
    },
    {
      key: "relations",
      status: relations.length > 0 ? "ok" as const : "warning" as const,
      label: "Relaciones narrativas",
      details: `${relations.length} relaciones`,
    },
    {
      key: "sessions",
      status: sessions.length > 0 ? "ok" as const : "warning" as const,
      label: "Sesiones preparadas o jugadas",
      details: `${sessions.length} sesiones, ${activeSessions} activas`,
    },
    {
      key: "players",
      status: players.length > 0 ? "ok" as const : "warning" as const,
      label: "Jugadores",
      details: `${players.length} jugadores`,
    },
    {
      key: "public_content",
      status: publicEntities > 0 ? "ok" as const : "warning" as const,
      label: "Contenido visible para jugadores",
      details: `${publicEntities} entidades visibles`,
    },
    {
      key: "backups",
      status: hasRecentBackupInfo ? "ok" as const : "warning" as const,
      label: "Backups",
      details: "Consulta /backups para ver copias recientes.",
    },
  ];

  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  const infos = issues.filter((issue) => issue.severity === "info").length;

  return {
    ok: errors === 0,
    checkedAt: new Date().toISOString(),
    summary: {
      errors,
      warnings,
      infos,
      events: events.length,
      entities: entities.length,
      relations: relations.length,
      facts: facts.length,
      sessions: sessions.length,
      players: players.length,
      canvases: canvases.length,
    },
    readiness,
    issues,
  };
}

export async function findMissingAttachmentFiles(args: {
  dataDir: string;
  vaultId: string;
  campaignId: string;
  state: CampaignProjection;
}): Promise<CampaignIntegrityIssue[]> {
  const issues: CampaignIntegrityIssue[] = [];
  const attachmentsDir = join(args.dataDir, "vaults", args.vaultId, "campaigns", args.campaignId, "attachments");
  for (const attachment of values(args.state.attachments) as any[]) {
    const id = attachment.id || attachment.attachmentId;
    if (!id) continue;
    const candidates = [
      join(attachmentsDir, id),
      join(attachmentsDir, `${id}.${String(attachment.filename || "").split(".").pop() || "bin"}`),
    ];
    const exists = await Promise.all(candidates.map((candidate) => fs.stat(candidate).then((stat) => stat.isFile()).catch(() => false)));
    if (!exists.some(Boolean)) {
      issues.push({
        severity: "warning",
        code: "attachment.missing_file",
        targetType: "attachment",
        targetId: id,
        message: `El adjunto ${attachment.filename || id} está registrado, pero no se localiza el archivo físico.`,
        repair: "restore_missing_file",
      });
    }
  }
  return issues;
}
