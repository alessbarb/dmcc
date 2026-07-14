import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_MOBILE_DOCK_PRIORITY,
  orderCampaignMobileDockItems,
} from "../../src/frontend/dm/navigation/campaignNavigation.js";

describe("campaign mobile navigation", () => {
  const campaignDestinations = [
    "overview",
    "session",
    "library",
    "map",
    "story",
    "people",
    "messages",
    "rules",
    "settings",
  ].map((path) => ({ path }));

  it("keeps overview, session, library, map directly accessible from the mobile campaign dock", () => {
    const orderedPaths = orderCampaignMobileDockItems(campaignDestinations).map((item) => item.path);

    expect(orderedPaths.slice(0, 4)).toEqual([
      "overview",
      "session",
      "library",
      "map",
    ]);
    expect(CAMPAIGN_MOBILE_DOCK_PRIORITY).toContain("map");
  });

  it("keeps every campaign destination reachable exactly once", () => {
    const orderedPaths = orderCampaignMobileDockItems(campaignDestinations).map((item) => item.path);

    expect(orderedPaths).toHaveLength(campaignDestinations.length);
    expect(new Set(orderedPaths).size).toBe(campaignDestinations.length);
    expect(orderedPaths).toEqual(expect.arrayContaining(campaignDestinations.map((item) => item.path)));
  });
});
