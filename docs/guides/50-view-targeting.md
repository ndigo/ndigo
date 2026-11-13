# Guide 50 — View Targeting

A view **target** is where output lands — a DOM element, an HTTP response, a
capture buffer; a view **targeter** is the strategy that chooses it for each
render pass. [Guide 09](09-views-and-content-negotiation.md) covers the target
contract and the dispatcher's precedence. This guide is the strategy in depth:
the two placement models, the ordered targeter chain, the built-in targeters
and their safety rules, how targets are cached and destroyed, and how Node and
the browser differ.

**Audience:** Browser and Node application developers · **Prerequisites:** [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) (view targets and the render pipeline) · **Reference app:** [apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views) (centralized placement), [apps/01-ndigo-hello](https://github.com/ndigo/ndigo/tree/main/apps/01-ndigo-hello) (decentralized placement)

## What you'll learn

- Choose between centralized and decentralized placement, deliberately.
- Compose an ordered `viewTargeters` chain and predict which entry wins.
- Use the name, route, and attribute targeters safely.
- Know how targets are cached, evicted, and destroyed.
- Rely on the platform defaults — and replace them when needed.

## 1. Two placement models

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
targeter chain. Supporting both models must not tax the other — see §7 for the
Node fast paths that guarantee it.

Reference demos: [apps/01-ndigo-hello](https://github.com/ndigo/ndigo/tree/main/apps/01-ndigo-hello)
is deliberately decentralized (one handler, one registered target, no chains);
[apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)
is centralized (three named regions plus a route-selected sidebar).

## 2. The targeter contract

`ViewTargeter` (from `@ndigo/view`) mirrors `ViewResolver`: it receives one
render pass and returns a target, or `null` to decline.

- `resolveViewTarget(context)` — choose the destination for this render.
  Returning `null` or `undefined` hands the decision to the next entry.

The dispatcher assembles the context per render pass:

| Field      | Meaning                                            |
| :--------- | :------------------------------------------------- |
| `route`    | the route being rendered                           |
| `viewName` | the logical view name, when the result carried one |
| `view`     | the resolved view instance                         |
| `model`    | the model passed to the view                       |
| `language` | the negotiated language                            |

Supporting pieces in `@ndigo/view`:

- **`ViewTargeterComposite`** — an ordered chain. The first non-`null` target
  wins and later targeters are not consulted; `await` normalizes sync and async
  targeters alike.
- **`FixedViewTargeter`** — always returns the same target. For tests and
  single-surface apps, not as a platform default: the registered `VIEW_TARGET`
  already plays the fallback role.
- **`likeViewTarget`** — the structural guard (`prepare` / `commit` / `clear`)
  the dispatcher uses to validate runtime-supplied targets.

```ts
import { FixedViewTargeter, ViewTargeterComposite } from '@ndigo/view';

const chain = new ViewTargeterComposite([new FixedViewTargeter(captureTarget)]);
```

`null` means **decline**, exactly like `ViewResolver.resolveViewName` — not
"render nowhere". A targeter that cannot decide is expected to say so.

## 3. Precedence and validation

A render pass resolves its destination in strict order — the first hit wins and
later steps are not consulted:

1. **`ModelAndView.viewTarget`** — an explicit target on the result. This is
   the decentralized path: the handler owns the destination.
2. **`route.attributes[VIEW_TARGET_ATTRIBUTE]`** — a target placed on the route
   by middleware or an interceptor, for per-dispatch decisions.
3. **The `viewTargeters` chain** — ordered, first non-`null` target wins.
4. **`getFallbackViewTarget(route)`** — the platform fallback: the registered
   `VIEW_TARGET` in the browser, a per-request response target on Node.

Steps 1–2 validate their value with `likeViewTarget`; a non-target value (the
dangerous near-miss is a selector string) is ignored and logged at debug rather
than failing the render. Step 3 does not allocate its context and does not run
at all when the chain is empty, so an app with no targeters pays nothing per
render. The fallback keeps its pre-targeter meaning exactly.

## 4. The built-in targeters

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
  `isConnected` is checked when the target is created.
- **Targeters select destination, not representation.** Do not encode
  negotiation logic in a targeter; that is a resolver's job ([Guide 09](09-views-and-content-negotiation.md) §4).
- **Mounts:** all three accept `{ mount: 'element' | 'shadow' | 'iframe' }` and
  an `eventMap`, delegating to `DOMElementViewTarget`, `ShadowRootViewTarget`,
  and `IframeViewTarget`.

## 5. Ownership, caching, and teardown

A target is stateful — `DOMElementViewTarget` holds event listeners and a
`destroyed` flag — so ownership is explicit:

- **The targeter owns what it creates.** The dispatcher renders into a target
  and never calls `clear()` or `destroy()` on it.
- **Targets are created once per destination and reused.**
  `SelectorViewTargeter` caches `selector + mount` → target in a bounded cache,
  so event bridging and rendered state survive across renders. Cache the
  selector text, not the request: a selector derived from unbounded request
  data would churn the cache.
- **Eviction must destroy.** The cache's eviction callback destroys the evicted
  target, releasing its listeners. `destroy()` on the targeter destroys every
  cached target and stops resolving.
- **The app destroys the chain.** `createWebApplication(...).destroy()` calls
  `destroyViewTargeters(...)`, which destroys every installed targeter that
  owns cached targets. A manually assembled app calls it directly.
- **Per-request targets are not cached.** `ResponseViewTargeter` returns a
  fresh `HTTPResponseViewTarget` per render; there is nothing to release.
- **Context propagation happens once.** `initViewTargeters` gives every
  installed targeter that implements `setApplicationContext` the application
  context — including targets created later, because `SelectorViewTargeter`
  stores it and applies it at creation.

## 6. Platform defaults and configuration

| Layer                                       | Default chain            | Fallback when no targeter matches                      |
| :------------------------------------------ | :----------------------- | :----------------------------------------------------- |
| `ABSTRACT dispatcher` (`@ndigo/dispatcher`) | `[]` — opt-in            | the registered `VIEW_TARGET`                           |
| Browser (`createWebApplication`)            | `[]` — opt-in            | the `#app` (or `root`) target registered by the preset |
| Node (`NodeAutoConfiguration`)              | `[ResponseViewTargeter]` | the per-request `HTTPResponseViewTarget`               |

The chain comes from the context, and the collection form is the documented
one: `viewTargeters` (an array) wins over `viewTargeter` (a single instance),
which wins over the platform default. Keep one of them per context.

```ts
// any configuration
@entry()
viewTargeters() {
    return [new NameViewTargeter({ footer: '#site-footer' })];
}
```

The browser preset registers `options.viewTargeters` **before** strategy
initialization — a context value set afterwards would be invisible:

```ts
import { createWebApplication } from '@ndigo/platform-web';
import { NameViewTargeter, idSelector } from '@ndigo/view-webcomponent';

const app = await createWebApplication([AppConfiguration], {
    viewTargeters: [new NameViewTargeter(idSelector)],
});
```

Browser apps are opt-in by design: the preset's registered root target is
already the destination, so a default chain entry would have to move existing
renders to justify itself. Node ships `[ResponseViewTargeter]` because its old
pipeline always wrote to the response — the chain is behavior-preserving there,
not a behavior change.

## 7. Targeting on Node

Node's destination is per-request, so the platform installs a single chain
entry through `NodeAutoConfiguration`:

```ts
// @ndigo/platform-node — registered automatically
@entry('viewTargeter')
viewTargeter() {
    return new ResponseViewTargeter();
}
```

The targeter wraps the `ServerResponse` the HTTP adapter stored on the route,
so `ModelAndView('report')` still becomes an HTTP response with no app
configuration. Order still applies: an explicit `ModelAndView.viewTarget` wins
over it, which is how streaming transports and tests redirect selected renders,
and a route attribute wins too.

Node-only result shapes never construct a target at all. `ResponseEntity`
values, producing views (`renderTo`), plain JSON returns, and a `ModelAndView`
with neither a view nor a name are complete documents written before the shared
pipeline runs. That keeps the platform branches free of targeting overhead.

## 8. Testing with targeters

- Boot with `bootWebApp([...configs])` and drive the real chain through
  `MockWebClient` or a direct `dispatcher.dispatch(route)`.
- **A redirecting chain leaves the app's default target empty** —
  `MockWebClient` reports "No view was rendered". That is correct; assert the
  region the chain targeted, or give the result its own target:
  `new ModelAndView('page', model, { viewTarget: capture })`.
- Precedence itself is testable without any platform: construct an
  `AbstractDispatcher`, set `viewTargeters` (plus a resolver) on the context,
  and assert which target the view received. The dispatcher's suite
  (`packages/ndigo-dispatcher/test/view-targeting.spec.ts`) is the executable
  precedence matrix: explicit > attribute > chain > fallback.
- On Node, `MockHTTP` exercises the response target end to end, including
  headers, status, and interceptor denials.

## See also

- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — targets, negotiation, resolvers
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — app wiring and DOM targets
- [Guide 41 — Custom View Engines](41-custom-view-engines.md) — adding React/Vue or a bespoke renderer
- [`@ndigo/view`](../../packages/ndigo-view/README.md) — the targeter contract and composite
- [`@ndigo/view-webcomponent`](../../packages/ndigo-view-webcomponent/README.md) — the built-in targeters and DOM targets
- [`@ndigo/platform-node`](../../packages/ndigo-platform-node/README.md) — `ResponseViewTargeter`
