# 2026-09-23 Argument Binding

**Status:** IMPLEMENTED 2026-09-24 via [AD-27](../decisions/2026-09-24_AD27_ARGUMENT_BINDING.md)
(decision) + this plan (waves 1–4, all landed). Waves 1–4 shipped: the D-4
naming renames, dotted reads on nested-capable sources, `dataBinderValue`
whole-source binding (Node + browser), `requestPart`, matrix array parity,
and the guide/docs refresh. Kept below as the design record.
**Companion docs:** Framework Gap Analysis §3 "Argument binding" (the gap inventory), the Spring MVC
Research Plan (the original 2025 scoping), AD-26 Multipart ([decision](../decisions/2026-09-22_AD26_MULTIPART_FILE_UPLOAD.md),
[plan](2026-09-22_MULTIPART_FILE_UPLOAD.md)) — the prerequisite that unblocks `@requestPart`.

---

## 1. Problem

The gap analysis records three argument-binding gaps against enterprise frameworks:

> No `@ModelAttribute` form-binding decorator (form-urlencoded parses to a raw `Record`), no
> `@matrixVariable` resolver, no `@requestPart` (blocked by multipart gap).

Two of the three are now answerable. AD-26 landed a streaming multipart parser and a `fileValue()`
file-part resolver, so **`@requestPart` is unblocked**. The `matrixValue()` resolver already exists;
only full Spring `@MatrixVariable` parity (repeated params → arrays, required-path-value coupling)
is missing. The one genuine functional gap is **form/model binding**: on the Node HTTP path a handler
can read individual fields (`bodyValue('email')`) or the whole parsed body as a plain `Record`
(`bodyValue('*')`), but nothing instantiates a DTO and binds matching request fields into it — the
thing Spring calls `@ModelAttribute` and NestJS does with `@Body(DTO)` + `ValidationPipe`.

This plan researches both frameworks' approaches, then proposes a BlueJS-native solution that reuses
existing seams (`DataBinder`, `ConversionService`, the resolver strategy pattern, the Zod `convert`
hook) rather than adding a parallel one.

---

## 2. Current state (verified 2026-09-23)

BlueJS already has **every primitive** form/model binding needs; it is simply not wired to the server
path.

- **The resolver strategy pattern is in place.** `HandlerMethodArgumentResolver`
  (`blue-dispatcher/src/argument-resolver.ts:13`) — `supportsParameter()` + `resolveArgument()` — is
  iterated per handler parameter, first match wins. This _is_ Spring's architecture (see §3.1).
- **A platform resolver base class exists.** `AbstractPlatformArgumentResolver`
  (`blue-dispatcher/src/abstract-platform-resolver.ts:38`) runs the shared pipeline
  `resolveName → default → convertType → Zod convert hook → nil/required check`; platforms implement
  only `resolveName()` + `supportsParameter()`.
- **Bean binding already exists — browser-only.** `MethodParameterType.BIND = 'bind:value'`
  (`blue-dispatcher/src/parameters.ts:131`) and the extractor factory `bindBrowserValue(source)`
  (`parameters.ts:342`). On the Node path BIND is **not** an allowed source (it is in the `route`
  set but not the `request` set, `parameters.ts:618-656`). The `BrowserBindMethodArgumentResolver`
  (`blue-platform-web/src/bind-argument-resolver.ts:23`) binds a named browser data source into an
  object via `DataBinder`, prefix-filtered. This browser-only BIND seam becomes `data-{source}:value` /
  `dataBinderValue(source)` on both platforms (D-3), with Node sourcing from `request.body`.
- **The binder primitive is real and keypath-aware.** `DataBinder` (`blue-core/src/data-binder.ts:22`)
  applies property values to a target by parsed keypath (`_applyPropertyValues` → `parseKeypath` +
  `_assocPath`, so `profile.name` nests correctly) and supports required-field checks. This is Blue's
  `WebDataBinder`. It currently produces a plain nested object, not a typed class instance.
- **Type conversion exists.** `ConversionService` (`blue-core`) backs the `convertType` lookup used by
  every resolver — Spring's thread-safe `ConversionService`, minus the legacy `PropertyEditor` layer.
