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

  it("links every role surface to the same account route", () => {
    for (const file of [
      "src/frontend/App.tsx",
      "src/frontend/dm/layouts/CampaignShell.tsx",
      "src/frontend/player/components/PlayerPortalView.tsx",
    ]) {
      expect(read(file)).toContain('to: "/account"');
    }
  });
});
