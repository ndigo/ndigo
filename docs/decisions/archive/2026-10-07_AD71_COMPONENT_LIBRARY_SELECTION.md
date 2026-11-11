# AD-71: Component library selection — Web Awesome for the reference integration

> **Archived** — this decision is fully superseded and retained for history. See the superseding ADR linked below.

**Date:** 2026-10-07
**Status:** Superseded by [AD-95](../2026-11-08_AD95_NDIGO_UI.md) — Web Awesome is
no longer the reference integration; the framework packages stay
dependency-free, and `apps/07-ndigo-island` keeps the library only until the
migration milestone, when the dependency is removed from the workspace.

## Context

AD-69 recorded the component integration contract (do not build a library;
adopt the Web Component ecosystem; the framework owns the DSD first-paint and
FACE bridges) and deferred library selection to a concrete consumer plus its
10-point vetting checklist (AD-69 D-2). The concrete consumer is the
reference integration itself: a demo app where adopters can see the contract
against a real library, and the guide that documents the pattern.

Candidates were vetted as of 2026-10-07 against every D-2 gate (all must
hold). Method: npm metadata (`npm view`), official docs, upstream repository
sources, the shipped `node_modules` for the FACE/SSR/theming claims, measured
per-component bundles (esbuild, minified, gzip -9), and a live Chromium
probe for the form-association contract.

## Vetting results

| Candidate                                  | Snapshot                                         | Gate result                                                                           |
| :----------------------------------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Web Awesome** (`@awesome.me/webawesome`) | 3.14.0 · MIT · published 2026-09-24              | **All gates pass** (see table below)                                                  |
| Spectrum Web Components                    | theme 1.12.4 / core 0.3.0 · Apache-2.0 · 2026-07 | **Fails #3 (FACE/forms)**                                                             |
| Material Web (`@material/web`)             | 2.5.0 · Apache-2.0 · 2026-10-05                  | **Fails #3 (FACE/forms)**                                                             |
| FAST (`@microsoft/fast-element`)           | 3.0.4 · MIT · 2026-10-01                         | **Fails the premise** — element system, not a maintained component set                |
| Shoelace (`@shoelace-style/shoelace`)      | 2.20.1 · MIT · 2025-03                           | Excluded — predecessor of Web Awesome; superseded                                     |
| Zag.js (`@zag-js/core`)                    | 1.45.0 · MIT · 2026-10-05                        | Not a component set — headless behavior; stays the AD-69 D-5 in-house primitives path |

### Web Awesome against the AD-69 D-2 checklist

