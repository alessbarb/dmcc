# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 49,
  "tsxFilesWithInlineStyles": 96,
  "forbiddenLiteralColors": 1318,
  "staticInlineStyles": 1327,
  "dynamicInlineStyles": 37,
  "unknownCssVariables": 252,
  "legacyCssVariables": 28,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 20,
  "crossComponentSelectors": 131,
  "importantDeclarations": 399,
  "unclassifiedCssFiles": 0
}
```

## Stylesheets

| File | Layer | Domain | Lines | Selectors | Importers |
|---|---:|---:|---:|---:|---:|
| `src/frontend/account/account.css` | legacy | account | 811 | 123 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css` | feature | canvas | 265 | 34 | 1 |
| `src/frontend/dm/entities/entity-card.css` | feature | entities | 390 | 53 | 1 |
| `src/frontend/dm/entities/entity-grid.css` | feature | entities | 16 | 3 | 1 |
| `src/frontend/dm/entities/entity-list-toolbar.css` | feature | entities | 97 | 17 | 1 |
| `src/frontend/dm/entities/entityDetailDialog.css` | feature | entities | 391 | 60 | 1 |
| `src/frontend/dm/entities/entityDetailHeroActions.css` | feature | entities | 57 | 8 | 1 |
| `src/frontend/dm/entities/entityDetailImageContinuation.css` | feature | entities | 199 | 18 | 1 |
| `src/frontend/dm/entities/playerCharacterDetail.css` | feature | entities | 359 | 50 | 1 |
| `src/frontend/dm/entities/relations/relationshipGraph.css` | feature | entities | 103 | 16 | 2 |
| `src/frontend/dm/layouts/campaign-route-transitions.css` | layout | layout | 79 | 19 | 1 |
| `src/frontend/dm/library/boards/entityBoards.css` | feature | library | 243 | 37 | 1 |
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
| `src/frontend/dm/people/peopleWorkspace.css` | feature | people | 390 | 60 | 1 |
| `src/frontend/dm/sessions/sessionWorkspace.css` | feature | sessions | 404 | 67 | 1 |
| `src/frontend/dm/story/history/campaignHistory.css` | feature | story | 295 | 41 | 1 |
| `src/frontend/dm/story/plan/storyPlanWorkspace.css` | feature | story | 153 | 27 | 1 |
| `src/frontend/institutional/institutional.css` | feature | institutional | 274 | 38 | 1 |
| `src/frontend/player/pages/playerCampaignShell.css` | feature | player | 154 | 27 | 1 |
| `src/frontend/shared/components/entityImageReframeDialog.css` | component | shared-components | 329 | 42 | 1 |
| `src/frontend/shared/styles/features/kanban-board.css` | legacy | shared | 120 | 16 | 1 |
| `src/frontend/shared/styles/features/rules-workspace.css` | legacy | shared | 73 | 11 | 1 |
| `src/frontend/shared/styles/features/sidebar-nav.css` | legacy | shared | 15 | 2 | 1 |
| `src/frontend/shared/styles/foundation/accessibility.css` | foundation | shared | 8 | 2 | 1 |
| `src/frontend/shared/styles/foundation/color-scheme.css` | foundation | shared | 12 | 3 | 1 |
| `src/frontend/shared/styles/foundation/fonts.css` | foundation | shared | 16 | 1 | 1 |
| `src/frontend/shared/styles/foundation/motion.css` | foundation | shared | 26 | 3 | 1 |
| `src/frontend/shared/styles/foundation/reset.css` | foundation | shared | 46 | 7 | 1 |
| `src/frontend/shared/styles/foundation/structural-tokens.css` | foundation | shared | 20 | 1 | 1 |
| `src/frontend/shared/styles/index.css` | legacy | shared | 9012 | 1309 | 1 |
| `src/frontend/shared/styles/landing.css` | legacy | shared | 2595 | 391 | 1 |
| `src/frontend/shared/styles/layout/workspace.css` | legacy | shared | 1010 | 150 | 1 |
| `src/frontend/shared/styles/main.css` | foundation | shared | 28 | 0 | 1 |
| `src/frontend/shared/styles/primitives/badge.css` | legacy | shared | 14 | 1 | 1 |
| `src/frontend/shared/styles/primitives/button.css` | legacy | shared | 94 | 13 | 1 |
| `src/frontend/shared/styles/primitives/card.css` | legacy | shared | 26 | 5 | 1 |
| `src/frontend/shared/styles/primitives/form-control.css` | legacy | shared | 52 | 7 | 1 |
| `src/frontend/shared/styles/primitives/menu.css` | legacy | shared | 69 | 9 | 1 |
| `src/frontend/shared/styles/primitives/tooltip.css` | legacy | shared | 13 | 1 | 1 |
| `src/frontend/shared/styles/vendor/react-flow.css` | legacy | shared | 2 | 0 | 1 |

## Findings

