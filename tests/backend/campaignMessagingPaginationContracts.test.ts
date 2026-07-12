import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const routeSource = read("src/backend/server/web/routes/campaignMessagingWebRoutes.ts");
const panelSource = read("src/frontend/shared/components/CampaignMessagingPanel.tsx");
const migrationSource = read("src/backend/db/migrations/0008_campaign_message_pagination.sql");

 describe("campaign messaging pagination contract", () => {
  it("bounds the initial and historical message queries", () => {
    expect(routeSource).toContain("CAMPAIGN_MESSAGE_PAGE_SIZE = 50");
    expect(routeSource).toContain(".limit(CAMPAIGN_MESSAGE_PAGE_SIZE + 1)");
    expect(routeSource).toContain("Querystring: { before?: string }");
    expect(routeSource).toContain("Invalid message cursor");
  });

  it("uses a deterministic date and id cursor order", () => {
    expect(routeSource).toContain("desc(campaignMessages.createdAt), desc(campaignMessages.messageId)");
    expect(routeSource).toContain("lt(campaignMessages.createdAt, cursorMessage.createdAt)");
    expect(routeSource).toContain("lt(campaignMessages.messageId, cursorMessage.messageId)");
    expect(migrationSource).toContain('"campaign_id", "created_at" DESC, "message_id" DESC');
  });

  it("loads older pages without replacing already loaded messages", () => {
    expect(panelSource).toContain("loadOlder");
    expect(panelSource).toContain("mergeMessages(olderPayload.messages, current.messages)");
    expect(panelSource).toContain("list.scrollTop += list.scrollHeight - previousScrollHeight");
    expect(panelSource).toContain("payload.pageInfo.nextCursor");
  });

  it("merges realtime refreshes into the bounded recent page", () => {
    expect(panelSource).toContain("mergeMessages(current.messages, nextPayload.messages)");
    expect(panelSource).toContain('source.addEventListener("campaign.message.created", refresh)');
  });
});
