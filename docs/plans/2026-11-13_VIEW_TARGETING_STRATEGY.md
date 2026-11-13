# View Targeting Strategy — centralized placement for view rendering

**Date:** 2026-11-13
**Status:** Implemented (review incorporated)
**Tracks:** AD-65 (view resolution), AD-89 (layer boundaries), [AD-105](../decisions/2026-11-13_AD105_VIEW_TARGETING_STRATEGY.md) (decision record)

> **Implementation note:** the targeting depth was split out of guide 09 into
> [guide 50 — View Targeting](../guides/50-view-targeting.md) during
> implementation. Guide 09 keeps the basics (target contract, placement
> precedence, defaults); guide 50 owns the placement models, the targeter
> chain, safety rules, ownership, and the Node specifics. The walkthrough
> below is otherwise as implemented.

---

## 1. Problem

Ndigo centralizes **what** renders (view resolvers: name → `View`) but not
**where** it renders. Every dispatch writes into one destination:

```ts
// packages/ndigo-dispatcher/src/dispatcher.ts:268
const viewTarget = this.applicationContext.getValue(VIEW_TARGET);
await view.render(mv.model, route, viewTarget);
```

`VIEW_TARGET` holds a single instance, registered once at bootstrap
(`packages/ndigo-platform-web/src/web-application.ts:165,173`). Consequences:

- A multi-region layout (shell + sidebar + footer, or a dashboard of panes)
  cannot be expressed declaratively. Views must construct child targets and
  render sub-views imperatively — the decentralized default the request
  describes.
- Placement is invisible to the application context: there is no `viewTargeter`
  chain analogous to `viewResolver`, so an app cannot say "view `footer` goes
  to `#site-footer`" without the controller or the view knowing about the DOM.
- The render pipeline is duplicated on Node with a hard-coded target
  (`packages/ndigo-platform-node/src/node-dispatcher.ts:44`), so any targeting
  feature would have to be built twice.

### 1.1 Evidence from the examples

| Signal                                           | Count | Source                                           |
| :----------------------------------------------- | ----: | :----------------------------------------------- |
| `new ModelAndView('<name>')` (resolver path)     |    36 | `apps/*/src/**/*controller*.ts`                  |
| `new ModelAndView(new <View>())` (realized view) |     1 | `apps/01-ndigo-hello/src/hello-controller.ts:14` |
| plain-object returns (JSON path)                 |    65 | `apps/*/src/*controller*.ts`                     |
| apps configuring `viewResolver`                  |     8 | apps 05, 07, 08, 12, 13, 14, 18, 21              |

Resolvers are used, but only for _representation_ selection (EJS vs component
vs JSON). **Zero examples configure a target**, because until now there was
nothing to configure — the root target is implicit. That is the asymmetry: one
centralized concept (resolvers) and one hard-coded one (targets).

### 1.2 Defects found during analysis

These are in scope, because "the dispatcher does not do unnecessary work" is a
stated requirement.

1. **`ModelAndView` populates `viewName` from `AbstractView.name`, but no shipped
   view sets `name`.**
   `model-and-view.ts:56-58` assigns `this.viewName = view.name` for
   `AbstractView` instances. `WebComponentView`, `IslandView`, `EJSView`, and the
   serializing views never assign `name`, so at runtime `viewName` is
   `undefined` while its declared type is `string | null`. The realized-view
   fast path works **by accident** (`undefined` is falsy) and the type is
   violated. Any view that did set `name` would be silently re-resolved,
   discarding the instance the handler built.

2. **`hasView` is wrong for a null view.**
   `model-and-view.ts:36-38` uses `typeof this.view !== 'undefined'`, which is
   `true` for `null` (`typeof null === 'object'`). A `ModelAndView` with
   `view: null` and no `viewName` therefore reports `hasView === true`,
   defeating `_applyDefaultViewName` (`dispatcher.ts:348`) and the "missing"
   branch of the fast path. Fix: `this.view != null`.

3. **A bare `View` return is not recognized.**
   `likeView` exists (`packages/ndigo-view/src/like-view.ts`) but the dispatcher
   never calls it. On Node, `return new WebComponentView('x')` (not wrapped in
   `ModelAndView`) falls into the JSON branch and is serialized as JSON. The
   "fully realized view out of the controller" path only works if the handler
   also wraps it.

4. **Node builds the target before deciding it needs one.**
   `node-dispatcher.ts:44` constructs `HTTPResponseViewTarget` unconditionally,
   before the `ResponseEntity`, `ProducerView`, and JSON early returns.

