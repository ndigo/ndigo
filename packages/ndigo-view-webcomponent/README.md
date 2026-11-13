# Ndigo View WebComponent

> Web Component rendering engine for Ndigo — turns `AbstractWebComponent` views into live custom elements with island hydration.

`@ndigo/view-webcomponent` provides the browser-side rendering engine for component views in Ndigo: it resolves component views by name through a tag mapping, instantiates the custom element, binds the model, and bridges element events back into application context (including `@ndigo/signals`). It supports hydration for islands baked into server-rendered pages (`data-ndigo-island`/`data-ndigo-model` in server HTML).

## Installation

```bash
pnpm add @ndigo/view-webcomponent
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { AbstractWebComponent } from '@ndigo/view-webcomponent';

class TodoItemView extends AbstractWebComponent {
    _render() {
        // build the element's DOM from its model
    }
}

// tag mapping + app wiring turn this into a live <todo-item>
// element that reacts to @ndigo/signals state.
```

## Usage

### Targeting DOM regions

The built-in targeters choose _where_ a render lands. They share one cached
selector engine (`SelectorViewTargeter`) and are ordered — the first non-`null`
target wins:

```ts
import { NameViewTargeter, RouteViewTargeter, idSelector } from '@ndigo/view-webcomponent';

const targeters = [
    // map form: the view name is a lookup key, never selector text
    new NameViewTargeter({ shell: '#app', footer: '#site-footer' }),
    // or the convention form, which escapes the name: view "hello" → #hello
    new NameViewTargeter(idSelector),
    // route patterns use the router's URL-glob matcher, in declaration order
    new RouteViewTargeter({ '/report/**': '#sidebar' }),
];
```

- **`NameViewTargeter`** — view name → selector (map or function).
- **`RouteViewTargeter`** — route pattern → selector (`PathMatcher` from
  `@ndigo/core`).
- **`AttributeViewTargeter`** — a route attribute (default key `viewTarget`) →
  selector.

A missing element, a detached host, a malformed selector, or a throwing
selector function **declines** (the chain continues); selectors come from
static configuration only — escape dynamic ids with `CSS.escape`/`idSelector`.
Targets are cached per `selector + mount` (`element`, `shadow`, `iframe`) and
destroyed on eviction or `destroyViewTargeters(targeters)`, which
`createWebApplication` calls for you.

### Hydrating islands

```ts
import { hydrateIslands } from '@ndigo/view-webcomponent';

const hydrated = hydrateIslands(); // upgrades [data-ndigo-island] markup to live elements
```

Hydration is defensive and idempotent:

- **Per-marker isolation** — a component whose `model` setter or first render throws is logged through `@ndigo/log` with its tag name and skipped; the remaining markers still hydrate. Only successes are counted.
- **Malformed models** — a `data-ndigo-model` that is present but not valid JSON is logged and left alone: the server fallback stays in place instead of a `null` model reaching the component.
- **Idempotence** — hydrated markers get a `data-ndigo-hydrated` attribute and are excluded from later scans, so calling `hydrateIslands()` twice runs each model setter exactly once.

### Form-associated components (FACE)

`AsFormAssociated(Base)` makes a custom element participate in native form
submission (`ElementInternals.setFormValue`), so the server sees standard
`name=value` data — no hidden inputs and no parallel validation surface.

```ts
import { AbstractWebComponent, AsFormAssociated } from '@ndigo/view-webcomponent';

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
  `disabled` getter and a `data-ndigo-disabled` attribute.
- `formStateRestoreCallback()` adopts a browser-restored/autofilled string as
  the live value.
- Assigning an empty string to `name` clears the `name` attribute.

On hosts without `attachInternals`/`setFormValue` (SSR, jsdom) the element still
reflects `name`/`value`, but nothing is submitted — form participation is a
progressive enhancement.

### Performance

The browser comparison lane is quarantined until a real-browser runner lands;
see [`BENCHMARKS.md`](../../BENCHMARKS.md). The jsdom harness cannot execute the
module-script TodoMVC bundle, so no cross-framework numbers are published for
this engine.

### WebMCP tools

A browser view can expose a handler as a WebMCP tool with the same
`@parameters` + `validatedBy` metadata the HTTP route uses:

```ts
import { AbstractWebComponent, AsWebMcpElement, webMcpToolForHandler } from '@ndigo/view-webcomponent';

class CatalogueView extends AsWebMcpElement(AbstractWebComponent) {
    @parameters({ query: validatedBy(z.string().min(2), queryValue('query')) })
    search(query: string) {
        return catalogue.search(query);
    }

    override webMcpTools() {
        return [
            webMcpToolForHandler({
                handler: this,
                method: 'search',
                name: 'search_catalogue',
                description: 'Search the product catalogue.',
                readOnly: true,
            }),
        ];
    }
}
```

`AsWebMcpElement` registers the tools on connect and aborts the registration on
disconnect (a reconnect registers again). `provideWebMcpTools` /
`declareWebMcpTool` are available for non-element code; both feature-detect
`document.modelContext` and return a no-op registration (`supported: false`) in
browsers without WebMCP. `exposedTo` lists secure origins allowed to call a
cross-origin tool.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **`AbstractWebComponent`** — base class with the `create`/`emit` lifecycle for component-backed views; acquire a shadow root with `ensureShadowRoot()` so a parser-created declarative root is adopted (not re-attached) at upgrade — the acquired root is cached, so a **closed** root is reused on later calls, and a mode mismatch throws instead of silently returning the wrong root
- **Engine** — per-element mount logic, model binding, DOM target (`DOMElementViewTarget`), and event bridging to Ndigo signals
- **View targets** — `DOMElementViewTarget` (element host), `ShadowRootViewTarget` (open shadow root), `IframeViewTarget` (same-origin iframe document)
- **View targeters** — `SelectorViewTargeter` (cached `selector + mount` engine), `NameViewTargeter`, `RouteViewTargeter`, `AttributeViewTargeter`, `idSelector`, `destroyViewTargeters`
- **Hydration** — `hydrateIslands` upgrades declarative-shadow islands in place (keeping the parser-created root) and replaces light-DOM markers otherwise; each marker is isolated (a throwing component is logged and skipped), a malformed `data-ndigo-model` keeps the server fallback, and hydrated markers (`data-ndigo-hydrated`) are skipped on a repeat scan
- **Forms** — `AsFormAssociated(Base)` marks a component form-associated, routes its value through `ElementInternals.setFormValue`, and implements the FACE lifecycle (`formResetCallback`/`formDisabledCallback`/`formStateRestoreCallback`) plus `value`-attribute reflection, so native form submission and the existing server binding/Zod path work unchanged
- **Mapping** — tag-name ↔ component mapping and view mapping layers

## Development

```bash
pnpm --filter @ndigo/view-webcomponent build:lib
pnpm --filter @ndigo/view-webcomponent test
```

## See Also

- [@ndigo/view](../ndigo-view/README.md) — view contracts and targets
- [@ndigo/dom](../ndigo-dom/README.md) — isomorphic DOM providers used for server-side component rendering
- [apps/07-ndigo-island](../../apps/07-ndigo-island/README.md) — server-side island hydration

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
