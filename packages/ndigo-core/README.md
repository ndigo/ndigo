# Ndigo Core

> Foundational primitives, contracts, and utilities for Ndigo.

The foundational package for Ndigo: shared primitives, contracts, and
utilities used by every other package. It also owns the **declaration layer** —
the annotation primitives every metadata-writing decorator builds on, which is
why they live here rather than in the package that executes them.

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

### Annotations

A decoration written with `methodAnnotation` / `classAnnotation` records a value
and returns its target unchanged — it declares, and stops. Executing the value
is a different package's job (`@ndigo/advice` for method advice, the scheduler
for `@scheduled`, the ORM for entity hooks).

```ts
import { annotationOf, classAnnotation, methodAnnotation } from '@ndigo/core';

const audited = methodAnnotation<{ action: string }>('orders:audited');
const scheduled = classAnnotation<{ cron: string }>('orders:sweep');

class OrderService {
    @audited({ action: 'order.place' })
    place(order: string): string {
        return `ok:${order}`;
    }
}

annotationOf(OrderService, audited, 'place'); // { action: 'order.place' }
```

Keys follow `<namespace>:<name>[:<member>]`, and the **namespace names the
declaring package** — `resilience:retry`, not `core:retry` or the consumer's
name. `annotationOf` walks the class hierarchy, so an inherited declaration
resolves and the nearest declaration wins. Reading without a member gives the
class-level value; reading _with_ a member is the member read, and
`MethodDescriptor.annotation` in `@ndigo/advice` applies the class-level fallback
on top of it.

`ensureSymbolMetadata(target)` returns a class's metadata record, creating it
when absent — the one supported way to write a declaration imperatively, since
`getSymbolMetadata` returns a fresh empty object for an unadorned class and
writing to that would silently discard the write.

`matchAll`, `matchAny`, and `matchNot` compose `Matchable` values, which is how
rules combine several matchers without a string expression language.

### Agent bridge

`AgentBridge` is the neutral contract for exposing an application to an agent
host: `AgentTool` and `AgentToolAnnotations` carry the tool shape and its safety
hints (`readOnlyHint`, `untrustedContentHint`, `consequentialHint`,
`debugging`), `snapshot`/`query`/`act` describe the in-page read-and-operate
surface, and `registerTools` binds tools to a host. `AgentToolHost` is the
registration-only view an adapter can implement on its own.

Adapters map a host's own shapes onto the contract. `@ndigo/view-webcomponent`
ships the WebMCP adapter (`webMcpAgentHost`) today; the planned UI SDK adapter
implements the same types, so application code written against the contract
survives the swap.

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

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live in
[`src/index.ts`](src/index.ts);

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
