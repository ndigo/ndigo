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
import { GenericApplicationContext } from '@ndigo/context';
import { HostManager } from '@ndigo/host';

const shell = new GenericApplicationContext('site-shell');
const host = new HostManager(shell, { activationPolicy: 'exclusive' });

// Register a feature under a route prefix.
host.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    createContext: () => new GenericApplicationContext('catalog'),
});

// Mount and unmount as navigation demands.
host.mount('catalog');
host.unmount('catalog');
```

## Usage

### Lazy feature chunks

For lazy feature chunks loaded with dynamic `import()`, register a `loader`
that resolves to a module exporting `createContext(parent)` and mount it with
`mountLazy` — the pattern `apps/06-ndigo-host-demo` uses.

```ts
host.registerFeature({
    name: 'checkout',
    prefix: '/checkout',
    loader: () => import('./features/checkout'),
    dependencies: { requires: { cart: '^1.0.0' } },
});

await host.mountLazy('checkout');
```

## API

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live in
[`src/index.ts`](src/index.ts);

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
