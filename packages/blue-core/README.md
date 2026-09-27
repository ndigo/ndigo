# Blue Core

> Foundational primitives, contracts, and utilities for BlueJS — zero third-party dependencies.

The foundational package for BlueJS: shared primitives, contracts, and
utilities with zero third-party dependencies.

## Installation

```bash
pnpm add @blue/core
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { RadixTree } from '@blue/core';

const tree = new RadixTree<string>();
tree.insert('/users/:id', 'getUser');

const match = tree.lookup('/users/42');
match?.params; // { id: '42' }
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.
## Development

```bash
pnpm --filter @blue/core build:lib
pnpm --filter @blue/core test
```

## See Also

- [@blue/util](../blue-util/README.md) — higher-level type/string helpers
- [@blue/dispatcher](../blue-dispatcher/README.md) — consumes the radix tree
  for handler mapping

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
