# Style audit baseline

Generated mechanically by `npm run styles:audit:report`.

## Summary

```json
{
  "cssFiles": 31,
  "tsxFilesWithInlineStyles": 96,
  "forbiddenLiteralColors": 1567,
  "staticInlineStyles": 1329,
  "dynamicInlineStyles": 37,
  "unknownCssVariables": 256,
  "legacyCssVariables": 70,
  "orphanCssFiles": 0,
  "mixedResponsibilityFiles": 19,
  "crossComponentSelectors": 126,
  "importantDeclarations": 408,
  "unclassifiedCssFiles": 0
}
```

## Stylesheets

| File | Layer | Domain | Lines | Selectors | Importers |
|---|---:|---:|---:|---:|---:|
| `src/frontend/account/account.css` | legacy | account | 811 | 123 | 1 |
| `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css` | feature | canvas | 265 | 34 | 1 |
| `src/frontend/dm/entities/entities.css` | feature | entities | 502 | 70 | 1 |
| `src/frontend/dm/entities/entityDetailDialog.css` | feature | entities | 353 | 55 | 1 |
| `src/frontend/dm/entities/entityDetailHeroActions.css` | feature | entities | 57 | 8 | 1 |
| `src/frontend/dm/entities/entityDetailImageContinuation.css` | feature | entities | 199 | 18 | 1 |
| `src/frontend/dm/entities/playerCharacterDetail.css` | feature | entities | 359 | 50 | 1 |
| `src/frontend/dm/entities/relations/relationshipGraph.css` | feature | entities | 63 | 11 | 2 |
| `src/frontend/dm/layouts/campaign-route-transitions.css` | layout | layout | 79 | 19 | 1 |
| `src/frontend/dm/library/boards/entityBoards.css` | feature | library | 243 | 37 | 1 |
| `src/frontend/dm/library/list/entityListRefinements.css` | feature | library | 96 | 16 | 1 |
| `src/frontend/dm/library/notebooks/notebooksWorkspace.css` | feature | library | 293 | 50 | 1 |
| `src/frontend/dm/map/mapWorkspace.css` | feature | map | 94 | 14 | 1 |
| `src/frontend/dm/map/network/networkFlow.css` | feature | map | 805 | 113 | 1 |
| `src/frontend/dm/pages/campaignMessagesPage.css` | feature | pages | 113 | 22 | 1 |
| `src/frontend/dm/pages/rulesPage.css` | feature | pages | 179 | 32 | 1 |
| `src/frontend/dm/pages/settingsPage.css` | feature | pages | 135 | 21 | 1 |
| `src/frontend/dm/people/group/groupWorkspace.css` | feature | people | 631 | 93 | 1 |
| `src/frontend/dm/people/peopleWorkspace.css` | feature | people | 390 | 60 | 1 |
| `src/frontend/dm/sessions/sessionWorkspace.css` | feature | sessions | 404 | 67 | 1 |
| `src/frontend/dm/story/history/campaignHistory.css` | feature | story | 295 | 41 | 1 |
| `src/frontend/dm/story/plan/storyPlanWorkspace.css` | feature | story | 153 | 27 | 1 |
| `src/frontend/dm/workspaces/campaignWorkspace.css` | layout | workspace | 850 | 124 | 1 |
| `src/frontend/dm/workspaces/workspaceSystem.css` | layout | workspace | 161 | 26 | 2 |
| `src/frontend/institutional/institutional.css` | feature | institutional | 274 | 38 | 1 |
| `src/frontend/shared/components/entityImageReframeDialog.css` | component | shared-components | 329 | 42 | 1 |
| `src/frontend/shared/styles/index.css` | legacy | shared | 9719 | 1406 | 1 |
| `src/frontend/shared/styles/landing.css` | legacy | shared | 2595 | 391 | 1 |
| `src/frontend/shared/styles/p1.css` | legacy | shared | 154 | 27 | 1 |
| `src/frontend/shared/styles/primitives.css` | primitive | shared | 494 | 67 | 1 |
| `src/frontend/shared/styles/tokens.css` | foundation | shared | 46 | 4 | 1 |

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
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:833` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:847` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:849` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:851` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1230` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1276` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1294` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1295` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1296` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1298` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1299` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1299` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CampaignCanvasFlow.tsx:1299` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:1` | Large stylesheet requires atomization (265 lines, 34 selectors). |
| high | unknown-token | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:1` | CSS variable is not declared or allowlisted. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:31` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:54` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:61` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:67` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:94` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:96` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:97` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:97` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:103` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:114` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:115` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:162` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:213` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:214` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:215` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:216` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:221` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/canvas/components/canvas-mobile-toolbar.css:237` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:174` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:174` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:175` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:175` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:176` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:176` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:177` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:177` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:178` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:178` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:179` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:179` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:180` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:180` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:181` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:185` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:186` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:186` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:189` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:190` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBoardDialogs.tsx:190` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasBulkActionsBar.tsx:56` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasEntityNode.tsx:14` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasEntityNode.tsx:70` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:33` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:35` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:264` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:304` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:304` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:306` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:309` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:320` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:329` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/canvas/components/CanvasPalette.tsx:338` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:349` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:593` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/components/CanvasPalette.tsx:595` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/canvas/pages/CanvasPage.tsx:522` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/canvas/pages/CanvasPage.tsx:679` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/canvas/templates/cityTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/canvas/templates/dungeonTemplate.ts:5` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/capture/QuickCaptureFAB.tsx:118` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/capture/QuickCaptureFAB.tsx:141` | Static or mixed inline style must move to an atomized stylesheet. |
| critical | mixed-responsibility | `src/frontend/dm/entities/entities.css:1` | Large stylesheet requires atomization (502 lines, 70 selectors). |
| high | unknown-token | `src/frontend/dm/entities/entities.css:1` | CSS variable is not declared or allowlisted. |
| high | unknown-token | `src/frontend/dm/entities/entities.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/dm/entities/entities.css:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/entities.css:1` | Legacy CSS variable remains in use. |
| high | literal-color | `src/frontend/dm/entities/entities.css:23` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:46` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:87` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:88` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:93` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:93` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:94` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:94` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:125` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:126` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:126` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:129` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:130` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:130` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:141` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:142` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:143` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:148` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:155` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:155` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:167` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:173` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:186` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:201` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:201` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:202` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:202` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:203` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:229` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:230` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:230` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:238` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:239` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:239` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:263` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:264` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:312` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:318` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:335` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:366` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:367` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:373` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:386` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:390` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:432` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:433` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:442` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entities.css:450` | Literal visual color outside a registered theme package. |
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
| critical | mixed-responsibility | `src/frontend/dm/entities/entityDetailDialog.css:1` | Large stylesheet requires atomization (353 lines, 55 selectors). |
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
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:40` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:60` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:60` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:61` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:61` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:61` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:66` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:66` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:71` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:71` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:72` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:73` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:82` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:86` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:86` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:92` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:92` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:97` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:97` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:98` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:101` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:106` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:106` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:109` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:110` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:113` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:117` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:124` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:129` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:134` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:139` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:145` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:150` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:156` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:162` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:162` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:165` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:166` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:166` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:167` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:168` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:169` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:171` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:176` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:176` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:180` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:181` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:185` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:185` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:189` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:189` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:190` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:195` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:197` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:201` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:201` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:205` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:205` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:209` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:212` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:214` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:215` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailDialog.css:216` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:216` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:221` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:222` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:225` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:230` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:235` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:241` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:246` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:252` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:257` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:261` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:267` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:267` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:271` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:272` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:276` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:286` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:286` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:287` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:288` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:292` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:292` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:304` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:304` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:308` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:308` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:309` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:310` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:311` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:315` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:315` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:325` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:325` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:326` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:330` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:330` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:331` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:332` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:333` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailDialog.css:339` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:339` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailDialog.css:345` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailHeroActions.css:1` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/entities/entityDetailHeroActions.css:16` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailHeroActions.css:18` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailHeroActions.css:19` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailHeroActions.css:30` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailHeroActions.css:32` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailHeroActions.css:37` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:56` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:57` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:58` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:59` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:60` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:61` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:62` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:67` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:70` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:71` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:78` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:78` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:79` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:82` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:83` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:84` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:84` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:87` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:88` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:89` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:90` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:99` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:99` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:100` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:101` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:102` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:102` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:103` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:103` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:104` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:105` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:113` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:113` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:114` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:114` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:115` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:123` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:123` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:124` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:126` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:126` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:127` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:128` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:128` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/dm/entities/entityDetailImageContinuation.css:136` | Selector depends on another component's DOM structure. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:139` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:140` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:141` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/entities/entityDetailImageContinuation.css:142` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/entities/entityDetailImageContinuation.css:146` | Literal visual color outside a registered theme package. |
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
| high | legacy-token | `src/frontend/dm/entities/EntityDetailModal.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/EntityDetailModal.tsx:1` | Legacy CSS variable remains in use. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:187` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/entities/EntityDetailModal.tsx:199` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:209` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/EntityDetailModal.tsx:219` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:232` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:247` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:251` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:277` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/EntityDetailModal.tsx:285` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/EntityDetailModal.tsx:291` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:321` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:359` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:360` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:380` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/EntityDetailModal.tsx:381` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:38` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:38` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:39` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:39` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:40` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:40` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:41` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:41` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:42` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:42` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:43` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:43` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:44` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:44` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:45` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/HechosTab.tsx:45` | Literal visual color outside a registered theme package. |
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
| high | legacy-token | `src/frontend/dm/entities/playerCharacterDetail.css:1` | Legacy CSS variable remains in use. |
| high | literal-color | `src/frontend/dm/entities/playerCharacterDetail.css:7` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/playerCharacterDetail.css:21` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:89` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:122` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:143` | Selector depends on another component's DOM structure. |
| high | cross-component-selector | `src/frontend/dm/entities/playerCharacterDetail.css:164` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/entities/playerCharacterDetail.css:191` | Literal visual color outside a registered theme package. |
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
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:45` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:61` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:65` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:77` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/EntityRelationsTab.tsx:93` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/relations/RelationshipEdge.tsx:41` | Static or mixed inline style must move to an atomized stylesheet. |
| high | legacy-token | `src/frontend/dm/entities/relations/relationshipGraph.css:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/entities/relations/relationshipGraph.css:1` | Legacy CSS variable remains in use. |
| high | literal-color | `src/frontend/dm/entities/relations/relationshipGraph.css:26` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/relations/relationshipGraph.css:36` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/relations/relationshipGraph.css:37` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/relations/relationshipGraph.css:44` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/relations/RelationshipGraphCanvas.tsx:76` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:34` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:37` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:46` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:50` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:57` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:58` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:61` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:62` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:144` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:151` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:152` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:152` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:167` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:168` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:181` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:181` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:191` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:217` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:217` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:219` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:220` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:223` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:224` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:227` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:228` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:232` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:233` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:233` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:234` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:236` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:240` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:240` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:246` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:249` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:249` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:250` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:252` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:262` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:262` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:268` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:272` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:272` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:278` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:278` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:279` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/entities/ResumenTab.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/entities/ResumenTab.tsx:288` | Literal visual color outside a registered theme package. |
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
| high | legacy-token | `src/frontend/dm/entities/TrazabilidadTab.tsx:1` | Legacy CSS variable remains in use. |
| high | literal-color | `src/frontend/dm/entities/TrazabilidadTab.tsx:120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/TrazabilidadTab.tsx:121` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/TrazabilidadTab.tsx:122` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/entities/TrazabilidadTab.tsx:123` | Literal visual color outside a registered theme package. |
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
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:153` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:161` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:171` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:180` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:182` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:183` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:184` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:206` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:213` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:244` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:263` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:279` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:280` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:286` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/layouts/CampaignShell.tsx:295` | Static or mixed inline style must move to an atomized stylesheet. |
| high | mixed-responsibility | `src/frontend/dm/library/boards/entityBoards.css:1` | Large stylesheet requires atomization (243 lines, 37 selectors). |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:2` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:3` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:5` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:22` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:23` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:25` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:27` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:36` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:86` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:93` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:143` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/boards/entityBoards.css:149` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/library/boards/entityBoards.css:221` | Important declarations bypass the intended cascade. |
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
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:388` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:404` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:405` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:406` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:409` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:414` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:421` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/boards/EntityBoardsView.tsx:422` | Static or mixed inline style must move to an atomized stylesheet. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:7` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:8` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:9` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:10` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:11` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:12` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:78` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/library/list/entityListRefinements.css:93` | Important declarations bypass the intended cascade. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | unknown-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | CSS variable is not declared or allowlisted. |
| high | legacy-token | `src/frontend/dm/library/list/EntityListView.tsx:1` | Legacy CSS variable remains in use. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:271` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:302` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:325` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:375` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:387` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:391` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:395` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:407` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:416` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:423` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:424` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:425` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:441` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:444` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:455` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:459` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:471` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:475` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:485` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:489` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:492` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:493` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:506` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:509` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:510` | Literal visual color outside a registered theme package. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:522` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:586` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/library/list/EntityListView.tsx:589` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:653` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:654` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:664` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:665` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:665` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:671` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:676` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:676` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:686` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:708` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:713` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:719` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:723` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:729` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:730` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/library/list/EntityListView.tsx:732` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/library/list/EntityListView.tsx:735` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/library/notebooks/notebooksWorkspace.css:13` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:150` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:218` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:219` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:246` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:281` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:282` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:357` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:359` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:389` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:390` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:398` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:404` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:469` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:469` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:470` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:486` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:487` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:512` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:631` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:657` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:665` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:685` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/dm/map/network/networkFlow.css:685` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/dm/map/network/networkFlow.css:686` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/NetworkFlow.tsx:209` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/NetworkFlow.tsx:244` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/network/NetworkFlow.tsx:244` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/network/NetworkInspector.tsx:32` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/network/NetworkRelationEdge.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:38` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:39` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:39` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:41` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:42` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:64` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:73` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:76` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:89` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:96` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/map/shared/EntityNodeContent.tsx:111` | Runtime style requires review and CSS custom-property preference. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:119` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:126` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:126` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:132` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:137` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:137` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:137` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:143` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:143` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/EntityNodeContent.tsx:143` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:149` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/EntityNodeContent.tsx:149` | Literal visual color outside a registered theme package. |
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
| high | literal-color | `src/frontend/dm/map/shared/FactNodeContent.tsx:112` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/FactNodeContent.tsx:112` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/map/shared/RelationEdgeLabel.tsx:12` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/RelationEdgeLabel.tsx:13` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/RelationEdgeLabel.tsx:21` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/map/shared/ResourceNodeFrame.tsx:24` | Static or mixed inline style must move to an atomized stylesheet. |
| high | literal-color | `src/frontend/dm/map/shared/ResourceNodeFrame.tsx:27` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/ResourceNodeFrame.tsx:30` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/map/shared/ResourceNodeFrame.tsx:31` | Literal visual color outside a registered theme package. |
| high | static-inline | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:204` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:319` | Static or mixed inline style must move to an atomized stylesheet. |
| info | dynamic-style | `src/frontend/dm/onboarding/CampaignStarterHub.tsx:497` | Runtime style requires review and CSS custom-property preference. |
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
| critical | mixed-responsibility | `src/frontend/dm/workspaces/campaignWorkspace.css:1` | Large stylesheet requires atomization (850 lines, 124 selectors). |
| high | cross-component-selector | `src/frontend/dm/workspaces/campaignWorkspace.css:90` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:115` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:256` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:331` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:421` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:431` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:433` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:456` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:466` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:509` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:655` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:701` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/campaignWorkspace.css:721` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/dm/workspaces/workspaceSystem.css:80` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/dm/workspaces/workspaceSystem.css:111` | Selector depends on another component's DOM structure. |
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
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:84` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:85` | Static or mixed inline style must move to an atomized stylesheet. |
| high | static-inline | `src/frontend/player/pages/PlayerCampaignShell.tsx:86` | Static or mixed inline style must move to an atomized stylesheet. |
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
| critical | mixed-responsibility | `src/frontend/shared/styles/index.css:1` | Large stylesheet requires atomization (9719 lines, 1406 selectors). |
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
| medium | global-selector | `src/frontend/shared/styles/index.css:51` | Generic selector has global collision risk. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:69` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:202` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:337` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:343` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:349` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:355` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:446` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:507` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:581` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:656` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:659` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:660` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:661` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:671` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:672` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:673` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:674` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:678` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:679` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:702` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:703` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:710` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:715` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:720` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:728` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:733` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:738` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:750` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:750` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:751` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:763` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:764` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:764` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:765` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:771` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:772` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:784` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:812` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:815` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:833` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:868` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:869` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:901` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:919` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:920` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:920` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:934` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:936` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:937` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:963` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:989` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:990` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:991` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:995` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:996` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:997` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1001` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1002` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1003` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1050` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1051` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1056` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1057` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1066` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1079` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1080` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1081` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1087` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1101` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1157` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1176` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1177` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1201` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1228` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1229` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1286` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:1295` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:1352` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1402` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1409` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1575` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1579` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1580` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1585` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1586` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1589` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1590` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1595` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1596` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1597` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1600` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1601` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1602` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1607` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1608` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1611` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1612` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1615` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1617` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1618` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1619` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1622` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1623` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1624` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1629` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1630` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1633` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1653` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1654` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1684` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1684` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1726` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1728` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1757` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1768` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1794` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1796` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1796` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1798` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1806` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1806` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1823` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1829` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1844` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1846` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1848` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1924` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1926` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1926` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1931` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1945` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1967` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1977` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:1987` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2091` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2097` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2231` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2286` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2287` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2290` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2291` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2295` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2296` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2299` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2300` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2416` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2444` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2445` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2447` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2447` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2461` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2475` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2482` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2483` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2487` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2488` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2488` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2492` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2493` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2520` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:2521` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2529` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2530` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2538` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2541` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2542` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2542` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2543` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2543` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2551` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2564` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2564` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2598` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2599` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:2625` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:2702` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2742` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2745` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2752` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2753` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2753` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2762` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2777` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2778` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2798` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2809` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2828` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2843` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2844` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2851` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2864` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2866` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2883` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2885` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2891` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2897` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2917` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2921` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2922` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2926` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2927` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2931` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2932` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2943` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2944` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2945` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2949` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2949` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2953` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:2953` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:2956` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2957` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2957` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2958` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2958` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2959` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2960` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2968` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2980` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2987` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2990` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2991` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2991` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2992` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2992` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2993` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:2994` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3008` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3036` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3048` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3049` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3049` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3072` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3073` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3077` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3078` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3079` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3081` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3082` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3087` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3089` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3090` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3091` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3130` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3131` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3135` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3135` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3135` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3142` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3169` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3186` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3201` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3245` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3256` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3256` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3257` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3257` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3261` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3261` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3279` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3283` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3284` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3285` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3286` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3291` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3291` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3292` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3292` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3293` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3293` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3297` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3297` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3298` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3298` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3299` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3299` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3303` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3303` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3304` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3304` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3305` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3305` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3314` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3323` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3323` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3356` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3370` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3423` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3443` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3444` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3461` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3478` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3481` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3514` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3517` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3524` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3527` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3530` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3533` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3536` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3540` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3543` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3547` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3550` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3553` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3556` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3557` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3557` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3558` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3559` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3560` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3561` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3562` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3563` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3564` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3569` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3570` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3571` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3571` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3574` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3575` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:3579` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3601` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3606` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3633` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3654` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3655` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3675` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3752` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3753` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3763` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3766` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3770` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3771` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3772` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3803` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3803` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3804` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3815` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3820` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3828` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3850` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3851` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3866` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3874` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3907` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3918` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3918` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3919` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:3919` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:3931` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3949` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3950` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3954` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3962` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:3993` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4079` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4080` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4090` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4118` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4137` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4170` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4174` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4178` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:4192` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4192` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4193` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4213` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4223` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4240` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4241` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4242` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4243` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4245` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4301` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4305` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4309` | Important declarations bypass the intended cascade. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:4309` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:4343` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4412` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4503` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:4527` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4527` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4528` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4553` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4562` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4573` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4583` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4596` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4611` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4619` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4628` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4654` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4664` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:4681` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4682` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4686` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4687` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4692` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4696` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4700` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4701` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4702` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4703` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4707` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4711` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4716` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4727` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4750` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4751` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:4790` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:4797` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4872` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4965` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:4965` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5001` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5078` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:5172` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:5175` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:5196` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:5222` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:5235` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5243` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5248` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5249` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:5333` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5360` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5377` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5380` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5408` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5498` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5500` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5506` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:5753` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:5755` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5757` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:5758` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:5759` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:5802` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5815` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5858` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5878` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5880` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5908` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5931` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5939` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5940` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5954` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:5964` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6032` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6036` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6068` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6074` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6076` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6110` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6119` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6120` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6121` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6156` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6190` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6202` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6218` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6218` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6285` | Literal visual color outside a registered theme package. |
| high | cross-component-selector | `src/frontend/shared/styles/index.css:6307` | Selector depends on another component's DOM structure. |
| high | literal-color | `src/frontend/shared/styles/index.css:6319` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6321` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:6322` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:6323` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:6341` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6347` | Literal visual color outside a registered theme package. |
| high | important | `src/frontend/shared/styles/index.css:6382` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:6383` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:6384` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/index.css:6385` | Important declarations bypass the intended cascade. |
| high | literal-color | `src/frontend/shared/styles/index.css:6409` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6412` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6413` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6413` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6414` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6414` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6466` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6467` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6512` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6551` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6575` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6579` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6580` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6592` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6624` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6647` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6722` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6747` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6749` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6776` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6778` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6828` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6828` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6829` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6838` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6839` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6855` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6856` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6869` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6869` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6892` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6893` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6900` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6901` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6912` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6913` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6937` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6937` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6938` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6941` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6950` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6956` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6956` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:6995` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7022` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7023` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7029` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7030` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7063` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7064` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7076` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7077` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7085` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7086` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7102` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7103` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7122` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7123` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7153` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7154` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7155` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7164` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7164` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7167` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7167` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7211` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7217` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7218` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7239` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7240` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7367` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7368` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7407` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7408` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7416` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7417` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7417` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7445` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7445` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7446` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7447` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7451` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7451` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7452` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7453` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7457` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7457` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7458` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7459` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7472` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7475` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7479` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7480` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7481` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7492` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7500` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7501` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7540` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7540` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7541` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7546` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7546` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7547` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7612` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7613` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7620` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7620` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7636` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7645` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7645` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7668` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7669` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7701` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7702` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7731` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7732` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7744` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7745` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7745` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7753` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7759` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7776` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7777` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7778` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7782` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7783` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7784` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7795` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7851` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7874` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7882` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7887` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7888` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7901` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7902` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7910` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7911` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7921` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7922` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7924` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7950` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7951` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7961` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7962` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7990` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7991` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7997` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:7998` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8031` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8043` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8044` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8045` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8049` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8050` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8051` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8059` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8068` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8094` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8095` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8102` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8103` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8114` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8115` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8116` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8136` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8137` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8146` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8147` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8174` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8193` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8203` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8218` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8219` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8222` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8227` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8264` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8268` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8273` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8285` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8286` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8286` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8287` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8289` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8303` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8306` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8345` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8346` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8348` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8352` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8372` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8373` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8415` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8416` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8416` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8417` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8420` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8456` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8461` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8482` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8483` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8495` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8513` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8515` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8560` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8561` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8572` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8573` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8587` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8587` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8603` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8604` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8608` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8616` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8641` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8643` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8650` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8651` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8656` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8673` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8679` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8717` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8723` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8730` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8730` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8738` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8739` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8749` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8750` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8767` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8771` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8806` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8807` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8836` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8858` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8874` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8875` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8882` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8883` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8890` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8912` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8919` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8925` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8954` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8958` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8959` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8960` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8964` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8966` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8982` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8983` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:8990` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9004` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9006` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9012` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9013` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9014` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9031` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9032` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9040` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9041` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9046` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9076` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9077` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9084` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9111` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9112` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9114` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9151` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9152` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9165` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9165` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9166` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9173` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9177` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9259` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9322` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9325` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9337` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9339` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9352` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9353` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9405` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9444` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9522` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9523` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9524` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9540` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9567` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9576` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9577` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9581` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9582` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9583` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9618` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9619` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9621` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9621` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9635` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9644` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9656` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9666` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9677` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9685` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9686` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9695` | Literal visual color outside a registered theme package. |
| high | literal-color | `src/frontend/shared/styles/index.css:9710` | Literal visual color outside a registered theme package. |
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
| high | cross-component-selector | `src/frontend/shared/styles/p1.css:86` | Selector depends on another component's DOM structure. |
| critical | mixed-responsibility | `src/frontend/shared/styles/primitives.css:1` | Large stylesheet requires atomization (494 lines, 67 selectors). |
| high | literal-color | `src/frontend/shared/styles/primitives.css:12` | Literal visual color outside a registered theme package. |
| medium | global-selector | `src/frontend/shared/styles/primitives.css:137` | Generic selector has global collision risk. |
| high | important | `src/frontend/shared/styles/primitives.css:316` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:479` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:480` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:481` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:482` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:489` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:490` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:491` | Important declarations bypass the intended cascade. |
| high | important | `src/frontend/shared/styles/primitives.css:492` | Important declarations bypass the intended cascade. |
