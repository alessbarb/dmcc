import type { FastifyInstance } from "fastify";
import type { Command } from "@core/application/commands.js";
import { eq, and, sql } from "drizzle-orm";
import type { ImportStage, CampaignTemplateImportEvent } from "@shared/templateImportTypes.js";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import {
  getCampaignTemplateById,
  listCampaignTemplates,
  type CampaignTemplateResolved,
} from "../../campaignTemplate/campaignTemplates.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { ensureDefaultWorkspace, listAccessibleCampaigns } from "../webAccess.js";
import { getRequiredWebUser } from "../webSession.js";
import { requireIdempotencyKey } from "../idempotencyKey.js";

type CampaignTemplateImportMode = "full" | "structure" | "sessions";
type ImportBody = {
  title?: string;
  summary?: string;
  importMode?: CampaignTemplateImportMode;
  locale?: string;
};

function normalizeImportMode(value: unknown): CampaignTemplateImportMode {
  return value === "structure" || value === "sessions" ? value : "full";
}

function uniqueCampaignTitle(baseTitle: string, usedTitles: Set<string>): string {
  const clean = baseTitle.trim();
  if (!usedTitles.has(clean.toLocaleLowerCase())) return clean;

  let index = 2;
  while (usedTitles.has(`${clean} ${index}`.toLocaleLowerCase())) index += 1;
  return `${clean} ${index}`;
}

export function normalizeEntityMetadata(
  entity: CampaignTemplateResolved["entities"][number],
  template: CampaignTemplateResolved,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    ...(entity.metadata ?? {}),
    createdFromTemplateId: template.templateId,
    createdFromTemplateVersion: template.version,
  };

  const imageUrlRaw = entity.imageUrl || (entity.metadata?.imageUrl as string | undefined);
  if (imageUrlRaw) {
    let finalUrl = imageUrlRaw.trim();
    if (!finalUrl.startsWith("/") && !finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "/" + finalUrl;
    }
    metadata.imageUrl = finalUrl;
  }

  if (entity.entityType === "player_character" && !metadata.playerId) {
    metadata.isPremade = true;
  }
  if (entity.entityType === "clue" && typeof metadata.content !== "string") {
    metadata.content = entity.content || entity.summary || "Prepared clue";
  }
  if (entity.entityType === "secret" && typeof metadata.truth !== "string") {
    metadata.truth = entity.content || entity.summary || "Prepared secret";
  }
  if (entity.entityType === "clock") {
    if (typeof metadata.maxSegments !== "number") {
      metadata.maxSegments = typeof metadata.segments === "number" ? metadata.segments : 6;
    }
    if (typeof metadata.currentSegments !== "number") {
      metadata.currentSegments = typeof metadata.filled === "number" ? metadata.filled : 0;
    }
    if (typeof metadata.meaning !== "string") {
      metadata.meaning = entity.summary || "Narrative clock";
    }
  }

  return metadata;
}



interface CampaignTemplateImportStep {
  stage: ImportStage;
  label: string;
  run: () => Promise<void>;
}