5. **Node re-implements the whole render pipeline**
   (`node-dispatcher.ts:42-124`): language, resolution, context injection,
   producer handling, JSON fallback, and render. Two pipelines means two places
   to add targeting, two places to get precedence wrong.

---

## 2. Design

### 2.0 Two render models — both supported, on purpose

The framework must support both and say so, because the choice is architectural
rather than stylistic.

**Decentralized** — the handler owns the view and/or the destination:

```ts
return new ModelAndView(new WebComponentView('hello-app'), model); // realized view
new ModelAndView('footer', model, { viewTarget: new DOMElementViewTarget(el) }); // programmatic target
```

**Centralized** — the handler names the result; configuration decides the
representation and the destination:

```ts
// controller
return new ModelAndView('footer', model);

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

Decision guide (goes into the concepts guide verbatim):

- **Centralized** when the destination is part of the app's _structure_ —
  regions, layouts, shells, dashboards. The handler should not know the DOM.
- **Decentralized** when the destination is intrinsic to the _result_ — a
  stream, an iframe created for that render, a captured test buffer — or when a
  view genuinely owns a sub-layout it composes itself.
- **Mixed** is expected: centralized region selection at the top, decentralized
  composition inside a region.

Critically, the fast paths in §2.4 make the decentralized choice _cheap_: a
realized view skips the resolver chain, and an explicit target skips the
targeter chain. Supporting both models must not tax the other.

### 2.1 The contract

`ViewTargeter` mirrors `ViewResolver` and lives in `@ndigo/view` beside
`view-target.ts` (platform-neutral; only the implementations are not).

```ts
// packages/ndigo-view/src/view-targeter.ts
import type { Route } from '@ndigo/router';
import type { View } from './view.js';
import type { ViewTarget } from './view-target.js';

/** Everything a targeter may inspect to choose a destination. */
export interface ViewTargetingContext {
    /** The route being rendered. */
    readonly route: Route;
    /** The logical view name, when the result carried one. */
    readonly viewName: string | null;
    /** The resolved view instance, when available. */
    readonly view: View | null;
    /** The model passed to the view. */
    readonly model: unknown;
    /** The negotiated language (AD-19). */
    readonly language: string;
}

/** Chooses the destination for one render pass. */
export interface ViewTargeter {
    /**
     * Resolves the target for the given render pass.
     *
     * @returns The target, or `null` to defer to the next targeter.
     */
    resolveViewTarget(context: ViewTargetingContext): Promise<ViewTarget | null> | ViewTarget | null;
}
```

`null` means **decline** (not "no target"), matching
`ViewResolver.resolveViewName` exactly.

Also in `@ndigo/view` (platform-neutral, no DOM):

```ts
/** Ordered chain; first non-null target wins. */
export class ViewTargeterComposite implements ViewTargeter {
    constructor(readonly viewTargeters: ViewTargeter[] = []) {}
    async resolveViewTarget(context: ViewTargetingContext): Promise<ViewTarget | null> {
        for (const targeter of this.viewTargeters) {
            const target = await targeter.resolveViewTarget(context); // handles sync + async
            if (target) return target;
        }
        return null;
    }
}

/** Always returns the same target (tests, single-surface apps). */
export class FixedViewTargeter implements ViewTargeter {
    constructor(readonly target: ViewTarget) {}
    resolveViewTarget(): ViewTarget {
        return this.target;
    }
}

/** Structural guard used to validate runtime-supplied targets. */
export const likeViewTarget = (value: unknown): value is ViewTarget =>
    like({ prepare: Function, commit: Function, clear: Function })(value); // like from '@ndigo/util/types'
```

`await` normalizes both sync and async targeters — do **not** use
`instanceof Promise`, which fails across realms and adds nothing.

`ViewTargeterComposite` mirrors `ViewResolverComposite`
(`packages/ndigo-view/src/view-resolver.ts:404-465`): same ordering semantics,
same `no-await-in-loop` suppression.

### 2.2 Built-in implementations

**Browser — `@ndigo/view-webcomponent`** (owns `DOMElementViewTarget`,
`ShadowRootViewTarget`, `IframeViewTarget`):

| Targeter                | Input it reads                                     | Example                          |
| :---------------------- | :------------------------------------------------- | :------------------------------- |
| `SelectorViewTargeter`  | a selector-producing function + mount mode         | the engine for the three below   |
| `NameViewTargeter`      | `context.viewName` against a map **or** a function | `{ hello: '#hello' }` → `#hello` |
| `RouteViewTargeter`     | `context.route.path` via `URLGlobPathMatcher`      | `/dashboard/**` → `#dashboard`   |
| `AttributeViewTargeter` | `context.route.attributes[key]`                    | set by a handler or interceptor  |

