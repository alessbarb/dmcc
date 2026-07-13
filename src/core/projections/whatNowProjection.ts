import type { CampaignProjection } from "./campaignProjection.js";
import type { CampaignId } from "@shared/ids.js";
import type { Entity } from "../domain/entity/types.js";
import type { Session } from "../domain/session/types.js";
import { evaluateCampaignHealth } from "../domain/shared/alerts.js";

function readStringArrayProperty(value: unknown, property: string): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  const raw = Object.entries(value).find(([key]) => key === property)?.[1];
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

export interface FocusItem {
  type: "quest" | "consequence" | "clock" | "npc" | "clue" | "secret" | "scene";
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  entityId?: string;
  reason?: string;
}

export interface KnowledgeAlert {
  clueId: string;
  clueTitle: string;
  message: string;
  knownBy: string[];
}

export interface PreparationChecklistItem {
  task: string;
  done: boolean;
  priority: "low" | "medium" | "high";
}

export interface WhatNowProjection {
  campaignId: CampaignId;
  currentLocation?: Entity;
  currentQuest?: Entity;
  lastSession?: Session;
  recommendedFocus: FocusItem[];
  pendingClues: Entity[];
  hiddenCriticalSecrets: Entity[];
  blockedQuests: Entity[];
  staleImportantNpcs: Entity[];
  unresolvedConsequences: Entity[];
  partialKnowledgeAlerts: KnowledgeAlert[];
  preparationChecklist: PreparationChecklistItem[];
}

