import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("canonical campaign lifecycle vocabulary", () => {
  it("uses importing, active and trashed in account and template flows", () => {
    const accountRoutes = read("src/backend/server/web/routes/accountWebRoutes.ts");
    const accountPage = read("src/frontend/account/AccountPage.tsx");
    const templateRoutes = read("src/backend/server/web/routes/campaignTemplateWebRoutes.ts");

    expect(accountRoutes).not.toContain('campaign.status !== "deleted"');
    expect(accountRoutes).not.toContain('ne(schema.campaigns.status, "deleted")');
    expect(accountRoutes).toContain('campaign.status !== "trashed"');
    expect(accountRoutes).toContain('ne(schema.campaigns.status, "trashed")');

    expect(accountPage).not.toContain('campaignStatus === "archived"');
    expect(accountPage).not.toContain('campaignStatus === "deleted"');
    expect(accountPage).toContain('campaignStatus === "trashed"');

    expect(templateRoutes).not.toContain("campaigns.status} <> 'deleted'");
    expect(templateRoutes).toContain("campaigns.status} <> 'trashed'");
  });
});