`NameViewTargeter` accepts a map or a function, so the convention case needs no
extra class. A `idSelector` helper makes the safe form the short form:

```ts
new NameViewTargeter({ footer: '#site-footer' }); // explicit map — safe default
new NameViewTargeter(idSelector); // (name) => `#${CSS.escape(name)}`
```

`RouteViewTargeter` uses `PathMatcher` / `URLGlobPathMatcher` from
**`@ndigo/core`** (`packages/ndigo-core/src/path-matcher.ts`) — the same matcher
`PatternsRouteCondition` and `AbstractHandlerMapping` use. `@ndigo/router` does
_not_ own a path matcher; it imports this one from core. `@ndigo/core` is
already a dependency of `@ndigo/view-webcomponent`, so no manifest change.

**Selector robustness:** a selector function may throw (including
`SyntaxError` from `querySelector` on a malformed selector). The selector
resolver catches **any** thrown error, logs at debug level, and returns `null`
(decline) — a buggy targeter must never fail the whole render. Function-form
selectors escape with `CSS.escape`; `idSelector` exists so users do not have to
remember.

**Node — `@ndigo/platform-node`:**

| Targeter               | Behavior                                                              |
| :--------------------- | :-------------------------------------------------------------------- |
| `ResponseViewTargeter` | returns `new HTTPResponseViewTarget(getNodeResponse(route))` per call |

Targeting **does exist on Node**, but it means _how/where output is written_, not
_which DOM node_. Node has one surface per request, so its built-in chain is a
single per-request targeter. The same hook gives users `MemoryViewTarget` in
Node tests, a file/stream target in build tooling, and future non-HTTP
transports (SSE, CLI, MCP tool results) without forking the dispatcher.

### 2.3 Dispatcher precedence

`AbstractDispatcher.render` gains one private step (`_resolveViewTarget`) with a
strict, short-circuiting order:

```
1. mv.viewTarget                                   → validate, use, stop
2. route.attributes[VIEW_TARGET_ATTRIBUTE]         → validate with likeViewTarget, use, stop
3. this.viewTargeters (context chain, in order)    → first non-null, stop
4. getFallbackViewTarget(route)
     web  → context.getValue(VIEW_TARGET)          (byte-identical to today when the chain is empty)
     node → new HTTPResponseViewTarget(res)
```

- Steps 1–2 **never touch the chain**, and reject a non-`ViewTarget` value
  (debug log, then continue) so a stray string can never reach `querySelector`.
- Step 3 is skipped entirely when `viewTargeters` is empty — and the
  `ViewTargetingContext` object is **only allocated inside step 3**, so the
  default web chain does zero extra work per render.
- `VIEW_TARGET` keeps its exact current meaning: the fallback destination.

Targeting runs **after** view resolution, so `context.view` is populated.
Targeters choose _destination_, never _representation_; the docs say so
explicitly so nobody expects targeter-driven view selection.

### 2.4 Result classification and fast paths

Two layers, and the platform boundary matters:

**Platform results (Node only, before `super.render`):** `ResponseEntity`, a
bare `ProducerView`, a non-`ModelAndView` value (JSON), and `ModelAndView` with
neither view nor name (JSON fallback). These never resolve a view or a target.
The guard for the JSON branch gains `&& !likeView(mv)` so a realized view is not
serialized.

**Shared pipeline (both platforms, inside `render`):**

| Result                              | View resolution                      | Target resolution                                                         |
| :---------------------------------- | :----------------------------------- | :------------------------------------------------------------------------ |
| `ModelAndView` with `view` set      | **none** (fast path)                 | chain unless explicit                                                     |
| `ModelAndView` with `viewName` only | resolver chain                       | chain unless explicit                                                     |
| `ModelAndView` with neither         | `NoViewFoundError`                   | —                                                                         |
| bare `likeView` (non-producer)      | **none** — normalized, then rendered | chain unless explicit                                                     |
| resolved `ProducerView`             | —                                    | **none** if `renderDocument` handles it; otherwise render into the target |

The last row is why the classifier cannot be universal: `EJSView` and
`AbstractSerializingView` are producers _and_ fragment views.
`AbstractTemplateView._renderView` renders into a target
(`packages/ndigo-view/src/view.ts:207-212`), so on the web a resolved producer
**must** fall through to `view.render(...)`. Node overrides `renderDocument` and
returns `true`; the base default returns `false`.

`renderDocument` default:

```ts
/** Produces a whole document; `false` = fall through to fragment rendering. */
protected async renderDocument(_view: ProducerView, _model: unknown, _route: Route): Promise<boolean> {
    return false;
}
```

**Normalization point.** `likeView` returns are normalized at the **top of
`render`**, not in `dispatch()`: interceptors in `postHandle` must keep seeing
the raw handler result, and `_applyDefaultViewName` must keep its current
`ModelAndView`-only behavior. Node's `_renderPlatformResult` runs _before_
normalization, so a bare producer still takes the document branch.

Two related fixes fall out:

- **A realized view is authoritative.** `render` prefers `mv.view` over
  `mv.viewName`, so a handler-built view is never re-resolved even if a caller
  assigned both. `ModelAndView` assigns `viewName = null` (not `undefined`) for
  realized views.
- **`hasView` is corrected** to `this.view != null` (§1.2 #2).

**Resolver-owned instances.** `#resolvedViews` is populated only on the
`viewName` path. A handler that returns a `ModelAndView` wrapping a
resolver-owned singleton is _not_ tracked, so the dispatcher may destroy it when
the next view replaces it. Fix by convention, not by a flag: **return the name,
not the instance, when the view is resolver-owned.** The guide states this, and a
test pins the destroy-exemption to dispatcher-resolved views only.