- **Validation exists and is stronger than class-validator.** `validatedBy(schema, extractor)`
  (`blue-dispatcher/src/zod-validated-by.ts:60`) installs a Zod validator as `parameter.convert`, run
  after type conversion. Unknown-key whitelisting needs no option on zod ^4.5.4: object schemas strip
  unknown keys by default (`unknownKeys: 'strip'`); `passthrough` opts out (`.stripUnknown()` does not
  exist on the pinned Zod).
- **Form fields already reach the request body.** `parseBody` (`blue-platform-node/src/http-request-limits.ts:114`)
  dispatches `application/x-www-form-urlencoded` into a `Record` via `URLSearchParams`; JSON parses to
  an object. `NodeBodyValueMethodArgumentResolver` (`blue-platform-node/src/body-argument-resolver.ts:16`)
  returns `request.body` / `request.body?.[name]`. So the _data_ is there; only the binding step is not.
- **Multipart context exists (unblocks `@requestPart`).** `NodeRequest.multipart` carries parsed parts
  (`request.multipart.files`, `request.multipart.fields`) after AD-26; `NodeMultipartFileMethodArgumentResolver`
  (`blue-platform-node/src/multipart-file-argument-resolver.ts:33`) reads `files.get(name)`.

Net: the gap is **one missing resolver on the Node path + an extractor that names a target shape**, not
a missing engine.

---

## 3. External research

### 3.1 Spring MVC — the contract to mirror

BlueJS already mirrors most of this; the bullets note where it does and where form binding diverges.

- **Resolver architecture.** `DispatcherServlet` iterates its registered
  `HandlerMethodArgumentResolver`s for each handler parameter, invoking the first whose
  `supportsParameter()` returns true (`resolveArgument(...)`). Custom resolvers register via
  `WebMvcConfigurer.addArgumentResolvers`. This is a 1:1 match for BlueJS's pattern — so adding form
  binding means **adding a resolver**, not changing the engine.
- **`@ModelAttribute` (the gap).** `ModelAttributeMethodProcessor` instantiates the command object
  (default constructor, or reuses an existing model attribute), then a `WebDataBinder` populates its
  properties from **all matching request parameters** (form fields + query) by property name, delegating
  type conversion to the global `ConversionService`, supporting nested keypaths, and optionally running
  Bean validation (`@Valid`/`@Validated`) into a `BindingResult`. `@ModelAttribute` on _methods_ also
  populates the shared model for later handlers/views.
- **`@RequestBody`.** `RequestResponseBodyMethodProcessor` deserializes the body (JSON/XML) straight to
  the typed parameter via `HttpMessageConverters` — no form binding. BlueJS's `bodyValue('*')` already
  does the JSON half; the gap is the _bean_ side, not the raw-body side.
- **Per-source resolvers.** `@RequestParam`, `@PathVariable`, `@MatrixVariable`, `@RequestPart`,
  `@CookieValue`, `@RequestHeader` are each a dedicated resolver — exactly BlueJS's per-extractor model.
  `@MatrixVariable` reads semicolon-separated matrix params from a path segment and can pair with a
  `@PathVariable` name; repeated values bind to arrays.
- **`@RequestPart`.** Like `@RequestBody` but for multipart: a JSON part is deserialized into an object,
  a file part becomes `MultipartFile`. Distinction only matters once multipart exists (AD-26).
- **`ConversionService` vs `PropertyEditor`.** Spring 3+ uses a thread-safe `ConversionService`
  (`Converter`/`ConverterFactory`/`GenericConverter` SPI) that replaced the stateful, string-centric
  `PropertyEditor`. BlueJS has the former; never needs the latter.

### 3.2 NodeJS / NestJS — the transformation pattern to borrow

- **`@Body(DTO)` + `ValidationPipe`.** The incoming JSON is a plain object; the pipe runs
  `class-transformer`'s `plainToInstance()` to make it a DTO _instance_, then `class-validator`
  decorators validate, and `whitelist: true` strips unknown properties; failure → HTTP 400. The key
  idea for BlueJS is **runtime plain→class transformation driven by an explicit DTO type**, producing a
  real instance (not just a typed view over a plain object).
