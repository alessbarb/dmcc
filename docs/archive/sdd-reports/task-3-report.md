> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 3 Report: Group B — narrative content (migration 0011)

Note: this task was implemented by the controller directly, not a dispatched subagent. Two implementer subagents were dispatched (see history below, preserved for the record) and both correctly refused to proceed on a controller-relayed "user approved" message, per their instructions that only the permission system or the user's own message counts as consent for a destructive action. Since the orphan rows found in Step 1 required exactly that kind of consent, the controller obtained it directly from the user via `AskUserQuestion` and then performed the remaining steps itself rather than attempting a third relay to a subagent.

## Status: DONE

## Step 1: Orphan-count query output (local dev DB, before migration)

```
     table_name      | orphan_count
---------------------+--------------
 campaign_sessions   |            0
 campaign_scenes     |            0
 campaign_objectives |            1
 campaign_clues      |            1
 characters          |           44
```

Nonzero rows investigated directly:
- `campaign_objectives`/`campaign_clues`: 1 row each, campaign_id `cmp_visibility` — matches the fixture id used by `tests/backend/visibilityGrants.integration.test.ts`, leftover from a prior vitest run given the pre-existing `tests/setup.ts` gap (never cleaned these two tables — the exact gap Task 5 fixes).
- `characters`: 44 rows across 11 distinct campaign_ids, all premade "Oracle" template characters (`ent_tpl_oracle_pc_elowyn`, `_camus`, `_ragna`, `_silas` — "Elowyn Darkwater", "Hermano Camus", "Ragna Ironsong", "Silas el Errante"), dated 2026-07-02, from repeated past dev-server runs of the premade-campaign feature.
- `campaigns` table had 0 rows at the time of the check — all owning campaigns already deleted, orphans survived only because no cascade FK existed yet.

User was shown this evidence directly via `AskUserQuestion` ("¿Apruebas borrar estas 46 filas huérfanas...?") and selected "Sí, borrar (Recomendado)". Proceeded only after that direct response.

## Step 2: schema.ts changes

Added `.references(() => campaigns.campaignId, { onDelete: "cascade" })` to the `campaignId` column of: `campaignSessions`, `campaignScenes`, `campaignObjectives`, `campaignClues`, `characters` — exactly per the brief's before/after blocks, each anchored on its unique `export const` line.

## Step 3: Migration file

Created `src/backend/db/migrations/0011_campaign_ownership_narrative.sql` — content is byte-for-byte the brief's Step 3 SQL block: 5 orphan-cleanup `DELETE ... WHERE NOT EXISTS` statements followed by 5 `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ... ON DELETE CASCADE` statements, `--> statement-breakpoint` separators throughout.

## Step 4: Journal entry

Added `{ "idx": 11, "version": "7", "when": 1783922400000, "tag": "0011_campaign_ownership_narrative", "breakpoints": true }` as the new last element in `_journal.json`'s `entries` array, comma added after the `0010_campaign_ownership_core` entry.

## Step 5: Migration run + audit test

`npm run db:migrate` output: `Migrations ran successfully!`

Post-migration orphan verification: `characters: 0, campaign_objectives: 0, campaign_clues: 0`.

Audit test run (`campaignOwnershipFkAudit.integration.test.ts`): 25 passed, 6 failed.
- PostgreSQL block: `violations` now lists exactly the 5 Group C tables (`activity_feed`, `attachments`, `campaign_invitations`, `campaign_notes`, `live_tables`) — matches the plan's expected transition exactly.
- Drizzle block: the same 5 Group C entries fail (`toHaveLength(1)` got 0), all others (including the 5 Group B tables from this task) pass.

## Step 6: Typecheck

`npm run typecheck:all` — clean, 0 errors (both `tsconfig.node.json` and `tsconfig.app.json`).

## Step 7: Commit

Commit `abf88a0` — "feat: add campaign FK to narrative content tables", with the real-counts commit message (not the generic "verified zero" wording, since Step 1 found nonzero orphans) documenting the approved cleanup and the direct user confirmation.

## Files changed

- `src/backend/db/schema.ts` (5 `.references()` additions)
- `src/backend/db/migrations/0011_campaign_ownership_narrative.sql` (new)
- `src/backend/db/migrations/meta/_journal.json` (1 new entry)

## Self-review

- All 5 tables have both the `schema.ts` reference and the matching migration constraint — cross-checked, same 5-table set on both sides.
- Migration SQL matches the brief exactly, orphan DELETE before ADD CONSTRAINT for every table.
- `_journal.json` is valid JSON, correct comma placement, verified by re-reading the file after edit.
- Audit test transition matches the plan's expected 10 → 5 exactly.

## Concerns

None regarding the implementation itself. Process note: this task deviated from the plan's standard "dispatch implementer subagent" flow because of the destructive-action consent boundary described above — flagging this explicitly for the final whole-branch review and for whoever reads this ledger later, since it's a deviation from how Tasks 1, 2, 4, 5 were/will be executed.

---

## Appendix: prior subagent attempts (preserved for the record)

Two implementer subagents were dispatched for this task before the controller took over. Both correctly identified nonzero orphan rows at Step 1 and correctly refused to proceed on controller-relayed approval (first a plain assertion of investigation, then a claimed verbatim relay of a direct `AskUserQuestion` response) — their stated reasoning was that only the permission system or the user's own message in their transcript constitutes consent for a destructive action, and an agent-relayed message cannot close that gate no matter how detailed or plausible. This is the correct behavior and is why the controller performed the remaining steps directly rather than attempting a third subagent relay.