### 2.5 Target ownership and lifecycle

A target is stateful (`DOMElementViewTarget` holds listeners and a `destroyed`
flag), so ownership must be explicit:

- **The targeter owns what it creates.** The dispatcher uses a target and never
  calls `clear()`/`destroy()` on it.
- **Cached targets are created once per destination.** `SelectorViewTargeter`
  memoizes `selector + mount → target` in a bounded map keyed by **both**
  selector and mount mode.
- **`SelectorViewTargeter` stores `#applicationContext`.** Cached targets are
  created lazily, so a context set before the first render must be applied to
  _future_ targets — forwarding alone is not enough.
- **Eviction must destroy.** A bounded cache that drops a DOM target without
  calling `destroy()` leaks its listeners. `BoundedCache` gains an optional
  `onEvict` callback (additive, non-breaking), and the targeter destroys
  evictable targets. `destroy()` on the targeter destroys every cached target
  and clears the map.
- **Detached hosts.** At creation, an element-based target whose host is not
  `isConnected` is treated as a miss and the chain continues. Post-creation
  removal is documented as the caller's responsibility (an app that removes its
  own mount point has a larger problem than targeting).
- **Per-request targets are not cached.** `ResponseViewTargeter` returns a fresh
  `HTTPResponseViewTarget`; nothing to destroy.
- **A missing selector is a decline, not an error.** A typo degrades to the
  fallback target; it must not break routing.

**Security rule, enforced:** selector strings come from **static configuration
only**. `ModelAndView.viewTarget` and `VIEW_TARGET_ATTRIBUTE` carry a
`ViewTarget` instance, validated with `likeViewTarget` — never a selector
string. Map-form `NameViewTargeter` keys are safe (the view name is a lookup key,
not interpolated); the function form is documented only with `CSS.escape` /
`idSelector`.

### 2.6 Node consolidation

The targeter hook is half the win; the duplicated pipeline is the other half.
`AbstractDispatcher` grows two protected seams and `NodeDispatcher.render`
collapses to "platform results first, then the shared pipeline":

```ts
// AbstractDispatcher
protected getFallbackViewTarget(route: Route): ViewTarget | null;
protected async renderDocument(view: ProducerView, model: unknown, route: Route): Promise<boolean>;

// NodeDispatcher
override async render(mv: ModelAndView, route: Route): Promise<void> {
    if (await this._renderPlatformResult(mv, route)) return;   // entity / producer / JSON
    return super.render(mv, route);                            // normalized inside the base
}
override protected getFallbackViewTarget(route: Route): ViewTarget | null {
    return new HTTPResponseViewTarget(getNodeResponse(route));
}
override protected async renderDocument(view, model, route) {
    await writeRenderResult(getNodeResponse(route), await view.renderTo(model, route));
    return true;
}
```

`_renderPlatformResult` preserves the Node-only behaviors exactly and **moves
target construction after them**:

- `ResponseEntity` → document (`ResponseEntityView`)
- bare `ProducerView` → document (`renderTo`)
- non-`ModelAndView`, non-view value → JSON document
- `ModelAndView` with no view and no name → JSON of `model` (Node divergence,
  kept and tested)

