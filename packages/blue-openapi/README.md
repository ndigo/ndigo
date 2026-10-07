# @blue/openapi

> OpenAPI 3.0.3 documentation for BlueJS apps — spec generation from dispatch metadata plus Swagger UI.

The spec is derived from the **same metadata that serves requests** — route
tables, resolved parameter lists, and the Zod schemas `validatedBy` carries —
so it cannot drift from behavior. No comments, no second source of truth.
Serving (spec JSON + Swagger UI) lands in `@blue/platform-node` as
`OpenAPIDocsAutoConfiguration`; this package stays platform-agnostic.

## Installation

```bash
pnpm add @blue/openapi      # generator + decorator (any platform)
# Node apps also register the serving auto-configuration:
pnpm add @blue/platform-node
pnpm add swagger-ui-dist    # peer dependency of @blue/platform-node (UI assets)
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, OpenAPIDocsAutoConfiguration } from '@blue/platform-node';
import { AppConfiguration } from './app-configuration'; // your application's configuration entry

const app = new ApplicationBuilder([
    NodeAutoConfiguration,
    OpenAPIDocsAutoConfiguration, // GET /v3/api-docs + GET /swagger-ui/
    AppConfiguration,
]);
```

Every public handler method on the dispatcher's route tables is documented
automatically:

- path + HTTP method from the route mapping (`:name` → `{name}`),
- query/path/header/cookie parameters from `@parameters`,
- request bodies from `validatedBody`/`validatedBy` — the Zod schema is
  rendered with zod's own `toJSONSchema`,
- multipart parts from `fileValue`/`requestPart`,
- matrix/query route conditions preserved as `x-blue-*` extensions.

## Usage

### Enriching operations

```ts
import { apiDocs } from '@blue/openapi';

@getMapping('/reports')
@apiDocs({ summary: 'List reports', tags: ['reports'], operationId: 'listReports' })
list() { … }
```

`hidden: true` drops an operation from the spec; `summary`, `description`,
`tags`, `operationId`, and `deprecated` flow through as standard OpenAPI
fields. `responses` documents per-status schemas — a bare Zod schema is
shorthand for `{ description: 'OK', schema }`. Declaring `responses`
**replaces** the implicit `200: { description: 'OK' }` (declare `'200'`
yourself to keep it). `security` lists the scheme names the operation
requires, overriding the document-level default; an empty array marks the
operation explicitly anonymous.

Security schemes are declared once on the generator, then referenced by name:

```ts
new OpenAPISpecGenerator().generate(tables, {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    security: ['bearerAuth'], // document-level default; per-operation @apiDocs({ security }) overrides it
});
```

(The `OpenAPIDocsAutoConfiguration` serving options do not yet forward
`securitySchemes`/`security` — use the library-level `generate` for those.)

### Serving options

`OpenAPIDocsAutoConfiguration` (constructor options, subclass pattern):

| Option                          | Default                     | Purpose                              |
| ------------------------------- | --------------------------- | ------------------------------------ |
| `enabled`                       | `true`                      | Kill switch for serving              |
| `path`                          | `/v3/api-docs`              | Spec URL                             |
| `uiPath`                        | `/swagger-ui/`              | Swagger UI URL                       |
| `title`/`version`/`description` | `'API'`/`'0.0.0'` / omitted | `info` block                         |
| `servers`                       | omitted                     | Static `servers` array               |
| `accessGuard`                   | omitted                     | Interceptor scoped to the docs paths |
| `include`                       | all public                  | Per-handler filter                   |
| `excludePaths`                  | `[]`                        | Path denylist                        |

Docs endpoints are open by default (the `/health`+`/metrics` posture) — wire
`accessGuard` on untrusted networks (guide 13 §1). The guard should check the
request itself: the docs controllers carry no `@authenticated`/`@authorized`
metadata, so a metadata-driven guard always permits these endpoints.

### Scope

- **Typed-client generation**: deferred — feed the served document to
  ecosystem generators.
- **Response schemas**: not inferred from return types; an operation without
  `@apiDocs({ responses })` documents `200 OK`, and a declared set replaces
  that default.
- **UI assets**: local (`swagger-ui-dist` through the platform's static-file
  machinery, no CDN).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- `OpenAPISpecGenerator` — mappings → `OpenAPIDocument` (library-level)
- `@apiDocs(metadata)` / `getApiDocs(target, method)` — documentation metadata
- `OpenAPIDocument` + companions — the generated document type model
- `RouteMappingTable` — the structural `getHandlerMethods()` contract

## Development

```bash
pnpm --filter @blue/openapi build:lib
pnpm --filter @blue/openapi test
```

## See Also

- [Guide 13 — OpenAPI & API Docs](../../docs/guides/13-openapi-and-api-docs.md)
- [@blue/platform-node](../blue-platform-node/README.md) — hosts `OpenAPIDocsAutoConfiguration` (serving; the platform owns bytes + headers)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
