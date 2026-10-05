# View Resolution Strategy — controllers return names, resolvers return views

**Date:** 2026-09-06
**Status:** Implemented (all decisions landed — see follow-ups; `blue-views` proves three resolvers/locations)

## Motivation

Controllers in the demo apps construct concrete views inline (`new WebComponentView('todo-app')`, `new StringTemplateView()`, `new EventStreamView()`) instead of returning view names for the dispatcher's resolver chain to handle. The framework already ports Spring's resolution pipeline (`ViewResolver`, caching/path-based/name/composite resolvers, ordered first-match chain), but no resolver understands component views, so the apps bypassed the concept. Outcome: controllers know view _types_ (WebComponentView, tags) instead of view _names_, and the view/model/controller decoupling the resolver exists to provide is unused.

Questions this plan answers:

1. Should controllers return view names, and should there be a `WebComponentViewResolver`? — **Yes.**
2. Do Island/SSE views need their own resolvers? — **Island: yes (server twin of the component resolver, and the controller↔client-view link). SSE: no (imperative, per-request state).**
3. Naming: per repo acronym convention, SSE's Spring `SseEmitter` analog is **`SSEEmitter`**.

## Findings

### Spring's contract

- Controllers return **logical view names**: `"order/list"`, `new ModelAndView("order/list", model)`, or no view at all (default name from request path/`RequestToViewNameTranslator`).
- `DispatcherServlet.render()` iterates the ordered `viewResolvers`; first non-null wins; none → `ServletException`.
- Resolver family: `InternalResourceViewResolver` (prefix/suffix/path), `BeanNameViewResolver` (name = Spring bean), `ContentNegotiatingViewResolver` (media-type negotiation over candidates), `AbstractCachingViewResolver` (cache keyed by name+locale).
- **Imperative exceptions stay in the handler**: `RedirectView`, `SseEmitter`, streaming bodies — constructed per request _with per-request state_, never resolved by name (`SseEmitterMethodReturnValueHandler` streams the handler-returned emitter directly).

### BlueJS today

- Pipeline parity exists: `AbstractDispatcher._resolveViewName` (ordered, first-match), `AbstractCachingViewResolver`, `ImportViewResolver` (prefix/suffix + dynamic `import`), `NameViewResolver` (name = context bean), `ContentNegotiationViewResolver`, `PathViewController` (route → view name), `DefaultRouteToViewNameTranslator` (view-less ModelAndView), `NoViewFoundError`.
- **Production gap:** no resolver produces component views. `WebAutoConfiguration` registers only `NameViewResolver`; `NodeAutoConfiguration` registers none (falls back to `ImportViewResolver`, which would `import('todo-app')` → MODULE_NOT_FOUND). So every demo constructs views inline:
    - `blue-todo`: 7× `new WebComponentView('todo-app'|'account-app')`
    - `blue-hello`: 1× `new WebComponentView('hello-app')`
    - `blue-island`: `StringTemplateView` (shell) + `EventStreamView` (`/events`)
- **Half-wired intent found in `blue-todo`:** `ToDoconfiguration` registers `MyTodoApp`/`AccountApp` **custom-element classes** as beans (`todoApp`, `accountApp`) plus a `NameViewResolver` — but element classes are not `View`s (no `render(model, route, target)` contract), so a `new ModelAndView('todoApp')` would resolve to a non-View and fail. The beans are dead for view resolution; controllers bypass them. The machinery for _bean-name_ resolution exists; what's missing is a resolver for _component_ views.
- The `@ViewMapping(name)` decorator metadata exists in `blue-view-webcomponent` (name stored on a class) — no consumer yet. Extension point, not prerequisite.

## Architecture clarification: View, ViewEngine, ViewTarget

BlueJS's rendering stack is a four-concern split; Spring conflates the first three. The plan builds on it, not against it:

