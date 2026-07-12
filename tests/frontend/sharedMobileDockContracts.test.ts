import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dockSource = readFileSync(join(ROOT, "src/frontend/shared/components/MobileDock.tsx"), "utf8");
const playerSource = readFileSync(join(ROOT, "src/frontend/SmartLanding.tsx"), "utf8");
const playerMessagesSource = readFileSync(join(ROOT, "src/frontend/player/pages/PlayerMessagesPage.tsx"), "utf8");
const dmSource = readFileSync(join(ROOT, "src/frontend/dm/layouts/CampaignShell.tsx"), "utf8");
const clientSource = readFileSync(join(ROOT, "src/frontend/shared/api/webProductClient.ts"), "utf8");
const playerStyles = readFileSync(join(ROOT, "src/frontend/shared/styles/p1.css"), "utf8");
const sharedStyles = readFileSync(join(ROOT, "src/frontend/shared/styles/index.css"), "utf8");
const playerDockOptions = readFileSync(join(ROOT, "src/frontend/player/navigation/playerMobileDockItems.ts"), "utf8");

describe("shared mobile dock", () => {
  it("always exposes exactly three direct destinations plus More", () => {
    expect(dockSource).toContain("items.slice(0, 3)");
    expect(dockSource).toContain("items.slice(3)");
    expect(dockSource).toContain("<MoreHorizontal size={19} />");
  });

  it("is the single mobile dock implementation for DM, player portal and player messaging", () => {
    expect(dmSource).toContain("<MobileDock");
    expect(playerSource).toContain("<MobileDock");
    expect(playerMessagesSource).toContain("<MobileDock");
    expect(dmSource).not.toContain("mobile-dock__item");
    expect(playerStyles).toContain(".player-portal-nav,\n  .player-portal-header__messages");
  });

  it("centralizes the player options instead of duplicating dock definitions", () => {
    expect(playerSource).toContain("buildPlayerMobileDockItems");
    expect(playerMessagesSource).toContain("buildPlayerMobileDockItems");
    expect(playerDockOptions).toContain('{ id: "messages"');
    expect(playerSource).not.toContain('const playerDockItems = [');
    expect(playerMessagesSource).not.toContain('const dockItems = [');
  });

  it("keeps Messages in the three direct player and DM destinations", () => {
    expect(dmSource).toContain('const dockPriority = ["command-center", "session", "messages"]');
    expect(playerDockOptions).toContain('{ id: "messages"');
    expect(playerMessagesSource).toContain('activeId="messages"');
  });

  it("contains no campaign-specific legacy classes or hardcoded labels", () => {
    expect(dockSource).not.toContain("campaign-mobile-");
    expect(sharedStyles).not.toContain("campaign-mobile-nav-");
    expect(sharedStyles).not.toContain("campaign-mobile-bottom-nav");
    expect(dockSource).toContain("closeLabel");
    expect(dockSource).not.toContain('aria-label="Cerrar"');
    expect(playerSource).toContain('closeLabel={t("common.close")}');
    expect(playerMessagesSource).toContain('closeLabel={t("common.close")}');
    expect(dmSource).toContain('closeLabel={t("common.close")}');
  });

  it("does not expose the removed generic proposals workflow", () => {
    expect(playerSource).not.toContain("player_note");
    expect(playerSource).not.toContain("playerPortal.tabs.proposals");
    expect(clientSource).not.toContain("getPlayerProposals");
  });
});
