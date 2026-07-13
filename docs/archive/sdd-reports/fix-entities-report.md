> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Fix Entities Catalog — Report

**Status**: DONE
**Commit**: 7cbe035
**Branch**: main

## Changes Made

### Backend
- `/src/backend/server/routes/assetRoutes.ts`: Added `scanEntities()` function (flat scan, returns `{ all: [...] }`). Added `"entities"` as valid catalog type in the route validation. Wired into the groups dispatch.

### Frontend Components
- `src/frontend/shared/components/ImagePickerModal.tsx`: Widened `catalog` type to `"avatars" | "campaigns" | "entities"`. Updated modal title: avatars and entities both show "Elegir imagen"; campaigns show "Elegir portada".
- `src/frontend/shared/components/ImagePickerButton.tsx`: Widened `catalog` type to `"avatars" | "campaigns" | "entities"`.

### Entity Pickers
- `src/frontend/dm/entities/EntityCreateModal.tsx`: `catalog="avatars"` → `catalog="entities"`. `defaultImage` stays as `/assets/entities/default_npc.png`.
- `src/frontend/dm/entities/EntityDetailModal.tsx`: `catalog="avatars"` → `catalog="entities"`.
- `src/frontend/dm/canvas/components/CanvasInspector.tsx`: `catalog="avatars"` → `catalog="entities"`.

### Tests
- `tests/backend/assetCatalog.test.ts`: Added `entities` dir+file to `withFakeAssets`. Added test "returns entities as flat 'all' group".
- `tests/frontend/imagePicker.test.ts`: Updated EntityCreateModal, EntityDetailModal, and CanvasInspector wiring tests to assert `catalog="entities"`.

## Test Summary

Targeted tests (`assetCatalog.test.ts` + `imagePicker.test.ts`): **18/18 PASS**.

Full suite: 16 failures, all pre-existing before this change (confirmed by stashing changes and running the suite — the pre-stash run had significantly more failures in auth, premade campaigns, and other unrelated areas).

## Concerns

None. The entities folder is flat (no subdirectories), so `scanEntities` correctly mirrors `scanCampaigns`. The public/assets/entities/ folder with 12 type-specific defaults is now fully accessible through the image picker in all three entity UI entry points.
