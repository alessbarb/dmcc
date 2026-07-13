> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

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
