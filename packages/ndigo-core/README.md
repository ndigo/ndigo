# Ndigo Core

> Foundational primitives, contracts, and utilities for Ndigo — zero third-party dependencies.

The foundational package for Ndigo: shared primitives, contracts, and
utilities with zero third-party dependencies.

## Installation

```bash
pnpm add @ndigo/core
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { RadixTree } from '@ndigo/core';

const tree = new RadixTree<string>();
tree.insert('/users/:id', 'getUser');

const match = tree.lookup('/users/42');
match?.params; // { id: '42' }
```

## Usage

### Equality contracts

`equates(a, b)` accepts arbitrary values. Primitives use strict equality;
two `Equatable` values use the left value's `equals` method, including when
nested. Arrays and plain records compare recursively, with matching prototypes,
own keys, and array-index presence. Corresponding cyclic references terminate.

Dates compare timestamps. Maps retain native key identity and compare values
recursively; sets retain native member identity. These built-ins ignore extra
properties. Subclasses and unsupported object kinds compare by identity unless
they provide `equals`. JSON validation remains a separate contract.

`MutablePropertyValues.equals` compares an unordered multiset of name/value
pairs: duplicate multiplicity matters, empty collections are equal, and a
missing property is distinct from a present property containing `undefined`.

### Matching and comparison contracts

`PathMatcherFilter` extends `Matchable<string>`, so include/exclude filters can
be consumed through the generic `matches(path)` contract. Its optional matcher
argument still allows a per-call override; exclusions take precedence over
inclusions.

`ResultMatcher<Input, Result>` provides `match(input): Result | null` for consumers
that need a narrowed result. It is distinct from boolean `Matchable.matches` and
the two-argument boolean `PatternMatcher.match`; callers retain the returned
result rather than evaluating matching again.

`AbstractValueComparator` stores a readonly string context for pattern-ordering
strategies. Path and HTTP URL comparators share this base without imposing the
same matching policy.

`comparableComparison` orders `Comparable<T>` values through `compareTo`.
`compareBy(select, comparison)` orders projected keys, and `chainComparisons`
applies tie-breakers in order. Build composed comparisons once and pass them
directly to `Array.sort`; `naturalComparison` retains its coercion-based `<`
semantics.

`ParentNode<T>` and `ChildNode<T>` describe read-only navigation without imposing
construction or lifecycle APIs. `direct` walks descendants and prunes a branch
when its callback returns `false`; iterative `escalate` walks ancestors and
stops on `false`. Both exclude the starting node unless `inclusive` is true.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/core build:lib
pnpm --filter @ndigo/core test
```

## See Also

- [@ndigo/util](../ndigo-util/README.md) — higher-level type/string helpers
- [@ndigo/dispatcher](../ndigo-dispatcher/README.md) — consumes the radix tree
  for handler mapping

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
