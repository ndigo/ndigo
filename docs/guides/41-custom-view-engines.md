# Guide 41 — Custom View Engines

A view engine is a small adapter: it implements the `View` or `ProducerView`
contract, optionally a `ViewResolver`, and registers in the app's resolver
chain. EJS and Web Components are the two shipped engines; React, Vue, Svelte,
or a bespoke renderer follow the same recipe.

This guide builds a React server-rendering engine as the worked example. The
mechanics — render to HTML, serialize the model, hydrate on the client, resolve
names, serve assets — are the same for every renderer.

**Audience:** Node and browser application developers · **Prerequisites:** Guides 09 and 30 · **Reference app:** `apps/05-ndigo-api`, `apps/08-ndigo-views`

## What you'll learn

- Implement `View` / `ProducerView` for a new renderer.
- Resolve logical names with a custom `ViewResolver`.
- Register the engine without touching the dispatcher.
- Hydrate server HTML with a serialized model.
- Handle assets, CSP, streaming, and tests.
- Know when a view engine is the wrong tool.

## 1. The three contracts

| Contract       | Role                                                                |
| -------------- | ------------------------------------------------------------------- |
| `View`         | Renders a model into a `ViewTarget` (fragment or DOM)               |
| `ProducerView` | Produces a complete response document (`{ status, headers, body }`) |
| `ViewResolver` | Maps a logical view name to a `View`                                |

A server-rendered page usually implements `ProducerView` (it owns the whole
document); a client fragment or island implements `View` (it writes into a
target). You can implement both on one class.

```ts
import type { ProducerView, RenderResult, View, ViewTarget } from '@ndigo/view';
import type { Route } from '@ndigo/router';

class HelloView implements ProducerView {
    async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        return {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: `<h1>Hello ${String((model as { name: string }).name)}</h1>`,
        };
    }
}
```

The dispatcher renders a `ProducerView` directly; a `View` is rendered through
`view.render(model, route, target)`. The Node adapter supplies an HTTP view
target; the browser supplies a DOM target.

## 2. Server rendering with React

Install the renderer in the app (not in a framework package):

```bash
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom
```

A `ProducerView` renders the component to HTML, embeds the model, and points at
the hydration entry:

```ts
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import type { ProducerView, RenderResult } from '@ndigo/view';
import type { Route } from '@ndigo/router';

interface PageProps {
    model: unknown;
    route: Route;
}

export class ReactPageView implements ProducerView {
    readonly #Page: ComponentType<PageProps>;
    readonly #entry: string;

    constructor(Page: ComponentType<PageProps>, entry = '/static/client.js') {
        this.#Page = Page;
        this.#entry = entry;
    }

    async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        const html = renderToString(createElement(this.#Page, { model, route }));
        const payload = JSON.stringify(model).replace(/</g, '\\u003c');
        return {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: `<!doctype html>
<html lang="${route.attributes.language ?? 'en'}">
  <head><meta charset="utf-8"><title>${String(route.attributes.title ?? 'App')}</title></head>
  <body>
    <div id="root">${html}</div>
    <script>window.__NDIGO_MODEL__ = ${payload};</script>
    <script type="module" src="${this.#entry}"></script>
  </body>
</html>`,
        };
    }
}
```

The `</` escaping prevents a model string from closing the script element. The
hydration entry reads `window.__NDIGO_MODEL__`, renders the same component, and
calls `hydrateRoot`.

## 3. Client hydration

```ts
import { createElement, type ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';

interface PageProps {
    model: unknown;
    route: unknown;
}

export function hydratePage(Page: ComponentType<PageProps>): void {
    const root = document.getElementById('root');
    if (!root) throw new Error('Missing #root');
    const model = (window as unknown as { __NDIGO_MODEL__: unknown }).__NDIGO_MODEL__;
    hydrateRoot(root, createElement(Page, { model, route: { path: location.pathname } }));
}
```

Build the client entry with the app's bundler (Vite is the repo default) and
serve it through the static controller or a CDN. The server HTML and the client
component tree must match; a mismatch causes React to discard and re-render,
which is a visible flash and a lost first paint.

## 4. The resolver

A resolver maps a logical name to a view. Keep the registry explicit; do not
import every page eagerly.