- **The extensible seam is pipes.** Every value flows through transform+validate pipes. BlueJS's
  equivalent seam is the `parameter.convert` hook (`validatedBy`, AD-7) plus `convertType`. We already
  have the pipe; we need to bind _into_ an object first, then let the existing pipe validate.
- **Reflection vs explicit.** NestJS infers the DTO type from `reflect-metadata` `design:type` (and
  `@Type()` for nesting). BlueJS's established convention is **explicit markers, not reflection** —
  AD-26's `@file()` binds by an explicit marker because "TS parameter types are erased at runtime"
  (`2026-09-22_MULTIPART_FILE_UPLOAD.md` D-5). We follow the same rule: the target is named explicitly.
- **Parsing primitives.** Express `body-parser` already does urlencoded→Record and JSON→object; BlueJS
  matches that in `parseBody`. Multer/busboy are covered by AD-26. No new parsing dependency needed.

### 3.3 Takeaways for BlueJS

1. The resolver pattern is shared — **add resolvers**, don't touch the engine.
2. Bean binding = `DataBinder` + `ConversionService`, both owned and present — **reuse, never rebuild**.
3. plain→class: NestJS wraps `class-transformer`; BlueJS can lean on `DataBinder` (builds nested objects
   from keypaths) + optional target-constructor instantiation + Zod for validation/whitelist — **no new
   runtime dependency**, consistent with the "own-the-contract" pattern (`blue-signals`, AD-7, AD-24).
4. Explicit marker over reflection — precedent is `@file()` / `validatedBy`.

---

## 4. Decisions

### D-1 — One unified surface, bound from the Route

Present handlers a single coherent set of bindings; behind the scenes it is irrelevant whether a value
comes from the browser bar or the parsed Route. A `Route` (`PathRoute`) already normalizes transport:
`BrowserRouter` builds it from `window.location.pathname + search`, `HashRouter` from the fragment
(`location.hash.slice(1)`), and Node HTTP from the request path+query (route built by the router; the adapter records the `NodeRequest` in `route.attributes` before dispatch — `node-http-server-adapter.ts:545`/`:872`). So in
`…/p?a=1#/r?b=2` the Route carries the navigational query for the active mode; the bar's stray `?a=1`
is ignored. Bind from the Route — never expose `urlQueryValue` vs `routeQueryValue` as separate
user-facing choices. Raw `window.location` bits outside the Route (protocol/host/port/href) are a niche
case — `urlValue`/`locationValue` was a research idea that never landed and is dropped here: no API to remove, and none planned.

### D-2 — One type per wire source; dotted read only where the shape nests

Each distinct source gets its own `MethodParameterType` (`query:value`, `header:value`, …), matching the
dominant BlueJS pattern and its per-source resolver files, with kind-validation forbidding a source on an
incompatible mapping. The discriminating axis is **does the source's value allow nesting?**

- **Scalar-only** (single-level read, no dotted walk): `path:variable`, `query:value`, `matrix:value`,
  `header:value`, `cookie:value`, `session-storage:value`, `local-storage:value`. Query and matrix are
  flat (`URLSearchParams` / `MatrixString.parse`) so they stay distinct and non-nested — not a shared
  implementation.
- **Nested-capable** (dotted read supported): `body:value` (JSON), `request-session:value`
  (`request.session`), `history-state:value` (`history.state`), `attribute:value` (framework context).

Dotted traversal = split on `.`, walk; else extract — a shared read helper, not DataBinder. Applied only
to the nested-capable sources above; forcing it onto flat sources is dead code.

### D-3 — Whole-source binding via `dataBinderValue` → `data-{source}:value`

`DataBinder` (`blue-core`) takes already-extracted flat `{key:value}` pairs and binds them into one target
object by keypath (`_assocPath`), with required-field checks; the existing `prefix` extractor field keeps
key-prefix filtering at the resolver layer. Its distinct job is
**assembling many flat keys into one nested object** — plain destructuring cannot group
`address.street` + `address.city` into `{address:{street,city}}`. So it is _not_ duplicative of scalar or
dotted reads (those extract one value); use `dataBinderValue(source)` when populating an object from many
keys at once, and scalar/dotted reads for individual values.

