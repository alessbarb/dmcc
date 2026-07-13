> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 10 — End-to-End Verification Report

Date: 2026-06-27
Branch: feature/player-portal-toolkit

---

## Verification Results

### Step 1: Focused portal tests

```
npm test -- tests/application/multiEventCommandBus.test.ts tests/projections/playerPortalProjection.test.ts tests/server/playerPortalRoutes.test.ts
```

Result: **PASS** — 3 test files, 9 tests, 0 failures.

### Step 2: Full test suite

```
npm test
```

Result: **PASS** — 23 test files, 127 tests, 0 failures. Duration ~3s.

### Step 3: Full typecheck

```
npm run typecheck:all
```

Result: **PASS** — both `tsc -p tsconfig.json --noEmit` and `tsc -p tsconfig.app.json` exited cleanly with no errors or warnings.

### Step 4: Build

```
npm run build
```

Result: **PASS** — exit code 0. Vite transformed 572 modules. One pre-existing large chunk warning (2,375 kB JS bundle) is acceptable per the brief. No new warnings introduced.

---

## Failures Found

None. All four commands passed without any code changes.

---

## Manual Smoke Test Flow (plausibility review)

The following flow is plausible based on the implemented code:

- [x] **Step 1 — DM opens campaign**: Campaign list and campaign detail routes exist in the React SPA via TanStack Router. Fastify serves the SPA and the `/api` routes.
- [x] **Step 2 — DM creates/uses player profile**: `PlayerProfile` aggregate and `CreatePlayerProfile` command are implemented in the domain and application layers. The `PlayersPage` component renders existing profiles.
- [x] **Step 3 — DM issues player token**: `IssuePlayerToken` command hashes the token before persisting; the raw token is returned once in the command response. The `PlayersPage` UI surfaces the issue-token action.
- [x] **Step 4 — Player joins portal with token**: `GET /api/portal/join?token=<raw>` authenticates via hash comparison and returns a session cookie. The `PlayerPortalPage` handles this flow.
- [x] **Step 5 — Player updates HP**: `PATCH /api/portal/live-state` accepts `{ currentHp }` and dispatches `UpdatePlayerLiveState`. `PlayerPortalProjection` reflects the change.
- [x] **Step 6 — Player creates private note and DM-visible note**: `POST /api/portal/notes` accepts `{ content, visibility: "player_only" | "dm_visible" }`. Both note types are stored on the projection; the `GET /api/portal/state` response returns only the calling player's own private notes.
- [x] **Step 7 — DM opens Players page**: `GET /api/players/:playerId/portal-state` returns the full portal state including dm_visible notes. `PlayersPage` fetches and renders this data.
- [x] **Step 8 — DM sees HP and dm_visible note only**: Server-side filtering in `playerPortalRoutes.ts` strips `player_only` notes before returning the DM view. HP is always visible to DM.
- [x] **Step 9 — Player creates structural proposal**: `POST /api/portal/proposals` dispatches `SubmitStructuralProposal`. Proposal appears in the DM review queue on the Players page.
- [x] **Step 10 — DM approves proposal**: `POST /api/players/:playerId/proposals/:proposalId/approve` dispatches `ApproveStructuralProposal`, which emits `EntityUpdated` for the linked character entity. Character metadata updates are reflected in the next projection rebuild.

---

## Final State

All 4 automated verification commands pass. No code changes were required.

No commit created (no cleanup changes made).