| Severity | Category | Location | Reason |
|---|---|---|---|
| critical | mixed-responsibility | `src/frontend/account/account.css:1` | Large stylesheet requires atomization (811 lines, 123 selectors). |
| high | literal-color | `src/frontend/account/account.css:57` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:57` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:60` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:83` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:83` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:148` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:150` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:154` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:156` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:160` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:161` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:162` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:167` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:168` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:183` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:197` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:235` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:242` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:242` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:261` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:288` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:290` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:315` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:315` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:316` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:330` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:354` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:355` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:361` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:363` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:415` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:417` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:440` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:456` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:463` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:516` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:516` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:531` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:537` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:549` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:550` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:576` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:591` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:592` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:606` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:608` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:622` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/account/account.css:676` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/account/account.css:677` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/account/account.css:690` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:691` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:692` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:705` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:705` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:706` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:707` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:707` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:731` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:744` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:754` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/account/account.css:807` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/account/PreferencesPanel.tsx:147` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/account/PreferencesPanel.tsx:158` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/account/PreferencesPanel.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/AdminShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:10` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:22` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/AdminShell.tsx:24` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:59` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/AdminShell.tsx:72` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:122` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/AdminShell.tsx:144` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/announcements/AnnouncementListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:96` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:97` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:106` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:107` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:113` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:133` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:133` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:134` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:157` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:157` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:164` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:164` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:166` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:170` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:170` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:176` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:192` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:222` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:226` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:230` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:234` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:247` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:248` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:249` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:250` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:251` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:253` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:256` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:261` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:267` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:267` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:268` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/announcements/AnnouncementListPage.tsx:281` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:287` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/announcements/AnnouncementListPage.tsx:288` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/audit/AuditLogPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:36` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:37` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:39` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:40` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/audit/AuditLogPage.tsx:68` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:84` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:91` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/audit/AuditLogPage.tsx:95` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:110` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/audit/AuditLogPage.tsx:114` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:124` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:125` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:131` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:135` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/audit/AuditLogPage.tsx:137` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:137` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:138` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:139` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:140` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:142` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:150` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/audit/AuditLogPage.tsx:153` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:157` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:163` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:165` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:169` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:171` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:177` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:195` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:207` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:209` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:210` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:213` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:214` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:217` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:222` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:223` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:227` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:231` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:237` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:240` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:241` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:242` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/audit/AuditLogPage.tsx:243` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/audit/AuditLogPage.tsx:256` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaigns/CampaignListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:75` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:76` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:82` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:88` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:105` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:108` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:122` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:123` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:124` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:130` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:134` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:143` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:146` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:164` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:168` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:169` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:171` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:171` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:172` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:173` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:175` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:176` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:188` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:190` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:198` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:199` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:211` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:212` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:225` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:231` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/campaigns/CampaignListPage.tsx:232` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:244` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaigns/CampaignListPage.tsx:249` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:59` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:60` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:61` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:68` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:85` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:87` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:88` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:89` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:94` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:97` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:99` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:107` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:113` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:113` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:133` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:133` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:134` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/campaignTemplates/CampaignTemplateSettingsPage.tsx:134` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:57` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:70` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:89` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:89` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:91` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:107` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:107` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:108` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/gameSystems/GameSystemSettingsPage.tsx:108` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/invitations/InvitationListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:56` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:61` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:72` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:83` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:106` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:107` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:109` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:109` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:110` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:111` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:112` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:113` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:114` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:115` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:123` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:124` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:125` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:129` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:130` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:131` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:136` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:136` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:136` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:138` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:138` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:143` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/invitations/InvitationListPage.tsx:148` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:154` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/invitations/InvitationListPage.tsx:155` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/overview/OperationsOverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:30` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:31` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/overview/OperationsOverviewPage.tsx:62` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:72` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/overview/OperationsOverviewPage.tsx:86` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:91` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:94` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:99` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:111` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:117` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:118` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/overview/OperationsOverviewPage.tsx:122` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:130` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:131` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:132` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:134` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:135` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:138` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:139` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:145` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:151` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:152` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/overview/OperationsOverviewPage.tsx:156` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:164` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:165` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:166` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:168` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:169` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:172` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/overview/OperationsOverviewPage.tsx:173` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:94` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:94` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:114` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:117` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:132` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:136` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:140` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:143` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:143` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:144` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:145` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:146` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:147` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:148` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:149` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:150` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:155` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:156` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:159` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:163` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:164` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:165` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:170` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:175` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:176` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:187` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/purge/CampaignPurgeJobsPage.tsx:193` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:41` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:62` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:89` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:92` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:107` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/security/ConfirmPasswordDialog.tsx:123` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/admin/users/UserListPage.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:97` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:99` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:105` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:105` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:106` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:111` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:123` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:131` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:145` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:146` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:147` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:157` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:166` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:169` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:187` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:191` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:192` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:194` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:195` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:196` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:197` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:198` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:199` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:206` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:208` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:210` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:210` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:215` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:216` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:220` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:221` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:226` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:226` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:233` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:239` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:240` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:245` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:251` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:251` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:252` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:252` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:272` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:278` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/admin/users/UserListPage.tsx:300` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/admin/users/UserListPage.tsx:306` | Literal visual color outside a registered theme package. |
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
| high | unknown-token | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:1` | CSS variable is not declared or allowlisted. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:31` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:61` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:162` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:213` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:214` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:215` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:216` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:221` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:241` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:262` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:108` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:115` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:116` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:125` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:150` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:157` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:158` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:159` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:163` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:164` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:168` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:172` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:173` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:175` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:176` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:177` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:178` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:179` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:180` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:185` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:189` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:190` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/canvas/components/CanvasFactNode.tsx:107` | Runtime style requires review and CSS custom-property preference. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:98` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:99` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:100` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:101` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:102` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:103` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:104` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:105` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:191` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:201` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasGroupHulls.tsx:256` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:410` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:411` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:483` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasInspector.tsx:484` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:726` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:727` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:730` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:735` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:821` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:822` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:868` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:869` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:872` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:875` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:884` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:906` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:923` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:982` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:988` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:994` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasInspector.tsx:1004` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/dm/canvas/components/CanvasNarrativeLintDrawer.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:155` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:169` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:187` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:218` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:231` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:244` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:252` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:255` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:256` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:259` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:260` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:270` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:281` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:286` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:299` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:300` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:305` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:324` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:330` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:336` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:342` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:345` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:356` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPageHeader.tsx:360` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/canvas/components/CanvasSessionPrepDialog.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | unknown-token | `src/frontend/dm/canvas/components/MysteryHealthPanel.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | literal-color | `src/frontend/dm/canvas/pages/CanvasPage.tsx:525` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/pages/CanvasPage.tsx:682` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/templates/cityTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/templates/dungeonTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/capture/QuickCaptureFAB.tsx:118` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/capture/QuickCaptureFAB.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/entities/entity-card.css:1` | Large stylesheet requires atomization (390 lines, 53 selectors). |
| high | literal-color | `src/frontend/dm/entities/entity-card.css:349` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entity-card.css:358` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entity-card.css:366` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:230` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:406` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:407` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:408` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:409` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:448` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:449` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:450` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:484` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:485` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:486` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:530` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:531` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:532` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:552` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:577` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:597` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityCreateModal.tsx:679` | Static or mixed inline style must move to an atomized stylesheet. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:1` | Selector depends on another component's DOM structure. |
| critical | mixed-responsibility | `src/frontend/dm/entities/entityDetailDialog.css:1` | Large stylesheet requires atomization (391 lines, 60 selectors). |
| high | legacy-token | `src/frontend/dm/entities/entityDetailDialog.css:1` | Legacy CSS variable remains in use. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:7` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:7` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:18` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:18` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:19` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:20` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:26` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:26` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:29` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:29` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:30` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:30` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:31` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:32` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:35` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:40` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:47` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:47` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:48` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:49` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:52` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:54` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:57` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:58` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:59` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:60` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:61` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:66` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:74` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:75` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:76` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:86` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:86` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:91` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:91` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:95` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:95` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:96` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:100` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:100` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:104` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:104` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:109` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:109` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:110` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:111` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:120` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:124` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:124` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:130` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:130` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:135` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:135` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:136` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:138` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:139` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:144` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:144` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:147` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:148` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:155` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:162` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:167` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:172` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:177` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:183` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:188` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:194` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:200` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:200` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:203` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:204` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:204` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:205` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:206` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:207` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:209` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:214` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:214` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:218` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:219` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:223` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:223` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:227` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:227` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:228` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:233` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:235` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:239` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:239` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:243` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:243` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:247` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:250` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:252` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:253` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:254` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:259` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:260` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:263` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:268` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:273` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:279` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:284` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:290` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:295` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:299` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:305` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:305` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:309` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:310` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:314` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:324` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:324` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:325` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:326` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:330` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:330` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:342` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:342` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:346` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:346` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:347` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:348` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:349` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:353` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:353` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:363` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:363` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:364` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:368` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:368` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:369` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:370` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:371` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:377` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:377` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:383` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailHeroActions.css:1` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:43` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:1` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:8` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:8` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:13` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:20` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:20` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:24` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:26` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:35` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:35` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:36` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:37` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:48` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:48` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:49` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:50` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:51` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:71` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:78` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:78` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:82` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:83` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:84` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:99` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:99` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:102` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:103` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:104` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:113` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:113` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:114` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:115` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:123` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:123` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:124` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:126` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:127` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:128` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:136` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:139` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:140` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:141` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:142` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:149` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:155` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:161` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:161` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:164` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:165` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:171` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:178` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:178` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:184` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:184` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:190` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:191` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:197` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:191` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/entities/EntityDetailModal.tsx:203` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:213` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:251` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:255` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:281` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:325` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:365` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:366` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:386` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:387` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:70` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:79` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/HechosTab.tsx:105` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/entities/playerCharacterDetail.css:1` | Large stylesheet requires atomization (359 lines, 50 selectors). |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:89` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:122` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:143` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:164` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:228` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:232` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:246` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:275` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:284` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:296` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:300` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:300` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:301` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:302` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:303` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:304` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:305` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:307` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:308` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:309` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:310` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:311` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:312` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:314` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:315` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:317` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:318` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:323` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:329` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:329` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:344` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:349` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:350` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:351` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:352` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:353` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:354` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/playerCharacterDetail.css:355` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:102` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:131` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:188` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/RelationCreateModal.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:40` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:127` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:135` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:212` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:235` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/RelationshipEdge.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/relations/relationshipGraph.css:44` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/relations/relationshipGraph.css:66` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:37` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:46` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:91` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:94` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:113` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:131` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:132` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:133` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:140` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:151` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:152` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:168` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:191` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:192` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:193` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:196` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:197` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:198` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:200` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:201` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:202` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:206` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:208` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:211` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:212` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:213` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:217` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:219` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:220` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:223` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:224` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:227` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:228` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:232` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:233` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:234` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:240` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:246` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:249` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:250` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:252` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:262` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:268` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:272` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:278` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:279` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:288` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:289` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:290` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:410` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:420` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:424` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:434` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:445` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:455` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:478` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:490` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:500` | Static or mixed inline style must move to an atomized stylesheet. |
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
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:23` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:26` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:30` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:44` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:80` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:81` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:109` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:113` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:121` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:122` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:124` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:133` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:138` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:142` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:146` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:150` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:158` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:159` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:173` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:178` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:194` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:195` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:196` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:208` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:212` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:220` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:221` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:223` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:227` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:232` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:244` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:245` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:247` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:248` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:250` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:259` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:263` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:267` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:271` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:275` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:282` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:283` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:285` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:289` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:293` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:297` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:301` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:305` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:312` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:313` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:315` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:319` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:323` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:327` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:331` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:335` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:339` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:343` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:350` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:351` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:353` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:357` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:361` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:369` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:395` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:399` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:411` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:412` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:414` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:423` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:429` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:433` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:437` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:443` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:447` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:451` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/TypeMetadataForm.tsx:456` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:28` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/CampaignTemplateLibrarySection.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignModals.tsx:1` | CSS variable is not declared or allowlisted. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:95` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:95` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:104` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:144` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:144` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:171` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:171` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:182` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:185` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:204` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:232` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:232` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:237` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:237` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:266` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:266` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:274` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:274` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:274` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:293` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/hub/DmHubCampaignModals.tsx:293` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/hub/DmHubCampaignModals.tsx:327` | Literal visual color outside a registered theme package. |
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
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubCampaignsColumn.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | unknown-token | `src/frontend/dm/hub/DmHubHero.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/dm/hub/DmHubHero.tsx:69` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubHero.tsx:76` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubPage.tsx:363` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/dm/hub/DmHubSidebar.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubSidebar.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubSidebar.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/hub/DmHubSidebar.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:40` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/hub/DmHubSidebar.tsx:70` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubSidebar.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubTopBar.tsx:51` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/hub/DmHubTopBar.tsx:59` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/layouts/campaign-route-transitions.css:48` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/layouts/campaign-route-transitions.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/layouts/campaign-route-transitions.css:74` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/layouts/campaign-route-transitions.css:75` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/layouts/campaign-route-transitions.css:76` | Important declarations bypass the intended cascade. |
| high | unknown-token | `src/frontend/dm/layouts/CampaignShell.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:152` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:170` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:179` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:212` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:243` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:262` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:278` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:279` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:285` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:294` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/library/boards/entityBoards.css:1` | Large stylesheet requires atomization (243 lines, 37 selectors). |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:36` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:112` | Literal visual color outside a registered theme package. |
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
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:274` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:305` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:328` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:378` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:390` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:394` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:398` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:410` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:419` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:426` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:444` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:458` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:462` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:474` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:478` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:488` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:492` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:509` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:525` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:589` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:592` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:656` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:657` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:667` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:668` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:674` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:679` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:689` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:711` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:716` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:732` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:733` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:735` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:424` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/notebooks/NotebooksView.tsx:433` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:511` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:544` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:548` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:574` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/notebooks/NotebooksView.tsx:584` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:585` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:591` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:614` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:618` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/notebooks/NotebooksView.tsx:622` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/library/notebooks/notebooksWorkspace.css:1` | Large stylesheet requires atomization (293 lines, 50 selectors). |
| high | literal-color | `src/frontend/dm/library/notebooks/notebooksWorkspace.css:168` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/notebooks/notebooksWorkspace.css:223` | Literal visual color outside a registered theme package. |
| high | legacy-token | `src/frontend/dm/map/mapWorkspace.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/map/mapWorkspace.css:1` | Legacy CSS variable remains in use. |
| high | literal-color | `src/frontend/dm/map/network/NetworkFactNode.tsx:19` | Literal visual color outside a registered theme package. |
| info | dynamic-style | `src/frontend/dm/map/network/NetworkFactNode.tsx:19` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/map/network/NetworkFilterBar.tsx:165` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/map/network/networkFlow.css:1` | Large stylesheet requires atomization (805 lines, 113 selectors). |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/map/network/networkFlow.css:1` | CSS variable is not declared or allowlisted. |
| high | cross-component-selector | `src/frontend/dm/map/network/networkFlow.css:28` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:100` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:246` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:413` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:415` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:419` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:428` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:429` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:430` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:433` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:435` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:440` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:441` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:446` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:449` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:455` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:462` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:463` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:467` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:468` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:469` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:470` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:512` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:631` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/onboarding/campaign-starter-hub.css:243` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:320` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:498` | Runtime style requires review and CSS custom-property preference. |
| high | unknown-token | `src/frontend/dm/overview/OverviewPage.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:276` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:281` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:282` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:298` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:300` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:310` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:320` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:323` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:328` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:355` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:374` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:403` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:411` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:428` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:445` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:449` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:452` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:460` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:473` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:476` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:478` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/overview/OverviewPage.tsx:479` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:482` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:484` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:490` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:511` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:518` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:524` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:530` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:548` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:565` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:571` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:575` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:590` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:597` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:608` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:619` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:630` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:642` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:649` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:652` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:662` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:666` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:669` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:673` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/overview/OverviewPage.tsx:680` | Static or mixed inline style must move to an atomized stylesheet. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:6` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:6` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:7` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/pages/campaignMessagesPage.css:13` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:17` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:17` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:28` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:34` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/pages/campaignMessagesPage.css:38` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/pages/campaignMessagesPage.css:41` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/pages/campaignMessagesPage.css:43` | Literal visual color outside a registered theme package. |
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
| high | legacy-token | `src/frontend/dm/pages/OnboardingPage.tsx:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/dm/pages/OnboardingPage.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | literal-color | `src/frontend/dm/pages/OnboardingPage.tsx:146` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:146` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:147` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:148` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/pages/OnboardingPage.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/pages/rulesPage.css:1` | Large stylesheet requires atomization (179 lines, 32 selectors). |
| high | unknown-token | `src/frontend/dm/pages/rulesPage.css:1` | CSS variable is not declared or allowlisted. |
| high | literal-color | `src/frontend/dm/pages/rulesPage.css:142` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/pages/rulesPage.css:146` | Selector depends on another component's DOM structure. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:77` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:79` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:108` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/people/group/components/PlayerProfileModal.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/people/group/groupWorkspace.css:1` | Large stylesheet requires atomization (631 lines, 93 selectors). |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:280` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:301` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:310` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:459` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:460` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:538` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/people/group/groupWorkspace.css:628` | Literal visual color outside a registered theme package. |
| critical | mixed-responsibility | `src/frontend/dm/people/peopleWorkspace.css:1` | Large stylesheet requires atomization (390 lines, 60 selectors). |
| high | unknown-token | `src/frontend/dm/people/peopleWorkspace.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/people/peopleWorkspace.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/dm/people/peopleWorkspace.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/dm/people/peopleWorkspace.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/people/peopleWorkspace.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/people/peopleWorkspace.css:1` | CSS variable is not declared or allowlisted. |
| high | literal-color | `src/frontend/dm/people/peopleWorkspace.css:142` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/people/peopleWorkspace.css:279` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/people/peopleWorkspace.css:308` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:28` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:45` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:46` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:53` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:55` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:60` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:71` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:72` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:74` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:82` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:90` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:91` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/ActiveSessionPrepPanel.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/CreateConsequenceForm.tsx:93` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/CreateConsequenceForm.tsx:128` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/EntityMultiPicker.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/EntityMultiPicker.tsx:36` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/EntityMultiPicker.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/EntityMultiPicker.tsx:45` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/PrepLinkedList.tsx:17` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/PrepLinkedList.tsx:18` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/PrepLinkedList.tsx:20` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickCaptureBar.tsx:134` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickCaptureBar.tsx:151` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickCaptureBar.tsx:160` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickCaptureBar.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/sessions/components/QuickCaptureBar.tsx:178` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickCaptureBar.tsx:192` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickNoteForm.tsx:75` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/QuickNoteForm.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:137` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:159` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:185` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:197` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:202` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/RecordDecisionForm.tsx:226` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:62` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:78` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:83` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:113` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:120` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:129` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:139` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionEventFeed.tsx:154` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:66` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:68` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:88` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:93` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:99` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:103` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:107` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:118` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionPrepEditor.tsx:121` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:111` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:129` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:190` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:197` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:205` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionQuickActions.tsx:222` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionStatusBar.tsx:12` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionStatusBar.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionStatusBar.tsx:26` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionStatusBar.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionStatusBar.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/sessions/components/SessionStatusBar.tsx:67` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/sessions/sessionWorkspace.css:1` | Large stylesheet requires atomization (404 lines, 67 selectors). |
| high | unknown-token | `src/frontend/dm/sessions/sessionWorkspace.css:1` | CSS variable is not declared or allowlisted. |
| high | literal-color | `src/frontend/dm/sessions/sessionWorkspace.css:139` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/sessions/sessionWorkspace.css:233` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/sessions/sessionWorkspace.css:255` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:33` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:47` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:76` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/shortcuts/ShortcutsPanel.tsx:98` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/story/history/campaignHistory.css:1` | Large stylesheet requires atomization (295 lines, 41 selectors). |
| high | unknown-token | `src/frontend/dm/story/history/campaignHistory.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/story/history/campaignHistory.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/story/history/campaignHistory.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/story/history/campaignHistory.css:1` | CSS variable is not declared or allowlisted. |
| high | cross-component-selector | `src/frontend/dm/story/history/campaignHistory.css:106` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/story/history/campaignHistory.css:171` | Literal visual color outside a registered theme package. |
| high | legacy-token | `src/frontend/dm/story/plan/StoryPlanView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/story/plan/StoryPlanView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/story/plan/StoryPlanView.tsx:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/dm/story/plan/StoryPlanView.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/story/plan/StoryPlanView.tsx:1` | CSS variable is not declared or allowlisted. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:419` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:423` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:434` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:435` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:448` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:449` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:458` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:466` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:468` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:488` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:490` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:506` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:522` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:525` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:536` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:540` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:552` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:553` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:554` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:555` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:558` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:570` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:576` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:590` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:595` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:612` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:613` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:614` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:626` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:627` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:646` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:654` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:669` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:680` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:681` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:682` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:688` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:694` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:695` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:718` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:732` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:741` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:742` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:746` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:756` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:767` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:768` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:769` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:770` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:772` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:777` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:783` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:794` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:803` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:811` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:838` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:845` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:846` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:853` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:855` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:860` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:863` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:872` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:873` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:876` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:883` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:889` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:896` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:912` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:920` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:926` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:943` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:957` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:971` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:973` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:985` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/story/plan/StoryPlanView.tsx:991` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1001` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1012` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1015` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1031` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1050` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1066` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/story/plan/StoryPlanView.tsx:1079` | Static or mixed inline style must move to an atomized stylesheet. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:2` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:6` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:14` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:16` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:18` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:30` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:31` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:32` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:33` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:34` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:38` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:43` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:44` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:53` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:54` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:55` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:56` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:57` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/story/plan/storyPlanWorkspace.css:58` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:63` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:64` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:65` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:69` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/story/plan/storyPlanWorkspace.css:70` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:74` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/story/plan/storyPlanWorkspace.css:79` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:101` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/story/plan/storyPlanWorkspace.css:105` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:108` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:122` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:133` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:138` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/story/plan/storyPlanWorkspace.css:146` | Important declarations bypass the intended cascade. |
| high | static-inline | `src/frontend/home/AccountHomePage.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/home/AccountHomePage.tsx:60` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/home/AccountHomePage.tsx:97` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/institutional/institutional.css:1` | Large stylesheet requires atomization (274 lines, 38 selectors). |
| high | literal-color | `src/frontend/institutional/institutional.css:6` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:8` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:9` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:10` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:26` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:34` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:58` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:60` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:61` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:62` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:69` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:85` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:100` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:102` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:103` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:132` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:141` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:142` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:143` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:165` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:173` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:175` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:176` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:189` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:194` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:200` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:219` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:220` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:230` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:231` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/institutional/institutional.css:248` | Literal visual color outside a registered theme package. |
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
| high | static-inline | `src/frontend/MainLanding.tsx:49` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/MainLanding.tsx:82` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:83` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:84` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:85` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:87` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:88` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:89` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/MainLanding.tsx:90` | Literal visual color outside a registered theme package. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:92` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:95` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:98` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:101` | Runtime style requires review and CSS custom-property preference. |
| info | dynamic-style | `src/frontend/MainLanding.tsx:104` | Runtime style requires review and CSS custom-property preference. |
| high | unknown-token | `src/frontend/player/components/PlayerCharacterSelectionCard.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | cross-component-selector | `src/frontend/player/pages/playerCampaignShell.css:86` | Selector depends on another component's DOM structure. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:87` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignsPage.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignsPage.tsx:54` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | literal-color | `src/frontend/player/pages/PlayerCampaignTabContent.tsx:260` | Literal visual color outside a registered theme package. |
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
| high | static-inline | `src/frontend/shared/auth/ForgotPasswordPage.tsx:43` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ForgotPasswordPage.tsx:45` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ForgotPasswordPage.tsx:57` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ForgotPasswordPage.tsx:58` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ForgotPasswordPage.tsx:92` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ResetPasswordPage.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ResetPasswordPage.tsx:52` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ResetPasswordPage.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ResetPasswordPage.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ResetPasswordPage.tsx:100` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/auth/ResetPasswordPage.tsx:134` | Static or mixed inline style must move to an atomized stylesheet. |
| high | legacy-token | `src/frontend/shared/components/CampaignMessagingPanel.tsx:1` | Legacy CSS variable remains in use. |
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
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:274` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:275` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:276` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:277` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:277` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:281` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:282` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:283` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:284` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:284` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/CampaignMessagingPanel.tsx:288` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:289` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:289` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:289` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:290` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:291` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/CampaignMessagingPanel.tsx:296` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:297` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:298` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:299` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:307` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:310` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:311` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:312` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:316` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:317` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:318` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/CampaignMessagingPanel.tsx:319` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/CampaignTemplateImportDialog.tsx:112` | Runtime style requires review and CSS custom-property preference. |
| high | mixed-responsibility | `src/frontend/shared/components/entityImageReframeDialog.css:1` | Large stylesheet requires atomization (329 lines, 42 selectors). |
| high | legacy-token | `src/frontend/shared/components/entityImageReframeDialog.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/components/entityImageReframeDialog.css:1` | Legacy CSS variable remains in use. |
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
| high | literal-color | `src/frontend/shared/components/entityImageReframeDialog.css:297` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/components/entityImageReframeDialog.css:325` | Important declarations bypass the intended cascade. |
| high | legacy-token | `src/frontend/shared/components/ImagePickerButton.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/components/ImagePickerButton.tsx:1` | Legacy CSS variable remains in use. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:63` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:69` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:71` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:72` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:76` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:80` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:87` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:101` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:108` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:175` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:181` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:182` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:197` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:201` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:207` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerButton.tsx:217` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:223` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerButton.tsx:228` | Literal visual color outside a registered theme package. |
| high | unknown-token | `src/frontend/shared/components/ImagePickerModal.tsx:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/components/ImagePickerModal.tsx:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/components/ImagePickerModal.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:268` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:271` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:277` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:287` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:287` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:293` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:337` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:337` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:345` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:348` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:348` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:351` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:357` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:364` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:366` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:367` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:372` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:373` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:374` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:374` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:399` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:413` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:417` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ImagePickerModal.tsx:421` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ImagePickerModal.tsx:433` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/PwaUpdateBanner.tsx:18` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/PwaUpdateBanner.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/shared/components/RpgPortalBackground.tsx:33` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/shared/components/RpgPortalBackground.tsx:48` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/RpgPortalBackground.tsx:149` | Static or mixed inline style must move to an atomized stylesheet. |
| high | unknown-token | `src/frontend/shared/components/SystemAnnouncements.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/components/SystemAnnouncements.tsx:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/components/SystemAnnouncements.tsx:1` | CSS variable is not declared or allowlisted. |
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
| high | literal-color | `src/frontend/shared/components/ToastContainer.tsx:4` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ToastContainer.tsx:5` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/components/ToastContainer.tsx:6` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/shared/components/ToastContainer.tsx:18` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/shared/components/ToastContainer.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/shared/components/ToastContainer.tsx:41` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/features/rules-workspace.css:39` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:17` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:21` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/foundation/motion.css:24` | Important declarations bypass the intended cascade. |
| critical | mixed-responsibility | `src/frontend/shared/styles/index.css:1` | Large stylesheet requires atomization (9012 lines, 1309 selectors). |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/shared/styles/index.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/shared/styles/index.css:1` | CSS variable is not declared or allowlisted. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:2` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:135` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:270` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:276` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:282` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:288` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:379` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:440` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:514` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:589` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:592` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:593` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:594` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:604` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:605` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:606` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:607` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:611` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:612` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:635` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:636` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:643` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:648` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:653` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:661` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:666` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:671` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:683` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:683` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:684` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:696` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:697` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:697` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:698` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:704` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:705` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:717` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:745` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:748` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:766` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:801` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:802` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:834` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:852` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:853` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:853` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:867` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:869` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:870` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:896` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:922` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:923` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:924` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:928` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:929` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:930` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:934` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:935` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:936` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:983` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:984` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:989` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:990` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:999` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1012` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1013` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1014` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1020` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1034` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1044` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1045` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1052` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1053` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1090` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1109` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1134` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1161` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1162` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1219` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:1228` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:1285` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1335` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1342` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1508` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1512` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1513` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1518` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1519` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1522` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1523` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1528` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1529` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1530` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1533` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1534` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1535` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1540` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1541` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1544` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1545` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1548` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1550` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1551` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1552` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1555` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1556` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1557` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1562` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1563` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1566` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1586` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1587` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1617` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1617` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1659` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1661` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1690` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1701` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1727` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1729` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1729` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1731` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1739` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1739` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1756` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1762` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1777` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1779` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1781` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1857` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1859` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1859` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1878` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1900` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1910` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1920` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2024` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2030` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2164` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2219` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2220` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2223` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2224` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2228` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2229` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2232` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2233` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2349` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2377` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2378` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2380` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2380` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2394` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2408` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2415` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2416` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2420` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2421` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2421` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2425` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2426` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2453` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2454` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2462` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2463` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2471` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2474` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2475` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2475` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2476` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2476` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2484` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2497` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2497` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2531` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2532` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:2558` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:2635` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2675` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2678` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2685` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2686` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2686` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2695` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2710` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2711` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2731` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2742` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2761` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2776` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2777` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2784` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2797` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2799` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2816` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2818` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2824` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2830` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2850` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2854` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2855` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2859` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2860` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2865` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2876` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2877` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2878` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2882` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2882` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2886` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2886` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2889` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2890` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2890` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2891` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2891` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2892` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2893` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2901` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2913` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2920` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2923` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2924` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2924` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2925` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2925` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2926` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2927` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2941` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2969` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2981` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2982` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2982` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3005` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3006` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3010` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3011` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3012` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3014` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3015` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3020` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3022` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3023` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3024` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3063` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3064` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3068` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3068` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3068` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3075` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3102` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3134` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3178` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3189` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3189` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3190` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3190` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3194` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3194` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3212` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3216` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3217` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3218` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3219` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3224` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3224` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3225` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3225` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3226` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3226` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3230` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3230` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3231` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3231` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3232` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3232` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3236` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3236` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3237` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3237` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3238` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3238` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3247` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3256` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3256` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3289` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3303` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3356` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3376` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3377` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3394` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3411` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3414` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3447` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3450` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3457` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3460` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3463` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3466` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3469` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3473` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3476` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3480` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3483` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3486` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3489` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3490` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3490` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3491` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3492` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3493` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3494` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3495` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3496` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3497` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3502` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3503` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3504` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3504` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3507` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3508` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3512` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3534` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3539` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3566` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3587` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3588` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3608` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3685` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3686` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3696` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3699` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3703` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3704` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3705` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3736` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3736` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3737` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3748` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3753` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3761` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3783` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3784` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3799` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3807` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3840` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3851` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3851` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3852` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3852` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3882` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3883` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3887` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3895` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3926` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4012` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4013` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4023` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4051` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4070` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4103` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4107` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4111` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:4125` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4125` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4126` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4146` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4156` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4173` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4174` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4175` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4176` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4178` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4234` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4238` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4242` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:4242` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:4276` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4345` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4436` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:4460` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4460` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4461` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4486` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4495` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4506` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4516` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4529` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4544` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4552` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4561` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4587` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4597` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4614` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4615` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4619` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4620` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4625` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4629` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4633` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4634` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4635` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4636` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4640` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4644` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4649` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4660` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4683` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4684` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4723` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:4730` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4805` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4898` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4898` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4934` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5011` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:5105` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:5108` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:5129` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:5155` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:5168` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5176` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5181` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5182` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:5266` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5293` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5310` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5313` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5341` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5433` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5439` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:5686` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:5688` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5690` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:5691` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5692` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:5735` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5748` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5791` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5811` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5813` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5841` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5872` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5873` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5887` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5897` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5965` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5969` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6001` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6007` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6009` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6043` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6052` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6053` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6054` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6089` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6121` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6130` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6131` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6147` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6148` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6161` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6161` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6184` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6185` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6192` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6193` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6204` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6205` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6229` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6229` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6230` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6233` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6242` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6248` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6248` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6287` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6314` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6315` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6321` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6322` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6355` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6356` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6368` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6369` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6377` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6378` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6394` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6395` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6403` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6414` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6415` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6445` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6446` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6447` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6456` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6456` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6458` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6459` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6459` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6503` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6509` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6510` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6531` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6532` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6659` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6660` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6699` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6700` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6708` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6709` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6709` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6737` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6737` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6738` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6739` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6743` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6743` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6744` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6745` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6749` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6749` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6750` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6751` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6764` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6767` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6771` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6772` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6773` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6784` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6792` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6793` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6832` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6832` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6833` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6838` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6838` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6839` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6904` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6905` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6912` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6912` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6928` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6937` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6937` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6960` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6961` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6993` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6994` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7023` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7024` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7036` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7037` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7037` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7045` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7051` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7068` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7069` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7070` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7074` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7075` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7076` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7087` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7143` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7174` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7179` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7180` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7193` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7194` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7202` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7203` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7213` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7214` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7216` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7242` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7243` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7253` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7254` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7282` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7283` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7289` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7290` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7323` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7335` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7336` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7337` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7341` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7342` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7343` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7351` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7360` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7386` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7387` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7394` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7395` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7406` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7407` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7408` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7428` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7429` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7438` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7439` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7466` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7485` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7495` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7510` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7511` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7514` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7519` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7556` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7560` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7565` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7577` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7578` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7578` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7579` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7581` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7595` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7598` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7637` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7638` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7640` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7644` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7664` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7665` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7707` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7708` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7708` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7709` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7712` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7748` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7753` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7774` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7775` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7787` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7805` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7807` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7852` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7853` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7865` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7879` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7879` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7895` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7896` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7900` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7908` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7933` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7935` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7942` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7943` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7948` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7965` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7971` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8009` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8015` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8022` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8022` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8030` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8031` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8041` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8042` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8059` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8063` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8098` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8099` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8128` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8150` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8167` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8174` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8175` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8182` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8204` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8211` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8246` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8250` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8251` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8252` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8256` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8258` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8274` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8275` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8282` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8296` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8298` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8304` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8305` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8306` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8323` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8324` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8332` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8333` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8338` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8368` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8369` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8376` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8403` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8404` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8406` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8443` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8444` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8457` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8457` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8458` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8465` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8469` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8551` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8614` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8617` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8629` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8631` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8644` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8645` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8697` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8736` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8814` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8815` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8816` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8832` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8859` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8868` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8869` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8873` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8874` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8875` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8910` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8911` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8913` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8913` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8927` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8936` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8948` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8958` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8969` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8977` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8978` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8987` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9002` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:1` | Selector depends on another component's DOM structure. |
| critical | mixed-responsibility | `src/frontend/shared/styles/landing.css:1` | Large stylesheet requires atomization (2595 lines, 391 selectors). |
| high | unknown-token | `src/frontend/shared/styles/landing.css:1` | CSS variable is not declared or allowlisted. |
| high | literal-color | `src/frontend/shared/styles/landing.css:30` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:33` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:68` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:118` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:130` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:131` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:132` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:133` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:151` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:161` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:164` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:165` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:171` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:189` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:192` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:193` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:210` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:214` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:215` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:219` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:220` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:221` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:222` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:225` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:226` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:238` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:251` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:269` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:270` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:272` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:273` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:274` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:275` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:277` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:278` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:284` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:323` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:326` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:327` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:328` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:329` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:352` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:379` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:384` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:401` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:402` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:414` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:429` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:429` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:430` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:455` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:476` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:477` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:511` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:522` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:542` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:544` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:548` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:550` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:553` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:554` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:556` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:559` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:560` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:562` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:572` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:573` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:586` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:608` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:610` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:614` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:616` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:620` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:622` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:650` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:654` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:655` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:656` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:657` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:661` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:665` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:666` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:670` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:674` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:675` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:679` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:683` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:684` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/shared/styles/landing.css:685` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/landing.css:756` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:812` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:813` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:814` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:828` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:829` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:833` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:858` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:865` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:869` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:870` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:874` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:875` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:879` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:880` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:884` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:885` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:898` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:916` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:916` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:917` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:917` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:918` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:918` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:958` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:959` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:999` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1000` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1016` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1018` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1021` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1023` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1039` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1047` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1061` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1068` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1093` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1102` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1114` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1124` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1132` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1141` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1142` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1143` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1182` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1184` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1218` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1236` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1237` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1271` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1272` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1273` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1281` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1430` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1550` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1554` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1555` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1570` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1576` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1607` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1608` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1609` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1638` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1646` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1658` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1659` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1685` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1690` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1710` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1714` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1769` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1770` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1771` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1776` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1780` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1788` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1789` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:1998` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2012` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2013` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2018` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2019` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2023` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2024` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2028` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2029` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2034` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2036` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2039` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2046` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2050` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2051` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2051` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2055` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2056` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2056` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2073` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2087` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2087` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2088` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2089` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2096` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2100` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2100` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2101` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2124` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2133` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2134` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2135` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2145` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2146` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2147` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2186` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2186` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2196` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2197` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2198` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2209` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2211` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2238` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2239` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2240` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2244` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2245` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2246` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2250` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2251` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2252` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2256` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2257` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2258` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2278` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2279` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2288` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2289` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2308` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2309` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2317` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2318` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2329` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2342` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2381` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2396` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2397` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2449` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2466` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2470` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2470` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2481` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2482` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2485` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2486` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2493` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2543` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2546` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2547` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2554` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/landing.css:2567` | Literal visual color outside a registered theme package. |
| critical | mixed-responsibility | `src/frontend/shared/styles/layout/workspace.css:1` | Large stylesheet requires atomization (1010 lines, 150 selectors). |
| high | cross-component-selector | `src/frontend/shared/styles/layout/workspace.css:90` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:115` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:256` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:331` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:421` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:433` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:456` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:466` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:509` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:655` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:701` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:721` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/layout/workspace.css:929` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/layout/workspace.css:960` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/primitives/button.css:12` | Literal visual color outside a registered theme package. |
| medium | global-selector | `src/frontend/shared/styles/primitives/card.css:1` | Generic selector has global collision risk. |
