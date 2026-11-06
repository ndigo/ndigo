# Ndigo Boot

> Application startup for Ndigo — profile-aware bootstrapping, typed config binding, and environment auto-configuration.

Application startup for Ndigo: profile-aware bootstrapping, typed config binding, and environment auto-configuration. Register configurations and bind them with `@configurationProperties` class binding validated by zod (`@environment`); standard environment/file/CLI config sources combine with documented precedence and placeholder resolution. Activate profiles with `ApplicationBuilder.profiles('dev')`, run, and let auto-configuration provision platform components by environment — Node's `NodeAutoConfiguration` (argument resolvers, converter registry, metadata handler mapping, error-resolver chain, managed `HTTPServer`) or the Browser web auto-configuration (cookie/model/session/state resolvers, built-in converters). The builder is isomorphic — profiles and properties work without a `process` global; browser apps compose it through [`@ndigo/platform-web`](../ndigo-platform-web/README.md)'s `createWebApplication` preset, or wire it directly.

## Installation

```bash
pnpm add @ndigo/boot
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { ApplicationBuilder } from '@ndigo/boot';
import { MyConfiguration } from './my-configuration';

const app = new ApplicationBuilder([MyConfiguration]).profiles('dev').run();
```

## Usage

### Typed configuration binding

```ts
import { configuration, property, defaultValue } from '@ndigo/context';
import { ApplicationBuilder, configurationProperties } from '@ndigo/boot';

@configurationProperties('server')
class ServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
}

@configuration
class AppConfig {}

const app = await new ApplicationBuilder([AppConfig, ServerConfig]).profiles('dev').run();
app.getValue<ServerConfig>('serverConfig').port; // number — fail-loud on invalid values
```

### Editor support for config files

- [`schema/application.schema.json`](schema/application.schema.json) — a permissive JSON Schema (2020-12) for the `./config/application.json` + `application-{profile}.json` convention. Reference it with `"$schema": "../node_modules/@ndigo/boot/schema/application.schema.json"` for completion and validation of the documented framework keys (`server`, `profiles`, `telemetry`, `management`); application keys are unconstrained and the `{cipher:…}` secret marker is modeled.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/boot build:lib
pnpm --filter @ndigo/boot test
```

## See Also

- [@ndigo/context](../ndigo-context/README.md) — the context underneath
- [@ndigo/platform-node](../ndigo-platform-node/README.md) — the Node auto-configuration provisions this on Node
- [@ndigo/platform-web](../ndigo-platform-web/README.md) — the browser platform composes this package (`createWebApplication`)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
