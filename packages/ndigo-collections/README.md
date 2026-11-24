# @ndigo/collections

> Data structures for the Ndigo framework — heaps, tries, radix trees, multi-value maps, and probabilistic sketches.

The standalone containers that used to live in `@ndigo/core`. Each one carries the serialization, equality, and comparison contracts where they apply.

`BoundedCache`, `Deque`, and `RingBuffer` stay in `@ndigo/core`: the kernel's own public types build on them (`MutablePropertyValues extends RingBuffer`, `MediaType` uses `Deque`, `URLGlobPathMatcher` uses `BoundedCache`). Moving those three would make core depend on this package.

## Installation

```bash
pnpm add @ndigo/collections
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { PriorityQueue } from '@ndigo/collections';

const pending = new PriorityQueue<{ id: string; priority: number }>((a, b) => a.priority - b.priority);
pending.enqueue({ id: 'low', priority: 10 });
pending.enqueue({ id: 'high', priority: 1 });
pending.dequeue()?.id; // 'high'
```

## Usage

### Heap and PriorityQueue

`Heap` takes an explicit comparison; `PriorityQueue` wraps the same structure
with enqueue/dequeue ergonomics.

```ts
import { Heap } from '@ndigo/collections';

const maxHeap = new Heap<number>((a, b) => b - a);
maxHeap.push(3);
maxHeap.push(1);
maxHeap.pop(); // 3
```

### RadixTree

`RadixTree` is a compressed prefix tree used for route and pattern lookup.

```ts
import { RadixTree } from '@ndigo/collections';

const routes = new RadixTree<string>();
routes.insert('/orders', 'orders');
routes.lookup('/orders/42'); // { pattern, value, params }
```

### MultiValueMap

`MultiValueMap` maps a key to an append-only list of values.

```ts
import { MultiValueMap } from '@ndigo/collections';

const headers = new MultiValueMap<string, string>();
headers.add('accept', 'application/json');
headers.add('accept', 'text/html');
headers.get('accept'); // ['application/json', 'text/html']
```

### Other structures

| Export           | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `Trie`           | Character trie with prefix enumeration            |
| `BloomFilter`    | Probabilistic membership sketch                   |
| `CountMinSketch` | Probabilistic frequency sketch                    |
| `TreeNode`       | Child/parent tree node contracts and walk helpers |

## API

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live
in [`src/index.ts`](src/index.ts).

## Development

```bash
pnpm --filter @ndigo/collections build:lib
pnpm --filter @ndigo/collections test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
