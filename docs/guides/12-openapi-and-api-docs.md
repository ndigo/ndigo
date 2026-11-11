# Guide 12 — OpenAPI & API Docs

The framework generates an [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3)
document **from the dispatch metadata itself** — the same route table
and parameter maps that serve requests, so the spec cannot drift from
behavior — and serves it with Swagger UI out of the box. No comments to
write, no second source of truth.

**Audience:** Node API developers · **Prerequisites:** Guides [01](01-building-a-node-api.md), [07](07-request-validation.md), and [13](13-dto-conversion.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)

## What you'll learn

- Serve the generated spec and Swagger UI.
- Read the spec produced from dispatch metadata.
- Document operations and responses with `@apiDocs`.
- Publish response schemas without a second source of truth.
- Guard the docs endpoints on untrusted networks.

## 1. The endpoints

`swagger-ui-dist` is a **peer dependency** of `@ndigo/platform-node` (asset-only
— no module is imported), so install it explicitly when serving docs:

```bash
pnpm add swagger-ui-dist
```

Then register the docs auto-configuration alongside the platform:

```ts
const app = new ApplicationBuilder([
    NodeAutoConfiguration,
    ManagementAutoConfiguration,
    OpenAPIDocsAutoConfiguration, // ← serves the spec + Swagger UI
    AppConfiguration,
]);
```

| Endpoint                  | Serves                                                  |
| ------------------------- | ------------------------------------------------------- |
| `GET /v3/api-docs`        | The OpenAPI 3.0.3 document (JSON)                       |
| `GET /swagger-ui/`        | Swagger UI, wired to the spec URL                       |
| `GET /swagger-ui/{*file}` | UI assets (`swagger-ui-bundle.js`, `swagger-ui.css`, …) |

Both endpoints are **open by default** (same posture as `/health` +
`/metrics`); on an untrusted network pass an `accessGuard`:

```ts
class SecureDocsConfiguration extends OpenAPIDocsAutoConfiguration {
    constructor() {
        super({ accessGuard: undefined /* any RouteHandlerInterceptor */ });
    }
}
```

The guard is scoped to the docs paths — it never touches other routes.
Because the docs endpoints carry no `@authenticated`/`@authorized`
metadata, a metadata-driven guard such as `AuthRouteGuard` (which derives
every requirement from handler metadata) would always permit them — use an
_unconditional_ guard that checks the request itself (a token-presence or
token-adapter guard) to actually require authentication.
Paths, the info block, servers, and per-route filters are options:

```ts
new OpenAPIDocsAutoConfiguration({
    path: '/api-docs', // spec URL
    uiPath: '/swagger-ui/', // UI URL
    title: 'Todo API',
    version: '1.4.2',
    description: 'The public Todo API',
    servers: ['https://api.example.com'],
    excludePaths: ['/health', '/metrics'],
    include: (_mapping, handlerMethod) => handlerMethod.method !== 'internalOnly',
});
```

## 2. What the spec contains

For every public handler method the generator emits an operation with:

- **Path + method** — from the route mapping (`:name` → `{name}`, `{*name}`
  greedy segments → `{name}`).
- **Parameters** — from `@parameters`: `queryValue`/`pathVariable`/
  `headerValue`/`cookieValue` map to the matching OpenAPI locations; path
  parameters are always required; `required`/`defaultValue` follow the
  extractor. A path template variable with no matching extractor (a route
  that matches on `:id` without binding it) is synthesized as a required
  string path parameter — the spec declares every `{name}` the path uses.
- **Request bodies** — `validatedBody` / `validatedBy` carry the **Zod
  schema** onto the parameter (the seam), and the generator renders it
  via zod's own `toJSONSchema`:

