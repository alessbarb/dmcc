import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("player portal DTO contracts", () => {
  const source = readFileSync("src/backend/server/web/routes/playerPortalWebRoutes.ts", "utf8");

  it("does not rely on recursive negative-key sanitization", () => {
    expect(source).not.toContain("function sanitizeObject");
    expect(source).not.toContain("sanitizeObject(rawPortal)");
    expect(source).not.toContain("/^dm|secret/i");
  });

  it("maps risky portal rows through explicit allowlist DTO helpers", () => {
    expect(source).toContain("function toPortalPlayerProfile");
    expect(source).toContain("function toPortalNotification");
    expect(source).toContain("function toPortalProposal");
    expect(source).toContain("function toPortalLiveTable");
    expect(source).toContain("playerProfile: toPortalPlayerProfile(profile)");
    expect(source).toContain("notifications: campaignNotifications.map(toPortalNotification)");
    expect(source).toContain("proposals: proposals.map(toPortalProposal)");
    expect(source).toContain("liveTable: toPortalLiveTable(currentLiveTable)");
  });

  it("does not expose raw database rows in the portal payload", () => {
    expect(source).not.toContain("playerProfile: profile");
    expect(source).not.toContain("notifications: campaignNotifications,");
    expect(source).not.toContain("    proposals,\n");
    expect(source).not.toContain("liveTable: currentLiveTable");
  });
});
