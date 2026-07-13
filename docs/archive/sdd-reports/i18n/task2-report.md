> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 2 Report — Canvas Node Components i18n Migration

## STATUS: DONE

## Commits made
- `feat(i18n): migrate canvas node components (EntityNode, FactNode, NoteNode, GroupNode)`

## Test result
24 test files, 139 tests — all passed

## Typecheck result
`npm run typecheck:all` — clean (no errors)

## Summary of changes
- **CanvasEntityNode.tsx**: Removed module-level `TYPE_CONFIGS` (which called `uiText()` for faction/quest/secret/decision labels). Moved it inside the component function after `const { t } = useTranslation();`. Replaced all 10 additional `uiText()` calls inside the component body.
- **CanvasFactNode.tsx**: Removed module-level `KIND_CONFIG` (which called `uiText()` for player_theory label). Moved it inside the component function. Replaced `uiText("ui0017")` fallback for statement.
- **CanvasNoteNode.tsx**: Simple swap — replaced import, added hook call, replaced 2 `uiText()` calls (ui0041, ui0042).
- **CanvasGroupNode.tsx**: `GROUP_TYPE_CONFIGS` was already inside the component function. Replaced import, added hook call, replaced 3 `uiText()` calls inside the config object.

## Concerns
None.
