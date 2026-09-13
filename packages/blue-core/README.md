# Blue Core

The foundational package for BlueJS: shared primitives, contracts, and
utilities with zero third-party dependencies.

## Features

- **Core types** — `Null`, `Enumerable`, `Constructable`, `Equatable`,
  `Serializable`, `Matchable`, `Comparable`, `Error` bases
- **Async primitives** — `Deferred`, future-style helpers
- **Media types** — `MediaType` parsing/quality factors and `MediaTypes`
  constants (RFC 7231-style)
- **Routing data structures** — `RadixTree` (URL route lookup, 3–6x faster
  than popular router libraries on parameterized paths), `URLGlobPathMatcher`
  with compiled-pattern LRU cache, `MultiValueMap`, `RingBuffer`
- **Property & keypath** — property indices, keypath expressions,
  `PropertyValue`
- **Iteration & collection helpers** — `entriesIterator` and friends
- **Validation & conversion** — `Converter` framework, `Validator`,
  conditional helpers

## Usage

```ts
import { RadixTree } from '@blue/core';

const tree = new RadixTree<string>();
tree.insert('/users/:id', 'getUser');

const match = tree.lookup('/users/42');
match?.params; // { id: '42' }
```

## Development

```bash
pnpm --filter @blue/core build:lib
pnpm --filter @blue/core test
# radix tree, path matcher, ring buffer, multi-value map benchmarks
pnpm --filter @blue/core test:bench
```

## See Also

- [@blue/util](../blue-util/README.md) — higher-level type/string helpers
- [@blue/dispatcher](../blue-dispatcher/README.md) — consumes the radix tree
  for handler mapping