| Concern     | BlueJS                                                                              | Role                                                                         | Spring analog                                 |
| ----------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
| Descriptor  | `View` (`WebComponentView`, `IslandView`)                                           | thin handle: tag/template/name                                               | the resolved View object                      |
| Lookup      | `ViewResolver` chain                                                                | `name → View`                                                                | `ViewResolver` chain                          |
| Technology  | `ViewEngine` (`render(view, model, target, route)`)                                 | owns the rendering format — element creation, DOM patching, template binding | fused into the View (JSP view renders itself) |
| Destination | `ViewTarget` (`DOMElementViewTarget`, `HTTPResponseViewTarget`, `MemoryViewTarget`) | the surface receiving output                                                 | absent                                        |

- **ViewEngine continues, formalized.** Today `WebComponentView` hardcodes the engine lookup by bean name (`webComponentViewEngine`) and `WebComponentViewEngine.render` rejects non-`WebComponentView` inputs — a 1:1 hardwire blocking a `ReactViewEngine`/`HandlebarsViewEngine` family. Formalization: engines declare support (`supports(view)` or technology key), a registry selects the engine, views stay thin descriptors. The chain ends `name → resolver → View`, then `View + engine → render → target`.
- **ViewTarget continues unchanged** — BlueJS's differentiator (test harnesses, node streams, browser nodes all via one surface abstraction).

### Web components: what the resolver does (and doesn't)