Two layers are separate: **source resolution** (reading FROM a source) lives in the resolver's
`getSourceData()` as a fixed switch on literal sources — it does _not_ walk arbitrary dotted globals, so
`dataBinderValue('document.cookie')` does not walk `globalThis.document.cookie`; and **DataBinder** only
applies pairs to a target. DataBinder is core/isomorphic (no browser globals), so it works in Node or
against any target; the "browser" association was only that the browser resolver used it first.

Source is encoded in the type (`dataBinderValue('query')` → `data-query:value`, `data-body:value`) — one
type per source, kind-validated (e.g. `data-body:value` allowed only on `request`). No overwrite risk
(resolution is per-`MethodParameter`, positional), so this is a clarity/consistency choice, not a
correctness one.

Target shape is named explicitly — `dataBinderValue(source, Target?)` with an optional constructor,
mirroring `@file()` (AD-26 D-5); no reflection-based type inference (D-8). Omit `Target` for a plain
nested object.

**Per-platform binding surface.** `DataBinder` stays a single shared core — there are no per-platform
subclasses; the only platform difference is _which sources exist_, and that lives in each platform
resolver's `getSourceData()` switch. The bindable sources are an explicit per-platform allow-list (not a
mechanical derivation from D-2; Node forgoes whole-`query`/`header` binding in v1 — the form gap needs
only `body`; revisit on a use case):

- **Node:** `data-body:value` (the `@ModelAttribute` equivalent — urlencoded/JSON body), `data-cookie:value`.
- **Browser:** `data-query:value`, `data-cookie:value`, `data-session-storage:value`,
  `data-local-storage:value`.

### D-4 — Naming renames

- `path:value` → **`path:variable`** (factory stays `pathVariable(name)`; domain-accurate, Spring
  `@PathVariable` parity; avoids the ambiguous short `var`).
- `state:value` / `stateValue` → **`history-state:value`** / **`historyStateValue`** — "state" is too
  generic; this reads `history.state`.
- Split the single `session:value` (two backends) into **`request-session:value`** / `requestSessionValue`
  (`request.session`, node) and **`session-storage:value`** / `sessionStorageValue` (`sessionStorage`,
  browser); add **`local-storage:value`** / `localStorageValue` (`localStorage`, browser).
- `socket-session:value` factory `socketSession` → **`socketSessionValue`** (consistent with the dominant
  `*Value` suffix; `pathVariable` is the sole domain-named exception).
- Delete `model:value` / `modelValue`: it reads `route.data` with dotted traversal
  (`BrowserModelValueMethodArgumentResolver`). The query bag is flat, so the dotted walk matches only
  literal dotted query keys — subsumed by `dataBinderValue('query')` (D-3), which is exact about shape.
  The dead `model`/`matrix`/`path` values of the `bindBrowserValue` source union (its `getSourceData`
  switch implements only `query`/`state`/`session`/`cookie`) go with it.
- `urlValue`/`locationValue` never landed; the idea is dropped (D-1) — no API to remove, and none planned.

- **Breaking:** the renamed and deleted types/factories are removed without deprecated aliases — existing
  consumers (demos, in-repo examples, user code) are updated in place.

### D-5 — `ROUTE` type untouched; attributes are framework context, not URL

`attribute:value` / `attributeValue` is a **universal dispatcher-level** resolver
(`blue-dispatcher/src/argument-resolver.ts:173`; part of the default resolver set that both platforms
merge), reading framework-injected `route.attributes` — `acceptLanguage`/`language` on both transports;
on the server the adapter stashes the request/response under `NODE_REQUEST_ATTRIBUTE`/
`NODE_RESPONSE_ATTRIBUTE` (`node-request.ts:18`, `node-dispatcher.ts:34`). Not URL-derived. The `ROUTE`
type is **left as-is this wave**: its factories `routeValue()`/`pathValue()`/`methodValue()` are live
and consumed in-repo (blue-todo binds the matched path with `pathValue()` on every handler), so nothing
here renames, removes, or redefines them. The whole-`Route` binding variants under research —
including the `fullPathValue()` idea, one of several route-meta bindings explored and shelved — were
**never implemented**, and no decision in this plan depends on them.