function buildCampaignTemplateImportSteps(options: {
  template: CampaignTemplateResolved;
  importMode: CampaignTemplateImportMode;
  campaignId: string;
  userId: string;
  title: string;
  baseSummary: string;
  importMetadata: any;
  execute: (command: Command) => Promise<any>;
}): CampaignTemplateImportStep[] {
  const { template, importMode, campaignId, userId, title, baseSummary, importMetadata, execute } = options;
  const steps: CampaignTemplateImportStep[] = [];

  const shouldImportEntities = true;
  const shouldImportRelations = importMode === "full" || importMode === "structure";
  const shouldImportFacts = importMode === "full";
  const shouldImportSessions = importMode === "full" || importMode === "sessions";
  const shouldImportCanvases = importMode === "full" || importMode === "structure";

  // 1. Create Campaign
  steps.push({
    stage: "campaign",
    label: "campaign",
    run: async () => {
      await execute({
        type: "CreateCampaign",
        campaignId,
        actorId: userId,
        title,
        summary: `${baseSummary}\n\nCreated from ${template.title} v${template.version}.`,
        system: template.system,
        metadata: importMetadata,
      } as Command);
    },
  });

  // 2. Entities
  if (shouldImportEntities) {
    for (const entity of template.entities) {
      steps.push({
        stage: "entities",
        label: `entity ${entity.entityId} (${entity.entityType})`,
        run: async () => {
          await execute({
            type: "CreateEntity",
            campaignId,
            actorId: userId,
            entityId: entity.entityId,
            entityType: entity.entityType,
            title: entity.title,
            subtitle: entity.subtitle,
            summary: entity.summary,
            content: entity.content,
            status: entity.status,
            importance: entity.importance,
            visibility: entity.visibility ?? { kind: "dm_only" },
            metadata: normalizeEntityMetadata(entity, template),
          } as Command);
        },
      });
    }
  }

  // 3. Relations
  if (shouldImportRelations) {
    for (const relation of template.relations) {
      steps.push({
        stage: "relations",
        label: `relation ${relation.relationId} (${relation.relationType}: ${relation.sourceEntityId} -> ${relation.targetEntityId})`,
        run: async () => {
          await execute({
            type: "CreateRelation",
            campaignId,
            actorId: userId,
            relationId: relation.relationId,
            sourceEntityId: relation.sourceEntityId,
            targetEntityId: relation.targetEntityId,
            relationType: relation.relationType,
            description: relation.description,
            visibility: relation.visibility ?? { kind: "dm_only" },
            allowDuplicate: true,
          } as Command);
        },
      });
    }
  }

  // 4. Facts
  if (shouldImportFacts) {
    for (const fact of template.facts) {
      steps.push({
        stage: "facts",
        label: `fact ${fact.factId}`,
        run: async () => {
          await execute({
            type: "RecordFact",
            campaignId,
            actorId: userId,
            factId: fact.factId,
            statement: fact.statement,
            kind: fact.kind,
            confidence: fact.confidence,
            visibility: fact.visibility ?? { kind: "dm_only" },
            relatedEntityIds: fact.relatedEntityIds ?? [],
            relatedRelationIds: [],
            source: {
              kind: "import",
              importId: `premade:${template.templateId}`,
              sourcePath: `premade/${template.templateId}@${template.version}`,
            },
          } as Command);
        },
      });
    }
  }

  // 5. Sessions
  if (shouldImportSessions) {
    for (const session of template.sessions) {
      steps.push({
        stage: "sessions",
        label: `session ${session.sessionId}`,
        run: async () => {
          await execute({
            type: "CreatePreparedSession",
            campaignId,
            actorId: userId,
            sessionId: session.sessionId,
            title: session.title,
            scheduledAt: session.scheduledAt,
            prep: session.prep,
          } as Command);
        },
      });
    }
  }

  // 6. Canvases
  if (shouldImportCanvases) {
    for (const canvas of template.canvases) {
      steps.push({
        stage: "canvases",
        label: `canvas ${canvas.canvasId}`,
        run: async () => {
          await execute({
            type: "CreateCanvas",
            campaignId,
            actorId: userId,
            canvasId: canvas.canvasId,
            title: canvas.title,
            kind: canvas.kind,
            description: canvas.description,
          } as Command);
        },
      });

      for (const node of canvas.nodes ?? []) {
        steps.push({
          stage: "canvases",
          label: `canvas ${canvas.canvasId} node ${node.id}`,
          run: async () => {
            await execute({
              type: "PlaceNodeOnCanvas",
              campaignId,
              actorId: userId,
              canvasId: canvas.canvasId,
              node,
            } as Command);
          },
        });
      }

      for (const edge of canvas.edges ?? []) {
        steps.push({
          stage: "canvases",
          label: `canvas ${canvas.canvasId} edge ${edge.id}`,
          run: async () => {
            await execute({
              type: "AddEdgeToCanvas",
              campaignId,
              actorId: userId,
              canvasId: canvas.canvasId,
              edge,
            } as Command);
          },
        });
      }
    }
  }

  // 7. Record Import
  steps.push({
    stage: "finalizing",
    label: "finalizing",
    run: async () => {
      const count = (shouldImportEntities ? template.entities.length : 0)
        + (shouldImportRelations ? template.relations.length : 0)
        + (shouldImportFacts ? template.facts.length : 0)
        + (shouldImportSessions ? template.sessions.length : 0)
        + (shouldImportCanvases ? template.canvases.length : 0);
      await execute({
        type: "RecordImport",
        campaignId,
        actorId: userId,
        importId: createId("imp"),
        format: `premade:${template.templateId}@${template.version}`,
        count,
      } as Command);
    },
  });

  return steps;
}

