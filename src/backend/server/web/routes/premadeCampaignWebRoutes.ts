import type { FastifyInstance, FastifyReply } from "fastify";
import type { Command } from "@core/application/commands.js";
import { eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import {
  getPremadeCampaignTemplate,
  listPremadeCampaignTemplates,
  type PremadeCampaignTemplate,
} from "../../premade/premadeCampaigns.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { ensureDefaultWorkspace, listAccessibleCampaigns } from "../webAccess.js";
import { getRequiredWebUser } from "../webSession.js";

type PremadeImportMode = "full" | "structure" | "sessions";
type ImportBody = {
  title?: string;
  summary?: string;
  importMode?: PremadeImportMode;
  locale?: string;
};

function normalizeImportMode(value: unknown): PremadeImportMode {
  return value === "structure" || value === "sessions" ? value : "full";
}

function uniqueCampaignTitle(baseTitle: string, usedTitles: Set<string>): string {
  const clean = baseTitle.trim();
  if (!usedTitles.has(clean.toLocaleLowerCase())) return clean;

  let index = 2;
  while (usedTitles.has(`${clean} ${index}`.toLocaleLowerCase())) index += 1;
  return `${clean} ${index}`;
}

function normalizeEntityMetadata(
  entity: PremadeCampaignTemplate["entities"][number],
  template: PremadeCampaignTemplate,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    ...(entity.metadata ?? {}),
    createdFromTemplateId: template.templateId,
    createdFromTemplateVersion: template.version,
  };

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

async function removeFailedImport(campaignId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, campaignId));
    await tx.delete(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId));
    await tx.delete(schema.characters).where(eq(schema.characters.campaignId, campaignId));
    await tx.delete(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId));
    await tx.delete(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId));
    await tx.delete(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId));
    await tx.delete(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId));
    await tx.delete(schema.commandIndex).where(eq(schema.commandIndex.campaignId, campaignId));
    await tx.delete(schema.campaignSnapshots).where(eq(schema.campaignSnapshots.campaignId, campaignId));
    await tx.delete(schema.domainEvents).where(eq(schema.domainEvents.campaignId, campaignId));
    await tx.delete(schema.campaignMemberships).where(eq(schema.campaignMemberships.campaignId, campaignId));
    await tx.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId));
  });
}

function sendImportFailure(reply: FastifyReply, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown import error";
  reply.code(500);
  return { error: `Failed to import premade campaign: ${message}` };
}

export async function registerPremadeCampaignWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get<{ Querystring: { locale?: string } }>("/api/premade-campaigns", async (request) => {
    getRequiredWebUser(request);
    return {
      schemaVersion: 2,
      templates: listPremadeCampaignTemplates(request.query.locale),
    };
  });

  server.get<{ Params: { templateId: string }; Querystring: { locale?: string } }>(
    "/api/premade-campaigns/:templateId",
    async (request, reply) => {
      getRequiredWebUser(request);
      const template = getPremadeCampaignTemplate(request.params.templateId, request.query.locale);
      if (!template) {
        reply.code(404);
        return { error: "Premade campaign template not found" };
      }
      return template;
    },
  );

  server.post<{ Params: { templateId: string }; Body: ImportBody }>(
    "/api/premade-campaigns/:templateId/import",
    async (request, reply) => {
      const user = getRequiredWebUser(request);
      const template = getPremadeCampaignTemplate(request.params.templateId, request.body?.locale);
      if (!template) {
        reply.code(404);
        return { error: "Premade campaign template not found" };
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
      };

      await db.transaction(async (tx) => {
        await tx.insert(schema.campaigns).values({
          campaignId,
          title,
          summary: baseSummary,
          workspaceId,
          ownerId: user.userId,
          status: "active",
          metadata: { ...importMetadata, system: template.system },
        });
        await tx.insert(schema.campaignMemberships).values({
          campaignId,
          userId: user.userId,
          role: "dm",
          playerId: null,
        });
      });

      const execute = (command: Command) => repo.executeCommand(campaignId, command, {
        commandId: createId("cmd"),
        actorUserId: user.userId,
      });
      const shouldImportEntities = true;
      const shouldImportRelations = importMode === "full" || importMode === "structure";
      const shouldImportFacts = importMode === "full";
      const shouldImportSessions = importMode === "full" || importMode === "sessions";
      const shouldImportCanvases = importMode === "full" || importMode === "structure";

      try {
        await execute({
          type: "CreateCampaign",
          campaignId,
          actorId: user.userId,
          title,
          summary: `${baseSummary}\n\nCreated from ${template.title} v${template.version}.`,
          system: template.system,
          metadata: importMetadata,
        } as Command);

        if (shouldImportEntities) {
          for (const entity of template.entities) {
            await execute({
              type: "CreateEntity",
              campaignId,
              actorId: user.userId,
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
          }
        }

        if (shouldImportRelations) {
          for (const relation of template.relations) {
            await execute({
              type: "CreateRelation",
              campaignId,
              actorId: user.userId,
              relationId: relation.relationId,
              sourceEntityId: relation.sourceEntityId,
              targetEntityId: relation.targetEntityId,
              relationType: relation.relationType,
              description: relation.description,
              visibility: relation.visibility ?? { kind: "dm_only" },
              allowDuplicate: true,
            } as Command);
          }
        }

        if (shouldImportFacts) {
          for (const fact of template.facts) {
            await execute({
              type: "RecordFact",
              campaignId,
              actorId: user.userId,
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
          }
        }

        if (shouldImportSessions) {
          for (const session of template.sessions) {
            await execute({
              type: "CreatePreparedSession",
              campaignId,
              actorId: user.userId,
              sessionId: session.sessionId,
              title: session.title,
              scheduledAt: session.scheduledAt,
              prep: session.prep,
            } as Command);
          }
        }

        if (shouldImportCanvases) {
          for (const canvas of template.canvases) {
            await execute({
              type: "CreateCanvas",
              campaignId,
              actorId: user.userId,
              canvasId: canvas.canvasId,
              title: canvas.title,
              kind: canvas.kind,
              description: canvas.description,
            } as Command);

            for (const node of canvas.nodes ?? []) {
              await execute({
                type: "PlaceNodeOnCanvas",
                campaignId,
                actorId: user.userId,
                canvasId: canvas.canvasId,
                node,
              } as Command);
            }

            for (const edge of canvas.edges ?? []) {
              await execute({
                type: "AddEdgeToCanvas",
                campaignId,
                actorId: user.userId,
                canvasId: canvas.canvasId,
                edge,
              } as Command);
            }
          }
        }

        await execute({
          type: "RecordImport",
          campaignId,
          actorId: user.userId,
          importId: createId("imp"),
          format: `premade:${template.templateId}@${template.version}`,
          count: (shouldImportEntities ? template.entities.length : 0)
            + (shouldImportRelations ? template.relations.length : 0)
            + (shouldImportFacts ? template.facts.length : 0)
            + (shouldImportSessions ? template.sessions.length : 0)
            + (shouldImportCanvases ? template.canvases.length : 0),
        } as Command);

        reply.code(201);
        return {
          ok: true,
          campaignId,
          title,
          templateId: template.templateId,
          templateVersion: template.version,
          importMode,
          metadata: importMetadata,
        };
      } catch (error) {
        await removeFailedImport(campaignId).catch(() => undefined);
        return sendImportFailure(reply, error);
      }
    },
  );
}
