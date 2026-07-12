import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const smartLanding = readFileSync(join(ROOT, "src/frontend/SmartLanding.tsx"), "utf8");
const campaignShell = readFileSync(join(ROOT, "src/frontend/dm/layouts/CampaignShell.tsx"), "utf8");
const router = readFileSync(join(ROOT, "src/frontend/router.tsx"), "utf8");

describe("campaign messaging navigation", () => {
  it("exposes messaging from the active player campaign header", () => {
    expect(smartLanding).toContain('to: "/portal/messages/$campaignId"');
    expect(smartLanding).toContain("<MessageCircle size={15} /> Mensajes");
  });

  it("exposes messaging in DM and co-DM campaign navigation", () => {
    expect(campaignShell).toContain('path: "messages"');
    expect(campaignShell).toContain('label: "Mensajes"');
    expect(campaignShell).toContain('const dockPriority = ["command-center", "session", "messages"]');
    expect(campaignShell).toContain("<MobileDock");
    expect(campaignShell).not.toContain("mobilePrimary");
  });

  it("removes the location-dependent floating shortcut", () => {
    expect(router).not.toContain("CampaignMessagingShortcut");
    expect(existsSync(join(ROOT, "src/frontend/shared/components/CampaignMessagingShortcut.tsx"))).toBe(false);
  });
});
