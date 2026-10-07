# Guide 21 — Component Integration

BlueJS ships an integration contract, not a component library: components come
from the Web Component ecosystem, the framework owns the bridge (declarative
shadow DOM first paint, form association, hydration). The decision record is
[AD-69](../decisions/2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md); the
library selected for the reference integration is Web Awesome
([AD-71](../decisions/2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md)).

This guide is the how-to; the runnable reference is
[`apps/blue-island`](../../apps/blue-island/README.md) — an SSR island whose
add-item form uses Web Awesome controls end-to-end.

## 1. Selecting a library

Reuse the AD-69 D-2 checklist (all gates must hold) and record the evidence in
a selecting ADR before adding a dependency:

| #   | Criterion     | Gate                                                                               |
| :-- | :------------ | :--------------------------------------------------------------------------------- |
| 1   | License       | OSI-approved; commercial tiers must be optional add-ons only                       |
| 2   | DSD/SSR       | Real shadow content can be server-rendered, or the fallback pattern (§3) covers it |
| 3   | FACE/forms    | Custom controls submit standard form data (name/value)                             |
| 4   | Accessibility | Keyboard + axe-clean on the components the app uses, not just claims               |
| 5   | Theming       | CSS custom properties (no shadow-piercing hacks); logical properties for RTL       |
| 6   | i18n          | Component strings localizable (no hard-coded English in chrome)                    |
| 7   | Packaging     | ESM, per-component imports, tree-shakable, no global side effects                  |
| 8   | Maintenance   | Recent publishes, multiple maintainers, issue responsiveness                       |
| 9   | Bundle budget | Measured per-component cost fits the app's budget                                  |
| 10  | Wrapping      | Usable without per-component wrappers (attribute/event surface is the API)         |

The library is an **application** dependency: framework packages stay
library-free, and each consumer selects independently.

## 2. Installing and using components directly

Import the components you use by their per-component path and let the import
register the element — no wrapper, no facade, no re-export shim (AD-69 D-4).
Use attributes and events directly, exactly as the library documents:

```ts
// apps/blue-island/client/main.ts (abridged)
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';

const input = document.createElement('wa-input');
input.setAttribute('name', 'text');
input.setAttribute('label', labels.inputLabel);
input.setAttribute('required', '');
const submit = document.createElement('wa-button');
submit.setAttribute('type', 'submit');
submit.setAttribute('appearance', 'filled');
```

Per-component imports are also the bundle-budget mechanism: the demo adds
button + input only, and pays for input + button only (§9 measures the cost).

## 3. First paint: the server fallback pattern

Third-party components cannot portably server-render yet (Web Awesome marks
SSR experimental; AD-69 defers a `@lit-labs/ssr` adapter until it stabilizes).
The portable pattern is the island one: the server renders a **derived
fallback** — skeleton or content from the same model — into a declarative
shadow root, and the component's first client render replaces it in place.

```ts
// apps/blue-island/src/island-controller.ts (abridged)
const island = new IslandView('todo-app', { shadowHtml: renderTodoFallback(model) });
```

The fallback markup is trusted author markup (`shadowHtml` is never escaped;
never pass user input). With the client bundle blocked the browser parses the
template into a real shadow root and shows the fallback; with the bundle it
hydrates in place (ADR-69 D-3). When a library's SSR support stabilizes,
`did-ssr` (Web Awesome) plus the library's hydration entry point can replace
this pattern component-by-component.

## 4. Forms: FACE controls use the standard submission path

A component that is a **form-associated custom element** (FACE) contributes
`name`/`value` to `FormData` like a native control. Nothing about the server
side changes:

```ts
// client: read the form like any native form — no hidden inputs
const formData = new FormData(form);
for (const [key, value] of formData.entries()) {
    body.set(key, String(value)); // application/x-www-form-urlencoded
}
```

```ts
// server: the standard binding + validation path (guides 09 and 02)
@postMapping('/items')
@parameters({ item: validatedBy(AddItemSchema, dataBinderValue('body')) })
addItem(item: { text: string }) { /* … */ }
```

