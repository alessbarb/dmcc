> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 6 Report: Wire ImagePickerButton into EntityCreateModal

## Status
✅ COMPLETE

## Commit
`047a1a8` — feat(entities): replace imageUrl input with ImagePickerButton in EntityCreateModal

## Changes Made

### 1. Added test to `tests/frontend/imagePicker.test.ts`
- Added `describe("EntityCreateModal wiring", ...)` block
- Test verifies that:
  - File contains `ImagePickerButton` import and usage
  - Old URL placeholder `"https://ejemplo.com/foto.jpg"` is removed

### 2. Modified `src/frontend/dm/entities/EntityCreateModal.tsx`
- Added import: `import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js";`
- Replaced the entire form-group (lines 271–291) containing:
  - Old: Text input with URL placeholder + manual preview img
  - New: `ImagePickerButton` component with:
    - `catalog="avatars"`
    - `defaultImage="/assets/entities/default_npc.png"`
    - `shape="circle"`
    - Proper onChange handler binding to `entityForm.metadata.imageUrl`

## Test Results

```
✅ tests/frontend/imagePicker.test.ts: PASS (10/10)
  - ImagePickerModal (3 tests)
  - ImagePickerButton (3 tests)
  - IdentityEditor wiring (1 test)
  - PlayersPage wiring (1 test)
  - EntityCreateModal wiring (1 test) ← NEW & PASSING
```

Full test suite: 44 passed, 7 failed (pre-existing failures unrelated to this task).

## One-Line Summary
Replaced imageUrl URL input with interactive ImagePickerButton in EntityCreateModal, completing catalog-driven image selection UX for entities.

## Concerns
None. All requested tests pass; changes isolated to form component replacement; no impact on other entity creation logic or type-specific metadata handling.
