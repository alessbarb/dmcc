# i18n Migration: Complete UI Multilingual Coverage

**Date:** 2026-06-27  
**Branch:** main  
**Status:** In progress (Phase 2 partial complete)

---

## Context

The i18n infrastructure is fully implemented (Phase 1 + Phase 2 partial). The translation system (`src/shared/i18n/`) and frontend provider (`src/frontend/shared/i18n/`) are production-ready. Three files are already migrated: `App.tsx` (sidebar nav), `CanvasPalette.tsx` (entity type labels), `SettingsPage.tsx` (language selector).

33 frontend files still contain hardcoded Spanish strings and need to be migrated.

---

## Goal

Complete the migration of all UI strings to the i18n system so the app renders correctly in both Spanish (`es`) and English (`en`) without any hardcoded text.

**Out of scope:** Backend error messages, markdown export templates, domain type names in TypeScript types (already handled by `domainLabels.ts`).

---

## Architecture (unchanged)

```
src/shared/i18n/
├── types.ts                    — SupportedLocale, TranslationKey, TranslationDictionary
├── interpolation.ts            — {placeholder} substitution
├── translate.ts                — createTranslator(), resolveLocale(), t()
├── domainLabels.ts             — formatEntityType(), formatVisibility(), formatRelationType()
├── index.ts                    — barrel export
└── dictionaries/
    ├── es.ts                   — Spanish (matches EN structure, enforced at runtime)
    └── en.ts                   — English (primary: source of truth for types and default locale))

src/frontend/shared/i18n/
├── I18nProvider.tsx            — React context, localStorage persistence
├── useTranslation.ts           — hook: returns { t, locale, setLocale }
└── LanguageSelector.tsx        — Settings UI widget
```

---

## Dictionary Namespace Plan

Existing namespaces (already populated): `common`, `nav`, `settings`, `canvas.palette`, `domain`, `export`, `playerPortal`, `rules`, `toasts`, `dialogs`.

New namespaces to add in Phase 1:

| Namespace | Covers |
|---|---|
| `canvas.toolbar` | Toolbar buttons, interaction mode labels |
| `canvas.inspector` | Inspector panel labels, fact/note editing |
| `canvas.node` | Node context menus, group labels |
| `canvas.dialogs` | ConvertNoteToEntity dialog, RelationshipTypePopover |
| `dashboard` | DM Dashboard sections, alert types, quick actions |
| `whatNow` | Pre-session orientation checklist, status labels |
| `session` | Active session action buttons, note types, close flow |
| `timeline` | Event type labels, filter options |
| `entities` | Entity modal tabs, create/edit forms, metadata fields |
| `relations` | Relation create form, type labels |
| `graph` | Filter presets, view mode labels, node side panel |
| `boards` | Kanban column headers, entity state labels |
| `players` | Player assignment, proposal states, character linking |
| `search` | Search placeholder, result category labels |
| `landing` | Campaign selector, landing page labels |

All keys must be added to both `es.ts` and `en.ts` simultaneously. The existing test `tests/shared/i18n.test.ts` enforces 1:1 parity and will fail if any key is missing or has an empty value.

---

## Migration Patterns

### React components (26 files)

```tsx
// Add to imports
import { useTranslation } from "@frontend/shared/i18n/useTranslation.js";

// Add inside component
const { t } = useTranslation();

// Replace hardcoded strings
// Before: <button>Guardar</button>
// After:  <button>{t("common.save")}</button>

// Interpolation for dynamic values
// Before: `${count} entidades`
// After:  t("entities.count", { count })
// Dict:   "entities.count": "{count} entidades" / "{count} entities"
```

### Pure utilities (2 files: sessionUtils.ts, eventVisuals.tsx)

These return strings and are called from React components. They cannot use the React hook — they use `createTranslator` directly:

```ts
// Add to imports
import { createTranslator } from "@shared/i18n/translate.js";
import type { SupportedLocale } from "@shared/i18n/types.js";

// Add locale param with default
export function formatSessionStatus(status: string, locale: SupportedLocale = "en"): string {
  const { t } = createTranslator(locale);
  return t("session.status.active");
}

// Callers pass locale from useTranslation():
const { locale } = useTranslation();
formatSessionStatus(session.status, locale);
```

This follows the same pattern as `domainLabels.ts`.

---

## Execution Phases

### Phase 1 — Complete dictionary (1 commit)

Audit all 33 pending files, extract every hardcoded string, assign keys under the namespaces above, add to both `es.ts` and `en.ts`.

**Verification:** `npm test` — i18n parity test must pass before touching any component.

### Phase 2 — Pure utilities (1 commit)

Migrate `sessionUtils.ts` and `eventVisuals.tsx`:

- Add `locale: SupportedLocale = "es"` parameter to all exported label functions
- Use `createTranslator(locale).t(key)`
- Update all call sites in components to pass `locale` from `useTranslation()`

**Verification:** `npm run typecheck:all && npm test`

### Phase 3 — Components by module (6 commits)

| Commit | Files |
|---|---|
| `feat(i18n): migrate canvas components` | CampaignCanvasFlow, CanvasEntityNode, CanvasFactNode, CanvasGroupHulls, CanvasGroupNode, CanvasNoteNode, CanvasToolbar, ConvertNoteToEntityDialog, RelationshipTypePopover, CanvasPage |
| `feat(i18n): migrate entity components` | EntitiesPage, EntityCreateModal, EntityDetailModal, RelationCreateModal, TypeMetadataForm, eventVisuals (callers) |
| `feat(i18n): migrate DM pages` | DashboardPage, WhatNowPage, PlayersPage, BoardsPage, SearchPage, SettingsPage, RulesPage |
| `feat(i18n): migrate session views` | SessionPage, TimelinePage |
| `feat(i18n): migrate graph and shell` | GraphPage, GraphNodeSearch, CampaignShell |
| `feat(i18n): migrate player portal and shared` | JoinPage, PlayerPortalView, AppFooter, LandingCampaignCard |

**Verification after each commit:** `npm run typecheck:all && npm test`

---

## Invariants

- `es.ts` and `en.ts` must always have identical key sets (enforced by test).
- No key may have an empty string value (enforced by test).
- Interpolation placeholders (`{name}`) must match between ES and EN for the same key (enforced by test).
- Default locale for all utilities and React context is `"en"` (EN is primary).
- `useTranslation()` must be called at component top level (React hook rules).
- No translation key fallback to the raw key string in production paths — all keys added to dict before components are migrated.
