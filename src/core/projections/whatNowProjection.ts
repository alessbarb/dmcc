import type { CampaignProjection } from "./campaignProjection.js";
import type { CampaignId } from "@shared/ids.js";
import type { Entity } from "../domain/entity/types.js";
import type { Session } from "../domain/session/types.js";
import { evaluateCampaignHealth } from "../domain/shared/alerts.js";

export interface FocusItem {
  type: "quest" | "consequence" | "clock" | "npc";
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
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
  recommendedFocus: any[];
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
    (e) => e.entityType === "secret" && e.importance === "critical" && (e.status === "dm_only" || e.status === "hidden") && !e.archived
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

  // Recommended Focus list
  const statusOrder = ["ready", "active", "urgent", "next", "pending"];
  const recommendedFocus = entities
    .filter((e: any) => !e.archived && statusOrder.includes(e.status))
    .sort((a: any, b: any) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

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
    if (clue.visibility.playerIds) {
      for (const pId of clue.visibility.playerIds) {
        const player = campaignState.players.get(pId);
        if (player) knownBy.push(player.displayName);
      }
    }
    if (clue.visibility.characterEntityIds) {
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
  const completedTasks: string[] = (campaignState.campaign?.settings as any)?.completedChecklistTasks || [];
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
