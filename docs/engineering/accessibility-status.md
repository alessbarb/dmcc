# Accessibility status

**Last reviewed:** 2026-07-13

This is the maintained accessibility status page for DMCC. It records evidence boundaries and known limitations; it is not a legal compliance claim.

## Target

DMCC aims toward the applicable subset of WCAG 2.1 AA and adopts practical WCAG 2.2 AA improvements where they fit the product without a separate redesign.

The project must not publish an unqualified “WCAG AA compliant” claim from source-only inspection or partial automated checks.

## Current evidence boundary

Current documentation confirms an approved remediation design in:

- `docs/superpowers/specs/2026-07-02-critical-accessibility-remediation-design.md`

Live implementation status must be verified against source and test output before making release claims.

## Known high-risk areas

- Canvas interactions require special care for keyboard, screen-reader, focus, and non-visual equivalents.
- 3D graph interactions may not have a complete non-visual alternative.
- Dialog semantics, initial focus, Escape behavior, and focus restoration should be checked per dialog.
- Visual-only icon controls need accessible names.
- Form labels should be programmatically associated with inputs.
- Reduced-motion and visible-focus behavior should be verified in real UI flows.

## Verification guidance

Use these checks when working on accessibility-sensitive changes:

```bash
npm run typecheck:all
npm run test:e2e
```

For full release confidence, also run:

```bash
npm run quality:all
```

Manual checks should record:

1. keyboard-only completion of the affected flows;
2. visible and logical focus order;
3. Escape and focus restoration for dialogs;
4. 200% zoom and 400% reflow spot checks;
5. reduced-motion behavior;
6. screen-reader checks when the platform is available.

Unavailable manual or assistive-technology checks should be reported as missing evidence, not as passes.

## Documentation rule

When an accessibility issue is fixed, update this file with:

- affected surface;
- verification command or manual check;
- date;
- remaining limitations.
