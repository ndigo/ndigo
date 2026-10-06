# Blue Utility

> Native-first BlueJS helpers for strings, types, math, and structure matching — the framework's integration layer for its small third-party helper libraries.

`@blue/util` is the BlueJS utility library: native-first helpers for strings, types, math, and structure matching. Most utilities are implemented natively and benchmarked; the few third-party libraries it wraps (`seedrandom`, `slug`, `safe-regex`) are confined to internal modules and stay behind the public wrapper surface — consume them through `@blue/util`, never by direct import.

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

## Usage

### Categories

- **Type guards** — `isString`, `isNumber`, `isNumeric`, `isFunction`, `isValidDate`, `isConstructor`, `type()`, and structural matching with `like` (WeakMap-cached descriptors)
- **String utilities** — encoding/decoding, slugify, camel/Pascal/proper/sentence case, diacritics removal, interpolation, regex builders
- **Math & ids** — `randInt`, `randHex`, `guid`, seeded random
- **Predicates & composition** — native replacements for common combinators (`allPass`-style checks are plain `&&` chains)

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

Every symbol in the generated reference is supported public API — including
helpers the framework itself does not call (`decodeHtml`, `encodeHtml`,
`trailingSplit`, `toProper`, `randHex`, `randInt`, `isValidDate`,
`isNumeric`). They are covered by this package's test suite and versioned
with it; nothing in `doc/api/` should be treated as private. Note that
`rand`/`randInt`/`randHex` are seeded pseudo-random helpers — use
`randomToken`/`randomHex` when the output must be cryptographically secure.

## Development

```bash
pnpm --filter @blue/util build:lib
pnpm --filter @blue/util test
```

### Performance notes

The `bench/` suites guard the native implementations against regression, run via Vitest's benchmark runner (`vitest bench`).

## See Also

- [@blue/core](../blue-core/README.md) — foundational primitives

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