```ts
import type { View, ViewResolver } from '@ndigo/view';
import type { ComponentType } from 'react';

export class ReactViewResolver implements ViewResolver {
    readonly #pages: Map<string, ComponentType<{ model: unknown; route: unknown }>>;
    readonly #entry: string;

    constructor(pages: Map<string, ComponentType<{ model: unknown; route: unknown }>>, entry?: string) {
        this.#pages = pages;
        this.#entry = entry ?? '/static/client.js';
    }

    async resolveViewName(name: string): Promise<View | null> {
        const Page = this.#pages.get(name);
        return Page ? new ReactPageView(Page, this.#entry) : null;
    }
}
```

Register it in the app's view chain, before or after EJS/Web Components:

```ts
import { ViewResolverComposite } from '@ndigo/view';

@entry()
viewResolver() {
    return new ViewResolverComposite([new ReactViewResolver(pages), new EJSViewResolver({ prefix: 'views/' })]);
}
```

`ViewResolverComposite` queries delegates in order and returns the first match.
The dispatcher only sees the `View`/`ProducerView`; no dispatcher change is
needed for a new engine.

## 5. Fragment mode and islands

`ProducerView` owns the document; a React component inside an existing page is
different. Two options:

- **Whole-page root** — the pattern above: server HTML contains `#root`, the
  client hydrates the page.
- **Fragment/island** — implement `View.render(model, route, target)` and
  commit the rendered HTML into the target, or wrap the React root in a custom
  element and let `IslandView` hydrate it.

Do not mount two React roots over the same DOM. For mixed pages, render each
fragment into its own element or use one root with a server-provided model that
describes all fragments.

## 6. Assets, CSP, and i18n

- **Assets** — the client entry and its chunks are static files. Build them with
  Vite, serve them through `StaticController`/a CDN, and fingerprint names.
  Do not inline the bundle into `renderTo`.
- **CSP** — a React page usually needs a nonce on its inline model script. Pass
  the request's nonce into the view and emit `<script nonce="…">`; never disable
  CSP (guide 28).
- **i18n** — pass the negotiated locale (guide 17) into the component props and
  keep message lookup on the server for the first paint; the client uses the
  same message source or the serialized strings.
- **Forms** — React forms submit through the normal binding path (guide 18).
  Keep the server as the validator; client state is convenience.

## 7. Streaming

React's `renderToPipeableStream` can stream a document. Implement `ProducerView`
and return an `AsyncIterable` body (or use a `View` that writes chunks to a
producer target). Caveats:

- The status/headers must be decided before the first byte.
- A mid-stream error cannot become a 500; render an error boundary fallback.
- Proxies must not buffer the response.
- Hydration happens after the stream completes; keep the model script early.

Streaming is an optimization, not a requirement. Start with `renderToString`
and a static document; add streaming when the page is large enough to measure.

## 8. Testing

- **Server** — `bootApp` + `MockHTTP` (guide 36) asserts the status, headers,
  and root markup. The React component can be tested separately with its own
  props.
- **Hydration** — run the client entry in jsdom, assert no hydration warning,
  and assert one interactive update.
- **Resolver** — unit-test that names map to the expected view and unknown
  names return `null` (so the next resolver can try).
- **Snapshot** — use a fixed model; do not snapshot timestamps or random ids.

## 9. Checklist and pitfalls

- **Only `View`/`ProducerView` is public.** Do not import React types into
  framework packages; the engine is an app concern.
- **One resolver order.** Put the React resolver where its names are unique;
  a broad resolver masks EJS or Web Component views.
- **Serialize safely.** Escape `<` in the model script; never inject raw user
  HTML into the document.
- **Match server and client markup.** A mismatch throws away the first paint.
- **Do not bundle per request.** Build the client once; the server renders
  only markup and a model.
- **A view engine is not a component library.** React components still follow
  the UI-library rules (guide 30); the engine only renders them.
- **Do not use a view engine for JSON.** Return data or a serializing view
  (guide 09); a React engine is for HTML.

## See also

- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — the view contracts
- [Guide 30 — UI Libraries & Component Integration](30-component-integration.md) — choosing a UI strategy
- [Guide 17 — Internationalization & Content](17-i18n-and-content.md) — locale propagation
- [Guide 36 — Testing with `@ndigo/test`](36-testing.md) — the request harness
- [`@ndigo/view`](../../packages/ndigo-view/README.md) — `View`, `ProducerView`, resolvers
- [`@ndigo/view-ejs`](../../packages/ndigo-view-ejs/README.md) — a server-rendering engine
- [`@ndigo/view-webcomponent`](../../packages/ndigo-view-webcomponent/README.md) — a client-rendering engine
