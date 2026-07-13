import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migrationPath = join(ROOT, "src/backend/db/migrations/0009_campaign_referential_integrity.sql");

describe("campaign referential integrity migration", () => {
  it("cleans orphaned campaign rows before adding constraints", () => {
    const migration = readFileSync(migrationPath, "utf8");
    const cleanupPosition = migration.indexOf('DELETE FROM "campaign_entities"');
    const constraintPosition = migration.indexOf('ADD CONSTRAINT "fk_campaign_entities_campaign"');

    expect(cleanupPosition).toBeGreaterThanOrEqual(0);
    expect(constraintPosition).toBeGreaterThan(cleanupPosition);
  });

  it("cascades campaign deletion across core projections and portal state", () => {
    const migration = readFileSync(migrationPath, "utf8");

    for (const constraint of [
      "fk_campaign_entities_campaign",
      "fk_domain_events_campaign",
      "fk_visibility_grants_campaign",
      "fk_player_profiles_campaign",
      "fk_player_portal_states_campaign",
      "fk_player_portal_resources_campaign",
    ]) {
      expect(migration).toContain(`ADD CONSTRAINT "${constraint}"`);
    }
  });

  it("enforces same-campaign entity, session and player references", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain('FOREIGN KEY ("campaign_id", "subject_entity_id")');
    expect(migration).toContain('FOREIGN KEY ("campaign_id", "session_id")');
    expect(migration).toContain('FOREIGN KEY ("campaign_id", "player_id") REFERENCES "player_profiles"');
  });

  it("preserves campaign ownership when optional references are deleted", () => {
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain('ON DELETE SET NULL ("target_entity_id")');
    expect(migration).toContain('ON DELETE SET NULL ("active_session_id")');
    expect(migration).toContain('ON DELETE SET NULL ("entity_id")');
  });
});
