# AD-27: Argument binding — form/model binding (`dataBinderValue`), `@requestPart`, matrix parity

**Date:** 2026-09-24
**Status:** Accepted — decision recorded; implementation landed (see
[plan](../plans/2026-09-23_ARGUMENT_BINDING.md)).

## Background

The gap analysis records three argument-binding gaps against enterprise
frameworks:

> No `@ModelAttribute` form-binding decorator (form-urlencoded parses to a raw `Record`), no
> `@matrixVariable` resolver, no `@requestPart` (blocked by multipart gap).

Two of the three were answered before this ADR: AD-26 landed a streaming
multipart parser and `fileValue()`, unblocking `@requestPart`; a `matrixValue()`
resolver existed (`MatrixValueMethodArgumentResolver`). The one genuine
functional gap was **form/model binding**: nothing instantiated a DTO and bound
matching request fields into it — the thing Spring calls `@ModelAttribute` and
NestJS does with `@Body(DTO)` + `ValidationPipe`.

Crucially, every primitive already existed (see the plan §2): the resolver
strategy pattern, a browser-only whole-source bind resolver, `DataBinder`
(keypath-aware, core/isomorphic), `ConversionService`, and the Zod `convert`
hook (AD-7). The gap was a missing Node-path resolver + extractor naming a
target shape — not a missing engine.

The research (plan §3) found no framework behavior worth copying wholesale:
Spring's resolver architecture is already Blue's 1:1; NestJS's `reflection`
based DTO inference contradicts Blue's established explicit-marker convention
(AD-26 D-5); no new runtime dependency is needed on either path.

## Decisions

### D-1 — One unified binding surface, bound from the Route

Handlers see one coherent set of bindings, all read from the Route/dispatch
context. Never expose `urlQueryValue` vs `routeQueryValue` as separate
user-facing choices. The research-only `urlValue`/`locationValue` idea is
dropped — no API to remove, none planned.

### D-2 — One type per wire source; dotted read only where the shape nests

Each source keeps its own `MethodParameterType`. Scalar-only sources
(`path:variable`, `query:value`, `matrix:value`, `header:value`,
`cookie:value`, `session-storage:value`, `local-storage:value`) read one
level; nested-capable sources (`body:value`, `request-session:value`,
`history-state:value`, `attribute:value`) additionally support dotted reads
(`bodyValue('address.city')`) via a shared read helper — a read, never
`DataBinder`.

### D-3 — Whole-source binding via `dataBinderValue` → `data-{source}:value`

`DataBinder` assembles many flat keys into one nested object (what plain
destructuring cannot do). Source is encoded in the type (`data-body:value`),
kind-validated, with an explicit per-platform bindable allow-list:

- **Node:** `data-body:value` (the `@ModelAttribute` equivalent), `data-cookie:value`.
- **Browser:** `data-query:value`, `data-cookie:value`, `data-session-storage:value`, `data-local-storage:value`.

The optional target constructor (`dataBinderValue('body', ProfileForm)`)
yields a real `instanceof` DTO — explicitly named, never reflected (D-8).
`DataBinder` is core/isomorphic; only the source switch is per-platform.
`DataBinder._assocPath` now mutates non-plain targets **in place** (was:
spread, which flattened instances into plain objects) so `instanceof`
survives binding; a converting validator (Zod `safeParse`) rehydrates its
parsed, coerced, whitelist-stripped shape back onto the instance.

### D-4 — Naming renames (hard break, no aliases)

`path:value` → `path:variable`; `state:value`/`stateValue` →
`history-state:value`/`historyStateValue`; the single `session:value` splits
into `request-session:value`/`requestSessionValue` (node) and
`session-storage:value`/`sessionStorageValue` (browser), plus new
`local-storage:value`/`localStorageValue` (browser); `socketSession` →
`socketSessionValue`; `model:value`/`modelValue` **deleted** (its dotted
`route.data` read was subsumed by `dataBinderValue('query')`); the dead
`model`/`matrix`/`path` bind-union sources deleted with it. All in-repo
consumers migrated in place.

### D-5 — `ROUTE` type untouched

`routeValue()`/`pathValue()`/`methodValue()` and `route.attributes` stay as
they are; the whole-`Route` binding variants (incl. the shelved
`fullPathValue()` idea) were never implemented and are not re-proposed.

### D-6 — `@requestPart` as a lightweight resolver over the AD-26 context

`requestPart(partName?, Target?)` reads a named part from
`request.multipart.fields`: JSON parts parse to an object (raw-text
fallback — the context keeps no per-part content type), bind into an
optional DTO instance, then through the shared convert pipeline. File parts
stay `fileValue()`/`MultipartFile`. Part naming follows AD-26 — explicit
name or the method-argument name. Repeated parts (already `string[]`) parse
per element into an array.

### D-7 — `@matrixVariable` parity as an additive extension

Repeated matrix params bind to arrays (the parser already folds them;
the resolver passes them through) and the single-value path is unchanged —
proved by spec. Required-path-value coupling keeps the mapping-path segment
selection already in place.

### D-8 — Non-goals

No `urlValue`/`routeValue` split, no automatic model-population (views feed
via `route.data`), no `class-validator`/`class-transformer` dependency, no
combined form+query source, no reflection-based type inference, no session
store, no DTO-to-model projection.

## Amendment 2026-09-24 — whole-source rule (no-arg) + `routeValue()` shape

Decided during AD-28 review (2026-09-24): the `*Value(name)` contract is
"extract the value _named_ `name` from the source". Omitting the name now
binds the **entire source object** for every object-valued binder —
`queryValue()`, `bodyValue()`, `attributeValue()`, `cookieValue()`,
`headerValue()`, `pathVariable()`, `requestSessionValue()`,
`historyStateValue()`, `sessionStorageValue()`, `localStorageValue()`. The
previous whole-source spelling, the `'*'` name sentinel (`queryValue('*')` /
`bodyValue('*')`, which also powered `validatedQuery`/`validatedBody`), is
**removed** — `'*'` is again a literal parameter name. `matrixValue` stays
name-only (matrix params span segments — no single whole-bag shape); D-2's
'scalar-only vs nested-capable' distinction is unaffected. `routeValue()`
(no-arg) binds the whole `Route`; named `routeValue(prop)` binds `Route`
properties (`path`, `method`, `id`, plus `attributes` — the old
`routeValue('route')` form, which never worked, is gone). See
[AD-28](../decisions/2026-09-24_AD28_STATIC_FILES.md) D-8.

## Consequences

- Form-urlencoded/JSON bodies now bind into typed DTOs with Zod
  validation/whitelisting — the `@ModelAttribute` + `@Valid` equivalent —
  and multipart JSON parts bind like `@RequestBody` fragments (`@RequestPart`).
- A missing required parameter now throws `MissingParameterError` (a
  `ParameterBindingError`) from every resolver — HTTP 400 via
  `NodeParameterBindingErrorResolver` instead of an unmapped `TypeError`
  (500). Socket dispatch unchanged (its catch-all still closes 1008).
- `BindingResult`-style per-field aggregation is deliberately not built;
  the Zod `convert` hook (AD-7) is the documented validation surface.

**Supersedes:** the stale "Argument binding" row of the
[Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §3
and the unfinished Domain 2 of the Spring MVC research plan; the
2026-03-16 argument-converter reference notes (archival pre-rename API
descriptions) are retained as dated history only.
