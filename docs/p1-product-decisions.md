# P1 product decisions

This document records the product decisions that affect the P1 implementation. The P1 branch targets the finished product architecture: obsolete routes, components, copy, storage keys, and compatibility paths are removed rather than preserved.

## Scope

The P1 branch covers:

1. Consolidating overlapping campaign home surfaces.
2. Simplifying desktop and mobile navigation.
3. Making global search actionable.
4. Defining and implementing the Boards interaction model.
5. Completing entity filters and accessibility.
6. Integrating Rules into campaign navigation and metadata.
7. Closing remaining i18n and accessibility gaps.
8. Removing dead or misleading affordances.
9. Consolidating the player portal experience.
10. Enforcing CI checks for `main`.

## Approved decisions

### D1 — Campaign home hierarchy

`command-center` is the only campaign home. The useful operational information from the previous dashboard and next-action surfaces is integrated into it. The old `/dashboard` and `/what-now` routes, components, navigation entries, translation keys, and tests are deleted. No compatibility redirects remain.

### D2 — Campaign navigation model

- Desktop primary navigation: Home, Session, Entities, Canvas, Graph, Timeline.
- Desktop secondary navigation: Search, Boards, Players, Rules, Knowledge, Settings.
- Mobile bottom navigation: Home, Session, Entities, Search, More.
- `More` opens the secondary destinations in a full-height sheet.

### D3 — Search result behavior

Every result opens its canonical destination. Entity results open the entity detail view; facts open the owning entity and focus the fact; rules results open Rules with the corresponding entry selected. Search does not contain non-interactive result cards.

### D4 — Boards interaction model

Boards becomes a real accessible Kanban interaction with drag and drop on pointer devices and explicit Move actions for keyboard and mobile users. Status changes persist immediately.

### D5 — Player portal consolidation

`/portal` is the only player entry. One player-facing shell contains campaign membership, character selection, visible knowledge, session information, and invitations. The old player portal route family and duplicate portal components are deleted rather than redirected.

### D6 — Compatibility policy

P1 does not retain legacy or backwards-compatibility code. Internal references and tests are migrated to the final architecture, then obsolete paths and modules are removed.

## Decision log

| Decision | Status | Outcome |
| --- | --- | --- |
| D1 Campaign home hierarchy | Approved | One `command-center`; old home routes and components are deleted. |
| D2 Navigation model | Approved | Six primary desktop destinations; five-item mobile bar with full-height More sheet. |
| D3 Search result behavior | Approved | Results navigate to canonical destinations with context and focus. |
| D4 Boards interaction model | Approved | Accessible Kanban with drag/drop and explicit move controls. |
| D5 Player portal consolidation | Approved | `/portal` is the sole entry and duplicate portal architecture is removed. |
| D6 Compatibility policy | Approved | No legacy aliases, redirects, wrappers, fallback keys, or duplicate modules. |
