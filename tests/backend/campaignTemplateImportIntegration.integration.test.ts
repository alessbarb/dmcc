import { describe, it, expect } from "vitest";
import {
  listCampaignTemplates,
  getCampaignTemplateById,
} from "../../src/backend/server/campaignTemplate/campaignTemplates.js";
import { PostgresCampaignRepository } from "../../src/backend/server/web/postgresCampaignRepository.js";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";
import { createId } from "../../src/shared/ids.js";
import { entityTypeSchema } from "../../src/core/domain/entity/types.js";
import { relationTypeSchema } from "../../src/core/domain/relation/types.js";
import { factKindSchema, factConfidenceSchema } from "../../src/core/domain/fact/types.js";
import { visibilityRuleSchema } from "../../src/shared/schemas.js";
import { normalizeEntityMetadata } from "../../src/backend/server/web/routes/campaignTemplateWebRoutes.js";
import type { Command } from "../../src/core/application/commands.js";

describe("Generic Campaign Template Import Integration (All Templates)", () => {
  const summaryList = listCampaignTemplates("en");

  for (const summary of summaryList) {
    const templateId = summary.templateId;
    const locales = summary.availableLocales ?? ["en", "es"];

    for (const locale of locales) {
      it(
        `imports template '${templateId}' (locale '${locale}') into Postgres DB without errors`,
        async () => {
          const template = getCampaignTemplateById(templateId, locale);
          expect(template).toBeDefined();
          if (!template) return;

          const campaignId = createId("cmp");
          const userId = createId("usr");
          const workspaceId = createId("wsp");
          const operationId = createId("imp_cmd");

          // Seed test user and workspace in DB
          await db.insert(schema.users).values({
            userId,
            emailNormalized: `test-${userId}@example.com`,
            emailHash: "hash",
            passwordHash: "hash",
            displayName: "Test User",
          });

          await db.insert(schema.workspaces).values({
            workspaceId,
            name: "Test Workspace",
            ownerId: userId,
          });

          await db.insert(schema.campaigns).values({
            campaignId,
            title: template.title,
            summary: template.summary,
            workspaceId,
            ownerId: userId,
            status: "importing",
            metadata: { createdFromTemplateId: template.templateId },
          });

          const repo = new PostgresCampaignRepository();
          let commandCounter = 0;
          const execute = (command: Command) => {
            commandCounter += 1;
            return repo.executeCommand(campaignId, command, {
              commandId: `${operationId}:template-command:${commandCounter}`,
              actorUserId: userId,
            });
          };

          // 1. Campaign
          await execute({
            type: "CreateCampaign",
            campaignId,
            actorId: userId,
            title: template.title,
            summary: `${template.summary}\n\nCreated from ${template.title} v${template.version}.`,
            system: template.system,
            metadata: { createdFromTemplateId: template.templateId },
          } as Command);

          // 2. Entities
          for (const entity of template.entities) {
            try {
              await execute({
                type: "CreateEntity",
                campaignId,
                actorId: userId,
                entityId: entity.entityId,
                entityType: entityTypeSchema.parse(entity.entityType),
                title: entity.title,
                subtitle: entity.subtitle,
                summary: entity.summary,
                content: entity.content,
                status: entity.status,
                importance: entity.importance,
                visibility: visibilityRuleSchema.parse(entity.visibility ?? { kind: "dm_only" }),
                metadata: normalizeEntityMetadata(entity, template),
              } as Command);
            } catch (err) {
              console.error(`Postgres Import Failed at Entity ${entity.entityId} (${entity.title}):`, err);
              throw err;
            }
          }

          // 3. Relations
          for (const relation of template.relations) {
            try {
              await execute({
                type: "CreateRelation",
                campaignId,
                actorId: userId,
                relationId: relation.relationId,
                sourceEntityId: relation.sourceEntityId,
                targetEntityId: relation.targetEntityId,
                relationType: relationTypeSchema.parse(relation.relationType) as any,
                description: relation.description,
                visibility: visibilityRuleSchema.parse(relation.visibility ?? { kind: "dm_only" }),
                allowDuplicate: true,
              } as Command);
            } catch (err) {
              console.error(`Postgres Import Failed at Relation ${relation.relationId}:`, err);
              throw err;
            }
          }

          // 4. Facts
          for (const fact of template.facts) {
            try {
              await execute({
                type: "RecordFact",
                campaignId,
                actorId: userId,
                factId: fact.factId,
                statement: fact.statement,
                kind: factKindSchema.parse(fact.kind),
                confidence: factConfidenceSchema.parse(fact.confidence),
                visibility: visibilityRuleSchema.parse(fact.visibility ?? { kind: "dm_only" }),
                relatedEntityIds: fact.relatedEntityIds ?? [],
                relatedRelationIds: [],
                source: {
                  kind: "import",
                  importId: `premade:${template.templateId}`,
                  sourcePath: `premade/${template.templateId}@${template.version}`,
                },
              } as Command);
            } catch (err) {
              console.error(`Postgres Import Failed at Fact ${fact.factId}:`, err);
              throw err;
            }
          }

          // 5. Sessions
          for (const session of template.sessions) {
            try {
              await execute({
                type: "CreatePreparedSession",
                campaignId,
                actorId: userId,
                sessionId: session.sessionId,
                title: session.title,
                scheduledAt: session.scheduledAt,
                prep: session.prep,
              } as Command);
            } catch (err) {
              console.error(`Postgres Import Failed at Session ${session.sessionId}:`, err);
              throw err;
            }
          }

          // 6. Canvases
          for (const canvas of template.canvases) {
            try {
              await execute({
                type: "CreateCanvas",
                campaignId,
                actorId: userId,
                canvasId: canvas.canvasId,
                title: canvas.title,
                kind: canvas.kind,
                description: canvas.description,
              } as Command);

              for (const node of canvas.nodes ?? []) {
                await execute({
                  type: "PlaceNodeOnCanvas",
                  campaignId,
                  actorId: userId,
                  canvasId: canvas.canvasId,
                  node,
                } as Command);
              }

              for (const edge of canvas.edges ?? []) {
                await execute({
                  type: "AddEdgeToCanvas",
                  campaignId,
                  actorId: userId,
                  canvasId: canvas.canvasId,
                  edge,
                } as Command);
              }
            } catch (err) {
              console.error(`Postgres Import Failed at Canvas ${canvas.canvasId}:`, err);
              throw err;
            }
          }

          // Verify events were written to DB
          const events = await repo.loadEvents(campaignId);
          expect(events.length).toBeGreaterThan(0);
        },
        60000
      );
    }
  }
});
