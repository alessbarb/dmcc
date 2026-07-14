import { z } from "zod";
import type { RuleSystem } from "./types.js";
import { playerIdSchema, entityIdSchema } from "@shared/schemas.js";

export const dnd521PlayerCharacterMetadataSchema = z.object({
  playerId: playerIdSchema.optional(),
  isPremade: z.boolean().optional(),
  className: z.string().min(1, "Clase es obligatoria"),
  subclass: z.string().optional(),
  level: z.number().int().min(1, "Nivel debe ser al menos 1"),
  species: z.string().min(1, "Especie es obligatoria"),
  background: z.string().min(1, "Trasfondo es obligatorio"),
  armorClass: z.number().int().min(0, "Clase de armadura no puede ser negativa"),
  hitPointsCurrent: z.number().int().min(0, "PG actuales no puede ser negativo"),
  hitPointsMax: z.number().int().min(1, "PG máximos debe ser al menos 1"),
  hitPointsTemp: z.number().int().nonnegative().optional().default(0),
  hitDice: z.string().min(1, "Dados de golpe es obligatorio"),
  speed: z.number().int().min(0, "Velocidad no puede ser negativa"),
  initiative: z.number().int(),
  passivePerception: z.number().int(),
  passiveInsight: z.number().int(),
  passiveInvestigation: z.number().int(),
  strength: z.number().int().min(1, "Fuerza es obligatoria").max(30),
  dexterity: z.number().int().min(1, "Destreza es obligatoria").max(30),
  constitution: z.number().int().min(1, "Constitución es obligatoria").max(30),
  intelligence: z.number().int().min(1, "Inteligencia es obligatoria").max(30),
  wisdom: z.number().int().min(1, "Sabiduría es obligatoria").max(30),
  charisma: z.number().int().min(1, "Carisma es obligatorio").max(30),
  savingThrows: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  feats: z.array(z.string()).optional().default([]),
  xp: z.number().int().nonnegative().optional().default(0),
  spellSaveDC: z.number().int().optional(),
  spellAttackBonus: z.number().int().optional(),
  keyTraits: z.array(z.string()).optional().default([]),
  importantItems: z.array(entityIdSchema).optional().default([]),
  personalGoals: z.array(z.string()).optional().default([]),
  note: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.isPremade && !data.playerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["playerId"],
      message: "playerId is required unless isPremade is true",
    });
  }
  if (data.level >= 3 && (!data.subclass || data.subclass.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["subclass"],
      message: "La subclase es obligatoria para personajes de nivel 3 o superior",
    });
  }
});

export const dnd521Rules: RuleSystem = {
  systemCode: "dnd_5e",
  systemName: "Dungeons & Dragons SRD 5.2.1",
  characterMetadataSchema: dnd521PlayerCharacterMetadataSchema,
  getInitialCharacterMetadata() {
    return {
      playerId: "",
      className: "",
      subclass: "",
      level: 1,
      species: "",
      background: "",
      armorClass: 10,
      hitPointsCurrent: 10,
      hitPointsMax: 10,
      hitPointsTemp: 0,
      hitDice: "1d8",
      speed: 30,
      initiative: 0,
      passivePerception: 10,
      passiveInsight: 10,
      passiveInvestigation: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      savingThrows: [],
      skills: [],
      languages: ["Común"],
      feats: [],
      xp: 0
    };
  }
};
