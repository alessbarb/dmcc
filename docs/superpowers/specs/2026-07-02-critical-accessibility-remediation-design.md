# Critical Accessibility Remediation Design

**Date:** 2026-07-02
**Status:** Approved
**Target:** DMCC web application and packaged wide-screen UI

## Purpose

DMCC has partial accessibility support but cannot currently claim WCAG
conformance. This work removes the critical, cross-cutting barriers identified
in the initial source audit and establishes repeatable accessibility checks.

The target for this phase is the applicable subset of WCAG 2.1 AA, while also
adopting relevant WCAG 2.2 AA requirements where they can be addressed without
redesigning Canvas or the 3D graph.

This phase does not constitute legal certification. Legal applicability depends
on how DMCC is distributed, whether it is offered to the public or consumers,
the operator's circumstances, and the service provided.

## Current Evidence

The initial source review found:

- clickable `div` and `span` elements that cannot be reached or activated with
  a keyboard;
- visible form labels that are not programmatically associated with controls;
- dialogs with inconsistent semantics, accessible naming, Escape handling, and
  focus management;
- icon-only controls without accessible names;
- a document language fixed to Spanish even after the application locale
  changes;
- continuous animations without a global reduced-motion policy;
- no automated accessibility checks in the test suite;
- complex Canvas and 3D graph interactions without a demonstrated non-visual
  equivalent.

The application also contains useful foundations: semantic landmarks, headings,
alternative text on many images, live-region roles for some feedback, labeled
navigation, and several correctly named controls.

## Scope

### Included

1. Replace the confirmed non-semantic interactive elements in critical flows
   with native buttons or links.
2. Programmatically associate labels and controls in the forms touched by this
   phase, prioritizing campaign entry, onboarding, player management, entity
   creation, and Canvas board creation.
3. Introduce a small reusable dialog focus-management utility and apply it to
   the critical dialogs touched by this phase.
4. Give those dialogs:
   - `role="dialog"`;
   - `aria-modal="true"`;
   - a title referenced by `aria-labelledby`;
   - an accessible close control;
   - Escape handling;
   - initial focus and focus restoration.
5. Synchronize the root document `lang` attribute with the active locale.
6. Add a global, explicit `prefers-reduced-motion: reduce` policy.
7. Establish a consistent visible keyboard-focus treatment.
8. Add automated axe checks to representative Playwright flows.
9. Publish an accessibility status document containing evidence, known
   limitations, manual test instructions, and the next remediation phase.

### Excluded

- Full keyboard and screen-reader equivalence for Canvas.
- A non-visual replacement for the 3D graph.
- A complete migration of every historical form or dialog.
- Formal WCAG certification or a legal declaration of compliance.
- Broad visual redesign or replacement of the current component system.

Excluded barriers remain documented and prevent a claim of full conformance.

## Design

### Native interaction first

Interactive behavior uses native HTML elements whenever possible. A campaign
card that opens a campaign becomes a button-like native control rather than a
clickable container. Inline entity titles that open details become buttons
styled as text. Native semantics provide focus, keyboard activation, role, and
state behavior without duplicating browser behavior.

Nested actions must not create nested buttons. Where a card contains rename or
delete actions, the primary campaign-opening action becomes a separate
full-width button region and the secondary controls remain sibling buttons.

### Form naming

Every visible text label included in the phase receives a stable control `id`
and matching `htmlFor`. Checkbox and radio labels may continue wrapping their
controls. Help and error text uses `aria-describedby` when it provides required
instructions or validation details.

Labels will not be replaced with placeholders. Placeholder text remains
supplementary and is not treated as the accessible name.

### Dialog behavior

A focused hook owns only dialog keyboard and focus behavior:

- remember the element focused when the dialog opens;
- focus an explicit initial target or the first focusable element;
- close on Escape when dismissal is allowed;
- keep Tab and Shift+Tab within the dialog;
- restore focus when the dialog closes.

The dialog component remains responsible for its title, close label, backdrop
policy, busy state, and destructive-action behavior. The hook does not create
markup or hide implicit behavior.

### Language

The internationalization provider updates
`document.documentElement.lang` whenever the locale changes. The initial
server/static document remains Spanish, matching the default locale.

### Focus and motion

A global `:focus-visible` rule supplies a high-contrast outline with offset for
interactive elements. Component-specific focus styling may enhance it but must
not remove the global indicator.

The reduced-motion media query disables non-essential animation and smooth
scrolling and reduces transition duration. Functional state changes remain
immediate and understandable without animation.

### Automated checks

Playwright runs axe against representative stable pages:

- smart landing or campaign archive;
- DM setup/unlock;
- player join or registration;
- an authenticated campaign shell route when the existing fixtures support it.

The initial gate checks WCAG 2 A and AA tags. Violations are fixed or entered in
the status document with a narrow, justified temporary exclusion. Blanket rule
disablement is not acceptable.

Automated checks supplement rather than replace manual testing. They cannot
prove keyboard usability, sensible focus order, screen-reader comprehension,
Canvas equivalence, or legal compliance.

## Testing Strategy

Behavior changes follow test-driven development:

1. Add a failing test for locale-to-document-language synchronization.
2. Add failing component or browser assertions for semantic controls and
   dialog behavior.
3. Add axe to a representative Playwright page and observe the initial
   violations.
4. Make the smallest production changes required for each test.
5. Run targeted tests after every behavior change.
6. Run the complete lint, typecheck, unit, build, and end-to-end gates before
   reporting completion.

Manual verification records:

- keyboard-only completion of the selected flows;
- visible and logical focus order;
- Escape and focus restoration for dialogs;
- 200% zoom and 400% reflow spot checks;
- reduced-motion behavior;
- NVDA with Firefox or Chrome;
- VoiceOver with Safari when the required platform is available.

Unavailable platform checks are reported as missing evidence, not as passes.

## Documentation and Claims

`docs/accessibility.md` will be the maintained accessibility status page. It
will contain:

- target standards and legal-context caveat;
- implemented controls and verification commands;
- date and scope of the latest audit;
- manual results and unavailable checks;
- known barriers, especially Canvas and the 3D graph;
- contact or reporting route when the product has one;
- phase-two remediation backlog.

Allowed release wording after this phase:

> Critical accessibility remediation implemented and automatically checked.
> Full WCAG conformance remains pending manual assistive-technology testing and
> accessible alternatives for complex graphical interfaces.

The project must not publish an unqualified “WCAG AA compliant” claim based on
this phase.

## Risks and Controls

- **Existing uncommitted work:** accessibility changes must avoid unrelated
  backend and domain files and preserve the current working tree.
- **Large previous components:** make local semantic changes; do not combine this
  work with broad component extraction.
- **False confidence from axe:** keep manual evidence and known limitations
  visible in the status document.
- **Dialog regressions:** centralize only focus behavior and cover it with
  tests; retain component-specific close and busy-state rules.
- **Canvas scope expansion:** document the required alternative but defer its
  product design to a dedicated second-phase specification.

## Completion Criteria

This phase is complete only when:

- the confirmed critical mouse-only controls are keyboard-operable;
- the selected critical forms expose programmatic labels;
- the selected dialogs meet the specified semantic and focus behavior;
- document language follows locale;
- focus-visible and reduced-motion policies are active;
- representative axe checks run in Playwright;
- `docs/accessibility.md` truthfully records evidence and remaining barriers;
- applicable project verification gates pass, with any unavailable external
  checks explicitly reported.
