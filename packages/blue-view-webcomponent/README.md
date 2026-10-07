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

### Performance

The todomvc benchmark suite (Speedometer-3 style workload in jsdom) measures the engine against other frameworks — model updates re-render in place without replacing the element.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **`AbstractWebComponent`** — base class with the `create`/`emit` lifecycle for component-backed views; acquire a shadow root with `ensureShadowRoot()` so a parser-created declarative root is adopted (not re-attached) at upgrade
- **Engine** — per-element mount logic, model binding, DOM target (`DOMElementViewTarget`), and event bridging to BlueJS signals
- **Hydration** — `hydrateIslands` upgrades declarative-shadow islands in place (keeping the parser-created root) and replaces light-DOM markers otherwise
- **Forms** — `AsFormAssociated(Base)` marks a component form-associated and routes its value through `ElementInternals.setFormValue`, so native form submission and the existing server binding/Zod path work unchanged
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
