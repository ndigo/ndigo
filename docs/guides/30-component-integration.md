# Guide 30 — UI Libraries & Component Integration

Ndigo ships **no mandatory UI library**. The framework owns the bridge to the
Web Component ecosystem — declarative shadow DOM first paint, form association,
hydration, view resolution — and an application chooses its components. The
first-party design system, [`@ndigo/ui`](https://github.com/ndigo/ndigo/tree/main/packages/ndigo-ui),
is the recommended default, but it is optional and the framework does not depend
on it.

This guide covers both paths: using ndigo-ui, and adopting any other Web
Component library (Web Awesome is the worked example). The runnable third-party
reference is [`apps/07-ndigo-island`](../../apps/07-ndigo-island/README.md); the
decision records are [AD-69](../decisions/2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md),
[AD-71](../decisions/2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md), and
[AD-95](../decisions/2026-11-08_AD95_NDIGO_UI.md).

**Audience:** Browser application developers · **Prerequisites:** Guide 02 · **Reference app:** `apps/07-ndigo-island`

## What you'll learn

- Choose between ndigo-ui, a third-party Web Component library, and a view-engine UI.
- Install ndigo-ui tokens and copy-in components with the `ndigo ui` registry.
- Keep the framework and your app independent of any one UI library.
- Vet a third-party library and render its first paint safely.
- Wire FACE forms, theming, i18n, and CSP without wrappers.

## 1. Choose a strategy

| Strategy                              | Use when                                                            | Cost                                                                      |
| ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **ndigo-ui** (first-party, optional)  | You want the Ndigo design language and a copy-in registry           | You own the installed source; components arrive via `ndigo ui add`        |
| **Third-party Web Component library** | You already have a design system (Web Awesome, Shoelace, Lit-based) | You own the adoption/fallback/i18n work; the framework stays library-free |
| **View-engine UI** (React/Vue/Svelte) | The UI is a full framework app or a React design system             | You implement or adopt a view engine (guide 41)                           |
| **Hand-rolled / native**              | Small surfaces, maximum control                                     | You build accessibility, forms, and theming yourself                      |

The framework packages never import a UI library. Each application selects
independently, and two apps in one monorepo may choose differently.

## 2. ndigo-ui quickstart

ndigo-ui has two halves: a small `@ndigo/ui` package (tokens, theme, typed
catalog) and a shadcn-compatible registry of copy-in components.

Install the token package and import the stylesheets:

```bash
pnpm add @ndigo/ui
```

```css
@import '@ndigo/ui/tokens.css';
@import '@ndigo/ui/theme.css';
```

Tokens expose `--nd-*` custom properties (color, type, spacing, radius, shadow,
motion, stacking, focus). Dark is the default; set `data-theme="light"` on the
root for the light palette.

Initialize the registry in the app:

```bash
ndigo ui init ./apps/my-app
ndigo ui add button input field dialog menu app-shell --dir ./apps/my-app
```

`ndigo ui init` writes `ndigo.ui.json` with the registry URL and the `src/ui`,
`src/lib`, `src/components`, and `src/hooks` aliases. `ui add` resolves
`registryDependencies`, installs the files into those aliases, records a
SHA-256 per file in `ui.lock.json`, and installs the item's npm dependencies
with the app's package manager. Use `--skipInstall` when you manage
dependencies separately, and `--dryRun` to preview. The `theme` item is the
copy-in alternative to importing `@ndigo/ui/tokens.css`; use one or the
other.

The current registry items are `theme`, `lib`, the native-first `button`,
`input`, `field`, and `checkbox`, the Zag.js-backed `dialog` and `menu`, and the
`app-shell` block. The set grows by milestone; components outside it compose
from tokens rather than being absorbed into the package.

Ownership rules:

- **Installed source is yours.** Read it, edit it, and keep it in your repo;
  updates are deliberate (`ui add --overwrite`), not automatic.
- **The package is not a runtime.** `@ndigo/ui` ships tokens, theme CSS, and the
  typed catalog; the element code is copy-in.
- **Behaviour comes from Zag.js**, markup/styles from the registry. No styled
  component library is a dependency.
- **Conformance precedes a component**: axe-clean, keyboard/focus contract,
  logical properties for RTL, reduced motion, DSD first paint, FACE
  participation, and a measured gzip budget.

ndigo-ui knows no consumer. The site/Astro adapter and Ndigo-specific blocks
live outside the package; if a reusable integration emerges, it becomes an
opt-in `integrations/` registry item.

## 3. Library independence

The contract is the Web Component, not the library:

- The framework imports no UI package. `@ndigo/platform-web` and
  `@ndigo/view-webcomponent` provide the bridge, not components.
- `@ndigo/ui` is optional; `pnpm remove @ndigo/ui` leaves a working app.
- A third-party library is an **application** dependency; the framework
  packages stay library-free (AD-69 D-6/AD-95 D-2).
- A view engine (React/Vue) is a presentation choice, not a framework
  dependency. Guide 41 covers adding one.

This is the difference between “the framework recommends ndigo-ui” and “the
framework requires ndigo-ui”. Keep the app's imports at the component boundary
so swapping libraries is a localized change.

## 4. Choosing a third-party library

Reuse the AD-69 D-2 checklist and record the evidence in a selecting ADR:

| #   | Criterion     | Gate                                                                  |
| --- | ------------- | --------------------------------------------------------------------- |
| 1   | License       | OSI-approved; commercial tiers optional                               |
| 2   | DSD/SSR       | Real shadow content server-renders, or the fallback pattern covers it |
| 3   | FACE/forms    | Controls submit standard name/value form data                         |
| 4   | Accessibility | Keyboard + axe-clean on the components you use                        |
| 5   | Theming       | CSS custom properties, no shadow-piercing hacks; logical properties   |
| 6   | i18n          | Chrome strings localizable                                            |
| 7   | Packaging     | ESM, per-component imports, tree-shakable, no global side effects     |
| 8   | Maintenance   | Recent releases, multiple maintainers, responsive issues              |
| 9   | Bundle budget | Measured per-component cost fits the budget                           |
| 10  | Wrapping      | Usable without per-component wrappers                                 |

If a library fails a gate, use it as inspiration, not as a dependency. The
framework's preference is a library that passes the gates, not a particular
brand.

## 5. Using components directly

Import the components you use by their per-component path and let the import
register the element — no wrapper, no facade (Web Awesome example):

```ts
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';

const input = document.createElement('wa-input');
input.setAttribute('name', 'text');
input.setAttribute('label', labels.inputLabel);
input.setAttribute('required', '');

const submit = document.createElement('wa-button');
submit.setAttribute('type', 'submit');
```

The same rule applies to ndigo-ui elements: import the copy-in module
(`src/ui/nd-button/nd-button.ts`), then use `<nd-button>` directly. Attributes
and events are the API; do not build a per-component wrapper that hides them.

## 6. First paint

Third-party components cannot portably server-render yet. The portable pattern
is the island one: the server renders a **derived fallback** (skeleton or the
same model) into a declarative shadow root, and the component's first client
render replaces it in place:

```ts
import { IslandView } from '@ndigo/view';

const island = new IslandView('todo-app', { shadowHtml: renderTodoFallback(model) });
```

ndigo-ui primitives are designed for this pattern: their DSD fallback is part
of the conformance contract. For third-party libraries, keep the fallback
derived from the same model so the swap is invisible.

## 7. FACE forms

A form-associated custom element participates in the normal `<form>`
submission; the server sees ordinary name/value pairs. Keep the existing
binding + Zod path (guides 06/07/18) and let the control submit:

- ndigo-ui's current form items (`button`, `input`, `field`, `checkbox`) are native-first CSS over native elements, so they submit standard data automatically. A future custom form control uses `AsFormAssociated(Base)` from `@ndigo/view-webcomponent`.
- Web Awesome controls are FACE; set `name` and let the form serialize them.
- Do not add a second binding path per component library. If a control cannot
  submit standard form data, it fails the vetting gate.

## 8. Theming and i18n

- **ndigo-ui** — consume `--nd-*`; do not hard-code colors/spacing. The token
  catalog (`TOKENS`, `resolveToken`) is the typed contract.
- **Third-party** — theme through the library's CSS custom properties; map
  your brand tokens onto its variables at the app boundary.
- **i18n** — component chrome strings must be localizable. Pass the negotiated
  locale (guide 17) into the component's label/aria attributes; do not rely on
  hard-coded English defaults.
- **RTL** — require logical properties; test one component per library.

## 9. CSP and bundle budget

If the library injects inline styles/scripts, extend the CSP explicitly
(`style-src`/`script-src` with a nonce or hash) rather than disabling CSP
(guide 28). Budget per component: import only what the page uses, measure the
gzip delta, and record it in the ADR. ndigo-ui items ship with a recorded
budget; a third-party library's claim is not a measurement.

## 10. Migrating Web Awesome to ndigo-ui

`apps/07-ndigo-island` keeps its Web Awesome integration until the ndigo-ui
components it needs exist (AD-95 Phase 3). The migration is mechanical:

1. `ndigo ui add` the equivalent items (`button`, `input`, `field`, ...).
2. Replace `<wa-*>` with `<nd-*>`, keeping `name`/attributes/events.
3. Map Web Awesome CSS variables onto `--nd-*` at the app boundary.
4. Remove the Web Awesome dependency and its per-component imports.
5. Re-check FACE submission, fallback markup, and the bundle delta.

Keep the Web Awesome material in this guide as the worked third-party example
until the migration lands.

## See also

- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the browser preset
- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — view contracts
- [Guide 44 — Accessibility](44-accessibility.md) — the a11y gate and testing
- [Guide 18 — Forms End-to-End](18-forms-end-to-end.md) — binding and validation
- [Guide 28 — Security Hardening](28-security-hardening.md) — CSP
- [Guide 41 — Custom View Engines](41-custom-view-engines.md) — React/Vue UI strategies
- [`@ndigo/ui`](../../packages/ndigo-ui/README.md) — tokens, theme, registry
- [AD-69](../decisions/2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md), [AD-71](../decisions/2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md), and [AD-95](../decisions/2026-11-08_AD95_NDIGO_UI.md) — component, selection, and ndigo-ui decisions
