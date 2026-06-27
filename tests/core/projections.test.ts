import { describe, it, expect } from "vitest";
import {
  createEmptyCampaignProjection,
  applyEvent,
} from "../../src/core/projections/campaignProjection.js";
import { buildDashboardProjection } from "../../src/core/projections/dashboardProjection.js";
import { buildWhatNowProjection } from "../../src/core/projections/whatNowProjection.js";
import { evaluateCampaignHealth } from "../../src/core/domain/shared/alerts.js";
import {
  generateCampaignId,
  generateEntityId,
  generateRelationId,
  generateEventId,
  generatePlayerId,
} from "../../src/shared/ids.js";

describe("Projections and Alerts", () => {
  const campaignId = generateCampaignId();
  const actorId = "usr_dm";

  it("calculates campaign projection, alerts, dashboard, and what-now projection correctly", () => {
    let state = createEmptyCampaignProjection();

    // 1. CampaignCreated
    state = applyEvent(state, {
      sequence: 1,
      eventId: generateEventId(),
      campaignId,
      type: "CampaignCreated",
      occurredAt: new Date().toISOString(),
      actorId,
      payload: {
        id: campaignId,
        title: "Sombras en Phandalin",
        system: "dnd_srd_5_2_1",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 2 },
      },
      schemaVersion: 1,
    });

    expect(state.campaign?.title).toBe("Sombras en Phandalin");
    expect(state.lastSequence).toBe(1);

    // 2. Add a Player Profile
    const playerId = generatePlayerId();
    state = applyEvent(state, {
      sequence: 2,
      eventId: generateEventId(),
      campaignId,
      type: "PlayerProfileCreated",
      occurredAt: new Date().toISOString(),
      actorId,
      payload: {
        id: playerId,
        campaignId,
        displayName: "Alessio",
        role: "player",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      schemaVersion: 1,
    });

    expect(state.players.get(playerId)?.displayName).toBe("Alessio");

    // 3. Create a critical clue that is hidden
    const clueId = generateEntityId();
    state = applyEvent(state, {
      sequence: 3,
      eventId: generateEventId(),
      campaignId,
      type: "EntityCreated",
      occurredAt: new Date().toISOString(),
      actorId,
      payload: {
        id: clueId,
        campaignId,
        type: "clue",
        title: "Mapa del Castillo Tres Dagas",
        status: "hidden",
        importance: "critical",
        visibility: { mode: "dm_only" },
        tags: [],
        metadata: { content: "Un mapa antiguo que detalla la guarida de los trasgos." },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      schemaVersion: 1,
    });

    // 4. Create an active quest
    const questId = generateEntityId();
    state = applyEvent(state, {
      sequence: 4,
      eventId: generateEventId(),
      campaignId,
      type: "EntityCreated",
      occurredAt: new Date().toISOString(),
      actorId,
      payload: {
        id: questId,
        campaignId,
        type: "quest",
        title: "Encontrar el Castillo Tres Dagas",
        status: "active",
        importance: "high",
        visibility: { mode: "dm_only" },
        tags: [],
        metadata: { publicObjective: "Localizar el castillo de los trasgos." },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      schemaVersion: 1,
    });

    // 5. Connect the clue to the quest (Relation pointing: clue -> quest)
    const relId = generateRelationId();
    state = applyEvent(state, {
      sequence: 5,
      eventId: generateEventId(),
      campaignId,
      type: "RelationCreated",
      occurredAt: new Date().toISOString(),
      actorId,
      payload: {
        id: relId,
        campaignId,
        sourceEntityId: clueId,
        targetEntityId: questId,
        type: "unlocks",
        status: "active",
        visibility: { mode: "dm_only" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      schemaVersion: 1,
    });

    // --- ALERT ENGINE CHECKS ---
    const warnings = evaluateCampaignHealth(state);

    // Warning 1: critical clue still hidden
    const hiddenClueWarn = warnings.find((w) => w.ruleId === "critical_clue_hidden");
    expect(hiddenClueWarn).toBeDefined();
    expect(hiddenClueWarn?.targetId).toBe(clueId);

    // Warning 2: active quest is blocked because the connecting clue is hidden
    const blockedQuestWarn = warnings.find((w) => w.ruleId === "active_quest_blocked");
    expect(blockedQuestWarn).toBeDefined();
    expect(blockedQuestWarn?.targetId).toBe(questId);

    // --- DASHBOARD PROJECTION CHECKS ---
    const dashboard = buildDashboardProjection(state);
    expect(dashboard.activeQuests.length).toBe(1);
    expect(dashboard.activeQuests[0].title).toBe("Encontrar el Castillo Tres Dagas");
    expect(dashboard.criticalSecrets.length).toBe(0); // Clue is not a secret
    expect(dashboard.nextPreparationItems.length).toBeGreaterThan(0);

    // --- WHAT NOW PROJECTION CHECKS ---
    const whatNow = buildWhatNowProjection(state);
    expect(whatNow.blockedQuests.length).toBe(1);
    expect(whatNow.blockedQuests[0].id).toBe(questId);
    expect(whatNow.pendingClues.length).toBe(1);
    expect(whatNow.pendingClues[0].id).toBe(clueId);
    expect(whatNow.preparationChecklist.length).toBeGreaterThan(0);
    expect(whatNow.preparationChecklist.some((c) => c.priority === "high")).toBe(true);
  });
});
