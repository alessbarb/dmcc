# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 129,
  "tsxFilesWithInlineStyles": 35,
  "forbiddenLiteralColors": 183,
  "staticInlineStyles": 87,
  "dynamicInlineStyles": 21,
  "unknownCssVariables": 0,
  "legacyCssVariables": 0,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 38,
  "crossComponentSelectors": 62,
  "importantDeclarations": 381,
  "unclassifiedCssFiles": 0
}
```

## Stylesheets

| File | Layer | Domain | Lines | Selectors | Importers |
|---|---:|---:|---:|---:|---:|
| `src/frontend/account/account.css` | legacy | account | 823 | 124 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css` | feature | canvas | 265 | 34 | 1 |
| `src/frontend/dm/entities/entity-card.css` | feature | entities | 394 | 54 | 1 |
| `src/frontend/dm/entities/entity-detail-modal.css` | feature | entities | 216 | 25 | 2 |
| `src/frontend/dm/entities/entity-grid.css` | feature | entities | 16 | 3 | 1 |
| `src/frontend/dm/entities/entity-list-toolbar.css` | feature | entities | 97 | 17 | 1 |
| `src/frontend/dm/entities/entity-summary-character-sheet.css` | feature | entities | 179 | 26 | 1 |
| `src/frontend/dm/entities/entity-summary.css` | feature | entities | 144 | 23 | 1 |
| `src/frontend/dm/entities/entityDetailDialog.css` | feature | entities | 395 | 57 | 2 |
| `src/frontend/dm/entities/entityDetailHeroActions.css` | feature | entities | 57 | 8 | 2 |
| `src/frontend/dm/entities/entityDetailImageContinuation.css` | feature | entities | 183 | 18 | 2 |
| `src/frontend/dm/entities/playerCharacterDetail.css` | feature | entities | 145 | 21 | 1 |
| `src/frontend/dm/entities/relations/relationshipGraph.css` | feature | entities | 154 | 25 | 2 |
| `src/frontend/dm/entities/type-metadata-form.css` | feature | entities | 30 | 4 | 1 |
| `src/frontend/dm/layouts/campaign-route-transitions.css` | layout | layout | 82 | 19 | 1 |
| `src/frontend/dm/library/boards/entityBoards.css` | feature | library | 243 | 37 | 1 |
| `src/frontend/dm/library/list/entity-list-toolbar-controls.css` | feature | library | 118 | 17 | 1 |
| `src/frontend/dm/library/list/entity-list-view.css` | feature | library | 117 | 18 | 1 |
| `src/frontend/dm/library/list/entityListRefinements.css` | feature | library | 96 | 16 | 1 |
| `src/frontend/dm/library/notebooks/notebooksWorkspace.css` | feature | library | 293 | 50 | 1 |
| `src/frontend/dm/map/mapWorkspace.css` | feature | map | 94 | 14 | 1 |
| `src/frontend/dm/map/network/networkFlow.css` | feature | map | 805 | 113 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour.css` | feature | onboarding | 226 | 32 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub.css` | feature | onboarding | 416 | 57 | 1 |
| `src/frontend/dm/pages/campaignMessagesPage.css` | feature | pages | 113 | 22 | 1 |
| `src/frontend/dm/pages/rulesPage.css` | feature | pages | 179 | 32 | 1 |
| `src/frontend/dm/pages/settingsPage.css` | feature | pages | 135 | 21 | 1 |
| `src/frontend/dm/people/group/groupWorkspace.css` | feature | people | 631 | 93 | 1 |
| `src/frontend/dm/people/peopleWorkspace.css` | feature | people | 394 | 61 | 1 |
| `src/frontend/dm/sessions/components/active-session-prep.css` | feature | sessions | 140 | 24 | 1 |
| `src/frontend/dm/sessions/components/prepared-session.css` | feature | sessions | 136 | 22 | 2 |
| `src/frontend/dm/sessions/components/quick-capture.css` | feature | sessions | 46 | 6 | 1 |
| `src/frontend/dm/sessions/components/quick-note.css` | feature | sessions | 13 | 3 | 1 |
| `src/frontend/dm/sessions/components/session-actions.css` | feature | sessions | 120 | 25 | 1 |
| `src/frontend/dm/sessions/components/session-event-feed.css` | feature | sessions | 139 | 23 | 1 |
| `src/frontend/dm/sessions/components/session-forms.css` | feature | sessions | 142 | 25 | 4 |
| `src/frontend/dm/sessions/components/session-history.css` | feature | sessions | 75 | 12 | 2 |
| `src/frontend/dm/sessions/components/session-idle.css` | feature | sessions | 130 | 24 | 2 |
| `src/frontend/dm/sessions/components/session-linked-list.css` | feature | sessions | 25 | 4 | 1 |
| `src/frontend/dm/sessions/components/session-status.css` | feature | sessions | 74 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css` | feature | sessions | 322 | 46 | 1 |
| `src/frontend/dm/sessions/narrativeMap/sessionNarrativeMap.css` | feature | sessions | 279 | 40 | 1 |
| `src/frontend/dm/sessions/session-workspace.css` | feature | sessions | 18 | 3 | 4 |
| `src/frontend/dm/story/history/campaignHistory.css` | feature | story | 295 | 41 | 1 |
| `src/frontend/dm/story/plan/storyPlanWorkspace.css` | feature | story | 276 | 96 | 1 |
| `src/frontend/institutional/institutional.css` | feature | institutional | 274 | 38 | 1 |
| `src/frontend/player/pages/playerCampaignShell.css` | feature | player | 154 | 27 | 1 |
| `src/frontend/shared/components/entityImageReframeDialog.css` | component | shared-components | 329 | 42 | 1 |
| `src/frontend/shared/components/watermark.css` | component | shared-components | 33 | 6 | 1 |
| `src/frontend/shared/styles/features/admin-announcements.css` | legacy | shared | 37 | 37 | 1 |
| `src/frontend/shared/styles/features/admin-audit.css` | legacy | shared | 117 | 46 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns.css` | legacy | shared | 36 | 36 | 1 |
| `src/frontend/shared/styles/features/admin-game-systems.css` | legacy | shared | 24 | 23 | 1 |
| `src/frontend/shared/styles/features/admin-invitations.css` | legacy | shared | 27 | 26 | 1 |
| `src/frontend/shared/styles/features/admin-overview.css` | legacy | shared | 28 | 25 | 1 |
| `src/frontend/shared/styles/features/admin-purge.css` | legacy | shared | 41 | 37 | 1 |
| `src/frontend/shared/styles/features/admin-security.css` | legacy | shared | 16 | 15 | 1 |
| `src/frontend/shared/styles/features/admin-template-settings.css` | legacy | shared | 25 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-users.css` | legacy | shared | 67 | 42 | 1 |
| `src/frontend/shared/styles/features/auth.css` | legacy | shared | 60 | 15 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas.css` | legacy | shared | 1689 | 260 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging.css` | legacy | shared | 39 | 38 | 1 |
| `src/frontend/shared/styles/features/campaign-template.css` | legacy | shared | 729 | 105 | 1 |
| `src/frontend/shared/styles/features/canvas-board-dialogs.css` | legacy | shared | 28 | 27 | 1 |
| `src/frontend/shared/styles/features/canvas-bulk-actions.css` | legacy | shared | 7 | 1 | 1 |
| `src/frontend/shared/styles/features/canvas-dialog-forms.css` | legacy | shared | 65 | 13 | 1 |
| `src/frontend/shared/styles/features/canvas-entity-node.css` | legacy | shared | 131 | 23 | 1 |
| `src/frontend/shared/styles/features/canvas-flow.css` | legacy | shared | 35 | 5 | 1 |
| `src/frontend/shared/styles/features/canvas-group-hulls.css` | legacy | shared | 23 | 3 | 1 |
| `src/frontend/shared/styles/features/canvas-inspector.css` | legacy | shared | 93 | 14 | 1 |
| `src/frontend/shared/styles/features/canvas-mystery-health.css` | legacy | shared | 76 | 13 | 1 |
| `src/frontend/shared/styles/features/canvas-narrative-lint.css` | legacy | shared | 80 | 14 | 1 |
| `src/frontend/shared/styles/features/canvas-page-header.css` | legacy | shared | 18 | 17 | 1 |
| `src/frontend/shared/styles/features/canvas-palette.css` | legacy | shared | 195 | 30 | 1 |
| `src/frontend/shared/styles/features/canvas-presentation.css` | legacy | shared | 11 | 1 | 1 |
| `src/frontend/shared/styles/features/canvas-toolbar.css` | legacy | shared | 24 | 5 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview.css` | legacy | shared | 49 | 46 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard.css` | legacy | shared | 507 | 71 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard.css` | legacy | shared | 1371 | 215 | 1 |
| `src/frontend/shared/styles/features/dm-hub.css` | legacy | shared | 589 | 73 | 1 |
| `src/frontend/shared/styles/features/dm-onboarding.css` | legacy | shared | 20 | 19 | 1 |
| `src/frontend/shared/styles/features/entity-create.css` | legacy | shared | 32 | 6 | 1 |
| `src/frontend/shared/styles/features/entity-relations.css` | legacy | shared | 51 | 47 | 1 |
| `src/frontend/shared/styles/features/entity-trace.css` | legacy | shared | 23 | 18 | 1 |
| `src/frontend/shared/styles/features/graph-search.css` | legacy | shared | 77 | 8 | 1 |
| `src/frontend/shared/styles/features/image-picker-button.css` | legacy | shared | 12 | 11 | 1 |
| `src/frontend/shared/styles/features/image-picker-modal.css` | legacy | shared | 215 | 28 | 1 |
| `src/frontend/shared/styles/features/kanban-board.css` | legacy | shared | 120 | 16 | 1 |
| `src/frontend/shared/styles/features/kanban.css` | legacy | shared | 104 | 17 | 1 |
| `src/frontend/shared/styles/features/landing-archive.css` | legacy | shared | 864 | 136 | 1 |
| `src/frontend/shared/styles/features/player-campaign.css` | legacy | shared | 38 | 37 | 1 |
| `src/frontend/shared/styles/features/player-portal.css` | legacy | shared | 988 | 153 | 1 |
| `src/frontend/shared/styles/features/quick-capture.css` | legacy | shared | 142 | 19 | 1 |
| `src/frontend/shared/styles/features/rules-workspace.css` | legacy | shared | 73 | 11 | 1 |
| `src/frontend/shared/styles/features/session-prep-form.css` | legacy | shared | 53 | 9 | 1 |
| `src/frontend/shared/styles/features/sidebar-nav.css` | legacy | shared | 15 | 2 | 1 |
| `src/frontend/shared/styles/features/system-announcements.css` | legacy | shared | 91 | 12 | 1 |
| `src/frontend/shared/styles/features/timeline.css` | legacy | shared | 217 | 37 | 1 |
| `src/frontend/shared/styles/foundation/accessibility.css` | foundation | shared | 8 | 2 | 1 |
| `src/frontend/shared/styles/foundation/color-scheme.css` | foundation | shared | 12 | 3 | 1 |
| `src/frontend/shared/styles/foundation/fonts.css` | foundation | shared | 16 | 1 | 1 |
| `src/frontend/shared/styles/foundation/motion.css` | foundation | shared | 28 | 3 | 1 |
| `src/frontend/shared/styles/foundation/reset.css` | foundation | shared | 46 | 7 | 1 |
| `src/frontend/shared/styles/foundation/structural-tokens.css` | foundation | shared | 20 | 1 | 1 |
| `src/frontend/shared/styles/landing.css` | legacy | shared | 2641 | 392 | 1 |
| `src/frontend/shared/styles/layout/admin-shell.css` | layout | shared | 134 | 24 | 1 |
| `src/frontend/shared/styles/layout/app-shell.css` | layout | shared | 42 | 8 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation.css` | layout | shared | 744 | 97 | 1 |
| `src/frontend/shared/styles/layout/campaign-shell.css` | layout | shared | 202 | 30 | 1 |
| `src/frontend/shared/styles/layout/footer.css` | layout | shared | 128 | 18 | 1 |
| `src/frontend/shared/styles/layout/grid.css` | layout | shared | 26 | 7 | 1 |
| `src/frontend/shared/styles/layout/navigation.css` | layout | shared | 119 | 13 | 1 |
| `src/frontend/shared/styles/layout/responsive.css` | layout | shared | 63 | 12 | 1 |
| `src/frontend/shared/styles/layout/workspace.css` | layout | shared | 1009 | 150 | 1 |
| `src/frontend/shared/styles/main.css` | foundation | shared | 88 | 0 | 1 |
| `src/frontend/shared/styles/primitives/badge.css` | primitive | shared | 54 | 8 | 1 |
| `src/frontend/shared/styles/primitives/button.css` | primitive | shared | 94 | 13 | 1 |
| `src/frontend/shared/styles/primitives/card.css` | primitive | shared | 84 | 13 | 1 |
| `src/frontend/shared/styles/primitives/dialog.css` | primitive | shared | 89 | 12 | 1 |
| `src/frontend/shared/styles/primitives/empty-state.css` | primitive | shared | 21 | 3 | 1 |
| `src/frontend/shared/styles/primitives/form-control.css` | primitive | shared | 56 | 8 | 1 |
| `src/frontend/shared/styles/primitives/menu.css` | primitive | shared | 69 | 9 | 1 |
| `src/frontend/shared/styles/primitives/overlay.css` | primitive | shared | 16 | 2 | 1 |
| `src/frontend/shared/styles/primitives/status.css` | primitive | shared | 24 | 3 | 1 |
| `src/frontend/shared/styles/primitives/tabs.css` | primitive | shared | 24 | 3 | 1 |
| `src/frontend/shared/styles/primitives/toast.css` | primitive | shared | 24 | 2 | 1 |
| `src/frontend/shared/styles/primitives/toolbar.css` | primitive | shared | 12 | 2 | 1 |
| `src/frontend/shared/styles/primitives/tooltip.css` | primitive | shared | 13 | 1 | 1 |
| `src/frontend/shared/styles/vendor/react-flow.css` | vendor | shared | 2 | 0 | 1 |

## Findings

| Severity | Category | Location | Reason |
|---|---|---|---|
| critical | mixed-responsibility | `src/frontend/account/account.css:1` | Large stylesheet requires atomization (823 lines, 124 selectors). |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1282` | Literal visual color outside a registered theme package. |
| high | mixed-responsibility | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:1` | Large stylesheet requires atomization (265 lines, 34 selectors). |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:31` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:162` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:213` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:214` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:215` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:216` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:221` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:241` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:262` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:39` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:40` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:41` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:42` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:43` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:44` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:45` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:46` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:108` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:109` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:113` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:114` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:115` | Literal visual color outside a registered theme package. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:203` | Runtime style requires review and CSS custom-property preference. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:411` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:412` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:486` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:487` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:14` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:14` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:72` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:72` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:410` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:426` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:543` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:544` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:545` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:546` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:547` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:548` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:549` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/pages/CanvasPage.tsx:527` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/templates/cityTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/templates/dungeonTemplate.ts:5` | Literal visual color outside a registered theme package. |
| critical | mixed-responsibility | `src/frontend/dm/entities/entity-card.css:1` | Large stylesheet requires atomization (394 lines, 54 selectors). |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-modal.css:133` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-modal.css:142` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:154` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:158` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-modal.css:158` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:159` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:160` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:161` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:162` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:163` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:165` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:166` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:167` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:168` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:169` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:170` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:172` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:173` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:175` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:176` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-modal.css:181` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:187` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-modal.css:187` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-modal.css:202` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:207` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:208` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:209` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:210` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:211` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:212` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:213` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/dm/entities/entityDetailDialog.css:1` | Large stylesheet requires atomization (395 lines, 57 selectors). |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:40` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:63` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:65` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:70` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:104` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:108` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:108` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:113` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:114` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:115` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:124` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:128` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:134` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:139` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:140` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:142` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:143` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:148` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:148` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:151` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:152` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:159` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:166` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:217` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:221` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:222` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:223` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:224` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:226` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:231` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:235` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:239` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:243` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:243` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:244` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:249` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:251` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:255` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:259` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:263` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:266` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:268` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:269` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:270` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:276` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:279` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:303` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:309` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:313` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:314` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:328` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:329` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:330` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:334` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:346` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:350` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:351` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:352` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:353` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:357` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:367` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:368` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:372` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:373` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:374` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:375` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:381` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:381` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:7` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:8` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:18` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:18` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:32` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:32` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:73` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:73` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:74` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:85` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:93` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:93` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:94` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:96` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:97` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:98` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:106` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:107` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:108` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:115` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:116` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:118` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:119` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:120` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:130` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:131` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:132` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:133` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:140` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:154` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:159` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:165` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:170` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:176` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:181` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/entities/EntityDetailModal.tsx:196` | Runtime style requires review and CSS custom-property preference. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:39` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:72` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:93` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:114` | Selector depends on another component's DOM structure. |
| info | dynamic-style | `src/frontend/dm/entities/relations/RelationshipEdge.tsx:99` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/entities/relations/RelationshipGraphCanvas.tsx:541` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignModals.tsx:367` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:115` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:116` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:152` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:163` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:211` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:260` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubHero.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubHero.tsx:76` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:40` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubSidebar.tsx:70` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubTopBar.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubTopBar.tsx:59` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/layouts/campaign-route-transitions.css:48` | Literal visual color outside a registered theme package. |
| high | mixed-responsibility | `src/frontend/dm/library/boards/entityBoards.css:1` | Large stylesheet requires atomization (243 lines, 37 selectors). |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:45` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:46` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:47` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:48` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:49` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:53` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:54` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:55` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:56` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:57` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:58` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:59` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:60` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:61` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:62` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:66` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:67` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:68` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:69` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:70` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:74` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:75` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:76` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:77` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:78` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:79` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:80` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:81` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:85` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:87` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:88` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:89` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:94` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:95` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:96` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:97` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:185` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:186` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:186` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:187` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:187` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:263` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:264` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/boards/EntityBoardsView.tsx:378` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:387` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:405` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:406` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:409` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:414` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:421` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:422` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:428` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/notebooks/NotebooksView.tsx:437` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:515` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:548` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:552` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:578` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/notebooks/NotebooksView.tsx:588` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:589` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:595` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:618` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:622` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:626` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/library/notebooks/notebooksWorkspace.css:1` | Large stylesheet requires atomization (293 lines, 50 selectors). |
| high | literal-color | `src/frontend/dm/map/network/NetworkFactNode.tsx:19` | Literal visual color outside a registered theme package. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkFactNode.tsx:19` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/map/network/NetworkFilterBar.tsx:165` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/map/network/networkFlow.css:1` | Large stylesheet requires atomization (805 lines, 113 selectors). |
| high | cross-component-selector | `src/frontend/dm/map/network/networkFlow.css:28` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:413` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:415` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:419` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:428` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:429` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:430` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:433` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:440` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:441` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:446` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:455` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:462` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:463` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:467` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:468` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:469` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:470` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:685` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/dm/map/network/NetworkInspector.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/network/NetworkRelationEdge.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/map/shared/EntityNodeContent.tsx:66` | Runtime style requires review and CSS custom-property preference. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:29` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:30` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:31` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:32` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:33` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:34` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:35` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:36` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:44` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:50` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:112` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/RelationEdgeLabel.tsx:12` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/ResourceNodeFrame.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/onboarding/campaign-guided-tour.css:1` | Large stylesheet requires atomization (226 lines, 32 selectors). |
| high | cross-component-selector | `src/frontend/dm/onboarding/campaign-guided-tour.css:129` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:144` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:204` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:205` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:206` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:207` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/dm/onboarding/campaign-starter-hub.css:1` | Large stylesheet requires atomization (416 lines, 57 selectors). |
| high | static-inline | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:211` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:326` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:504` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:6` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:6` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:7` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:17` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:17` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:28` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:34` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:38` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:41` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:47` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:53` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:53` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:55` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:59` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:66` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:76` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:81` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:81` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:86` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:95` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:97` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:101` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:101` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:105` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:105` | Selector depends on another component's DOM structure. |
| high | mixed-responsibility | `src/frontend/dm/pages/rulesPage.css:1` | Large stylesheet requires atomization (179 lines, 32 selectors). |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:77` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:79` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:108` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/people/group/groupWorkspace.css:1` | Large stylesheet requires atomization (631 lines, 93 selectors). |
| critical | mixed-responsibility | `src/frontend/dm/people/peopleWorkspace.css:1` | Large stylesheet requires atomization (394 lines, 61 selectors). |
| critical | mixed-responsibility | `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css:1` | Large stylesheet requires atomization (322 lines, 46 selectors). |
| high | literal-color | `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css:96` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css:97` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/sessions/consequenceChain/SessionConsequenceChainCanvas.tsx:55` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/sessions/narrativeMap/sessionNarrativeMap.css:1` | Large stylesheet requires atomization (279 lines, 40 selectors). |
| high | static-inline | `src/frontend/dm/sessions/narrativeMap/SessionNarrativeMapCanvas.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:76` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/story/history/campaignHistory.css:1` | Large stylesheet requires atomization (295 lines, 41 selectors). |
| critical | mixed-responsibility | `src/frontend/dm/story/plan/storyPlanWorkspace.css:1` | Large stylesheet requires atomization (276 lines, 96 selectors). |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:2` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:69` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:105` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/story/plan/storyPlanWorkspace.css:109` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:112` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:126` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:137` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:142` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:152` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:188` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:189` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:190` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:210` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:237` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:237` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:237` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:237` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:258` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/home/AccountHomePage.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/home/AccountHomePage.tsx:60` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/home/AccountHomePage.tsx:97` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/institutional/institutional.css:1` | Large stylesheet requires atomization (274 lines, 38 selectors). |
| info | dynamic-style | `src/frontend/MainLanding.tsx:92` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:95` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:98` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:101` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:104` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:87` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignsPage.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignsPage.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:36` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerMessagesPage.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerMessagesPage.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/CampaignTemplateImportDialog.tsx:114` | Runtime style requires review and CSS custom-property preference. |
| high | mixed-responsibility | `src/frontend/shared/components/entityImageReframeDialog.css:1` | Large stylesheet requires atomization (329 lines, 42 selectors). |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:11` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:27` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:67` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:68` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:103` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:131` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:133` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:134` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/components/entityImageReframeDialog.css:147` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:163` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:218` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:222` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:226` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:226` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:228` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:276` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:280` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:281` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:282` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:283` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:284` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:285` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:287` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:288` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:289` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:290` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:291` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:292` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:294` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:295` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:325` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:71` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/PwaUpdateBanner.tsx:18` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/PwaUpdateBanner.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/RpgPortalBackground.tsx:33` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/RpgPortalBackground.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/RpgPortalBackground.tsx:149` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-announcements.css:1` | Large stylesheet requires atomization (37 lines, 37 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/admin-audit.css:1` | Large stylesheet requires atomization (117 lines, 46 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-campaigns.css:1` | Large stylesheet requires atomization (36 lines, 36 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-purge.css:1` | Large stylesheet requires atomization (41 lines, 37 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-users.css:1` | Large stylesheet requires atomization (67 lines, 42 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/campaign-canvas.css:1` | Large stylesheet requires atomization (1689 lines, 260 selectors). |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:497` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:498` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:502` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:503` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:530` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:531` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/features/campaign-canvas.css:635` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:762` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:763` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:959` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:963` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/features/campaign-canvas.css:967` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/features/campaign-canvas.css:968` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/features/campaign-canvas.css:1001` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/features/campaign-canvas.css:1002` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1093` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1218` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1219` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1223` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1241` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1245` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1246` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1247` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1248` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1253` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1254` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1255` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1259` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1260` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1261` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1265` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1266` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1267` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1318` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1405` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1406` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1440` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1443` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1476` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1479` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1486` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1489` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1492` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1495` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1498` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1502` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1505` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1509` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1512` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1515` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1518` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1519` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1520` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1521` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1522` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1523` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1524` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1525` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1526` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1531` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1532` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1533` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1536` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1537` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1541` | Important declarations bypass the intended cascade. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/campaign-messaging.css:1` | Large stylesheet requires atomization (39 lines, 38 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/campaign-template.css:1` | Large stylesheet requires atomization (729 lines, 105 selectors). |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:441` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:446` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:447` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dashboard-overview.css:1` | Large stylesheet requires atomization (49 lines, 46 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-dashboard.css:1` | Large stylesheet requires atomization (507 lines, 71 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-hub-dashboard.css:1` | Large stylesheet requires atomization (1371 lines, 215 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-hub.css:1` | Large stylesheet requires atomization (589 lines, 73 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/entity-relations.css:1` | Large stylesheet requires atomization (51 lines, 47 selectors). |
| high | literal-color | `src/frontend/shared/styles/features/kanban.css:84` | Literal visual color outside a registered theme package. |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/landing-archive.css:1` | Large stylesheet requires atomization (864 lines, 136 selectors). |
| high | important | `src/frontend/shared/styles/features/landing-archive.css:628` | Important declarations bypass the intended cascade. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/player-campaign.css:1` | Large stylesheet requires atomization (38 lines, 37 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/player-portal.css:1` | Large stylesheet requires atomization (988 lines, 153 selectors). |
| high | literal-color | `src/frontend/shared/styles/features/player-portal.css:277` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:318` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:329` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:330` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/features/player-portal.css:710` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/features/player-portal.css:734` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:773` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:781` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:786` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:787` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/quick-capture.css:36` | Important declarations bypass the intended cascade. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/timeline.css:1` | Large stylesheet requires atomization (217 lines, 37 selectors). |
| high | literal-color | `src/frontend/shared/styles/features/timeline.css:89` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:17` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:1` | Selector depends on another component's DOM structure. |
| critical | mixed-responsibility | `src/frontend/shared/styles/landing.css:1` | Large stylesheet requires atomization (2641 lines, 392 selectors). |
| high | literal-color | `src/frontend/shared/styles/landing.css:13` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:14` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:15` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:16` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:17` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:19` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:20` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:21` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:22` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:23` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:24` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:25` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:26` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:27` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:28` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:29` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:30` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:31` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:32` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:33` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:34` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:35` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:36` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:37` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:38` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:39` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:40` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:41` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:42` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:43` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:44` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:45` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:46` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:47` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:206` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:209` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:210` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:211` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:474` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:476` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:599` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:605` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:696` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:700` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:701` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:702` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:703` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:707` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:711` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:712` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:716` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:720` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:721` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:725` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:729` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:730` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:731` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/landing.css:859` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:860` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1815` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2284` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2285` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2286` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2290` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2291` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2292` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2296` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2297` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2298` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2302` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2303` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2304` | Literal visual color outside a registered theme package. |
| critical | mixed-responsibility | `src/frontend/shared/styles/layout/campaign-navigation.css:1` | Large stylesheet requires atomization (744 lines, 97 selectors). |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:160` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:164` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:168` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:230` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:231` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:232` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:233` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:235` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:291` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:295` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:299` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/layout/campaign-navigation.css:299` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:493` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:671` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:672` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:676` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:677` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:682` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:686` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:690` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:691` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:692` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:693` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:697` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:701` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:706` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:717` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:740` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation.css:741` | Important declarations bypass the intended cascade. |
| medium | global-selector | `src/frontend/shared/styles/layout/grid.css:1` | Generic selector has global collision risk. |
| critical | mixed-responsibility | `src/frontend/shared/styles/layout/workspace.css:1` | Large stylesheet requires atomization (1009 lines, 150 selectors). |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:115` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:421` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:433` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:466` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:509` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:655` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:701` | Literal visual color outside a registered theme package. |
