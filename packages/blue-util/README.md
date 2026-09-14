# Blue Utility

The BlueJS utility library — zero-dependency helpers for strings, types,
math, and structure matching, with **no third-party runtime deps**.

## Overview

`@blue/util` was historically a pass-through over Ramda/date-fns; those
libraries were removed in favor of native, benchmarked implementations
(2.7–200x faster in the worst offenders — see `audits/2026-04-03_RAMDA_BENCHMARK_ANALYSIS.md`).
Today it is fully native.

## Categories

- **Type guards** — `isString`, `isNumber`, `isNumeric`, `isFunction`,
  `isValidDate`, `isConstructor`, `type()`, and structural matching with `like`
  (WeakMap-cached descriptors: 40+ call sites at ~175–200k Hz warm)
- **String utilities** — encoding/decoding, slugify, camel/Pascal/proper/sentence
  case, diacritics removal, interpolation, regex builders
- **Math & ids** — `randInt`, `randHex`, `guid`, seeded random
- **Predicates & composition** — native replacements for the removed Ramda
  combinators (`allPass`-style checks are plain `&&` chains now)

## Usage

```ts
import { isString, like, guid } from '@blue/util';

isString('abc'); // true
like({ then: Function }, thenable); // true — duck-type check

const id = guid();
```

## Performance notes

The `bench/` suites guard the native implementations against regression:

```bash
pnpm --filter @blue/util test:bench
```

## Development

```bash
pnpm --filter @blue/util build:lib
pnpm --filter @blue/util test
```

## See Also

- [@blue/core](../blue-core/README.md) — foundational primitives
