# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 190,
  "tsxFilesWithInlineStyles": 15,
  "forbiddenLiteralColors": 0,
  "staticInlineStyles": 0,
  "dynamicInlineStyles": 20,
  "unknownCssVariables": 0,
  "legacyCssVariables": 0,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 31,
  "crossComponentSelectors": 62,
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
| `src/frontend/account/account-styles/account-styles-04.css` | feature | account | 171 | 27 | 1 |
| `src/frontend/account/account-styles/account-styles-05.css` | feature | account | 114 | 18 | 1 |
| `src/frontend/account/account.css` | feature | account | 6 | 0 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css` | feature | canvas | 265 | 34 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-01.css` | feature | entities | 104 | 14 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-02.css` | feature | entities | 78 | 12 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-03.css` | feature | entities | 103 | 12 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-04.css` | feature | entities | 99 | 12 | 1 |
| `src/frontend/dm/entities/entity-card-parts/entity-card-parts-05.css` | feature | entities | 14 | 4 | 1 |
| `src/frontend/dm/entities/entity-card.css` | feature | entities | 6 | 0 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css` | feature | entities | 125 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css` | feature | entities | 75 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css` | feature | entities | 98 | 12 | 1 |
| `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css` | feature | entities | 100 | 21 | 1 |
| `src/frontend/dm/entities/entity-detail-modal.css` | feature | entities | 216 | 25 | 2 |
| `src/frontend/dm/entities/entity-grid.css` | feature | entities | 16 | 3 | 1 |
| `src/frontend/dm/entities/entity-list-toolbar.css` | feature | entities | 97 | 17 | 1 |
| `src/frontend/dm/entities/entity-summary-character-sheet.css` | feature | entities | 179 | 26 | 1 |
| `src/frontend/dm/entities/entity-summary.css` | feature | entities | 144 | 23 | 1 |
| `src/frontend/dm/entities/entityDetailDialog.css` | feature | entities | 5 | 0 | 2 |
| `src/frontend/dm/entities/entityDetailHeroActions.css` | feature | entities | 57 | 8 | 2 |
| `src/frontend/dm/entities/entityDetailImageContinuation.css` | feature | entities | 183 | 18 | 2 |
| `src/frontend/dm/entities/playerCharacterDetail.css` | feature | entities | 145 | 21 | 1 |
| `src/frontend/dm/entities/relations/relationshipGraph.css` | feature | entities | 154 | 25 | 2 |
| `src/frontend/dm/entities/type-metadata-form.css` | feature | entities | 30 | 4 | 1 |
| `src/frontend/dm/layouts/campaign-route-transitions.css` | layout | layout | 82 | 19 | 1 |
| `src/frontend/dm/library/boards/entity-board-parts/entity-board-parts-01.css` | feature | library | 75 | 10 | 1 |
| `src/frontend/dm/library/boards/entity-board-parts/entity-board-parts-02.css` | feature | library | 82 | 10 | 1 |
| `src/frontend/dm/library/boards/entity-board-parts/entity-board-parts-03.css` | feature | library | 88 | 17 | 1 |
| `src/frontend/dm/library/boards/entityBoards.css` | feature | library | 4 | 0 | 1 |
| `src/frontend/dm/library/list/entity-list-toolbar-controls.css` | feature | library | 118 | 17 | 1 |
| `src/frontend/dm/library/list/entity-list-view.css` | feature | library | 117 | 18 | 1 |
| `src/frontend/dm/library/list/entityListRefinements.css` | feature | library | 96 | 16 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-01.css` | feature | library | 56 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-02.css` | feature | library | 63 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-03.css` | feature | library | 79 | 10 | 1 |
| `src/frontend/dm/library/notebooks/notebooks-workspace-parts/notebooks-workspace-parts-04.css` | feature | library | 98 | 20 | 1 |
| `src/frontend/dm/library/notebooks/notebooksWorkspace.css` | feature | library | 5 | 0 | 1 |
| `src/frontend/dm/map/mapWorkspace.css` | feature | map | 94 | 14 | 1 |
| `src/frontend/dm/map/network/networkFlow.css` | feature | map | 829 | 116 | 1 |
| `src/frontend/dm/onboarding/campaign-guided-tour.css` | feature | onboarding | 226 | 32 | 1 |
| `src/frontend/dm/onboarding/campaign-starter-hub.css` | feature | onboarding | 419 | 58 | 1 |
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
| `src/frontend/player/pages/playerCampaignShell.css` | feature | player | 174 | 30 | 1 |
| `src/frontend/shared/components/entityImageReframeDialog.css` | component | shared-components | 329 | 42 | 1 |
| `src/frontend/shared/components/watermark.css` | component | shared-components | 33 | 6 | 1 |
| `src/frontend/shared/styles/features/admin-announcements.css` | feature | shared | 37 | 37 | 1 |
| `src/frontend/shared/styles/features/admin-audit.css` | feature | shared | 117 | 46 | 1 |
| `src/frontend/shared/styles/features/admin-campaigns.css` | feature | shared | 36 | 36 | 1 |
| `src/frontend/shared/styles/features/admin-game-systems.css` | feature | shared | 24 | 23 | 1 |
| `src/frontend/shared/styles/features/admin-invitations.css` | feature | shared | 27 | 26 | 1 |
| `src/frontend/shared/styles/features/admin-overview.css` | feature | shared | 28 | 25 | 1 |
| `src/frontend/shared/styles/features/admin-purge.css` | feature | shared | 41 | 37 | 1 |
| `src/frontend/shared/styles/features/admin-security.css` | feature | shared | 16 | 15 | 1 |
| `src/frontend/shared/styles/features/admin-template-settings.css` | feature | shared | 25 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-users.css` | feature | shared | 67 | 42 | 1 |
| `src/frontend/shared/styles/features/auth.css` | feature | shared | 60 | 15 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-01.css` | feature | shared | 206 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-02.css` | feature | shared | 181 | 24 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css` | feature | shared | 158 | 22 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-04.css` | feature | shared | 141 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-05.css` | feature | shared | 119 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-06.css` | feature | shared | 172 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-07.css` | feature | shared | 203 | 30 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css` | feature | shared | 173 | 25 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-01.css` | feature | shared | 87 | 12 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-02.css` | feature | shared | 53 | 12 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css` | feature | shared | 34 | 10 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css` | feature | shared | 20 | 3 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css` | feature | shared | 161 | 22 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas.css` | feature | shared | 11 | 0 | 1 |
| `src/frontend/shared/styles/features/campaign-messaging.css` | feature | shared | 39 | 38 | 1 |
| `src/frontend/shared/styles/features/campaign-template.css` | feature | shared | 729 | 105 | 1 |
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
| `src/frontend/shared/styles/features/dashboard-overview.css` | feature | shared | 49 | 46 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard.css` | feature | shared | 507 | 71 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard.css` | feature | shared | 1434 | 227 | 1 |
| `src/frontend/shared/styles/features/dm-hub.css` | feature | shared | 589 | 73 | 1 |
| `src/frontend/shared/styles/features/dm-onboarding.css` | feature | shared | 20 | 19 | 1 |
| `src/frontend/shared/styles/features/entity-create.css` | feature | shared | 32 | 6 | 1 |
| `src/frontend/shared/styles/features/entity-relations.css` | feature | shared | 51 | 47 | 1 |
| `src/frontend/shared/styles/features/entity-trace.css` | feature | shared | 23 | 18 | 1 |
| `src/frontend/shared/styles/features/graph-search.css` | feature | shared | 77 | 8 | 1 |
| `src/frontend/shared/styles/features/image-picker-button.css` | feature | shared | 12 | 11 | 1 |
| `src/frontend/shared/styles/features/image-picker-modal.css` | feature | shared | 215 | 28 | 1 |
| `src/frontend/shared/styles/features/kanban-board.css` | feature | shared | 177 | 27 | 1 |
| `src/frontend/shared/styles/features/kanban.css` | feature | shared | 104 | 17 | 1 |
| `src/frontend/shared/styles/features/landing-archive.css` | feature | shared | 874 | 138 | 1 |
| `src/frontend/shared/styles/features/player-campaign.css` | feature | shared | 38 | 37 | 1 |
| `src/frontend/shared/styles/features/player-portal.css` | feature | shared | 1023 | 160 | 1 |
| `src/frontend/shared/styles/features/player-profile-modal.css` | feature | shared | 18 | 4 | 1 |
| `src/frontend/shared/styles/features/pwa-update-banner.css` | feature | shared | 30 | 2 | 1 |
| `src/frontend/shared/styles/features/quick-capture.css` | feature | shared | 142 | 19 | 1 |
| `src/frontend/shared/styles/features/relation-edge-label.css` | feature | shared | 19 | 2 | 1 |
| `src/frontend/shared/styles/features/rules-workspace.css` | feature | shared | 73 | 11 | 1 |
| `src/frontend/shared/styles/features/session-prep-form.css` | feature | shared | 53 | 9 | 1 |
| `src/frontend/shared/styles/features/shortcuts-panel.css` | feature | shared | 66 | 11 | 1 |
| `src/frontend/shared/styles/features/sidebar-nav.css` | feature | shared | 15 | 2 | 1 |
| `src/frontend/shared/styles/features/system-announcements.css` | feature | shared | 91 | 12 | 1 |
| `src/frontend/shared/styles/features/timeline.css` | feature | shared | 216 | 37 | 1 |
| `src/frontend/shared/styles/foundation/accessibility.css` | foundation | shared | 8 | 2 | 1 |
| `src/frontend/shared/styles/foundation/color-scheme.css` | foundation | shared | 12 | 3 | 1 |
| `src/frontend/shared/styles/foundation/fonts.css` | foundation | shared | 16 | 1 | 1 |
| `src/frontend/shared/styles/foundation/motion.css` | foundation | shared | 28 | 3 | 1 |
| `src/frontend/shared/styles/foundation/reset.css` | foundation | shared | 46 | 7 | 1 |
| `src/frontend/shared/styles/foundation/structural-tokens.css` | foundation | shared | 20 | 1 | 1 |
| `src/frontend/shared/styles/landing/landing-01.css` | feature | shared | 174 | 19 | 1 |
| `src/frontend/shared/styles/landing/landing-02.css` | feature | shared | 129 | 16 | 1 |
| `src/frontend/shared/styles/landing/landing-03.css` | feature | shared | 169 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-04.css` | feature | shared | 151 | 23 | 1 |
| `src/frontend/shared/styles/landing/landing-05/landing-05-01.css` | feature | shared | 50 | 18 | 1 |
| `src/frontend/shared/styles/landing/landing-05/landing-05-02.css` | feature | shared | 70 | 22 | 1 |
| `src/frontend/shared/styles/landing/landing-05.css` | feature | shared | 3 | 0 | 1 |
| `src/frontend/shared/styles/landing/landing-06.css` | feature | shared | 153 | 26 | 1 |
| `src/frontend/shared/styles/landing/landing-07.css` | feature | shared | 153 | 24 | 1 |
| `src/frontend/shared/styles/landing/landing-08.css` | feature | shared | 176 | 23 | 1 |
| `src/frontend/shared/styles/landing/landing-09.css` | feature | shared | 207 | 30 | 1 |
| `src/frontend/shared/styles/landing/landing-10.css` | feature | shared | 202 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-11.css` | feature | shared | 152 | 21 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-01.css` | feature | shared | 11 | 2 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-02.css` | feature | shared | 156 | 27 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-03.css` | feature | shared | 48 | 9 | 1 |
| `src/frontend/shared/styles/landing/landing-12/landing-12-04.css` | feature | shared | 3 | 0 | 1 |
| `src/frontend/shared/styles/landing/landing-12.css` | feature | shared | 5 | 0 | 1 |
| `src/frontend/shared/styles/landing/landing-13.css` | feature | shared | 147 | 20 | 1 |
| `src/frontend/shared/styles/landing/landing-14.css` | feature | shared | 153 | 19 | 1 |
| `src/frontend/shared/styles/landing/landing-15.css` | feature | shared | 197 | 28 | 1 |
| `src/frontend/shared/styles/landing/landing-16.css` | feature | shared | 131 | 25 | 1 |
| `src/frontend/shared/styles/landing.css` | feature | shared | 17 | 0 | 1 |
| `src/frontend/shared/styles/layout/admin-shell.css` | layout | shared | 134 | 24 | 1 |
| `src/frontend/shared/styles/layout/app-shell.css` | layout | shared | 42 | 8 | 1 |
| `src/frontend/shared/styles/layout/campaign-navigation.css` | layout | shared | 744 | 97 | 1 |
| `src/frontend/shared/styles/layout/campaign-shell.css` | layout | shared | 202 | 30 | 1 |
| `src/frontend/shared/styles/layout/footer.css` | layout | shared | 128 | 18 | 1 |
| `src/frontend/shared/styles/layout/grid.css` | layout | shared | 26 | 7 | 1 |
| `src/frontend/shared/styles/layout/navigation.css` | layout | shared | 119 | 13 | 1 |
| `src/frontend/shared/styles/layout/responsive.css` | layout | shared | 63 | 12 | 1 |
| `src/frontend/shared/styles/layout/workspace.css` | layout | shared | 1023 | 152 | 1 |
| `src/frontend/shared/styles/main.css` | foundation | shared | 92 | 0 | 1 |
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
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:70` | Selector depends on another component's DOM structure. |
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
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-01.css:108` | Selector depends on another component's DOM structure. |
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
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:24` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:27` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:28` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:35` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-02.css:42` | Selector depends on another component's DOM structure. |
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
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:45` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:46` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-03.css:51` | Selector depends on another component's DOM structure. |
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
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:8` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:14` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:18` | Selector depends on another component's DOM structure. |
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
| high | cross-component-selector | `src/frontend/dm/entities/entity-detail-dialog-parts/entity-detail-dialog-parts-04.css:86` | Selector depends on another component's DOM structure. |
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
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:152` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:211` | Runtime style requires review and CSS custom-property preference. |
| critical | mixed-responsibility | `src/frontend/dm/map/network/networkFlow.css:1` | Large stylesheet requires atomization (829 lines, 116 selectors). |
| high | cross-component-selector | `src/frontend/dm/map/network/networkFlow.css:28` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:437` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:439` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:443` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:452` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:453` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:454` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:457` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:464` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:465` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:470` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:479` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:486` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:487` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:491` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:492` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:493` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:494` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:709` | Important declarations bypass the intended cascade. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkInspector.tsx:32` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkRelationEdge.tsx:43` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/map/shared/EntityNodeContent.tsx:66` | Runtime style requires review and CSS custom-property preference. |
| high | mixed-responsibility | `src/frontend/dm/onboarding/campaign-guided-tour.css:1` | Large stylesheet requires atomization (226 lines, 32 selectors). |
| high | cross-component-selector | `src/frontend/dm/onboarding/campaign-guided-tour.css:129` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:144` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:204` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:205` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:206` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/onboarding/campaign-guided-tour.css:207` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/dm/onboarding/campaign-starter-hub.css:1` | Large stylesheet requires atomization (419 lines, 58 selectors). |
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
| critical | mixed-responsibility | `src/frontend/dm/people/group/groupWorkspace.css:1` | Large stylesheet requires atomization (631 lines, 93 selectors). |
| critical | mixed-responsibility | `src/frontend/dm/people/peopleWorkspace.css:1` | Large stylesheet requires atomization (394 lines, 61 selectors). |
| critical | mixed-responsibility | `src/frontend/dm/sessions/consequenceChain/sessionConsequenceChain.css:1` | Large stylesheet requires atomization (322 lines, 46 selectors). |
| info | dynamic-style | `src/frontend/dm/sessions/consequenceChain/SessionConsequenceChainCanvas.tsx:55` | Runtime style requires review and CSS custom-property preference. |
| high | mixed-responsibility | `src/frontend/dm/sessions/narrativeMap/sessionNarrativeMap.css:1` | Large stylesheet requires atomization (279 lines, 40 selectors). |
| info | dynamic-style | `src/frontend/dm/sessions/narrativeMap/SessionNarrativeMapCanvas.tsx:54` | Runtime style requires review and CSS custom-property preference. |
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
| high | mixed-responsibility | `src/frontend/institutional/institutional.css:1` | Large stylesheet requires atomization (274 lines, 38 selectors). |
| info | dynamic-style | `src/frontend/MainLanding.tsx:92` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:95` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:98` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:101` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:104` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/shared/components/CampaignTemplateImportDialog.tsx:114` | Runtime style requires review and CSS custom-property preference. |
| high | mixed-responsibility | `src/frontend/shared/components/entityImageReframeDialog.css:1` | Large stylesheet requires atomization (329 lines, 42 selectors). |
| high | cross-component-selector | `src/frontend/shared/components/entityImageReframeDialog.css:147` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:222` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:226` | Important declarations bypass the intended cascade. |
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
| info | dynamic-style | `src/frontend/shared/components/RpgPortalBackground.tsx:33` | Runtime style requires review and CSS custom-property preference. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-announcements.css:1` | Large stylesheet requires atomization (37 lines, 37 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/admin-audit.css:1` | Large stylesheet requires atomization (117 lines, 46 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-campaigns.css:1` | Large stylesheet requires atomization (36 lines, 36 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-purge.css:1` | Large stylesheet requires atomization (41 lines, 37 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-users.css:1` | Large stylesheet requires atomization (67 lines, 42 selectors). |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css:112` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css:113` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css:117` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css:118` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css:145` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-03.css:146` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-04.css:93` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-05.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-05.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-06.css:159` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-06.css:163` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-07.css:122` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:75` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:80` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:81` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:82` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:87` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:88` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:89` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:93` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:94` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:95` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:99` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-08.css:152` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-01.css:67` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-01.css:68` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-02.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-02.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-02.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:29` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-03.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:15` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-09/campaign-canvas-styles-09-04.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css:4` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css:8` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas-styles/campaign-canvas-styles-10.css:13` | Important declarations bypass the intended cascade. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/campaign-messaging.css:1` | Large stylesheet requires atomization (39 lines, 38 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/campaign-template.css:1` | Large stylesheet requires atomization (729 lines, 105 selectors). |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:441` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:446` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:447` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dashboard-overview.css:1` | Large stylesheet requires atomization (49 lines, 46 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-dashboard.css:1` | Large stylesheet requires atomization (507 lines, 71 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-hub-dashboard.css:1` | Large stylesheet requires atomization (1434 lines, 227 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-hub.css:1` | Large stylesheet requires atomization (589 lines, 73 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/entity-relations.css:1` | Large stylesheet requires atomization (51 lines, 47 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/landing-archive.css:1` | Large stylesheet requires atomization (874 lines, 138 selectors). |
| high | important | `src/frontend/shared/styles/features/landing-archive.css:628` | Important declarations bypass the intended cascade. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/player-campaign.css:1` | Large stylesheet requires atomization (38 lines, 37 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/player-portal.css:1` | Large stylesheet requires atomization (1023 lines, 160 selectors). |
| high | important | `src/frontend/shared/styles/features/player-portal.css:334` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:345` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:346` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/features/player-portal.css:730` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/features/player-portal.css:754` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:793` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:801` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:806` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/player-portal.css:807` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/quick-capture.css:36` | Important declarations bypass the intended cascade. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/timeline.css:1` | Large stylesheet requires atomization (216 lines, 37 selectors). |
| high | important | `src/frontend/shared/styles/foundation/motion.css:17` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-01.css:1` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:32` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:36` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:37` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:38` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:39` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:43` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:47` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-01.css:48` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:3` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:7` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:8` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:12` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:16` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:17` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing/landing-05/landing-05-02.css:18` | Selector depends on another component's DOM structure. |
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
| critical | mixed-responsibility | `src/frontend/shared/styles/layout/workspace.css:1` | Large stylesheet requires atomization (1023 lines, 152 selectors). |
