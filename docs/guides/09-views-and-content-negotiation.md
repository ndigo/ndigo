# Guide 09 — Views, Targets & Content Negotiation

A controller returns a result; a **view** turns that result into bytes. Ndigo
keeps the two separate: handlers name a logical view or return a view instance,
and the platform's view resolver chain chooses the representation. That is how
one handler serves JSON to an API client and CSV to a browser without branching
on `Accept`.

This guide covers the view contract, the built-in view family, view targets,
content negotiation, the resolver chain, and the EJS/Web Component
technologies.

**Audience:** Node and browser application developers · **Prerequisites:** Guides 01 and 02 · **Reference app:** `apps/05-ndigo-api`, `apps/08-ndigo-views`, `apps/12-ndigo-petclinic`

## What you'll learn

- Implement the `View` / `ProducerView` contract.
- Use `ModelAndView`, view names, and direct view instances.
- Choose among JSON, CSV, text, octet-stream, and streaming views.
- Negotiate a representation from the path extension or `Accept` header.
- Compose view resolvers for EJS, Web Components, and islands.
- Apply view targets and themes.

## 1. The view contract

A view receives the model and the current route and returns a complete render
result:

```ts
import type { RenderResult, View } from '@ndigo/view';

class HealthView implements View {
    async renderTo(model: unknown, route: Route): Promise<RenderResult> {
        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ok', path: route.path }),
        };
    }
}
```

`RenderResult` is `{ status, headers, body }`. A `ProducerView` is the same
contract with a body that may be a stream/async iterable — SSE, file downloads,
and progressive rendering use it. The dispatcher renders the returned view after
the handler resolves; the platform adapter writes the result.

## 2. Handler returns

Handlers have four return shapes:

| Return                  | Meaning                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `ModelAndView`          | A view name or `View` instance plus model data              |
| `ProducerView` instance | Rendered directly (streams/async iterables, SSE)            |
| Plain value or `string` | Serialized as a JSON response document                      |
| `ResponseEntity`        | Explicit status/headers/body; `>= 400` becomes problem+json |

`ModelAndView` is the explicit form for name- and instance-based views:

```ts
import { ModelAndView } from '@ndigo/dispatcher';
import { JSONView } from '@ndigo/view';

return new ModelAndView(new JSONView(), { items });
return new ModelAndView('report', { rows });
```

A `ResponseEntity` adds an explicit status and headers; the platform rewrites a
`>= 400` entity into problem+json (guide 08).

## 3. The serializing views

`@ndigo/view` ships the representations most APIs need:

| View              | Media type                 | Notes                                              |
| ----------------- | -------------------------- | -------------------------------------------------- |
| `JSONView`        | `application/json`         | `JSON.stringify` with the route as context         |
| `CSVView`         | `text/csv`                 | Records from a model field (`{ records: 'rows' }`) |
| `TextView`        | `text/plain`               | Plain string bodies                                |
| `OctetStreamView` | `application/octet-stream` | Binary bodies                                      |
| `ProducerView`    | caller-defined             | Streams/async iterables, SSE                       |

All serializing views expose their `mediaType`, which is what negotiation
matches against. A view without a media type is a fallback, not a negotiation
candidate.

## 4. Content negotiation

Negotiation answers "which representation of this logical name?". The Node
platform configures a `ContentNegotiationManager` and a
`ContentNegotiationViewResolver`; the manager consults its strategies in order:

- **Path extension** — `/report.csv` selects `text/csv`, `/report` falls back
  to the `Accept` header.
- **Accept header** — q-values and wildcards are parsed; the client's
  preference order wins over resolver registration order.
- **Fixed strategy** — a configured default for clients that send nothing.

```ts
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
    JSONView,
    CSVView,
} from '@ndigo/view';
import { MediaTypes } from '@ndigo/core';

const manager = new ContentNegotiationManager([
    new PathExtensionContentNegotiationStrategy(
        new Map([
            ['json', MediaTypes.APPLICATION_JSON],
            ['csv', MediaTypes.TEXT_CSV],
        ])
    ),
]);
const resolver = new ContentNegotiationViewResolver(manager);
resolver.viewResolvers = [
    { resolveViewName: async (name) => (name === 'report' ? new JSONView() : null) },
    { resolveViewName: async (name) => (name === 'report' ? new CSVView({ records: 'rows' }) : null) },
];
```

When candidates exist but none can serve the accepted ranges, the resolver
throws `NotAcceptableError` (HTTP 406). That is deliberately distinct from
"no such view" (404).

## 5. The resolver chain

A view resolver maps a logical name to a view. The platform composes them:

| Resolver                         | Role                                    |
| -------------------------------- | --------------------------------------- |
| `ImportViewResolver`             | Loads a view module by path (Node)      |
| `NameViewResolver`               | Looks up a view bean by name            |
| `ViewResolverComposite`          | Runs an ordered chain, first match wins |
| `ContentNegotiationViewResolver` | Negotiates among candidate views        |
| `IslandViewResolver`             | Maps a name to an `IslandView`          |

Name resolution is cached per `(name, language)`; only the media-type choice is
per request. Resolvers map/load views — they never register components. A Web
Component's `customElements.define` remains the module's own side effect.

## 6. EJS and Web Components

The view **technology** is separate from the resolver:

- `@ndigo/view-ejs` — server-side EJS templates; `t()` and formatters come from
  `@ndigo/content`, and the locale rides on the route (guide 17).
- `@ndigo/view-webcomponent` — server-rendered Web Components; the browser
  hydrates them with `@ndigo/signals` (guide 29).
- `IslandView` — server-rendered markup plus a serialized model, hydrated on
  the client; the first paint can carry trusted Declarative Shadow DOM markup.

The same logical name can resolve to an EJS view on Node and a Web Component in
the browser. That is the "same name, resolver picks representation" rule
(AD-65).

## 7. View targets and themes

A **view target** is the platform half of rendering: an HTTP response on Node,
a DOM element in the browser. Fragment rendering (a partial inside a layout, an
island inside a page) goes through the target abstraction, so a view does not
hard-code its host.

Themes are resolved per route before rendering; the platform's theme resolver
selects the theme name, and templates/components read it from the context. Do
not bake theme names into a view; take them from the resolver.

## 8. Pitfalls

- **A `string` return is a JSON value, not a view name.** Wrap the name in
  `new ModelAndView('name')` to reach the resolver chain.
- **Give negotiation candidates a `mediaType`.** A view without one cannot be
  selected by `Accept`.
- **406 is a representation failure, not a missing route.** Do not catch it and
  return 404.
- **Resolvers are cached per name.** Configure delegate resolvers before the
  first request; adding them later is not seen.
- **Do not register components in a resolver.** `customElements.define` belongs
  to the component module.
- **A 4xx `ResponseEntity` is rewritten to problem+json.** For a custom error
  envelope, use a `ProducerView` (guide 08).

## See also

- [Guide 01 — Building a Node API](01-building-a-node-api.md) — the handler/render loop
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — DOM view targets
- [Guide 08 — Errors & Problem Details](08-errors-and-problem-details.md) — 406 and error views
- [Guide 17 — Internationalization & Content](17-i18n-and-content.md) — locale in templates
- [Guide 29 — Signals & Islands](29-signals-and-islands.md) — island hydration
- [`@ndigo/view`](../../packages/ndigo-view/README.md) — the view and negotiation surface
- [AD-53](../decisions/2026-03-22_AD53_VIEW_EVENT_ARCHITECTURE.md) and [AD-65](../decisions/2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) — the view model and resolution strategy
