> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 9: Wire ImagePickerButton into App.tsx (Campaign Cover) — Report

## Status
✅ COMPLETE

## Commit Hash
`bd2af56b59ee65b1de7a7fa9fb5a5c932609d225`

## Changes Made

1. **Added import** to `src/frontend/App.tsx`:
   - Imported `ImagePickerButton` from `"./shared/components/ImagePickerButton.js"`

2. **Replaced coverUrl input** in campaign edit modal:
   - Replaced the entire form-group containing the manual text input for campaign cover image
   - New form-group uses `ImagePickerButton` with:
     - `value={editCoverUrl}`
     - `onChange={setEditCoverUrl}`
     - `catalog="campaigns"`
     - `defaultImage="/assets/campaigns/default-campaign-cover.jpg"`
     - `shape="rect"` (landscape cover art)

3. **Added test** to `tests/frontend/imagePicker.test.ts`:
   - New describe block: "App campaign cover wiring"
   - Test verifies App.tsx contains `ImagePickerButton`
   - Test verifies presence of `catalog="campaigns"`
   - Test verifies absence of old manual input pattern

## Test Summary
**All 13 imagePicker tests pass** — including the new "App campaign cover wiring" test that validates:
- ImagePickerButton is imported and used
- catalog="campaigns" is set correctly
- Old onChange pattern is removed

## Concerns
**None.** Task completed successfully:
- Only the coverUrl input was replaced (as specified)
- No other parts of App.tsx were modified
- Import follows existing pattern
- Label updated to Spanish ("Portada de campaña") for consistency with existing UI
- Form-group wrapper structure preserved
- State handling unchanged (editCoverUrl, setEditCoverUrl already existed)
