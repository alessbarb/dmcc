> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# M2 Task 1 Report — Tags

**Status:** DONE

**Commits:** `9b47f27`

**Tests:** 86 passed (1 new: `tests/domain/tags.test.ts` — creates tag + lists it back)

**What was done:**

1. `src/application/commands.ts` — Added `CreateTag`, `AddTagToEntity`, `RemoveTagFromEntity` to `Command` union
2. `src/application/commandBus.ts` — Wired all three new command cases
3. `src/projections/campaignProjection.ts` — No change needed; `TagCreated` handler already existed (lines 330-332)
4. `src/server/routes/tagRoutes.ts` — Created with `POST /api/campaigns/:campaignId/tags` (201 + tagId) and `GET /api/campaigns/:campaignId/tags`
5. `src/server/createServer.ts` — Registered `registerTagRoutes`
6. `src/app/stores/campaignStore.ts` — Added `createTag` action (uses `fetchWithVault` which auto-injects DM token)

**Fix vs brief:** The brief's route code used `result.event.payload.id` but `executeCommand` returns `CampaignProjection`, not `CommandResult`. Fixed by pre-generating `tagId` with `createId("tag")` before the command and returning it directly.

**Concerns:** None.

## Fix: removed out-of-scope deleteCampaign

**Commit:** `4713fb8`

**Tests:** 86 passed

**Summary:** Task 1 accidentally included a `deleteCampaign` action in `campaignStore.ts` (interface + implementation) that was not requested and belongs to a different task. Removed:
- `deleteCampaign` from `CampaignStateStore` interface in `campaignStore.ts`
- Entire `deleteCampaign` implementation in the store
- `deleteCampaign` destructuring from `App.tsx` and prop passed to `SettingsPage`
- `deleteCampaign` prop from `SettingsPageProps` interface
- Entire "Zona peligrosa" (danger zone) UI section in `SettingsPage`
- Unused `Trash2` icon import from `SettingsPage`

All tests pass, TypeScript compiles cleanly.
