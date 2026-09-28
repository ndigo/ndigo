# Blue OpenAPI

> OpenAPI 3.0.3 documentation for BlueJS apps — spec generation from
> dispatch metadata + Swagger UI.

The spec is derived from the **same metadata that serves requests** — route
tables, resolved parameter lists, and the Zod schemas `validatedBy` carries
— so it cannot drift from behavior. No comments, no second source of truth.
Serving (spec JSON + Swagger UI) lands in `@blue/platform-node` as
`OpenAPIDocsAutoConfiguration`; this package stays platform-agnostic.

## Installation

```bash
pnpm add @blue/openapi      # generator + decorator (any platform)
# Node apps also register the serving auto-configuration:
pnpm add @blue/platform-node
pnpm add swagger-ui-dist    # peer dep of platform-node (UI assets)
```

## Getting Started

```typescript
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration } from '@blue/platform-node';
import { OpenAPIDocsAutoConfiguration } from '@blue/platform-node';

const app = new ApplicationBuilder([
    NodeAutoConfiguration,
    OpenAPIDocsAutoConfiguration, // GET /v3/api-docs + GET /swagger-ui/
    AppConfiguration,
]);
```

Every public handler method is documented automatically:

- path + HTTP method from the route mapping (`:name` → `{name}`),
- query/path/header/cookie parameters from `@parameters`,
- request bodies from `validatedBody`/`validatedBy` — the Zod schema is
  rendered with zod's own `toJSONSchema` (no extra dependency),
- multipart parts from `fileValue`/`requestPart`,
- matrix/query route conditions preserved as `x-blue-*` extensions.

## Enriching operations

```typescript
import { apiDocs } from '@blue/openapi';

@getMapping('/reports')
@apiDocs({ summary: 'List reports', tags: ['reports'], operationId: 'listReports' })
list() { … }
```

`hidden: true` drops an operation from the spec; `deprecated`, `description`
and `servers` flow through as standard OpenAPI.

## Serving options

`OpenAPIDocsAutoConfiguration` (constructor options, subclass pattern):

| Option                          | Default           | Purpose                              |
| ------------------------------- | ----------------- | ------------------------------------ |
| `enabled`                       | `true`            | Kill switch for serving              |
| `path`                          | `/v3/api-docs`    | Spec URL                             |
| `uiPath`                        | `/swagger-ui/`    | Swagger UI URL                       |
| `title`/`version`/`description` | `'API'`/`'0.0.0'` | `info` block                         |
| `servers`                       | omitted           | Static `servers` array               |
| `accessGuard`                   | omitted           | Interceptor scoped to the docs paths |
| `include`                       | all public        | Per-handler filter                   |
| `excludePaths`                  | `[]`              | Path denylist                        |

Docs endpoints are open by default (the `/health`+`/metrics` posture) —
wire `accessGuard` on untrusted networks (guide 13 §1).

## Scope

- **Typed-client generation**: deferred (post-1.0) — feed the served
  document to ecosystem generators.
- **Response schemas**: not inferred; every operation documents `200 OK`.
- **UI assets**: local (`swagger-ui-dist` through the platform's static-file
  machinery, no CDN).

## API

Complete generated reference (all exports, via `pnpm doc:api`): [`doc/api/README.md`](doc/api/README.md).

- `OpenAPISpecGenerator` — mappings → `OpenAPIDocument` (library-level)
- `@apiDocs(metadata)` / `getApiDocs(target, method)` — documentation metadata
- `OpenAPIDocument` + companions — the generated document type model
- `RouteMappingTable` — the structural `getHandlerMethods()` contract

## See Also

- [Guide 13 — OpenAPI & API Docs](../../docs/guides/13-openapi-and-api-docs.md)
- [@blue/platform-node](../blue-platform-node/README.md) — hosts
  `OpenAPIDocsAutoConfiguration` (serving; platform owns bytes + headers)
- [AD-35 — OpenAPI / API documentation](../../docs/decisions/2026-09-28_AD35_OPENAPI_DOCS.md)

## Development

```bash
pnpm --filter @blue/openapi build:lib
pnpm --filter @blue/openapi test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
