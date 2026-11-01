# Blue Utility

> Zero-dependency BlueJS helpers: type guards, string utilities, environment access, and WebCrypto-backed tokens.

`@blue/util` is the framework's leaf toolkit. Everything in it is built on
native platform APIs — it has no third-party runtime dependencies — so every
layer can depend on it, including tooling packages that must stay lightweight.

## Installation

```bash
pnpm add @blue/util
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { getErrorMessage } from '@blue/util';
import { isString, like } from '@blue/util/types';

getErrorMessage(new Error('boom')); // 'boom'
isString('abc'); // true
like({ then: Function }, thenable); // true — duck-type check
```

## Usage

### Entry points

- **`@blue/util`** — `getErrorMessage`, `delay`, `getEnv`, `isDevMode`, `randomHex`, `randomToken`, `is`, `like`
- **`@blue/util/types`** — `is`, `like`, `isString`, `isNumber`, `isFunction`, `isNil`, `isNotNil`
- **`@blue/util/string`** — `toPascal`, `decodeURIComponent`, `encodeURIComponent`

### Notes

- `isNumber` accepts finite numbers (and boxed `Number`) only — `NaN` and
  `±Infinity` are rejected, unlike `typeof`.
- `randomToken`/`randomHex` use the Web Crypto CSPRNG. For UUIDs, call the
  platform's `crypto.randomUUID()` directly.
- `delay` is the framework's test-friendly timer; it settles under Vitest
  fake timers via `vi.advanceTimersByTimeAsync`.
- `isNil` covers both `null` and `undefined` in one check — prefer it over
  hand-rolled comparisons.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/util build:lib
pnpm --filter @blue/util test
```

### Performance notes

`bench/like.bench.ts` guards the `like` descriptor cache against regression,
run via Vitest's benchmark runner (`vitest bench`).

## See Also

- [@blue/core](../blue-core/README.md) — foundational primitives

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
