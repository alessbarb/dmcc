> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 7: Wire ImagePickerButton into EntityDetailModal — Report

## Status
✅ **COMPLETED**

## Commit
`36fef93` — `feat(entities): replace imageUrl input with ImagePickerButton in EntityDetailModal`

## Changes Made

### 1. **src/frontend/dm/entities/EntityDetailModal.tsx**
- **Line 15**: Added import: `import { ImagePickerButton } from "../../shared/components/ImagePickerButton.js"`
- **Lines 600-616**: Replaced the old text input form-group (with placeholder `https://ejemplo.com/foto.jpg`) with:
  - `ImagePickerButton` component
  - `value` prop: `editEntityForm.metadata?.imageUrl ?? entity.metadata?.imageUrl ?? ""`
  - `onChange` handler: updates `imageUrl` in metadata with null fallback (`path || undefined`)
  - `catalog="avatars"`
  - `shape="circle"`
  - Label changed from "URL de la Imagen" to "Imagen"

### 2. **tests/frontend/imagePicker.test.ts**
- **Lines 80-86**: Added new test block `describe("EntityDetailModal wiring", ...)`
  - Verifies EntityDetailModal contains `ImagePickerButton`
  - Verifies the old placeholder string has been removed

## Test Results

### vitest (imagePicker.test.ts)
- **11 tests PASSED, 0 failed**
- New test passes: ✅ "uses ImagePickerButton for imageUrl in edit form"

### Full npm test suite
- Pre-existing failures in unrelated backend tests (account routes, DM auth, account store, premade campaigns, i18n)
- **Frontend tests**: All imagePicker.test.ts tests pass (no new failures introduced)

## Key Implementation Details

✓ Only the image input block was replaced; no other parts of EntityDetailModal.tsx were touched
✓ Label text updated to "Imagen" (matching other components' conventions)
✓ Null fallback logic: `path || undefined` prevents empty strings in metadata
✓ Form state properly reads from editEntityForm or falls back to entity.metadata
✓ Import path uses `.js` extension (module resolution)

## Concerns
None. The implementation follows the exact specification and all related tests pass.
