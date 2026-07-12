import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

describe("campaign messaging migration", () => {
  it("creates canonical messaging tables and migrates legacy notes once", () => {
    const migration = readFileSync(join(ROOT, "src/backend/db/migrations/0007_campaign_messaging.sql"), "utf8");
    const config = readFileSync(join(ROOT, "drizzle.config.ts"), "utf8");

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "campaign_messages"');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "campaign_message_reads"');
    expect(migration).toContain('INSERT INTO "campaign_messages"');
    expect(migration).toContain('DELETE FROM "player_proposals"');
    expect(config).toContain("messagingSchema.ts");
  });
});