Explicit target on a Node result (e.g. `MemoryViewTarget`) still wins, so Node
tests observe through the same precedence the browser uses.

### 2.7 Strategy mixin and configuration

`packages/ndigo-dispatcher/src/strategies/view-targeter-strategy.ts`, modeled on
`AsViewResolverStrategy`:

```ts
export interface ViewTargeterStrategy {
    viewTargeters: ViewTargeter[];
    initViewTargeters(context: ApplicationContext): void;
}

const VIEW_TARGETER = 'viewTargeter',
    VIEW_TARGETERS = `${VIEW_TARGETER}s`,
    defaultViewTargeters: ViewTargeter[] = []; // fallback stays VIEW_TARGET
```

`initViewTargeters` does two things:

1. `initCollectionStrategy(context, 'viewTargeters', 'viewTargeter', …)` — so
   `viewTargeters` (array) beats `viewTargeter` (single) beats the default.
2. **Propagate the context** to every installed targeter that implements
   `setApplicationContext` (mirrors `ViewResolverComposite.setApplicationContext`).
   This makes manually assembled dispatchers work, not just the preset.

Ordering is policy: first non-`null` wins, so the guide states **most specific
first**. A catch-all last makes the `VIEW_TARGET` fallback unreachable —
`ResponseViewTargeter` is Node's per-request catch-all; `FixedViewTargeter` is
for tests and single-surface apps, not for Node's default chain.

Configuration surfaces:

```ts
// Any app configuration
@configuration()
class AppConfiguration {
    @entry() viewTargeters() {
        return [new NameViewTargeter({ footer: '#site-footer' }), new RouteViewTargeter({ '/report': '#sidebar' })];
    }
}

// Browser preset (also wires setApplicationContext + teardown)
const app = await createWebApplication([AppConfiguration], {
    viewTargeters: [new NameViewTargeter(idSelector)],
});
```

`createWebApplication` registers `options.viewTargeters` **before**
`dispatcher.initStrategies(context)` (the current order would make a
context-registered chain invisible) and destroys them in `app.destroy()`.
Context propagation itself happens once, in `initViewTargeters`.

Node ships `[new ResponseViewTargeter()]` from `NodeAutoConfiguration` as an
`@entry('viewTargeter')`, so the default Node app gains the shared pipeline
without configuration.

The preset asymmetry is deliberate: browser targeters are stateful (context for
event bridging, teardown), Node targeters are per-request and stateless — a
plain `@entry('viewTargeters')` is sufficient there, so
`createNodeApplication` gains no option.

### 2.8 Defaults — what ships in the chain

The rule: **a default belongs in the chain only when it reproduces behavior the
platform already hard-codes.** A default that _relocates_ rendering is a
migration wearing a default's clothes.

**View resolvers (audited, unchanged):**

| Scope      | Default chain                                      | Source                                    |
| :--------- | :------------------------------------------------- | :---------------------------------------- |
| base mixin | `[ImportViewResolver]`                             | `strategies/view-resolver-strategy.ts:28` |
| web        | `[LazyWebComponentViewResolver, NameViewResolver]` | `web-auto-configuration.ts:82`            |
| node       | `[IslandViewResolver]`                             | `node-auto-configuration.ts:408`          |

**View targeters (proposed):**

| Scope      | Default chain            | Rationale                                                                                                                              |
| :--------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| base mixin | `[]`                     | no platform primitive to reproduce                                                                                                     |
| web        | `[]`                     | `DOMElementViewTarget(root)` **is** the browser primitive and is already the fallback; a non-empty default would move existing renders |
| node       | `[ResponseViewTargeter]` | reproduces today's hard-coded `new HTTPResponseViewTarget(res)` exactly                                                                |

So "easy to get started" is satisfied by the **fallback**, not by a convention
in the chain: a zero-configuration app renders into `#app` / the response, which
is what it does today. The `#<name>` convention is one line of opt-in
(`new NameViewTargeter(idSelector)`).

**Resolver-parity finding (recommend, but separate):** Node's default omits
`NameViewResolver`, so a context-registered view name that resolves in the
browser does not resolve on Node — an asymmetry that makes a platform-neutral
resolver look browser-only. Recommend `[IslandViewResolver, NameViewResolver]`.
This is a **behavior change**, so it ships as its own commit and its own note.

---

## 3. Phases

Each phase is independently shippable and green. **Before P0:** search for the
tracking issue (`gh issue list --search "view targeter"`), then branch
`feat/<N>-view-targeting` in a worktree `ndigo-<N>-view-targeting`
(AGENTS.md §8).