- `customElements.define` is a **module-load side effect** (`tagMapping` decorator, or manual top-level calls in app views) — components register themselves when their module loads. The browser's customElements registry is _runtime_, not registry; node has no such registry.
- The resolver therefore **maps, optionally loads — never registers**:
    - **Dictionary**: `name → class → TagMapping.get(class) → new WebComponentView(tag)`. `ViewMapping` metadata gives logical names independent of tags; `name === tag` (zero-config) remains the default.
    - **Eager**: app imports its component modules at bootstrap (today's Vite reality); resolver consults the metadata — no loading work.
    - **Lazy**: resolver holds module paths (ImportViewResolver prefix/suffix shape) and `import()`s on first resolution; the import's side effect defines the element; abstract caching caches the View. This is the code-splitting story.
- Generic `ImportViewResolver` (`new ViewClass()` on default export) stays for **plain View modules**; `WebComponentViewResolver` has its own loader for **component modules** (class → `TagMapping` → descriptor).

### Views in different locations — the complex example

| Location                                          | Resolver                   | Example route                                                         |
| ------------------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| Component module (self-registering element)       | `WebComponentViewResolver` | `'todo-app'` → class → `TagMapping` → `WebComponentView`              |
| Application context (registered View bean)        | `NameViewResolver`         | `'footer'` → plain View bean                                          |
| View module on disk (default export = View class) | `ImportViewResolver`       | `'report'` → `views/report-view.ts` (a `StringTemplateView` subclass) |

New demo app **`blue-views`** (browser, built on `WebAutoConfiguration`): routes `/`, `/report` (imported module view), plus a context-registered view composed into the shell; composite resolver `[WebComponentViewResolver, NameViewResolver, ImportViewResolver]` demonstrates first-match fall-through and three view locations. `blue-todo`/`blue-hello` adopt the component-name path separately.

## Decisions

### D1 — View names are the controller contract; component views get family resolvers

**Honest scope first:** for `name === tag`, `new WebComponentView(name)` needs no lookup at all — the resolver degenerates to construction + caching. The distinct logic exists only for the **name → tagName → module** mapping, and there are two viable shapes:

- **Configuration registry (chosen)**: `WebComponentViewResolver` takes an optional registry — `{ 'todo': './components/todo-app.ts' }` (lazy module path) or `{ 'todo': TodoAppClass }` (eager, class already imported) — and derives the tag via `TagMapping.get(cls)` (fallback: `${name}-app`-style convention only if the registry entry carries no metadata). No registry entry → `name === tag` construction (the zero-config default).
- **Context-bean alternative (zero new code, documented)**: register `WebComponentView` instances as beans and let the existing `NameViewResolver` resolve them — `@entry todoApp() { return new WebComponentView('todo-app'); }`. This is the config-bind path; the resolver class is the declarative replacement for that boilerplate.

**Why it is not Import or Name**: `ImportViewResolver` does `new ViewClass()` on a module's default export (the module _is_ the View); a component module's export is an `HTMLElement` class with no `render` contract — the resolver must extract the tag and build the descriptor instead. `NameViewResolver` resolves instantiated beans; it cannot wrap element classes (blue-todo's current dead beans prove it) — only pre-built `WebComponentView` beans, which is the boilerplate we're replacing.

**Loading modes**: **lazy is the default** — the resolver `import()`s the module on first resolution (Vite code-split point; the app's load-time story is a handful of eager shell imports + everything else on demand). The constructor accepts an eager registry (`name → class`) for the already-imported shell views. Components are never registered by the resolver — `customElements.define` is the module's own side effect.

New **`IslandViewResolver`** (in `blue-view`): same contract, resolves a name to `new IslandView(name)` — the server-rendered island marker. Node has no customElements registry, so island resolution is metadata/module-based (same name → tag mapping, rendered as SSR marker).

- **This is the controller↔client-view link**: one logical view name; browser dispatch resolves `'todo-app'` → live `WebComponentView`, node dispatch resolves `'todo-app'` → SSR `IslandView` + client hydration. The resolver is the platform-negotiation point, mirroring Spring's "same name, resolver picks representation."
- Caching comes free (`AbstractCachingViewResolver`): one `WebComponentView`/`IslandView` per name — these views are state-free (tag name only), so cached instances are safe; today every request builds a fresh one.
- Name ≠ tag is supported via the optional `viewNames` filter and, later, the existing `@ViewMapping` metadata (deferred, YAGNI — no consumer today).

### D2 — SSE is imperative: no resolver; rename to `SSEEmitter`

- `SSEEmitter` (renamed from `EventStreamView`, per the mixed-case acronym rule — cf. `HTTPTransformer`) carries per-connection state: the event source, the release/unsubscribe closures, the open response. It is Spring's `SseEmitter`: **handler-produced, not resolved by name**. A resolver would either leak state or force factories — worse than direct construction.
- **Handlers may return a `View` directly** (Spring `ViewMethodReturnValueHandler` parity): add a `likeView` structural guard in `blue-view` and a branch in `NodeDispatcher.render` — a non-`ModelAndView` return shaped like a View is rendered, not JSON-serialized. `return new SSEEmitter(events)` becomes the one-line `/events` endpoint.
- `StringTemplateView` shell in `blue-island` stays inline: page-level, one-off, imperative (documented exception, like a JSP page in Spring).

### D3 — Resolver registration (auto-configuration defaults, app-overridable)

- `WebAutoConfiguration.viewResolver`: `new NameViewResolver()` → `new ViewResolverComposite([new WebComponentViewResolver(), new NameViewResolver()])`. Component names first, arbitrary bean views second, `ImportViewResolver` semantics unchanged (dynamic-import resolver remains available when explicitly configured).
- `NodeAutoConfiguration`: add `viewResolver` entry = `new IslandViewResolver()` (replaces the implicit `ImportViewResolver` default for node apps; unresolvable names still 404 via `NoViewFoundError`).
- ViewEngine **continuation (formalization)**: keep `ViewEngine.render(view, model, target, route)`; add engine capability selection (`supports(view)`) so views stop hardcoding the `webComponentViewEngine` bean name and a `ReactViewEngine`/`HandlebarsViewEngine` family can coexist. Note: WebComponentViewEngine's job is not library loading (Web Components are browser-native) but element reuse across renders, model transport, DOM-event → app-event bridging, and lifecycle wiring. **This is a separate, follow-on slice** (engines exist and work today via the named lookup; the registry is an evolution, not a prerequisite for the resolvers).
- ViewTarget: keep; **not required for every engine** — engines negotiate via `supportsTarget` (see D7). Single `DOMElementViewTarget` stays for this slice; target family is follow-on.

### D4 — Complex demo: `blue-views`

New browser app demonstrating **three resolvers, three view locations, one composite**:

| Location                                                                                       | Resolver                                                                     | Route                                   |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| Component module (self-registering element)                                                    | `WebComponentViewResolver` (eager metadata registry)                         | `/` → `'todo-app'`                      |
| Application context (registered View bean)                                                     | `NameViewResolver`                                                           | composed shell footer → `'footer'` bean |
| View module on disk (`views/report-view.ts` default-exporting a `StringTemplateView` subclass) | `ImportViewResolver` (`prefix: 'views/', suffix: '-view'` or full specifier) | `/report` → `'report'`                  |

`viewResolver` entry: `new ViewResolverComposite([WebComponentViewResolver, NameViewResolver, ImportViewResolver])`; a known-unsupported name (e.g. `'nope'`) proves chain fall-through to 404. Reuses `WebAutoConfiguration` (argument resolvers, engines, targets) — the app configuration only adds the composite resolver, the view bean, the routes, and the component module.

### D5 — Demo migrations

- **`blue-todo`** (the rich example): controllers return `new ModelAndView('todo-app')` / `new ModelAndView('account-app')`; inline `WebComponentView` constructions deleted; **drop the redundant `viewResolver` + `webComponentViewEngine` entries** (identical to `WebAutoConfiguration` defaults — only `handlerMapping` [logging interceptor] and `viewTarget` are app-specific); **remove the dead `todoApp`/`accountApp` element-class beans** (zero consumers — the module imports stay, their `customElements.define` side effect is the registration); **migrate component modules to `@TagMapping`** for metadata consistency with the resolver.
- **`blue-hello`** (the simple example): **keeps `new WebComponentView('hello-app')` intentionally** — the documented "concrete view is always an option" sample (code comment pointing at the name alternative). Its hand-rolled bootstrap is replaced by `ApplicationBuilder([WebAutoConfiguration, HelloConfiguration])`, keeping only the app-specific `viewTarget` (`#app`) + controller (the `handlerMapping`/`viewResolver`/`webComponentViewEngine` entries are identical auto-config defaults).
- **`blue-island`**: `/events` becomes `return new SSEEmitter(events)` (direct View return); shell untouched. Island-by-name adoption (`ModelAndView('todo-app')` → `IslandView`) is available via `NodeAutoConfiguration` for future SSR routes — not forced onto the shell.

### D6 — String handler returns stay JSON

`return 'todo-app'` keeps its current scalar-JSON semantics (deliberate `NodeDispatcher` behavior). Spring's implicit "String = view name" is NOT adopted without a `@ResponseBody`-style opt-out; the documented name path is `new ModelAndView('todo-app')` (Spring's `new ModelAndView("order/list")`), which needs no dispatcher change.

### D7 — ViewTarget stays, becomes a negotiated family (not required for every engine)

- **Not every engine needs a target.** A pure-string/template engine renders to the response directly; the target is the destination abstraction _when_ the engine renders a live surface. Engines declare their needs: **`supportsTarget(target)`** capability, and resolution becomes `View + engine + compatible target` → render.
- **Target family** (extend the existing interface, add concrete members):
    - `ContainerViewTarget` — host element (today's `DOMElementViewTarget`) — React/Preact-style mounting
    - `ShadowRootViewTarget` — mount into (or create) the component's shadow root — component-as-container patterns (cf. Vue's `defineCustomElement`)
    - `DocumentViewTarget` / `IFrameViewTarget` — full-document and iframe surfaces
    - `HTTPResponseViewTarget` (node), `MemoryViewTarget` (tests) — existing
- **Context**: Spring never had this (whole-page renders; modern "partials" = Thymeleaf fragments + HTMX `hx-target` which are response/template concerns, not a pluggable surface). Other frameworks do: React `createRoot(container)`, Svelte `mount(Component, { target })`, Preact `render(vnode, container)`, Vue `app.mount(el)` (+ shadow-root mounts via custom elements). Web-component frameworks (Lit/Stencil) invert it — the element _is_ its own target. BlueJS's family accommodates both shapes.
- **This slice**: keep the single `DOMElementViewTarget` (it works); add the family + `supportsTarget` negotiation as **follow-on**, same track as the engine registry (both are engine-capability work, not resolver prerequisites).
- **Engine interface split** (follow-on, with the target work): `ViewEngine.render(view, model, route)` becomes the target-less base contract (destination = the route itself — the `SSEEmitter` precedent already renders this way, ignoring its target param); `TargetingViewEngine extends ViewEngine` adds `render(view, model, target, route)` for engines that render into a surface. Views negotiate with `likeTargetingViewEngine(engine)` (structural guard, mirroring `likeDOMViewTarget`) before passing the target. (`Targeted` was rejected as passive — it implies the engine is aimed, not that it renders into targets; `Aware` is reserved for the DI mixin family, cf. `AsApplicationContextAware`.) Precedent: `EventBridgeViewTarget extends ViewTarget`. Today there is exactly one engine and it is targeting — the split is a designed contract, not speculative implementation.

## Proposed API

```ts
// packages/blue-view-webcomponent/src/web-component-view-resolver.ts
export class WebComponentViewResolver extends AbstractPathBasedViewResolver {
    protected async _loadView(name: string): Promise<View> {
        return new WebComponentView(name);   // name === tag
    }
}

// packages/blue-view/src/island-view-resolver.ts
export class IslandViewResolver extends AbstractPathBasedViewResolver {
    protected async _loadView(name: string): Promise<View> {
        return new IslandView(name);
    }
}

// packages/blue-view/src/like-view.ts  (View-shaped structural guard)
export const likeView = (value: unknown): value is View =>
    isNotNil(value) && typeof value.render === 'function' && 'mediaType' in value;

// packages/blue-platform-node/src/sse-emitter.ts  (renamed from event-stream-view.ts)
export class SSEEmitter implements View {
    constructor(source: EventSource) { ... }   // instance carries the stream
    // render(model, route, target): headers flush + frame pump (unchanged behavior)
}
```

```ts
// NodeDispatcher.render — before the JSON-scalar branch
if (likeView(mv)) {
    await mv.render(mv.mediaType === null ? null : undefined, route, viewTarget);
    return;
}
```

## Implementation steps

1. `likeView` in `blue-view` + unit tests.
2. `WebComponentViewResolver` in `blue-view-webcomponent` + tests (resolution, caching, `viewNames` filter, non-matching name → null; eager metadata registry; lazy module-path loader).
3. `IslandViewResolver` in `blue-view` + tests.
4. Rename `EventStreamView` → `SSEEmitter` (`blue-platform-node`; update index export, `event-stream-view.spec.ts`, AD-09 doc, island demo).
5. `NodeDispatcher.render` direct-View branch + test (real HTTP: SSEEmitter returned directly).
6. `WebAutoConfiguration` composite resolver (`[WebComponentViewResolver, NameViewResolver]`); `NodeAutoConfiguration` `IslandViewResolver` entry.
7. Migrate `blue-todo` controllers to names; audit/remove dead element-class beans; drop `ToDoconfiguration.viewResolver` override.
8. `blue-island /events` → direct `SSEEmitter` return.
9. `blue-hello`: keep concrete view; add pointing comment.
10. **New demo app `blue-views`** (browser): `WebAutoConfiguration` + composite `[WebComponentViewResolver, NameViewResolver, ImportViewResolver]`; routes `/` (component name), `/report` (imported module view `views/report-view.ts`), context-bean footer view composed into the shell; a `'nope'` route proving chain fall-through. Tests: three resolutions + fall-through.
11. Docs: AD-09 follow-up amendment (SSEEmitter rename + imperative rationale); optional AD-10 recording this strategy.
12. `graft build` refresh.

**Follow-on (not in this slice):** engine capability negotiation — `ViewEngine`/`TargetingViewEngine` split (D7) + `supports(view)` registry selection (so engines stop being bean-name-hardwired and React/Handlebars engines coexist) **and** target negotiation (`supportsTarget`) with the target family (shadow-root, iframe, document targets). All are engine-capability work; none is a prerequisite for the resolvers.

## Testing strategy

- Resolvers: name → correct view class; cache returns same instance; language cache key; null for unsupported names (chain fall-through).
- `NodeDispatcher`: direct View return renders (SSE over real HTTP); scalar strings still JSON; `ModelAndView('name')` resolves through the chain (composite order: component resolver before name resolver before 404).
- `blue-todo` composed-runtime specs keep passing with identical rendered output (same tag, same model — resolution is a drop-in).
- `blue-island` spec: `/events` behavior unchanged after rename/direct return.
- Full suites: `pnpm vitest run packages/blue-view packages/blue-view-webcomponent packages/blue-platform-node packages/blue-platform-web apps/blue-todo apps/blue-island apps/blue-hello` + `pnpm lint` + prettier.

## Acceptance criteria

1. `blue-todo` controllers contain **zero** view-construction imports; they return names; rendered output byte-identical (same tags/models); `viewResolver`/`webComponentViewEngine` overrides removed; dead beans removed; components use `@TagMapping`. `blue-hello` builds on `WebAutoConfiguration`, registering only its view target + controller.
2. `WebComponentViewResolver` + `IslandViewResolver` resolve names to cached, state-free views; chain fall-through on unknown names; lazy loader imports + caches on first resolution.
3. `blue-hello` still constructs `WebComponentView` inline, with a comment marking it the intentional concrete-view sample.
4. `blue-views` renders all three routes: component name (WebComponentViewResolver), context bean (NameViewResolver), module-on-disk (ImportViewResolver); `'nope'` falls through the composite to 404.
5. `SSEEmitter` replaces `EventStreamView` everywhere (no stale export/import); `/events` returns it directly; SSE tests green.
6. Handler-returned Views render; scalar string returns still JSON.
7. Non-goals honored: no string-return view names, no engine registry (follow-on), no `ws`/WebSocket, no shell refactor.

## Non-goals / deferred

- Spring-style implicit String-as-view-name (needs `@ResponseBody`-like marker first).
- `@ViewMapping`-driven name→class registry (no consumer yet; `viewNames` covers filtering today).
- Blue-island shell rewrite to resolved page views; `PathViewController` adoption (available, unused).
- Content-negotiated component-vs-JSON responses via `ContentNegotiationViewResolver` (works once names exist; demo in a later pass).
- Engine capability work (follow-on): `ViewEngine`/`TargetingViewEngine` split, `supports(view)` registry, `supportsTarget` + target family.

## Follow-up (2026-09-06): implementation landed

All resolvers, the direct-View return, the auto-config chains, and both demo migrations are in:

1. **`likeView(…)`** (`blue-view`) — structural guard for View-shaped handler returns.
2. **`WebComponentViewResolver`** (`blue-view-webcomponent`) — config registry (`name → component class | module path`) + `@TagMapping` tag derivation; zero-config `name === tag`; `viewNames` filter; eager/lazy modes; cached via `AbstractCachingViewResolver`.
3. **`IslandViewResolver`** (`blue-view`) — name → `IslandView` marker for node rendering.
4. **`SSEEmitter`** (renamed from `EventStreamView`, per the acronym rule) — imperative emitter owned by the handler; `NodeDispatcher.render` gained the direct-View branch (`likeView`) so `return new SSEEmitter(events)` works (Spring `ViewMethodReturnValueHandler` parity). AD-09 updated.
5. **Auto-config chains** — `WebAutoConfiguration.viewResolver` → `ViewResolverComposite([WebComponentViewResolver, NameViewResolver])`; `NodeAutoConfiguration` gained an `IslandViewResolver` entry.
6. **blue-todo migrated** — controllers return names; dead element-class beans removed; component modules moved from manual `customElements.define` to `@TagMapping`; redundant `viewResolver`/`webComponentViewEngine` overrides deleted.
7. **blue-hello migrated** — builds on `WebAutoConfiguration`; keeps one intentionally-concrete `WebComponentView` with a pointing comment (the "concrete is an option" sample).
8. **`blue-views`** — new demo app: composite `[WebComponentViewResolver (eager+filter), NameViewResolver, ReportViewResolver (path import)]` resolving `shell` (component class → tag), `footer` (context bean), `report` (module on disk, lazy import); `nope` proves chain fall-through → error. All controller returns are names.

**Framework fix discovered during the migration:** `AbstractDispatcher` destroyed the previously-rendered view after every dispatch — correct for handler-created ephemeral views, fatal for resolver-cached (shared) instances (the first render poisoned the cache). Resolved views are now tracked in a `WeakSet` and excluded from destruction; the cache contract holds.
