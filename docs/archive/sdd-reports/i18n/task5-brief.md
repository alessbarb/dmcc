> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# Task 5: Migrate Session and Players Components

## Context
Tasks 1-4 complete. Now migrating 3 files related to session management and players.

## Files to Migrate
1. `src/frontend/dm/sessions/SessionPage.tsx`
2. `src/frontend/dm/pages/PlayersPage.tsx`
3. `src/frontend/player/components/PlayerPortalView.tsx`

All paths relative to `/home/alessbarb/workspace/repos/incubating/dmcc`.

## Migration Rules
1. Read the file fully first
2. Remove: `import { uiText } from "@shared/i18n/frontendText.js";`
3. Add (if not already present): `import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";`
4. Add (if not already present) at the TOP of the component function body: `const { t } = useTranslation();`
5. Replace ALL `uiText(...)` calls using the mapping below

## Key Mapping

```
ui0119 → t("toasts.elementsAddedToSession")
ui0128 → t("common.yes")
ui0134 → t("players.editProfile")
ui0135 → t("players.addPlayer")
ui0136 → t("common.saveChanges")
ui0137 → t("players.saveNote")
ui0138(p0=decision,p1=suffix) → t("session.decisionMade", { decision, suffix })
ui0139 → t("session.decisionConsequence")
ui0140 → t("session.decisionCausesConsequence")
ui0141(p0=decision) → t("session.pendingConsequence", { decision })
ui0142 → t("toasts.decisionRecorded")
ui0143(p0=error) → t("toasts.decisionError", { error })
ui0144 → t("session.exampleConsequence")
ui0145 → t("session.recordDecision")
ui0146 → t("session.exampleNote")
ui0147 → t("session.createConsequence")
ui0148 → t("session.createNpc")
ui0149 → t("toasts.sessionClosed")
ui0150 → t("session.exampleSummary")
ui0151 → t("session.closeAndSave")
ui0152(p0=number) → t("session.sessionNumber", { number })
ui0153 → t("session.quickNote")
ui0154 → t("session.createQuickNpc")
ui0155 → t("session.closeSession")
ui0156 → t("session.actions")
ui0157 → t("session.archiveNoteConfirm")
ui0158 → t("session.summary")
ui0159 → t("playerPortal.objectives")
ui0160 → t("players.playerSummary")
ui0161 → t("players.characterStatus")
ui0162 → t("players.dmNotes")
ui0163 → t("players.observationsPlaceholder")
ui0164 → t("common.cancel")
ui0165 → t("players.characterGoalPlaceholder")
```

## CRITICAL NOTES
- SessionPage.tsx may be large. Read it fully.
- If any uiText() is called outside a React component function, move it inside.
- `playerPortal.objectives` is an EXISTING key in the dictionary (no need to add it).
- `common.cancel` and `common.edit` are EXISTING keys (no need to add them).
- DO NOT touch `src/shared/i18n/frontendText.ts`.

## After Migrating All 3 Files
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm test` — must pass
- Run: `cd /home/alessbarb/workspace/repos/incubating/dmcc && npm run typecheck:all` — must pass
- Commit: `feat(i18n): migrate SessionPage, PlayersPage, PlayerPortalView`

## Report File
Write to: `/home/alessbarb/workspace/repos/incubating/dmcc/.superpowers/sdd/i18n/task5-report.md`

Include:
- STATUS: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Commits made
- Test result
- typecheck result
- Any concerns
