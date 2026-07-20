# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 386,
  "tsxFilesWithInlineStyles": 15,
  "forbiddenLiteralColors": 0,
  "staticInlineStyles": 0,
  "dynamicInlineStyles": 20,
  "unknownCssVariables": 0,
  "legacyCssVariables": 0,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 0,
  "crossComponentSelectors": 0,
  "importantDeclarations": 381,
  "unclassifiedCssFiles": 0
}
```

## Stylesheets

| File | Layer | Domain | Lines | Selectors | Importers |
|---|---:|---:|---:|---:|---:|
| `src/frontend/account/account-styles/account-styles-01.css` | feature | account | 171 | 22 | 1 |
| `src/frontend/account/account-styles/account-styles-02.css` | feature | account | 189 | 29 | 1 |
| `src/frontend/account/account-styles/account-styles-03.css` | feature | account | 182 | 28 | 1 |
| `src/frontend/account/account-styles/account-styles-04.css` | feature | account | 171 | 24 | 1 |
| `src/frontend/account/account-styles/account-styles-05.css` | feature | account | 114 | 15 | 1 |
| `src/frontend/account/account.css` | feature | account | 6 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-01.css` | feature | canvas | 28 | 4 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-02.css` | feature | canvas | 160 | 16 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css` | feature | canvas | 102 | 13 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01.css` | feature | canvas | 4 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01.css` | feature | canvas | 2 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css` | feature | canvas | 2 | 0 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-01.css` | feature | entities | 104 | 13 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-02.css` | feature | entities | 78 | 12 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-03.css` | feature | entities | 103 | 12 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-04.css` | feature | entities | 99 | 12 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-05.css` | feature | entities | 14 | 2 | 1 |
| `src/frontend/dm/entities/entity-card.css` | feature | entities | 6 | 0 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css` | feature | entities | 125 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css` | feature | entities | 75 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css` | feature | entities | 98 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css` | feature | entities | 100 | 18 | 1 |
| `src/frontend/dm/entities/entity-detail-modal.css` | feature | entities | 216 | 24 | 2 |
| `src/frontend/dm/entities/entity-grid.css` | feature | entities | 16 | 2 | 1 |
| `src/frontend/dm/entities/entity-list-toolbar.css` | feature | entities | 97 | 14 | 1 |
| `src/frontend/dm/entities/entity-summary-character-sheet.css` | feature | entities | 179 | 26 | 1 |
| `src/frontend/dm/entities/entity-summary.css` | feature | entities | 144 | 23 | 1 |
| `src/frontend/dm/entities/entityDetailDialog.css` | feature | entities | 5 | 0 | 2 |
| `src/frontend/dm/entities/entityDetailHeroActions.css` | feature | entities | 57 | 7 | 2 |
| `src/frontend/dm/entities/entityDetailImageContinuation.css` | feature | entities | 183 | 16 | 2 |
| `src/frontend/dm/entities/playerCharacterDetail.css` | feature | entities | 145 | 20 | 1 |
| `src/frontend/dm/entities/relations/relationshipGraph.css` | feature | entities | 154 | 22 | 2 |
| `src/frontend/dm/entities/type-metadata-form.css` | feature | entities | 30 | 4 | 1 |
| `src/frontend/dm/layouts/campaign-route-transitions.css` | layout | layout | 82 | 14 | 1 |
| `src/frontend/dm/library/boards/entity-board-parts/entity-board-parts-01.css` | feature | library | 75 | 10 | 1 |
| `src/frontend/dm/library/boards/entity-board-parts/entity-board-parts-02.css` | feature | library | 82 | 10 | 1 |
| `src/frontend/dm/library/boards/entity-board-parts/entity-board-parts-03.css` | feature | library | 88 | 14 | 1 |
| `src/frontend/dm/library/boards/entityBoards.css` | feature | library | 4 | 0 | 1 |
| `src/frontend/dm/library/list/entity-list-toolbar-controls.css` | feature | library | 118 | 17 | 1 |
| `src/frontend/dm/library/list/entity-list-view.css` | feature | library | 117 | 18 | 1 |
| `src/frontend/dm/library/list/entityListRefinements.css` | feature | library | 96 | 14 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-01.css` | feature | library | 56 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-02.css` | feature | library | 63 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-03.css` | feature | library | 79 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-04.css` | feature | library | 98 | 18 | 1 |
| `src/frontend/dm/library/notebooks/notebooksWorkspace.css` | feature | library | 5 | 0 | 1 |
| `src/frontend/dm/map/mapWorkspace.css` | feature | map | 94 | 13 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-01.css` | feature | map | 83 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-02.css` | feature | map | 75 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-03.css` | feature | map | 101 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-04.css` | feature | map | 88 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-05.css` | feature | map | 81 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css` | feature | map | 66 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-07.css` | feature | map | 90 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-08.css` | feature | map | 80 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-09.css` | feature | map | 60 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-10.css` | feature | map | 115 | 23 | 1 |
| `src/frontend/dm/map/network/networkFlow.css` | feature | map | 11 | 0 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-01.css` | feature | onboarding | 68 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-02.css` | feature | onboarding | 88 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-03.css` | feature | onboarding | 72 | 11 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour.css` | feature | onboarding | 4 | 0 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub-parts/campaign-starter-hub-parts-01.css` | feature | onboarding | 84 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub-parts/campaign-starter-hub-parts-02.css` | feature | onboarding | 77 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub-parts/campaign-starter-hub-parts-03.css` | feature | onboarding | 72 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub-parts/campaign-starter-hub-parts-04.css` | feature | onboarding | 66 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub-parts/campaign-starter-hub-parts-05.css` | feature | onboarding | 85 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub-parts/campaign-starter-hub-parts-06.css` | feature | onboarding | 40 | 7 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub.css` | feature | onboarding | 7 | 0 | 1 |
| `src/frontend/dm/pages/campaignMessagesPage.css` | feature | pages | 113 | 20 | 1 |
| `src/frontend/dm/pages/rules-page-parts/rules-page-parts-01-parts/rules-page-parts-01-parts-01-split/rules-page-parts-01-parts-01-01.css` | feature | pages | 45 | 8 | 1 |
| `src/frontend/dm/pages/rules-page-parts/rules-page-parts-01-parts/rules-page-parts-01-parts-01-split/rules-page-parts-01-parts-01-02.css` | feature | pages | 50 | 8 | 1 |
| `src/frontend/dm/pages/rules-page-parts/rules-page-parts-01-parts/rules-page-parts-01-parts-01-split/rules-page-parts-01-parts-01-03.css` | feature | pages | 58 | 8 | 1 |
| `src/frontend/dm/pages/rules-page-parts/rules-page-parts-01-parts/rules-page-parts-01-parts-01-split/rules-page-parts-01-parts-01-04.css` | feature | pages | 32 | 6 | 1 |
| `src/frontend/dm/pages/rules-page-parts/rules-page-parts-01-parts/rules-page-parts-01-parts-01.css` | feature | pages | 5 | 0 | 1 |
| `src/frontend/dm/pages/rules-page-parts/rules-page-parts-01.css` | feature | pages | 2 | 0 | 1 |
| `src/frontend/dm/pages/rulesPage.css` | feature | pages | 2 | 0 | 1 |
| `src/frontend/dm/pages/settingsPage.css` | feature | pages | 135 | 19 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-01.css` | feature | people | 85 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-02.css` | feature | people | 69 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-03.css` | feature | people | 75 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-04.css` | feature | people | 85 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-05.css` | feature | people | 72 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-06.css` | feature | people | 70 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-07.css` | feature | people | 66 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace-parts/group-workspace-parts-08.css` | feature | people | 116 | 19 | 1 |
| `src/frontend/dm/people/group/groupWorkspace.css` | feature | people | 9 | 0 | 1 |
| `src/frontend/dm/people/people-workspace-parts/people-workspace-parts-01.css` | feature | people | 73 | 10 | 1 |
| `src/frontend/dm/people/people-workspace-parts/people-workspace-parts-02.css` | feature | people | 76 | 10 | 1 |
| `src/frontend/dm/people/people-workspace-parts/people-workspace-parts-03.css` | feature | people | 75 | 10 | 1 |
| `src/frontend/dm/people/people-workspace-parts/people-workspace-parts-04.css` | feature | people | 67 | 10 | 1 |
| `src/frontend/dm/people/people-workspace-parts/people-workspace-parts-05.css` | feature | people | 72 | 13 | 1 |
| `src/frontend/dm/people/people-workspace-parts/people-workspace-parts-06.css` | feature | people | 36 | 6 | 1 |
| `src/frontend/dm/people/peopleWorkspace.css` | feature | people | 7 | 0 | 1 |
| `src/frontend/dm/sessions/components/active-session-prep.css` | feature | sessions | 140 | 22 | 1 |
| `src/frontend/dm/sessions/components/prepared-session.css` | feature | sessions | 136 | 20 | 2 |
| `src/frontend/dm/sessions/components/quick-capture.css` | feature | sessions | 46 | 6 | 1 |
| `src/frontend/dm/sessions/components/quick-note.css` | feature | sessions | 13 | 3 | 1 |
| `src/frontend/dm/sessions/components/session-actions.css` | feature | sessions | 120 | 23 | 1 |
| `src/frontend/dm/sessions/components/session-event-feed.css` | feature | sessions | 139 | 22 | 1 |
| `src/frontend/dm/sessions/components/session-forms.css` | feature | sessions | 142 | 24 | 4 |
| `src/frontend/dm/sessions/components/session-history.css` | feature | sessions | 75 | 10 | 2 |
| `src/frontend/dm/sessions/components/session-idle.css` | feature | sessions | 130 | 21 | 2 |
| `src/frontend/dm/sessions/components/session-linked-list.css` | feature | sessions | 25 | 4 | 1 |
| `src/frontend/dm/sessions/components/session-status.css` | feature | sessions | 74 | 9 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain-parts/consequence-chain-parts-01.css` | feature | sessions | 76 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain-parts/consequence-chain-parts-02.css` | feature | sessions | 78 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain-parts/consequence-chain-parts-03.css` | feature | sessions | 64 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain-parts/consequence-chain-parts-04.css` | feature | sessions | 77 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain-parts/consequence-chain-parts-05.css` | feature | sessions | 31 | 5 | 1 |
| `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css` | feature | sessions | 6 | 0 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map-parts/narrative-map-parts-01.css` | feature | sessions | 77 | 10 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map-parts/narrative-map-parts-02.css` | feature | sessions | 67 | 10 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map-parts/narrative-map-parts-03.css` | feature | sessions | 67 | 10 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map-parts/narrative-map-parts-04.css` | feature | sessions | 71 | 9 | 1 |
| `src/frontend/dm/sessions/narrativeMap/sessionNarrativeMap.css` | feature | sessions | 5 | 0 | 1 |
| `src/frontend/dm/sessions/session-workspace.css` | feature | sessions | 18 | 3 | 4 |
| `src/frontend/dm/story/history/campaign-history-parts/campaign-history-parts-01.css` | feature | story | 88 | 10 | 1 |
| `src/frontend/dm/story/history/campaign-history-parts/campaign-history-parts-02.css` | feature | story | 85 | 10 | 1 |
| `src/frontend/dm/story/history/campaign-history-parts/campaign-history-parts-03.css` | feature | story | 76 | 10 | 1 |
| `src/frontend/dm/story/history/campaign-history-parts/campaign-history-parts-04.css` | feature | story | 49 | 9 | 1 |
| `src/frontend/dm/story/history/campaignHistory.css` | feature | story | 5 | 0 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css` | feature | story | 75 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css` | feature | story | 102 | 18 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-03.css` | feature | story | 27 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-04.css` | feature | story | 14 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-05.css` | feature | story | 15 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-06.css` | feature | story | 14 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-07.css` | feature | story | 14 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-08.css` | feature | story | 12 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-09.css` | feature | story | 12 | 5 | 1 |
| `src/frontend/dm/story/plan/storyPlanWorkspace.css` | feature | story | 10 | 0 | 1 |
| `src/frontend/institutional/institutional-parts/institutional-parts-01.css` | feature | institutional | 147 | 16 | 1 |
| `src/frontend/institutional/institutional-parts/institutional-parts-02.css` | feature | institutional | 128 | 20 | 1 |
| `src/frontend/institutional/institutional.css` | feature | institutional | 3 | 0 | 1 |
| `src/frontend/player/pages/playerCampaignShell.css` | feature | player | 174 | 27 | 1 |
| `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-01.css` | component | shared-components | 146 | 17 | 1 |
| `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css` | component | shared-components | 184 | 23 | 1 |
| `src/frontend/shared/components/entityImageReframeDialog.css` | component | shared-components | 3 | 0 | 1 |
| `src/frontend/shared/components/watermark.css` | component | shared-components | 33 | 4 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-01.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-02.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-03.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-04.css` | feature | shared | 8 | 7 | 1 |
| `src/frontend/shared/styles/features/admin-announcements.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-01.css` | feature | shared | 52 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-02.css` | feature | shared | 30 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-03.css` | feature | shared | 15 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-04.css` | feature | shared | 23 | 14 | 1 |
| `src/frontend/shared/styles/features/admin-audit.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-01.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-02.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-03.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-04.css` | feature | shared | 7 | 6 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-game-systems.css` | feature | shared | 24 | 23 | 1 |
| `src/frontend/shared/styles/features/admin-invitations.css` | feature | shared | 27 | 26 | 1 |
| `src/frontend/shared/styles/features/admin-overview.css` | feature | shared | 28 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-01.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-02.css` | feature | shared | 12 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-03.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-04.css` | feature | shared | 11 | 6 | 1 |
| `src/frontend/shared/styles/features/admin-purge.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-security.css` | feature | shared | 16 | 15 | 1 |
| `src/frontend/shared/styles/features/admin-template-settings.css` | feature | shared | 25 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-01.css` | feature | shared | 32 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-02.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-03.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-04.css` | feature | shared | 16 | 11 | 1 |
| `src/frontend/shared/styles/features/admin-users.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/auth.css` | feature | shared | 60 | 15 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-01.css` | feature | shared | 206 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-02.css` | feature | shared | 181 | 24 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css` | feature | shared | 157 | 21 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-04.css` | feature | shared | 141 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-05.css` | feature | shared | 119 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-06.css` | feature | shared | 172 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-07.css` | feature | shared | 203 | 30 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css` | feature | shared | 173 | 24 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-01.css` | feature | shared | 87 | 11 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-02.css` | feature | shared | 53 | 11 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css` | feature | shared | 34 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css` | feature | shared | 20 | 3 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css` | feature | shared | 161 | 21 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas.css` | feature | shared | 11 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/campaign-messaging-01.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/campaign-messaging-02.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/campaign-messaging-03.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/campaign-messaging-04.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-01.css` | feature | shared | 78 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-02.css` | feature | shared | 70 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-03.css` | feature | shared | 74 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-04.css` | feature | shared | 65 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-05.css` | feature | shared | 89 | 15 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-06.css` | feature | shared | 66 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-07.css` | feature | shared | 89 | 11 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-08.css` | feature | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-09.css` | feature | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/campaign-template-10.css` | feature | shared | 51 | 6 | 1 |
| `src/frontend/shared/styles/features/campaign-template.css` | feature | shared | 11 | 0 | 1 |
| `src/frontend/shared/styles/features/canvas-board-dialogs.css` | feature | shared | 28 | 27 | 1 |
| `src/frontend/shared/styles/features/canvas-bulk-actions.css` | feature | shared | 7 | 1 | 1 |
| `src/frontend/shared/styles/features/canvas-dialog-forms.css` | feature | shared | 65 | 13 | 1 |
| `src/frontend/shared/styles/features/canvas-entity-node.css` | feature | shared | 131 | 23 | 1 |
| `src/frontend/shared/styles/features/canvas-flow.css` | feature | shared | 35 | 5 | 1 |
| `src/frontend/shared/styles/features/canvas-group-hulls.css` | feature | shared | 23 | 3 | 1 |
| `src/frontend/shared/styles/features/canvas-inspector.css` | feature | shared | 93 | 14 | 1 |
| `src/frontend/shared/styles/features/canvas-mystery-health.css` | feature | shared | 76 | 13 | 1 |
| `src/frontend/shared/styles/features/canvas-narrative-lint.css` | feature | shared | 80 | 14 | 1 |
| `src/frontend/shared/styles/features/canvas-page-header.css` | feature | shared | 18 | 17 | 1 |
| `src/frontend/shared/styles/features/canvas-palette.css` | feature | shared | 195 | 30 | 1 |
| `src/frontend/shared/styles/features/canvas-presentation.css` | feature | shared | 11 | 1 | 1 |
| `src/frontend/shared/styles/features/canvas-toolbar.css` | feature | shared | 24 | 5 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-overview-01.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-overview-02.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-overview-03.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-overview-04.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-overview-05.css` | feature | shared | 10 | 5 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview.css` | feature | shared | 6 | 0 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-01.css` | feature | shared | 90 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-02.css` | feature | shared | 80 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-03.css` | feature | shared | 71 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-04.css` | feature | shared | 91 | 13 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-05.css` | feature | shared | 80 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-06.css` | feature | shared | 70 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dm-dashboard-07.css` | feature | shared | 31 | 5 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard.css` | feature | shared | 8 | 0 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-01.css` | feature | shared | 84 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-02.css` | feature | shared | 79 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-03.css` | feature | shared | 86 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-04.css` | feature | shared | 94 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-05.css` | feature | shared | 77 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-06.css` | feature | shared | 77 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-07.css` | feature | shared | 85 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/dm-hub-08.css` | feature | shared | 14 | 2 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-activity.css` | feature | shared | 156 | 20 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-campaign-cards.css` | feature | shared | 240 | 30 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-campaign-layout.css` | feature | shared | 223 | 30 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-dialogs.css` | feature | shared | 66 | 28 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-responsive-details.css` | feature | shared | 64 | 14 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-responsive-shell.css` | feature | shared | 95 | 17 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-responsive-workspaces.css` | feature | shared | 135 | 22 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-shell.css` | feature | shared | 230 | 30 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-summary.css` | feature | shared | 141 | 20 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard/dm-hub-template-library.css` | feature | shared | 89 | 12 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard.css` | feature | shared | 11 | 0 | 1 |
| `src/frontend/shared/styles/features/dm-hub.css` | feature | shared | 9 | 0 | 1 |
| `src/frontend/shared/styles/features/dm-onboarding.css` | feature | shared | 20 | 19 | 1 |
| `src/frontend/shared/styles/features/entity-create.css` | feature | shared | 32 | 6 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-relations-01.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-relations-02.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-relations-03.css` | feature | shared | 12 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-relations-04.css` | feature | shared | 12 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-relations-05.css` | feature | shared | 9 | 7 | 1 |
| `src/frontend/shared/styles/features/entity-relations.css` | feature | shared | 6 | 0 | 1 |
| `src/frontend/shared/styles/features/entity-trace.css` | feature | shared | 23 | 18 | 1 |
| `src/frontend/shared/styles/features/graph-search.css` | feature | shared | 77 | 8 | 1 |
| `src/frontend/shared/styles/features/image-picker-button.css` | feature | shared | 12 | 11 | 1 |
| `src/frontend/shared/styles/features/image-picker-modal.css` | feature | shared | 215 | 28 | 1 |
| `src/frontend/shared/styles/features/kanban-board.css` | feature | shared | 177 | 26 | 1 |
| `src/frontend/shared/styles/features/kanban.css` | feature | shared | 104 | 17 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-01.css` | feature | shared | 119 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-02.css` | feature | shared | 84 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-03.css` | feature | shared | 83 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-04.css` | feature | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-05.css` | feature | shared | 85 | 12 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-06.css` | feature | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-07.css` | feature | shared | 66 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-08.css` | feature | shared | 65 | 10 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-09.css` | feature | shared | 64 | 12 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-10.css` | feature | shared | 60 | 11 | 1 |
| `src/frontend/shared/styles/features/landing-archive/landing-archive-11.css` | feature | shared | 102 | 25 | 1 |
| `src/frontend/shared/styles/features/landing-archive.css` | feature | shared | 12 | 0 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-01-split/player-campaign-01-01.css` | feature | shared | 9 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-01-split/player-campaign-01-02.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-01-split/player-campaign-01-03.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-01-split/player-campaign-01-04.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-01-split/player-campaign-01-05.css` | feature | shared | 7 | 5 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-01.css` | feature | shared | 6 | 0 | 1 |
| `src/frontend/shared/styles/features/player-campaign.css` | feature | shared | 2 | 0 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-01.css` | feature | shared | 110 | 15 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-02.css` | feature | shared | 72 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-03.css` | feature | shared | 105 | 12 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-04.css` | feature | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-05.css` | feature | shared | 90 | 12 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-06.css` | feature | shared | 39 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-07.css` | feature | shared | 48 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-08.css` | feature | shared | 77 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-09.css` | feature | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-10.css` | feature | shared | 63 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-11.css` | feature | shared | 144 | 23 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-12.css` | feature | shared | 79 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-portal-13.css` | feature | shared | 52 | 8 | 1 |
| `src/frontend/shared/styles/features/player-portal.css` | feature | shared | 14 | 0 | 1 |
| `src/frontend/shared/styles/features/player-profile-modal.css` | feature | shared | 18 | 4 | 1 |
| `src/frontend/shared/styles/features/pwa-update-banner.css` | feature | shared | 30 | 2 | 1 |
| `src/frontend/shared/styles/features/quick-capture.css` | feature | shared | 142 | 17 | 1 |
| `src/frontend/shared/styles/features/relation-edge-label.css` | feature | shared | 19 | 2 | 1 |
| `src/frontend/shared/styles/features/rules-workspace.css` | feature | shared | 73 | 10 | 1 |
| `src/frontend/shared/styles/features/session-prep-form.css` | feature | shared | 53 | 9 | 1 |
| `src/frontend/shared/styles/features/shortcuts-panel.css` | feature | shared | 66 | 11 | 1 |
| `src/frontend/shared/styles/features/sidebar-nav.css` | feature | shared | 15 | 2 | 1 |
| `src/frontend/shared/styles/features/system-announcements.css` | feature | shared | 91 | 12 | 1 |
| `src/frontend/shared/styles/features/timeline/timeline-01.css` | feature | shared | 112 | 21 | 1 |
| `src/frontend/shared/styles/features/timeline/timeline-02.css` | feature | shared | 105 | 14 | 1 |
| `src/frontend/shared/styles/features/timeline.css` | feature | shared | 3 | 0 | 1 |
| `src/frontend/shared/styles/foundation/accessibility.css` | foundation | shared | 8 | 2 | 1 |
| `src/frontend/shared/styles/foundation/color-scheme.css` | foundation | shared | 12 | 3 | 1 |
| `src/frontend/shared/styles/foundation/fonts.css` | foundation | shared | 16 | 0 | 1 |
| `src/frontend/shared/styles/foundation/motion.css` | foundation | shared | 28 | 3 | 1 |
| `src/frontend/shared/styles/foundation/reset.css` | foundation | shared | 46 | 6 | 1 |
| `src/frontend/shared/styles/foundation/structural-tokens.css` | foundation | shared | 20 | 1 | 1 |
| `src/frontend/shared/styles/landing/landing-01.css` | feature | shared | 173 | 18 | 1 |
| `src/frontend/shared/styles/landing/landing-02.css` | feature | shared | 129 | 15 | 1 |
| `src/frontend/shared/styles/landing/landing-03.css` | feature | shared | 169 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-04.css` | feature | shared | 151 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-05/landing-05-01.css` | feature | shared | 50 | 18 | 1 |
| `src/frontend/shared/styles/landing/landing-05/landing-05-02.css` | feature | shared | 70 | 19 | 1 |
| `src/frontend/shared/styles/landing/landing-05.css` | feature | shared | 3 | 0 | 1 |
| `src/frontend/shared/styles/landing/landing-06.css` | feature | shared | 153 | 26 | 1 |
| `src/frontend/shared/styles/landing/landing-07.css` | feature | shared | 153 | 24 | 1 |
| `src/frontend/shared/styles/landing/landing-08.css` | feature | shared | 176 | 23 | 1 |
| `src/frontend/shared/styles/landing/landing-09.css` | feature | shared | 207 | 29 | 1 |
| `src/frontend/shared/styles/landing/landing-10.css` | feature | shared | 202 | 20 | 1 |
| `src/frontend/shared/styles/landing/landing-11.css` | feature | shared | 152 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-01.css` | feature | shared | 11 | 2 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-02.css` | feature | shared | 156 | 26 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-03.css` | feature | shared | 48 | 8 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-04.css` | feature | shared | 3 | 0 | 1 |
| `src/frontend/shared/styles/landing/landing-12.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/landing/landing-13.css` | feature | shared | 147 | 20 | 1 |
| `src/frontend/shared/styles/landing/landing-14.css` | feature | shared | 153 | 19 | 1 |
| `src/frontend/shared/styles/landing/landing-15.css` | feature | shared | 197 | 28 | 1 |
| `src/frontend/shared/styles/landing/landing-16.css` | feature | shared | 131 | 21 | 1 |
| `src/frontend/shared/styles/landing.css` | feature | shared | 17 | 0 | 1 |
| `src/frontend/shared/styles/layout/admin-shell.css` | layout | shared | 134 | 22 | 1 |
| `src/frontend/shared/styles/layout/app-shell.css` | layout | shared | 42 | 7 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-01.css` | layout | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-01.css` | layout | shared | 55 | 6 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-01.css` | layout | shared | 24 | 3 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css` | layout | shared | 142 | 16 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-03.css` | layout | shared | 156 | 16 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02.css` | layout | shared | 4 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-03/campaign-navigation-02-01-03-01.css` | layout | shared | 145 | 16 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-03/campaign-navigation-02-01-03-02.css` | layout | shared | 114 | 12 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-03.css` | layout | shared | 3 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01.css` | layout | shared | 4 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02.css` | layout | shared | 2 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css` | layout | shared | 88 | 15 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation.css` | layout | shared | 4 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-shell.css` | layout | shared | 202 | 30 | 1 |
| `src/frontend/shared/styles/layout/footer.css` | layout | shared | 128 | 16 | 1 |
| `src/frontend/shared/styles/layout/grid.css` | layout | shared | 26 | 5 | 1 |
| `src/frontend/shared/styles/layout/navigation.css` | layout | shared | 119 | 13 | 1 |
| `src/frontend/shared/styles/layout/responsive.css` | layout | shared | 63 | 11 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-01.css` | layout | shared | 80 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-02.css` | layout | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-03.css` | layout | shared | 87 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-04.css` | layout | shared | 69 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-05.css` | layout | shared | 61 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-06.css` | layout | shared | 73 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-07.css` | layout | shared | 62 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-08.css` | layout | shared | 78 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-09.css` | layout | shared | 63 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-10.css` | layout | shared | 76 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-11.css` | layout | shared | 162 | 26 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-12.css` | layout | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-13.css` | layout | shared | 62 | 12 | 1 |
| `src/frontend/shared/styles/layout/workspace.css` | layout | shared | 14 | 0 | 1 |
| `src/frontend/shared/styles/main.css` | foundation | shared | 92 | 0 | 1 |
| `src/frontend/shared/styles/primitives/badge.css` | primitive | shared | 54 | 8 | 1 |
| `src/frontend/shared/styles/primitives/button.css` | primitive | shared | 94 | 12 | 1 |
| `src/frontend/shared/styles/primitives/card.css` | primitive | shared | 84 | 12 | 1 |
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
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-02.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar-parts/canvas-mobile-toolbar-parts-01-split/canvas-mobile-toolbar-parts-01-01-parts/canvas-mobile-toolbar-parts-01-01-03.css:99` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:203` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:40` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:63` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:65` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:104` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:108` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:113` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:114` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:115` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:124` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:27` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:28` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:28` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:65` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:70` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:71` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:72` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:72` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:86` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:154` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:158` | Important declarations bypass the intended cascade. |
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
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:187` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:207` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:208` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:209` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:210` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:211` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:212` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-modal.css:213` | Important declarations bypass the intended cascade. |
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
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:32` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:74` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:85` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:93` | Important declarations bypass the intended cascade. |
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
| info | dynamic-style | `src/frontend/dm/entities/relations/RelationshipEdge.tsx:99` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/entities/relations/RelationshipGraphCanvas.tsx:541` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignModals.tsx:367` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:152` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:211` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:31` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:32` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:48` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-06.css:65` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-07.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-07.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-07.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-07.css:7` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow-parts/network-flow-parts-09.css:54` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkInspector.tsx:32` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkRelationEdge.tsx:43` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/map/shared/EntityNodeContent.tsx:66` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-02.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-02.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-03.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-03.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-03.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour-parts/campaign-guided-tour-parts-03.css:53` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:504` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:7` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:28` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:66` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:76` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:97` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:105` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/sessions/consequenceChain/SessionConsequenceChainCanvas.tsx:55` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/sessions/narrativeMap/SessionNarrativeMapCanvas.tsx:54` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:2` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:69` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-01.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:31` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:63` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-02.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-03.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-03.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-03.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-04.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-06.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-06.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-06.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-06.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan-parts/story-plan-parts-08.css:5` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:93` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:96` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:99` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:102` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:105` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/shared/components/CampaignTemplateImportDialog.tsx:114` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:135` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:136` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:137` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:138` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:139` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:140` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:142` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:143` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:144` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:146` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:147` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:149` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:150` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe-parts/entity-image-reframe-parts-02.css:180` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/shared/components/RpgPortalBackground.tsx:33` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css:112` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css:113` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css:117` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css:118` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-03.css:146` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-05.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-05.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-06.css:159` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-06.css:163` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-07.css:122` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:75` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:82` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:87` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:88` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:89` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:93` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:94` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-08.css:152` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-01.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-01.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-02.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-02.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-02.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:29` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-03.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-09/campaign-canvas-09-04.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css:8` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/campaign-canvas-10.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template/campaign-template-07.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template/campaign-template-07.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template/campaign-template-07.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/landing-archive/landing-archive-08.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-04.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-04.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-04.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-11.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-11.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-11.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-portal-11.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/quick-capture.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:87` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:88` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:89` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-02.css:92` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-03.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-03.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-02/campaign-navigation-02-01-02-03.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-02/campaign-navigation-02-01-split/campaign-navigation-02-01-03/campaign-navigation-02-01-03-01.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:20` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:84` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-03.css:85` | Important declarations bypass the intended cascade. |
| medium | global-selector | `src/frontend/shared/styles/layout/grid.css:1` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/card.css:7` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/dialog.css:44` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/dialog.css:52` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/dialog.css:56` | Generic selector has global collision risk. |
