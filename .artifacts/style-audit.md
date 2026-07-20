# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 362,
  "tsxFilesWithInlineStyles": 13,
  "forbiddenLiteralColors": 0,
  "staticInlineStyles": 0,
  "dynamicInlineStyles": 14,
  "unknownCssVariables": 0,
  "legacyCssVariables": 0,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 0,
  "crossComponentSelectors": 0,
  "importantDeclarations": 380,
  "unclassifiedCssFiles": 0
}
```

## Stylesheets

| File | Layer | Domain | Lines | Selectors | Importers |
|---|---:|---:|---:|---:|---:|
| `src/frontend/account/account/account-components.css` | feature | account | 182 | 28 | 1 |
| `src/frontend/account/account/account-details.css` | feature | account | 171 | 24 | 1 |
| `src/frontend/account/account/account-foundation.css` | feature | account | 171 | 22 | 1 |
| `src/frontend/account/account/account-layout.css` | feature | account | 189 | 29 | 1 |
| `src/frontend/account/account/account-states.css` | feature | account | 114 | 15 | 1 |
| `src/frontend/account/account.css` | feature | account | 6 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-foundation.css` | feature | canvas | 2 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css` | feature | canvas | 102 | 13 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-foundation.css` | feature | canvas | 28 | 4 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-layout.css` | feature | canvas | 160 | 16 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation.css` | feature | canvas | 4 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css` | feature | canvas | 2 | 0 | 1 |
| `src/frontend/dm/entities/entity-card/entity-card-components.css` | feature | entities | 103 | 12 | 1 |
| `src/frontend/dm/entities/entity-card/entity-card-details.css` | feature | entities | 99 | 12 | 1 |
| `src/frontend/dm/entities/entity-card/entity-card-foundation.css` | feature | entities | 104 | 13 | 1 |
| `src/frontend/dm/entities/entity-card/entity-card-layout.css` | feature | entities | 78 | 12 | 1 |
| `src/frontend/dm/entities/entity-card/entity-card-states.css` | feature | entities | 14 | 2 | 1 |
| `src/frontend/dm/entities/entity-card.css` | feature | entities | 6 | 0 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css` | feature | entities | 98 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css` | feature | entities | 100 | 18 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css` | feature | entities | 125 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css` | feature | entities | 75 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-modal.css` | feature | entities | 216 | 24 | 2 |
| `src/frontend/dm/entities/entity-grid.css` | feature | entities | 16 | 2 | 1 |
| `src/frontend/dm/entities/entity-list-toolbar.css` | feature | entities | 97 | 14 | 1 |
| `src/frontend/dm/entities/entity-summary-character-sheet.css` | feature | entities | 179 | 26 | 1 |
| `src/frontend/dm/entities/entity-summary.css` | feature | entities | 144 | 23 | 1 |
| `src/frontend/dm/entities/entityDetailDialog.css` | feature | entities | 5 | 0 | 2 |
| `src/frontend/dm/entities/entityDetailHeroActions.css` | feature | entities | 57 | 7 | 2 |
| `src/frontend/dm/entities/entityDetailImageContinuation.css` | feature | entities | 183 | 16 | 2 |
| `src/frontend/dm/entities/playerCharacterDetail.css` | feature | entities | 145 | 20 | 1 |
| `src/frontend/dm/entities/relations/relationshipGraph.css` | feature | entities | 159 | 23 | 2 |
| `src/frontend/dm/entities/type-metadata-form.css` | feature | entities | 30 | 4 | 1 |
| `src/frontend/dm/layouts/campaign-route-transitions.css` | layout | layout | 82 | 14 | 1 |
| `src/frontend/dm/library/boards/entity-board/entity-board-components.css` | feature | library | 88 | 14 | 1 |
| `src/frontend/dm/library/boards/entity-board/entity-board-foundation.css` | feature | library | 75 | 10 | 1 |
| `src/frontend/dm/library/boards/entity-board/entity-board-layout.css` | feature | library | 82 | 10 | 1 |
| `src/frontend/dm/library/boards/entityBoards.css` | feature | library | 4 | 0 | 1 |
| `src/frontend/dm/library/list/entity-list-toolbar-controls.css` | feature | library | 118 | 17 | 1 |
| `src/frontend/dm/library/list/entity-list-view.css` | feature | library | 117 | 18 | 1 |
| `src/frontend/dm/library/list/entityListRefinements.css` | feature | library | 96 | 14 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace/notebooks-workspace-components.css` | layout | workspace | 79 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace/notebooks-workspace-details.css` | layout | workspace | 98 | 18 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace/notebooks-workspace-foundation.css` | layout | workspace | 56 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace/notebooks-workspace-layout.css` | layout | workspace | 63 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooksWorkspace.css` | feature | library | 5 | 0 | 1 |
| `src/frontend/dm/map/mapWorkspace.css` | feature | map | 94 | 13 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-advanced.css` | feature | map | 60 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-components.css` | feature | map | 101 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-details.css` | feature | map | 88 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-foundation.css` | feature | map | 83 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-interactions.css` | feature | map | 90 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-layout.css` | feature | map | 75 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-media.css` | feature | map | 115 | 23 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-overlays.css` | feature | map | 80 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-responsive.css` | feature | map | 66 | 10 | 1 |
| `src/frontend/dm/map/network/network-flow/network-flow-states.css` | feature | map | 81 | 10 | 1 |
| `src/frontend/dm/map/network/networkFlow.css` | feature | map | 11 | 0 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-components.css` | feature | onboarding | 72 | 11 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-foundation.css` | feature | onboarding | 68 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-layout.css` | feature | onboarding | 88 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour.css` | feature | onboarding | 4 | 0 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub/campaign-starter-hub-components.css` | feature | onboarding | 72 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub/campaign-starter-hub-details.css` | feature | onboarding | 66 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub/campaign-starter-hub-foundation.css` | feature | onboarding | 84 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub/campaign-starter-hub-layout.css` | feature | onboarding | 77 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub/campaign-starter-hub-responsive.css` | feature | onboarding | 40 | 7 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub/campaign-starter-hub-states.css` | feature | onboarding | 85 | 10 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub.css` | feature | onboarding | 7 | 0 | 1 |
| `src/frontend/dm/pages/campaignMessagesPage.css` | feature | pages | 113 | 20 | 1 |
| `src/frontend/dm/pages/rules-page/rules-page-foundation/rules-page-foundation.css` | feature | pages | 5 | 0 | 1 |
| `src/frontend/dm/pages/rules-page/rules-page-foundation/rules-page-split-foundation/rules-page-components.css` | feature | pages | 58 | 8 | 1 |
| `src/frontend/dm/pages/rules-page/rules-page-foundation/rules-page-split-foundation/rules-page-details.css` | feature | pages | 32 | 6 | 1 |
| `src/frontend/dm/pages/rules-page/rules-page-foundation/rules-page-split-foundation/rules-page-foundation.css` | feature | pages | 45 | 8 | 1 |
| `src/frontend/dm/pages/rules-page/rules-page-foundation/rules-page-split-foundation/rules-page-layout.css` | feature | pages | 50 | 8 | 1 |
| `src/frontend/dm/pages/rules-page/rules-page-foundation.css` | feature | pages | 2 | 0 | 1 |
| `src/frontend/dm/pages/rulesPage.css` | feature | pages | 2 | 0 | 1 |
| `src/frontend/dm/pages/settingsPage.css` | feature | pages | 135 | 19 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-components.css` | layout | workspace | 75 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-details.css` | layout | workspace | 85 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-foundation.css` | layout | workspace | 85 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-interactions.css` | layout | workspace | 66 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-layout.css` | layout | workspace | 69 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-overlays.css` | layout | workspace | 116 | 19 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-responsive.css` | layout | workspace | 70 | 10 | 1 |
| `src/frontend/dm/people/group/group-workspace/group-workspace-states.css` | layout | workspace | 72 | 10 | 1 |
| `src/frontend/dm/people/group/groupWorkspace.css` | feature | people | 9 | 0 | 1 |
| `src/frontend/dm/people/people-workspace/people-workspace-components.css` | layout | workspace | 75 | 10 | 1 |
| `src/frontend/dm/people/people-workspace/people-workspace-details.css` | layout | workspace | 67 | 10 | 1 |
| `src/frontend/dm/people/people-workspace/people-workspace-foundation.css` | layout | workspace | 73 | 10 | 1 |
| `src/frontend/dm/people/people-workspace/people-workspace-layout.css` | layout | workspace | 76 | 10 | 1 |
| `src/frontend/dm/people/people-workspace/people-workspace-responsive.css` | layout | workspace | 36 | 6 | 1 |
| `src/frontend/dm/people/people-workspace/people-workspace-states.css` | layout | workspace | 72 | 13 | 1 |
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
| `src/frontend/dm/sessions/consequenceChain/consequence-chain/consequence-chain-components.css` | feature | sessions | 64 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain/consequence-chain-details.css` | feature | sessions | 77 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain/consequence-chain-foundation.css` | feature | sessions | 76 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain/consequence-chain-layout.css` | feature | sessions | 78 | 10 | 1 |
| `src/frontend/dm/sessions/consequenceChain/consequence-chain/consequence-chain-states.css` | feature | sessions | 31 | 5 | 1 |
| `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css` | feature | sessions | 6 | 0 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map/narrative-map-components.css` | feature | sessions | 67 | 10 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map/narrative-map-details.css` | feature | sessions | 71 | 9 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map/narrative-map-foundation.css` | feature | sessions | 77 | 10 | 1 |
| `src/frontend/dm/sessions/narrativeMap/narrative-map/narrative-map-layout.css` | feature | sessions | 67 | 10 | 1 |
| `src/frontend/dm/sessions/narrativeMap/sessionNarrativeMap.css` | feature | sessions | 5 | 0 | 1 |
| `src/frontend/dm/sessions/session-workspace.css` | feature | sessions | 18 | 3 | 4 |
| `src/frontend/dm/story/history/campaign-history/campaign-history-components.css` | feature | story | 76 | 10 | 1 |
| `src/frontend/dm/story/history/campaign-history/campaign-history-details.css` | feature | story | 49 | 9 | 1 |
| `src/frontend/dm/story/history/campaign-history/campaign-history-foundation.css` | feature | story | 88 | 10 | 1 |
| `src/frontend/dm/story/history/campaign-history/campaign-history-layout.css` | feature | story | 85 | 10 | 1 |
| `src/frontend/dm/story/history/campaignHistory.css` | feature | story | 5 | 0 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-advanced.css` | feature | story | 12 | 5 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-components.css` | feature | story | 27 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-details.css` | feature | story | 14 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css` | feature | story | 75 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-interactions.css` | feature | story | 14 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-layout.css` | feature | story | 102 | 18 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-overlays.css` | feature | story | 12 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-responsive.css` | feature | story | 14 | 10 | 1 |
| `src/frontend/dm/story/plan/story-plan/story-plan-states.css` | feature | story | 15 | 10 | 1 |
| `src/frontend/dm/story/plan/storyPlanWorkspace.css` | feature | story | 10 | 0 | 1 |
| `src/frontend/institutional/institutional/institutional-foundation.css` | feature | institutional | 147 | 16 | 1 |
| `src/frontend/institutional/institutional/institutional-layout.css` | feature | institutional | 128 | 20 | 1 |
| `src/frontend/institutional/institutional.css` | feature | institutional | 3 | 0 | 1 |
| `src/frontend/player/pages/playerCampaignShell.css` | feature | player | 174 | 27 | 1 |
| `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-foundation.css` | component | shared-components | 146 | 17 | 1 |
| `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css` | component | shared-components | 184 | 23 | 1 |
| `src/frontend/shared/components/entityImageReframeDialog.css` | component | shared-components | 3 | 0 | 1 |
| `src/frontend/shared/components/watermark.css` | component | shared-components | 33 | 4 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-actions.css` | feature | shared | 8 | 7 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-cards.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-form.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-announcements/admin-announcements-layout.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-announcements.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-details.css` | feature | shared | 23 | 14 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-filters.css` | feature | shared | 30 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-layout.css` | feature | shared | 52 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-audit/admin-audit-table.css` | feature | shared | 15 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-audit.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-actions.css` | feature | shared | 7 | 6 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-filters.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-layout.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns/admin-campaigns-table.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/admin-game-systems.css` | feature | shared | 24 | 23 | 1 |
| `src/frontend/shared/styles/features/admin-invitations.css` | feature | shared | 27 | 26 | 1 |
| `src/frontend/shared/styles/features/admin-overview.css` | feature | shared | 28 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-actions.css` | feature | shared | 11 | 6 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-layout-and-filters.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-status.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-purge/admin-purge-table.css` | feature | shared | 12 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-purge.css` | feature | shared | 5 | 0 | 2 |
| `src/frontend/shared/styles/features/admin-security.css` | feature | shared | 16 | 15 | 1 |
| `src/frontend/shared/styles/features/admin-template-settings.css` | feature | shared | 25 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-actions.css` | feature | shared | 16 | 11 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-filters.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-layout.css` | feature | shared | 32 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-users/admin-users-table.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/admin-users.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/auth.css` | feature | shared | 60 | 15 | 3 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-dashboard.css` | feature | shared | 119 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css` | feature | shared | 108 | 24 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css` | feature | shared | 173 | 24 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css` | feature | shared | 161 | 21 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-layout.css` | feature | shared | 206 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-navigator.css` | feature | shared | 181 | 24 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-notes.css` | feature | shared | 203 | 30 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-overlays.css` | feature | shared | 88 | 11 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css` | feature | shared | 157 | 21 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-resource-card-details.css` | feature | shared | 172 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas/canvas-resource-cards.css` | feature | shared | 141 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas.css` | feature | shared | 12 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/messaging-bubbles.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/messaging-composer.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/messaging-layout.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging/messaging-tones.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-import-dialog.css` | feature | shared | 89 | 11 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-import-feedback.css` | feature | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-import-options.css` | feature | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-import-progress.css` | feature | shared | 51 | 6 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-library.css` | feature | shared | 78 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-preview-editorial.css` | feature | shared | 66 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-preview-hero.css` | feature | shared | 70 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-preview-lists.css` | feature | shared | 89 | 15 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-preview-meta.css` | feature | shared | 74 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template/template-preview-sections.css` | feature | shared | 65 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-template.css` | feature | shared | 11 | 0 | 2 |
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
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-activity.css` | feature | shared | 10 | 5 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-cards.css` | feature | shared | 10 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-checklists.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-grids.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview/dashboard-header.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/dashboard-overview.css` | feature | shared | 6 | 0 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dashboard-history.css` | feature | shared | 91 | 13 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dashboard-metrics-and-memory.css` | feature | shared | 71 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dashboard-shell.css` | feature | shared | 90 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/dashboard-workspace.css` | feature | shared | 80 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/live-table-content.css` | feature | shared | 70 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/live-table-dialog.css` | feature | shared | 80 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard/live-table-responsive.css` | feature | shared | 31 | 5 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard.css` | feature | shared | 8 | 0 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-action-details.css` | feature | shared | 14 | 2 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-active-tables.css` | feature | shared | 77 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-alerts-and-actions.css` | feature | shared | 85 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-campaign-actions.css` | feature | shared | 94 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-campaign-cards.css` | feature | shared | 86 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-shell.css` | feature | shared | 84 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-summary.css` | feature | shared | 77 | 10 | 1 |
| `src/frontend/shared/styles/features/dm-hub/hub-welcome.css` | feature | shared | 79 | 10 | 1 |
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
| `src/frontend/shared/styles/features/entity-relations/entity-connections.css` | feature | shared | 12 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-fact-filters.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-facts.css` | feature | shared | 11 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-graph.css` | feature | shared | 9 | 7 | 1 |
| `src/frontend/shared/styles/features/entity-relations/entity-relation-list.css` | feature | shared | 12 | 10 | 1 |
| `src/frontend/shared/styles/features/entity-relations.css` | feature | shared | 6 | 0 | 1 |
| `src/frontend/shared/styles/features/entity-trace.css` | feature | shared | 23 | 18 | 1 |
| `src/frontend/shared/styles/features/image-picker-button.css` | feature | shared | 12 | 11 | 1 |
| `src/frontend/shared/styles/features/image-picker-modal.css` | feature | shared | 215 | 28 | 1 |
| `src/frontend/shared/styles/features/kanban-board.css` | feature | shared | 177 | 26 | 1 |
| `src/frontend/shared/styles/features/kanban.css` | feature | shared | 104 | 17 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-character.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-constellation.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-memory.css` | feature | shared | 10 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-objectives-and-notes.css` | feature | shared | 7 | 5 | 1 |
| `src/frontend/shared/styles/features/player-campaign/player-campaign-search.css` | feature | shared | 9 | 8 | 1 |
| `src/frontend/shared/styles/features/player-campaign.css` | feature | shared | 6 | 0 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-conditions-and-cards.css` | feature | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-history-responsive.css` | feature | shared | 144 | 23 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-memory-and-history.css` | feature | shared | 63 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-messages.css` | feature | shared | 52 | 8 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-modes-and-recap.css` | feature | shared | 79 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-session-layout.css` | feature | shared | 48 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-session-stats.css` | feature | shared | 77 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/player-shell.css` | feature | shared | 39 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/portal-actions.css` | feature | shared | 90 | 12 | 1 |
| `src/frontend/shared/styles/features/player-portal/portal-auth-page.css` | feature | shared | 72 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/portal-card.css` | feature | shared | 105 | 12 | 1 |
| `src/frontend/shared/styles/features/player-portal/portal-form.css` | feature | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/features/player-portal/portal-transition.css` | feature | shared | 110 | 15 | 1 |
| `src/frontend/shared/styles/features/player-portal.css` | feature | shared | 14 | 0 | 3 |
| `src/frontend/shared/styles/features/player-profile-modal.css` | feature | shared | 18 | 4 | 1 |
| `src/frontend/shared/styles/features/pwa-update-banner.css` | feature | shared | 30 | 2 | 1 |
| `src/frontend/shared/styles/features/quick-capture.css` | feature | shared | 142 | 17 | 1 |
| `src/frontend/shared/styles/features/relation-edge-label.css` | feature | shared | 19 | 2 | 1 |
| `src/frontend/shared/styles/features/rules-workspace.css` | feature | shared | 73 | 10 | 1 |
| `src/frontend/shared/styles/features/session-prep-form.css` | feature | shared | 53 | 9 | 1 |
| `src/frontend/shared/styles/features/shortcuts-panel.css` | feature | shared | 66 | 11 | 1 |
| `src/frontend/shared/styles/features/sidebar-nav.css` | feature | shared | 15 | 2 | 1 |
| `src/frontend/shared/styles/features/system-announcements.css` | feature | shared | 91 | 12 | 1 |
| `src/frontend/shared/styles/foundation/accessibility.css` | foundation | shared | 8 | 2 | 1 |
| `src/frontend/shared/styles/foundation/color-scheme.css` | foundation | shared | 12 | 3 | 1 |
| `src/frontend/shared/styles/foundation/fonts.css` | foundation | shared | 16 | 0 | 1 |
| `src/frontend/shared/styles/foundation/motion.css` | foundation | shared | 28 | 3 | 1 |
| `src/frontend/shared/styles/foundation/reset.css` | foundation | shared | 46 | 6 | 1 |
| `src/frontend/shared/styles/foundation/structural-tokens.css` | foundation | shared | 20 | 1 | 1 |
| `src/frontend/shared/styles/landing/account-home-actions-and-responsive.css` | feature | shared | 131 | 21 | 1 |
| `src/frontend/shared/styles/landing/account-home-campaign-list.css` | feature | shared | 191 | 27 | 1 |
| `src/frontend/shared/styles/landing/account-home-featured-campaign.css` | feature | shared | 152 | 19 | 1 |
| `src/frontend/shared/styles/landing/account-home-layout.css` | feature | shared | 144 | 19 | 1 |
| `src/frontend/shared/styles/landing/landing-animations.css` | feature | shared | 51 | 18 | 1 |
| `src/frontend/shared/styles/landing/landing-feature-blocks.css` | feature | shared | 164 | 26 | 1 |
| `src/frontend/shared/styles/landing/landing-hero-actions.css` | feature | shared | 128 | 15 | 1 |
| `src/frontend/shared/styles/landing/landing-local-and-final-cta.css` | feature | shared | 206 | 29 | 1 |
| `src/frontend/shared/styles/landing/landing-memory-and-network.css` | feature | shared | 151 | 24 | 1 |
| `src/frontend/shared/styles/landing/landing-network-and-footer.css` | feature | shared | 175 | 23 | 1 |
| `src/frontend/shared/styles/landing/landing-preview-details.css` | feature | shared | 150 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-preview-shell.css` | feature | shared | 168 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-shell.css` | feature | shared | 218 | 19 | 1 |
| `src/frontend/shared/styles/landing/landing-showcase.css` | feature | shared | 68 | 19 | 1 |
| `src/frontend/shared/styles/landing/smart-landing-mobile.css` | feature | shared | 155 | 26 | 1 |
| `src/frontend/shared/styles/landing/smart-landing-responsive-grid.css` | feature | shared | 37 | 7 | 1 |
| `src/frontend/shared/styles/landing/smart-landing-role-actions.css` | feature | shared | 12 | 2 | 1 |
| `src/frontend/shared/styles/landing/smart-landing-role-cards.css` | feature | shared | 151 | 21 | 1 |
| `src/frontend/shared/styles/landing/smart-landing-shell.css` | feature | shared | 184 | 18 | 1 |
| `src/frontend/shared/styles/landing.css` | feature | shared | 20 | 0 | 3 |
| `src/frontend/shared/styles/layout/admin-shell.css` | layout | shared | 134 | 22 | 1 |
| `src/frontend/shared/styles/layout/app-shell.css` | layout | shared | 42 | 7 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-controls.css` | layout | shared | 55 | 6 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-layout.css` | layout | shared | 24 | 3 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-responsive.css` | layout | shared | 156 | 16 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css` | layout | shared | 142 | 16 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items.css` | layout | shared | 4 | 0 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-language.css` | layout | shared | 75 | 10 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css` | layout | shared | 88 | 15 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-secondary-layout.css` | layout | shared | 145 | 16 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-secondary-states.css` | layout | shared | 114 | 12 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-secondary.css` | layout | shared | 3 | 0 | 2 |
| `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-shell.css` | layout | shared | 4 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation.css` | layout | shared | 12 | 0 | 1 |
| `src/frontend/shared/styles/layout/campaign-shell.css` | layout | shared | 202 | 30 | 1 |
| `src/frontend/shared/styles/layout/footer.css` | layout | shared | 128 | 16 | 1 |
| `src/frontend/shared/styles/layout/grid.css` | layout | shared | 26 | 5 | 1 |
| `src/frontend/shared/styles/layout/navigation.css` | layout | shared | 119 | 13 | 1 |
| `src/frontend/shared/styles/layout/responsive.css` | layout | shared | 63 | 11 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-link-modal-filters.css` | layout | shared | 76 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-link-modal.css` | layout | shared | 63 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebook-details.css` | layout | shared | 61 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebook-forms.css` | layout | shared | 73 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebook-items.css` | layout | shared | 62 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebooks-empty.css` | layout | shared | 78 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebooks-layout.css` | layout | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebooks-search.css` | layout | shared | 87 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-notebooks-tree.css` | layout | shared | 69 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-responsive.css` | layout | shared | 162 | 26 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-shell.css` | layout | shared | 80 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-tabs.css` | layout | shared | 62 | 12 | 1 |
| `src/frontend/shared/styles/layout/workspace/workspace-variants.css` | layout | shared | 81 | 10 | 1 |
| `src/frontend/shared/styles/layout/workspace.css` | layout | shared | 14 | 0 | 1 |
| `src/frontend/shared/styles/main.css` | foundation | shared | 34 | 0 | 1 |
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
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-components.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar/canvas-mobile-toolbar-split-foundation/canvas-mobile-toolbar-foundation/canvas-mobile-toolbar-layout.css:5` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:203` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:28` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:65` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:70` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:71` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:72` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-components.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:72` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-details.css:86` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:40` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:63` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:65` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:104` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:108` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:113` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:114` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:115` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-foundation.css:124` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:27` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog/entity-detail-dialog-layout.css:28` | Important declarations bypass the intended cascade. |
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
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignModals.tsx:367` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:152` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:211` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-advanced.css:54` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-interactions.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-interactions.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-interactions.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-interactions.css:7` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:31` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:32` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:48` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/network-flow/network-flow-responsive.css:65` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkInspector.tsx:32` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkRelationEdge.tsx:43` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/map/shared/EntityNodeContent.tsx:66` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-components.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-components.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-components.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-components.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-layout.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour/campaign-guided-tour-layout.css:78` | Important declarations bypass the intended cascade. |
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
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-components.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-components.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-components.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-details.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:2` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:42` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:46` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:47` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:69` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-foundation.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:31` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:63` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-layout.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-overlays.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-responsive.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-responsive.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-responsive.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/story-plan/story-plan-responsive.css:10` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/shared/components/CampaignTemplateImportDialog.tsx:114` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:77` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:135` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:136` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:137` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:138` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:139` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:140` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:142` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:143` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:144` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:146` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:147` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:149` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:150` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entity-image-reframe/entity-image-reframe-layout.css:180` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/shared/components/RpgPortalBackground.tsx:33` | Runtime style requires review and CSS custom-property preference. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-dashboard.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-dashboard.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:70` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:76` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:83` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:87` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:92` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:98` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:102` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:103` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:104` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:105` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-density.css:106` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:75` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:82` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:87` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:88` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:89` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:93` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:94` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-inspector.css:152` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css:8` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-interactions.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-notes.css:122` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-overlays.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-overlays.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css:112` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css:113` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css:117` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css:118` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-palette-and-toolbar.css:146` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-resource-card-details.css:159` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas/canvas-resource-card-details.css:163` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template/template-import-dialog.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template/template-import-dialog.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template/template-import-dialog.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-history-responsive.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-history-responsive.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-history-responsive.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/player-history-responsive.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/portal-form.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/portal-form.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal/portal-form.css:62` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/quick-capture.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-responsive.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-responsive.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-responsive.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:87` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:88` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:89` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-items-states.css:92` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:20` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:41` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:45` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:84` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-responsive.css:85` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/layout/campaign-navigation/campaign-navigation-secondary-layout.css:80` | Important declarations bypass the intended cascade. |
| medium | global-selector | `src/frontend/shared/styles/layout/grid.css:1` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/card.css:7` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/dialog.css:44` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/dialog.css:52` | Generic selector has global collision risk. |
| medium | global-selector | `src/frontend/shared/styles/primitives/dialog.css:56` | Generic selector has global collision risk. |
