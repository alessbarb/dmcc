> Archived historical implementation plan.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Campaign Ownership FK Integrity (Block 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every table whose rows only make sense inside a campaign gets a real foreign key to `campaigns(campaign_id)` with `ON DELETE CASCADE`, and a structural test discovers *any* table with a `campaign_id` column and fails if it lacks that FK — including tables added after this plan lands, in any schema file.

**Architecture:** Three new hand-written SQL migrations (grouped by domain: event-sourcing/read-model core, narrative content, collaboration/infra), each removing orphaned rows before adding the `ALTER TABLE ... ADD CONSTRAINT` that couldn't otherwise run safely. `schema.ts` gets the matching `.references()` calls so Drizzle and Postgres never diverge again (this is exactly the class of bug fixed in PR #116: a migration constraint with no matching write-path/schema update). The structural test queries `information_schema.columns` to *discover* every `campaign_id`-bearing table in `public`, then checks each one's FK target and `delete_rule` via `information_schema.referential_constraints` — it does not rely on a hardcoded table list to decide pass/fail, so it can't go stale the way a hardcoded list would.

**Tech Stack:** TypeScript, Drizzle ORM (`drizzle-orm/pg-core`), PostgreSQL, `drizzle-orm/node-postgres/migrator`, Vitest, `pg` (`node-postgres`).

## Global Constraints

- No hard deletes from normal UI flows; archive instead (`CLAUDE.md`). This plan's `ON DELETE CASCADE` only fires when a whole `campaigns` row is deleted (workspace/account cleanup, dev/test teardown), not from per-entity archive flows — those still go through `status = 'archived'` and are untouched by this plan.
- Indexes/snapshots must be rebuildable from event history alone (`CLAUDE.md`) — out of scope here; this plan only adds referential-integrity constraints, it does not change what data is stored.
- Drizzle schema (`schema.ts`) must declare exactly the constraints the applied migration SQL creates — no divergence between the two (lesson from PR #116, where a migration constraint had no matching write-path update). Every task in this plan updates `schema.ts` and its migration file together, in the same task.
- This branch (`agent/harden-integrity-authorization`, PR #116) already added FK integrity for `player_profiles`, `campaign_memberships`, `visibility_grants`, `player_proposals` (via `0009_player_visibility_integrity.sql`), `player_portal_states`, `player_portal_resources` (via `playerPortalSchema.ts`), and `campaign_messages` was already correct before this PR (`messagingSchema.ts`). This plan must run **after** PR #116 merges (or be rebased onto it) — migration numbering below assumes `0009_player_visibility_integrity.sql` is the last migration on `main` when this plan starts. If the numbering has moved by execution time, renumber the three new migration files and their `_journal.json` entries accordingly; nothing else in this plan depends on the exact numbers.
- `drizzle-orm/pg-core`'s migrator (`node_modules/drizzle-orm/pg-core/dialect.js`, `migrate()`) wraps **all migration files still pending at the start of a given `db:migrate` invocation in a single `db.transaction(...)` call** — not one transaction per file. This plan runs `db:migrate` once per task (Tasks 2, 3, 4), right after writing that task's migration, so each `db:migrate` invocation during step-by-step execution only has one new migration pending and commits it alone — that's deliberate, it keeps failures isolated to a small diff. In a clean deployment where all three migrations (`0010`, `0011`, `0012`) are pending at once, a single `db:migrate` run applies all three atomically: if any one fails, none of them commit. Don't describe the migrations as "idempotent" either way — the orphan-cleanup `DELETE` is safely re-runnable, the `ADD CONSTRAINT` is not (a second run fails on a duplicate constraint name, which never happens in practice because the migrator's own tracking table prevents a migration from running twice).

---

## Current State (verified against `agent/harden-integrity-authorization`)

23 tables across `schema.ts`, `playerPortalSchema.ts`, and `messagingSchema.ts` carry a `campaign_id` column (verified by grepping `pgTable(` blocks in all three files). **7 are already compliant** (real FK to `campaigns(campaign_id)` with `ON DELETE CASCADE`, confirmed by reading each definition on this branch):

- `player_profiles`, `campaign_memberships`, `visibility_grants` — fixed directly on this branch (PR #116).
- `player_proposals` — fixed by `0009_player_visibility_integrity.sql` (`fk_player_proposals_campaign`, confirmed in that migration file and in `schema.ts:376`). An earlier draft of this plan missed this and incorrectly listed `player_proposals` as pending — corrected here.
- `player_portal_states`, `player_portal_resources` (`playerPortalSchema.ts`) — fixed on this branch.
- `campaign_messages` (`messagingSchema.ts`) — was already correct before this PR.

**16 tables are pending** (`campaignId: text("campaign_id").notNull()` with no `.references()` and no matching FK in any migration):

**Group A — event-sourcing & core read models** (`0010`, 6 tables): `domain_events`, `command_index`, `campaign_snapshots`, `campaign_entities`, `campaign_facts`, `campaign_relations`.

**Group B — narrative content** (`0011`, 5 tables): `campaign_sessions`, `campaign_scenes`, `campaign_objectives`, `campaign_clues`, `characters`.

**Group C — collaboration & infra** (`0012`, 5 tables): `live_tables`, `campaign_invitations`, `campaign_notes`, `activity_feed`, `attachments`. (`player_proposals` removed from this group — see above.)

6 + 5 + 5 = 16, matching the 23 - 7 = 16 total above.

---

## Task 1: Structural FK-audit test (RED)

**Files:**

- Create: `tests/backend/campaignOwnershipFkAudit.integration.test.ts`

**Interfaces:**

- Consumes: `pool` from `src/backend/db/client.ts` (already exported, `export const pool = new pg.Pool(...)`).
- Produces: nothing new consumed by later tasks — later tasks just make this test pass by adding the migrations/schema changes. No other file imports from this test file.

- [ ] **Step 1: Write the failing test**

The test has two parts: (1) a dynamic-discovery assertion that is the actual enforcement mechanism — it queries `information_schema.columns` for every table in `public` with a `campaign_id` column, then requires each one to have an FK to `campaigns(campaign_id)` with `delete_rule = 'CASCADE'`, and fails with a diagnostic message per table if not; (2) a small documented list of the 7 tables expected to already pass, kept as a readable regression marker (not the enforcement mechanism — assertion (1) is).

```typescript
import { describe, expect, it } from "vitest";
import { pool } from "../../src/backend/db/client.js";

interface CampaignForeignKey {
  constraintName: string;
  deleteRule: string;
}

// Tables that legitimately carry a `campaign_id` column but are not owned by
// a single campaign row. Empty today — if a future table needs an exception,
// add it here explicitly instead of letting the audit test go silently green
// for the wrong reason.
const CAMPAIGN_ID_FK_EXCEPTIONS = new Set<string>([]);

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
```

- [ ] **Step 2: Write the Drizzle-side companion test (schema.ts must declare the same thing PostgreSQL enforces)**

The PostgreSQL-side test above only proves the *database* has the FK — nothing stops someone from adding `ADD CONSTRAINT` directly in a migration without ever touching `schema.ts`, which is silently valid TypeScript (a column with no `.references()` still compiles) and would let Drizzle and Postgres drift apart again, unnoticed, exactly the class of bug this plan exists to prevent. Add this second `describe` block, in the same file, using `getTableConfig` from `drizzle-orm/pg-core` to inspect each table's declared foreign keys directly:

```typescript
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../../src/backend/db/schema.js";
import { playerPortalResources, playerPortalStates } from "../../src/backend/db/playerPortalSchema.js";
import { campaignMessages } from "../../src/backend/db/messagingSchema.js";

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
  schema.activityFeed,
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
```

- [ ] **Step 3: Run test to verify it fails with exactly the 16 pending tables listed as violations**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipFkAudit.integration.test.ts`

Expected: in the PostgreSQL describe block, `"every table..."` FAILs with a `violations` array listing exactly the 16 Group A/B/C tables (each with the "no FK from campaign_id..." message); the seven `it.each` tests all PASS. In the Drizzle describe block, the 16 Group A/B/C entries FAIL (`findCampaignOwnershipReferences` returns `[]` — no `.references()` yet) and the 7 already-compliant entries PASS. If the violations differ from exactly Group A/B/C in either block, stop — the inventory above is wrong for the branch you're running against; re-verify against the actual `schema.ts` before continuing.

- [ ] **Step 4: Commit locally — do not push yet**

```bash
git add tests/backend/campaignOwnershipFkAudit.integration.test.ts
git commit -m "test: audit campaign_id FK coverage across every campaign-owned table"
```

This commit is intentionally red on its own (16 tables still fail) — that's expected local TDD state, not a defect. If this repo's CI/automation runs on every push (`CLAUDE.md` mentions PWA/CI tooling; confirm current CI config before pushing), don't push this commit by itself. Keep it local until Task 4's commit lands and the audit test is fully green, then push the whole four-commit range together.

---

## Task 2: Group A — event-sourcing & core read models (migration `0010`)

**Files:**

- Modify: `src/backend/db/schema.ts` (6 table definitions: `domainEvents`, `commandIndex`, `campaignSnapshots`, `campaignEntities`, `campaignFacts`, `campaignRelations`)
- Create: `src/backend/db/migrations/0010_campaign_ownership_core.sql`
- Modify: `src/backend/db/migrations/meta/_journal.json`

**Interfaces:**

- Consumes: `campaigns` const already exported from `schema.ts` (defined above all six tables in this file — no import needed, same-file reference).
- Produces: nothing new consumed by later tasks; this task is independent of Task 3/4 except for the shared `_journal.json` entries array (each task appends one entry, order doesn't matter for correctness but keep tasks sequential to avoid merge conflicts on that file).

- [ ] **Step 1: Diagnose orphan counts before touching anything**

This is two separate checks, not one — a zero result on your local Docker instance says nothing about whether the deployed database (Neon, per `.env`'s `DATABASE_URL` in this repo) also has zero orphans, and an agent generally has no business running destructive-adjacent diagnostics against a production connection string unsupervised.

- **Local/CI database (agent-executable now):** run the query below against the disposable dev Postgres and record the output in the task's commit message. It must read `0` for every row.
- **Deployed database (Neon or wherever this ships) — human-gated, separate from this task:** before this migration is ever applied there, someone with access must run the same query against that database (read-only role/replica if the deployment's access policy requires it) and confirm zero, or explicitly approve deleting the nonzero rows. Do not run this against a production connection string as part of local task execution; flag it in the PR description as a pre-deploy checklist item instead.

```sql
SELECT 'domain_events' AS table_name, count(*) AS orphan_count FROM domain_events row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'command_index', count(*) FROM command_index row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_snapshots', count(*) FROM campaign_snapshots row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_entities', count(*) FROM campaign_entities row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_facts', count(*) FROM campaign_facts row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_relations', count(*) FROM campaign_relations row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id);
```

Run against local/CI: `docker exec dmcc-postgres psql -U dmcc -d dmcc -c "<query above, one line>"`. If any count is nonzero even locally, stop and get sign-off before the `DELETE` step below destroys those rows — a disposable dev instance still might contain data someone cares about (e.g. seeded demo campaigns).

- [ ] **Step 2: Update `schema.ts` for the six Group A tables**

Each edit adds `.references(() => campaigns.campaignId, { onDelete: "cascade" })` to the existing `campaignId` column. Anchor each edit on the table's `export const` line for uniqueness (the bare `campaignId: text("campaign_id").notNull(),` line is duplicated across many tables in this file).

```typescript
// domainEvents — before:
export const domainEvents = pgTable("domain_events", {
  campaignId: text("campaign_id").notNull(),
  sequence: integer("sequence").notNull(),

// domainEvents — after:
export const domainEvents = pgTable("domain_events", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
```

```typescript
// commandIndex — before:
export const commandIndex = pgTable("command_index", {
  campaignId: text("campaign_id").notNull(),
  commandId: text("command_id").notNull(),

// commandIndex — after:
export const commandIndex = pgTable("command_index", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  commandId: text("command_id").notNull(),
```

```typescript
// campaignSnapshots — before:
export const campaignSnapshots = pgTable("campaign_snapshots", {
  campaignId: text("campaign_id").primaryKey(),
  sequence: integer("sequence").notNull(),

// campaignSnapshots — after:
export const campaignSnapshots = pgTable("campaign_snapshots", {
  campaignId: text("campaign_id").primaryKey().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
```

```typescript
// campaignEntities — before:
export const campaignEntities = pgTable("campaign_entities", {
  campaignId: text("campaign_id").notNull(),
  entityId: text("entity_id").notNull(),

// campaignEntities — after:
export const campaignEntities = pgTable("campaign_entities", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  entityId: text("entity_id").notNull(),
```

```typescript
// campaignFacts — before:
export const campaignFacts = pgTable("campaign_facts", {
  campaignId: text("campaign_id").notNull(),
  factId: text("fact_id").notNull(),

// campaignFacts — after:
export const campaignFacts = pgTable("campaign_facts", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  factId: text("fact_id").notNull(),
```

```typescript
// campaignRelations — before:
export const campaignRelations = pgTable("campaign_relations", {
  campaignId: text("campaign_id").notNull(),
  relationId: text("relation_id").notNull(),

// campaignRelations — after:
export const campaignRelations = pgTable("campaign_relations", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  relationId: text("relation_id").notNull(),
```

- [ ] **Step 3: Create migration `0010_campaign_ownership_core.sql`**

```sql
-- Tie event-sourcing and core read-model rows to an existing campaign.
-- Orphan counts must be verified as zero before this runs against any
-- database with real user data (see Task 2, Step 1 of the implementation plan).
DELETE FROM "domain_events" de
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = de."campaign_id");
--> statement-breakpoint
DELETE FROM "command_index" ci
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ci."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_snapshots" cs
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cs."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_entities" ce
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ce."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_facts" cf
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cf."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_relations" cr
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cr."campaign_id");
--> statement-breakpoint

ALTER TABLE "domain_events"
ADD CONSTRAINT "fk_domain_events_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "command_index"
ADD CONSTRAINT "fk_command_index_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_snapshots"
ADD CONSTRAINT "fk_campaign_snapshots_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_entities"
ADD CONSTRAINT "fk_campaign_entities_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_facts"
ADD CONSTRAINT "fk_campaign_facts_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_relations"
ADD CONSTRAINT "fk_campaign_relations_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
```

- [ ] **Step 4: Add the journal entry**

In `src/backend/db/migrations/meta/_journal.json`, add a new entry after the `0009_player_visibility_integrity` line (keep it the last element, comma on the previous line):

```json
    { "idx": 10, "version": "7", "when": 1783918800000, "tag": "0010_campaign_ownership_core", "breakpoints": true }
```

- [ ] **Step 5: Apply the migration and run the audit test**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npm run db:migrate`
Expected: `Migrations ran successfully!`

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipFkAudit.integration.test.ts`
Expected: in the PostgreSQL describe block, `violations` now lists exactly the 10 remaining Group B + Group C tables (down from 16). In the Drizzle describe block, the same 6 Group A entries now PASS, the 10 Group B/C entries still FAIL. All `it.each` "already compliant" tests still pass.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck:all`
Expected: no errors.

- [ ] **Step 7: Commit**

Only use the "orphan counts verified zero" wording below if Step 1's query actually returned zero for every row. If it returned nonzero counts and cleanup was explicitly approved, replace that line with the real counts and what was approved, e.g. `Orphan cleanup approved: 3 campaign_facts rows with no matching campaign.` Do not commit the zero-count claim unverified.

```bash
git add src/backend/db/schema.ts src/backend/db/migrations/0010_campaign_ownership_core.sql src/backend/db/migrations/meta/_journal.json
git commit -m "feat: add campaign FK to event-sourcing and core read-model tables

Orphan counts verified zero before applying (see Step 1 query output)."
```

---

## Task 3: Group B — narrative content (migration `0011`)

**Files:**

- Modify: `src/backend/db/schema.ts` (5 table definitions: `campaignSessions`, `campaignScenes`, `campaignObjectives`, `campaignClues`, `characters`)
- Create: `src/backend/db/migrations/0011_campaign_ownership_narrative.sql`
- Modify: `src/backend/db/migrations/meta/_journal.json`

**Interfaces:**

- Consumes: `campaigns` const from `schema.ts` (same file, same-file reference).
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Diagnose orphan counts before touching anything**

```sql
SELECT 'campaign_sessions' AS table_name, count(*) AS orphan_count FROM campaign_sessions row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_scenes', count(*) FROM campaign_scenes row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_objectives', count(*) FROM campaign_objectives row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_clues', count(*) FROM campaign_clues row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'characters', count(*) FROM characters row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id);
```

Same local-vs-deployed split as Task 2 Step 1: run against local/CI now and record the result (must be `0` everywhere) in the task's commit message; getting the deployed database (Neon) to zero, or explicit sign-off on deleting nonzero rows there, is a separate pre-deploy checklist item, not something to do as part of this task.

- [ ] **Step 2: Update `schema.ts` for the five Group B tables**

```typescript
// campaignSessions — before:
export const campaignSessions = pgTable("campaign_sessions", {
  campaignId: text("campaign_id").notNull(),
  sessionId: text("session_id").notNull(),

// campaignSessions — after:
export const campaignSessions = pgTable("campaign_sessions", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
```

```typescript
// campaignScenes — before:
export const campaignScenes = pgTable("campaign_scenes", {
  campaignId: text("campaign_id").notNull(),
  sceneId: text("scene_id").notNull(),

// campaignScenes — after:
export const campaignScenes = pgTable("campaign_scenes", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  sceneId: text("scene_id").notNull(),
```

```typescript
// campaignObjectives — before:
export const campaignObjectives = pgTable("campaign_objectives", {
  campaignId: text("campaign_id").notNull(),
  objectiveId: text("objective_id").notNull(),

// campaignObjectives — after:
export const campaignObjectives = pgTable("campaign_objectives", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  objectiveId: text("objective_id").notNull(),
```

```typescript
// campaignClues — before:
export const campaignClues = pgTable("campaign_clues", {
  campaignId: text("campaign_id").notNull(),
  clueId: text("clue_id").notNull(),

// campaignClues — after:
export const campaignClues = pgTable("campaign_clues", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  clueId: text("clue_id").notNull(),
```

```typescript
// characters — before:
export const characters = pgTable("characters", {
  campaignId: text("campaign_id").notNull(),
  characterId: text("character_id").notNull(),

// characters — after:
export const characters = pgTable("characters", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  characterId: text("character_id").notNull(),
```

- [ ] **Step 3: Create migration `0011_campaign_ownership_narrative.sql`**

```sql
-- Tie narrative content rows to an existing campaign.
-- Orphan counts must be verified as zero before this runs against any
-- database with real user data (see Task 3, Step 1 of the implementation plan).
DELETE FROM "campaign_sessions" cs
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cs."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_scenes" csc
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = csc."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_objectives" co
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = co."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_clues" ccl
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ccl."campaign_id");
--> statement-breakpoint
DELETE FROM "characters" ch
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = ch."campaign_id");
--> statement-breakpoint

ALTER TABLE "campaign_sessions"
ADD CONSTRAINT "fk_campaign_sessions_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_scenes"
ADD CONSTRAINT "fk_campaign_scenes_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_objectives"
ADD CONSTRAINT "fk_campaign_objectives_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_clues"
ADD CONSTRAINT "fk_campaign_clues_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "characters"
ADD CONSTRAINT "fk_characters_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
```

- [ ] **Step 4: Add the journal entry**

Append after the `0010_campaign_ownership_core` entry:

```json
    { "idx": 11, "version": "7", "when": 1783922400000, "tag": "0011_campaign_ownership_narrative", "breakpoints": true }
```

- [ ] **Step 5: Apply the migration and run the audit test**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npm run db:migrate`
Expected: `Migrations ran successfully!`

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipFkAudit.integration.test.ts`
Expected: in the PostgreSQL describe block, `violations` now lists exactly the 5 Group C tables. In the Drizzle describe block, the 5 Group B entries now PASS, the 5 Group C entries still FAIL.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck:all`
Expected: no errors.

- [ ] **Step 7: Commit**

Same rule as Task 2 Step 7: only claim "verified zero" if Step 1's query actually returned zero; otherwise state the real counts and the approval.

```bash
git add src/backend/db/schema.ts src/backend/db/migrations/0011_campaign_ownership_narrative.sql src/backend/db/migrations/meta/_journal.json
git commit -m "feat: add campaign FK to narrative content tables

Orphan counts verified zero before applying (see Step 1 query output)."
```

---

## Task 4: Group C — collaboration & infra (migration `0012`)

**Files:**

- Modify: `src/backend/db/schema.ts` (5 table definitions: `liveTables`, `campaignInvitations`, `campaignNotes`, `activityFeed`, `attachments` — **not** `playerProposals`, already fixed by PR #116's `0009_player_visibility_integrity.sql`; do not touch it)
- Create: `src/backend/db/migrations/0012_campaign_ownership_collaboration.sql`
- Modify: `src/backend/db/migrations/meta/_journal.json`

**Interfaces:**

- Consumes: `campaigns` const from `schema.ts` (same file, same-file reference).
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Diagnose orphan counts before touching anything**

```sql
SELECT 'live_tables' AS table_name, count(*) AS orphan_count FROM live_tables row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_invitations', count(*) FROM campaign_invitations row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'campaign_notes', count(*) FROM campaign_notes row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'activity_feed', count(*) FROM activity_feed row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id)
UNION ALL
SELECT 'attachments', count(*) FROM attachments row WHERE NOT EXISTS (SELECT 1 FROM campaigns c WHERE c.campaign_id = row.campaign_id);
```

Same local-vs-deployed split as Task 2 Step 1: run against local/CI now and record the result (must be `0` everywhere) in the task's commit message; getting the deployed database (Neon) to zero, or explicit sign-off on deleting nonzero rows there, is a separate pre-deploy checklist item, not something to do as part of this task.

- [ ] **Step 2: Update `schema.ts` for the five Group C tables**

```typescript
// liveTables — before:
export const liveTables = pgTable("live_tables", {
  liveTableId: text("live_table_id").primaryKey(),
  campaignId: text("campaign_id").notNull(),

// liveTables — after:
export const liveTables = pgTable("live_tables", {
  liveTableId: text("live_table_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
```

```typescript
// campaignInvitations — before:
export const campaignInvitations = pgTable("campaign_invitations", {
  invitationId: text("invitation_id").primaryKey(),
  campaignId: text("campaign_id").notNull(),

// campaignInvitations — after:
export const campaignInvitations = pgTable("campaign_invitations", {
  invitationId: text("invitation_id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
```

```typescript
// campaignNotes — before:
export const campaignNotes = pgTable("campaign_notes", {
  campaignId: text("campaign_id").notNull(),
  noteId: text("note_id").notNull(),

// campaignNotes — after:
export const campaignNotes = pgTable("campaign_notes", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  noteId: text("note_id").notNull(),
```

```typescript
// activityFeed — before:
export const activityFeed = pgTable("activity_feed", {
  campaignId: text("campaign_id").notNull(),
  activityId: text("activity_id").notNull(),

// activityFeed — after:
export const activityFeed = pgTable("activity_feed", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  activityId: text("activity_id").notNull(),
```

```typescript
// attachments — before:
export const attachments = pgTable("attachments", {
  campaignId: text("campaign_id").notNull(),
  attachmentId: text("attachment_id").notNull(),

// attachments — after:
export const attachments = pgTable("attachments", {
  campaignId: text("campaign_id").notNull().references(() => campaigns.campaignId, { onDelete: "cascade" }),
  attachmentId: text("attachment_id").notNull(),
```

- [ ] **Step 3: Create migration `0012_campaign_ownership_collaboration.sql`**

```sql
-- Tie collaboration and infra rows to an existing campaign.
-- player_proposals is intentionally absent here: it already has
-- fk_player_proposals_campaign from 0009_player_visibility_integrity.sql.
-- Orphan counts must be verified as zero before this runs against any
-- database with real user data (see Task 4, Step 1 of the implementation plan).
DELETE FROM "live_tables" lt
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = lt."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_invitations" cinv
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cinv."campaign_id");
--> statement-breakpoint
DELETE FROM "campaign_notes" cn
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = cn."campaign_id");
--> statement-breakpoint
DELETE FROM "activity_feed" af
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = af."campaign_id");
--> statement-breakpoint
DELETE FROM "attachments" att
WHERE NOT EXISTS (SELECT 1 FROM "campaigns" c WHERE c."campaign_id" = att."campaign_id");
--> statement-breakpoint

ALTER TABLE "live_tables"
ADD CONSTRAINT "fk_live_tables_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_invitations"
ADD CONSTRAINT "fk_campaign_invitations_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "campaign_notes"
ADD CONSTRAINT "fk_campaign_notes_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "activity_feed"
ADD CONSTRAINT "fk_activity_feed_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "attachments"
ADD CONSTRAINT "fk_attachments_campaign"
FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("campaign_id") ON DELETE CASCADE;
```

- [ ] **Step 4: Add the journal entry**

Append after the `0011_campaign_ownership_narrative` entry:

```json
    { "idx": 12, "version": "7", "when": 1783926000000, "tag": "0012_campaign_ownership_collaboration", "breakpoints": true }
```

- [ ] **Step 5: Apply the migration and run the audit test**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npm run db:migrate`
Expected: `Migrations ran successfully!`

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipFkAudit.integration.test.ts`
Expected: both describe blocks fully pass — the PostgreSQL block's `violations` is `[]`, every `it.each` in the Drizzle block passes.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck:all`
Expected: no errors.

- [ ] **Step 7: Commit**

Same rule as Task 2 Step 7: only claim "verified zero" if Step 1's query actually returned zero; otherwise state the real counts and the approval.

```bash
git add src/backend/db/schema.ts src/backend/db/migrations/0012_campaign_ownership_collaboration.sql src/backend/db/migrations/meta/_journal.json
git commit -m "feat: add campaign FK to collaboration and infra tables

Orphan counts verified zero before applying (see Step 1 query output)."
```

---

## Task 5: Cascade-behavior test and test-fixture cleanup fix

**Files:**

- Modify: `tests/setup.ts` (remove the silent `catch {}`; add explicit cleanup for `campaignObjectives`, `campaignClues`, `characters` — these three tables have never been cleaned between tests, a pre-existing gap independent of this plan's cascade FKs, since a mid-test crash before the top-level `campaigns` delete would otherwise leave rows behind even with cascade in place)
- Create: `tests/backend/campaignOwnershipCascade.integration.test.ts`

**Interfaces:**

- Consumes: `schema.campaigns`, `schema.campaignEntities`, `schema.campaignSessions`, `schema.campaignObjectives`, `schema.attachments`, `schema.domainEvents` from `src/backend/db/schema.ts`; `db` from `src/backend/db/client.ts`.
- Produces: nothing consumed by later tasks; this is the last task in the plan.

- [ ] **Step 1: Fix the pre-existing `tests/setup.ts` cleanup gaps**

Current `tests/setup.ts` (lines 1-43):

```typescript
import { beforeEach } from "vitest";
import { db } from "../src/backend/db/client.js";
import { campaignMessageReads, campaignMessages } from "../src/backend/db/messagingSchema.js";
import { playerPortalResources, playerPortalStates } from "../src/backend/db/playerPortalSchema.js";
import * as schema from "../src/backend/db/schema.js";

async function cleanDatabase() {
  try {
    await db.delete(campaignMessageReads);
    await db.delete(campaignMessages);
    await db.delete(schema.activityFeed);
    await db.delete(schema.attachments);
    await db.delete(schema.campaignInvitationAcceptances);
    await db.delete(schema.campaignInvitations);
    await db.delete(schema.campaignNotes);
    await db.delete(schema.playerProposals);
    await db.delete(schema.campaignScenes);
    await db.delete(schema.campaignSessions);
    await db.delete(schema.liveTables);
    await db.delete(playerPortalResources);
    await db.delete(playerPortalStates);
    await db.delete(schema.visibilityGrants);
    await db.delete(schema.campaignRelations);
    await db.delete(schema.campaignFacts);
    await db.delete(schema.campaignEntities);
    await db.delete(schema.campaignSnapshots);
    await db.delete(schema.commandIndex);
    await db.delete(schema.domainEvents);
    await db.delete(schema.playerProfiles);
    await db.delete(schema.dmProfiles);
    await db.delete(schema.campaignMemberships);
    await db.delete(schema.campaigns);
    await db.delete(schema.workspaceMemberships);
    await db.delete(schema.workspaces);
    await db.delete(schema.authSessions);
    await db.delete(schema.userPreferences);
    await db.delete(schema.recoveryCodes);
    await db.delete(schema.passwordResetTokens);
    await db.delete(schema.users);
  } catch {
    // ignore clean errors
  }
}

beforeEach(async () => {
  await cleanDatabase();
});
```

Replace it with:

```typescript
import { beforeEach } from "vitest";
import { db } from "../src/backend/db/client.js";
import { campaignMessageReads, campaignMessages } from "../src/backend/db/messagingSchema.js";
import { playerPortalResources, playerPortalStates } from "../src/backend/db/playerPortalSchema.js";
import * as schema from "../src/backend/db/schema.js";

async function cleanDatabase() {
  await db.delete(campaignMessageReads);
  await db.delete(campaignMessages);
  await db.delete(schema.activityFeed);
  await db.delete(schema.attachments);
  await db.delete(schema.campaignInvitationAcceptances);
  await db.delete(schema.campaignInvitations);
  await db.delete(schema.campaignNotes);
  await db.delete(schema.playerProposals);
  await db.delete(schema.campaignObjectives);
  await db.delete(schema.campaignClues);
  await db.delete(schema.characters);
  await db.delete(schema.campaignScenes);
  await db.delete(schema.campaignSessions);
  await db.delete(schema.liveTables);
  await db.delete(playerPortalResources);
  await db.delete(playerPortalStates);
  await db.delete(schema.visibilityGrants);
  await db.delete(schema.campaignRelations);
  await db.delete(schema.campaignFacts);
  await db.delete(schema.campaignEntities);
  await db.delete(schema.campaignSnapshots);
  await db.delete(schema.commandIndex);
  await db.delete(schema.domainEvents);
  await db.delete(schema.playerProfiles);
  await db.delete(schema.dmProfiles);
  await db.delete(schema.campaignMemberships);
  await db.delete(schema.campaigns);
  await db.delete(schema.workspaceMemberships);
  await db.delete(schema.workspaces);
  await db.delete(schema.authSessions);
  await db.delete(schema.userPreferences);
  await db.delete(schema.recoveryCodes);
  await db.delete(schema.passwordResetTokens);
  await db.delete(schema.users);
}

beforeEach(async () => {
  await cleanDatabase();
});
```

Two changes from the original: (1) the silent `try { ... } catch { /* ignore */ }` is gone — a cleanup failure now throws and fails the test run loudly, instead of leaving the next test to run against a dirty database and fail with a confusing, unrelated-looking error (this is exactly what happened during the PR #116 review session: `campaign_objectives`/`campaign_clues` rows left over from a previous run caused an unrelated-looking unique-constraint failure two tests later); (2) `campaignObjectives`, `campaignClues`, `characters` are now explicitly deleted. They *would* also get cleaned automatically once `db.delete(schema.campaigns)` cascades to them (Tasks 2-4 add exactly that FK), but keep the explicit deletes anyway: `cleanDatabase` is deliberately exhaustive and self-documenting table-by-table, matching every other table in this function, and explicit deletes remain correct as a safety net even if a future change ever narrows `ON DELETE CASCADE` to `RESTRICT` for one of these tables.

Do **not** attempt the "delete only the roots and let cascade handle the rest" simplification in this task — `dm_profiles`, `users`, `workspaces` etc. are not campaign-owned and still need their own explicit deletes, and re-deriving a minimal correct delete order from the new cascade graph is a separate, riskier refactor with its own review; it's out of scope here.

- [ ] **Step 2: Write the cascade-behavior integration test**

```typescript
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";

const ids = {
  owner: "usr_cascade_owner",
  workspace: "wks_cascade",
  campaign: "cmp_cascade",
};

async function seedCampaignWithChildren(): Promise<void> {
  await db.insert(schema.users).values({
    userId: ids.owner,
    emailNormalized: "cascade-owner@example.test",
    emailHash: "cascade-owner",
    displayName: "Owner",
    passwordHash: "hash",
    passwordSalt: "salt",
  });
  await db.insert(schema.workspaces).values({ workspaceId: ids.workspace, name: "Cascade workspace", ownerId: ids.owner });
  await db.insert(schema.campaigns).values({ campaignId: ids.campaign, title: "Cascade campaign", workspaceId: ids.workspace, ownerId: ids.owner });

  await db.insert(schema.domainEvents).values({
    campaignId: ids.campaign,
    sequence: 1,
    eventId: "evt_cascade_1",
    type: "CampaignCreated",
    payload: {},
    occurredAt: new Date().toISOString(),
    actorId: ids.owner,
    hash: "hash1",
    schemaVersion: 1,
  });
  await db.insert(schema.campaignEntities).values({
    campaignId: ids.campaign,
    entityId: "ent_cascade_1",
    type: "npc",
    name: "Cascade NPC",
  });
  await db.insert(schema.campaignSessions).values({
    campaignId: ids.campaign,
    sessionId: "sess_cascade_1",
    number: 1,
    title: "Session one",
  });
  await db.insert(schema.campaignObjectives).values({
    campaignId: ids.campaign,
    objectiveId: "obj_cascade_1",
    title: "Cascade objective",
  });
  await db.insert(schema.attachments).values({
    campaignId: ids.campaign,
    attachmentId: "att_cascade_1",
    name: "map.png",
    path: "/attachments/map.png",
    mimeType: "image/png",
    size: 1024,
  });
}

describe("campaign ownership cascade delete", () => {
  it("removes rows from a representative table in each group when the campaign is deleted", async () => {
    // This is a smoke test, not exhaustive proof: it confirms cascade actually
    // fires end-to-end for one table per migration group (domain_events from
    // Group A, campaign_sessions/campaign_objectives from Group B, attachments
    // from Group C, plus campaign_entities). Full coverage across all 16
    // tables — including that every FK specifically uses CASCADE and not some
    // other delete_rule — is asserted by campaignOwnershipFkAudit.integration.test.ts.
    await seedCampaignWithChildren();

    await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, ids.campaign));

    const [events, entities, sessions, objectives, attachments] = await Promise.all([
      db.select().from(schema.domainEvents).where(eq(schema.domainEvents.campaignId, ids.campaign)),
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, ids.campaign)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, ids.campaign)),
      db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, ids.campaign)),
      db.select().from(schema.attachments).where(eq(schema.attachments.campaignId, ids.campaign)),
    ]);

    expect(events).toHaveLength(0);
    expect(entities).toHaveLength(0);
    expect(sessions).toHaveLength(0);
    expect(objectives).toHaveLength(0);
    expect(attachments).toHaveLength(0);
  });

  it("rejects inserting a campaign-owned row for a campaign that does not exist", async () => {
    await expect(db.insert(schema.campaignEntities).values({
      campaignId: "cmp_does_not_exist",
      entityId: "ent_orphan",
      type: "npc",
      name: "Orphan NPC",
    })).rejects.toThrow();
  });
});
```

- [ ] **Step 3: Run the new test**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipCascade.integration.test.ts`
Expected: 2 passing.

- [ ] **Step 4: Run the full backend integration suite**

Run: `DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend`

Expected: **the entire suite is green.** If any test fails, do not assume it's pre-existing — prove it, in this order. By this point Tasks 1-4 are already committed (per their own commit steps), so there's nothing left to `git stash` for those changes — compare against the pre-plan commit in an isolated worktree instead:

1. Note the commit this plan started from (the tip of `agent/harden-integrity-authorization` before Task 1's commit — `git log --oneline` to find it, or whatever commit hash you recorded when starting this plan).
2. `git worktree add /tmp/campaign-fk-plan-base <that commit hash>` — creates an isolated checkout at the pre-plan state without touching your current working tree or its uncommitted Task 5 changes.
3. In that worktree, run the same failing test file against the same database (or point it at a freshly migrated disposable database if the schema differences make sharing one unsafe — the pre-plan worktree doesn't have Tasks 2-4's migrations, so it needs a database state that matches, i.e. don't run it against a database that already has migrations `0010`-`0012` applied).
4. If it fails identically there, it's confirmed pre-existing and out of this plan's scope — note the file name and the exact failure in the PR description with this worktree-based evidence, and continue. Do not add a blanket "this file is expected to fail" note without that evidence attached, and do not silently skip or delete the failing test.
5. If it does *not* fail in the pre-plan worktree, treat it as a real regression introduced by this plan — stop and fix it before continuing.
6. `git worktree remove /tmp/campaign-fk-plan-base` when done.

(At the time this plan was written, `tests/backend/campaignMessagingWebRoutes.integration.test.ts` failed on `main` and on this branch identically, confirmed with exactly the stash procedure above during the PR #116 review — see `docs/pr-116-review.md` in this repo for that evidence. That messaging system has since had further changes, so re-verify it fresh with the procedure above rather than trusting that note.)

- [ ] **Step 5: Typecheck, build, and E2E smoke check**

Run: `npm run typecheck:all`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

Run: `npm run test:e2e`
Expected: passes. This is a broad smoke check, not targeted at this plan's changes specifically (Playwright drives the UI, not the schema directly) — if it fails, check whether the failure is pre-existing using the same stash procedure as Step 4 before treating it as caused by this plan.

- [ ] **Step 6: Commit**

```bash
git add tests/backend/campaignOwnershipCascade.integration.test.ts tests/setup.ts
git commit -m "test: verify campaign delete cascades to owned tables; fix silent cleanup failures and stale gaps in tests/setup.ts"
```

---

## Self-Review Notes

- **Spec coverage**: this plan implements exactly "Bloque 1 — propiedad de campaña" from the proposal (point 1, plus the point-10 structural audit scoped to campaign ownership, plus the orphan-visibility and cascade-verification requests raised in review). Points 2-9 (compound FKs for internal references, bridge tables for JSON id arrays, `CASCADE`/`RESTRICT`/`SET NULL` policy per relationship, unified ID strategy, user-player business rules) are Blocks 2-5 of the proposal and are intentionally out of scope for this plan — each is a separate plan given they touch different invariants and carry different risk profiles (Block 2 in particular repeats the compound-FK backfill pattern from PR #116, which already broke default entity creation once when a migration constraint outran a write path — it deserves its own plan and its own careful review of every write path, not a shared plan with Block 1).
- **Placeholder scan**: no TBD/TODO markers; every SQL and TypeScript block is complete and copy-pasteable.
- **Type consistency**: `campaigns.campaignId` (`src/backend/db/schema.ts:60` on this branch) is the referenced column throughout; every `.references()` call points at it by the same name. Table/column names in the audit test (`campaign_id`, `campaigns`) match the actual Postgres identifiers Drizzle generates (snake_case), not the TS camelCase property names — verified against the existing migrations' quoting style.
- **Corrections applied after first review**: (1) `player_proposals` moved from "pending" to "already compliant" — it was fixed by `0009_player_visibility_integrity.sql`, and the original draft's Group C migration would have failed on `ADD CONSTRAINT fk_player_proposals_campaign` colliding with an existing constraint of the same name; (2) counts corrected from 4-already/17-pending to 7-already/16-pending after re-auditing all three schema files (`schema.ts`, `playerPortalSchema.ts`, `messagingSchema.ts`) instead of just `schema.ts` — `player_portal_states`/`player_portal_resources` were also missing from the "already compliant" list in the original draft; (3) the audit test now discovers tables dynamically via `information_schema.columns` instead of asserting against a hardcoded array, and checks `delete_rule = 'CASCADE'` via `information_schema.referential_constraints`, not just FK existence; (4) each migration task gets an explicit orphan-count diagnostic step with an instruction to get sign-off before destroying non-zero rows on a real database; (5) `tests/setup.ts`'s silent `catch { /* ignore */ }` is removed as part of Task 5; (6) migrations are described as "orphan-cleanup is safely re-runnable, `ADD CONSTRAINT` is not" rather than "idempotent"; (7) typecheck steps switched from `npx tsc --noEmit -p .` to the repo's own `npm run typecheck:all`, and Task 5 adds `npm run build` and `npm run test:e2e`.
- **Corrections applied after second review**: (8) the count-floor assertion in Task 1's PostgreSQL audit test was checking `>= 23 - 1 = 22` against a list that had *already* had `"campaigns"` filtered out — off-by-one, fixed to `>= 23` (the constant is now named `BASELINE_CAMPAIGN_OWNED_TABLE_COUNT`, verified by recounting `pgTable(` blocks across `schema.ts` (21, including `campaigns` itself), `playerPortalSchema.ts` (2), and `messagingSchema.ts` (1) = 24 raw rows with a `campaign_id` column, minus 1 for `campaigns` = 23); (9) the PostgreSQL-side FK lookup switched from `LIMIT 1` to fetching every matching constraint and flagging duplicates as a distinct violation, instead of silently picking one nondeterministically; (10) added a second, Drizzle-side `describe` block using `getTableConfig` from `drizzle-orm/pg-core` (verified against the installed version's `foreign-keys.d.ts`/`utils.d.ts` — `ForeignKey.reference()` returns `{ foreignTable, columns, foreignColumns }`, `ForeignKey.onDelete` is a plain string) so a constraint added straight to a migration without a matching `schema.ts` change fails this test too, not just a future manual review; (11) Task 5 Step 4's pre-existing-failure verification switched from `git stash` to a `git worktree` against the pre-plan commit hash, since by Task 5 the schema/migration changes from Tasks 1-4 are already committed and there is nothing left in the working tree to stash; (12) the transactional-migration note in Global Constraints now explains that step-by-step execution runs `db:migrate` once per task (one migration pending, one commit) while only a from-scratch deployment with all three migrations pending at once gets the single-transaction-across-all-three behavior; (13) the "orphan counts verified zero" commit message wording is now conditional on the diagnostic query in Step 1 actually returning zero — a nonzero result requires recording the real counts and the explicit approval instead.
- **Corrections applied after third review**: (14) the Drizzle-side companion test (`findCampaignOwnershipReferences`, previously `hasCampaignOwnershipReference`) switched from `.some(...)` returning a boolean to `.filter(...)` asserted with `toHaveLength(1)`, so a table with two campaign-ownership FKs (one correct, one stray duplicate) or a composite FK that merely includes `campaign_id` among other columns fails instead of passing — mirrors the same exactly-one requirement already enforced on the PostgreSQL side; (15) the `information_schema` joins in `findCampaignForeignKeys` now pin `constraint_catalog`/`constraint_schema`/`constraint_name` (and `table_name` on the `key_column_usage` join) instead of joining on `constraint_name` + `table_schema` alone — `constraint_name` is only unique per schema+table in Postgres, not globally, so the looser join could in principle match a same-named constraint on an unrelated table; (16) Task 1 Step 4 now says to commit locally but hold off pushing the initially-red test until Task 4's commit lands, since this repo may run CI/automation on every push; (17) every "diagnose orphan counts" step now explicitly separates the local/CI database (agent runs this now) from the deployed database (Neon — a separate, human-gated pre-deploy checklist item, not something to run unsupervised against a production connection string).
- **Corrections applied after fourth review**: (18) `findCampaignOwnershipReferences` in the Drizzle-side test from correction (14) still had the same bug in a new location — it filtered candidate FKs down to only the *well-formed* ones (single-column, `campaign_id`, `onDelete === "cascade"`) before counting, so a table with one correct FK plus one malformed duplicate (`NO ACTION`, or a composite FK that happens to include `campaign_id`) would have the bad one silently dropped and still report `toHaveLength(1)` — a real false-green, not just a theoretical one. Fixed by splitting into two steps: `findCampaignOwnershipReferences` now does only the loose match (any FK pointing `campaign_id`-something at `campaigns`, `.some()` not exact-shape), and the test asserts `toHaveLength(1)` on that unfiltered set *before* separately asserting the single surviving candidate's exact shape and `onDelete` value; (19) the `BASELINE_CAMPAIGN_OWNED_TABLE_COUNT` floor check in the PostgreSQL describe block now runs against `discoveredTables` before the `CAMPAIGN_ID_FK_EXCEPTIONS` filter is applied, not after — with the exception set currently empty this made no difference, but once an exception is ever added, checking the floor post-filter would shrink the expected minimum for the wrong reason (an intentionally-excused table, not a broken discovery query) and mask a real regression in the discovery query itself.
