import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const routeSource = readFileSync(
  join(ROOT, "src/backend/server/web/routes/campaignMessagingWebRoutes.ts"),
  "utf8",
);
const portalSource = readFileSync(
  join(ROOT, "src/backend/server/web/routes/playerPortalWebRoutes.ts"),
  "utf8",
);
const migrationSource = readFileSync(
  join(ROOT, "src/backend/db/migrations/0007_campaign_messaging.sql"),
  "utf8",
);
const smartLandingSource = readFileSync(join(ROOT, "src/frontend/SmartLanding.tsx"), "utf8");

describe("campaign messaging architecture", () => {
  it("treats dm and co_dm through the same role predicate", () => {
    expect(routeSource).toContain("isDmRole(viewer.role)");
    expect(routeSource).not.toContain('membership.role === "dm"');
    expect(routeSource).not.toContain('viewer.role === "dm"');
  });

  it("uses party visibility by default and preserves private channels", () => {
    expect(routeSource).toContain('request.body?.audience ?? "party"');
    expect(routeSource).toContain('message.audience === "party"');
    expect(routeSource).toContain('message.audience === "player"');
    expect(routeSource).toContain('message.senderUserId === viewer.userId');
    expect(routeSource).toContain('message.recipientPlayerId === viewer.playerId');
  });

  it("keeps generic messages out of player proposals", () => {
    expect(portalSource).toContain('type !== "link_request"');
    expect(portalSource).toContain("Only structured character link requests are accepted as proposals");
    expect(portalSource).not.toContain('body.kind ?? body.type ?? "note"');
    expect(smartLandingSource).not.toContain("player_note");
    expect(smartLandingSource).not.toContain("JSON.stringify(proposal.content)");
  });

  it("migrates legacy text proposals once and deletes their old rows", () => {
    expect(migrationSource).toContain('INSERT INTO "campaign_messages"');
    expect(migrationSource).toContain("'player_note', 'note', 'message'");
    expect(migrationSource).toContain('DELETE FROM "player_proposals"');
  });
});
