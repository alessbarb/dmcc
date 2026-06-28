import type { CampaignProjection } from "./campaignProjection.js";
import type { CampaignId } from "@shared/ids.js";
import type { CampaignStatus } from "../domain/campaign/types.js";
import type { Entity } from "../domain/entity/types.js";
import type { CampaignHealthWarning} from "../domain/shared/alerts.js";
import { evaluateCampaignHealth } from "../domain/shared/alerts.js";

export interface OpenLoop {
  title: string;
  description: string;
  sourceId?: string;
  sourceType?: string;
}

export interface PreparationItem {
  title: string;
  description: string;
  priority: "low" | "normal" | "high";
}

export interface LastSessionSummary {
  sessionId: string;
  title: string;
  date: string;
  summary?: string;
  number?: number;
}

export interface DashboardProjection {
  campaignId: CampaignId;
  currentStatus: CampaignStatus;
  activeQuests: Entity[];
  criticalSecrets: Entity[];
  pendingConsequences: Entity[];
  recentlyChangedEntities: Entity[];
  recentlyUpdatedEntities: Entity[];
  importantNpcWarnings: CampaignHealthWarning[];
  openLoops: OpenLoop[];
  nextPreparationItems: PreparationItem[];
  lastSession: LastSessionSummary | null;
  blockedQuests: Entity[];
  criticalHiddenClues: Entity[];
  preparedClues: Entity[];
}

export function buildDashboardProjection(campaignState: CampaignProjection): DashboardProjection {
  if (!campaignState.campaign) {
    throw new Error("No active campaign in projection.");
  }

  const campaignId = campaignState.campaign.campaignId;
  const currentStatus = campaignState.campaign.status;

  const entities = Array.from(campaignState.entities.values());

  // Active Quests
  const activeQuests = entities.filter(
    (e) => e.entityType === "quest" && e.status === "active" && !e.archived
  );

  // Critical Secrets
  const criticalSecrets = entities.filter(
    (e) => e.entityType === "secret" && e.importance === "critical" && !e.archived
  );

  // Pending Consequences
  const pendingConsequences = entities.filter(
    (e) => e.entityType === "consequence" && e.status === "pending" && !e.archived
  );

  // Recently Changed Entities
  const recentlyChangedEntities = entities
    .filter((e) => !e.archived)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);
  const recentlyUpdatedEntities = recentlyChangedEntities;

  // Health warnings
  const warnings = evaluateCampaignHealth(campaignState);
  const importantNpcWarnings = warnings.filter((w) => {
    if (w.targetType === "entity" && w.targetId) {
      const ent = campaignState.entities.get(w.targetId);
      return ent && ent.entityType === "npc";
    }
    return false;
  });

  // Open Loops (unresolved consequences, active clocks, active quests)
  const openLoops: OpenLoop[] = [];
  for (const cons of pendingConsequences) {
    openLoops.push({
      title: `Unresolved Consequence: ${cons.title}`,
      description: cons.summary || "A player decision has a pending consequence that has not triggered.",
      sourceId: cons.entityId,
      sourceType: "consequence",
    });
  }

  const activeClocks = entities.filter(
    (e) => e.entityType === "clock" && e.status === "active" && !e.archived
  );
  for (const clock of activeClocks) {
    const meta = clock.metadata as any;
    const current = meta.currentSegments || 0;
    const max = meta.maxSegments || 4;
    openLoops.push({
      title: `Active Clock: ${clock.title} (${current}/${max})`,
      description: `Meaning: ${meta.meaning || "Narrative pressure clock ticking."}`,
      sourceId: clock.entityId,
      sourceType: "clock",
    });
  }

  // Next Preparation Items
  const nextPreparationItems: PreparationItem[] = [];

  // Available quests that could be introduced
  const availableQuests = entities.filter(
    (e) => e.entityType === "quest" && e.status === "available" && !e.archived
  );
  for (const q of availableQuests) {
    nextPreparationItems.push({
      title: `Introduce Quest: ${q.title}`,
      description: `Quest is currently available to be discovered by players.`,
      priority: q.importance === "critical" || q.importance === "high" ? "high" : "normal",
    });
  }

  // Prepared/Hidden secrets that have hint conditions
  const hiddenSecrets = entities.filter(
    (e) => e.entityType === "secret" && (e.visibility?.kind ?? "dm_only") === "dm_only" && !e.archived
  );
  for (const sec of hiddenSecrets) {
    const meta = sec.metadata as any;
    if (meta.revealConditions && meta.revealConditions.length > 0) {
      nextPreparationItems.push({
        title: `Plan Secret Reveal: ${sec.title}`,
        description: `Conditions: ${meta.revealConditions.join(", ")}`,
        priority: sec.importance === "critical" ? "high" : "normal",
      });
    }
  }

  // General warnings from health check
  for (const warn of warnings) {
    if (warn.severity === "critical") {
      nextPreparationItems.push({
        title: `Fix Critical Alert: ${warn.title}`,
        description: warn.message,
        priority: "high",
      });
    }
  }

  // Last closed session
  const sessions = Array.from(campaignState.sessions.values());
  const closedSessions = sessions
    .filter((s: any) => s.status === "closed" || s.status === "archived")
    .sort((a: any, b: any) => Date.parse(b.endedAt ?? b.updatedAt ?? 0) - Date.parse(a.endedAt ?? a.updatedAt ?? 0));
  const lastClosedSession = closedSessions[0] as any | undefined;
  const lastSession: LastSessionSummary | null = lastClosedSession
    ? {
        sessionId: lastClosedSession.sessionId,
        title: lastClosedSession.title,
        date: lastClosedSession.endedAt ?? lastClosedSession.updatedAt ?? "",
        summary: lastClosedSession.summary,
        number: lastClosedSession.number,
      }
    : null;

  // Blocked quests — active quests with no revealed clues
  const revealedClueIds = new Set(
    entities
      .filter((e) => e.entityType === "clue" && (e.status === "revealed" || e.status === "known") && !e.archived)
      .map((e) => e.entityId)
  );
  const blockedQuests = activeQuests.filter((q) => {
    const relations = Array.from(campaignState.relations.values()) as any[];
    const relatedClueIds = relations
      .filter((r) => (r.sourceEntityId === q.entityId || r.targetEntityId === q.entityId))
      .map((r) => r.sourceEntityId === q.entityId ? r.targetEntityId : r.sourceEntityId);
    const hasRevealedClue = relatedClueIds.some((id) => revealedClueIds.has(id));
    return !hasRevealedClue && relatedClueIds.length > 0;
  });

  // Critical hidden clues — importance=critical and not revealed
  const criticalHiddenClues = entities.filter(
    (e) => e.entityType === "clue" && e.importance === "critical" && !revealedClueIds.has(e.entityId) && !e.archived
  );

  // Prepared clues — clues in prepared/hidden state (ready for DM to reveal)
  const preparedClues = entities.filter(
    (e) => e.entityType === "clue" && (e.status === "prepared" || e.status === "hidden") && !e.archived
  );

  return {
    campaignId,
    currentStatus,
    activeQuests,
    criticalSecrets,
    pendingConsequences,
    recentlyChangedEntities,
    recentlyUpdatedEntities,
    importantNpcWarnings,
    openLoops,
    nextPreparationItems,
    lastSession,
    blockedQuests,
    criticalHiddenClues,
    preparedClues,
  };
}
