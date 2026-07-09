import { describe, expect, it } from "vitest";
import { searchMobileOracle } from "../../../../src/frontend/dm/mobile/search/mobileOracleSearch.js";
import { selectMobileCampaignNow } from "../../../../src/frontend/dm/mobile/selectors/mobileCampaignNowSelectors.js";
import { buildNarrativePaths } from "../../../../src/frontend/dm/mobile/selectors/mobilePathSelectors.js";
import type { MobileCampaignStateLike } from "../../../../src/frontend/dm/mobile/types.js";

const state: MobileCampaignStateLike = {
  campaign: { title: "Eclipse Triple" },
  entities: [
    { entityId: "e1", campaignId: "c1", entityType: "npc", title: "Lord Varek", status: "alive", importance: "critical", visibility: { kind: "dm_only" }, metadata: {}, tagIds: [], archived: false, createdAt: "", updatedAt: "", summary: "Noble del culto", lastSeenSessionId: "s1" },
    { entityId: "e2", campaignId: "c1", entityType: "clue", title: "Llave de Ceniza", status: "hidden", importance: "high", visibility: { kind: "dm_only" }, metadata: {}, tagIds: [], archived: false, createdAt: "", updatedAt: "" },
    { entityId: "e3", campaignId: "c1", entityType: "location", title: "Cripta Sellada", status: "locked", importance: "high", visibility: { kind: "public" }, metadata: {}, tagIds: [], archived: false, createdAt: "", updatedAt: "" },
  ],
  relations: [
    { relationId: "r1", campaignId: "c1", sourceEntityId: "e2", targetEntityId: "e3", relationType: "unlocks", status: "active", visibility: { kind: "dm_only" }, archived: false },
  ],
  facts: [
    { factId: "f1", campaignId: "c1", statement: "Lord Varek pertenece al culto", kind: "dm_secret", confidence: "confirmed", visibility: { kind: "dm_only" }, relatedEntityIds: ["e1"], source: { kind: "manual" }, archived: false },
  ],
  sessions: [{ sessionId: "s1", campaignId: "c1", title: "La cripta", status: "active", prep: { involvedEntityIds: ["e1"], availableClueIds: ["e2"] } }],
};

describe("mobile focus-first selectors", () => {
  it("finds entities and facts through the mobile oracle", () => {
    expect(searchMobileOracle(state, "Varek").map((result) => result.id)).toContain("e1");
    expect(searchMobileOracle(state, "culto").map((result) => result.id)).toContain("f1");
  });

  it("builds campaign now from the active session", () => {
    const now = selectMobileCampaignNow(state, { activeSessionId: "s1" });
    expect(now.campaignTitle).toBe("Eclipse Triple");
    expect(now.activeSession?.id).toBe("s1");
    expect(now.nearbyEntities.map((entity) => entity.id)).toContain("e1");
  });

  it("builds linear narrative paths for logical relations", () => {
    const paths = buildNarrativePaths(state, "e2");
    expect(paths[0]?.steps.map((step) => step.entity.id)).toEqual(["e2", "e3"]);
  });
});
