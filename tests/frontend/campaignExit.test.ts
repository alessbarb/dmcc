import { describe, expect, it } from "vitest";
import { getCampaignExitDecision } from "../../src/frontend/shared/utils/campaignExit.js";

describe("campaign exit decision", () => {
  it("exits immediately when there is no active session", () => {
    expect(getCampaignExitDecision(undefined)).toBe("exit-now");
    expect(getCampaignExitDecision([{ status: "closed" }, { status: "planned" }])).toBe("exit-now");
  });

  it("requires closing confirmation when a session is active", () => {
    expect(getCampaignExitDecision([{ status: "closed" }, { status: "active" }])).toBe("confirm-close-session");
  });
});
