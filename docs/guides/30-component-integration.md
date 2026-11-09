# Guide 30 — UI Libraries & Component Integration

Ndigo ships **no mandatory UI library**. The framework owns the bridge to the
Web Component ecosystem — declarative shadow DOM first paint, form association,
hydration, view resolution — and an application chooses its components. The
first-party design system, [`@ndigo/ui`](https://github.com/ndigo/ndigo/tree/main/packages/ndigo-ui),
is the recommended default, but it is optional and the framework does not depend
on it.

This guide covers both paths: using ndigo-ui, and adopting any other Web
Component library (Web Awesome is the worked example). The runnable ndigo-ui
reference is [`apps/20-ndigo-ui-lab`](../../apps/20-ndigo-ui-lab/README.md);
[`apps/07-ndigo-island`](../../apps/07-ndigo-island/README.md) is the migrated
island app. The decision records are [AD-69](../decisions/2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md),
[AD-71](../decisions/2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md), and
[AD-95](../decisions/2026-11-08_AD95_NDIGO_UI.md).

**Audience:** Browser application developers · **Prerequisites:** Guide 02 · **Reference app:** `apps/20-ndigo-ui-lab`

## What you'll learn

- Choose between ndigo-ui, a third-party Web Component library, and a view-engine UI.
- Install ndigo-ui tokens and copy-in components with the `ndigo ui` or shadcn registry channel.
- Keep the framework and your app independent of any one UI library.
- Vet a third-party library and render its first paint safely.
- Wire forms, theming, i18n, and CSP without wrappers.

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

For an application in this monorepo or the lab, install copy-in items with the
first-party CLI. Point the app at the repository registry:

```bash
ndigo ui init apps/my-app --registry ../../registry.json
ndigo ui add theme lib button input field dialog app-shell --dir apps/my-app
```

In a checkout without the CLI on `PATH`, use
`node packages/ndigo-cli/bin/run.js ui ...`. `ui init` writes `ndigo.ui.json`
with the registry source and aliases (`@ui` → `src/ui`, `@lib` → `src/lib`,
`@components` → `src/components`, `@hooks` → `src/hooks`). `ui add` resolves
registry dependencies, writes the files, records a SHA-256 per file in
`ui.lock.json`, and installs the item's npm dependencies. Use `--skipInstall`,
`--dryRun`, and `--overwrite` as needed. The `theme` item is the copy-in
alternative to importing `@ndigo/ui/tokens.css`; use one or the other.

External applications use the shadcn channel. Configure the namespace in
`components.json`:

```json
{
    "registries": {
        "@ndigo": "https://ndigo.dev/r/{name}.json"
    }
}
```

Then install an item:

```bash
npx shadcn@latest add @ndigo/code-block
```

The direct URL works without configuration:
`npx shadcn@latest add https://ndigo.dev/r/code-block.json`. Browse the
catalogue at [ndigo.dev/ui](https://ndigo.dev/ui) for the item list, install
commands, targets, and READMEs (the generated pages live in `ndigo-site`; the
host is not deployed yet).

Agents can run `ndigo ui mcp --dir <app> --registry <source>` to expose the same
registry over MCP. The server provides `list_items`, `search_items`, `get_item`,
`install_items`, and `validate_registry`; installs plan by default (`dryRun:
false` writes), and `--readOnly` omits the install tool.

The registry has 41 items: `theme`, `lib`, 34 primitives, and 5 blocks. At the
time of writing the native-first primitives are `button`, `input`, `field`,
`checkbox`, `table`, `alert`, `badge`, `card`, `separator`, `skeleton`,
`spinner`, `breadcrumb`, `kbd`, `aspect-ratio`, `item`, `typography`, and
`pagination`; the Zag.js behaviour primitives are `dialog`, `menu`, `popover`,
`tooltip`, `tabs`, `accordion`, `switch`, `slider`, `select`, `combobox`,
`drawer`, `date-picker`, `scroll-area`, `navigation-menu`, `tags-input`, and
`file-upload`; `toast` is a native-first live region. The blocks are
`app-shell`, `command`, `data-table`, `code-block`, and `sidebar`. Use
`ndigo ui list` or the catalogue for the current set rather than a copied list;
components outside the registry compose from tokens instead of being absorbed
into the package.

Ownership rules:

- **Installed source is yours.** Read it, edit it, and keep it in your repo;
  updates are deliberate (`ui add --overwrite`), not automatic.
- **The package is not a runtime.** `@ndigo/ui` ships tokens, theme CSS, and the
  typed catalog; the element code is copy-in.
- **Behaviour comes from Zag.js**, markup/styles from the registry. No styled
  component library is a dependency.
- **Conformance precedes a component**: axe-clean, keyboard/focus contract,
  logical properties for RTL, reduced motion, light-DOM first paint, form
  participation (native/hidden inputs or FACE), and a measured gzip budget.

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

The same rule applies to ndigo-ui. Native-first items are CSS over platform
elements: import `src/ui/nd-button/nd-button.css` and use
`<button class="nd-button">`. Behaviour elements are copy-in modules: import
`src/ui/nd-dialog/nd-dialog.ts`, then use `<nd-dialog>` directly. Attributes
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

ndigo-ui elements are light-DOM: server markup is the first paint, and the
element upgrades it in place. The island pattern still applies when the server
and client models must match. For third-party libraries, keep the fallback
derived from the same model so the swap is invisible.

## 7. Forms

Keep the existing binding + Zod path (guides 06/07/18) and let the control
submit ordinary name/value pairs:

- ndigo-ui's native-first items (`button`, `input`, `field`, `checkbox`,
  `table`, ...) are CSS over native elements, so they submit standard data
  automatically. `field` owns the label; `input` also covers `<textarea>`.
- `select`, `switch`, `tags-input`, and `date-picker` render hidden native
  inputs carrying the value. Keep them in the markup and let the form
  serialize them.
- `slider` and `combobox` expose their value through the element API and
  `nd-value-change`; add a native input when the form must submit them.
- A custom form control can use `AsFormAssociated(Base)` from
  `@ndigo/view-webcomponent` when a hidden input is not appropriate.
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

## 10. Web Awesome as a third-party example

`apps/07-ndigo-island` migrated from Web Awesome to ndigo-ui in Phase 3; its
source no longer imports `<wa-*>` components. The migration sequence remains the
worked example for moving a third-party library onto ndigo-ui:

1. Install the equivalent registry items (`theme`, `lib`, `button`, `input`,
   `field`, ...).
2. Replace `<wa-*>` with the native element or `<nd-*>`, keeping
   `name`/attributes/events.
3. Map Web Awesome CSS variables onto `--nd-*` at the app boundary.
4. Remove the Web Awesome dependency and its per-component imports.
5. Re-check form submission, fallback markup, and the bundle delta.

Web Awesome stays in this guide as the vetting/fallback example, not as a
current app dependency.

## See also

- [UI catalogue](https://ndigo.dev/ui) — browse and install registry items
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the browser preset
- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — view contracts
- [Guide 44 — Accessibility](44-accessibility.md) — the a11y gate and testing
- [Guide 18 — Forms End-to-End](18-forms-end-to-end.md) — binding and validation
- [Guide 28 — Security Hardening](28-security-hardening.md) — CSP
- [Guide 41 — Custom View Engines](41-custom-view-engines.md) — React/Vue UI strategies
- [`@ndigo/ui`](../../packages/ndigo-ui/README.md) — tokens, theme, registry
- [`apps/20-ndigo-ui-lab`](../../apps/20-ndigo-ui-lab/README.md) — the runnable consumer
- [ndigo-ui agent skill](../../agent-local/skills/ndigo-ui/SKILL.md) — the agent-facing usage and porting contract
- [AD-69](../decisions/2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md), [AD-71](../decisions/2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md), and [AD-95](../decisions/2026-11-08_AD95_NDIGO_UI.md) — component, selection, and ndigo-ui decisions
