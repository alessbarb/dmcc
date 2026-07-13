> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# M2 Task 5 Report

**Status:** DONE

**Commits:** `a04f668`

**Tests:** 91 passed (16 test files) — 2 new boards tests added in `tests/domain/boards.test.ts`

**TypeScript:** 1 pre-existing error in `src/server/auth.ts` (observer role type mismatch) — unrelated to this task, was present before

**What was done:**

1. **BoardsPage already used the store** — `useCampaignStore()` was already called. The only issue was the legacy `BoardsPageProps` interface enabling prop-based overrides for `campaignState`, `setSelectedEntity`, and `setCurrentPage`.

2. **Removed props interface** — Deleted `BoardsPageProps`, changed signature from `BoardsPage(props: BoardsPageProps = {})` to `BoardsPage()`. All three values now come directly from the store and local state/navigation.

3. **Wrote `tests/domain/boards.test.ts`** with 2 server-level tests:
   - Seeds a campaign with 2 quests (active/blocked), 1 clue (hidden), 2 NPCs (alive/enemy) then calls `GET /api/campaigns/:id` and asserts entities of each type are present with correct statuses.
   - Verifies archived entities have `archived: true` so the client-side board filter (`if (e.archived) return false`) works correctly.

**Concerns:** None.
