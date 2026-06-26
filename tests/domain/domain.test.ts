import { describe, it, expect } from "vitest";
import { entitySchema } from "../../src/domain/entity/types.js";
import { relationSchema } from "../../src/domain/relation/types.js";
import { factSchema } from "../../src/domain/fact/types.js";
import { createEntity } from "../../src/domain/entity/entity.js";
import {
  generateCampaignId,
  generateEntityId,
  generateRelationId,
  generateFactId,
} from "../../src/shared/ids.js";

describe("Domain Aggregates", () => {
  const campaignId = generateCampaignId();

  describe("Entity", () => {
    it("successfully validates NPC with correct metadata", () => {
      const npc = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "npc",
        title: "Daran Edermath",
        status: "known",
        importance: "normal",
        visibility: { kind: "dm_only" },
        tagIds: [],
        metadata: {
          role: "Retired adventurer",
          attitudeToParty: "friendly",
          personality: "Stouthearted and vigilant",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = entitySchema.safeParse(npc);
      expect(result.success).toBe(true);
    });

    it("fails validation for NPC with invalid metadata types", () => {
      const npc = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "npc",
        title: "Daran Edermath",
        status: "known",
        importance: "normal",
        visibility: { kind: "dm_only" },
        tagIds: [],
        metadata: {
          attitudeToParty: "non_existent_attitude", // Invalid enum value
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = entitySchema.safeParse(npc);
      expect(result.success).toBe(false);
    });

    it("successfully validates Clock metadata", () => {
      const clock = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "clock",
        title: "Orc Raid Threat",
        status: "active",
        importance: "high",
        visibility: { kind: "dm_only" },
        tagIds: [],
        metadata: {
          maxSegments: 6,
          currentSegments: 2,
          meaning: "Orcs attack Phandalin when filled",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = entitySchema.safeParse(clock);
      expect(result.success).toBe(true);
    });

    it("rejects Clue without metadata.content", () => {
      const clueProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "clue",
        title: "Sigil",
        metadata: {}
      };
      expect(() => createEntity(clueProps)).toThrow("Clue entity requires metadata.content");
    });

    it("rejects Secret without metadata.truth", () => {
      const secretProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "secret",
        title: "Curse",
        metadata: {}
      };
      expect(() => createEntity(secretProps)).toThrow("Secret entity requires metadata.truth");
    });

    it("allows Player Character without metadata.playerId (pre-made template) for generic system", () => {
      const pcProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "player_character",
        title: "Hero",
        metadata: {
          isPremade: true
        },
        campaignSystem: "generic_fantasy_d20"
      };
      expect(() => createEntity(pcProps)).not.toThrow();
    });

    it("rejects Player Character without metadata.playerId for generic system if not isPremade", () => {
      const pcProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "player_character",
        title: "Hero",
        metadata: {},
        campaignSystem: "generic_fantasy_d20"
      };
      expect(() => createEntity(pcProps)).toThrow(/playerId/i);
    });

    it("rejects Player Character for dnd_srd_5_2_1 campaign when missing required fields like strength or className", () => {
      const pcProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "player_character",
        title: "D&D Hero",
        metadata: {
          playerId: "ply_player_1",
          level: 1,
          species: "Elfo",
          background: "Acólito"
          // Missing strength, dexterity, constitution, intelligence, wisdom, charisma, speed, initiative, passivePerception, passiveInsight, passiveInvestigation, hitDice, etc.
        },
        campaignSystem: "dnd_srd_5_2_1"
      };
      expect(() => createEntity(pcProps)).toThrow();
    });

    it("allows Player Character for dnd_srd_5_2_1 campaign when all required fields are provided", () => {
      const pcProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "player_character",
        title: "D&D Hero Valid",
        metadata: {
          playerId: "ply_player_1",
          className: "Pícaro",
          level: 1,
          species: "Elfo",
          background: "Forajida",
          armorClass: 14,
          hitPointsCurrent: 8,
          hitPointsMax: 8,
          hitDice: "1d8",
          speed: 30,
          initiative: 3,
          passivePerception: 14,
          passiveInsight: 12,
          passiveInvestigation: 13,
          strength: 8,
          dexterity: 17,
          constitution: 12,
          intelligence: 13,
          wisdom: 14,
          charisma: 10
        },
        campaignSystem: "dnd_srd_5_2_1"
      };
      expect(() => createEntity(pcProps)).not.toThrow();
    });

    it("allows Player Character without playerId (pre-made template) for dnd_srd_5_2_1 campaign when all other required fields are provided", () => {
      const pcProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "player_character",
        title: "D&D Hero Premade Valid",
        metadata: {
          isPremade: true,
          className: "Pícaro",
          level: 1,
          species: "Elfo",
          background: "Forajida",
          armorClass: 14,
          hitPointsCurrent: 8,
          hitPointsMax: 8,
          hitDice: "1d8",
          speed: 30,
          initiative: 3,
          passivePerception: 14,
          passiveInsight: 12,
          passiveInvestigation: 13,
          strength: 8,
          dexterity: 17,
          constitution: 12,
          intelligence: 13,
          wisdom: 14,
          charisma: 10
        },
        campaignSystem: "dnd_srd_5_2_1"
      };
      expect(() => createEntity(pcProps)).not.toThrow();
    });

    it("rejects Player Character for dnd_srd_5_2_1 campaign at level 3 if subclass is missing", () => {
      const pcProps = {
        entityId: generateEntityId(),
        campaignId,
        entityType: "player_character",
        title: "D&D Level 3 Hero",
        metadata: {
          playerId: "ply_player_1",
          className: "Pícaro",
          level: 3,
          species: "Elfo",
          background: "Forajida",
          armorClass: 14,
          hitPointsCurrent: 20,
          hitPointsMax: 20,
          hitDice: "3d8",
          speed: 30,
          initiative: 3,
          passivePerception: 14,
          passiveInsight: 12,
          passiveInvestigation: 13,
          strength: 8,
          dexterity: 17,
          constitution: 12,
          intelligence: 13,
          wisdom: 14,
          charisma: 10
          // Missing subclass for level 3
        },
        campaignSystem: "dnd_srd_5_2_1"
      };
      expect(() => createEntity(pcProps)).toThrow(/subclass/i);
    });
  });

  describe("Relation", () => {
    it("validates built-in relation type", () => {
      const rel = {
        relationId: generateRelationId(),
        campaignId,
        sourceEntityId: generateEntityId(),
        targetEntityId: generateEntityId(),
        type: "located_in",
        status: "active",
        visibility: { kind: "party" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(relationSchema.safeParse(rel).success).toBe(true);
    });

    it("validates custom relation type starting with custom:", () => {
      const rel = {
        relationId: generateRelationId(),
        campaignId,
        sourceEntityId: generateEntityId(),
        targetEntityId: generateEntityId(),
        type: "custom:rival_of",
        status: "active",
        visibility: { kind: "party" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(relationSchema.safeParse(rel).success).toBe(true);
    });

    it("fails validation for invalid custom relation type", () => {
      const rel = {
        relationId: generateRelationId(),
        campaignId,
        sourceEntityId: generateEntityId(),
        targetEntityId: generateEntityId(),
        type: "rival_of", // doesn't match built-in, doesn't start with custom:
        status: "active",
        visibility: { kind: "party" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(relationSchema.safeParse(rel).success).toBe(false);
    });

    it("validates generic 'relacionado_con' relation type", () => {
      const rel = {
        relationId: generateRelationId(),
        campaignId,
        sourceEntityId: generateEntityId(),
        targetEntityId: generateEntityId(),
        type: "relacionado_con",
        status: "active",
        visibility: { kind: "party" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(relationSchema.safeParse(rel).success).toBe(true);
    });
  });

  describe("Fact", () => {
    it("validates manual fact", () => {
      const fact = {
        factId: generateFactId(),
        campaignId,
        statement: "The Redbrands are terrorizing the town.",
        kind: "rumor",
        confidence: "suspected",
        visibility: { kind: "dm_only" },
        source: {
          type: "manual",
          note: "Heard from Barthen",
        },
        relatedEntityIds: [],
        relatedRelationIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(factSchema.safeParse(fact).success).toBe(true);
    });

    it("rejects fact with invalid confidence value", () => {
      const fact = {
        factId: generateFactId(),
        campaignId,
        statement: "The Redbrands are terrorizing the town.",
        kind: "rumor",
        confidence: "certain", // invalid confidence!
        visibility: { kind: "dm_only" },
        source: {
          type: "manual",
          note: "Heard from Barthen",
        },
        relatedEntityIds: [],
        relatedRelationIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(factSchema.safeParse(fact).success).toBe(false);
    });
  });
});
