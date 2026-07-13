> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 3: Migrate Canvas Toolbar/Palette/Flow/Page Components

## Context
Tasks 1-2 are complete. Now migrating 3 more canvas files.

## Files to Migrate
1. `src/frontend/dm/canvas/components/CanvasPalette.tsx`
2. `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx`
3. `src/frontend/dm/canvas/pages/CanvasPage.tsx`

All paths relative to `/home/alessbarb/workspace/repos/incubating/dmcc`.

## Migration Rules (apply to EACH file)
1. Read the file fully first
2. Remove: `import { uiText } from "@shared/i18n/frontendText.js";`
3. Add (if not already present): `import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";`
4. Add (if not already present) at the TOP of the component function body: `const { t } = useTranslation();`
5. Replace ALL `uiText(...)` calls using the mapping below

## Key Mapping (uiText key → t() call)

```
ui0007(p0=title) → t("toasts.entityRevealedCanvas", { title })
ui0011(p0=title,p1=status) → t("canvas.node.statusPrompt", { title, status })
ui0014(p0=title) → t("canvas.node.consequenceTitlePrompt", { title })
ui0043 → t("canvas.noteNode.contentPlaceholderLong")
ui0044 → t("canvas.noteNode.addQuickSessionNote")
ui0045 → t("canvas.noteNode.quickSessionNote")
ui0046 → t("canvas.noteNode.noActiveSession")
ui0047(p0=title) → t("toasts.entityRevealedInspector", { title })
ui0048(p0=title,p1=status) → t("toasts.statusUpdatedInspector", { title, status })
ui0049 → t("canvas.node.untitledElement")
ui0050 → t("canvas.palette.addNoteDragHint")
ui0051 → t("canvas.palette.addGroupDragHint")
ui0052 → t("canvas.palette.searchEntityPlaceholder")
ui0053 → t("canvas.factNode.kindDmSecretShort")
ui0054 → t("canvas.factNode.kindTheoryShort")
ui0055 → t("canvas.palette.searchFactPlaceholder")
ui0056 → t("canvas.palette.allFactsOnCanvas")
ui0057 → t("canvas.palette.typeLabelLocation")
ui0058 → t("canvas.palette.typeLabelQuest")
ui0059 → t("canvas.palette.typeLabelSecret")
ui0060 → t("canvas.palette.typeLabelFaction")
ui0061 → t("canvas.palette.typeLabelScene")
ui0062 → t("canvas.palette.typeLabelHandout")
ui0063 → t("canvas.palette.searchEntityExampleHint")
ui0087(p0=title) → t("canvas.flow.warningOrphanClue", { title })
ui0088(p0=title) → t("canvas.flow.warningStuckQuest", { title })
ui0089(p0=title) → t("canvas.flow.warningEmptyLocation", { title })
ui0090(p0=source,p1=target) → t("canvas.flow.warningSecretRelation", { source, target })
ui0091(p0=name) → t("canvas.page.initializingTemplate", { name })
ui0092(p0=name) → t("canvas.page.templateInitialized", { name })
ui0093(p0=count,p1=suffix) → t("canvas.page.relationCount", { count, suffix })
ui0094(p0=count) → t("canvas.page.notOnBoard", { count })
ui0095(p0=name) → t("canvas.page.boardInitialized", { name })
ui0096 → t("canvas.page.templateConspiration")
ui0097 → t("canvas.page.templateRelations")
ui0098 → t("canvas.page.createNewBoard")
ui0099 → t("canvas.toolbar.deactivateDirection")
ui0100 → t("canvas.toolbar.activateDirection")
ui0101 → t("canvas.toolbar.exitPresentation")
ui0102 → t("canvas.toolbar.activatePlayerView")
ui0103 → t("canvas.toolbar.playerViewLabel")
ui0104 → t("canvas.toolbar.showingPublicOnly")
ui0105 → t("canvas.toolbar.showingAll")
ui0106 → t("canvas.toolbar.publicOnly")
ui0107 → t("canvas.toolbar.activateMysteryFlow")
ui0108 → t("canvas.toolbar.filterConnections")
ui0109 → t("canvas.page.importExamplePlaceholder")
ui0110 → t("canvas.page.importExampleContent")
ui0111 → t("canvas.page.importSuccess")
ui0112 → t("canvas.node.statusCritical")
ui0113 → t("canvas.toolbar.prepareSession")
ui0114(p0=count) → t("canvas.toolbar.revealSelectedConfirm", { count })
ui0115(p0=count) → t("canvas.toolbar.hideSelectedConfirm", { count })
ui0116(p0=count) → t("canvas.toolbar.removeSelectedConfirm", { count })
ui0117 → t("canvas.toolbar.sessionPrepTitle")
ui0118(p0=title) → t("toasts.sessionStartedWithPrep", { title })
ui0119 → t("toasts.elementsAddedToSession")
ui0120 → t("canvas.page.sessionNamePlaceholder")
ui0121 → t("canvas.page.loadIntoSession")
ui0070 → t("canvas.seedData.investigationTrigger")
ui0071 → t("canvas.seedData.redHerring")
ui0072 → t("canvas.seedData.centralSecret")
ui0073 → t("canvas.seedData.finalRevelation")
ui0074 → t("canvas.seedData.factionLeader")
ui0075 → t("canvas.seedData.enemyFaction")
ui0076 → t("canvas.seedData.missionToStop")
ui0077 → t("canvas.seedData.publicMeetingPoint")
ui0078 → t("canvas.seedData.darkAlley")
ui0079 → t("canvas.seedData.scene1")
ui0080 → t("canvas.seedData.scene1Desc")
ui0081 → t("canvas.seedData.scene2")
ui0082 → t("canvas.seedData.sessionResolution")
ui0083 → t("canvas.seedData.nextSessionChanges")
ui0084 → t("canvas.seedData.secretPassage")
ui0085 → t("canvas.seedData.behindTapestry")
ui0086 → t("canvas.seedData.orcShaman")
```

## CRITICAL NOTES
- These files (especially CanvasPage.tsx and CampaignCanvasFlow.tsx) likely have module-level
  constants or function definitions that call `uiText()`. If `uiText()` is called outside a
  React component function body, you MUST restructure: move the call inside the component, or
  pass `t` as a parameter to the helper function.
- CanvasPage.tsx may be large — read it fully and find ALL uiText calls.
- `canvas.noteNode.contentPlaceholderLong` (ui0043) is used for the note initial text
  (e.g., when creating a note node). CanvasPalette may pass this as a string to add to the canvas.
- Some files may have both toolbar and palette uiText calls. Handle all of them.
- DO NOT touch `src/shared/i18n/frontendText.ts`.
- Parameter names: `p0` → descriptive name matching the dictionary placeholder.

## After Migrating All 3 Files
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test` — must pass
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run typecheck:all` — must pass
- Commit: `feat(i18n): migrate canvas toolbar, palette, flow, and page components`

## Report File
Write to: `/home/alessbarb/workspace/repos/incubating/dmcc/.superpowers/sdd/i18n/task3-report.md`

Include:
- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made
- Test result
- typecheck result
- Any concerns