### P0 — Contracts (`@ndigo/view`)

- `src/view-targeter.ts`: `ViewTargetingContext`, `ViewTargeter`,
  `ViewTargeterComposite`, `FixedViewTargeter`, `likeViewTarget`.
- `BoundedCache` gains an optional `onEvict` callback (additive).
- Export from `src/index.ts`.
- Tests: composite ordering, first-match-wins, sync + async targeters,
  all-decline → `null`, `likeViewTarget` accepts/rejects the right shapes,
  `onEvict` fires exactly once per eviction.
- Exit: `nx run @ndigo/view:test` green.

### P1 — Dispatcher strategy, precedence, fast paths (`@ndigo/dispatcher`)

- `src/strategies/view-targeter-strategy.ts` + mixin; `initViewTargeters`
  installs the chain **and** propagates `setApplicationContext`.
- `src/model-and-view.ts`: `viewTarget?: ViewTarget` constructor option
  (`new ModelAndView(view, model, { viewTarget })`), `viewName = null` for
  realized views, `hasView` → `this.view != null`.
- `src/context-tokens.ts`: `VIEW_TARGET_ATTRIBUTE` (already re-exported by the
  existing `export * from './context-tokens'`; add an import test).
- `src/dispatcher.ts`: `_resolveViewTarget` (lazy context, `likeViewTarget`
  validation on steps 1–2, empty-chain skip); `mv.view` before `mv.viewName`;
  `_normalizeResult` at the top of `render`; `renderDocument` default `false`;
  producer fall-through.
- Tests: the §2.4 table parameterized; spies proving the resolver is never
  called for realized views and the targeter is never called for explicit
  targets, producers, entities, or JSON; `viewTargeters` shadowing
  `viewTargeter`; `hasView` truth table; a handler-wrapped resolver-owned view
  is not added to `#resolvedViews` (documented ownership).
- Exit: dispatcher suite green; no behavior change for `ModelAndView('<name>')`.

### P2 — Browser targeters (`@ndigo/view-webcomponent`)

- `src/_selector-targets.ts`: bounded cache keyed by `selector + mount`, stored
  `#applicationContext`, `onEvict` destroy, `isConnected` check at creation.
- `src/selector-view-targeter.ts`, `name-view-targeter.ts` (map or function),
  `route-view-targeter.ts` (`URLGlobPathMatcher` from `@ndigo/core`),
  `attribute-view-targeter.ts`, `id-selector.ts`.
- `createWebApplication({ viewTargeters })`: register before strategy init,
  destroy on teardown. Default `[]`.
- Tests (jsdom): id/shadow/iframe mounting, missing/invalid/throwing selector →
  decline, route-pattern parity with `@routeMapping`, cache reuse (one target
  instance across renders), eviction destroys, destroy removes listeners,
  context stored before first render is applied to later targets.
- Exit: `@ndigo/view-webcomponent` and `@ndigo/platform-web` suites green.

### P3 — Node targeter and pipeline consolidation (`@ndigo/platform-node`)

- **First**: characterization tests for the four existing `NodeDispatcher.render`
  branches against the _current_ implementation.
- `src/response-view-targeter.ts`.
- `NodeAutoConfiguration`: `@entry('viewTargeter')`.
- Collapse `NodeDispatcher.render` onto the shared pipeline (§2.6); move
  `HTTPResponseViewTarget` construction after the platform branches; add
  `&& !likeView(mv)` to the JSON guard.
- Tests: JSON/entity/producer paths construct **no** target and never consult
  `viewTargeters`; `ModelAndView` + explicit `MemoryViewTarget` captures output;
  characterization suite stays green.
- Separate commit (pending review, §2.8): Node resolver parity —
  `[IslandViewResolver, NameViewResolver]`.
- Exit: full Node suite green; existing app tests unchanged.

### P4 — Examples

1. **`apps/08-ndigo-views` — the centralized demo.**
    - `index.html`: `<div id="app">`, `<aside id="sidebar">`, `<footer id="site-footer">`.
    - `views-app-configuration.ts`: register `viewTargeters` —
      `NameViewTargeter({ shell: '#app', footer: '#site-footer' })` and
      `RouteViewTargeter({ '/report': '#sidebar' })`.
    - `views-controller.ts`: **unchanged** — that is the point.
    - `test/views.spec.ts`: jsdom, await dispatch + animation-frame flush; assert
      `/widget` lands in `#site-footer`, `/report` in `#sidebar`, `/` in `#app`.
    - `README.md`: the three targeters, precedence, and why the controller did
      not change.

