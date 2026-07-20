import { describe, it, expect } from "vitest";
import {
  listCampaignTemplates,
  getCampaignTemplateById,
} from "../../src/backend/server/campaignTemplate/campaignTemplates.js";
import { createCampaignState } from "../../src/core/domain/state.js";
import { handleCommand } from "../../src/core/application/commandBus.js";
import type { Command } from "../../src/core/application/commands.js";
import { normalizeEntityMetadata } from "../../src/backend/server/web/routes/campaignTemplateWebRoutes.js";
import { entityTypeSchema } from "../../src/core/domain/entity/types.js";
import { relationTypeSchema, type RelationType } from "../../src/core/domain/relation/types.js";
import { factKindSchema, factConfidenceSchema } from "../../src/core/domain/fact/types.js";
import { visibilityRuleSchema } from "../../src/shared/schemas.js";

function parseRelationType(value: string): RelationType {
  relationTypeSchema.parse(value);
  return value as RelationType;
}

describe("Generic Campaign Template Import Validation (All Templates)", () => {
  const summaryList = listCampaignTemplates("en");

  for (const summary of summaryList) {
    const templateId = summary.templateId;
    const locales = summary.availableLocales ?? ["en", "es"];

    for (const locale of locales) {
      it(`simulates full import for template '${templateId}' (locale '${locale}')`, () => {
        const template = getCampaignTemplateById(templateId, locale);
        expect(template).toBeDefined();
        if (!template) return;

        let state = createCampaignState(`cmp_${templateId}_test`);
        const campaignId = `cmp_${templateId}_test`;
        const userId = "usr_test";

        const execute = (command: Command) => {
          const result = handleCommand(state, command);
          state = result.state;
        };

        // 1. Create Campaign
        execute({
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
          execute({
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
        }

        // 3. Relations
        for (const relation of template.relations) {
          execute({
            type: "CreateRelation",
            campaignId,
            actorId: userId,
            relationId: relation.relationId,
            sourceEntityId: relation.sourceEntityId,
            targetEntityId: relation.targetEntityId,
            relationType: parseRelationType(relation.relationType),
            description: relation.description,
            visibility: visibilityRuleSchema.parse(relation.visibility ?? { kind: "dm_only" }),
            allowDuplicate: true,
          } as Command);
        }

        // 4. Facts
        for (const fact of template.facts) {
          execute({
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
        }

        // 5. Sessions
        for (const session of template.sessions) {
          execute({
            type: "CreatePreparedSession",
            campaignId,
            actorId: userId,
            sessionId: session.sessionId,
            title: session.title,
            scheduledAt: session.scheduledAt,
            prep: session.prep,
          } as Command);
        }

        // 6. Canvases
        for (const canvas of template.canvases) {
          execute({
            type: "CreateCanvas",
            campaignId,
            actorId: userId,
            canvasId: canvas.canvasId,
            title: canvas.title,
            kind: canvas.kind,
            description: canvas.description,
          } as Command);

          for (const node of canvas.nodes ?? []) {
            execute({
              type: "PlaceNodeOnCanvas",
              campaignId,
              actorId: userId,
              canvasId: canvas.canvasId,
              node,
            } as Command);
          }

          for (const edge of canvas.edges ?? []) {
            execute({
              type: "AddEdgeToCanvas",
              campaignId,
              actorId: userId,
              canvasId: canvas.canvasId,
              edge,
            } as Command);
          }
        }

        expect(state.entities.size).toBe(template.entities.length);
      });
    }
  }
});
