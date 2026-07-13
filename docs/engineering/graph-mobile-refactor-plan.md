# Graph Mobile Refactor Status

**Last reviewed:** 2026-07-13

This note tracks the safe migration path for `src/frontend/dm/graph/GraphPage.tsx`. It replaces the older “all steps pending” plan with the current state observed in the checkout.

## Current state

`GraphPage.tsx` is still large and remains the main integration point for graph data, force-graph configuration, selection, filtering, and actions.

Current file sizes observed during this review:

- `src/frontend/dm/graph/GraphPage.tsx` — about 1175 lines;
- `src/frontend/dm/graph/GraphMobilePatterns.tsx` — small reusable mobile primitives;
- `src/frontend/dm/graph/graph-mobile.css` — mobile compatibility and sheet/FAB styles.

Already extracted files:

- `GraphHeader.tsx`
- `GraphFilters.tsx`
- `GraphLegend.tsx`
- `GraphNodeSearch.tsx`
- `GraphMobilePatterns.tsx`
- `findNarrativePath.ts`

## Problem to solve

The graph works, but the page is still hard to evolve safely because integration logic, desktop layout, mobile behavior, graph viewport wiring, and selected-entity details remain concentrated in one large component.

The mobile UX risks are still the same class of issues previously seen in Canvas:

- too much permanent UI competing with graph exploration;
- desktop help text or affordances appearing on touch devices;
- filters taking too much screen before the graph;
- legend and selected details competing with graph content;
- creation actions competing with campaign mobile navigation.

## Design principles

1. **Mobile starts in exploration mode.** The primary gesture is navigating and inspecting, not editing.
2. **Secondary UI is on demand.** Filters, legend, and details should live in sheets or compact overlays on mobile.
3. **Desktop and touch instructions differ.** Avoid desktop-only copy on mobile.
4. **FABs respect bottom navigation.** Use `--campaign-mobile-bottom-nav-height` and safe-area insets.
5. **Data derivation stays stable.** Refactors should not change graph filtering, relation rules, or force settings unless explicitly scoped.

## Remaining extraction order

### Step 1 — Confirm current extracted components

Before further refactor work, verify that `GraphHeader`, `GraphFilters`, `GraphLegend`, and `GraphNodeSearch` are fully used by `GraphPage.tsx` and do not duplicate logic.

### Step 2 — Extract `GraphViewport`

Extract only the frame around `ForceGraph3D`, not graph data derivation.

Target responsibility:

```tsx
function GraphViewport({
  containerRef,
  fgRef,
  graphData,
  graphWidth,
  graphHeight,
  handlers,
  renderEmptyState,
  renderLegend,
  renderEntityPanel,
}) {}
```

Do not move force configuration in this step unless it is passed through unchanged.

### Step 3 — Extract `GraphEntityPanel`

Extract selected-entity details into a component that can render as a side panel on desktop and inside a mobile sheet on small screens.

Target responsibility:

```tsx
function GraphEntityPanel({
  panelEntity,
  viewMode,
  panelRelations,
  relatedFacts,
  onClose,
  onOpenDetail,
  onToggleNextSession,
  onToggleVisibility,
  t,
  locale,
}) {}
```

### Step 4 — Wire mobile sheets deliberately

Use the existing `GraphMobilePatterns.tsx` primitives for:

- filters sheet;
- legend sheet;
- selected-entity details sheet;
- fit-graph action;
- relation-creation action.

### Step 5 — Only then consider force/config extraction

After viewport and panel extraction are stable, consider whether force settings and imperative graph controls deserve a small hook. Do not combine this with UI extraction.

## Non-goals

Do not change in this refactor unless a separate task explicitly requires it:

- graph data derivation;
- relation filtering rules;
- shortest-path logic;
- entity update logic;
- `ForceGraph3D` package usage;
- access-control or player-visibility semantics.

## Validation checklist

After each structural step:

```bash
npm run typecheck:all
npm run build
```

Manual checks:

1. Desktop graph renders.
2. Mobile graph renders.
3. Search focuses a node.
4. Presets filter correctly.
5. View mode toggles between all / DM / players.
6. Label mode changes visible labels.
7. Selecting a node opens details.
8. Toggle next-session state works.
9. Toggle visibility works.
10. New relation modal still opens.
11. Fit graph still works.

## Implementation style

Prefer one extraction at a time. Keep each PR/review focused, and use the current tests plus the manual checklist before further decomposition.
