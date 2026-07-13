> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 4 Report

## STATUS: DONE_WITH_CONCERNS

## Commits
- `feat(i18n): migrate CanvasInspector, RelationshipTypePopover, ConvertNoteToEntityDialog`

## Test result
24 test files, 139 tests — all passed.

## Typecheck result
`tsc -p tsconfig.json --noEmit` and `tsc -p tsconfig.app.json` — both clean, no errors.

## Concerns

### Keys not in the task4-brief mapping
Three files contained uiText calls for keys absent from the brief's mapping table. They were resolved by looking up the correct t() keys directly from `src/shared/i18n/dictionaries/es.ts`:

| uiText key | Resolved t() key | File |
|---|---|---|
| ui0029 | `canvas.node.quickTitlePlaceholder` | CanvasInspector.tsx |
| ui0030 | `canvas.groupNode.titlePlaceholder` | CanvasInspector.tsx |
| ui0031 | `canvas.factNode.statementPlaceholder` | CanvasInspector.tsx |
| ui0057 | `canvas.palette.typeLabelLocation` | ConvertNoteToEntityDialog.tsx |
| ui0058 | `canvas.palette.typeLabelQuest` | ConvertNoteToEntityDialog.tsx |
| ui0059 | `canvas.palette.typeLabelSecret` | ConvertNoteToEntityDialog.tsx |
| ui0060 | `canvas.palette.typeLabelFaction` | ConvertNoteToEntityDialog.tsx |
| ui0061 | `canvas.palette.typeLabelScene` | ConvertNoteToEntityDialog.tsx |
| ui0062 | `canvas.palette.typeLabelHandout` | ConvertNoteToEntityDialog.tsx |
| ui0063 | `canvas.palette.searchEntityExampleHint` | ConvertNoteToEntityDialog.tsx |

These keys exist in the dictionary and typecheck passed, confirming they are valid. Future task briefs should include the full mapping to avoid needing to derive keys from the dictionary.

### RelationshipTypePopover — getRelationOptions()
The `getRelationOptions()` function is defined inside the component body and accesses `t()` via closure. This is correct: `t` is in scope from `const { t } = useTranslation()` at the top of the component. No issues.

### ui0068 note
The brief maps `ui0068 → t("canvas.relationPopover.memberOf")` but the original usage was as a "located_in" relation option label in the generic defaults section. The es.ts value for `canvas.relationPopover.memberOf` is "miembro de / está en", which is semantically different from the original hardcoded fallback context. This was migrated as specified — the task owner should verify if this label mapping is intentional.
