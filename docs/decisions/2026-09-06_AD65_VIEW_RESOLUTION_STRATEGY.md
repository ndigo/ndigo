# AD-65: View resolution strategy — controllers return names, resolvers return views

**Date:** 2026-09-06
**Status:** Accepted — implemented; `ndigo-views` proves three
resolvers/locations behind one composite.

## Context

Demo controllers constructed concrete views inline (`new WebComponentView('todo-app')`,
`new StringTemplateView()`) instead of returning view names for the
dispatcher's resolver chain. The framework already ported the reference resolution
pipeline (`AbstractDispatcher._resolveViewName`, `AbstractCachingViewResolver`,
`NameViewResolver`, `ContentNegotiationViewResolver`) but no resolver produced
component views, so apps bypassed the concept and controllers knew view
_types_ instead of view _names_. The plan answers three questions: should
controllers return names and is there a `WebComponentViewResolver` (yes); do
Island/SSE views need resolvers (Island yes — the server twin of the component
resolver; SSE no — imperative, per-request state); and naming (SSE follows the
mixed-case acronym convention).

## Evidence

- `packages/ndigo-view/src/island-view-resolver.ts` —
  `export class IslandViewResolver extends AbstractPathBasedViewResolver`
  (line 31) — name → `IslandView` marker for Node rendering. Born `48640af2`
  (2026-09-06, "feat(views): view-resolution strategy …").
- `packages/ndigo-view-webcomponent/src/web-component-view-resolver.ts` —
  `export class WebComponentViewResolver extends AbstractPathBasedViewResolver`
  (line 85) — config registry (`name → component class | module path`) +
  `@TagMapping` tag derivation, `viewNames` filter, eager/lazy modes, cached.
  Born `48640af2` (2026-09-06).
- `packages/ndigo-view/src/like-view.ts` — `export const likeView = (value) …`
  structural View guard (line 17); `NodeDispatcher.render` gained the
  direct-View branch so handlers can `return new ServerSentEventView(events)`.
- Auto-config chains: `WebAutoConfiguration.viewResolver` →
  `ViewResolverComposite([WebComponentViewResolver, NameViewResolver])`;
  `NodeAutoConfiguration` gets an `IslandViewResolver` entry (per the
  follow-up).
- **Demo app `apps/ndigo-views`** (`2026-09-06`): `src/views-app-configuration.ts`
  configures a composite
  `[WebComponentViewResolver (eager registry { shell, clientDemo }), NameViewResolver (footer bean), ReportViewResolver (report → ./views/report-view.ts)]` —
  three view locations behind one chain; `src/report-view-resolver.ts`
  resolves `report` by `import()`ing `./views/report-view.ts`. App dirs
  verified: `components/` (shell-component, client-demo), `views/`
  (footer-view, report-view). A `'nope'` route proves chain fall-through →
  `NoViewFound`.
- The plan's SSE rename follow-up claimed `EventStreamView` → `SSEEmitter`;
  the actual landed name is `ServerSentEventView` (`packages/ndigo-platform-node/src/server-sent-event-view.ts`,
  `export class ServerSentEventView implements ProducerView`).

## Decision

- **D-1** View names are the controller contract; family resolvers produce
  component/Island views. `WebComponentViewResolver` maps name → class →
  `TagMapping` → `WebComponentView` (zero-config `name === tag` default);
  `IslandViewResolver` maps the same name → `IslandView`. One logical name,
  platform-negotiated representation ("same name, resolver picks
  representation"). Resolvers **map/load, never register** components —
  `customElements.define` is the module's own side effect.
- **D-2** SSE is imperative — no resolver; renamed to the acronym-convention
  name (landed `ServerSentEventView`), handler-owned, rendered via a direct
  `likeView` View return in `NodeDispatcher.render`.
- **D-3** Auto-config defaults are app-overridable: web resolves component
  names first, then bean views; node resolves via `IslandViewResolver`.
- **D-4** `ndigo-views` demonstrates three locations (component module /
  context bean / view module on disk) with chain fall-through.
- **D-5** Demo migrations: `ndigo-todo` controllers return names (dead
  element-class beans and redundant `viewResolver`/`webComponentViewEngine`
  overrides removed); `ndigo-hello` keeps one intentionally-concrete
  `WebComponentView` as the "concrete is an option" sample; `ndigo-island`
  `/events` returns the SSE view directly. **String handler returns stay
  JSON** (needs a `@ResponseBody`-style marker before the implicit
  String-as-view-name is adopted).
- **D-7** ViewTarget stays but becomes a negotiated family (`supportsTarget`)
  with a `TargetingViewEngine` split — **follow-on**, not a resolver
  prerequisite.

## Consequences

- Controllers now express view _names_; the resolver chain (composite,
  ordered, first-match, cached) owns the name → View lookup for browser and
  Node dispatch.
- Cached resolver-shared views made the framework fix the dispatcher that
  destroyed every previously-rendered view after each dispatch — resolved
  views are now tracked and excluded from destruction (a WeakSet), so the
  cache contract holds.
- Engine capability negotiation (`supports(view)`) and the target family are
  left as follow-on work per AD-03's scope discipline.

## References

- Plan: `docs/plans/2026-09-06_VIEW_RESOLUTION_STRATEGY.md`
- Implementation: `packages/ndigo-view/src/island-view-resolver.ts`,
  `packages/ndigo-view/src/like-view.ts`,
  `packages/ndigo-view-webcomponent/src/web-component-view-resolver.ts`,
  `apps/ndigo-views/src/views-app-configuration.ts`,
  `apps/ndigo-views/src/report-view-resolver.ts`, commits `48640af2`,
  `ee767f49` (2026-09-06)
- Related: [AD-09](2026-09-05_AD09_SERVER_PUSH.md),
  [AD-03](2026-09-07_AD03_SITE_PAGE_MODEL.md)

## Revisit Trigger

Revisit if a consumer needs implicit String-as-view-name (after a
`@ResponseBody`-style opt-out), the `@ViewMapping`-driven name→class registry,
or the deferred engine-capability work (`ViewEngine`/`TargetingViewEngine`
split, `supportsTarget` target family). Until then name-returning controllers
plus the three-resolver composite stand.
