import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_MOBILE_DOCK_PRIORITY,
  orderCampaignMobileDockItems,
} from "../../src/frontend/dm/navigation/campaignNavigation.js";

describe("campaign mobile navigation", () => {
  const campaignDestinations = [
    "command-center",
    "session",
    "entities",
    "canvas",
    "graph",
    "timeline",
    "search",
    "boards",
    "players",
    "messages",
    "rules",
    "knowledge",
    "settings",
  ].map((path) => ({ path }));

  it("keeps Canvas directly accessible from the mobile campaign dock", () => {
    const orderedPaths = orderCampaignMobileDockItems(campaignDestinations).map((item) => item.path);

    expect(orderedPaths.slice(0, 4)).toEqual([
      "command-center",
      "session",
      "canvas",
      "entities",
    ]);
    expect(CAMPAIGN_MOBILE_DOCK_PRIORITY).toContain("canvas");
  });

  it("keeps every campaign destination reachable exactly once", () => {
    const orderedPaths = orderCampaignMobileDockItems(campaignDestinations).map((item) => item.path);

    expect(orderedPaths).toHaveLength(campaignDestinations.length);
    expect(new Set(orderedPaths).size).toBe(campaignDestinations.length);
    expect(orderedPaths).toEqual(expect.arrayContaining(campaignDestinations.map((item) => item.path)));
  });
});
