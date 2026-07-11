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

  it("uses one account route across the application", () => {
    const router = read("src/frontend/router.tsx");
    const campaignShell = read("src/frontend/dm/layouts/CampaignShell.tsx");
    const app = read("src/frontend/App.tsx");

    expect(router).toMatch(/path:\s*"\/account"/);
    expect(campaignShell).toContain('to: "/account"');
    expect(app).toContain('to: "/account"');
    expect(router.match(/path:\s*"\/account"/g)).toHaveLength(1);
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

  it("exposes password, recovery-code, and full sign-out security actions", () => {
    const security = read("src/frontend/account/SecurityPanel.tsx");
    const client = read("src/frontend/account/accountClient.ts");

    expect(security).toContain("changePassword");
    expect(security).toContain("regenerateRecoveryCodes");
    expect(security).toContain("revokeAllSessions");
    expect(security).toContain("account.security.codesSavedLabel");
    expect(client).toContain('"/api/auth/password/change"');
    expect(client).toContain('"/api/auth/recovery-codes/regenerate"');
    expect(client).toContain('"/api/account/sessions"');
  });
});