| #   | Criterion     | Verdict                      | Evidence                                                                                                                                                                                                                                                                                                                                                  |
| :-- | :------------ | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | License       | Pass                         | Core is MIT ([repo `LICENSE.md`](https://github.com/shoelace-style/webawesome/blob/main/LICENSE.md)); the commercial Pro tier is an optional add-on ([FAQs](https://github.com/shoelace-style/webawesome/discussions/1387): "Web Awesome Free is MIT licensed"). No framework dependency.                                                                 |
| 2   | DSD/SSR       | Pass (with the D-3 fallback) | Shipped SSR support emits declarative shadow DOM + hydration (`did-ssr` attribute; `@lit-labs/ssr`, `@lit-labs/ssr-client` dependencies); [docs](https://webawesome.com/docs/ssr) mark SSR **experimental**, goal "reduce layout shifting", so the reference integration uses the AD-69 D-3 server-rendered fallback pattern instead.                     |
| 3   | FACE/forms    | Pass                         | [Docs](https://webawesome.com/docs/form-controls): "form controls are form-associated custom elements"; `dist/internal/webawesome-form-associated-element` base. Verified in live Chromium (2026-10-07): a form + controls inside one shadow root → `new FormData(form)` yields `title=hello`, `internals.form === form`.                                 |
| 4   | Accessibility | Pass                         | Keyboard support documented upstream; axe-clean verified on the components the demo uses in the live browser check (see Evidence).                                                                                                                                                                                                                        |
| 5   | Theming       | Pass                         | CSS custom property tokens (`--wa-*`, theme at `dist/styles/themes/default.css`); logical properties in the shipped CSS (`margin-inline` 232, `padding-inline` 200, `inset-inline` 93, `border-inline` 100, `:dir(` 50 occurrences). Caveat: component `dir` cannot be read "up a tree" — documented SSR limitation; client-side `dir` on `<html>` works. |
| 6   | i18n          | Pass                         | Translation modules (`dist/translations/<code>.js`) + `<html lang>`; docs also allow per-component `lang`/`dir` (must be on the component, not an ancestor).                                                                                                                                                                                              |
| 7   | Packaging     | Pass                         | ESM, per-component entry paths (`dist/components/<name>/<name>.js`); import side effect = registration (intended, no global CSS injection); measured bundle for button + input + switch + dialog: **174 KB raw / 43.5 KB gzip** (2026-10-07).                                                                                                             |
| 8   | Maintenance   | Pass                         | 3.14.0 published 2026-09-24; upstream pushed 2026-10-02; Font Awesome-backed; 4 npm maintainers; 100+ contributors; 81 open issues.                                                                                                                                                                                                                       |
| 9   | Bundle budget | Pass                         | Per-component imports keep the demo delta to the components used (see Consequences).                                                                                                                                                                                                                                                                      |
| 10  | Wrapping      | Pass                         | Attribute/event surface used directly in the demo — no wrappers, no facades (AD-69 D-4).                                                                                                                                                                                                                                                                  |

### Why the failures are disqualifying (recorded evidence)

- **Spectrum Web Components** — a grep of the installed 1.12.4 packages for
  `formAssociated` / `attachInternals` / `setFormValue` across all
  `@spectrum-web-components/*` packages returns nothing: no shipped control
  is form-associated, so custom controls cannot submit standard form data
  (`name`/`value`). Gate #3 fails outright; the AD-69 FACE bridge then has
  nothing to integrate with.
- **Material Web** — `formAssociated` exists only in `labs/behaviors/*`
  (future-use mixins); no shipped text field / checkbox / switch sets it, and
  `attachInternals` appears only in tabs/menu/list/chip-set (ARIA roles, not
  form participation). Same gate #3 failure.
- **FAST** — FAST is a lower-level element system; the maintained ready-made
  component story is Fluent UI web components, and the FAST component set is
  in vNext transition. Adopting it would mean building components — the
  outcome AD-69 D-1/D-5 rejects.

## Decision

**D-1 — Select Web Awesome for the reference integration.** It is the only
vetted candidate passing every AD-69 D-2 gate, with an OSI license and an
optional (never required) commercial tier.

**D-2 — Scope: one application, zero framework dependencies.**
`apps/ndigo-island` (the SSR/island demo) is the single reference integration;
no `packages/*` package may depend on the library. Adopters copy the pattern
from the guide, not a framework API.

**D-3 — Integration is direct, no wrappers** (AD-69 D-4): per-component
imports (`@awesome.me/webawesome/dist/components/...`), the library's theme
CSS, and CSS custom properties as the theming contract. No per-component
facade, no re-export shim.

**D-4 — The two contract seams are exercised where they matter:**

- **FACE → the existing server path.** The demo's add-item form uses a Web
  Awesome input + button; submission reads `FormData(form)` (native encoding,
  no hidden inputs) and posts `application/x-www-form-urlencoded` to a
  `@postMapping` handler that binds with `dataBinderValue('body')` +
  `validatedBy(Zod)` — guide 09/02 unchanged.
- **First paint → the D-3 fallback pattern.** The island server-renders a
  derived fallback into a declarative shadow root; hydration replaces it in
  place (AD-69 D-3). Full component SSR (`@lit-labs/ssr` integration) stays
  deferred while upstream marks it experimental.

**D-5 — i18n and theming stay library-side concerns we delegate to:**
`<html lang>` + translation imports; tokens overridden from the app shell.

## Rationale

- The security-of-supply picture is the best of the shortlist: same vendor
  family as Shoelace (the project the ecosystem already used), MIT core,
  Font Awesome-backed, recent publishes, multiple maintainers.
- The demo proves the _hard_ half of the contract (FACE inside shadow DOM,
  DSD fallback replacement, standard form encoding into the existing binding
  path) — the half a "build your own" library would postpone.
- Framework positioning is preserved: ndigo ships an integration contract
  and a guide, not a component library (AD-69 D-1).

## Consequences

- `apps/ndigo-island` gains the library dependency; its client bundle grows by
  the imported components (measured: per-component imports keep the added
  weight proportional — evidence in the guide).
- The reference integration becomes the documented pattern for adopters;
  other apps stay library-free until a consumer asks.
- Component SSR remains out of scope (upstream experimental) — the demo
  documents the fallback pattern; a future `@lit-labs/ssr` adapter remains an
  AD-69 revisit trigger.

## Revisit triggers

- Web Awesome's core components change license, or the Pro tier becomes
  mandatory → re-run the D-2 vetting (AD-69 trigger #2).
- Upstream SSR stabilizes → extend the island pipeline with a library SSR
  adapter (AD-69 D-3 residual).
- A second, independent consumer needs a different design system — the
  contract is library-independent; each consumer selects independently and
  the guide's checklist is reused.

## Evidence

- Consumer: [`apps/07-ndigo-island`](../../../apps/07-ndigo-island/README.md) — add-item
  form (Web Awesome input/button) → `POST /items` (`dataBinderValue` + Zod) →
  SSE model push; guide
  [21 — Component Integration](../../guides/21-component-integration.md).
- Vetting: npm registry (`npm view`, 2026-10-07) for all candidates; installed
  packages inspected for `formAssociated`/`attachInternals`/`setFormValue`;
  [Web Awesome form controls](https://webawesome.com/docs/form-controls),
  [SSR](https://webawesome.com/docs/ssr),
  [localization](https://webawesome.com/docs/localization),
  [Pro license](https://webawesome.com/license/pro); GitHub API repo stats
  (2026-10-07).
- Live Chromium probe (2026-10-07, headless): shadow-root form with
  `wa-input` → `FormData(form)` = `[["title","hello"]]`,
  `internals.form === form`, zero page errors.
- Reference-integration verification (2026-10-07, headless Chromium against the
  live `ndigo-island` server): parsing the served bytes attaches the
  declarative shadow root with the derived fallback (items + form skeleton);
  hydration replaces it in place; the form's `FormData` carries the FACE
  control's value (`text=Browser round-trip`), the urlencoded `POST /items`
  binds + validates and the new item arrives over SSE; axe (wcag2a/2aa/
  wcag21a/21aa) reports **zero violations** after the demo's own contrast fix
  (one `incomplete` for the button background, an axe overlap limitation);
  the shell's `--wa-color-brand-fill-loud` override renders (accent button
  rgb(31,122,90) on white text); Web Awesome chrome localizes by document
  language (`Clear entry` ⇄ `Effacer l'entrée`), and the island's own labels
  switch to French from the negotiated locale.
- Bundles (esbuild, minified, gzip -9): Web Awesome button+input+switch+dialog
  **174 KB raw / 43.5 KB gzip**; Material Web same set 142 KB raw / 31.4 KB
  gzip (fails #3 regardless); Spectrum same set via its registration entries
  (`sp-*.js` — package mains are side-effect-free and tree-shake to 0 B)
  336 KB raw / 70.5 KB gzip.
