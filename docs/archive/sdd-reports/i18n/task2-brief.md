> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 2: Migrate Canvas Node Components

## Context
Task 1 (extend dictionaries) is complete. Now migrating 4 canvas node component files from the rogue
`uiText()` system to the canonical `t()` hook. The dictionaries already have all needed keys.

## Files to Migrate
1. `src/frontend/dm/canvas/components/CanvasEntityNode.tsx`
2. `src/frontend/dm/canvas/components/CanvasFactNode.tsx`
3. `src/frontend/dm/canvas/components/CanvasNoteNode.tsx`
4. `src/frontend/dm/canvas/components/CanvasGroupNode.tsx`

All paths are relative to `/home/alessbarb/workspace/repos/incubating/dmcc`.

## Migration Rules (apply to EACH file)
1. Read the file fully first
2. Remove: `import { uiText } from "@shared/i18n/frontendText.js";`
3. Add (if not already present): `import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";`
4. Add (if not already present) at the TOP of the component function body: `const { t } = useTranslation();`
5. Replace ALL `uiText("ui00XX")` and `uiText("ui00XX", { p0: x, ... })` calls using the mapping below

## Key Mapping (uiText key → t() call)

```
ui0001 → t("canvas.factNode.newFactPrompt", { kind: ... })
ui0002 → t("domain.entityTypes.faction")
ui0003 → t("domain.entityTypes.quest")
ui0004 → t("domain.entityTypes.secret")
ui0005 → t("domain.entityTypes.decision")
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
ui0016 → t("canvas.factNode.kindTheory")
ui0017 → t("canvas.factNode.noStatement")
ui0018 → t("canvas.node.typeLocation")
ui0019 → t("canvas.node.typeSession")
ui0020(p0=anchor,p1=secret) → t("canvas.node.secretAnchorRevealPrompt", { anchor, secret })
ui0021(p0=secret,p1=anchor) → t("toasts.secretAutoRevealed", { secret, anchor })
ui0022(p0=title) → t("toasts.secretRevealed", { title })
ui0023(p0=title) → t("canvas.node.archiveEntityConfirm", { title })
ui0024 → t("canvas.node.removeFromCanvasConfirm")
ui0025(p0=title) → t("canvas.node.entityNotOnBoard", { title })
ui0026 → t("canvas.node.removeRelationFromCanvasConfirm")
ui0027(p0=title) → t("canvas.node.relationNotOnBoard", { title })
ui0028 → t("canvas.node.archiveRelationConfirm")
ui0029 → t("canvas.node.quickTitlePlaceholder")
ui0030 → t("canvas.groupNode.titlePlaceholder")
ui0031 → t("canvas.factNode.statementPlaceholder")
ui0032 → t("canvas.node.rolePlaceholder")
ui0033 → t("canvas.node.notesPlaceholder")
ui0034 → t("canvas.node.consequencePlaceholder")
ui0035 → t("canvas.node.removeFromCanvasTooltip")
ui0036 → t("canvas.node.archiveEntityTooltip")
ui0037 → t("canvas.node.relationLore")
ui0038 → t("canvas.node.connectionVisual")
ui0039 → t("canvas.node.relationDetailPlaceholder")
ui0040 → t("canvas.node.archiveRelationTooltip")
ui0041 → t("canvas.noteNode.deleteNote")
ui0042 → t("canvas.noteNode.contentPlaceholder")
ui0043 → t("canvas.noteNode.contentPlaceholderLong")
ui0044 → t("canvas.noteNode.addQuickSessionNote")
ui0045 → t("canvas.noteNode.quickSessionNote")
ui0046 → t("canvas.noteNode.noActiveSession")
ui0049 → t("canvas.node.untitledElement")
ui0064 → t("canvas.node.generalNotesPlaceholder")
ui0112 → t("canvas.node.statusCritical")
```

## CRITICAL NOTES
- CanvasEntityNode.tsx has uiText calls at MODULE LEVEL (in object literals defined outside the
  component function). These CANNOT stay at module level — the hook can only be called inside a
  React component. You must move those object definitions INSIDE the component function so they
  can use `t()`. Read the file carefully to identify module-level vs. component-level usage.
- Parameter names change: old `{p0}`,`{p1}` → new descriptive names like `{title}`,`{status}`.
  The `t()` call must pass an object with the exact parameter name matching the dictionary
  placeholder. E.g. `t("canvas.node.statusPrompt", { title: entity.title, status: newStatus })`.
- DO NOT modify `src/shared/i18n/frontendText.ts` — it will be deleted later.
- After migrating, run `npm run typecheck:all` and fix any TypeScript errors.

## After Migrating All 4 Files
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test` — must pass
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run typecheck:all` — must pass
- Commit: `feat(i18n): migrate canvas node components (EntityNode, FactNode, NoteNode, GroupNode)`

## Report File
Write to: `/home/alessbarb/workspace/repos/incubating/dmcc/.superpowers/sdd/i18n/task2-report.md`

Include:
- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made
- Test result
- typecheck result
- Any concerns