export function buildWhatNowProjection(campaignState: CampaignProjection): WhatNowProjection {
  if (!campaignState.campaign) {
    throw new Error("No active campaign in projection.");
  }

  const campaignId = campaignState.campaign.campaignId;

  // Current Location & Quest
  const currentLocation = campaignState.campaign.currentLocationId
    ? campaignState.entities.get(campaignState.campaign.currentLocationId)
    : undefined;

  const currentQuest = campaignState.campaign.currentQuestId
    ? campaignState.entities.get(campaignState.campaign.currentQuestId)
    : undefined;

  const sessions = Array.from(campaignState.sessions.values());
  const entities = Array.from(campaignState.entities.values());

  // Last session
  const closedSessions = sessions
    .filter((s) => s.status === "closed")
    .sort((a, b) => b.number - a.number);
  const lastSession = closedSessions.length > 0 ? closedSessions[0] : undefined;

  // Health alerts
  const warnings = evaluateCampaignHealth(campaignState);

  // Hidden Critical Secrets
  const hiddenCriticalSecrets = entities.filter(
    (e) => e.entityType === "secret" && e.importance === "critical" && (e.visibility?.kind ?? "dm_only") === "dm_only" && !e.archived
  );

  // Pending Clues
  const pendingClues = entities.filter(
    (e) => e.entityType === "clue" && (e.status === "prepared" || e.status === "hidden" || e.status === "pending") && !e.archived
  );

  // Blocked Quests
  const blockedQuestIds = new Set(
    warnings.filter((w) => w.ruleId === "active_quest_blocked").map((w) => w.targetId)
  );
  const blockedQuests = entities.filter((e) =>
    blockedQuestIds.has(e.entityId)
  );

  // Stale NPCs
  const staleNpcIds = new Set(
    warnings.filter((w) => w.ruleId === "stale_important_npc").map((w) => w.targetId)
  );
  const staleImportantNpcs = entities.filter((e) =>
    staleNpcIds.has(e.entityId)
  );

  // Unresolved Consequences
  const unresolvedConsequences = entities.filter(
    (e) => e.entityType === "consequence" && e.status === "pending" && !e.archived
  );

  // Recommended Focus list — curated for DM preparation, not a generic active-entity dump.
  const activeQuests = entities.filter(
    (e) => e.entityType === "quest" && e.status === "active" && !e.archived
  );
  const nextScenes = entities.filter(
    (e) => e.entityType === "scene" && ["next", "ready", "urgent"].includes(e.status) && !e.archived
  );
  const recommendedFocus: FocusItem[] = [
    ...activeQuests.slice(0, 3).map((quest) => ({
      type: "quest" as const,
      entityId: quest.entityId,
      title: quest.title,
      description: quest.summary || "Active quest is likely to drive the next session.",
      urgency: quest.importance === "critical" || quest.importance === "high" ? "high" as const : "medium" as const,
      reason: "active_quest",
    })),
    ...nextScenes.slice(0, 3).map((scene) => ({
      type: "scene" as const,
      entityId: scene.entityId,
      title: scene.title,
      description: scene.summary || "Scene is marked as next or ready.",
      urgency: scene.status === "urgent" ? "high" as const : "medium" as const,
      reason: "next_scene",
    })),
    ...blockedQuests.slice(0, 3).map((quest) => ({
      type: "quest" as const,
      entityId: quest.entityId,
      title: quest.title,
      description: quest.summary || "Active quest needs a clearer player-facing lead.",
      urgency: "high" as const,
      reason: "blocked_quest",
    })),
    ...pendingClues.slice(0, 4).map((clue) => ({
      type: "clue" as const,
      entityId: clue.entityId,
      title: clue.title,
      description: clue.summary || "Prepared clue is ready to be placed in the next scene.",
      urgency: clue.importance === "critical" ? "high" as const : "medium" as const,
      reason: "prepared_clue",
    })),
    ...unresolvedConsequences.slice(0, 3).map((consequence) => ({
      type: "consequence" as const,
      entityId: consequence.entityId,
      title: consequence.title,
      description: consequence.summary || "A pending consequence needs a trigger or scene.",
      urgency: consequence.importance === "critical" || consequence.importance === "high" ? "high" as const : "medium" as const,
      reason: "pending_consequence",
    })),
    ...hiddenCriticalSecrets.slice(0, 3).map((secret) => ({
      type: "secret" as const,
      entityId: secret.entityId,
      title: secret.title,
      description: secret.summary || "Critical secret still has no player-facing reveal.",
      urgency: "high" as const,
      reason: "hidden_critical_secret",
    })),
    ...staleImportantNpcs.slice(0, 3).map((npc) => ({
      type: "npc" as const,
      entityId: npc.entityId,
      title: npc.title,
      description: npc.summary || "Important NPC has not appeared recently.",
      urgency: "medium" as const,
      reason: "stale_npc",
    })),
  ].slice(0, 10);

  // Partial Knowledge Alerts
  const partialKnowledgeAlerts: KnowledgeAlert[] = [];
  const cluesWithPartialKnowledge = entities.filter(
    (e) =>
      e.entityType === "clue" &&
      (e.visibility.kind === "players" || e.visibility.kind === "characters") &&
      !e.archived
  );

  for (const clue of cluesWithPartialKnowledge) {
    const knownBy: string[] = [];
    if (clue.visibility.kind === "players") {
      for (const pId of clue.visibility.playerIds) {
        const player = campaignState.players.get(pId);
        if (player) knownBy.push(player.displayName);
      }
    }
    if (clue.visibility.kind === "characters") {
      for (const cId of clue.visibility.characterEntityIds) {
        const char = campaignState.entities.get(cId);
        if (char) knownBy.push(char.title);
      }
    }

    partialKnowledgeAlerts.push({
      clueId: clue.entityId,
      clueTitle: clue.title,
      message: `La pista "${clue.title}" solo es conocida por: ${knownBy.join(", ")}.`,
      knownBy,
    });
  }

  // Preparation Checklist
  const preparationChecklist: PreparationChecklistItem[] = [];
  const completedTasks = readStringArrayProperty(campaignState.campaign?.settings, "completedChecklistTasks");
  const isDone = (task: string) => completedTasks.includes(task);

  // Checklist item for blocked quests
  if (blockedQuests.length > 0) {
    const task = `Preparar pistas para desbloquear misión: ${blockedQuests[0].title}`;
    preparationChecklist.push({
      task,
      done: isDone(task),
      priority: "high",
    });
  }

  // Checklist item for stale NPCs
  if (staleImportantNpcs.length > 0) {
    const task = `Reintroducir PNJ inactivo: ${staleImportantNpcs[0].title}`;
    preparationChecklist.push({
      task,
      done: isDone(task),
      priority: "medium",
    });
  }

  // Checklist item for pending consequence
  if (unresolvedConsequences.length > 0) {
    const task = `Planificar escena para consecuencia: ${unresolvedConsequences[0].title}`;
    preparationChecklist.push({
      task,
      done: isDone(task),
      priority: "high",
    });
  }

  // Default checks
  const taskReview = "Revisar resumen de la sesión anterior";
  preparationChecklist.push({
    task: taskReview,
    done: isDone(taskReview),
    priority: "medium",
  });

  const taskScenes = "Preparar próximas escenas o encuentros";
  preparationChecklist.push({
    task: taskScenes,
    done: isDone(taskScenes),
    priority: "medium",
  });

  return {
    campaignId,
    currentLocation,
    currentQuest,
    lastSession,
    recommendedFocus,
    pendingClues,
    hiddenCriticalSecrets,
    blockedQuests,
    staleImportantNpcs,
    unresolvedConsequences,
    partialKnowledgeAlerts,
    preparationChecklist,
  };
}