### D-6 — `@requestPart` as a lightweight resolver over the AD-26 multipart context

A `NodeRequestPartMethodArgumentResolver` reads a named part from `request.multipart`: JSON/text parts are
parsed and bound to a DTO via the D-1/D-3 machinery; file parts remain `fileValue()`/`MultipartFile`.
Given the parser already exists, this is a small resolver, not new plumbing. Open: `MultipartContext.fields`
keeps no per-part content-type, so JSON detection is either JSON-parse-with-raw-fallback or recording part
content types in `parse-multipart.ts`; repeated parts already collapse to `string[]` (AD-26) — define the
array case for `requestPart`.

Part naming follows the AD-26 `fileValue` convention — explicit when given, otherwise the method-argument
name: `requestPart(partName?, Target?)`. `requestPart()` reads the part named after the argument as a plain
object; `requestPart(MetaDto)` does the same into an instantiated DTO; `requestPart('meta', MetaDto)`
overrides the part name. Mirrors Spring's `@RequestPart(value)` with parameter-name fallback.

### D-7 — `@matrixVariable` parity as an optional light extension (lower priority)

`matrixValue()` + `MatrixValueMethodArgumentResolver` already exist
(`blue-dispatcher/src/argument-resolver.ts:94`). Full Spring parity — repeated matrix params binding to
arrays, and required-path-value coupling with a `@PathVariable` segment name — is an incremental
enhancement to that resolver, not a new component.

### D-8 — Non-goals

