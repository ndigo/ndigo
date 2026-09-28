# AD-35: OpenAPI / API documentation

**Date:** 2026-09-28
**Status:** Ratified — implementation in [`docs/plans/2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md`](../plans/2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md)
**Supersedes:** the `OpenAPI / API docs` row of the framework gap analysis
([`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.1 —
the last remaining Tier-1 gap) and the "OpenAPI generation — post-1.0" note in
[`docs/reference/2026-09-01_FEATURE_ASSESSMENT.md`](../reference/2026-09-01_FEATURE_ASSESSMENT.md) §3.4.

## Background

The gap analysis records **no spec generation, no Swagger UI, no typed-client
generation** (`springdoc-openapi`, `@nestjs/swagger`, Swashbuckle as the
industry equivalents). The audit notes spec generation is tractable because the
framework already owns everything generation needs at runtime:

- **The route table**: each `RouteHandlerMapping` exposes every registered
  `RouteMappingInfo` → `RouteHandlerMethod` via `getHandlerMethods()` — the
  exact table dispatch walks, so the spec can never drift from behavior.
- **Parameter metadata**: `RouteHandlerMethod.parameters` (resolved
  `MethodParameter[]` from `@parameters` at registration time) carries per-
  parameter source (`MethodParameterType`), name, required/default, and
  post-bind conversion.
- **Validation schemas**: `validatedBy`/`validatedBody`/`validatedQuery`/
  `validateParameters` hold the caller's Zod schema — but only in the opaque
  `convert` closure, unreachable at generation time (D-3 fixes this seam).

No new parser or source-of-truth is needed: BlueJS's declaration IS the
metadata. This mirrors how AD-7 (Zod), AD-19/24 (wrap the ecosystem standard),
and the springdoc/NestJS model work — own the contract, wrap the standard.

## Decisions

### D-1 — New package `@blue/openapi`: own the contract, wrap the ecosystem

New package `@blue/openapi` (app-facing, alongside `@blue/cache`,
`@blue/scheduler`, `@blue/management`). It owns:

- `OpenAPISpecGenerator` — `RouteHandlerMapping[]` → OpenAPI 3.0.3 document
  (D-2).
- `@apiDocs` — optional per-handler documentation metadata (D-4).
- `OpenAPIDocsAutoConfiguration` — serves the spec and Swagger UI (D-5/D-6),
  following the `ManagementAutoConfiguration` options-via-subclass pattern.

It wraps the ecosystem standards rather than reimplementing them:

- **zod's native `toJSONSchema`** (`zod/v4`, the same instance that built
  the schemas) converts validation schemas to JSON Schema — zero extra
  dependency, version-exact (D-3). _Amended at implementation:_
  `zod-to-json-schema` 3.25.2 (latest) does not introspect Zod 4.5 schemas
  (its `parseDef` type detection relies on `_def.typeName`, removed in 4.5)
  and produces empty documents; the repo's wrap-the-ecosystem rule is
  satisfied by zod-core itself, which owns the conversion.
- **`swagger-ui-dist`** provides the UI assets (D-6). No CDN — assets are
  served by the framework, so the spec+UI work air-gapped (the same offline
  posture as the rest of the framework).

Dependencies: `@blue/dispatcher` (mappings, `MethodParameter`), `@blue/core`
(media types), `@blue/http` (type-only), `@blue/router` (type-only), `zod`,
`swagger-ui-dist`, `@tsmetadata/polyfill`. Like `@blue/management`, it does
not depend on `@blue/platform-node` — it contributes controllers + a
`handlerMappings` entry and rides whatever platform registers it.

### D-2 — Introspection, not AOP: generate from the mapping registry

`OpenAPISpecGenerator.generate(mappings, options)` walks each mapping's
`getHandlerMethods()` — no proxies, no request interception, no separate
registration path. Per `RouteMappingInfo`:

- **Paths**: `patternsCondition.patterns` — the framework's own path
  templates, translated only in syntax: `:name` → `{name}` (path-variable
  segments), `{*name}` → `{name}` (greedy segments are not expressible in
  OpenAPI; the loss is documented on the operation).
- **Operations**: one operation per pattern with a concrete
  `methodCondition.method`. Methodless mappings are excluded (they are
  catch-alls, e.g. the dispatch error route) — operation-level `summary`
  is blank unless `@apiDocs` supplies it.
- **Exclusions**: `accessCondition`-`private` mappings are excluded
  (framework-internal), as are `@apiDocs({ hidden: true })` handlers (D-4)
  and mappings excluded by an `include` filter option.
- **Deduplication**: mappings overlap (each mapping detects the same handler
  beans; dispatch order decides). Generation keys on
  `{method} {canonicalPath}` and keeps the first — identical to dispatch
  precedence.

**Parameters** (`RouteHandlerMethod.parameters`, `MethodParameter[]`):
`query`/`path`/`header`/`cookie` types map to OpenAPI parameter locations;
`required` from `parameter.required` (path parameters are always required);
`defaultValue` → schema default. `body`-typed parameters become
`requestBody`; `multipartFile`/`requestPart` become `multipart/form-data`
parts with `type: string, format: binary`. Matrix-parameter conditions
(`matrixCondition`) and query conditions (`queryCondition`) — framework
specifics with no OpenAPI equivalent — are preserved as the `x-blue-*`
extensions on the operation rather than silently dropped.

**Responses**: every operation gets `200: { description: 'OK' }`. Response
schema inference is deferred: the framework keeps no return-type metadata
(see Risks). The framework's RFC 9457 `application/problem+json` error
envelope is a documented follow-up (a `default` response entry).

### D-3 — Zod schema seam: `schema` on `ParameterExtractor`/`MethodParameter`

`validatedBy` returns `{ ...extractor, convert }` — the caller's schema is
trapped in the closure. Add an optional `schema?: z.ZodType` field to
`ParameterExtractor`, set by `validatedBy` (and propagated by
`validatedBody`/`validatedQuery`/`validateParameters`), and thread it into
`MethodParameter.schema`. `MethodParameter.toJSON()` excludes it (Zod types
are not serializable; the field is a generation-time input, not a wire
shape). The generator pipes `schema` through zod's `toJSONSchema` →
`requestBody.content['application/json'].schema` / the matching parameter
schema. No schema on a parameter → a plain `{ type: 'string' }` schema and a
documented comment — generation never requires the developer to opt in.

### D-4 — `@apiDocs` decorator: optional, additive documentation metadata

Optional `@apiDocs({ summary?, description?, tags?, operationId?,
deprecated?, hidden? })` on handler methods, stored in the same
`Symbol.metadata` store as `@routeMapping` (read-only for the generator;
`hidden: true` excludes the operation). This is the seam for richer docs
without inventing a comment-parsing pipeline (comments are not data this
framework has ever parsed).

### D-5 — Serving: `OpenAPIDocsAutoConfiguration` (in `@blue/platform-node`)

_Amended at implementation:_ the auto-configuration lives in
`@blue/platform-node` — the transport layer owns byte/header serving (the
static-file machinery), and no package depends on platform-node (established
layering: platform integrates feature packages). `@blue/openapi` stays
platform-agnostic (generator + decorator + document types) and the platform
re-exports the auto-configuration.

`OpenAPIDocsAutoConfiguration` (registered alongside `NodeAutoConfiguration`
and `ManagementAutoConfiguration`) contributes:

- `GET {path}` → the spec document as JSON — default
  `/v3/api-docs` (springdoc parity).
- `GET {uiPath}` + assets → Swagger UI — default `/swagger-ui/`.

Options (constructor, subclass pattern — `class Docs extends
OpenAPIDocsAutoConfiguration { constructor() { super({ … }) } }`):

| Option         | Default                              | Purpose                                                                                 |
| -------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| `enabled`      | `true`                               | Kill switch for serving (generation stays available).                                   |
| `path`         | `'/v3/api-docs'`                     | Spec URL.                                                                               |
| `uiPath`       | `'/swagger-ui/'`                     | UI URL.                                                                                 |
| `info`         | `{ title: 'API', version: '0.0.0' }` | `info` block.                                                                           |
| `servers`      | `undefined`                          | Optional static `servers` array; omitted = no servers block.                            |
| `accessGuard`  | `undefined`                          | Interceptor scoped to the docs paths (the `ManagementAutoConfiguration` guard pattern). |
| `include`      | all non-private                      | `(mapping, handlerMethod) => boolean` filter.                                           |
| `excludePaths` | `[]`                                 | Explicit path-string denylist (springdoc `pathsToMatch` inverse).                       |

The controller reads the dispatcher from the application context at request
time (`AsApplicationContextAware`, the `MetricsController` pattern) and
generates **lazily, once** (memoized until mappings change — the route table
is stable after context refresh; a `config:refresh`-style invalidation is a
follow-up if needed). The docs endpoints carry a **private access condition**
(mark during runtime registration — decorators cannot carry per-instance
paths) so the spec does not self-reference; dispatch never reads the access
condition.

### D-6 — Swagger UI served from `swagger-ui-dist`, no CDN

The UI page is served at `{uiPath}`, with the three asset files
(`swagger-ui.css`, `swagger-ui-bundle.js`,
`swagger-ui-standalone-preset.js`, favicon) resolved from the installed
package and served through `StaticResourceHandler` (the AD-28 machinery: ETag,
conditional GET, cache headers, Range) at `{uiPath}/{*file}`; the page is a
framework-rendered template (no-cache) referencing the assets relative to
its URL. The page fetches the spec
from `{path}` relative to the UI origin. `swagger-ui-dist` is large by
framework standards (~10 MB installed); the served payload is the three
files (~1.5 MB) with `Cache-Control` so it ships once per client. Alternative
UI distributions (RapiDoc, Stoplight) remain possible — the HTML page is the
only place that names the distribution.

### D-7 — Typed-client generation deferred (post-1.0)

The gap row also names typed-client generation. Decision: defer. The
ecosystem already owns this (openapi-generator, openapi-typescript, orval);
the contract seam is the served spec document. A BlueJS-side generator would
duplicate that work for little framework-specific gain. Recorded here as the
follow-up, alongside response-schema inference and problem+json error
documentation (Risks).

## Risks

- **Dependency weight**: `swagger-ui-dist` + `zod-to-json-schema` add
  install size to one app-facing package. Mitigated: nothing else depends
  on them; the served UI payload is a fixed ~1.5 MB with cache headers.
- **Zod version coupling**: `zod-to-json-schema` must support the repo's
  Zod 4.x. Verified at implementation time (pin the compatible release);
  the generator isolates schema conversion behind one function, so the
  dependency can be swapped without touching spec construction.
- **Spec drift from metadata gaps**: the spec is derived from dispatch
  metadata, so it cannot drift — but it inherits metadata's limits
  (no return-type inference, no methodless mappings, no greedy segments).
  Each is documented and recorded as follow-ups rather than papered over.
- **Multi-mapping duplication**: every mapping detects all handler beans;
  without dedup, operations would repeat. Generation keying
  (`{method} {path}`, first-wins) matches dispatch precedence exactly.

## Verification

- Package specs: generator units against a `RadixMetadataHandlerMapping`
  fixture — path translation (`:name`, `{*name}`), method exclusion,
  private/`hidden` exclusion, parameter mapping per source, schema
  derivation via `zod-to-json-schema`, `x-blue-*` extensions, dedup.
- Zod seam specs in `@blue/dispatcher` (`validatedBy` attaches `schema`;
  `MethodParameter` threads + `toJSON` excludes it).
- Auto-config: the docs mapping serves spec + UI through the real node
  pipeline; `GET /v3/api-docs` parses as JSON with the expected operations;
  `GET /swagger-ui/` HTML references asset URLs that return 200 with the
  right content types. Demos: `apps/blue-api` registers the auto-config and
  its integration spec asserts the spec endpoint + a sampled operation
  (`POST /api/echo` with `application/json` requestBody).
