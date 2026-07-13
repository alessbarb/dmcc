> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 8 Report: Wire ImagePickerButton into CanvasInspector

## Status

COMPLETE

## Commit Hash

733c6e6def501017631c7686732847a354f04dc6

## One-Line Test Summary

All 12 imagePicker tests pass (PASS 12, FAIL 0); full suite 269/284 — 15 pre-existing failures unchanged by this task.

## What Was Done

1. Added a failing test to `tests/frontend/imagePicker.test.ts` under `describe("CanvasInspector wiring", ...)` verifying `CanvasInspector.tsx` contains `"ImagePickerButton"` and does not contain `"Imagen / Retrato (URL)"`.

2. Added import to `src/frontend/dm/canvas/components/CanvasInspector.tsx`:
   ```typescript
   import { ImagePickerButton } from "../../../shared/components/ImagePickerButton.js";
   ```

3. Replaced the form-group at line ~571 (URL input + inline preview for entity portraits) with an `<ImagePickerButton>` wired to `imageUrl` / `setImageUrl`. Selection triggers an immediate `updateEntity` call (same function used by the existing `handleImageUrlBlur`). The `imageUrl` state and `handleImageUrlBlur` function were left intact as they may be referenced elsewhere.

## Concerns

- **Pre-existing failures**: 15 tests were already failing before this task (backend auth, premade campaigns, i18n hardcoded strings, account surface). These are unrelated to the image picker work. Baseline before this task had 35 failures; after applying my changes: 15. The improvement is due to other already-staged changes in the working tree, not this task.
- **`handleImageUrlBlur` is now dead code**: The function at line 140 is no longer called from JSX (the picker fires `updateEntity` directly). It remains in the file harmlessly. A future cleanup pass could remove it.
