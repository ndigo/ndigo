# @blue/inspect

> Programmatic manifest generator for BlueJS apps — a deterministic, versioned JSON description of a running application.

`blue inspect` answers "what does this application actually expose?" without a
language server or a second source of truth: routes, registered handler
mappings, and declared configuration keys are read straight from the live
context and dispatcher metadata. Configuration **values are never emitted** —
only whether a key is present — so the manifest is safe to print and diff.

## Installation

```bash
pnpm add @blue/inspect
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { ApplicationBuilder } from '@blue/boot';
import { DISPATCHER, type AbstractDispatcher } from '@blue/dispatcher';
import { inspectApplication } from '@blue/inspect';
import { RouteRegistry } from '@blue/router';
import { AppConfiguration, ServerConfig } from './app-configuration';

const context = await new ApplicationBuilder([AppConfiguration]).run();

const routes = new RouteRegistry();
routes.scanSources([MyController], context);

const manifest = inspectApplication({
    context,
    routes,
    mappings: context.getValue<AbstractDispatcher>(DISPATCHER),
    configurationClasses: [ServerConfig],
});

console.log(JSON.stringify(manifest, null, 2));
context.close();
```

## Usage

### The manifest shape

```jsonc
{
    "version": 1,
    "generatedAt": "2026-01-01T00:00:00.000Z",
    "app": { "name": "my-app", "profiles": ["dev"] },
    "routes": [{ "name": "api.hello", "path": "/api/hello" }],
    "mappings": [
        {
            "pattern": "/api/items/{id}",
            "httpMethods": ["GET"],
            "handler": { "class": "ItemController", "method": "item" },
            "parameters": [{ "name": "id", "source": "path:variable" }],
        },
    ],
    "config": [{ "key": "server.port", "type": "number", "origin": "boot", "hasValue": true }],
}
```

Every collection is sorted and de-duplicated: two runs over the same
application produce identical output apart from `generatedAt`. Inject a fixed
timestamp with `now` for byte-identical results (useful in snapshots and CI
drift checks).

### Routes

Pass a `RouteRegistry`, an iterable of `RouteDefinition`s, or explicit
`{ name, path, partition? }` descriptors. Registry entries contribute their
dotted child keys as names; raw definitions use their pattern.

### Mappings

Pass the dispatcher (its `handlerMappings` collection is inspected), an array
of mapping tables, or a single table. Each `AbstractHandlerMethodMapping`
exposes `getMappingEntries()` — the read-only enumeration seam this package
reads — with a `getHandlerMethods()` fallback for structural compatibility.
Rows are flattened per claimed pattern and de-duplicated first-registration
wins, mirroring dispatch precedence.

### Configuration

Declared keys come from `@blue/boot`'s `declaredConfigurationProperties()`,
which walks `@property`/`@nested` fields (or a schema-mode `schema` shape).
Only key presence and the winning source origin are reported — never a value.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in [`src/index.ts`](src/index.ts).

- `inspectApplication(input)` — build an `InspectManifest` from a context
- `InspectManifest` + companions — the manifest type model
- `InspectInput` / `RouteSource` / `MappingSource` — the accepted inputs

## Development

```bash
pnpm --filter @blue/inspect build:lib
pnpm --filter @blue/inspect test
```

## See Also

- [apps/blue-api](../../apps/blue-api/README.md) — `pnpm --filter @blue/api inspect` prints a manifest for the demo API
- [@blue/openapi](../blue-openapi/README.md) — the served API document built from the same dispatch metadata
- [@blue/dispatcher](../blue-dispatcher/README.md) — owns the handler-mapping read model

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
