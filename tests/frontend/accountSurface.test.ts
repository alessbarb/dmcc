import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("shared account surface", () => {
  it("contains every account module in one semantic route", () => {
    const page = read("src/frontend/account/AccountPage.tsx");
    for (const id of [
      "account",
      "dm-profile",
      "player-profiles",
      "privacy",
      "appearance",
      "notifications",
      "security",
      "data",
    ]) {
      expect(page).toContain(`"${id}"`);
    }
    expect(page).toContain("<main");
    expect(read("src/frontend/account/AccountNav.tsx")).toContain("<nav");
  });

  it("uses one account route and the shared in-campaign modal", () => {
    const router = read("src/frontend/router.tsx");
    const campaignShell = read("src/frontend/dm/layouts/CampaignShell.tsx");

    expect(router).toMatch(/path:\s*"\/account"/);
    expect(router.match(/path:\s*"\/account"/g)).toHaveLength(1);
    expect(campaignShell).toContain("<AccountModal");
    expect(campaignShell).not.toContain("AccountPage");
  });

  it("edits the private identity and loads privacy previews from the account API", () => {
    const page = read("src/frontend/account/AccountPage.tsx");
    const client = read("src/frontend/account/accountClient.ts");

    expect(page).toContain("<IdentityEditor");
    expect(page).toContain("fetchPrivacyPreview");
    expect(page).not.toContain("previews={{ owner: {}, dm: {}, table: {}, global: {} }}");
    expect(client).toContain("export async function fetchPrivacyPreview");
    expect(client).toContain("/api/account/privacy/preview?");
  });

  it("exposes only security actions backed by registered account routes", () => {
    const security = read("src/frontend/account/SecurityPanel.tsx");
    const client = read("src/frontend/account/accountClient.ts");

    expect(security).toContain("revokeAllSessions");
    expect(security).toContain("revokeOtherSessions");
    expect(security).toContain("/auth/login");
    expect(security).not.toContain("changePassword");
    expect(security).not.toContain("regenerateRecoveryCodes");
    expect(client).not.toContain('"/api/auth/password/change"');
    expect(client).not.toContain('"/api/auth/recovery-codes/regenerate"');
    expect(client).toContain('"/api/account/sessions"');
  });
});
