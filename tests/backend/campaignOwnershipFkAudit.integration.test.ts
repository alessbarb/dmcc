import { describe, expect, it } from "vitest";
import { pool } from "../../src/backend/db/client.js";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../../src/backend/db/schema.js";
import { playerPortalResources, playerPortalStates } from "../../src/backend/db/playerPortalSchema.js";
import { campaignMessages } from "../../src/backend/db/messagingSchema.js";

interface CampaignForeignKey {
  constraintName: string;
  deleteRule: string;
}

// Tables that legitimately carry a `campaign_id` column but are not owned by
// a single campaign row. Empty today — if a future table needs an exception,
// add it here explicitly instead of letting the audit test go silently green
// for the wrong reason.
const CAMPAIGN_ID_FK_EXCEPTIONS = new Set<string>([
  "campaign_purge_jobs",
]);

// Total number of campaign-owned tables known when this plan was written
// (7 already compliant + 16 pending here). This is only a floor to catch the
// discovery query itself silently returning too few rows (e.g. wrong schema
// name) — the dynamic discovery below is what actually enforces coverage of
// tables added after this plan lands, this constant does not need to be kept
// in sync with future tables.
const BASELINE_CAMPAIGN_OWNED_TABLE_COUNT = 23;

async function findTablesWithCampaignIdColumn(): Promise<string[]> {
  const result = await pool.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND column_name = 'campaign_id'
     ORDER BY table_name`,
  );
  // "campaigns" itself has a column named "campaign_id" (its own primary
  // key) — that's the FK target, not a table that should reference itself.
  return result.rows.map((row) => row.table_name).filter((name) => name !== "campaigns");
}

async function findCampaignForeignKeys(tableName: string): Promise<CampaignForeignKey[]> {
  // `constraint_name` is only unique per schema+table in Postgres, not
  // globally — every join below also pins `table_name`/`constraint_catalog`
  // so a same-named constraint on a different table can't be matched in by
  // accident (low practical risk given this repo's per-table naming
  // convention, e.g. fk_campaign_entities_campaign, but the query shouldn't
  // rely on that convention to be correct).
  const result = await pool.query<{ constraint_name: string; delete_rule: string }>(
    `SELECT DISTINCT tc.constraint_name, rc.delete_rule
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_catalog = kcu.constraint_catalog
      AND tc.constraint_schema = kcu.constraint_schema
      AND tc.constraint_name = kcu.constraint_name
      AND tc.table_catalog = kcu.table_catalog
      AND tc.table_schema = kcu.table_schema
      AND tc.table_name = kcu.table_name
     JOIN information_schema.constraint_column_usage ccu
       ON tc.constraint_catalog = ccu.constraint_catalog
      AND tc.constraint_schema = ccu.constraint_schema
      AND tc.constraint_name = ccu.constraint_name
     JOIN information_schema.referential_constraints rc
       ON tc.constraint_catalog = rc.constraint_catalog
      AND tc.constraint_schema = rc.constraint_schema
      AND tc.constraint_name = rc.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_schema = 'public'
       AND tc.table_name = $1
       AND kcu.column_name = 'campaign_id'
       AND ccu.table_name = 'campaigns'
       AND ccu.column_name = 'campaign_id'
     ORDER BY tc.constraint_name`,
    [tableName],
  );
  return result.rows.map((row) => ({ constraintName: row.constraint_name, deleteRule: row.delete_rule }));
}

describe("campaign ownership FK audit — PostgreSQL", () => {
  it("every table with a campaign_id column has exactly one ON DELETE CASCADE FK to campaigns", async () => {
    const discoveredTables = await findTablesWithCampaignIdColumn();
    // Guards against the discovery query itself silently returning nothing
    // (e.g. wrong schema name) and the test passing for the wrong reason.
    // Checked before the exceptions filter below: the discovery floor must
    // hold regardless of how many tables end up excused from needing an FK —
    // adding an exception later should never let this assertion quietly
    // start passing on a broken discovery query.
    expect(discoveredTables.length).toBeGreaterThanOrEqual(BASELINE_CAMPAIGN_OWNED_TABLE_COUNT);

    const tables = discoveredTables.filter((name) => !CAMPAIGN_ID_FK_EXCEPTIONS.has(name));

    const violations: string[] = [];
    for (const tableName of tables) {
      const foreignKeys = await findCampaignForeignKeys(tableName);
      if (foreignKeys.length === 0) {
        violations.push(`${tableName}: no FK from campaign_id to campaigns(campaign_id)`);
      } else if (foreignKeys.length > 1) {
        violations.push(`${tableName}: multiple campaign-ownership FKs (${foreignKeys.map((fk) => fk.constraintName).join(", ")}) — ambiguous, should be exactly one`);
      } else if (foreignKeys[0].deleteRule !== "CASCADE") {
        violations.push(`${tableName}: FK "${foreignKeys[0].constraintName}" exists but delete_rule is "${foreignKeys[0].deleteRule}", expected "CASCADE"`);
      }
    }

    expect(violations).toEqual([]);
  });

  it.each([
    "player_profiles",
    "campaign_memberships",
    "visibility_grants",
    "player_proposals",
    "player_portal_states",
    "player_portal_resources",
    "campaign_messages",
  ])("%s is already compliant before this plan runs", async (tableName) => {
    const foreignKeys = await findCampaignForeignKeys(tableName);
    expect(foreignKeys).toHaveLength(1);
    expect(foreignKeys[0]?.deleteRule).toBe("CASCADE");
  });
});

// One entry per table this plan (Tasks 2-4) and PR #116 add a campaign
// ownership FK to. Add new campaign-owned tables here when they're created —
// the PostgreSQL-side describe block above will fail first and point here.
const CAMPAIGN_OWNED_DRIZZLE_TABLES = [
  schema.playerProfiles,
  schema.campaignMemberships,
  schema.visibilityGrants,
  schema.playerProposals,
  schema.domainEvents,
  schema.commandIndex,
  schema.campaignSnapshots,
  schema.campaignEntities,
  schema.campaignFacts,
  schema.campaignRelations,
  schema.campaignSessions,
  schema.campaignScenes,
  schema.campaignObjectives,
  schema.campaignClues,
  schema.characters,
  schema.liveTables,
  schema.campaignInvitations,
  schema.campaignNotes,
  schema.campaignActivity,
  schema.attachments,
  playerPortalStates,
  playerPortalResources,
  campaignMessages,
] as const;

// Deliberately loose: finds every FK that *involves* campaign_id -> campaigns
// at all, without yet checking it's a clean single-column CASCADE reference.
// Filtering out the malformed ones before counting would hide exactly the
// case this test exists to catch — a table with one correct FK plus one
// leftover/duplicate FK (e.g. NO ACTION, or a composite FK that merely
// includes campaign_id among other columns) must still fail below, not have
// the bad one silently dropped and the count come out to a passing 1.
function findCampaignOwnershipReferences(table: (typeof CAMPAIGN_OWNED_DRIZZLE_TABLES)[number]) {
  return getTableConfig(table).foreignKeys.filter((foreignKey) => {
    const reference = foreignKey.reference();
    return (
      reference.foreignTable === schema.campaigns &&
      reference.columns.some((column) => column.name === "campaign_id") &&
      reference.foreignColumns.some((column) => column.name === "campaign_id")
    );
  });
}

describe("campaign ownership FK audit — Drizzle schema", () => {
  it.each(CAMPAIGN_OWNED_DRIZZLE_TABLES.map((table) => [getTableConfig(table).name, table] as const))(
    "%s declares exactly one simple campaign_id -> campaigns(campaign_id) ON DELETE CASCADE reference",
    (_tableName, table) => {
      const references = findCampaignOwnershipReferences(table);
      expect(references).toHaveLength(1);

      const foreignKey = references[0];
      expect(foreignKey).toBeDefined();
      const reference = foreignKey!.reference();

      expect(reference.columns).toHaveLength(1);
      expect(reference.foreignColumns).toHaveLength(1);
      expect(reference.columns[0]?.name).toBe("campaign_id");
      expect(reference.foreignColumns[0]?.name).toBe("campaign_id");
      expect(foreignKey!.onDelete).toBe("cascade");
    },
  );
});
