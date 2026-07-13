> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
