import type { CampaignProjection } from "../../projections/campaignProjection.js";

export interface CampaignHealthWarning {
  ruleId: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  targetId?: string;
  targetType?: "entity" | "relation" | "fact";
}

export interface CampaignHealthRule {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  evaluate(context: CampaignProjection): CampaignHealthWarning[];
}

export const rules: CampaignHealthRule[] = [
  {
    id: "critical_clue_hidden",
    title: "Critical Clue Hidden",
    description: "Detects critical clues that have not yet been revealed to the players.",
    severity: "critical",
    evaluate(context: CampaignProjection): CampaignHealthWarning[] {
      const warnings: CampaignHealthWarning[] = [];
      for (const ent of Array.from(context.entities.values())) {
        if (
          ent.entityType === "clue" &&
          ent.importance === "critical" &&
          (ent.status === "hidden" || ent.status === "prepared" || ent.status === "pending") &&
          !ent.archived
        ) {
          warnings.push({
            ruleId: this.id,
            title: this.title,
            message: `Critical clue "${ent.title}" is still hidden from the players.`,
            severity: this.severity,
            targetId: ent.entityId,
            targetType: "entity",
          });
        }
      }
      return warnings;
    },
  },
  {
    id: "active_quest_blocked",
    title: "Active Quest Blocked",
    description: "Detects active quests that have connected clues, but none of those clues have been revealed.",
    severity: "warning",
    evaluate(context: CampaignProjection): CampaignHealthWarning[] {
      const warnings: CampaignHealthWarning[] = [];
      const activeQuests = Array.from(context.entities.values()).filter(
        (e) => e.entityType === "quest" && e.status === "active" && !e.archived
      );

      for (const quest of activeQuests) {
        // Find relations pointing to this quest from clues
        const relationsToQuest = Array.from(context.relations.values()).filter(
          (r) => r.targetEntityId === quest.entityId && !r.archived
        );

        const clueRelations = relationsToQuest.filter((r) => {
          const source = context.entities.get(r.sourceEntityId);
          return source && source.entityType === "clue";
        });

        if (clueRelations.length > 0) {
          // Check if at least one of these clues is revealed
          const hasRevealedClue = clueRelations.some((r) => {
            const clue = context.entities.get(r.sourceEntityId);
            return clue && clue.status === "revealed";
          });

          if (!hasRevealedClue) {
            warnings.push({
              ruleId: this.id,
              title: this.title,
              message: `Active quest "${quest.title}" has clue connections, but none have been revealed to the party yet.`,
              severity: this.severity,
              targetId: quest.entityId,
              targetType: "entity",
            });
          }
        }
      }
      return warnings;
    },
  },
  {
    id: "stale_important_npc",
    title: "Important NPC Forgotten",
    description: "Detects high or critical importance NPCs that have not been seen for several sessions.",
    severity: "warning",
    evaluate(context: CampaignProjection): CampaignHealthWarning[] {
      const warnings: CampaignHealthWarning[] = [];
      const closedSessions = Array.from(context.sessions.values())
        .filter((s) => s.status === "closed")
        .sort((a, b) => b.number - a.number);

      if (closedSessions.length < 3) {
        return []; // Not enough history to mark as stale
      }

      const latestSessionNumber = closedSessions[0].number;
      const importantNpcs = Array.from(context.entities.values()).filter(
        (e) =>
          e.entityType === "npc" &&
          (e.importance === "high" || e.importance === "critical") &&
          e.status !== "dead" &&
          !e.archived
      );

      for (const npc of importantNpcs) {
        let lastSeenSessionNumber = 0;
        if (npc.lastSeenSessionId) {
          const sess = context.sessions.get(npc.lastSeenSessionId);
          if (sess) {
            lastSeenSessionNumber = sess.number;
          }
        }

        if (latestSessionNumber - lastSeenSessionNumber >= 3) {
          warnings.push({
            ruleId: this.id,
            title: this.title,
            message: `Important NPC "${npc.title}" has not appeared for ${
              latestSessionNumber - lastSeenSessionNumber
            } sessions.`,
            severity: this.severity,
            targetId: npc.entityId,
            targetType: "entity",
          });
        }
      }
      return warnings;
    },
  },
  {
    id: "too_many_active_quests",
    title: "Too Many Active Quests",
    description: "Triggers when there are more active quests than configured limit.",
    severity: "info",
    evaluate(context: CampaignProjection): CampaignHealthWarning[] {
      const activeQuests = Array.from(context.entities.values()).filter(
        (e) => e.entityType === "quest" && e.status === "active" && !e.archived
      );

      const limit = context.campaign?.settings?.activeQuestsLimit ?? 5;
      if (activeQuests.length > limit) {
        return [
          {
            ruleId: this.id,
            title: this.title,
            message: `There are currently ${activeQuests.length} active quests. Consider pausing or completing some to avoid plot clutter.`,
            severity: this.severity,
          },
        ];
      }
      return [];
    },
  },
  {
    id: "hinted_secret_unrevealable",
    title: "Secret Hinted with no Clues",
    description: "Detects hinted or partially revealed secrets that have no associated clues to fully uncover them.",
    severity: "warning",
    evaluate(context: CampaignProjection): CampaignHealthWarning[] {
      const warnings: CampaignHealthWarning[] = [];
      const secrets = Array.from(context.entities.values()).filter(
        (e) =>
          e.entityType === "secret" &&
          (e.status === "hinted" || e.status === "partially_revealed") &&
          !e.archived
      );

      for (const secret of secrets) {
        const relations = Array.from(context.relations.values()).filter(
          (r) =>
            (r.sourceEntityId === secret.entityId || r.targetEntityId === secret.entityId) &&
            !r.archived
        );

        const hasRelatedClue = relations.some((r) => {
          const otherId = r.sourceEntityId === secret.entityId ? r.targetEntityId : r.sourceEntityId;
          const other = context.entities.get(otherId);
          return other && other.entityType === "clue" && !other.archived;
        });

        if (!hasRelatedClue) {
          warnings.push({
            ruleId: this.id,
            title: this.title,
            message: `Secret "${secret.title}" is hinted to the party, but has no connected clues that would allow them to investigate further.`,
            severity: this.severity,
            targetId: secret.entityId,
            targetType: "entity",
          });
        }
      }
      return warnings;
    },
  },
  {
    id: "pending_consequence_stale",
    title: "Consequence Pending Too Long",
    description: "Triggers when a consequence has remained pending for more than 3 sessions.",
    severity: "warning",
    evaluate(context: CampaignProjection): CampaignHealthWarning[] {
      const warnings: CampaignHealthWarning[] = [];
      const closedSessions = Array.from(context.sessions.values()).filter((s) => s.status === "closed");

      if (closedSessions.length < 3) return [];

      const currentSessionNumber =
        closedSessions.length > 0
          ? Math.max(...closedSessions.map((s) => s.number))
          : 0;

      const pendingConsequences = Array.from(context.entities.values()).filter(
        (e) => e.entityType === "consequence" && e.status === "pending" && !e.archived
      );

      for (const cons of pendingConsequences) {
        let creationSessionNumber = 0;
        if (cons.firstSeenSessionId) {
          const sess = context.sessions.get(cons.firstSeenSessionId);
          if (sess) {
            creationSessionNumber = sess.number;
          }
        }

        if (currentSessionNumber - creationSessionNumber >= 3) {
          warnings.push({
            ruleId: this.id,
            title: this.title,
            message: `Consequence "${cons.title}" has been pending since Session #${creationSessionNumber} (over 3 sessions ago).`,
            severity: this.severity,
            targetId: cons.entityId,
            targetType: "entity",
          });
        }
      }
      return warnings;
    },
  },
];

export function evaluateCampaignHealth(context: CampaignProjection): CampaignHealthWarning[] {
  const warnings: CampaignHealthWarning[] = [];
  for (const rule of rules) {
    warnings.push(...rule.evaluate(context));
  }
  return warnings;
}
