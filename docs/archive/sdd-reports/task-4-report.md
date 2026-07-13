> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 4 Report — Group C: collaboration & infra (migration 0012)

## Step 1: Orphan diagnosis

Ran against local dev DB (docker container `dmcc-postgres`, since no local `psql` binary was on PATH, used `docker exec dmcc-postgres psql -U dmcc -d dmcc -c "..."` with the exact query from the brief):

```
      table_name      | orphan_count
----------------------+--------------
 live_tables          |            0
 campaign_invitations |            0
 campaign_notes       |            0
 activity_feed        |            0
 attachments          |            0
(5 rows)
```

All zero, as the controller's earlier check indicated. No BLOCKED condition; proceeded per plan.

## Step 2: schema.ts edits

Added `.references(() => campaigns.campaignId, { onDelete: "cascade" })` to the `campaignId` column of exactly 5 tables:

- `liveTables` (`export const liveTables = pgTable("live_tables", ...)`)
- `campaignInvitations` (`export const campaignInvitations = pgTable("campaign_invitations", ...)`)
- `campaignNotes` (`export const campaignNotes = pgTable("campaign_notes", ...)`)
- `activityFeed` (`export const activityFeed = pgTable("activity_feed", ...)`)
- `attachments` (`export const attachments = pgTable("attachments", ...)`)

`playerProposals` was confirmed untouched — it already carries `.references(() => campaigns.campaignId, { onDelete: "cascade" })` on its `campaignId` column from `0009_player_visibility_integrity.sql` (PR #116), and the diff shows no change to that table's block.

Verified with `git diff -U1 -- src/backend/db/schema.ts`: exactly 5 hunks, each anchored to the correct `export const` table.

## Step 3: Migration file

Created `src/backend/db/migrations/0012_campaign_ownership_collaboration.sql` with the exact SQL from the brief: 5 orphan-delete statements (one per table) each followed by `--> statement-breakpoint`, then 5 `ADD CONSTRAINT ... FOREIGN KEY ... ON DELETE CASCADE` statements, each followed by `--> statement-breakpoint`. Comment block references `player_proposals` being intentionally absent (already has `fk_player_proposals_campaign` from `0009_player_visibility_integrity.sql`).

## Step 4: Journal entry

Appended to `src/backend/db/migrations/meta/_journal.json`:

```json
{ "idx": 12, "version": "7", "when": 1783926000000, "tag": "0012_campaign_ownership_collaboration", "breakpoints": true }
```

Comma added after the `0011_campaign_ownership_narrative` entry. Validated with `python3 json.load` — valid JSON.

## Step 5: Migration run + audit test

`DATABASE_URL=... npx dotenv -e .env -- npm run db:migrate`:

```
Running migrations...
Migrations ran successfully!
```

`DATABASE_URL=... npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipFkAudit.integration.test.ts --reporter=verbose`:

```
Test Files  1 passed (1)
     Tests  31 passed (31)
```

All 31 tests pass:
- PostgreSQL describe block: `every table with a campaign_id column has exactly one ON DELETE CASCADE FK to campaigns` passes (violations == []), plus 7 "already compliant before this plan runs" tests.
- Drizzle schema describe block: all 23 `it.each` table entries pass, including the 5 Group C tables added this task (`live_tables`, `campaign_invitations`, `campaign_notes`, `activity_feed`, `attachments`).

Before this task, the 5 Group C tables would have failed the Drizzle-schema `it.each` checks (no `.references()` present). After this task, fully green — no remaining gaps; Group A, B, C are all covered. This is the final group per the plan.

## Step 6: Typecheck

`npm run typecheck:all`:

```
> npm run typecheck && npm run typecheck:app
> tsc -p tsconfig.node.json --noEmit
> tsc -p tsconfig.app.json --noEmit
```

No errors.

## Step 7: Commit

Commit `6a80422` — "feat: add campaign FK to collaboration and infra tables" (not pushed).

Files changed:
- `src/backend/db/schema.ts` (5 insertions/5 deletions — the 5 `.references()` additions)
- `src/backend/db/migrations/0012_campaign_ownership_collaboration.sql` (new file)
- `src/backend/db/migrations/meta/_journal.json` (2 insertions/1 deletion — new entry + comma)

## Self-review

- All 5 Group C tables got both `.references()` in schema.ts AND the matching migration `ADD CONSTRAINT`: yes, verified 1:1 correspondence (`live_tables`/`fk_live_tables_campaign`, `campaign_invitations`/`fk_campaign_invitations_campaign`, `campaign_notes`/`fk_campaign_notes_campaign`, `activity_feed`/`fk_activity_feed_campaign`, `attachments`/`fk_attachments_campaign`).
- `player_proposals` untouched: confirmed via diff — no hunk touches that table's block; it retains its prior FK from migration 0009.
- Migration SQL matches the brief exactly: yes, copied verbatim; orphan DELETE precedes ADD CONSTRAINT for every table.
- `_journal.json` valid JSON, correct comma placement: yes, validated with `python3 json.load`.
- Audit test fully green: yes, 0 violations, all 23 Drizzle `it.each` entries pass (31/31 total tests pass).

## Concerns

None. Local dev DB read all zero orphans (matching the controller's earlier check), migration applied cleanly, audit test is fully green, typecheck is clean. Note: no `psql` binary was available locally, so the Step 1 diagnostic query was run via `docker exec dmcc-postgres psql` against the same container the app's `DATABASE_URL` points to — functionally equivalent, just a different client invocation path than literally running `psql <connection-string>`.

Note: this file previously contained a stale, unrelated report ("Wire ImagePickerButton into IdentityEditor") from a different plan that reused this same filename; it has been overwritten with this task's actual report.
