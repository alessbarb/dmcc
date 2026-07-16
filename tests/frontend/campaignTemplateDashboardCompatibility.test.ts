import { describe, expect, it } from "vitest";
import { readCampaignTemplatesFromDashboard } from "../../src/frontend/dm/hub/campaignTemplateDashboardCompatibility.js";

const canonical = [{ templateId: "canonical" }] as never[];
const legacy = [{ templateId: "legacy" }] as never[];
const fallback = [{ templateId: "fallback" }] as never[];

describe("readCampaignTemplatesFromDashboard", () => {
  it("prefers the canonical dashboard field", () => {
    expect(readCampaignTemplatesFromDashboard({ campaignTemplates: canonical, premades: legacy }, fallback)).toBe(canonical);
  });

  it("accepts legacy aliases only at the compatibility boundary", () => {
    expect(readCampaignTemplatesFromDashboard({ premadeTemplates: legacy }, fallback)).toBe(legacy);
    expect(readCampaignTemplatesFromDashboard({ premades: legacy }, fallback)).toBe(legacy);
  });

  it("uses the store fallback when the dashboard has no template list", () => {
    expect(readCampaignTemplatesFromDashboard({}, fallback)).toBe(fallback);
  });
});
