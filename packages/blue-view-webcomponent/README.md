# Blue View WebComponent

Bridges BlueJS view patterns with Web Components — the runtime that turns
`AbstractWebComponent` views into live custom elements.

## Overview

`@blue/view-webcomponent` provides the browser-side rendering engine for
component views:

- **`AbstractWebComponent`** — base class with the `create`/`emit` lifecycle
  for component-backed views
- **Engine** — per-element mount logic, model binding, DOM target
  (`DOMElementViewTarget`), and event bridging between element events and
  BlueJS signals
- **Hydration** — `hydrate` support for islands baked into server-rendered
  pages (`data-blue-island`/`data-blue-model` in server HTML)
- **Mapping** — tag-name ↔ component mapping and view mapping layers

## Usage

Component views are resolved by view name through the tag mapping, the same
way other BlueJS views resolve — the engine instantiates the custom element,
binds the model, and bridges events back into the application context:

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

## Performance

The todomvc benchmark suite (`benchmark.spec.ts`, Speedometer-3 style
workload in jsdom) measures the engine against other frameworks — model
updates re-render in place without replacing the element.

## Development

```bash
pnpm --filter @blue/view-webcomponent build:lib
pnpm --filter @blue/view-webcomponent test
```

## See Also

- [@blue/view](../blue-view/README.md) — view contracts and targets
- [@blue/dom](../blue-dom/README.md) — isomorphic DOM providers used for
  server-side component rendering
- [apps/blue-island](../../apps/blue-island/README.md) — server-side island
  hydration
