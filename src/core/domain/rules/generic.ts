import { z } from "zod";
import type { RuleSystem } from "./types.js";
import { playerIdSchema, entityIdSchema } from "@shared/schemas.js";

export const genericPlayerCharacterMetadataSchema = z.object({
  playerId: playerIdSchema.optional(),
  isPremade: z.boolean().optional(),
  className: z.string().optional(),
  subclass: z.string().optional(),
  level: z.number().int().min(1).optional(),
  species: z.string().optional(),
  background: z.string().optional(),
  armorClass: z.number().int().optional(),
  hitPointsCurrent: z.number().int().optional(),
  hitPointsMax: z.number().int().optional(),
  hitPointsTemp: z.number().int().optional(),
  hitDice: z.string().optional(),
  speed: z.number().int().optional(),
  initiative: z.number().int().optional(),
  passivePerception: z.number().int().optional(),
  passiveInsight: z.number().int().optional(),
  passiveInvestigation: z.number().int().optional(),
  strength: z.number().int().min(1).max(30).optional(),
  dexterity: z.number().int().min(1).max(30).optional(),
  constitution: z.number().int().min(1).max(30).optional(),
  intelligence: z.number().int().min(1).max(30).optional(),
  wisdom: z.number().int().min(1).max(30).optional(),
  charisma: z.number().int().min(1).max(30).optional(),
  savingThrows: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  feats: z.array(z.string()).optional(),
  xp: z.number().int().nonnegative().optional(),
  spellSaveDC: z.number().int().optional(),
  spellAttackBonus: z.number().int().optional(),
  keyTraits: z.array(z.string()).optional(),
  importantItems: z.array(entityIdSchema).optional(),
  personalGoals: z.array(z.string()).optional(),
  note: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.isPremade && !data.playerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["playerId"],
      message: "playerId is required unless isPremade is true",
    });
  }
});

export const genericRules: RuleSystem = {
  systemCode: "generic_fantasy_d20",
  systemName: "Genérico d20",
  characterMetadataSchema: genericPlayerCharacterMetadataSchema,
  getInitialCharacterMetadata() {
    return { playerId: "", species: "", className: "", level: 1 };
  }
};
