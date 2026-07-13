> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 4: Migrate Canvas Inspector and Related Components

## Context
Tasks 1-3 complete. Now migrating 3 more files.

## Files to Migrate
1. `src/frontend/dm/canvas/components/CanvasInspector.tsx`
2. `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx`
3. `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx`

All paths relative to `/home/alessbarb/workspace/repos/incubating/dmcc`.

## Migration Rules
1. Read the file fully first
2. Remove: `import { uiText } from "@shared/i18n/frontendText.js";`
3. Add (if not already present): `import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";`
4. Add (if not already present) at the TOP of the component function body: `const { t } = useTranslation();`
5. Replace ALL `uiText(...)` calls using the mapping below

## Key Mapping

```
ui0006 → t("canvas.node.visibilityDmOnly")
ui0007(p0=title) → t("toasts.entityRevealedCanvas", { title })
ui0008(p0=title) → t("canvas.node.addSessionNotePrompt", { title })
ui0009 → t("canvas.node.noActiveSessionNote")
ui0010 → t("canvas.node.addSessionNoteLabel")
ui0011(p0=title,p1=status) → t("canvas.node.statusPrompt", { title, status })
ui0012(p0=title,p1=status) → t("toasts.statusUpdatedCanvas", { title, status })
ui0013 → t("canvas.node.changeStatus")
ui0014(p0=title) → t("canvas.node.consequenceTitlePrompt", { title })
ui0015 → t("canvas.node.addConsequence")
ui0020(p0=anchor,p1=secret) → t("canvas.node.secretAnchorRevealPrompt", { anchor, secret })
ui0021(p0=secret,p1=anchor) → t("toasts.secretAutoRevealed", { secret, anchor })
ui0022(p0=title) → t("toasts.secretRevealed", { title })
ui0023(p0=title) → t("canvas.node.archiveEntityConfirm", { title })
ui0024 → t("canvas.node.removeFromCanvasConfirm")
ui0025(p0=title) → t("canvas.node.entityNotOnBoard", { title })
ui0026 → t("canvas.node.removeRelationFromCanvasConfirm")
ui0027(p0=title) → t("canvas.node.relationNotOnBoard", { title })
ui0028 → t("canvas.node.archiveRelationConfirm")
ui0032 → t("canvas.node.rolePlaceholder")
ui0033 → t("canvas.node.notesPlaceholder")
ui0034 → t("canvas.node.consequencePlaceholder")
ui0035 → t("canvas.node.removeFromCanvasTooltip")
ui0036 → t("canvas.node.archiveEntityTooltip")
ui0037 → t("canvas.node.relationLore")
ui0038 → t("canvas.node.connectionVisual")
ui0039 → t("canvas.node.relationDetailPlaceholder")
ui0040 → t("canvas.node.archiveRelationTooltip")
ui0047(p0=title) → t("toasts.entityRevealedInspector", { title })
ui0048(p0=title,p1=status) → t("toasts.statusUpdatedInspector", { title, status })
ui0049 → t("canvas.node.untitledElement")
ui0064 → t("canvas.node.generalNotesPlaceholder")
ui0065 → t("canvas.relationPopover.worksFor")
ui0066 → t("canvas.relationPopover.hidesAbout")
ui0067 → t("canvas.relationPopover.revealsInfo")
ui0068 → t("canvas.relationPopover.memberOf")
ui0069 → t("canvas.relationPopover.detailsPlaceholder")
ui0112 → t("canvas.node.statusCritical")
```

## CRITICAL NOTES
- If any `uiText()` calls are in module-level objects/constants outside a component function,
  move those definitions INSIDE the component function body.
- `ConvertNoteToEntityDialog.tsx` — if it uses uiText, may be a dialog component; check carefully.
- DO NOT touch `src/shared/i18n/frontendText.ts`.

## After Migrating All 3 Files
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test` — must pass
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run typecheck:all` — must pass
- Commit: `feat(i18n): migrate CanvasInspector, RelationshipTypePopover, ConvertNoteToEntityDialog`

## Report File
Write to: `/home/alessbarb/workspace/repos/incubating/dmcc/.superpowers/sdd/i18n/task4-report.md`

Include:
- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made
- Test result
- typecheck result
- Any concerns
