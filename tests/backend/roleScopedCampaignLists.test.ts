import { describe, expect, it } from "vitest";
import {
  scopeDmCampaigns,
  scopePlayerCampaigns,
} from "../../src/backend/server/web/routes/roleScopedCampaignListWebRoutes.js";

const campaigns = [
  { campaignId: "cmp_dm", role: "dm", playerId: null },
  { campaignId: "cmp_co_dm", role: "co_dm", playerId: null },
  { campaignId: "cmp_player", role: "player", playerId: "ply_1" },
  { campaignId: "cmp_player_without_profile", role: "player", playerId: null },
  { campaignId: "cmp_unknown", role: "unknown", playerId: null },
];

describe("role-scoped campaign lists", () => {
  it("shows only actual DM memberships in the DM list", () => {
    expect(scopeDmCampaigns(campaigns).map((campaign) => campaign.campaignId)).toEqual([
      "cmp_dm",
      "cmp_co_dm",
    ]);
  });

  it("shows only actual player memberships with a real player profile", () => {
    expect(scopePlayerCampaigns(campaigns).map((campaign) => campaign.campaignId)).toEqual([
      "cmp_player",
    ]);
  });

  it("never infers the opposite role", () => {
    expect(scopeDmCampaigns([{ campaignId: "cmp_player", role: "player", playerId: "ply_1" }])).toEqual([]);
    expect(scopePlayerCampaigns([{ campaignId: "cmp_dm", role: "dm", playerId: null }])).toEqual([]);
  });
});
