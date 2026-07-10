# Graph Mobile Refactor Plan

This note captures the safe migration path for `src/frontend/dm/graph/GraphPage.tsx` after the Canvas mobile UX work.

## Current problem

`GraphPage.tsx` is functional but too large and mostly inline-styled. On mobile this creates the same issues previously found in Canvas:

- too much permanent UI competing with the graph;
- desktop help text on touch devices;
- filters occupying the screen before the graph;
- legend permanently covering graph content;
- selected entity details behaving like a side panel instead of a bottom sheet;
- floating creation action competing with the bottom navigation.

## Lessons carried over from Canvas

1. **Mobile starts in exploration mode.**
   The primary gesture should be navigating/inspecting, not editing.

2. **Secondary UI must be on demand.**
   Filters, legend and details should appear as sheets or compact overlays.

3. **Desktop instructions must not appear on touch.**
   `clic`, `scroll`, `clic derecho` instructions are misleading on mobile.

4. **FABs must respect the campaign bottom navigation.**
   Use `--campaign-mobile-bottom-nav-height` and `env(safe-area-inset-bottom)`.

5. **Graph interaction should be explicit.**
   A small touch hint is preferable to permanent desktop controls.

## Components already prepared

`src/frontend/dm/graph/GraphMobilePatterns.tsx` introduces:

- `GraphMobileFab`
- `GraphMobileSheet`
- `GraphMobileTouchHint`
- `GraphMobilePanel`

These are deliberately small and dependency-light. They can be connected to `GraphPage.tsx` without changing graph physics or data derivation.

## CSS already prepared

`src/frontend/dm/graph/graph-mobile.css` currently provides a compatibility mobile layer for the inline layout and styles for the reusable mobile components.

## Safe extraction order

### Step 1 — GraphHeader

Extract the header block:

- title: `Grafo narrativo`
- counts: visible nodes and relations
- new relation action

Target component:

```tsx
function GraphHeader({ visibleCount, linkCount, onCreateRelation }) {}
```

No graph logic should move here.

### Step 2 — GraphFilters

Extract:

- `GraphNodeSearch`
- preset buttons
- view mode buttons
- label mode buttons

Target component:

```tsx
function GraphFilters({
  graphSearchItems,
  focusGraphNode,
  preset,
  setPreset,
  viewMode,
  setViewMode,
  labelsMode,
  setLabelsMode,
  t,
}) {}
```

This component should render normally on desktop and be moved into `GraphMobileSheet` on mobile later.

### Step 3 — GraphLegend

Extract the inline legend from the graph viewport.

Target component:

```tsx
function GraphLegend({ colors, locale }) {}
```

Desktop: render inside graph viewport.
Mobile: render inside `GraphMobileSheet`.

### Step 4 — GraphViewport

Extract only the frame around `ForceGraph3D`, not the graph data logic.

Target component:

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

Do not move force configuration until after this step is stable.

### Step 5 — GraphEntityPanel

Extract selected-entity side panel.

Desktop: side panel.
Mobile: `GraphMobileSheet` / bottom sheet.

Target component:

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

### Step 6 — Connect mobile patterns

After extraction, wire:

- `GraphMobileFab` to:
  - create relation;
  - open filters sheet;
  - open legend sheet;
  - fit graph;
- `GraphMobileSheet` for filters/legend/details;
- `GraphMobileTouchHint` inside graph viewport.

## Non-goals for this refactor

Do not change:

- graph data derivation;
- force settings;
- relation filtering rules;
- shortest-path logic;
- entity update logic;
- `ForceGraph3D` package usage.

## Validation checklist

After each step:

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
8. Toggle next session works.
9. Toggle visibility works.
10. New relation modal still opens.
11. Fit graph still works.

## Recommended implementation style

Prefer extracting local components at the bottom of `GraphPage.tsx` first. Once stable, move them into separate files.

This avoids large import churn and keeps the first structural PR reviewable.
