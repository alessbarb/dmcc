# P1 product decisions

This document records the product decisions that affect the P1 implementation. It exists to keep the branch coherent and prevent silent UX or information-architecture choices.

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

## Decisions pending product-owner confirmation

### D1 — Campaign home hierarchy

Current overlap: `command-center`, `dashboard`, and `what-now` each act as a campaign starting surface.

Recommended direction: make `command-center` the single campaign home, fold the operational dashboard and next-action summary into it, preserve old URLs as redirects, and remove duplicate primary navigation entries.

### D2 — Campaign navigation model

Recommended direction:

- Desktop primary navigation: Home, Session, Entities, Canvas, Graph, Timeline.
- Desktop secondary navigation: Search, Boards, Players, Rules, Knowledge, Settings.
- Mobile bottom navigation: Home, Session, Entities, Search, More.
- `More` opens the secondary destinations in a full-height sheet.

### D3 — Search result behavior

Recommended direction: every result opens its canonical destination. Entity results open the entity detail view; facts open the owning entity and focus the fact; rules results open Rules with the corresponding entry selected. Search should not contain non-interactive result cards.

### D4 — Boards interaction model

Current implementation is a grouped status view rather than a real Kanban board.

Recommended direction: implement a real accessible Kanban interaction with drag and drop on pointer devices and explicit Move actions for keyboard and mobile users. Status changes must persist immediately.

### D5 — Player portal consolidation

Recommended direction: use one player-facing shell and one canonical portal route. Campaign membership, character selection, visible knowledge, and session information should live in that shell rather than separate overlapping entry points.

## Decision log

| Decision | Status | Outcome |
| --- | --- | --- |
| D1 Campaign home hierarchy | Pending | — |
| D2 Navigation model | Pending | — |
| D3 Search result behavior | Pending | — |
| D4 Boards interaction model | Pending | — |
| D5 Player portal consolidation | Pending | — |
