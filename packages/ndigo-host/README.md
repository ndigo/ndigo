# @ndigo/host

> Micro frontend orchestration for Ndigo — register features from any context and mount them into a shared shell.

`@ndigo/host` gives the shell one-call feature registration with dependency-validated mounting. Features are plain Ndigo contexts (or context factories); the shell owns their lifecycle and exclusive activation, declaring what they need from the shell and checking availability before mounting. The browser app shell demonstrates the pattern end to end (`apps/06-ndigo-host-demo`).

## Installation

```bash
pnpm add @ndigo/host
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { HostManager } from '@ndigo/host';
import { ApplicationContext } from '@ndigo/context';

const host = new HostManager();

// Register a feature with its dependencies.
host.registerFeature('catalog', {
    create: () => new ApplicationContext('catalog'),
    dependencies: ['@ndigo/view'],
});

// Mount and unmount as navigation demands.
host.mount('catalog');
host.unmount('catalog');
```

## Usage

### Lazy feature chunks

For lazy feature chunks loaded with dynamic `import()`, use the `mountLazy` support used by the ndigo-host-demo app.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Classes** — `HostManager`
- **Contracts** — feature descriptors + shared-dependency validation

## Development

```bash
pnpm --filter @ndigo/host build:lib
pnpm --filter @ndigo/host test
```

## See Also

- [apps/06-ndigo-host-demo](../../apps/06-ndigo-host-demo/README.md) — micro frontend host demo with three lazy-loaded feature chunks
- [@ndigo/router](../ndigo-router/README.md) — feature routing registry used by the shell

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
