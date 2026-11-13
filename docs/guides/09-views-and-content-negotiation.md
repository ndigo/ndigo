# Guide 09 — Views, Targets & Content Negotiation

A controller returns a result; a **view** turns that result into bytes. Ndigo
keeps the two separate: handlers name a logical view or return a view instance,
and the platform's view resolver chain chooses the representation. That is how
one handler serves JSON to an API client and CSV to a browser without branching
on `Accept`.

This guide covers the view contract, the built-in view family, view targets,
content negotiation, the resolver chain, and the EJS/Web Component
technologies.

**Audience:** Node and browser application developers · **Prerequisites:** Guides [01](01-building-a-node-api.md) and [02](02-building-a-browser-app.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api), [apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views), [apps/12-ndigo-petclinic](https://github.com/ndigo/ndigo/tree/main/apps/12-ndigo-petclinic)

## What you'll learn

- Implement the `View` / `ProducerView` contract.
- Use `ModelAndView`, view names, and direct view instances.
- Choose among JSON, CSV, text, octet-stream, and streaming views.
- Negotiate a representation from the path extension or `Accept` header.
- Compose view resolvers for EJS, Web Components, and islands.
- Apply view targets and themes.
- Choose between centralized and decentralized view placement.

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
| `A2UIView`        | `application/a2ui+json`    | Array of A2UI messages for agent-driven surfaces   |
| `ToonView`        | `text/toon`                | Tabular/agent payloads as TOON                     |
| `CSVView`         | `text/csv`                 | Records from a model field (`{ records: 'rows' }`) |
| `TextView`        | `text/plain`               | Plain string bodies                                |
| `OctetStreamView` | `application/octet-stream` | Binary bodies                                      |
| `ProducerView`    | caller-defined             | Streams/async iterables, SSE                       |

All serializing views expose their `mediaType`, which is what negotiation
matches against. A view without a media type is a fallback, not a negotiation
candidate.

The A2UI representation is plain JSON over the A2UI 1.0 message array
(`createSurface`, `updateComponents`, …). Register
`a2uiViewResolver('report')` beside the JSON resolver and a `.a2ui` request (or
`Accept: application/a2ui+json`) selects it; without that registration the
logical view keeps its JSON representation. A tool result carrying
`ModelAndView('a2ui', messages)` reaches an MCP client as the message array.
See [Guide 48 — Agent-Facing Surfaces](48-agent-facing-surfaces.md) for the
route, resolver registration, and installed-only catalog in context.

Server agents should generate the smallest surface that answers the user:
`A2UIView` is token-optimized, not a full-screen replacement — build a card, a
form, a list, a chart, or a dialog when the agent needs structured input and
the renderer supports it. Use the regular HTML view or a text response when
there is nothing more than a short message or a small unstructured answer
for the sandbox to render.

### TOON (`@ndigo/view-toon`, )

TOON (Token-Oriented Object Notation) is a line-oriented encoding of the JSON
data model, tuned for LLM prompts. `ToonView` serializes a model as
`text/toon;charset=utf-8`, and `encodeToon` renders the same document
synchronously for in-process prompt composition — no view or HTTP involved.

Preference order matters for who gets TOON. Register the JSON resolver
**first**, then `toonViewResolver`: without a negotiable Accept hint the
resolver serves the first candidate, so registration order is what keeps JSON
the default for unopinionated clients. A `.toon` path extension works only if
the application adds `'toon'` to its own extension map — the framework's
wiring registers nothing for it, and it is a provisional media type (not
IANA-registered), so the representation is opt-in per route and marked
experimental while TOON remains a Working Draft.

Choose TOON for its design win: uniform arrays of flat objects — one field
header instead of a key repetition per row. It is neutral-to-worse on small
nested objects, so the recommendation is measured: prefer it for agent-facing
or prompt-bound payloads of roughly 2 KB or more of tabular shape, and keep
JSON as the default everywhere else.

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
| `NameViewResolver`               | Looks up a view entry by name           |
| `ViewResolverComposite`          | Runs an ordered chain, first match wins |
| `ContentNegotiationViewResolver` | Negotiates among candidate views        |
| `IslandViewResolver`             | Maps a name to an `IslandView`          |

Name resolution is cached per `(name, language)`; only the media-type choice is
per request. Resolvers map/load views — they never register components. A Web
Component's `customElements.define` remains the module's own side effect.

## 6. EJS, TOON, and Web Components

The view **technology** is separate from the resolver:

- `@ndigo/view-ejs` — server-side EJS templates; `t` and formatters come from
  `@ndigo/content`, and the locale rides on the route (guide 17).
- `@ndigo/view-webcomponent` — server-rendered Web Components; the browser
  hydrates them with `@ndigo/signals` (guide 29).
- `@ndigo/view-toon` — the `text/toon` representation and prompt encoder
  ; opt-in per route, never a default.
- `IslandView` — server-rendered markup plus a serialized model, hydrated on
  the client; the first paint can carry trusted Declarative Shadow DOM markup.

The same logical name can resolve to an EJS view on Node and a Web Component in
the browser. That is the "same name, resolver picks representation" rule
.

## 7. View targets and view targeting

A **view target** is the platform half of rendering: the destination a view
writes its output to. An HTTP response on Node, a DOM element in the browser,
a captured buffer in a test — all go through the same `ViewTarget` interface,
so a view never hard-codes its host. Fragment rendering (a partial inside a
layout, an island inside a page) goes through the target abstraction too.

A **view targeter** is the policy half: an ordered strategy that chooses _which_
target a render pass writes to. Resolution and targeting are deliberately
separate concerns — resolvers choose the **representation** (JSON vs. CSV,
EJS vs. Web Component), targeters choose the **destination** (`#app` vs.
`#sidebar`). A targeter never sees negotiation candidates and cannot change
what is rendered; a resolver never sees the DOM.

### 7.0 Two ways to place a view

Both models are first-class. Pick per result, not per app.

**Decentralized** — the handler (or the view) owns the destination:

```ts
// controller
const view = new WebComponentView('hello-app');
return new ModelAndView(view, { message: 'Hello, World!' });
// placement: the registered VIEW_TARGET, or an explicit result target:
// return new ModelAndView(view, model, { viewTarget });
```

**Centralized** — the handler names the result; configuration decides the
destination:

```ts
// controller
return new ModelAndView('footer', model);
```

```ts
// configuration
@entry() viewTargeters() {
    return [new NameViewTargeter({ footer: '#site-footer' })];
}
```

|                              | Decentralized                          | Centralized                                 |
| :--------------------------- | :------------------------------------- | :------------------------------------------ |
| **Controller knows**         | view type / surface                    | a logical name                              |
| **Placement lives in**       | the handler (or the view)              | configuration                               |
| **Change a layout**          | edit handlers                          | edit one configuration entry                |
| **First-read clarity**       | high — everything is local             | lower — follow the name                     |
| **Consistency across teams** | depends on discipline                  | enforced by the chain                       |
| **One-off layouts**          | natural                                | awkward — a chain entry for one route       |
| **Tests**                    | trivial — inject `MemoryViewTarget`    | need the configured chain or the fallback   |
| **Node/browser parity**      | view classes differ per platform       | same name, resolver picks the platform view |
| **Failure mode**             | compile-time (missing constructor arg) | runtime (declines to fallback)              |

Decision guide:

- **Centralized** when the destination is part of the app's _structure_ —
  regions, layouts, shells, dashboards. The handler should not know the DOM.
- **Decentralized** when the destination is intrinsic to the _result_ — a
  stream, an iframe created for that render, a captured test buffer — or when a
  view genuinely owns a sub-layout it composes itself.
- **Mixed** is expected: centralized region selection at the top, decentralized
  composition inside a region.

The pipeline makes the decentralized choice cheap rather than merely possible:
a realized view skips the resolver chain, and an explicit target skips the
targeter chain. Supporting both models must not tax the other — see §7.6 for
the Node fast paths that guarantee it.

Reference demos: [apps/01-ndigo-hello](https://github.com/ndigo/ndigo/tree/main/apps/01-ndigo-hello)
is deliberately decentralized (one handler, one registered target, no chains);
[apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)
is centralized (three named regions plus a route-selected sidebar).

### 7.1 The target contract

`ViewTarget` (from `@ndigo/view`) has three methods:

- `prepare(route)` — clear/ready the destination before rendering.
- `commit(output, model, route)` — write the rendered output (type depends on
  the engine: an `HTMLElement`, a string, bytes, …).
- `clear()` — release resources when rendering is done or fails.

`EventBridgeViewTarget` extends it with `setEventMap(...)` so a surface can
forward DOM/surface events back into the application layer. A target that only
renders and never forwards events implements the base interface; one that also
bridges events implements `EventBridgeViewTarget`.

A render pass chooses its destination in strict order:

1. **`ModelAndView.viewTarget`** — an explicit target on the result
   (decentralized, always wins).
2. **`route.attributes[VIEW_TARGET_ATTRIBUTE]`** — a target placed on the
   route by middleware or an interceptor.
3. **The `viewTargeters` chain** — first targeter to return a non-`null`
   target; the rest are not consulted.
4. **The fallback** — the platform's registered `VIEW_TARGET` (or the Node
   response target). This is the pre-targeter behavior.

Steps 1 and 2 validate their value with `likeViewTarget`, so a stray string can
never reach a selector lookup; a non-target value is ignored (and logged at
debug) rather than failing the render. `null` from a targeter means **decline**
— not "render nowhere" — matching `ViewResolver.resolveViewName` exactly.

Targets are also registered as the `VIEW_TARGET` context token (from
`@ndigo/dispatcher`) and read as the fallback. The platform presets
(`createNodeApplication` / `createWebApplication`) provision the right target
for the runtime; you only construct one yourself for a custom surface or a
test. `createWebApplication({ viewTargeters })` and `NodeAutoConfiguration`'s
`viewTargeter` entry are the two ways a preset installs a chain.

### 7.2 Built-in targets

| Target                      | Package                    | Host                                   | When to use                                                                                                                                                            |
| --------------------------- | -------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTPResponseViewTarget`    | `@ndigo/platform-node`     | An HTTP response (`ServerResponse`)    | Server-side rendering: what `ResponseViewTargeter` returns by default; writes status, headers, and body through the response.                                          |
| `DOMElementViewTarget`      | `@ndigo/view-webcomponent` | A DOM element (by id or element ref)   | Browser rendering: the preset's fallback target and the host backing the selector targeters; renders into `#app` (or a passed root) and bridges events via `eventMap`. |
| `ShadowRootViewTarget`      | `@ndigo/view-webcomponent` | An element's (open) shadow root        | Shadow-DOM rendering: attaches/reuses an open shadow root on a host element and renders into it; throws on a closed shadow root.                                       |
| `IframeViewTarget`          | `@ndigo/view-webcomponent` | A same-origin `<iframe>`'s document    | Isolated rendering: renders into an iframe's document (empty iframe, `srcdoc`, or same-origin `src`); throws on cross-origin/sandboxed frames.                         |
| `MemoryViewTarget`          | `@ndigo/test`              | An in-memory capture                   | Tests: captures the last rendered output + model with no real DOM or socket; used by `bootWebApp`/`MockWebClient`.                                                     |
| `DOMViewTarget` (interface) | `@ndigo/view-webcomponent` | A DOM surface that also bridges events | Implement when a target renders into the DOM **and** forwards surface events.                                                                                          |

Constructors:

```ts
// Node — usually provided by the platform; construct manually only for tests/custom hosts
import { HTTPResponseViewTarget } from '@ndigo/platform-node';
const target = new HTTPResponseViewTarget(response);

// Browser — root is an element or an id (with or without '#'); defaults to '#app'
import { DOMElementViewTarget } from '@ndigo/view-webcomponent';
const target = new DOMElementViewTarget(root, { eventMap: { submit: 'form:submit' } });

// Test — captures rendered output for assertions
import { MemoryViewTarget } from '@ndigo/test';
const target = new MemoryViewTarget();
// app.viewTarget.lastRender?.model / .output
```

### 7.3 Custom targets

For a surface the built-ins do not cover (a stream, a non-DOM host, or another
custom destination), implement `ViewTarget` (or `EventBridgeViewTarget`).
Shadow-DOM and iframe surfaces are already covered by `ShadowRootViewTarget` and
`IframeViewTarget` (section 7.2):

```ts
import type { ViewTarget } from '@ndigo/view';
import type { Route } from '@ndigo/router';

class StreamViewTarget implements ViewTarget {
    constructor(private readonly sink: WritableStream) {}
    prepare(_route: Route) {}
    async commit(output: unknown, _model: unknown, _route: Route) {
        if (output instanceof Uint8Array) await this.sink.getWriter().write(output);
    }
    clear() {}
}
```

Register it as the `VIEW_TARGET` token in the context so the dispatcher and views
resolve it the same way they resolve the built-ins:

```ts
context.setValue(VIEW_TARGET, new StreamViewTarget(sink));
```

Guidelines for a custom target:

- `prepare` must be idempotent and safe to call before every render.
- `commit` must handle the output type the engine produces (DOM node, string,
  bytes) and degrade gracefully when it does not match.
- `clear` must not throw; it runs on error paths too.
- Implement `EventBridgeViewTarget` only if the surface emits events that should
  reach the application layer; otherwise the base interface is enough.

### 7.4 Testing with targets

- Use `MemoryViewTarget` (via `bootWebApp`/`MockWebClient`) to assert on rendered
  model/output without a real DOM.
- Give one result its own target with `new ModelAndView('page', model, { viewTarget })`
  when a suite needs a second capture buffer — the explicit target wins over the
  app's chain and fallback, so no test-only configuration is needed. The handler
  signature is unchanged; production code keeps using the app target.
- Use a real `DOMElementViewTarget` in a jsdom suite only when you need to assert
  on actual DOM structure or event bridging.
- On Node, `MockHTTP` exercises the full `HTTPResponseViewTarget` contract
  in-process, including headers, status, and interceptor denials.
- A test that boots an app with `viewTargeters` should assert either the region
  it targets or an explicit result target — a chain that redirects output leaves
  the app's default target empty, which `MockWebClient` reports as "no view was
  rendered".

### 7.5 Targeting by view name, route, or attribute

`@ndigo/view-webcomponent` ships three targeters over one selector engine
(`SelectorViewTargeter`):

| Targeter                | Chooses by                                   | Typical use                                                |
| :---------------------- | :------------------------------------------- | :--------------------------------------------------------- |
| `NameViewTargeter`      | the logical view name                        | named regions: `shell` → `#app`, `footer` → `#site-footer` |
| `RouteViewTargeter`     | the route path against URL-glob patterns     | page-level layout: `/report/**` → `#sidebar`               |
| `AttributeViewTargeter` | a route attribute (default key `viewTarget`) | one route redirecting output without a code change         |

```ts
@entry()
viewTargeters() {
    return [
        // 1. named regions — the name is a lookup key, never selector text
        new NameViewTargeter({ shell: '#app', footer: '#site-footer' }),
        // 2. page layout — patterns are matched in declaration order
        new RouteViewTargeter({ '/report/**': '#sidebar', '/': '#app' }),
    ];
}
```

The chain is **ordered and first-match-wins**: put the most specific entry
first; the generic catch-all, if any, last. Neither targeter knows about the
other, so a layout change is a one-line edit in configuration, not a controller
change.

Guidelines:

- **The map form is the safe form.** `NameViewTargeter({ footer: '#site-footer' })`
  treats the view name as a key; an unmapped name declines. The function form
  (`NameViewTargeter(idSelector)` for the `view "hello"` → `#hello` convention)
  must escape request-derived values — `idSelector` uses `CSS.escape`.
- **Selectors must come from static configuration.** A selector derived from
  request data must be escaped (`CSS.escape`) before interpolation; a malformed
  selector is caught, logged at debug, and declined rather than failing the
  render.
- **A missing or detached element declines.** The chain falls through to the
  next targeter (or the fallback), so an unrendered region never breaks routing.
  `isConnected` is checked when the target is created; a DOM target is cached
  per `selector + mount` pair and reused until evicted or the app is destroyed.
- **Targeters select destination, not representation.** Do not encode
  negotiation logic in a targeter; that is a resolver's job (§5).
- **Mounts:** all three accept `{ mount: 'element' | 'shadow' | 'iframe' }` and an
  `eventMap`, delegating to `DOMElementViewTarget`, `ShadowRootViewTarget`, and
  `IframeViewTarget`.

### 7.6 Targets on Node

Node's destination is per-request, so the platform installs a single chain
entry, `ResponseViewTargeter`, through `NodeAutoConfiguration`:

```ts
// @ndigo/platform-node — registered automatically
@entry('viewTargeter')
viewTargeter() {
    return new ResponseViewTargeter();
}
```

The targeter wraps the `ServerResponse` the HTTP adapter stored on the route,
so `ModelAndView('report')` still becomes an HTTP response with no app
configuration — the chain is behavior-preserving, not a behavior change. Order
still applies: an explicit `ModelAndView.viewTarget` wins over it, which is how
streaming transports and tests redirect selected renders, and a route attribute
wins too.

Node-only result shapes never construct a target at all. `ResponseEntity`
values, producing views (`renderTo`), plain JSON returns, and a `ModelAndView`
with neither a view nor a name are complete documents written before the shared
pipeline runs. That keeps the platform branches free of targeting overhead.

### 7.7 Defaults

| Layer                                       | Default chain            | Fallback when no targeter matches                      |
| :------------------------------------------ | :----------------------- | :----------------------------------------------------- |
| `ABSTRACT dispatcher` (`@ndigo/dispatcher`) | `[]` — opt-in            | the registered `VIEW_TARGET`                           |
| Browser (`createWebApplication`)            | `[]` — opt-in            | the `#app` (or `root`) target registered by the preset |
| Node (`NodeAutoConfiguration`)              | `[ResponseViewTargeter]` | the per-request `HTTPResponseViewTarget`               |

Browser apps are opt-in by design: the preset's registered root target is
already the destination, so a default chain entry would have to move existing
renders to justify itself. Node is behavior-preserving by default because its
old pipeline always wrote to the response.

The chain itself comes from the context: `viewTargeters` (an array) wins over
`viewTargeter` (a single instance) which wins over the platform default. Keep
one of them per context — the collection form is the documented one.

### 7.8 Themes

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
- **A targeter changes the destination, not the representation.** If a route
  renders the wrong format, fix the resolver chain, not the targeter.
- **A redirecting chain leaves the default target empty.** That is correct — the
  output went elsewhere. Assert the region (or the explicit target), not the
  fallback.

## See also

- [Guide 01 — Building a Node API](01-building-a-node-api.md) — the handler/render loop
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — DOM view targets
- [Guide 08 — Errors & Problem Details](08-errors-and-problem-details.md) — 406 and error views
- [Guide 17 — Internationalization & Content](17-i18n-and-content.md) — locale in templates
- [Guide 29 — Signals & Islands](29-signals-and-islands.md) — island hydration
- [Guide 41 — Custom View Engines](41-custom-view-engines.md) — adding React/Vue or a bespoke renderer
- [`@ndigo/view`](../../packages/ndigo-view/README.md) — the view, targeter, and negotiation surface
- [`@ndigo/view-webcomponent`](../../packages/ndigo-view-webcomponent/README.md) — the selector-backed targeters and DOM targets
- [`@ndigo/platform-node`](../../packages/ndigo-platform-node/README.md) — `ResponseViewTargeter` and the Node render pipeline
- and — the view model and resolution strategy
