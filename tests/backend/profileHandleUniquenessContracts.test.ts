import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile public handle uniqueness contracts", () => {
  const schema = readFileSync("src/backend/db/schema.ts", "utf8");
  const migration = readFileSync("src/backend/db/migrations/0020_unique_profile_public_handles.sql", "utf8");
  const journal = readFileSync("src/backend/db/migrations/meta/_journal.json", "utf8");

  it("declares partial unique indexes for stored DM and player public handles", () => {
    expect(schema).toContain('uniqueIndex("uq_dm_profiles_public_handle")');
    expect(schema).toContain('uniqueIndex("uq_player_profiles_public_handle")');
    expect(schema).toContain("where(sql`${table.publicHandle} is not null`)");
  });

  it("normalizes and de-duplicates existing handles before adding unique indexes", () => {
    expect(migration).toContain('regexp_replace("public_handle", \'^@+\', \'\')');
    expect(migration).toContain('row_number() OVER (PARTITION BY "public_handle"');
    expect(migration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "uq_dm_profiles_public_handle"');
    expect(migration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "uq_player_profiles_public_handle"');
  });

  it("is registered in the Drizzle migration journal", () => {
    expect(journal).toContain('"tag": "0020_unique_profile_public_handles"');
  });
});
