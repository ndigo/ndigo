# Blue View WebComponent

> Web Component rendering engine for BlueJS — turns `AbstractWebComponent` views into live custom elements with island hydration.

`@blue/view-webcomponent` provides the browser-side rendering engine for component views in BlueJS: it resolves component views by name through a tag mapping, instantiates the custom element, binds the model, and bridges element events back into application context (including `@blue/signals`). It supports hydration for islands baked into server-rendered pages (`data-blue-island`/`data-blue-model` in server HTML).

## Installation

```bash
pnpm add @blue/view-webcomponent
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { AbstractWebComponent } from '@blue/view-webcomponent';

class TodoItemView extends AbstractWebComponent {
    _render() {
        // build the element's DOM from its model
    }
}

// tag mapping + app wiring turn this into a live <todo-item>
// element that reacts to @blue/signals state.
```

## Usage

### Hydrating islands

```ts
import { hydrateIslands } from '@blue/view-webcomponent';

const hydrated = hydrateIslands(); // upgrades [data-blue-island] markup to live elements
```

Hydration is defensive and idempotent:

- **Per-marker isolation** — a component whose `model` setter or first render throws is logged through `@blue/log` with its tag name and skipped; the remaining markers still hydrate. Only successes are counted.
- **Malformed models** — a `data-blue-model` that is present but not valid JSON is logged and left alone: the server fallback stays in place instead of a `null` model reaching the component.
- **Idempotence** — hydrated markers get a `data-blue-hydrated` attribute and are excluded from later scans, so calling `hydrateIslands()` twice runs each model setter exactly once.

### Form-associated components (FACE)

`AsFormAssociated(Base)` makes a custom element participate in native form
submission (`ElementInternals.setFormValue`), so the server sees standard
`name=value` data — no hidden inputs and no parallel validation surface.

```ts
import { AbstractWebComponent, AsFormAssociated } from '@blue/view-webcomponent';

class RatingInput extends AsFormAssociated(AbstractWebComponent) {
    render(): void {
        /* draw the control; call `this.value = …` when the user picks a score */
    }
}
customElements.define('rating-input', RatingInput);
// <form><rating-input name="rating" value="5"></rating-input></form>
```

Value and lifecycle semantics mirror a native control:

- The **`value` attribute is the default** (it participates in submission at
  upgrade time and is the `form.reset()` target); assigning `.value` in script
  sets the **live value only** — like `input.value` versus `input.defaultValue`.
- `formResetCallback()` restores the default and re-publishes it, so a stale
  value is never submitted after `form.reset()`.
- `formDisabledCallback()` reflects a `<fieldset disabled>` ancestor to the
  `disabled` getter and a `data-blue-disabled` attribute.
- `formStateRestoreCallback()` adopts a browser-restored/autofilled string as
  the live value.
- Assigning an empty string to `name` clears the `name` attribute.

On hosts without `attachInternals`/`setFormValue` (SSR, jsdom) the element still
reflects `name`/`value`, but nothing is submitted — form participation is a
progressive enhancement.

### Performance

The todomvc benchmark suite (Speedometer-3 style workload in jsdom) measures the engine against other frameworks — model updates re-render in place without replacing the element.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **`AbstractWebComponent`** — base class with the `create`/`emit` lifecycle for component-backed views; acquire a shadow root with `ensureShadowRoot()` so a parser-created declarative root is adopted (not re-attached) at upgrade — the acquired root is cached, so a **closed** root is reused on later calls, and a mode mismatch throws instead of silently returning the wrong root
- **Engine** — per-element mount logic, model binding, DOM target (`DOMElementViewTarget`), and event bridging to BlueJS signals
- **Hydration** — `hydrateIslands` upgrades declarative-shadow islands in place (keeping the parser-created root) and replaces light-DOM markers otherwise; each marker is isolated (a throwing component is logged and skipped), a malformed `data-blue-model` keeps the server fallback, and hydrated markers (`data-blue-hydrated`) are skipped on a repeat scan
- **Forms** — `AsFormAssociated(Base)` marks a component form-associated, routes its value through `ElementInternals.setFormValue`, and implements the FACE lifecycle (`formResetCallback`/`formDisabledCallback`/`formStateRestoreCallback`) plus `value`-attribute reflection, so native form submission and the existing server binding/Zod path work unchanged
- **Mapping** — tag-name ↔ component mapping and view mapping layers

## Development

```bash
pnpm --filter @blue/view-webcomponent build:lib
pnpm --filter @blue/view-webcomponent test
```

## See Also

- [@blue/view](../blue-view/README.md) — view contracts and targets
- [@blue/dom](../blue-dom/README.md) — isomorphic DOM providers used for server-side component rendering
- [apps/blue-island](../../apps/blue-island/README.md) — server-side island hydration

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