export async function registerCampaignTemplateWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get<{ Querystring: { locale?: string } }>("/api/campaign-templates", async (request) => {
    getRequiredWebUser(request);
    return {
      schemaVersion: 2,
      templates: listCampaignTemplates(request.query.locale),
    };
  });

  server.get<{ Params: { templateId: string }; Querystring: { locale?: string } }>(
    "/api/campaign-templates/:templateId",
    async (request, reply) => {
      getRequiredWebUser(request);
      const template = getCampaignTemplateById(request.params.templateId, request.query.locale);
      if (!template) {
        reply.code(404);
        return { error: "Campaign template not found" };
      }
      return template;
    },
  );

  server.post<{ Params: { templateId: string }; Body: ImportBody }>(
    "/api/campaign-templates/:templateId/import",
    async (request, reply) => {
      const user = getRequiredWebUser(request);
      const template = getCampaignTemplateById(request.params.templateId, request.body?.locale);
      if (!template) {
        reply.code(404);
        return { error: "Campaign template not found" };
      }

      let operationId: string;
      try {
        operationId = requireIdempotencyKey(request);
      } catch (error) {
        reply.code(400);
        return { error: error instanceof Error ? error.message : "Idempotency-Key header is required" };
      }

      // Check for existing campaign with this operationId (Idempotency check)
      const [existingCampaign] = await db
        .select()
        .from(schema.campaigns)
        .where(
          and(
            eq(schema.campaigns.ownerId, user.userId),
            sql`${schema.campaigns.metadata}->>'operationId' = ${operationId}`,
            sql`${schema.campaigns.status} <> 'trashed'`,
          )
        )
        .limit(1);

      if (existingCampaign) {
        if (existingCampaign.status === "active") {
          // If already successfully imported, return success immediately
          reply
            .code(200)
            .headers({
              "Content-Type": "application/x-ndjson; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
            })
            .hijack();

          reply.raw.write(JSON.stringify({
            type: "started",
            schemaVersion: 1,
            operationId,
            campaignId: existingCampaign.campaignId,
            totalSteps: 0,
          } as CampaignTemplateImportEvent) + "\n");

          reply.raw.write(JSON.stringify({
            type: "success",
            campaignId: existingCampaign.campaignId,
            title: existingCampaign.title,
          } as CampaignTemplateImportEvent) + "\n");

          reply.raw.end();
          return;
        } else if (existingCampaign.status === "importing") {
          // If a previous attempt was interrupted, clean up that campaign and start fresh
          try {
            await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, existingCampaign.campaignId));
          } catch (cleanupError) {
            request.log.error(
              { err: cleanupError, campaignId: existingCampaign.campaignId, operationId },
              "Failed to clean up campaign template import during retry",
            );
          }
        }
      }

      const importMode = normalizeImportMode(request.body?.importMode);
      const usedTitles = new Set(
        (await listAccessibleCampaigns(user.userId)).map((campaign) => campaign.title.trim().toLocaleLowerCase()),
      );
      const title = uniqueCampaignTitle(request.body?.title?.trim() || template.title, usedTitles);
      const campaignId = createId("cmp");
      const workspaceId = await ensureDefaultWorkspace(user);
      const baseSummary = request.body?.summary?.trim() || template.summary;
      const importedAt = new Date().toISOString();
      const importMetadata = {
        createdFromTemplateId: template.templateId,
        createdFromTemplateVersion: template.version,
        createdFromTemplateTitle: template.title,
        createdFromTemplateAt: importedAt,
        importMode,
        templateLocale: template.locale,
        templateSystem: template.system,
        templateDifficulty: template.difficulty,
        templateTags: template.tags,
        operationId,
      };

      // 1. Initial creation with 'importing' status to prevent usage
      await db.transaction(async (tx) => {
        await tx.insert(schema.campaigns).values({
          campaignId,
          title,
          summary: baseSummary,
          workspaceId,
          ownerId: user.userId,
          status: "importing",
          metadata: { ...importMetadata, system: template.system },
        });
        await tx.insert(schema.campaignMemberships).values({
          campaignId,
          userId: user.userId,
          role: "dm",
          playerId: null,
        });
      });

      let commandCounter = 0;
      const execute = (command: Command) => {
        commandCounter += 1;
        return repo.executeCommand(campaignId, command, {
          commandId: `${operationId}:template-command:${commandCounter}`,
          actorUserId: user.userId,
        });
      };

      // Build steps dynamically using our dynamic plan builder
      const steps = buildCampaignTemplateImportSteps({
        template,
        importMode,
        campaignId,
        userId: user.userId,
        title,
        baseSummary,
        importMetadata,
        execute,
      });

      // Hijack the fastify reply to start streaming NDJSON
      reply
        .code(200)
        .headers({
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        })
        .hijack();

      // Write 'started' event
      reply.raw.write(JSON.stringify({
        type: "started",
        schemaVersion: 1,
        operationId,
        campaignId,
        totalSteps: steps.length,
      } as CampaignTemplateImportEvent) + "\n");

      let aborted = false;
      request.raw.on("close", () => {
        aborted = true;
      });

      let currentStepLabel: string | null = null;
      try {
        for (const [index, step] of steps.entries()) {
          if (aborted) {
            throw new Error("Client disconnected during campaign import");
          }
          currentStepLabel = step.label;
          await step.run();

          const completedSteps = index + 1;
          const percent = Math.min(Math.round((completedSteps / steps.length) * 100), 99);

          reply.raw.write(JSON.stringify({
            type: "progress",
            completedSteps,
            totalSteps: steps.length,
            percent,
            stage: step.stage,
          } as CampaignTemplateImportEvent) + "\n");
        }

        if (aborted) {
          throw new Error("Client disconnected during campaign import completion");
        }

        // 2. Transition campaign status to 'active' now that it is fully populated
        await db.update(schema.campaigns)
          .set({ status: "active" })
          .where(eq(schema.campaigns.campaignId, campaignId));

        // Write 'success' event
        reply.raw.write(JSON.stringify({
          type: "success",
          campaignId,
          title,
        } as CampaignTemplateImportEvent) + "\n");

      } catch (error) {
        request.log.error(
          { err: error, campaignId, operationId, failedStep: currentStepLabel },
          "Error during campaign template import",
        );

        try {
          await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId));
        } catch (cleanupError) {
          request.log.error(
            { err: cleanupError, campaignId, operationId },
            "Failed to clean up campaign template import",
          );
        }

        // Write 'error' event
        reply.raw.write(JSON.stringify({
          type: "error",
          operationId,
          code: "IMPORT_FAILED",
          messageKey: "campaignTemplateImport.error.failed",
        } as CampaignTemplateImportEvent) + "\n");
      } finally {
        reply.raw.end();
      }
    },
  );
}
