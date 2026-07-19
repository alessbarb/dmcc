# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 104,
  "tsxFilesWithInlineStyles": 70,
  "forbiddenLiteralColors": 256,
  "staticInlineStyles": 582,
  "dynamicInlineStyles": 31,
  "unknownCssVariables": 0,
  "legacyCssVariables": 0,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 34,
  "crossComponentSelectors": 62,
  "importantDeclarations": 381,
  "unclassifiedCssFiles": 0
}
```

## Stylesheets

| File | Layer | Domain | Lines | Selectors | Importers |
|---|---:|---:|---:|---:|---:|
| `src/frontend/account/account.css` | legacy | account | 804 | 121 | 1 |
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
| `src/frontend/shared/styles/features/admin-invitations.css` | legacy | shared | 27 | 26 | 1 |
| `src/frontend/shared/styles/features/admin-overview.css` | legacy | shared | 28 | 25 | 1 |
| `src/frontend/shared/styles/features/admin-purge.css` | legacy | shared | 41 | 37 | 1 |
| `src/frontend/shared/styles/features/admin-template-settings.css` | legacy | shared | 25 | 24 | 1 |
| `src/frontend/shared/styles/features/admin-users.css` | legacy | shared | 67 | 42 | 1 |
| `src/frontend/shared/styles/features/campaign-canvas.css` | legacy | shared | 1683 | 259 | 1 |
| `src/frontend/shared/styles/features/campaign-template.css` | legacy | shared | 729 | 105 | 1 |
| `src/frontend/shared/styles/features/canvas-board-dialogs.css` | legacy | shared | 28 | 27 | 1 |
| `src/frontend/shared/styles/features/canvas-page-header.css` | legacy | shared | 18 | 17 | 1 |
| `src/frontend/shared/styles/features/dm-dashboard.css` | legacy | shared | 507 | 71 | 1 |
| `src/frontend/shared/styles/features/dm-hub-dashboard.css` | legacy | shared | 1347 | 191 | 1 |
| `src/frontend/shared/styles/features/dm-hub.css` | legacy | shared | 589 | 73 | 1 |
| `src/frontend/shared/styles/features/graph-search.css` | legacy | shared | 77 | 8 | 1 |
| `src/frontend/shared/styles/features/kanban-board.css` | legacy | shared | 120 | 16 | 1 |
| `src/frontend/shared/styles/features/kanban.css` | legacy | shared | 104 | 17 | 1 |
| `src/frontend/shared/styles/features/landing-archive.css` | legacy | shared | 864 | 136 | 1 |
| `src/frontend/shared/styles/features/player-portal.css` | legacy | shared | 988 | 153 | 1 |
| `src/frontend/shared/styles/features/quick-capture.css` | legacy | shared | 130 | 17 | 1 |
| `src/frontend/shared/styles/features/rules-workspace.css` | legacy | shared | 73 | 11 | 1 |
| `src/frontend/shared/styles/features/sidebar-nav.css` | legacy | shared | 15 | 2 | 1 |
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
| `src/frontend/shared/styles/main.css` | foundation | shared | 63 | 0 | 1 |
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
| critical | mixed-responsibility | `src/frontend/account/account.css:1` | Large stylesheet requires atomization (804 lines, 121 selectors). |
| high | static-inline | `src/frontend/account/PreferencesPanel.tsx:149` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/account/PreferencesPanel.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/account/PreferencesPanel.tsx:163` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:71` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:72` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:79` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:84` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:89` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/LoginPage.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/LoginPage.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/LoginPage.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/LoginPage.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/LoginPage.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/LoginPage.tsx:93` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/auth/LoginPage.tsx:94` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/auth/LoginPage.tsx:95` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:60` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/auth/RegisterPage.tsx:93` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:832` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:846` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1229` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1294` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1299` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBulkActionsBar.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasEntityNode.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasEntityNode.tsx:171` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasEntityNode.tsx:177` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasEntityNode.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:37` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:38` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:39` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:40` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:41` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:42` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:43` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:44` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:88` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:103` | Runtime style requires review and CSS custom-property preference. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:108` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:109` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:113` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:114` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:115` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:201` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:211` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:266` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:411` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:412` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:486` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:487` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:729` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:730` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:733` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:738` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:824` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:825` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:871` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:872` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:875` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:878` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:887` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:909` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:926` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:985` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:991` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:997` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:1007` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:35` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:36` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:39` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:40` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:14` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:14` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:72` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:72` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasNoteNode.tsx:86` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:264` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:268` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:279` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:283` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:285` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:285` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:291` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:293` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:293` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:299` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:301` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:304` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:306` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:309` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:320` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:329` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:338` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:349` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:356` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:381` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:396` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:423` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:427` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:449` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:465` | Literal visual color outside a registered theme package. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasPalette.tsx:501` | Runtime style requires review and CSS custom-property preference. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:576` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:577` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:578` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:579` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:580` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:581` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:582` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:665` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:680` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:686` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:695` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:702` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasPalette.tsx:709` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:711` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:713` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:733` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:738` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasSessionPrepDialog.tsx:44` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasToolbar.tsx:323` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasToolbar.tsx:325` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasToolbar.tsx:375` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasToolbar.tsx:387` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasToolbar.tsx:551` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx:129` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/ConvertNoteToEntityDialog.tsx:138` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:55` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:61` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:208` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:217` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:220` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:248` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:249` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:257` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:261` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:267` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:274` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:278` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:321` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:322` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/RelationshipTypePopover.tsx:331` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:46` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:76` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/SessionPrepForm.tsx:106` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/pages/CanvasPage.tsx:527` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/pages/CanvasPage.tsx:684` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/templates/cityTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/templates/dungeonTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/capture/QuickCaptureFAB.tsx:118` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/capture/QuickCaptureFAB.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:233` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:409` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:410` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:411` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:412` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:451` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:452` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:453` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:487` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:488` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:489` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:533` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:534` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:535` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:555` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:580` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:600` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:682` | Static or mixed inline style must move to an atomized stylesheet. |
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
| info | dynamic-style | `src/frontend/dm/entities/EntityDetailModal.tsx:197` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:79` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:105` | Static or mixed inline style must move to an atomized stylesheet. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:39` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:72` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:93` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:114` | Selector depends on another component's DOM structure. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:131` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:188` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsFilters.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsFilters.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsFilters.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:22` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:37` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsList.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:178` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:201` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:212` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:213` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:221` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:315` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:322` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:326` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:354` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/RelationshipEdge.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/entities/relations/RelationshipGraphCanvas.tsx:541` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:135` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:143` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:147` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:156` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:180` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:187` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:195` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:210` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TrazabilidadTab.tsx:221` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:28` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:95` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:144` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:171` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:171` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:182` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:185` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:232` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:232` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:237` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:266` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:274` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:274` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:293` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:293` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:327` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:353` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:353` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:355` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:362` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:365` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:371` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:376` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:377` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:384` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:384` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:385` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:385` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:387` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:392` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:393` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:396` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:400` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:71` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:39` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:41` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:89` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/map/shared/EntityNodeContent.tsx:111` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:126` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:132` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:137` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:143` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:149` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:159` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:164` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:35` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:60` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:62` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:64` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:65` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:68` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:70` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:72` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:73` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:77` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:110` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:125` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:285` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:286` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:302` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:304` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:314` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:324` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:327` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:332` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:359` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:378` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:407` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:415` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:432` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:449` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:453` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:456` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:464` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:477` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:480` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:482` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:483` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:486` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:488` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:494` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:515` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:522` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:528` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:534` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:552` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:569` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:575` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:579` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:594` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:601` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:612` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:623` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:634` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:646` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:653` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:656` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:666` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:670` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:673` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:677` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:684` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:44` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/pages/OnboardingPage.tsx:45` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/pages/OnboardingPage.tsx:77` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/pages/OnboardingPage.tsx:86` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/dm/pages/OnboardingPage.tsx:95` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:109` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:122` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:129` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:135` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:136` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:137` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:138` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:146` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:147` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:148` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:77` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:79` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/invitations/InvitationPage.tsx:97` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:92` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:95` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:98` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:101` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:104` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:71` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:94` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:87` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignsPage.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignsPage.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:39` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:109` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:110` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:121` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:123` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:129` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:133` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:144` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:158` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:168` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:170` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:172` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:176` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:189` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:191` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:254` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:255` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:260` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:264` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:265` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:278` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:393` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:395` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:396` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:398` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:399` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:400` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:401` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:412` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:414` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:416` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:417` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:419` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:422` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:422` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:424` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:426` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:432` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:442` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:442` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:450` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:36` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerJoinPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerMessagesPage.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerMessagesPage.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:9` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:9` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:9` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:9` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:9` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/CampaignMessagingPanel.tsx:10` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:277` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:278` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:279` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:283` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:284` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:285` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:286` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:287` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:287` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/CampaignMessagingPanel.tsx:291` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:292` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:292` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:292` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:293` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:294` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/CampaignMessagingPanel.tsx:299` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:300` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:301` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:302` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:310` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:313` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:314` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:315` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:319` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:320` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:321` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:322` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:69` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:72` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:76` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:80` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:87` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:108` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:175` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:181` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:197` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:201` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:207` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:217` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:223` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:228` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:99` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:105` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:106` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:107` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:108` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:114` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:121` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:124` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/ImagePickerModal.tsx:131` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:147` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:269` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:272` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:278` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:288` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:288` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:294` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:338` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:346` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:349` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:349` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:352` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:358` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:365` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:368` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:373` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:374` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:375` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:375` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:400` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:414` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:422` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:434` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/PwaUpdateBanner.tsx:18` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/PwaUpdateBanner.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/RpgPortalBackground.tsx:33` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/RpgPortalBackground.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/RpgPortalBackground.tsx:149` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:72` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:80` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:87` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:88` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:91` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:92` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:93` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:108` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:113` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:119` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:126` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:132` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:138` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:141` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/SystemAnnouncements.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:158` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:167` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/SystemAnnouncements.tsx:171` | Literal visual color outside a registered theme package. |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-announcements.css:1` | Large stylesheet requires atomization (37 lines, 37 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/admin-audit.css:1` | Large stylesheet requires atomization (117 lines, 46 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-campaigns.css:1` | Large stylesheet requires atomization (36 lines, 36 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-purge.css:1` | Large stylesheet requires atomization (41 lines, 37 selectors). |
| high | mixed-responsibility | `src/frontend/shared/styles/features/admin-users.css:1` | Large stylesheet requires atomization (67 lines, 42 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/campaign-canvas.css:1` | Large stylesheet requires atomization (1683 lines, 259 selectors). |
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
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1091` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1212` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1213` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1217` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1235` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1239` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1240` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1241` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1242` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1247` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1248` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1249` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1253` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1254` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1255` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1259` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1260` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1261` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1312` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1399` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1400` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1434` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1437` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1470` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1473` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1480` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1483` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1486` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1489` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1492` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1496` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1499` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1503` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1506` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1509` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1512` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1513` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1514` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1515` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1516` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1517` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1518` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1519` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1520` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1525` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1526` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1527` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1530` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1531` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-canvas.css:1535` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/campaign-template.css:1` | Large stylesheet requires atomization (729 lines, 105 selectors). |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:441` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:446` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/features/campaign-template.css:447` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-dashboard.css:1` | Large stylesheet requires atomization (507 lines, 71 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-hub-dashboard.css:1` | Large stylesheet requires atomization (1347 lines, 191 selectors). |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/dm-hub.css:1` | Large stylesheet requires atomization (589 lines, 73 selectors). |
| high | literal-color | `src/frontend/shared/styles/features/kanban.css:84` | Literal visual color outside a registered theme package. |
| critical | mixed-responsibility | `src/frontend/shared/styles/features/landing-archive.css:1` | Large stylesheet requires atomization (864 lines, 136 selectors). |
| high | important | `src/frontend/shared/styles/features/landing-archive.css:628` | Important declarations bypass the intended cascade. |
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