2. **`apps/01-ndigo-hello` — the decentralized demo.**
    - Keep the concrete view (teaching value) and extend the comment: a realized
      view bypasses the resolver chain; with no target it bypasses the targeter
      chain too.
    - Add a test asserting the resolver chain is never consulted.
    - `README.md`: the two-model callout — this app is the decentralized
      counterpart to app 08.

3. **`apps/05-ndigo-api` — Node.** README line: Node ships
   `ResponseViewTargeter`; `MemoryViewTarget` can be supplied per result in
   tests.

### P5 — Documentation

| File                                                         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/guides/00-core-concepts.md`                            | §3: new "Centralized and decentralized rendering" subsection with the §2.0 table and decision guide; targets are chosen per render (targeter chain → `VIEW_TARGET` fallback), not just "DOM on web / response on Node".                                                                                                                                                                                                                           |
| `docs/guides/09-views-and-content-negotiation.md`            | New §7.0 "Two ways to place a view" (the §2.0 table + decision guide); rewrite §7.1 to describe fallback + targeter chain; new §7.5 "Targeting by view name, route, or attribute" (ordering, "most specific first", `likeViewTarget`, `CSS.escape`/`idSelector`); new §7.6 "Targets on Node"; new §7.7 "Defaults"; extend §7.4 with `MemoryViewTarget` via `ModelAndView.viewTarget`; note that targeters select destination, not representation. |
| `docs/guides/02-building-a-browser-app.md`                   | `#app` is the _fallback_ region; additional regions are wired with targeters (link §7.5).                                                                                                                                                                                                                                                                                                                                                         |
| `docs/guides/21-component-integration.md`                    | Update "the Node adapter supplies an HTTP target; the browser supplies a DOM target" to include targeter selection.                                                                                                                                                                                                                                                                                                                               |
| `docs/decisions/2026-11-13_AD105_VIEW_TARGETING_STRATEGY.md` | New AD: context, evidence, decision (contract, precedence, defaults, ownership, Node), consequences, revisit trigger; records that both render models are supported and that AD-65 D-7 (`supportsTarget` / `TargetingViewEngine`) stays deferred, with `ViewTargetingContext` shaped for a future `supportsTarget(context)`.                                                                                                                      |
| `docs/decisions/README.md`                                   | Add AD-105.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `docs/plans/README.md`                                       | Add this plan.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Package READMEs                                              | `@ndigo/view` (targeter contract + `likeViewTarget`), `@ndigo/view-webcomponent` (built-in targeters + `idSelector`), `@ndigo/platform-node` (`ResponseViewTargeter`). Usage snippets only; API link unchanged.                                                                                                                                                                                                                                   |

