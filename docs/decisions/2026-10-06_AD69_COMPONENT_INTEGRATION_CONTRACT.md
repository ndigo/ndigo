# AD-69: Component integration contract — adopt the Web Component ecosystem; the framework owns the bridge

**Date:** 2026-10-06
**Status:** Accepted — decision recorded; the two framework-side bridge halves
(DSD first-paint plumbing, `AsFormAssociated` bridge) landed with this record's
spike. **No UI library is added to the workspace by this decision** — selecting
one is a separate decision (revisit trigger below).

## Context

ndigo's view layer is an _authoring_ layer, not a component library:
`AbstractWebComponent` + `@TagMapping` (`@ndigo/view-webcomponent`), server-rendered
islands with client hydration (`IslandView`/`hydrateIslands`), EJS views, and
signals. There are no UI components, tokens, or design-system surface, and no
existing decision about one (verified: zero mentions of component libraries,
design systems, or any library name across `docs/`, ADRs, and READMEs).

The platform primitives such a decision depends on are now baseline:

- **Declarative Shadow DOM (DSD)** — Baseline since 2024-08-05, ~94% global
  usage (web.dev, caniuse) — makes server-rendered shadow content possible and
  parseable before any script runs.
- **Form-associated custom elements (FACE)** — `ElementInternals.setFormValue`
  (MDN) — makes custom controls participate in native form submission.

The Web Component ecosystem has multiple mature candidates. Package metadata
verified 2026-10-06:

| Candidate                                  | Version / license / last publish                   | Notes                                                                                                                              |
| :----------------------------------------- | :------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Web Awesome** (`@awesome.me/webawesome`) | 3.14.0 · MIT · 2026-09-24                          | Shoelace successor; large set; depends on `@lit-labs/ssr` (SSR-capable), `lit` 3; per-component imports matter (~17.5 MB unpacked) |
| Shoelace (legacy line)                     | 2.20.1 · MIT · 2025-03                             | Predecessor; migration path documented                                                                                             |
| **Spectrum Web Components** (Adobe)        | core 0.3.0 / theme 1.12.x · Apache-2.0 · 2026-07   | Token-driven theming, per-component packages, opinionated design language                                                          |
| **Material Web** (Google)                  | 2.5.0 · Apache-2.0 · 2026-10-05                    | Material 3; actively maintained                                                                                                    |
| **FAST** (Microsoft)                       | `@microsoft/fast-element` 3.0.4 · MIT · 2026-10-01 | Lower-level element system; vNext in flight                                                                                        |
| **Zag.js**                                 | `@zag-js/core` 1.45.0 · MIT · 2026-10-05           | Headless, framework-agnostic behavior (state machines) — the credible path for any owned primitives                                |

Building a kit in-house would permanently own: accessibility conformance,
localized strings, RTL (ndigo explicitly deferred RTL in Content/i18n — INV-1),
form participation, theming, SSR/DSD parity, docs/lab and semver churn — with no
differentiation. The reference boot layer and Nest ship no UI kit; they integrate the
ecosystem (Vaadin, Bootstrap). A component library is a product/design-system
decision wearing a framework costume.

## Decision

**D-1 — Do not build a general component library.** The framework provides the
integration contract and the bridge; components come from the ecosystem.

**D-2 — Vetting checklist for any adopted library** (all must hold; record the
evidence in the selecting ADR):

| #   | Criterion     | Gate                                                                                |
| :-- | :------------ | :---------------------------------------------------------------------------------- |
| 1   | License       | OSI-approved; commercial tiers must be optional add-ons only                        |
| 2   | DSD/SSR       | Real shadow content can be server-rendered, or the fallback pattern (D-3) covers it |
| 3   | FACE/forms    | Custom controls submit standard form data (name/value)                              |
| 4   | Accessibility | Keyboard + axe-clean on the components the app uses, not just claims                |
| 5   | Theming       | CSS custom properties (no shadow-piercing hacks); logical properties for RTL        |
| 6   | i18n          | Component strings localizable (no hard-coded English in chrome)                     |
| 7   | Packaging     | ESM, per-component imports, tree-shakable, no global side effects                   |
| 8   | Maintenance   | Recent publishes, multiple maintainers, issue responsiveness                        |
| 9   | Bundle budget | Measured per-component cost fits the app's budget                                   |
| 10  | Wrapping      | Usable without per-component wrappers (attribute/event surface is the API)          |

