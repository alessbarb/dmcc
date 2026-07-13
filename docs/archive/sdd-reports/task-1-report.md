> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 1 Report: Structural FK-audit test (RED)

## Summary

Successfully created the campaign ownership foreign key audit test file as specified in the task brief. The test is designed to be RED — it correctly identifies 16 tables that lack the required `campaign_id -> campaigns(campaign_id) ON DELETE CASCADE` foreign key constraint. This is the intended state for this task, and later tasks will add the actual migrations to make this test pass.

## Implementation

### File Created
- **Path**: `tests/backend/campaignOwnershipFkAudit.integration.test.ts`
- **Lines**: 185 (exact match to brief specification)
- **Imports**: Both PostgreSQL information_schema queries and Drizzle schema inspections

### Code Structure

The test file contains:

1. **PostgreSQL Audit Block** (`campaign ownership FK audit — PostgreSQL`):
   - Helper function `findTablesWithCampaignIdColumn()`: discovers all tables in the public schema with a `campaign_id` column (excluding the `campaigns` table itself)
   - Helper function `findCampaignForeignKeys()`: queries PostgreSQL's `information_schema` to find foreign keys from `campaign_id` to `campaigns(campaign_id)` with CASCADE delete rule
   - Main test: "every table with a campaign_id column has exactly one ON DELETE CASCADE FK to campaigns" — dynamically discovers violations and reports them
   - Regression tests: `.each()` tests for 7 already-compliant tables (player_profiles, campaign_memberships, visibility_grants, player_proposals, player_portal_states, player_portal_resources, campaign_messages)

2. **Drizzle Schema Audit Block** (`campaign ownership FK audit — Drizzle schema`):
   - `CAMPAIGN_OWNED_DRIZZLE_TABLES` constant: lists 23 tables (7 already compliant + 16 pending) whose schema must declare the campaign FK
   - Helper function `findCampaignOwnershipReferences()`: uses `getTableConfig()` to inspect Drizzle schema definitions
   - Parameterized test: validates each table declares exactly one simple campaign_id -> campaigns(campaign_id) ON DELETE CASCADE reference

### Test Execution

**Command**:
```bash
DATABASE_URL="postgresql://dmcc:dmcc_password@127.0.0.1:5432/dmcc" npx dotenv -e .env -- npx vitest run tests/backend/campaignOwnershipFkAudit.integration.test.ts
```

**Output Summary** (Exit code 1 — expected RED state):
- **Total tests**: 31
- **Passed**: 14
- **Failed**: 17

**PostgreSQL Block**:
- ❌ Main enforcement test: FAIL (violations array correctly lists 16 tables)
- ✅ 7 regression tests: all PASS

**Drizzle Schema Block**:
- ❌ 16 parameterized tests: FAIL (findCampaignOwnershipReferences returns [] for each)
- ✅ 7 parameterized tests: all PASS

**Violations Discovered** (PostgreSQL block):
```
1. activity_feed: no FK from campaign_id to campaigns(campaign_id)
2. attachments: no FK from campaign_id to campaigns(campaign_id)
3. campaign_clues: no FK from campaign_id to campaigns(campaign_id)
4. campaign_entities: no FK from campaign_id to campaigns(campaign_id)
5. campaign_facts: no FK from campaign_id to campaigns(campaign_id)
6. campaign_invitations: no FK from campaign_id to campaigns(campaign_id)
7. campaign_notes: no FK from campaign_id to campaigns(campaign_id)
8. campaign_objectives: no FK from campaign_id to campaigns(campaign_id)
9. campaign_relations: no FK from campaign_id to campaigns(campaign_id)
10. campaign_scenes: no FK from campaign_id to campaigns(campaign_id)
11. campaign_sessions: no FK from campaign_id to campaigns(campaign_id)
12. campaign_snapshots: no FK from campaign_id to campaigns(campaign_id)
13. characters: no FK from campaign_id to campaigns(campaign_id)
14. command_index: no FK from campaign_id to campaigns(campaign_id)
15. domain_events: no FK from campaign_id to campaigns(campaign_id)
16. live_tables: no FK from campaign_id to campaigns(campaign_id)
```

**Already-Compliant Tables** (all pass in both blocks):
✅ player_profiles
✅ campaign_memberships
✅ visibility_grants
✅ player_proposals
✅ player_portal_states
✅ player_portal_resources
✅ campaign_messages

### TypeCheck Verification

```bash
npm run typecheck:all
```

**Result**: ✅ CLEAN (0 errors)
- TypeScript compilation for both Node.js and app configurations passed without errors
- No new type errors introduced by the test file

### Commit

```
Commit SHA: 60ef2c0
Message: test: audit campaign_id FK coverage across every campaign-owned table
Branch: agent/harden-integrity-authorization
```

The commit contains only the new test file (185 insertions, 0 deletions to existing files).

## Self-Review Findings

✅ **File structure**: Matches brief exactly — both PostgreSQL and Drizzle describe blocks in single file, proper import section with all required modules
✅ **Exception set**: CAMPAIGN_ID_FK_EXCEPTIONS properly initialized as empty Set
✅ **Baseline constant**: BASELINE_CAMPAIGN_OWNED_TABLE_COUNT = 23 (7 compliant + 16 pending)
✅ **Violation count**: Exactly 16 tables without FK, matching brief specification
✅ **No additions**: Test file contains only code from brief, no extra tests or exports
✅ **Test output**: Clean execution, no stray console warnings
✅ **Compliant table list**: All 7 expected tables pass both describe blocks
✅ **Pending table inventory**: All 16 expected tables fail with consistent "no FK" messages

## Expected Next Steps

This test is intentionally RED. Tasks 2–4 will add the following:
- **Task 2** (Group A): domain_events, command_index, campaign_snapshots, campaign_entities, campaign_facts, campaign_relations, campaign_sessions
- **Task 3** (Group B): campaign_scenes, campaign_objectives, campaign_clues, characters, live_tables
- **Task 4** (Group C): campaign_invitations, campaign_notes, activity_feed, attachments

Each task will:
1. Create a migration to add the FK constraint in PostgreSQL
2. Update the corresponding Drizzle schema to declare `.references(campaigns.campaign_id).onDelete("cascade")`

Once all four tasks' commits land, this test will turn GREEN.

## Concerns

None. The test executes correctly, fails at exactly the expected 16 tables, passes the 7 already-compliant baseline tests, introduces no TypeScript errors, and matches the brief specification precisely. The RED state is the correct, intended outcome for this task.

---

**Report Generated**: 2026-07-13
**Status**: DONE — Test file created and committed, RED failure confirmed and verified.
