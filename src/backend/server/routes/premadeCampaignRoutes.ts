import type { FastifyInstance } from "fastify";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { createId, generateCampaignId } from "@shared/ids.js";
import { assertDM, getRequestDmId, getValidatedVaultId } from "../auth.js";
import { ensureCampaignOwner, listCampaignIdsForDmSync, removeCampaignAcl } from "../campaignAclStore.js";
import { getPremadeCampaignTemplate, listPremadeCampaignTemplates } from "../premade/premadeCampaigns.js";

type PremadeImportMode = "full" | "structure" | "sessions";

export async function registerPremadeCampaignRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  const getRepository = makeRepositoryFactory(dataDir);

  function normalizeEntityMetadata(entity: { entityType: string; summary?: string; content?: string; metadata?: Record<string, unknown> }, templateId: string, templateVersion: string): Record<string, unknown> {
    const metadata: Record<string, unknown> = {
      ...(entity.metadata ?? {}),
      createdFromTemplateId: templateId,
      createdFromTemplateVersion: templateVersion,
    };

    if (entity.entityType === "clue" && typeof metadata.content !== "string") {
      metadata.content = entity.content || entity.summary || "Pista preparada por la campaña de ejemplo.";
    }

    if (entity.entityType === "secret" && typeof metadata.truth !== "string") {
      metadata.truth = entity.content || entity.summary || "Secreto preparado por la campaña de ejemplo.";
    }

    if (entity.entityType === "clock") {
      if (typeof metadata.maxSegments !== "number") {
        metadata.maxSegments = typeof metadata.segments === "number" ? metadata.segments : 6;
      }
      if (typeof metadata.currentSegments !== "number") {
        metadata.currentSegments = typeof metadata.filled === "number" ? metadata.filled : 0;
      }
      if (typeof metadata.meaning !== "string") {
        metadata.meaning = entity.summary || "Reloj narrativo de la campaña de ejemplo.";
      }
    }

    return metadata;
  }

  async function getExistingCampaignTitles(vaultId: string, dmId: string): Promise<Set<string>> {
    const titles = new Set<string>();
    const repo = getRepository(vaultId);
    const allowedIds = listCampaignIdsForDmSync(dataDir, vaultId, dmId) ?? new Set<string>();

    for (const campaignId of allowedIds) {
      try {
        const state = await repo.getCampaignState(campaignId);
        const title = String(state.campaign?.title ?? "").trim().toLowerCase();
        if (title) titles.add(title);
      } catch {}
    }

    return titles;
  }

  function uniqueCampaignTitle(baseTitle: string, usedTitles: Set<string>): string {
    const clean = baseTitle.trim();
    if (!usedTitles.has(clean.toLowerCase())) return clean;
    let index = 2;
    while (usedTitles.has(`${clean} ${index}`.toLowerCase())) {
      index += 1;
    }
    return `${clean} ${index}`;
  }

  server.get<{ Querystring: { locale?: string } }>("/api/premade-campaigns", async (request) => {
    assertDM(request, server.dmSessionToken);
    return {
      schemaVersion: 2,
      templates: listPremadeCampaignTemplates(request.query.locale),
    };
  });

  server.get<{ Params: { templateId: string }; Querystring: { locale?: string } }>("/api/premade-campaigns/:templateId", async (request, reply) => {
    assertDM(request, server.dmSessionToken);
    const template = getPremadeCampaignTemplate(request.params.templateId, request.query.locale);
    if (!template) {
      reply.code(404);
      return { error: "Premade campaign template not found" };
    }

    return template;
  });

  server.post<{ Params: { templateId: string }; Body: { title?: string; summary?: string; campaignId?: string; importMode?: PremadeImportMode; locale?: string } }>(
    "/api/premade-campaigns/:templateId/import",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const dmId = getRequestDmId(request, server.dmSessionToken) ?? "usr_dm";
      const template = getPremadeCampaignTemplate(request.params.templateId, request.body?.locale);

      if (!template) {
        reply.code(404);
        return { error: "Premade campaign template not found" };
      }

      const importMode: PremadeImportMode = ["full", "structure", "sessions"].includes(request.body?.importMode ?? "")
        ? request.body!.importMode as PremadeImportMode
        : "full";
      const requestedCampaignId = request.body?.campaignId?.trim();
      const campaignId = requestedCampaignId && /^[a-zA-Z0-9_-]+$/.test(requestedCampaignId)
        ? requestedCampaignId
        : generateCampaignId();
      const usedTitles = await getExistingCampaignTitles(vaultId, dmId);
      const requestedTitle = request.body?.title?.trim();
      const title = uniqueCampaignTitle(requestedTitle || template.title, usedTitles);
      const actorId = dmId;
      const repo = getRepository(vaultId);
      const campaignDir = join(dataDir, "vaults", vaultId, "campaigns", campaignId);
      const baseSummary = request.body?.summary?.trim() || template.summary;
      const importMetadata = {
        createdFromTemplateId: template.templateId,
        createdFromTemplateVersion: template.version,
        createdFromTemplateTitle: template.title,
        createdFromTemplateAt: new Date().toISOString(),
        importedByDmId: dmId,
        importMode,
        templateLocale: template.locale,
        templateSystem: template.system,
        templateDifficulty: template.difficulty,
        templateTags: template.tags,
      };

      const shouldImportEntities = importMode === "full" || importMode === "structure" || importMode === "sessions";
      const shouldImportRelations = importMode === "full" || importMode === "structure";
      const shouldImportFacts = importMode === "full";
      const shouldImportSessions = importMode === "full" || importMode === "sessions";
      const shouldImportCanvases = importMode === "full" || importMode === "structure";

      try {
        await repo.executeCommand(campaignId, {
          type: "CreateCampaign",
          campaignId,
          actorId,
          title,
          summary: `${baseSummary}\n\nCreada desde la campaña de ejemplo ${template.title} v${template.version}.`,
          system: template.system,
          settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
          metadata: importMetadata,
        });

        if (shouldImportEntities) {
          for (const entity of template.entities) {
            await repo.executeCommand(campaignId, {
              type: "CreateEntity",
              campaignId,
              actorId,
              entityId: entity.entityId,
              entityType: entity.entityType,
              title: entity.title,
              subtitle: entity.subtitle,
              summary: entity.summary,
              content: entity.content,
              status: entity.status,
              importance: entity.importance,
              visibility: (entity.visibility ?? { kind: "dm_only" }) as any,
              metadata: normalizeEntityMetadata(entity, template.templateId, template.version),
            });
          }
        }

        if (shouldImportRelations) {
          for (const relation of template.relations) {
            await repo.executeCommand(campaignId, {
              type: "CreateRelation",
              campaignId,
              actorId,
              relationId: relation.relationId,
              sourceEntityId: relation.sourceEntityId,
              targetEntityId: relation.targetEntityId,
              relationType: relation.relationType as any,
              description: relation.description,
              visibility: (relation.visibility ?? { kind: "dm_only" }) as any,
              allowDuplicate: true,
            });
          }
        }

        if (shouldImportFacts) {
          for (const fact of template.facts) {
            await repo.executeCommand(campaignId, {
              type: "RecordFact",
              campaignId,
              actorId,
              factId: fact.factId,
              statement: fact.statement,
              kind: fact.kind,
              confidence: fact.confidence,
              visibility: (fact.visibility ?? { kind: "dm_only" }) as any,
              relatedEntityIds: fact.relatedEntityIds ?? [],
              relatedRelationIds: [],
              source: { kind: "import", importId: `premade:${template.templateId}`, sourcePath: `premade/${template.templateId}@${template.version}` },
            });
          }
        }

        if (shouldImportSessions) {
          for (const session of template.sessions) {
            await repo.executeCommand(campaignId, {
              type: "CreatePreparedSession",
              campaignId,
              actorId,
              sessionId: session.sessionId,
              title: session.title,
              scheduledAt: session.scheduledAt,
              prep: session.prep,
            });
          }
        }

        if (shouldImportCanvases) {
          for (const canvas of template.canvases) {
            await repo.executeCommand(campaignId, {
              type: "CreateCanvas",
              campaignId,
              actorId,
              canvasId: canvas.canvasId,
              title: canvas.title,
              kind: canvas.kind,
              description: canvas.description,
            });

            for (const node of canvas.nodes ?? []) {
              await repo.executeCommand(campaignId, {
                type: "PlaceNodeOnCanvas",
                campaignId,
                actorId,
                canvasId: canvas.canvasId,
                node,
              });
            }

            for (const edge of canvas.edges ?? []) {
              await repo.executeCommand(campaignId, {
                type: "AddEdgeToCanvas",
                campaignId,
                actorId,
                canvasId: canvas.canvasId,
                edge,
              });
            }
          }
        }

        await repo.executeCommand(campaignId, {
          type: "RecordImport",
          campaignId,
          actorId,
          importId: createId("imp"),
          format: `premade:${template.templateId}@${template.version}`,
          count: (shouldImportEntities ? template.entities.length : 0)
            + (shouldImportRelations ? template.relations.length : 0)
            + (shouldImportFacts ? template.facts.length : 0)
            + (shouldImportSessions ? template.sessions.length : 0)
            + (shouldImportCanvases ? template.canvases.length : 0),
        });

        await ensureCampaignOwner(dataDir, vaultId, campaignId, dmId);

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
      } catch (err: any) {
        await removeCampaignAcl(dataDir, vaultId, campaignId).catch(() => {});
        await rm(campaignDir, { recursive: true, force: true }).catch(() => {});
        reply.code(500);
        return { error: `Failed to import premade campaign: ${err?.message ?? "unknown error"}` };
      }
    },
  );
}
