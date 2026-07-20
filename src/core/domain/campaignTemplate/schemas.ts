import { z } from "zod";

export const campaignTemplateLocaleSchema = z.enum(["en", "es", "fr", "de", "it", "pt"]);
export type CampaignTemplateLocale = z.infer<typeof campaignTemplateLocaleSchema>;

export const campaignTemplateDifficultySchema = z.enum(["starter", "medium", "advanced"]);
export type CampaignTemplateDifficulty = z.infer<typeof campaignTemplateDifficultySchema>;

export const campaignTemplateSystemSchema = z.enum(["dnd_5e", "pathfinder_2e", "shadowdark", "custom"]);
export type CampaignTemplateSystem = z.infer<typeof campaignTemplateSystemSchema>;

export const campaignTemplateVisibilitySchema = z.object({
  kind: z.string(),
}).passthrough();
export type CampaignTemplateVisibility = z.infer<typeof campaignTemplateVisibilitySchema>;

export const campaignTemplateEntityFileSchema = z.strictObject({
  entityId: z.string(),
  entityType: z.string(),
  importance: z.enum(["low", "normal", "high", "critical"]).optional(),
  visibility: campaignTemplateVisibilitySchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  imageUrl: z.string().optional(),
  // Optional in case base text is defined directly
  title: z.string().optional(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  status: z.string().optional(),
});
export type CampaignTemplateEntityFile = z.infer<typeof campaignTemplateEntityFileSchema>;

export const campaignTemplateRelationFileSchema = z.strictObject({
  relationId: z.string(),
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  relationType: z.string(),
  visibility: campaignTemplateVisibilitySchema.optional(),
  description: z.string().optional(),
});
export type CampaignTemplateRelationFile = z.infer<typeof campaignTemplateRelationFileSchema>;

export const campaignTemplateFactFileSchema = z.strictObject({
  factId: z.string(),
  kind: z.enum(["canon", "dm_secret", "rumor", "lie", "player_theory", "mistake", "retcon", "unknown"]),
  confidence: z.enum(["unconfirmed", "suspected", "likely", "confirmed", "false"]),
  visibility: campaignTemplateVisibilitySchema.optional(),
  relatedEntityIds: z.array(z.string()).optional(),
  relatedRelationIds: z.array(z.string()).optional(),
  source: z.record(z.string(), z.unknown()).optional(),
  statement: z.string().optional(),
});
export type CampaignTemplateFactFile = z.infer<typeof campaignTemplateFactFileSchema>;

export const campaignTemplateSessionFileSchema = z.strictObject({
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
export type CampaignTemplateSessionFile = z.infer<typeof campaignTemplateSessionFileSchema>;

export const campaignTemplateCanvasFileSchema = z.strictObject({
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
export type CampaignTemplateCanvasFile = z.infer<typeof campaignTemplateCanvasFileSchema>;

export const campaignTemplateTemplateFileSchema = z.strictObject({
  $schema: z.string().optional(),
  schemaVersion: z.number().optional(),
  templateId: z.string(),
  version: z.string(),
  system: campaignTemplateSystemSchema,
  difficulty: campaignTemplateDifficultySchema,
  tags: z.array(z.string()),
  stats: z.strictObject({
    entities: z.number(),
    relations: z.number(),
    facts: z.number(),
    preparedSessions: z.number(),
  }),
  entities: z.array(campaignTemplateEntityFileSchema),
  relations: z.array(campaignTemplateRelationFileSchema),
  facts: z.array(campaignTemplateFactFileSchema),
  sessions: z.array(campaignTemplateSessionFileSchema),
  canvases: z.array(campaignTemplateCanvasFileSchema),
  highlightEntityIds: z.array(z.string()).optional().default([]),
  featuredFactIds: z.array(z.string()).optional().default([]),
  featuredRelationIds: z.array(z.string()).optional().default([]),
  defaultLocale: campaignTemplateLocaleSchema.optional(),
});
export type CampaignTemplateTemplateFile = z.infer<typeof campaignTemplateTemplateFileSchema>;

export const campaignTemplateLocaleOverlaySchema = z.strictObject({
  $schema: z.string().optional(),
  locale: campaignTemplateLocaleSchema,
  templateId: z.string(),
  templateVersion: z.string(),
  translationVersion: z.string(),
  translatedFromLocale: campaignTemplateLocaleSchema.optional(),
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
      imageUrl: z.string().optional(),
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
export type CampaignTemplateLocaleOverlay = z.infer<typeof campaignTemplateLocaleOverlaySchema>;

export const campaignTemplateManifestEntrySchema = z.strictObject({
  templateId: z.string(),
  version: z.string().optional(),
  defaultLocale: campaignTemplateLocaleSchema.optional(),
  availableLocales: z.array(campaignTemplateLocaleSchema).optional(),
  templateFile: z.string(),
  locales: z.record(campaignTemplateLocaleSchema, z.string().optional()),
  stats: z.strictObject({
    entities: z.number(),
    relations: z.number(),
    facts: z.number(),
    preparedSessions: z.number(),
  }),
});
export type CampaignTemplateManifestEntry = z.infer<typeof campaignTemplateManifestEntrySchema>;

export const campaignTemplateManifestSchema = z.strictObject({
  $schema: z.string().optional(),
  schemaVersion: z.literal(2),
  defaultLocale: campaignTemplateLocaleSchema.optional(),
  templates: z.array(campaignTemplateManifestEntrySchema),
});
export type CampaignTemplateManifest = z.infer<typeof campaignTemplateManifestSchema>;
