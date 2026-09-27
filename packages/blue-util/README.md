# Blue Utility

> Zero-dependency BlueJS helpers for strings, types, math, and structure matching — fully native, no third-party runtime deps.

`@blue/util` is the BlueJS utility library: zero-dependency helpers for strings, types, math, and structure matching, with no third-party runtime dependencies. It ships fully native, benchmarked implementations.

## Installation

```bash
pnpm add @blue/util
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { isString, like, guid } from '@blue/util';

isString('abc'); // true
like({ then: Function }, thenable); // true — duck-type check

const id = guid();
```

## Categories

- **Type guards** — `isString`, `isNumber`, `isNumeric`, `isFunction`, `isValidDate`, `isConstructor`, `type()`, and structural matching with `like` (WeakMap-cached descriptors)
- **String utilities** — encoding/decoding, slugify, camel/Pascal/proper/sentence case, diacritics removal, interpolation, regex builders
- **Math & ids** — `randInt`, `randHex`, `guid`, seeded random
- **Predicates & composition** — native replacements for common combinators (`allPass`-style checks are plain `&&` chains)

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/index.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

## Performance notes

The `bench/` suites guard the native implementations against regression, run via Vitest's benchmark runner (`vitest bench`).

## Development

```bash
pnpm --filter @blue/util build:lib
pnpm --filter @blue/util test
```

## See Also

- [@blue/core](../blue-core/README.md) — foundational primitives

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