Binding failures (malformed transport) stay `400`; schema failures surface as
the RFC 9457 `422` problem document with `errors[]`.

Two constraints worth knowing:

- Keep the `<form>` and its FACE controls in the **same tree** (e.g. both
  inside the island's shadow root, as the demo does). Form association does not
  cross shadow boundaries.
- Constraint attributes (`required`, `pattern`, …) come from the library; the
  schema on the server remains the validation source of truth.

New BlueJS-owned controls get the same participation through
`AsFormAssociated(Base)` in `@blue/view-webcomponent`.

## 5. Theming: tokens are the contract

Link the library's theme once and override its CSS custom properties — at
`:root`, on the island host, or per component:

```html
<link rel="stylesheet" href="/static/client.css" />
<style>
    :root {
        --wa-color-brand-fill-loud: #1f7a5a;
        --wa-form-control-border-radius: 0.5rem;
    }
</style>
```

Custom properties inherit through shadow boundaries, so document-level token
overrides reach into component internals without `::part`/`::deep`
shadow-piercing. The theme stylesheet is a build input of the client bundle
(import it once from the client entry; the build emits a linked asset).

## 6. i18n and locale

The library localizes its own chrome from the document language: serve
`<html lang="…">` (BlueJS negotiates and renders it, guide 04) and import the
translation modules you support:

```ts
import '@awesome.me/webawesome/dist/translations/fr.js';
```

Notes: per-component `lang`/`dir` must be set on the component itself, not an
ancestor; the library's mechanism covers component chrome only — application
strings stay in `@blue/content` (or the island model). The demo also selects
its own labels from the island's negotiated locale (`data-blue-locale`).

## 7. What stays out of scope

- **No wrappers or facades.** If a library needs one, that is a signal for the
  adoption checklist, not a license to build a shadow API.
- **No full component SSR** until the upstream support stabilizes; the
  fallback pattern is the documented answer.
- **RTL** is delegated to the library (AD-71); BlueJS's own RTL work remains
  tracked with Content/i18n.

## 8. Reference integration — `apps/blue-island`

The demo wires every step above together:

| Layer         | What it shows                                                                                             |
| :------------ | :-------------------------------------------------------------------------------------------------------- |
| Client island | Web Awesome input + button rendered directly into the island's shadow root; labels from the island locale |
| Submission    | `FormData` from the FACE controls → `application/x-www-form-urlencoded` POST to `/items`                  |
| Server        | `dataBinderValue('body')` + Zod (`validatedBy`) → store mutation → SSE push to every connected client     |
| First paint   | Server-rendered fallback (list + form skeleton) in a declarative shadow root, replaced on hydration       |
| Theming       | `client.css` theme + `--wa-*` token overrides from the shell                                              |
| Bundle        | Per-component imports; see the measured cost below                                                        |

Run it:

```bash
cd apps/blue-island && pnpm dev
# GET http://127.0.0.1:3200/        — the hybrid shell
# POST http://127.0.0.1:3200/items  — urlencoded form endpoint (text=…)
```

## 9. Bundle budget reference

Measured 2026-10-07 (Web Awesome 3.14.0): a tree-shaken bundle of
button + input + switch + dialog is **174 KB raw / 43.5 KB gzip** (esbuild,
minified). The reference app's actual, unminified build deltas for
input + button: `client.js` 335.9 KB → 538.6 KB raw (80.2 KB → 129.3 KB gzip),
plus the theme asset `client.css` 63.8 KB raw / 9.5 KB gzip. Re-measure per
component when adding to an app; per-component imports keep the increment
proportional to what the app actually uses.

## See Also

- [AD-69 — Component integration contract](../decisions/2026-10-06_AD69_COMPONENT_INTEGRATION_CONTRACT.md)
- [AD-71 — Component library selection (Web Awesome)](../decisions/2026-10-07_AD71_COMPONENT_LIBRARY_SELECTION.md)
- [Guide 18 — Signals & Islands](18-signals-and-islands.md) — the island lifecycle in detail
- [apps/blue-island](../../apps/blue-island/README.md) — the runnable reference