````ts
   @postMapping('/notes')
   @parameters({ data: validatedBody(insertSchemaForEntity(Note)) })
   create(data: Record<string, unknown>) { … }
   ```

produces `requestBody.content['application/json'].schema` with
`properties.title`, `required: ['title']`, `minLength: 1`, … — constraints
declared once on the entity, documented automatically. Recursive schemas
(zod's cycle `$ref`s) are hoisted into `components.schemas` and
referenced by pointer, so every pointer in the document resolves.

- **Multipart** — `fileValue`/`requestPart` parameters become
`multipart/form-data` parts (`type: string, format: binary` for files).
- **Framework conditions with no OpenAPI equivalent** are preserved as
`x-ndigo-*` extensions (e.g. `x-ndigo-matrixParams: ['color=red']`) instead
of silently dropped.

Excluded by design: methodless catch-alls, `@privateMapping` routes, and
`@apiDocs({ hidden: true })` handlers. The docs endpoints are excluded via
a **private access-condition marker** — dispatch never evaluates access
conditions, so the marker is documentation-of-exclusion only: it keeps the
spec from self-referencing and changes nothing about live dispatch.

> **Disclosure scope (SEC-4):** the spec documents the route table, not the
> protection posture. Routes gated only **in-handler** (no access
> condition — e.g. the demo's `/api/config/secrets`, `/notes` and
> `/drizzle/notes`, where the handler checks the Bearer token itself) still
> appear in the **anonymous** spec, complete with their `authorization`
> header parameters. Options:
>
> - `@apiDocs({ hidden: true })` on the handler — omit the operation from
> the spec entirely (right for endpoints sensitive enough not to be
> discoverable at all);
> - deploy the docs behind an `accessGuard` — the whole spec becomes
> private, but is not redacted. The demo demonstrates this: it registers
> `SecureDocsConfiguration` (`[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)/src/secure-docs-configuration.ts`),
> whose guard accepts only an `Authorization: Bearer <token>` that
> resolves through the same `lookupPrincipal` check the protected
> handlers apply, so anonymous `/v3/api-docs` and `/swagger-ui/` are 401.
>
> Guarding the docs still leaves the in-handler routes' shapes discoverable
> to anyone with the demo token — pair the guard with `@apiDocs({hidden:true})`
> per endpoint when the route structure itself is sensitive.

## 3. `@apiDocs` — optional documentation metadata

Routes document themselves without any extra code; add `@apiDocs` when you
want richer operations:

```ts
@getMapping('/reports')
@parameters({ from: queryValue('from') })
@apiDocs({
   summary: 'List reports',
   description: 'Paged report feed; returned newest first.',
   tags: ['reports'],
   operationId: 'listReports',
   deprecated: true,
   responses: { '200': reportPageSchema, '404': { description: 'Not found' } },
   security: ['bearerAuth'],
})
list(from: string | undefined) { … }
````

`hidden: true` drops the operation from the spec entirely.

### Responses

Without `responses`, every operation documents the default
`200: { description: 'OK' }`. Declaring `responses` **replaces** that
default — the handler's own set is authoritative, so an endpoint that only
returns `202` does not advertise a `200` it never produces. Declare `'200'`
yourself to keep it. Each entry is either a bare zod schema (shorthand for
`{ description: 'OK', schema }`) or `{ description?, schema? }`; schemas
render through the same zod → JSON Schema seam as request bodies.

### Security

Authenticated operations can carry OpenAPI security requirements. Declare
the named schemes once on the generator, then reference them per operation:

```ts
const doc = new OpenAPISpecGenerator().generate(tables, {
    securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    security: ['bearerAuth'], // document-level default
});

@getMapping('/me')
@apiDocs({ security: ['bearerAuth'] })
me() { … }

@getMapping('/public')
@apiDocs({ security: [] }) // explicitly anonymous — overrides the default
open() { … }
```

`@apiDocs({ security })` overrides the document-level default for that
operation; omitting it inherits the default; an empty array documents an
explicitly anonymous operation. (The `OpenAPIDocsAutoConfiguration` wiring
currently forwards `title`/`version`/`description`/`servers`/`excludePaths`/
`include` only — pass `securitySchemes`/`security` through
`OpenAPISpecGenerator.generate` directly, or extend the auto-configuration
options, until it forwards them.)

## 4. Scope notes

- **Spec generation is library-level**: `OpenAPISpecGenerator` in
  `@ndigo/openapi` takes any `getHandlerMethods`-providing mapping and
  returns the document — use it for offline CI generation or serving under a
  custom route without the auto-configuration.
- **Typed-client generation** is deferred (post-1.0): feed the served
  document to the ecosystem generators (openapi-generator, openapi-typescript).
- **Response schemas** are not inferred (the framework keeps no return-type
  metadata); declare them with `@apiDocs({ responses })`, otherwise the
  operation documents `200 OK`. The RFC 9457 `application/problem+json` error
  envelope as a `default` response is a recorded follow-up.
- **Assets are local** — no CDN; Swagger UI is served from
  `swagger-ui-dist` with the platform's static-file machinery (ETag,
  conditional GET, cache headers).

## See also

- [Guide 13 — DTO & Conversion](13-dto-conversion.md) — response schemas
- [Guide 26 — Authentication & Sessions](26-authentication-and-sessions.md) — guarding the docs endpoints
- [`@ndigo/openapi`](../../packages/ndigo-openapi/README.md) — the generator surface