No `urlValue` vs `routeValue` split (D-1), no automatic model-population (Spring's `@ModelAttribute` also
fills the view model; BlueJS feeds views via `route.data`, so binding is bind-only), no
`class-validator`/`class-transformer` dependency, no combined form+query source in v1, no
reflection-based type inference, no server-side session-store or DTO-to-model projection (the gap
analysis's separate "DTO/object mapping" Tier-2 item).

---

## 5. Unified binding surface & naming

Handlers see one coherent set of bindings, all read from the Route/dispatch context (D-1). Source is
encoded in the type only where a whole source is bound into an object (`data-{source}:value`); otherwise
each wire source is its own `*:value` type.

| Binding         | Factory                               | Type                    | Source                                             | Nested?       | Platform |
| --------------- | ------------------------------------- | ----------------------- | -------------------------------------------------- | ------------- | -------- |
| Path variable   | `pathVariable('id')`                  | `path:variable`         | Route params (`:id`)                               | no            | both     |
| Query           | `queryValue(name)`                    | `query:value`           | Route query                                        | no            | both     |
| Matrix          | `matrixValue(name)`                   | `matrix:value`          | Segment matrix                                     | no            | both     |
| Header          | `headerValue(name)`                   | `header:value`          | Request header                                     | no            | node     |
| Body            | `bodyValue(name)`; `'*'` = whole body | `body:value`            | request body (JSON / urlencoded)                   | yes           | node     |
| Cookie          | `cookieValue(name)`                   | `cookie:value`          | `document.cookie` / `request.cookies`              | no            | both*    |
| History state   | `historyStateValue(name)`             | `history-state:value`   | `history.state`                                    | yes           | browser  |
| Session storage | `sessionStorageValue(name)`           | `session-storage:value` | `sessionStorage`                                   | no            | browser  |
| Local storage   | `localStorageValue(name)`             | `local-storage:value`   | `localStorage`                                     | no            | browser  |
| Request session | `requestSessionValue(name)`           | `request-session:value` | `request.session`                                  | yes           | node     |
| Attribute       | `attributeValue(name)`                | `attribute:value`       | Framework context                                  | yes*          | both     |
| Data binding    | `dataBinderValue(source, Target?)`    | `data-{source}:value`   | whole flat source → object (per-platform set, D-3) | builds nested | both     |
| Socket session  | `socketSessionValue(name)`            | `socket-session:value`  | Socket session                                     | —             | socket   |

\* cookie reads `document.cookie` on client, `request.cookies` on node — same binding, per-platform source.
Attribute nesting is legal but usually scalar context.

**Untouched:** the `ROUTE` type and its `routeValue()`/`pathValue()`/`methodValue()` factories stay as-is (D-5). **Shelved ideas (never implemented; not re-proposed):** whole-`Route` binding variants incl. `fullPathValue()`. **Deleted:** `model:value` / `modelValue` and the dead `model`/`matrix`/`path` bind-union sources.

### DataBinder vs scalar reads

Scalar/dotted reads extract one value; `dataBinderValue(source)` assembles a whole flat source into one
nested object (flat-key → nested grouping + prefix filter + required fields) — D-3. Source resolution
(read FROM a source) is the resolver's fixed switch, not DataBinder; DataBinder only applies pairs to a
target and is core/isomorphic.

### Package deps

**No new runtime dependencies.** Resolvers sit over existing `DataBinder`/`ConversionService`/Zod
surfaces; Node-only files pass the isomorphic browser-globals lint.

### API sketch

```ts
import { z } from 'zod';
import { parameters, dataBinderValue, requestPart, validatedBy } from '@blue/dispatcher';

class ProfileForm {
    email = '';
    age = 0;                       // coerced by the Zod schema (z.coerce.number()); binding is string-typed
    address = { street: '', city: '' }; // nested: client sends "address.street" / "address.city"
}

class UserController {
    // Bind the parsed form/body Record into a ProfileForm instance, then validate + whitelist with Zod.
    @parameters({
        profile: validatedBy(
            z.object({
                email: z.string().email(),
                age: z.coerce.number(),
                address: z.object({ street: z.string(), city: z.string() }), // unknown keys stripped by default (zod ^4.5.4)
            }),
            dataBinderValue('body')   // source in the type; omit target for a plain object
        )
    })
    async updateProfile(profile: ProfileForm) {   // profile is a validated ProfileForm, not a Record
        return { ok: true, email: profile.email };
    }

    // Nested-capable scalar read off the JSON body.
    @parameters({ city: bodyValue('address.city') })
    async byCity(city: string) { … }

    // Multipart JSON part bound to a DTO; file parts stay fileValue()/MultipartFile.
    @parameters({ meta: requestPart(MetaDto) })
    async upload(meta: MetaDto, @file() file: MultipartFile) { … }
}
```

`dataBinderValue(source)` / `requestPart(Target)` are explicit markers (D-3/D-6); omitting the target in a
bind yields a plain object. Nested scalar reads (`bodyValue('address.city')`) work only on nested-capable
sources (D-2).

---

## 6. Risks

- **Plain-object vs class-instance semantics.** Without a target, binding yields a plain nested object;
  with one, a real instance. Document which each path returns and that `instanceof` checks require the
  target — surprising otherwise. (Mitigated by D-3's explicit target; no reflection per D-8.) Mechanical
  constraint: `DataBinder._assocPath` _spreads_ its target into a plain object (`{ ...target }`), so an
  `instanceof` result requires a DataBinder change — in-place instance mutation or post-bind
  instantiation. Wave 2 must land that change or the target gate fails.
- **Form+query divergence from Spring.** Operators expecting Spring's combined `@ModelAttribute` source
  will find query fields do _not_ fold into form binding in v1 (D-8). Documented; not a bug.
- **Conversion failures on bound objects.** A bad field (e.g. non-numeric `age`) throws
  `ParameterConversionError` from the shared pipeline — consistent with existing resolvers, but it is a
  hard error, not a per-field `BindingResult`. If per-field validation aggregation is wanted later, that
  sits on the existing Zod `convert` hook (`validatedBy`, AD-7), not the binder.
- **Whitelist surface.** Stripping is the _default_: a `validatedBy` object schema drops unknown keys on
  zod ^4.5.4 (no `.stripUnknown()` method exists). The pass-through case is the no-schema path —
  `dataBinderValue(source)` without `validatedBy` binds everything in the source. Document that pairing
  in the guide.
- **Matrix array parity.** Extending `MatrixValueMethodArgumentResolver` to arrays must not change the
  single-value path existing demos rely on; keep the change additive and covered by its own spec.

---

## 7. Sequencing

**Wave 1 — naming + data-binding foundation.** Apply the D-4 renames (`path:variable`; `history-state:value`
`historyStateValue`; split `session:value` into `request-session:`/`session-storage:`value, add
`local-storage:value`; delete `model:value`; `socketSession` factory → `socketSessionValue`) and rename
`bind:value`/`bindBrowserValue` → `data-{source}:value` / `dataBinderValue(source)`.
Add the nested-capable dotted read to body/request-session/history-state/attribute resolvers (D-2); admit the
new `data-*` sources on their mapping kinds in `SOURCES_BY_KIND` (`route`: all `data-*`, permissive as
today; `request`: `data-body:value`, `data-cookie:value`; `socket`: none)
Migrate all in-repo consumers (demos, examples) in place — D-4 is a hard break, no aliases.
Spec asserts the renames round-trip, `dataBinderValue('body')` builds a nested object via
`DataBinder`, and `bodyValue('address.city')` nests while `queryValue('a.b')` does not. Gates:
changed-package vitest + `tsc -b` (the renames cross dispatcher, web, node, socket, demos).

**Wave 2 — Node whole-source binding (the main gap).** A `Node` data-binding resolver reading `request.body`
via `DataBinder`, then the Zod `convert` hook; optional target constructor to instantiate a DTO before
binding (D-3); register in `configure-argument-resolvers.ts`. Spec asserts form-urlencoded fields bind into
a nested object; keypaths nest (`address.city`); repeated keys bind as arrays (`parseBody` folds them;
bracket keypaths like `address[0].street` work via `parseKeypath`); the Zod schema coerces `age`
(`z.coerce.number()` — binding is string-typed; the pipeline has no per-property conversion hook); a
missing required field throws `MissingParameterError` (→ 400 — `handleMissingValue`'s bare `TypeError`
is not mapped by `NodeParameterBindingErrorResolver`); and a target yields an `instanceof` DTO (requires
the §6 DataBinder instance-preservation change) with unknown keys stripped by the schema by default.
Gates: `blue-platform-node` vitest + `tsc -b`.

**Wave 3 — `@requestPart` (unblocked by AD-26).** `NodeRequestPartMethodArgumentResolver` reading
`request.multipart`; JSON/text parts bound to a DTO via Wave 1/2 machinery, file parts untouched. Spec
asserts a multipart body with a JSON part binds to the DTO and a file part binds to `MultipartFile`.
Gates: vitest + `tsc -b`.

**Wave 4 — matrix parity (D-7, optional) + docs.** Additive array support in `MatrixValueMethodArgumentResolver`;
AD; guide `docs/guides/…-argument-binding.md`; status refresh: gap-analysis §3 "Argument binding" row →
IMPLEMENTED (matrix caveat; `ROUTE` type untouched per D-5, shelved route-binding ideas incl. `fullPathValue()` recorded as non-goals, `modelValue` removed), feature-assessment
row updated, plan status header. Final:
`pnpm lint`, `pnpm format:check`, changed-package `vitest run` + `tsc -b`, `graft build`.

---

## 8. Verification

- **Binding:** a real `application/x-www-form-urlencoded` request binds into the target object; nested
  client fields (`address.city`) nest correctly via `DataBinder`; `age` coerces String→Number via the
  Zod schema (`z.coerce.number()`); a required field absent throws `MissingParameterError` (400).
- **Class instance (Wave 2):** with a target, the handler receives an `instanceof` DTO (contingent on the
  §6 DataBinder change) and unknown properties are stripped by the Zod schema by default; without a
  target, a plain nested object is returned.
- **Request part (Wave 3):** a multipart request binds its JSON part to the DTO and its file part to a
  `MultipartFile`; unrelated parts are ignored.
- **Matrix (Wave 4, if done):** repeated matrix params bind to an array; single-value behavior is
  unchanged for existing consumers.
- **Repo gates:** `pnpm lint` (`--deny-warnings`), `pnpm format:check`, changed-package `tsc -b`,
  changed-package `vitest run`.
