> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 2 Report: Group A — event-sourcing & core read models (migration 0010)

## Status: DONE

## Step 1: Orphan-count query output (local dev DB)

```
     table_name     | orphan_count
--------------------+--------------
 domain_events      |            0
 command_index      |            0
 campaign_snapshots |            0
 campaign_entities  |            0
 campaign_facts     |            0
 campaign_relations |            0
(6 rows)
```

All zero — no cleanup approval needed. This does not attest to the deployed
(Neon) database; that check remains human-gated and belongs in the PR
description as a pre-deploy checklist item.

## What was implemented

1. `src/backend/db/schema.ts` — added
   `.references(() => campaigns.campaignId, { onDelete: "cascade" })` to the
   `campaignId` column of the six Group A tables: `domainEvents`,
   `commandIndex`, `campaignSnapshots`, `campaignEntities`, `campaignFacts`,
   `campaignRelations`. Each edit was anchored on the table's `export const`
   line per the brief to avoid ambiguity with the duplicated bare
   `campaignId` line pattern elsewhere in the file.
2. `src/backend/db/migrations/0010_campaign_ownership_core.sql` — created
   verbatim from the brief: 6 orphan-cleanup `DELETE` statements (each
   separated by `--> statement-breakpoint`) followed by 6
   `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ... ON DELETE CASCADE`
   statements, also `--> statement-breakpoint`-separated.
3. `src/backend/db/migrations/meta/_journal.json` — appended
   `{ "idx": 10, "version": "7", "when": 1783918800000, "tag": "0010_campaign_ownership_core", "breakpoints": true }`
   as the new last element, with a comma added after the `0009_...` entry.

## Migration run output

```
> dotenv -e .env -- tsx src/backend/db/migrate.ts
Running migrations...
Migrations ran successfully!
```

## Audit test: before/after

Before this task (per Task 1's baseline): 16 tables failing in both the
PostgreSQL block and the Drizzle-schema block.

After migration 0010:

- PostgreSQL block ("every table with a campaign_id column has exactly one
  ON DELETE CASCADE FK to campaigns") — `violations` now lists exactly 10
  tables:
  `activity_feed`, `attachments`, `campaign_clues`, `campaign_invitations`,
  `campaign_notes`, `campaign_objectives`, `campaign_scenes`,
  `campaign_sessions`, `characters`, `live_tables`.
  This matches the expected Group B + Group C remainder exactly.
- Drizzle-schema block — the 6 Group A per-table tests now PASS
  (`domain_events`, `command_index`, `campaign_snapshots`,
  `campaign_entities`, `campaign_facts`, `campaign_relations` are absent
  from the failure list); the 10 Group B/C per-table tests still FAIL as
  expected.
- Test run summary: `Tests 11 failed | 20 passed (31)` — i.e. 10 Group B/C
  per-table tests + 1 aggregate PostgreSQL-block test failing, all other
  ("already compliant") `it.each` tests passing.

## Typecheck

```
> npm run typecheck && npm run typecheck:app
> tsc -p tsconfig.node.json --noEmit
> tsc -p tsconfig.app.json --noEmit
```
No errors (0 errors, both projects).

## Files changed

- `src/backend/db/schema.ts` (modified — 6 `.references()` additions)
- `src/backend/db/migrations/0010_campaign_ownership_core.sql` (created)
- `src/backend/db/migrations/meta/_journal.json` (modified — appended idx 10 entry)

Commit: `ed6e345` — "feat: add campaign FK to event-sourcing and core read-model tables"

## Self-review

- All 6 tables confirmed to have both the `schema.ts` `.references()` call
  AND the matching migration `ADD CONSTRAINT` — cross-checked against the
  brief's before/after blocks and the migration SQL, 1:1.
- Migration SQL matches the brief exactly, including all
  `--> statement-breakpoint` markers (12 statements: 6 DELETE + 6 ALTER TABLE).
- Journal entry is syntactically valid JSON — comma added after the 0009
  entry, new entry is the last element in the array, verified by successful
  `db:migrate` run (which parses this file).
- Audit test transitioned exactly as expected: 16 → 10 violations in the
  PostgreSQL block; the 6 Group A Drizzle-schema tests flipped from FAIL to
  PASS, the 10 Group B/C ones remain FAIL (untouched, as intended — those
  are Task 3/4's responsibility).

## Concerns

None. Orphan counts were verified zero locally before migrating, matching
the brief's gate condition, so the "verified zero" commit wording was used
unmodified. Deployed-database (Neon) orphan verification remains an
explicit human-gated pre-deploy step, not performed here, consistent with
the brief's instructions.

Note: this file previously contained stale reports from unrelated tasks
(ImagePickerModal, Oracle Entity Gap, DM Character Assignment UI) from prior
sessions reusing this filename; those have been replaced with this task's
report.
