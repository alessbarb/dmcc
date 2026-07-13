> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 6 Report: Migrate EntityDetailModal and EntityCreateModal

## STATUS: DONE

## Commits Made
- `b75451a` — feat(i18n): migrate EntityDetailModal and EntityCreateModal

## Test Result
24 test files, 139 tests — all passed

## Typecheck Result
`typecheck:all` (tsc + tsc app) — passed with no errors

## Changes Summary

### EntityDetailModal.tsx
- Removed `import { uiText } from "@shared/i18n/frontendText.js";`
- `useTranslation` was already imported via relative path (kept as-is)
- Replaced all 8 `uiText()` calls:
  - `ui0127` → `t("entityModal.regionLabel")` (location Field label)
  - `ui0128` → `t("common.yes")` (x2: isKnownToParty, clue found)
  - `ui0018` → `t("canvas.node.typeLocation")` (x2: quest & encounter locationId Field labels)
  - `ui0129` → `t("entityModal.tabCreation")` (TrazabilidadTab kindStyles)
  - `ui0130` → `t("entityModal.tabVisibility")`
  - `ui0131` → `t("entityModal.tabRelation")`
  - `ui0132` → `t("entityModal.cancelEdit")` (footer toggle button)
  - `ui0133` → `t("common.edit")`

### EntityCreateModal.tsx
- Removed `import { uiText } from "@shared/i18n/frontendText.js";`
- Added `import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";`
- Added `const { t } = useTranslation();` at top of component function body
- Replaced all 5 `uiText()` calls:
  - `ui0122` → `t("entityModal.playerCharacters")` (optgroup label)
  - `ui0123` → `t("entityModal.descriptionPlaceholder")` (summary input placeholder)
  - `ui0124` → `t("entityModal.motivationPlaceholder")` (goal/motivation input placeholder)
  - `ui0125` → `t("typeMetadataForm.classPlaceholder")` (class input placeholder)
  - `ui0126` → `t("typeMetadataForm.backgroundPlaceholder")` (background input placeholder)

## Concerns
None. `ui0018` was not in task6 brief mapping but was resolved from task2-brief.md where it was mapped to `t("canvas.node.typeLocation")`.
