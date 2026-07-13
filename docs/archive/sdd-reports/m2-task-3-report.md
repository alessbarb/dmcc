> Archived historical SDD report.
> This document is not the current product or engineering contract.
> Verify against the live source before using any route, API, path, command, or checklist.

# M2 Task 3 Report — Real per-page routing

**Status:** DONE

**Commits:** `9f0c940`

**TypeScript:** 1 pre-existing error in `src/server/auth.ts` (observer role type mismatch, unrelated to this task). Zero new errors introduced.

## What was done

1. **Created `src/app/CampaignShell.tsx`** — sidebar layout with `<Outlet />`, pulls campaign title from store, highlights active nav item by matching URL segment, "Salir" button navigates to `/`.

2. **Updated `src/app/router.tsx`** — each campaign sub-route now wires to its own page component. `campaignRoute` uses `CampaignShell` as the layout. `indexRoute` and `joinRoute` still render `<App />`.

3. **Updated all 10 page components** to be self-contained:
   - All props made optional
   - Each page calls `useCampaignStore()` for missing data (campaignState, dashboard, whatNow, graph, timeline, etc.)
   - Local state added per-page for: selectedEntity, search/filter state, modal open state
   - `EntityDetailModal` embedded at the bottom of pages that need entity detail (Dashboard, WhatNow, Entities, Graph side-panel, Boards, Players, Search)
   - `setCurrentPage` replaced with TanStack Router `navigate()` calls
   - `addToast` falls back to local `useToast()` hook
   - Store action methods (updateEntity, archiveEntity, createPlayer, etc.) pulled from store directly
   - `TimelinePage` adds null guard for when `timeline` is not yet loaded

4. **App.tsx untouched** — still used for `/` (home/landing) and `/join/:id` routes.

## Notes / Concerns

- Pages that previously received `setIsEntityModalOpen` from App.tsx now manage that state locally but without the full entity creation modal form. The `setIsEntityModalOpen` prop is still wired through for backward compat with App.tsx callers. The actual entity creation modal in App.tsx is only available on routes that render `<App />`. Pages in `CampaignShell` would need a separate entity creation modal to create entities — that's a follow-on concern (the brief only asked to wire routing, not to duplicate the modal).
- ~~`addToast` in EntityDetailModal inline renders uses a no-op `() => {}` when called from standalone page context. Follow-on work should pass the page's own `useToast()` hook.~~
- The pre-existing TS error in `src/server/auth.ts` (`"observer"` not assignable) is unchanged from before this task.

## Fix applied

**Commit:** `629d792`

**TypeScript:** Clean (1 pre-existing error unrelated to these changes)

**Tests:** 89 passed

Fixed two issues post-M2-Task-3:
1. All standalone pages (DashboardPage, WhatNowPage, EntitiesPage, BoardsPage, PlayersPage, SearchPage) now call `useToast()` hook and pass the real `addToast` function to EntityDetailModal instead of no-op.
2. Restored missing `<h2>Jugadores y personajes</h2>` heading in PlayersPage.
