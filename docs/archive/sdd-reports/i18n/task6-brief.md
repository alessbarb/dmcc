> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 6: Migrate Entity Modal Components

## Context
Tasks 1-5 complete. Now migrating the last 2 files.

## Files to Migrate
1. `src/frontend/dm/entities/EntityDetailModal.tsx`
2. `src/frontend/dm/entities/EntityCreateModal.tsx`

All paths relative to `/home/alessbarb/workspace/repos/incubating/dmcc`.

## Migration Rules
1. Read the file fully first
2. Remove: `import { uiText } from "@shared/i18n/frontendText.js";`
3. Add (if not already present): `import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";`
4. Add (if not already present) at the TOP of the component function body: `const { t } = useTranslation();`
5. Replace ALL `uiText(...)` calls using the mapping below

## Key Mapping

```
ui0122 → t("entityModal.playerCharacters")
ui0123 → t("entityModal.descriptionPlaceholder")
ui0124 → t("entityModal.motivationPlaceholder")
ui0125 → t("typeMetadataForm.classPlaceholder")   [EXISTING key]
ui0126 → t("typeMetadataForm.backgroundPlaceholder")  [EXISTING key]
ui0127 → t("entityModal.regionLabel")
ui0128 → t("common.yes")
ui0129 → t("entityModal.tabCreation")
ui0130 → t("entityModal.tabVisibility")
ui0131 → t("entityModal.tabRelation")
ui0132 → t("entityModal.cancelEdit")
ui0133 → t("common.edit")   [EXISTING key]
ui0136 → t("common.saveChanges")
```

Also check for any other uiText() keys not listed above — resolve them by looking up the key
number in the full mapping from the original task description, or look up the string in es.ts.

## CRITICAL NOTES
- `typeMetadataForm.classPlaceholder` and `typeMetadataForm.backgroundPlaceholder` already exist
  in the dictionary — do NOT add them, just use them.
- `common.yes`, `common.edit`, `common.saveChanges` — also existing or added in Task 1.
- DO NOT touch `src/shared/i18n/frontendText.ts`.

## After Migrating Both Files
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test` — must pass
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run typecheck:all` — must pass
- Commit: `feat(i18n): migrate EntityDetailModal and EntityCreateModal`

## Report File
Write to: `/home/alessbarb/workspace/repos/incubating/dmcc/.superpowers/sdd/i18n/task6-report.md`

Include:
- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made
- Test result
- typecheck result
- Any concerns
