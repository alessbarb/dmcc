import { describe, expect, it } from "vitest";
import {
  campaignTemplateEntityFileSchema,
  campaignTemplateLocaleOverlaySchema,
} from "../../src/core/domain/campaignTemplate/schemas.js";
import { resolveCampaignTemplateCampaign } from "../../src/core/domain/campaignTemplate/resolveCampaignTemplate.js";
import { normalizeEntityMetadata } from "../../src/backend/server/web/routes/campaignTemplateWebRoutes.js";

describe("Campaign template entity imageUrl support", () => {
  it("validates campaignTemplateEntityFileSchema with imageUrl", () => {
    const validEntity = {
      entityId: "ent_phandalin_gundren",
      entityType: "npc",
      imageUrl: "assets/premades/phandalin/gundren.png",
    };
    const parsed = campaignTemplateEntityFileSchema.parse(validEntity);
    expect(parsed.imageUrl).toBe("assets/premades/phandalin/gundren.png");
  });

  it("validates campaignTemplateLocaleOverlaySchema with imageUrl", () => {
    const validOverlay = {
      locale: "es",
      templateId: "phandalin",
      templateVersion: "1.0.0",
      translationVersion: "1.0.0",
      title: "La mina perdida de Phandelver",
      entities: {
        ent_phandalin_gundren: {
          title: "Gundren Buscabuscador",
          imageUrl: "assets/premades/phandalin/gundren_es.png",
        },
      },
    };
    const parsed = campaignTemplateLocaleOverlaySchema.parse(validOverlay);
    expect(parsed.entities?.ent_phandalin_gundren?.imageUrl).toBe("assets/premades/phandalin/gundren_es.png");
  });

  it("resolves campaign template entities and propagates/merges imageUrl", () => {
    const template = {
      templateId: "test-campaign",
      version: "1.0.0",
      system: "custom" as const,
      entities: [
        {
          entityId: "ent_1",
          entityType: "npc",
          imageUrl: "assets/premades/default.png",
        },
      ],
      relations: [],
      facts: [],
      sessions: [],
      canvases: [],
    };

    const overlay = {
      locale: "en",
      templateId: "test-campaign",
      templateVersion: "1.0.0",
      translationVersion: "1.0.0",
      title: "Test",
      entities: {
        ent_1: {
          title: "Translated Name",
          imageUrl: "assets/premades/overlay.png",
        },
      },
    };

    const resolved = resolveCampaignTemplateCampaign(
      template as any,
      overlay as any,
      "en",
      "en",
      ["en"]
    );
    expect(resolved.entities[0].imageUrl).toBe("assets/premades/overlay.png");
  });

  it("normalizeEntityMetadata normalizes relative, absolute, and external imageUrls", () => {
    const template: any = {
      templateId: "premade-test",
      version: "1.0.0",
      system: "custom",
      entities: [],
      relations: [],
      facts: [],
      sessions: [],
      canvases: [],
    };

    // Case 1: Relative path directly on entity
    const entityRelative = {
      entityId: "ent_1",
      entityType: "npc",
      title: "Gundren",
      imageUrl: "assets/premades/phandalin/gundren.png",
    };
    const metaRelative = normalizeEntityMetadata(entityRelative, template);
    expect(metaRelative.imageUrl).toBe("/assets/premades/phandalin/gundren.png");

    // Case 2: Absolute path directly on entity
    const entityAbsolute = {
      entityId: "ent_2",
      entityType: "npc",
      title: "Sildar",
      imageUrl: "/assets/premades/phandalin/sildar.png",
    };
    const metaAbsolute = normalizeEntityMetadata(entityAbsolute, template);
    expect(metaAbsolute.imageUrl).toBe("/assets/premades/phandalin/sildar.png");

    // Case 3: External URL directly on entity
    const entityExternal = {
      entityId: "ent_3",
      entityType: "npc",
      title: "Nezznar",
      imageUrl: "https://example.com/nezznar.png",
    };
    const metaExternal = normalizeEntityMetadata(entityExternal, template);
    expect(metaExternal.imageUrl).toBe("https://example.com/nezznar.png");

    // Case 4: Declared inside metadata
    const entityInMetadata = {
      entityId: "ent_4",
      entityType: "npc",
      title: "Halia",
      metadata: {
        imageUrl: "assets/premades/phandalin/halia.png",
      },
    };
    const metaInMetadata = normalizeEntityMetadata(entityInMetadata, template);
    expect(metaInMetadata.imageUrl).toBe("/assets/premades/phandalin/halia.png");
  });
});
