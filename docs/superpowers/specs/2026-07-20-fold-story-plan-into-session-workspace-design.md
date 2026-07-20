# Fold Plan Narrativo into the Sesión workspace

Date: 2026-07-20
Status: proposed

## Problem

`StoryPlanView` ("Plan Narrativo") lives as its own tab under the "Historia" workspace, separate from
"Sesión" (`SessionsIndexPage` / `SessionDetailPage`). Both pages plan upcoming play content:

- `SessionPlanEditor` (Sesión tab): per-session goals, checklist, scenes, linked clues/secrets/consequences.
- `StoryThread` / `StoryStep` (Historia → Plan Narrativo tab): cross-session narrative arcs, with steps that
  can be scheduled onto a specific session (`plannedSessionId`).

These are two separate planning UIs solving overlapping DM problems ("what happens in/around this
session"), discovered while live-testing the bug fix that made thread creation actually show up
(root cause: `GET /api/campaigns/:campaignId` never serialized `storyThreads`/`storySteps`, now fixed).
The DM's read after using it: this reads as duplicated surface area, not two distinct tools.

## Goal

Remove the standalone "Plan Narrativo" tab/page. Relocate story-thread/story-step management into the
Sesión workspace, where session planning already happens, without touching the domain model, commands,
events, or database — this is a view-layer relocation only.

## Non-goals

- No changes to `StoryThread`/`StoryStep` domain types, commands, events, or the `0018_campaign_notebooks_and_story.sql`
  migration.
- No merging of `SessionPlan` fields (goals/checklist/scenes) with `StoryStep` fields. They stay
  separate data structures; steps get a new home, not a schema merge.
- No changes to `narrative-map` / `consequence-chain` inspectors — they only render `story_step:<id>` as a
  provenance label, never navigate to `StoryPlanView`, so removing the route doesn't affect them.

## Why this is low-risk

`StoryThread`/`StoryStep` are already independent aggregates with their own commands (`CreateStoryThread`,
`ScheduleStoryStep`, `ReconcileStoryStep`, etc., per `src/core/application/storyCommandHandlers.ts`).
Per this repo's event-sourcing rules, snapshots/projections/indexes are derived and rebuildable from
`events.ndjson` — moving where the UI renders this data changes nothing about how it's stored or replayed.

## Design

### 1. Shared data hook: `useStoryThreads`

New hook at `src/frontend/dm/story/useStoryThreads.ts`, modeled on the existing
`useCampaignShortcuts.ts` pattern (zustand store keyed by campaignId, `readApiError` for error surfacing).
Wraps `storyApi.ts` calls (create/archive/activate/resolve/discard thread; create/schedule/defer/unschedule/
ready/activate/reconcile step; link/unlink entity) and exposes `threads`, `steps`, and the mutation
functions. Both `SessionsIndexPage` and `SessionDetailPage` consume this hook instead of each
reimplementing the `res.ok` / `readApiError` / `addToast` boilerplate that caused the original silent-failure
bug. This is the single place that bug pattern gets fixed, instead of twice.

### 2. `SessionsIndexPage` — "Hilos Narrativos" panel

New section (alongside the existing "Previous sessions" aside) listing active `StoryThread`s:

- Create / archive thread (reuses the existing inline create form from `StoryPlanView`).
- Per thread: its **unscheduled** steps (`plannedSessionId == null`) as a backlog list — create step,
  mark ready, schedule into any `planned` session via a dropdown (reuses `scheduleStoryStep`).
- This becomes the single place to manage threads and any step not yet tied to a session.

### 3. `SessionDetailPage` / `SessionPlanEditor` — "Pasos de Historia" section

New section, additive next to the existing goals/checklist/scenes fields (no field removal):

- Lists steps where `plannedSessionId === session.sessionId`.
- Actions: defer (back to backlog), mark ready, activate, reconcile (resolved/discarded with outcome) —
  logic moved as-is from `StoryPlanView`'s `handleScheduleStep`/`handleDeferStep`/`handleReconcileStep`/etc.

### 4. Removals

- `StoryWorkspacePage.tsx`: drop the `plan` tab entry. `tabs.length` becomes 1, so `CampaignWorkspace`
  (`src/frontend/dm/workspaces/CampaignWorkspace.tsx:49`) auto-hides the tab bar — no extra UI work needed.
- Delete `src/frontend/dm/story/plan/StoryPlanView.tsx` and its route (`router.tsx`: `storyPlanRoute` and
  the lazy import).
- Delete `storyPlanWorkspace.css` and the `story-plan/*.css` partials, **except** any classes actually
  reused by the relocated sections — fold those into `session-forms.css` / `session-workspace.css` instead
  of importing the legacy stylesheet wholesale (this codebase already did a static-inline/cross-component-
  selector cleanup pass on session/entity views; importing the old stylesheet as-is would reintroduce the
  duplication that cleanup removed).
- Remove `campaignShell.nav.storyPlan` and related "Plan Narrativo" i18n keys once no longer referenced
  (check all 6 locales, not just `es.ts`).

### 5. Deep links (`resourceNavigation.ts`)

`story_thread` and `story_step` resource nav targets currently point to `/campaigns/:id/story/plan`
(used by the shortcuts feature). Update:

- `story_step` with a `plannedSessionId` → `/campaigns/:id/sessions/:sessionId` with `?stepId=` search param
  (scrolls to / highlights the step in the new "Pasos de Historia" section).
- `story_thread`, and `story_step` without a `plannedSessionId` (backlog) → `/campaigns/:id/sessions` with
  `?threadId=` / `?stepId=` search param (highlights it in the new "Hilos Narrativos" panel).

### 6. Backend / domain

No changes. `storyApi.ts`, `storyWebRoutes.ts`, `storyCommandHandlers.ts`, `validators.ts`, and the DB
migration stay untouched. The `GET /api/campaigns/:campaignId` fix (adding `storyThreads`/`storySteps` to
the response) made earlier today stays as-is — it's still required for `campaignState.storyThreads` to
populate anywhere, including the new locations.

## Testing

- Existing story-thread/step command tests (backend) are unaffected — no domain changes.
- New: component test coverage for `useStoryThreads` (mirroring `useCampaignShortcuts` test patterns if any
  exist), and for the two relocated UI sections (create thread, schedule step, reconcile step) in their new
  homes.
- Manual: verify shortcuts pointing at `story_thread`/`story_step` resources land on the right page/section
  post-relocation.

## Open questions for review

- Confirm the 6-locale i18n key cleanup is in scope for this change or a follow-up.
- Confirm no other deep link (e.g. dashboard alerts, search results) points at `/story/plan` beyond
  `resourceNavigation.ts` — worth a final grep pass during implementation.
