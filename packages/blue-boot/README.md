# Blue Boot

> Application startup for BlueJS — profile-aware bootstrapping, typed config binding, and environment auto-configuration.

Application startup for BlueJS: profile-aware bootstrapping, typed config binding, and environment auto-configuration. Register configurations and bind them with `@configurationProperties` class binding validated by zod (`@environment`); standard environment/file/CLI config sources combine with documented precedence and placeholder resolution. Activate profiles with `ApplicationBuilder.profiles('dev')`, run, and let auto-configuration provision platform components by environment — Node's `NodeAutoConfiguration` (argument resolvers, converter registry, metadata handler mapping, error-resolver chain, managed `HTTPServer`) or the Browser web auto-configuration (cookie/model/session/state resolvers, built-in converters).

## Installation

```bash
pnpm add @blue/boot
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { ApplicationBuilder } from '@blue/boot';
import { MyConfiguration } from './my-configuration';

const app = new ApplicationBuilder([MyConfiguration]).profiles('dev').run();
```

## API

The full API is generated from JSDoc via `pnpm doc` into `doc-md/` and `doc-html/`. Primary exports live in [`src/index.ts`](src/index.ts); see the [package index](../README.md) for how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/boot build:lib
pnpm --filter @blue/boot test
```

## See Also

- [@blue/context](../blue-context/README.md) — the context underneath
- [@blue/platform-node](../blue-platform-node/README.md) — the Node auto-configuration provisions this on Node

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
