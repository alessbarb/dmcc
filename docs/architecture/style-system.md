# DMCC style system architecture

## Purpose

DMCC uses one visual source of truth and one predictable cascade:

```text
ThemePackage
  -> --theme-* variables
  -> shared/styles foundation
  -> shared/styles primitives
  -> shared/styles layout
  -> component and feature styles
```

## Global ownership

`src/frontend/shared/styles` owns every reusable or cross-cutting rule:

- reset, fonts, structural tokens, accessibility and motion;
- buttons, form controls, badges, cards, dialogs, tabs, menus, tooltips, overlays, toolbars, empty states and statuses;
- application shells, campaign shells, workspaces, navigation, sidebars, top bars, footers, grids and global responsive behavior;
- documented third-party overrides.

## Local ownership

Styles outside `shared/styles` may only define elements owned by their component or feature:

- internal composition and layout;
- component-exclusive dimensions and positioning;
- component states that do not duplicate a shared primitive;
- runtime values exposed through named CSS custom properties.

Local styles must consume global tokens and primitives for global behavior. They must not recreate buttons, controls, cards, dialogs, feedback states, focus behavior, shadows, spacing scales or visual palettes.

## Hardcoded values

Literal visual colors are allowed only in registered theme packages:

- `src/frontend/account/defaultTheme.ts`;
- `src/frontend/account/fantasyTheme.ts`;
- `src/frontend/account/sciFiTheme.ts`.

All static TSX styles must move to an atomized stylesheet. Runtime geometry may remain dynamic, preferably through a named CSS custom property.

## Atomization rules

Every stylesheet has one primary layer and one domain. Supported layers are:

- `foundation`;
- `primitive`;
- `layout`;
- `vendor`;
- `feature`;
- `component`;
- `legacy` during migration.

A local stylesheet must not style another component through DOM structure. Generic global selectors belong only to the documented shared primitive or layout layer.

## Imports

- `main.tsx` loads only the global style entry point.
- A component or feature imports its own stylesheet.
- Parent shells must not import styles for optional child components.
- A stylesheet with multiple consumers must be explicitly shared as a primitive, layout, vendor adapter or feature-level stylesheet.

## Mechanical audit

`npm run styles:audit:report` generates `.artifacts/style-audit.json` and `.artifacts/style-audit.md`.

`npm run styles:audit:update-baseline` writes the versioned baseline under `docs/audits`.

`npm run styles:audit:check` compares the current result with the versioned baseline. During the refactor it acts as a ratchet: no category may increase and no new forbidden finding may appear. The final sprint removes the temporary baseline tolerance and enables zero tolerance.

## Completion contract

The refactor is complete only when the audit reports:

```text
forbidden literal colors             0
static inline styles                 0
unknown CSS variables                0
legacy CSS variables                 0
orphan CSS files                     0
unclassified CSS files               0
critical mixed-responsibility files  0
cross-component selectors            0
unapproved !important declarations   0
```