### P6 — Validation

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm doc:api          # new public API → regenerate packages/*/api
pnpm manifest:check
graft build
```

---

## 4. Compatibility and risks

| Risk                                             | Assessment                               | Mitigation                                                                |
| :----------------------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------ |
| `mv.view` now beats `mv.viewName`                | Low — no shipped view sets `name`        | Document as a fix; precedence test                                        |
| `hasView` becomes false for `view: null`         | Low — that is the correct answer         | Truth-table test; `_applyDefaultViewName` test                            |
| `viewName` becomes `null` instead of `undefined` | Low — type already said `string \| null` | `hasView`/`toStringTag` tests                                             |
| Normalization changes what `render` accepts      | Low                                      | Interceptors still see the raw result; normalization only inside `render` |
| Cached DOM targets keep listeners alive          | Medium                                   | `onEvict` destroy, `Destroyable`, preset teardown, jsdom test             |
| Detached mount point                             | Low                                      | `isConnected` check at creation; post-creation removal documented         |
| Two routes target the same element               | Low — dispatches are sequential          | Last render wins (documented); `commit` reuses the matching child         |
| Node pipeline collapse changes an edge case      | **Highest**                              | Characterization tests first; four branches preserved byte-for-byte       |
| Selector injection via route attribute           | Low with enforcement                     | `likeViewTarget` validation + decline; strings only from static config    |
| Handler returns a resolver-owned instance        | Low                                      | Documented: return the name, not the instance; destroy-exemption test     |

---

## 5. Out of scope (explicit)

- **Multiplexing one dispatch into several regions.** Targeters choose _one_
  destination per render pass. A shell plus three panes in one dispatch needs a
  `CompositeView`/slot concept — separate design. The documented workaround (a
  view renders sub-views into child targets) stays.
- **Engine capability negotiation** (`supportsTarget` / `TargetingViewEngine`),
  deferred under AD-65 D-7.
- **A `@viewTarget` decorator.** Placement is configuration or an explicit
  result; a per-method decorator would add a third precedence rule.

---

## 6. Resolved decisions

| #   | Decision                     | Resolution                                                                                                                                               |
| :-- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Web default chain            | **Opt-in (`[]`)**; the fallback is the default. Node's `[ResponseViewTargeter]` is behavior-preserving and ships on.                                     |
| 1b  | Ordered arrays, first-wins   | **Yes.** `viewTargeters` beats `viewTargeter` beats the default; first non-`null` wins.                                                                  |
| 2   | `ModelAndView` API           | **Constructor option** `{ viewTarget }`; `viewName = null` for realized views; `hasView` fixed.                                                          |
| 3   | `RouteViewTargeter` matching | **`PathMatcher` / `URLGlobPathMatcher` from `@ndigo/core`** — the same matcher `PatternsRouteCondition` uses. `@ndigo/router` has no matcher of its own. |
| 4   | Node scope                   | **Full pipeline consolidation**, gated on characterization tests written first.                                                                          |

---

## 7. Review disposition

| #   | Review point                                | Disposition                                                                                                                                           |
| :-- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `hasView` null bug                          | **Accepted** — `this.view != null` (§1.2 #2).                                                                                                         |
| 2   | Classification platform-asymmetric          | **Accepted** — §2.4 split into platform results vs shared pipeline.                                                                                   |
| 3   | `renderDocument` default                    | **Accepted** — returns `false`; base falls through to fragment rendering.                                                                             |
| 4   | `likeView` wrapping location                | **Refined** — normalize at the top of `render`, not in `dispatch()`: `postHandle` must keep seeing the raw result. Node's platform result runs first. |
| 5   | `#resolvedViews` for handler-supplied views | **Accepted as documentation + test** (reviewer's stated minimum); an origin flag on the public result type is rejected as leaking internals.          |
| 6   | Propagate context to targeters              | **Accepted** — in `initViewTargeters`, once, covering manual dispatchers.                                                                             |
| 7   | Store `#applicationContext`                 | **Accepted**.                                                                                                                                         |
| 8   | Eviction leaks listeners                    | **Accepted** — additive `onEvict` on `BoundedCache`.                                                                                                  |
| 9   | Path matcher package                        | **Accepted** — `@ndigo/core`; §2.2 and decision #3 corrected.                                                                                         |
| 10  | `FixedViewTargeter` wording                 | **Accepted** — `ResponseViewTargeter` is the catch-all; `FixedViewTargeter` is tests/single-surface.                                                  |
| 11  | `ModelAndView` typing                       | **Accepted** — `viewTarget?` optional; `hasView` fixed.                                                                                               |
| 12  | Composite sync/async                        | **Partly accepted** — `await` normalizes both; `instanceof Promise` rejected (cross-realm, unnecessary).                                              |
| 13  | Runtime validation of attributes            | **Accepted** — `likeViewTarget`, decline + debug log.                                                                                                 |
| 14  | Selector function may throw                 | **Accepted** — catch any throw, decline.                                                                                                              |
| 15  | Escaping helper                             | **Accepted** — `idSelector` export; map form documented as the safe default.                                                                          |
| 16  | Cached target staleness                     | **Partly accepted** — `isConnected` at creation; post-creation removal documented.                                                                    |
| 17  | Lazy context allocation                     | **Accepted** — context built only inside a non-empty chain.                                                                                           |
| 18  | Ordering documentation                      | **Accepted** — targeters select destination, not representation.                                                                                      |
| 19  | Cache key + selector stability              | **Accepted** — key includes mount; stable-per-destination documented.                                                                                 |
| 20  | Node chain-not-consulted spy                | **Accepted**.                                                                                                                                         |
| 21  | `VIEW_TARGET_ATTRIBUTE` export              | **Accepted, already satisfied** — `export * from './context-tokens'`; add an import test.                                                             |
| 22  | README + `likeViewTarget`                   | **Accepted**.                                                                                                                                         |
| 23  | Web fallback byte-identical                 | **Accepted** — stated in §2.3.                                                                                                                        |
| 24  | app 08 async test                           | **Accepted** — jsdom + await dispatch + frame flush.                                                                                                  |
| 25  | AD-105 deferral note                        | **Accepted** — kept and expanded.                                                                                                                     |
