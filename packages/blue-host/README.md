# @blue/host

> Micro frontend orchestration for BlueJS — register features from any context and mount them into a shared shell.

`@blue/host` gives the shell one-call feature registration with dependency-validated mounting. Features are plain BlueJS contexts (or context factories); the shell owns their lifecycle and exclusive activation, declaring what they need from the shell and checking availability before mounting. The browser app shell demonstrates the pattern end to end (`apps/05-blue-host`).

## Installation

```bash
pnpm add @blue/host
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { HostManager } from '@blue/host';
import { ApplicationContext } from '@blue/context';

const host = new HostManager();

// Register a feature with its dependencies.
host.registerFeature('catalog', {
    create: () => new ApplicationContext('catalog'),
    dependencies: ['@blue/view'],
});

// Mount and unmount as navigation demands.
host.mount('catalog');
host.unmount('catalog');
```

## Usage

### Lazy feature chunks

For lazy feature chunks loaded with dynamic `import()`, use the `mountLazy` support used by the blue-host demo app.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

- **Classes** — `HostManager`
- **Contracts** — feature descriptors + shared-dependency validation

## Development

```bash
pnpm --filter @blue/host build:lib
pnpm --filter @blue/host test
```

## See Also

- [apps/05-blue-host](../../apps/05-blue-host/README.md) — micro frontend host demo with three lazy-loaded feature chunks
- [@blue/router](../blue-router/README.md) — feature routing registry used by the shell

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