**D-3 — The framework owns the bridge (landed with this record's spike):**

- **DSD first-paint for islands.** `IslandView` accepts trusted author-supplied
  `shadowHtml` and emits it as `<template shadowrootmode="open">` in the SSR
  markup, so the first paint shows real content instead of an empty element;
  `hydrateIslands` detects a parser-created shadow root and upgrades the element
  **in place** rather than replacing it; `AbstractWebComponent` tolerates a
  pre-existing shadow root at upgrade. For ecosystem components that cannot
  server-render, the portable pattern is a **server-rendered fallback derived
  from the same model** (skeleton or content) that the component's first render
  replaces.
- **FACE ↔ binding bridge.** `AsFormAssociated(Base)` marks a component
  form-associated and routes its value through `ElementInternals.setFormValue`,
  so submission uses standard encoding and the existing server path
  (`@bodyMapping`/`dataBinderValue` + Zod validation) works **unchanged**. No
  component wrappers, no parallel validation surface.

**D-4 — Integration discipline.** No per-component wrappers/facades; tokens and
CSS custom properties are the theming contract; exactly one documented reference
integration (guide + demo app) per selected library.

**D-5 — In-house-build gate.** Build in-house only if every shortlisted
candidate fails D-2. Even then: primitives only (inputs, dialog, layout,
disclosure) on `AbstractWebComponent`, with Zag.js for behavior — never a full
kit.

**D-6 — No dependency by default.** This ADR adds no runtime dependency;
library selection is driven by a concrete consumer (first adopter design system
or a 1.0 adoption blocker) and recorded separately.

## Rationale

- The precondition "unless there isn't a good solution in the Web Component
  space" is false: five viable candidates with current publishes and OSI
  licenses; the missing piece in ndigo was the bridge, which is
  library-independent and now exists.
- DSD + FACE are the two platform features that made the previous objections
  (server rendering, forms) obsolete; both are Baseline/standard.
- Keeping components out of the framework preserves the "enterprise framework for TypeScript"
  positioning and avoids owning a design system the project does not have a
  design team for.
- The bridge is testable without committing to a library: the spike verifies it
  with ndigo's own elements in a real browser (Chromium via Playwright) plus
  unit specs; the same contract is what an adopted library must satisfy.

## Consequences

- Island SSR no longer renders element-less markup when `shadowHtml` is
  supplied; the server-fallback pattern is the recommended default for
  third-party components.
- The component story becomes "contract + bridge + one reference integration"
  instead of a package; the roadmap item for the browser paradigm (GAP-11)
  shrinks to documentation and an example.
- Residual/out-of-scope: full component SSR (hydrating server-rendered shadow
  trees without a re-render, e.g. `@lit-labs/ssr` integration) is deferred until
  a selected library needs it; RTL remains delegated to the chosen library and
  tracked with the Content/i18n RTL deferral (INV-1).

## Revisit triggers

- First adopter/design system picks a library → write the selecting ADR using
  the D-2 checklist and land the single reference integration (guide + demo).
- A shortlisted candidate changes license (Web Awesome commercial tier) or
  stalls maintenance → re-run the D-2 vetting.
- Component SSR becomes a real requirement (content-heavy islands) → extend the
  D-3 pipeline with a library SSR adapter.

## Evidence

- Review context: [§6 GAP-11](../plans/2026-10-06_COMPREHENSIVE_REVIEW_AND_MITIGATION.md)
  (browser paradigm: no asset/component story) and the framework-gap analysis.
- Platform: [Declarative Shadow DOM — Baseline 2024](https://web.dev/articles/declarative-shadow-dom),
  [Form-associated custom elements — MDN](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals).
- Package metadata: npm registry (`npm view`, 2026-10-06) for the six candidates.
- Spike (landed with this record): `IslandView` DSD option,
  `hydrateIslands` in-place upgrade, `AbstractWebComponent.ensureShadowRoot()`,
  `AsFormAssociated`, each with unit specs (ndigo-view 119,
  ndigo-view-webcomponent 82, ndigo-island 24 green). Verified live in Chromium:
  ndigo-island serves the declarative template; with the client bundle blocked
  the browser parses it into a real shadow root holding the server fallback;
  with the bundle it hydrates in place, renders into the adopted root, and
  receives SSE model updates — zero page errors.
