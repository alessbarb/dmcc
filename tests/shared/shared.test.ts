import { describe, it, expect } from "vitest";
import {
  generateCampaignId,
  generatePlayerId,
  generateEntityId,
  generateRelationId,
} from "../../src/shared/ids.js";
import { campaignIdSchema, relationIdSchema } from "../../src/shared/schemas.js";

describe("IDs and Schemas", () => {
  it("generates correct prefixes for IDs", () => {
    const cmpId = generateCampaignId();
    const plyId = generatePlayerId();
    const entId = generateEntityId();
    const relId = generateRelationId();

    expect(cmpId.startsWith("cmp_")).toBe(true);
    expect(plyId.startsWith("ply_")).toBe(true);
    expect(entId.startsWith("ent_")).toBe(true);
    expect(relId.startsWith("rel_")).toBe(true);
  });

  it("validates IDs with Zod schemas", () => {
    const validCmpId = generateCampaignId();
    const validRelId = generateRelationId();

    expect(campaignIdSchema.safeParse(validCmpId).success).toBe(true);
    expect(relationIdSchema.safeParse(validRelId).success).toBe(true);

    expect(campaignIdSchema.safeParse("invalid_id").success).toBe(false);
    expect(relationIdSchema.safeParse("cmp_123").success).toBe(false); // wrong prefix
  });
});
