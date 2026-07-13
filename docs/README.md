# DMCC documentation

This folder separates current project references from historical implementation artifacts.

## Current references

- [`../README.md`](../README.md) — project overview, setup, scripts, deployment notes, and current capabilities.
- [`product/vision.md`](product/vision.md) — stable product vision and experience principles.
- [`p1-product-decisions.md`](p1-product-decisions.md) — active P1 product decisions and compatibility policy.
- [`superpowers/specs/2026-07-02-unified-account-profile-center-design.md`](superpowers/specs/2026-07-02-unified-account-profile-center-design.md) — approved account/profile-center design.
- [`engineering/graph-mobile-refactor-plan.md`](engineering/graph-mobile-refactor-plan.md) — current Graph mobile refactor status and next steps.
- [`engineering/accessibility-status.md`](engineering/accessibility-status.md) — current accessibility evidence, limitations, and verification guidance.

## Historical artifacts

- [`archive/reviews/`](archive/reviews/) — completed PR reviews and review notes.
- [`archive/implementation-plans/`](archive/implementation-plans/) — dated implementation plans and raw target-design drafts.
- [`archive/sdd-reports/`](archive/sdd-reports/) — subtask briefs, task reports, and progress notes.

Archived documents are useful as context, but they are not current implementation contracts. Routes, APIs, storage keys, headers, file paths, commands, and checklists in archived files must be verified against the live source before use.

## Documentation rule

When updating docs:

1. Keep product principles separate from implementation history.
2. Prefer current state plus next action over long completed checklists.
3. Archive old plans instead of deleting them when they may explain why a decision was made.
4. Do not present legacy auth headers, vault paths, or transitional routes as current architecture.
5. If a document makes a claim about passing verification, include the command and date or mark the evidence as missing.
