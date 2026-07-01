import { describe, expect, it } from "vitest";
import { rewriteCampaignEventPayload } from "../../src/core/persistence/repositories/campaignRepository.js";

describe("campaign event duplication", () => {
  it("rewrites nested campaign references without retaining the source id", () => {
    const rewritten = rewriteCampaignEventPayload(
      "CanvasNodePlaced",
      {
        campaignId: "cmp_source",
        node: {
          id: "node_one",
          campaignId: "cmp_source",
          metadata: { ownerCampaignId: "cmp_source" },
          embedded: { entity: { campaignId: "cmp_source" } },
        },
      },
      "cmp_source",
      "cmp_copy"
    );
    expect(JSON.stringify(rewritten)).not.toContain("cmp_source");
    expect(rewritten).toMatchObject({
      campaignId: "cmp_copy",
      node: {
        campaignId: "cmp_copy",
        metadata: { ownerCampaignId: "cmp_copy" },
      },
    });
  });
});
