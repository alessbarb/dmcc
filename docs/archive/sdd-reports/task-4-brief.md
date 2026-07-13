> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
