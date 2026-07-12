import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

describe("campaign messaging contracts", () => {
  it("keeps free-text messaging out of player proposals", () => {
    const smartLanding = read("src/frontend/SmartLanding.tsx");
    const client = read("src/frontend/shared/api/webProductClient.ts");
    const portalRoutes = read("src/backend/server/web/routes/playerPortalWebRoutes.ts");

    expect(smartLanding).not.toContain('"proposals"');
    expect(smartLanding).not.toContain("player_note");
    expect(client).not.toContain("createPlayerProposal");
    expect(client).toContain("requestPlayerCharacterLink");
    expect(portalRoutes).toContain('type !== "link_request"');
    expect(portalRoutes).not.toContain('?? "note"');
  });

  it("registers dedicated player and direction messaging screens", () => {
    const router = read("src/frontend/router.tsx");
    const routes = read("src/backend/server/web/routes/campaignMessagingWebRoutes.ts");

    expect(router).toContain('path: "/portal/messages/$campaignId"');
    expect(router).toContain('path: "/messages"');
    expect(routes).toContain('"/api/campaigns/:campaignId/messages"');
  });

  it("keeps legacy player-note handling isolated to the one-time migration", () => {
    const migration = read("src/backend/db/migrations/0007_campaign_messaging.sql");
    expect(migration).toContain("player_note");
    expect(migration).toContain('DELETE FROM "player_proposals"');
  });

  it("does not force scroll while the user is reading history", () => {
    const panel = read("src/frontend/shared/components/CampaignMessagingPanel.tsx");

    expect(panel).toContain("NEAR_BOTTOM_THRESHOLD_PX");
    expect(panel).toContain("nearBottomRef.current");
    expect(panel).toContain("setUnseenCount((current) => current + incomingCount)");
    expect(panel).toContain("newMessages.length > 0 && nearBottomRef.current");
  });

  it("marks messages read only at the conversation end", () => {
    const panel = read("src/frontend/shared/components/CampaignMessagingPanel.tsx");

    expect(panel).toContain("if (nearBottom)");
    expect(panel).toContain("markMessagesRead(payloadRef.current.messages)");
    expect(panel).not.toContain("await markMessagesRead(olderPayload.messages)");
  });

  it("shows optimistic sending, failure and manual retry states", () => {
    const panel = read("src/frontend/shared/components/CampaignMessagingPanel.tsx");

    expect(panel).toContain('status: "sending" | "failed"');
    expect(panel).toContain('setPendingMessage({ ...message, status: "failed" })');
    expect(panel).toContain("submitMessage(pendingMessage)");
    expect(panel).toContain('aria-busy={pendingMessage.status === "sending"}');
  });
});
