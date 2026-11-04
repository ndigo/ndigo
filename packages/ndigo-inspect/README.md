# @ndigo/inspect

> Programmatic manifest generator for Ndigo apps — a deterministic, versioned JSON description of a running application.

`@ndigo/inspect` answers "what does this application actually expose?" without a
language server or a second source of truth: routes, registered handler
mappings, and declared configuration keys are read straight from the live
context and dispatcher metadata. Configuration **values are never read or
decrypted** — only whether a key is present and which source won it — so the
manifest is safe to print and diff, and a wired secret decryptor is never
consulted.

## Installation

```bash
pnpm add @ndigo/inspect
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { ApplicationBuilder } from '@ndigo/boot';
import { DISPATCHER, type AbstractDispatcher } from '@ndigo/dispatcher';
import { inspectApplication } from '@ndigo/inspect';
import { RouteRegistry } from '@ndigo/router';
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

Pass a `RouteRegistry`, an iterable of its `entries()` (`[key, RouteDefinition]`
pairs), an iterable of bare `RouteDefinition`s, or explicit `{ name, path }`
descriptors. The emitted `name` is input-shape independent for the same
controller: a `RouteRegistry` and an iterable of its `entries()` both
contribute the dotted registry key, and explicit descriptors contribute their
`name`. Only a bare iterable of `RouteDefinition`s (no key supplied) falls back
to `deriveKey(pattern)`.

### Mappings

Pass the dispatcher (its `handlerMappings` collection is inspected), an array
of mapping tables, or a single table. Each `AbstractHandlerMethodMapping`
exposes `getMappingEntries()` — the read-only enumeration seam this package
reads — with a `getHandlerMethods()` fallback for structural compatibility.
Rows are flattened per claimed pattern and de-duplicated first-registration
wins, mirroring dispatch precedence. An explicit `null` source is rejected with
a `FrameworkError`; omit `mappings` (or pass `undefined`) to inspect none.

### Configuration

Declared keys come from `@ndigo/context`'s `declaredConfigurationProperties()`
(the metadata seam `@ndigo/boot` binds against, re-exported unchanged — REU-9),
which walks `@property`/`@nestedConfig` fields (or a schema-mode `schema` shape).
Presence is probed with `hasProperty` over the exact key plus every
relaxed-binding spelling (`relaxedKeyCandidates`), and the winning source origin
is read from `originOf` — no value is ever read or decrypted.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in [`src/index.ts`](src/index.ts).

- `inspectApplication(input)` — build an `InspectManifest` from a context
- `InspectManifest` + companions — the manifest type model
- `InspectInput` / `RouteSource` / `MappingSource` — the accepted inputs

## Development

```bash
pnpm --filter @ndigo/inspect build:lib
pnpm --filter @ndigo/inspect test
```

## See Also

- [apps/04-ndigo-api](../../apps/04-ndigo-api/README.md) — `pnpm --filter @ndigo/api inspect` prints a manifest for the demo API
- [@ndigo/openapi](../ndigo-openapi/README.md) — the served API document built from the same dispatch metadata
- [@ndigo/dispatcher](../ndigo-dispatcher/README.md) — owns the handler-mapping read model

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
