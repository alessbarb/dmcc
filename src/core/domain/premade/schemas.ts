import { z } from "zod";

export const premadeLocaleSchema = z.enum(["en", "es", "fr", "de", "it", "pt"]);
export type PremadeLocale = z.infer<typeof premadeLocaleSchema>;

export const premadeDifficultySchema = z.enum(["starter", "medium", "advanced"]);
export type PremadeDifficulty = z.infer<typeof premadeDifficultySchema>;

export const premadeSystemSchema = z.enum(["generic_fantasy_d20", "dnd_srd_5_2_1", "custom"]);
export type PremadeSystem = z.infer<typeof premadeSystemSchema>;

export const premadeVisibilitySchema = z.object({
  kind: z.string(),
}).passthrough();
export type PremadeVisibility = z.infer<typeof premadeVisibilitySchema>;

export const premadeEntityFileSchema = z.strictObject({
  entityId: z.string(),
  entityType: z.string(),
  importance: z.enum(["low", "normal", "high", "critical"]).optional(),
  visibility: premadeVisibilitySchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // Opcionales por si se definen textos base directamente
  title: z.string().optional(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.string().optional(),
});
export type PremadeEntityFile = z.infer<typeof premadeEntityFileSchema>;

export const premadeRelationFileSchema = z.strictObject({
  relationId: z.string(),
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  relationType: z.string(),
  visibility: premadeVisibilitySchema.optional(),
  description: z.string().optional(),
});
export type PremadeRelationFile = z.infer<typeof premadeRelationFileSchema>;

export const premadeFactFileSchema = z.strictObject({
  factId: z.string(),
  kind: z.enum(["canon", "dm_secret", "rumor", "lie", "player_theory", "mistake", "retcon", "unknown"]),
  confidence: z.enum(["unconfirmed", "suspected", "likely", "confirmed", "false"]),
  visibility: premadeVisibilitySchema.optional(),
  relatedEntityIds: z.array(z.string()).optional(),
  relatedRelationIds: z.array(z.string()).optional(),
  source: z.record(z.string(), z.unknown()).optional(),
  statement: z.string().optional(),
});
export type PremadeFactFile = z.infer<typeof premadeFactFileSchema>;

export const premadeSessionFileSchema = z.strictObject({
  sessionId: z.string(),
  title: z.string().optional(),
  scheduledAt: z.string().optional(),
  prep: z.strictObject({
    state: z.enum(["draft", "ready"]).optional(),
    summary: z.string().optional(),
    openingPrompt: z.string().optional(),
    goals: z.array(z.string()).optional(),
    sceneIds: z.array(z.string()).optional(),
    involvedEntityIds: z.array(z.string()).optional(),
    availableClueIds: z.array(z.string()).optional(),
    secretsAtRiskIds: z.array(z.string()).optional(),
    expectedConsequenceIds: z.array(z.string()).optional(),
    checklist: z.array(
      z.strictObject({
        id: z.string(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        label: z.string().optional(),
        done: z.boolean().optional(),
      })
    ).optional(),
    notes: z.string().optional(),
  }).optional(),
});
export type PremadeSessionFile = z.infer<typeof premadeSessionFileSchema>;

export const premadeCanvasFileSchema = z.strictObject({
  canvasId: z.string(),
  kind: z.enum(["world", "session", "mystery", "location", "characters", "custom"]),
  title: z.string().optional(),
  description: z.string().optional(),
  nodes: z.array(
    z.strictObject({
      id: z.string(),
      kind: z.enum(["entity", "note", "group", "image", "fact"]),
      entityId: z.string().optional(),
      factId: z.string().optional(),
      groupId: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
      title: z.string().optional(),
      text: z.string().optional(),
      color: z.enum(["yellow", "blue", "green", "pink", "purple"]).optional(),
      x: z.number(),
      y: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
      status: z.enum(["draft", "ready", "revealed", "resolved"]).optional(),
      visibility: z.enum(["dm", "public"]).optional(),
    })
  ).optional(),
  edges: z.array(
    z.strictObject({
      id: z.string(),
      sourceNodeId: z.string(),
      targetNodeId: z.string(),
      relationshipId: z.string().optional(),
      label: z.string().optional(),
      status: z.string().optional(),
      visibility: z.enum(["dm", "public"]).optional(),
      style: z.enum(["solid", "dashed", "secret", "weak", "strong"]).optional(),
    })
  ).optional(),
});
export type PremadeCanvasFile = z.infer<typeof premadeCanvasFileSchema>;

export const premadeTemplateFileSchema = z.strictObject({
  $schema: z.string().optional(),
  schemaVersion: z.number().optional(),
  templateId: z.string(),
  version: z.string(),
  system: premadeSystemSchema,
  difficulty: premadeDifficultySchema,
  tags: z.array(z.string()),
  stats: z.strictObject({
    entities: z.number(),
    relations: z.number(),
    facts: z.number(),
    preparedSessions: z.number(),
  }),
  entities: z.array(premadeEntityFileSchema),
  relations: z.array(premadeRelationFileSchema),
  facts: z.array(premadeFactFileSchema),
  sessions: z.array(premadeSessionFileSchema),
  canvases: z.array(premadeCanvasFileSchema),
  highlightEntityIds: z.array(z.string()).optional().default([]),
  featuredFactIds: z.array(z.string()).optional().default([]),
  featuredRelationIds: z.array(z.string()).optional().default([]),
  defaultLocale: premadeLocaleSchema.optional(),
});
export type PremadeTemplateFile = z.infer<typeof premadeTemplateFileSchema>;

export const premadeLocaleOverlaySchema = z.strictObject({
  $schema: z.string().optional(),
  locale: premadeLocaleSchema,
  templateId: z.string(),
  templateVersion: z.string(),
  translationVersion: z.string(),
  translatedFromLocale: premadeLocaleSchema.optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  recommendedFor: z.string().optional(),
  pitch: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
  includedMaterial: z.array(z.string()).optional(),
  quickStart: z.strictObject({
    title: z.string(),
    steps: z.array(z.string()),
  }).optional(),
  tags: z.array(z.string()).optional(),
  entities: z.record(
    z.string(),
    z.strictObject({
      title: z.string(),
      subtitle: z.string().optional(),
      summary: z.string().optional(),
      content: z.string().optional(),
      status: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  ).optional(),
  relations: z.record(
    z.string(),
    z.strictObject({
      description: z.string(),
    })
  ).optional(),
  facts: z.record(
    z.string(),
    z.strictObject({
      statement: z.string(),
    })
  ).optional(),
  sessions: z.record(
    z.string(),
    z.strictObject({
      title: z.string().optional(),
      prep: z.strictObject({
        summary: z.string().optional(),
        openingPrompt: z.string().optional(),
        goals: z.array(z.string()).optional(),
        notes: z.string().optional(),
        checklist: z.record(
          z.string(),
          z.strictObject({
            label: z.string(),
          })
        ).optional(),
      }).optional(),
    })
  ).optional(),
  canvases: z.record(
    z.string(),
    z.strictObject({
      title: z.string().optional(),
      description: z.string().optional(),
      nodes: z.record(
        z.string(),
        z.strictObject({
          title: z.string().optional(),
          text: z.string().optional(),
        })
      ).optional(),
      edges: z.record(
        z.string(),
        z.strictObject({
          label: z.string().optional(),
        })
      ).optional(),
    })
  ).optional(),
});
export type PremadeLocaleOverlay = z.infer<typeof premadeLocaleOverlaySchema>;

export const premadeManifestEntrySchema = z.strictObject({
  templateId: z.string(),
  version: z.string().optional(),
  defaultLocale: premadeLocaleSchema.optional(),
  availableLocales: z.array(premadeLocaleSchema).optional(),
  templateFile: z.string(),
  locales: z.record(premadeLocaleSchema, z.string().optional()),
  stats: z.strictObject({
    entities: z.number(),
    relations: z.number(),
    facts: z.number(),
    preparedSessions: z.number(),
  }),
});
export type PremadeManifestEntry = z.infer<typeof premadeManifestEntrySchema>;

export const premadeManifestSchema = z.strictObject({
  $schema: z.string().optional(),
  schemaVersion: z.literal(2),
  defaultLocale: premadeLocaleSchema.optional(),
  templates: z.array(premadeManifestEntrySchema),
});
export type PremadeManifest = z.infer<typeof premadeManifestSchema>;
